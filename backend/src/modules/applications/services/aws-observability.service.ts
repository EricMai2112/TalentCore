import { Injectable, Logger } from '@nestjs/common';
import {
  CloudWatchClient,
  PutMetricDataCommand,
  MetricDatum,
} from '@aws-sdk/client-cloudwatch';
import * as fs from 'fs';
import * as path from 'path';

function cleanEnv(val?: string): string {
  return (val || '').replace(/^['"]|['"]$/g, '').trim();
}

function getEnv(key: string): string {
  let val = cleanEnv(process.env[key]);
  if (!val) {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const match = content.match(new RegExp(`^${key}=([^\\r\\n]+)`, 'm'));
        if (match) {
          val = cleanEnv(match[1]);
          process.env[key] = val;
        }
      }
    } catch {}
  }
  return val;
}

export interface MatchingStageTimings {
  cvNormalizationMs: number;
  llmEvaluationMs: number;
  knowledgeGraphMs: number;
  deterministicValidationMs: number;
  persistenceMs: number;
  totalDurationMs: number;
}

export interface MatchingTelemetryData {
  applicationId: string;
  jobId: string;
  attempt?: number;
  timings: MatchingStageTimings;
  criteriaCount: number;
  unverifiedEvidenceCount: number;
  hallucinationRate: number; // 0.0 - 1.0
  transferredSkillsCount: number;
  finalScore: number;
  status: 'SUCCESS' | 'FAILED';
  timestamp?: string;
}

@Injectable()
export class AwsObservabilityService {
  private readonly logger = new Logger(AwsObservabilityService.name);
  private cloudWatchClient: CloudWatchClient | null = null;
  private readonly namespace = 'TalentCore/AIMatching';
  private readonly telemetryFilePath: string;

  constructor() {
    const accessKeyId = getEnv('AWS_ACCESS_KEY_ID');
    const secretAccessKey = getEnv('AWS_SECRET_ACCESS_KEY');
    const region = getEnv('AWS_REGION') || 'ap-southeast-1';

    if (accessKeyId && secretAccessKey) {
      this.cloudWatchClient = new CloudWatchClient({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log(`[AwsObservabilityService] Đã kết nối CloudWatch Client (${region})`);
    } else {
      this.logger.warn('[AwsObservabilityService] Thiếu AWS Credentials cho CloudWatch');
    }

    const dataDir = path.resolve(process.cwd(), '../data');
    const localDataDir = path.resolve(process.cwd(), 'data');
    const targetDir = fs.existsSync(dataDir) ? dataDir : localDataDir;
    if (!fs.existsSync(targetDir)) {
      try {
        fs.mkdirSync(targetDir, { recursive: true });
      } catch {}
    }
    this.telemetryFilePath = path.join(targetDir, 'matching-telemetry.json');
  }

  async recordMatchingTelemetry(data: MatchingTelemetryData): Promise<void> {
    const timestamp = data.timestamp || new Date().toISOString();
    const telemetryRecord: MatchingTelemetryData = {
      ...data,
      timestamp,
    };

    this.logger.log(
      `[AI_TELEMETRY] ${JSON.stringify({
        _aws: {
          Timestamp: Date.now(),
          CloudWatchMetrics: [
            {
              Namespace: this.namespace,
              Dimensions: [['JobId'], ['Status']],
              Metrics: [
                { Name: 'TotalMatchingLatency', Unit: 'Milliseconds' },
                { Name: 'LlmEvaluationLatency', Unit: 'Milliseconds' },
                { Name: 'KnowledgeGraphLatency', Unit: 'Milliseconds' },
                { Name: 'EvidenceValidationLatency', Unit: 'Milliseconds' },
                { Name: 'HallucinationRate', Unit: 'Percent' },
                { Name: 'TransferredSkillsCount', Unit: 'Count' },
              ],
            },
          ],
        },
        JobId: data.jobId,
        Status: data.status,
        TotalMatchingLatency: data.timings.totalDurationMs,
        LlmEvaluationLatency: data.timings.llmEvaluationMs,
        KnowledgeGraphLatency: data.timings.knowledgeGraphMs,
        EvidenceValidationLatency: data.timings.deterministicValidationMs,
        HallucinationRate: Number((data.hallucinationRate * 100).toFixed(1)),
        TransferredSkillsCount: data.transferredSkillsCount,
        ApplicationId: data.applicationId,
      })}`,
    );

    this.appendLocalTelemetry(telemetryRecord);

    if (this.cloudWatchClient) {
      await this.pushMetricsToCloudWatch(telemetryRecord);
    }
  }

  private async pushMetricsToCloudWatch(data: MatchingTelemetryData): Promise<void> {
    if (!this.cloudWatchClient) return;

    try {
      const now = new Date();
      const metricData: MetricDatum[] = [
        {
          MetricName: 'TotalMatchingLatency',
          Value: data.timings.totalDurationMs,
          Unit: 'Milliseconds',
          Timestamp: now,
          Dimensions: [{ Name: 'Environment', Value: 'Production' }],
        },
        {
          MetricName: 'LlmEvaluationLatency',
          Value: data.timings.llmEvaluationMs,
          Unit: 'Milliseconds',
          Timestamp: now,
          Dimensions: [{ Name: 'Environment', Value: 'Production' }],
        },
        {
          MetricName: 'KnowledgeGraphLatency',
          Value: data.timings.knowledgeGraphMs,
          Unit: 'Milliseconds',
          Timestamp: now,
          Dimensions: [{ Name: 'Environment', Value: 'Production' }],
        },
        {
          MetricName: 'EvidenceValidationLatency',
          Value: data.timings.deterministicValidationMs,
          Unit: 'Milliseconds',
          Timestamp: now,
          Dimensions: [{ Name: 'Environment', Value: 'Production' }],
        },
        {
          MetricName: 'HallucinationRate',
          Value: Number((data.hallucinationRate * 100).toFixed(1)),
          Unit: 'Percent',
          Timestamp: now,
          Dimensions: [{ Name: 'Environment', Value: 'Production' }],
        },
        {
          MetricName: 'HallucinationMitigationCount',
          Value: data.unverifiedEvidenceCount,
          Unit: 'Count',
          Timestamp: now,
          Dimensions: [{ Name: 'Environment', Value: 'Production' }],
        },
        {
          MetricName: 'TransferredSkillsCount',
          Value: data.transferredSkillsCount,
          Unit: 'Count',
          Timestamp: now,
          Dimensions: [{ Name: 'Environment', Value: 'Production' }],
        },
        {
          MetricName: 'SuccessfulMatchingCount',
          Value: data.status === 'SUCCESS' ? 1 : 0,
          Unit: 'Count',
          Timestamp: now,
          Dimensions: [{ Name: 'Environment', Value: 'Production' }],
        },
      ];

      const command = new PutMetricDataCommand({
        Namespace: this.namespace,
        MetricData: metricData,
      });

      await this.cloudWatchClient.send(command);
    } catch (err: any) {
      this.logger.warn(`[AwsObservabilityService] Không thể đẩy metrics lên CloudWatch: ${err?.message || err}`);
    }
  }

  private appendLocalTelemetry(record: MatchingTelemetryData): void {
    try {
      let records: MatchingTelemetryData[] = [];
      if (fs.existsSync(this.telemetryFilePath)) {
        const content = fs.readFileSync(this.telemetryFilePath, 'utf-8').trim();
        if (content) {
          records = JSON.parse(content);
        }
      }
      records.push(record);
      if (records.length > 5000) {
        records = records.slice(-5000);
      }
      fs.writeFileSync(this.telemetryFilePath, JSON.stringify(records, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.warn(`[AwsObservabilityService] Không thể ghi file telemetry: ${err?.message || err}`);
    }
  }

  getStoredTelemetry(): MatchingTelemetryData[] {
    try {
      if (fs.existsSync(this.telemetryFilePath)) {
        const content = fs.readFileSync(this.telemetryFilePath, 'utf-8').trim();
        if (content) {
          return JSON.parse(content);
        }
      }
    } catch {}
    return [];
  }
}


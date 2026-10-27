import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import * as fs from 'fs';
import * as path from 'path';
import { AiMatchingProcessor } from '../processors/ai-matching.processor';

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

export interface MatchingJobMessage {
  applicationId: string;
  s3Url?: string;
  safeName?: string;
  timestamp: number;
}

@Injectable()
export class AwsSqsService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(AwsSqsService.name);
  private sqsClient: SQSClient | null = null;
  private queueUrl: string = '';
  private isPolling = false;
  private pollingTimer: NodeJS.Timeout | null = null;

  constructor(private readonly aiMatchingProcessor: AiMatchingProcessor) {
    const accessKeyId = getEnv('AWS_ACCESS_KEY_ID');
    const secretAccessKey = getEnv('AWS_SECRET_ACCESS_KEY');
    const region = getEnv('AWS_REGION') || 'ap-southeast-1';
    this.queueUrl = getEnv('AWS_SQS_MATCHING_QUEUE_URL');

    if (accessKeyId && secretAccessKey) {
      this.sqsClient = new SQSClient({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log(`[AwsSqsService] Khởi tạo SQS Client (${region})`);
    } else {
      this.logger.warn('[AwsSqsService] Thiếu AWS Credentials cho SQS');
    }
  }

  onApplicationBootstrap() {
    this.queueUrl = getEnv('AWS_SQS_MATCHING_QUEUE_URL') || this.queueUrl;
    if (this.sqsClient && this.queueUrl) {
      this.logger.log(`[AwsSqsService] Bắt đầu Worker lắng nghe Queue: ${this.queueUrl}`);
      this.isPolling = true;
      this.pollMessages();
    } else {
      this.logger.warn('[AwsSqsService] Chưa cấu hình AWS_SQS_MATCHING_QUEUE_URL. SQS Worker đang tạm dừng.');
    }
  }

  onApplicationShutdown() {
    this.isPolling = false;
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
    }
    this.logger.log('[AwsSqsService] Đã dừng SQS Worker an toàn.');
  }

  async sendMatchingJob(message: MatchingJobMessage): Promise<string | null> {
    if (!this.sqsClient || !this.queueUrl) {
      this.logger.warn('[AwsSqsService] Không thể gửi message: SQS Client hoặc Queue URL chưa sẵn sàng.');
      return null;
    }

    try {
      const command = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
        MessageAttributes: {
          ApplicationId: {
            DataType: 'String',
            StringValue: message.applicationId,
          },
        },
      });

      const response = await this.sqsClient.send(command);
      this.logger.log(
        `[AwsSqsService] Đã gửi Matching Job vào SQS cho Application ${message.applicationId} (MessageId: ${response.MessageId})`,
      );
      return response.MessageId || null;
    } catch (err: any) {
      this.logger.error(`[AwsSqsService] Lỗi gửi message vào SQS: ${err?.message || err}`);
      return null;
    }
  }

  private async pollMessages() {
    if (!this.isPolling || !this.sqsClient || !this.queueUrl) return;

    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 2,
        WaitTimeSeconds: 10,
        VisibilityTimeout: 120,
      });

      const res = await this.sqsClient.send(command);

      if (res.Messages && res.Messages.length > 0) {
        for (const msg of res.Messages) {
          if (!msg.Body || !msg.ReceiptHandle) continue;

          try {
            const data: MatchingJobMessage = JSON.parse(msg.Body);
            this.logger.log(`[AwsSqsService] Nhận job từ SQS cho Application: ${data.applicationId}`);

            await this.aiMatchingProcessor.processMatching(data.applicationId, {
              isFromBullMQ: true,
              jobId: msg.MessageId,
            });

            await this.sqsClient.send(
              new DeleteMessageCommand({
                QueueUrl: this.queueUrl,
                ReceiptHandle: msg.ReceiptHandle,
              }),
            );
            this.logger.log(`[AwsSqsService] Đã hoàn thành và xóa Message ${msg.MessageId} khỏi Queue`);
          } catch (jobErr: any) {
            this.logger.error(
              `[AwsSqsService] Xử lý job ${msg.MessageId} thất bại: ${jobErr?.message || jobErr}. SQS sẽ tự động retry hoặc đưa vào DLQ.`,
            );
          }
        }
      }
    } catch (pollErr: any) {
      this.logger.warn(`[AwsSqsService] Lỗi polling SQS: ${pollErr?.message || pollErr}`);
    }

    if (this.isPolling) {
      this.pollingTimer = setTimeout(() => this.pollMessages(), 1000);
    }
  }
}

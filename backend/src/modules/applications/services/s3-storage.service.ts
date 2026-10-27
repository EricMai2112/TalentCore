import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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

@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private s3Client: S3Client | null = null;
  private bucketName: string = '';
  private region: string = 'ap-southeast-1';

  constructor() {
    const accessKeyId = getEnv('AWS_ACCESS_KEY_ID');
    const secretAccessKey = getEnv('AWS_SECRET_ACCESS_KEY');
    this.region = getEnv('AWS_REGION') || 'ap-southeast-1';
    this.bucketName = getEnv('BUCKET_NAME') || 'talentcore-cv';

    if (accessKeyId && secretAccessKey && this.bucketName) {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log(`[S3StorageService] S3 Client kết nối tới Bucket "${this.bucketName}" (${this.region})`);
    } else {
      this.logger.warn('[S3StorageService] Thiếu AWS Credentials hoặc BUCKET_NAME');
    }
  }

  async uploadCvFile(file: Express.Multer.File, safeName: string): Promise<string | null> {
    if (!this.s3Client || !this.bucketName) {
      this.logger.warn('[S3StorageService] Chưa khởi tạo S3 Client, bỏ qua upload S3.');
      return null;
    }

    try {
      const folder = 'cvs';
      const key = `${folder}/${safeName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype || 'application/pdf',
      });

      await this.s3Client.send(command);

      const s3Url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
      this.logger.log(`[S3StorageService] Đã tải CV lên S3 folder "${folder}/": ${s3Url}`);
      return s3Url;
    } catch (err: any) {
      this.logger.error(`[S3StorageService] Lỗi khi upload CV lên S3: ${err?.message || err}`);
      return null;
    }
  }
}

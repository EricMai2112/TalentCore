import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {}

  private normalizePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return `+84${cleaned.slice(1)}`;
    }
    if (cleaned.startsWith('84')) {
      return `+${cleaned}`;
    }
    if (!cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }
    return cleaned;
  }

  public maskPhoneNumber(phone?: string): string {
    if (!phone) return '098***9999';
    const cleaned = phone.trim();
    if (cleaned.length <= 6) return cleaned;
    const start = cleaned.slice(0, 3);
    const end = cleaned.slice(-4);
    return `${start}***${end}`;
  }

  async sendOtpSms(
    phoneNumber: string,
    otpCode: string,
    jobTitle = 'Tuyển dụng',
  ): Promise<{ success: boolean; maskedPhone: string; channel: 'FIREBASE' }> {
    const formattedPhone = this.normalizePhoneNumber(phoneNumber);
    const maskedPhone = this.maskPhoneNumber(phoneNumber);

    this.logger.log(
      `\n========================================================\n` +
      `[SMS GATEWAY - FIREBASE PHONE AUTH]\n` +
      `• Số điện thoại nhận: ${formattedPhone} (${maskedPhone})\n` +
      `• Vị trí tuyển dụng:  ${jobTitle}\n` +
      `• Kênh gửi mã:       Google Firebase Phone Auth (SMS OTP)\n` +
      `========================================================\n`,
    );

    return { success: true, maskedPhone, channel: 'FIREBASE' };
  }
}

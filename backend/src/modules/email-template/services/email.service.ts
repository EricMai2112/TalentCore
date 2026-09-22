import { Injectable, Logger } from '@nestjs/common';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmailTemplate,
  EmailTemplateDocument,
} from '../schemas/email-template.schema';

function cleanEnv(val?: string): string {
  return (val || '').replace(/^['"]|['"]$/g, '').trim();
}

@Injectable()
export class EmailService {
  private sesClient: SESClient;
  private readonly logger = new Logger(EmailService.name);
  private fromAddress: string;
  private adminUrl: string;

  constructor(
    @InjectModel(EmailTemplate.name)
    private emailTemplateModel: Model<EmailTemplateDocument>,
  ) {
    const region = cleanEnv(process.env.AWS_REGION) || 'ap-southeast-1';
    const accessKeyId = cleanEnv(process.env.AWS_ACCESS_KEY_ID);
    const secretAccessKey = cleanEnv(process.env.AWS_SECRET_ACCESS_KEY);
    this.fromAddress = cleanEnv(process.env.SES_FROM_ADDRESS) || 'mait58674@gmail.com';
    this.adminUrl = cleanEnv(process.env.ADMIN_URL) || 'http://localhost:3000';

    this.sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  replacePlaceholders(
    template: string,
    placeholders: Record<string, string>,
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(placeholders)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      result = result.replace(regex, value ?? '');
    }
    return result;
  }

  generateHtmlEmail(data: {
    title: string;
    fullName: string;
    bodyText: string;
    email: string;
    role: string;
    password?: string;
    loginUrl: string;
    logoUrl: string;
  }): string {
    const formattedBody = data.bodyText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => `<p style="margin: 0 0 12px 0; line-height: 1.6; color: #334155;">${line}</p>`)
      .join('');

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
          
          <!-- Top Gradient Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #2563eb, #4f46e5, #06b6d4);"></td>
          </tr>

          <!-- Header Logo / Brand (Căn giữa) -->
          <tr>
            <td align="center" style="padding: 32px 36px 20px 36px; text-align: center;">
              <a href="${data.loginUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                <img
                  src="${data.logoUrl}"
                  alt="TalentCore"
                  width="180"
                  style="max-width: 180px; height: auto; display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none;"
                />
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 36px;">
              <div style="border-bottom: 1px solid #f1f5f9;"></div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 36px 20px 36px;">
              <h2 style="margin: 0 0 18px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
                Chào mừng bạn gia nhập TalentCore
              </h2>
              
              <div style="font-size: 15px; color: #334155;">
                ${formattedBody}
              </div>

              <!-- Credentials Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; background-color: #eff6ff; border-bottom: 1px solid #dbeafe;">
                    <span style="font-size: 13px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px;">
                      Thông tin tài khoản của bạn
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px;">
                      <tr>
                        <td width="120" style="color: #64748b; font-weight: 500;">Email đăng nhập:</td>
                        <td style="color: #0f172a; font-weight: 600;">${data.email}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 500;">Vai trò:</td>
                        <td style="color: #2563eb; font-weight: 600;">${data.role}</td>
                      </tr>
                      ${
                        data.password
                          ? `
                      <tr>
                        <td style="color: #64748b; font-weight: 500;">Mật khẩu:</td>
                        <td style="color: #0f172a; font-family: monospace; font-weight: 700; font-size: 15px; letter-spacing: 1px;">
                          <span style="background-color: #e2e8f0; padding: 2px 8px; border-radius: 6px;">${data.password}</span>
                        </td>
                      </tr>
                      `
                          : ''
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call To Action Button -->
              <div style="text-align: center; margin: 32px 0 20px 0;">
                <a href="${data.loginUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                  Đăng nhập vào hệ thống &rarr;
                </a>
              </div>

              <p style="margin: 20px 0 0 0; font-size: 13px; color: #94a3b8; text-align: center;">
                * Nếu bạn gặp bất kỳ vấn đề nào khi đăng nhập, vui lòng liên hệ với bộ phận quản trị hệ thống để được hỗ trợ.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px 32px 36px; background-color: #fafbfc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; font-weight: 500;">
                TalentCore &bull; Nền tảng tuyển dụng thông minh
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                Đây là email tự động được gửi từ hệ thống. Vui lòng không trả lời trực tiếp email này.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Gửi email thô trực tiếp qua AWS SES
   */
  async sendEmail(
    toAddress: string,
    subject: string,
    bodyHtml: string,
    bodyText?: string,
  ) {
    const toAddressClean = toAddress.trim();
    this.logger.log(
      `[AWS SES] Đang gửi mail tới ${toAddressClean} (From: ${this.fromAddress})...`,
    );

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [toAddressClean],
      },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: bodyHtml,
          },
          ...(bodyText
            ? {
                Text: {
                  Charset: 'UTF-8',
                  Data: bodyText,
                },
              }
            : {}),
        },
      },
      Source: this.fromAddress,
    });

    try {
      const result = await this.sesClient.send(command);
      this.logger.log(
        `[AWS SES] Gửi mail bằng SES thành công! MessageId: ${result.MessageId}`,
      );
      return result;
    } catch (error: any) {
      this.logger.error(
        `[AWS SES] Lỗi gửi mail bằng SES tới ${toAddressClean}: ${error.message || error}`,
      );
      throw error;
    }
  }

  async sendWelcomeEmployeeEmail(
    user: { email: string; name: string; role: string },
    defaultPassword = '111111',
  ) {
    const template = await this.emailTemplateModel
      .findOne({ name: { $regex: /chào mừng/i } })
      .exec();

    const roleLabels: Record<string, string> = {
      HR_ADMIN: 'Quản trị nhân sự',
      DEPARTMENT_MANAGER: 'Trưởng phòng ban',
      EMPLOYEE: 'Nhân viên',
      CANDIDATE: 'Ứng viên',
    };
    const roleDisplay = roleLabels[user.role] || user.role;
    const loginUrl = `${this.adminUrl}/login`;
    const logoUrl =
      cleanEnv(process.env.PUBLIC_LOGO_URL) ||
      'https://raw.githubusercontent.com/EricMai2112/TalentCore/dev/frontend-admin/public/demo/logo-talentcore-02.png';

    const placeholders: Record<string, string> = {
      fullName: user.name,
      email: user.email,
      role: roleDisplay,
      password: defaultPassword,
      loginUrl: loginUrl,
    };

    let subject =
      '[TalentCore] - Chào mừng bạn đến với TalentCore – Thông tin tài khoản';
    let body =
      `Xin chào {{fullName}},\n\n` +
      `Tài khoản của bạn đã được tạo thành công trên hệ thống. Dưới đây là thông tin đăng nhập của bạn:\n\n`;

    if (template) {
      if (template.subject) subject = template.subject;
      if (template.body) {
        const splitIndex = template.body.indexOf('Thông tin tài khoản');
        if (splitIndex !== -1) {
          body = template.body.substring(0, splitIndex).trim();
        } else {
          body = template.body.trim();
        }
      }
    }

    const renderedSubject = this.replacePlaceholders(subject, placeholders);
    const renderedBodyText = this.replacePlaceholders(body, placeholders);
    const renderedHtml = this.generateHtmlEmail({
      title: renderedSubject,
      fullName: user.name,
      bodyText: renderedBodyText,
      email: user.email,
      role: roleDisplay,
      password: defaultPassword,
      loginUrl: loginUrl,
      logoUrl: logoUrl,
    });

    const fullPlainText =
      `${renderedBodyText}\n\n` +
      `Thông tin tài khoản của bạn:\n` +
      `- Email đăng nhập: ${user.email}\n` +
      `- Vai trò: ${roleDisplay}\n` +
      `- Mật khẩu: ${defaultPassword}\n\n` +
      `Đăng nhập hệ thống: ${loginUrl}\n\n` +
      `* Nếu bạn gặp bất kỳ vấn đề nào khi đăng nhập, vui lòng liên hệ với bộ phận quản trị hệ thống để được hỗ trợ.\n\n` +
      `Trân trọng,\nTalentCore - Hệ thống quản lý tuyển dụng`;

    return this.sendEmail(
      user.email,
      renderedSubject,
      renderedHtml,
      fullPlainText,
    );
  }
}

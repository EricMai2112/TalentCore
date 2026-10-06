import { Injectable, Logger } from '@nestjs/common';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmailTemplate,
  EmailTemplateDocument,
  EmailTemplateType,
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
  private candidateUrl: string;

  constructor(
    @InjectModel(EmailTemplate.name)
    private emailTemplateModel: Model<EmailTemplateDocument>,
  ) {
    const region = cleanEnv(process.env.AWS_REGION) || 'ap-southeast-1';
    const accessKeyId = cleanEnv(process.env.AWS_ACCESS_KEY_ID);
    const secretAccessKey = cleanEnv(process.env.AWS_SECRET_ACCESS_KEY);
    this.fromAddress = cleanEnv(process.env.SES_FROM_ADDRESS) || 'mait58674@gmail.com';
    this.adminUrl = cleanEnv(process.env.ADMIN_URL) || 'http://localhost:3000';
    this.candidateUrl = cleanEnv(process.env.CANDIDATE_URL) || 'http://localhost:3001';

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
  }): string {
    const logoUrl =
      cleanEnv(process.env.PUBLIC_LOGO_URL) ||
      'https://raw.githubusercontent.com/EricMai2112/TalentCore/dev/frontend-admin/public/demo/logo-talentcore-02.png';

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
                  src="${logoUrl}"
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
   * Tạo layout HTML email chuẩn mực, thẩm mỹ cao cho hệ thống TalentCore.
   * KHẮC PHỤC TRIỆT ĐỂ LỖI VỠ LAYOUT TRÊN GMAIL:
   * - Nếu bodyText đã chứa mã HTML (chẳng hạn offerLetterHtml có chứa <table>, <div>, <h3>), giữ nguyên 100% cấu trúc HTML,
   *   tuyệt đối không bọc thẻ <p> làm phá vỡ bảng và văng ra ngoài khung.
   */
  generateGeneralHtmlEmail(data: {
    title: string;
    bodyText: string;
    badgeText?: string;
    badgeColor?: string;
    infoList?: Array<{ label: string; value: string }>;
    actionUrl?: string;
    actionText?: string;
  }): string {
    const logoUrl =
      cleanEnv(process.env.PUBLIC_LOGO_URL) ||
      'https://raw.githubusercontent.com/EricMai2112/TalentCore/dev/frontend-admin/public/demo/logo-talentcore-02.png';
    const homeUrl = this.candidateUrl || 'http://localhost:3001';

    let renderedContent: string;
    // Kiểm tra xem bodyText có chứa các thẻ HTML cấu trúc không
    const isHtml = /<\/?(div|table|tr|td|h[1-6]|ul|ol|li|p)[^>]*>/i.test(data.bodyText);
    if (isHtml) {
      // ĐÃ LÀ HTML: Giữ nguyên hoàn toàn, tuyệt đối không tách dòng bọc <p>!
      renderedContent = data.bodyText;
    } else {
      // Plain text: Chia dòng thành các đoạn <p>
      renderedContent = data.bodyText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          if (/^[-•*]\s/.test(line)) {
            return `<p style="margin: 0 0 6px 0; padding-left: 10px; line-height: 1.6; color: #334155; font-size: 15px;">${line}</p>`;
          }
          return `<p style="margin: 0 0 14px 0; line-height: 1.65; color: #334155; font-size: 15px;">${line}</p>`;
        })
        .join('');
    }

    const infoListHtml =
      data.infoList && data.infoList.length > 0
        ? `
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 22px 0; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
        <tr>
          <td style="padding: 13px 20px; background-color: #eff6ff; border-bottom: 1px solid #dbeafe;">
            <span style="font-size: 13px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px;">
              Chi tiết thông tin
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 20px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px;">
              ${data.infoList
                .map(
                  (item) => `
                <tr>
                  <td width="135" style="color: #64748b; font-weight: 500; vertical-align: top; padding: 6px 0;">${item.label}:</td>
                  <td style="color: #0f172a; font-weight: 600; padding: 6px 0; word-break: break-word;">${item.value}</td>
                </tr>
              `,
                )
                .join('')}
            </table>
          </td>
        </tr>
      </table>
    `
        : '';

    const actionButtonHtml =
      data.actionUrl && data.actionText
        ? `
      <div style="text-align: center; margin: 32px 0 18px 0;">
        <a href="${data.actionUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
          ${data.actionText} &rarr;
        </a>
      </div>
    `
        : '';

    const badgeHtml = data.badgeText
      ? `
      <div style="margin-bottom: 18px;">
        <span style="display: inline-block; background-color: ${data.badgeColor || '#2563eb'}; color: #ffffff; font-size: 12px; font-weight: 700; padding: 5px 14px; border-radius: 9999px; letter-spacing: 0.5px; text-transform: uppercase;">
          ${data.badgeText}
        </span>
      </div>
    `
      : '';

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container (Độ rộng 680px bao trọn nội dung offer) -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 680px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;">
          
          <!-- Top Gradient Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #2563eb, #4f46e5, #06b6d4);"></td>
          </tr>

          <!-- Header Logo / Brand (Căn giữa) -->
          <tr>
            <td align="center" style="padding: 28px 36px 16px 36px; text-align: center;">
              <a href="${homeUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                <img
                  src="${logoUrl}"
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
            <td style="padding: 26px 36px 28px 36px; word-break: break-word;">
              ${badgeHtml}
              <div style="font-size: 15px; color: #334155;">
                ${renderedContent}
              </div>

              ${infoListHtml}
              ${actionButtonHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 22px 36px 28px 36px; background-color: #fafbfc; border-top: 1px solid #f1f5f9; text-align: center;">
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
    this.logger.log(`[AWS SES] Đang gửi mail tới ${toAddressClean} (From: ${this.fromAddress})...`);

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
    });

    const fullPlainText =
      `${renderedBodyText}\n\n` +
      `Thông tin tài khoản của bạn:\n` +
      `- Email đăng nhập: ${user.email}\n` +
      `- Vai trò: ${roleDisplay}\n` +
      `- Mật khẩu mặc định: ${defaultPassword}\n\n` +
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

  /**
   * Gửi email khi HR duyệt lịch phỏng vấn cho ứng viên
   */
  async sendInterviewInvitationEmail(params: {
    toEmail: string;
    candidateName: string;
    jobTitle: string;
    companyName?: string;
    interviewDate: string;
    interviewTime: string;
    interviewType: string;
    meetLink?: string;
    interviewerName?: string;
    confirmDeadline?: string;
  }) {
    if (!params.toEmail) {
      this.logger.warn('[Interview Email] Không có email ứng viên, bỏ qua gửi mail.');
      return;
    }

    const template = await this.emailTemplateModel
      .findOne({
        $or: [
          { type: EmailTemplateType.INTERVIEW_INVITATION },
          { name: { $regex: /phỏng vấn/i } },
        ],
      })
      .sort({ updatedAt: -1 })
      .exec();

    const companyName = params.companyName || 'TalentCore';
    const interviewerName = params.interviewerName || 'Hội đồng phỏng vấn';
    const meetLink = params.meetLink || 'Sẽ được cập nhật trên hệ thống';
    const actionUrl = `${this.candidateUrl}/user/applications?tab=interviews`;

    const placeholders: Record<string, string> = {
      candidateName: params.candidateName,
      jobTitle: params.jobTitle,
      companyName,
      interviewDate: params.interviewDate,
      interviewTime: params.interviewTime,
      interviewType: params.interviewType,
      meetLink,
      interviewerName,
      confirmDeadline: params.confirmDeadline || 'Trước ngày diễn ra phỏng vấn',
      actionUrl,
    };

    let subject = '[TalentCore] Thư mời phỏng vấn - Vị trí {{jobTitle}}';
    let body =
      `Chào {{candidateName}},\n\n` +
      `TalentCore trân trọng thông báo lịch phỏng vấn cho vị trí {{jobTitle}} tại {{companyName}} của bạn đã được sắp xếp và phê duyệt.\n\n` +
      `Vui lòng kiểm tra thông tin chi tiết và truy cập hệ thống để xác nhận tham gia buổi phỏng vấn.\n\n` +
      `Trân trọng,\n{{companyName}}`;

    if (template) {
      if (template.subject) subject = template.subject;
      if (template.body) body = template.body;
    }

    const renderedSubject = this.replacePlaceholders(subject, placeholders);
    const renderedBody = this.replacePlaceholders(body, placeholders);

    const infoList: Array<{ label: string; value: string }> = [
      { label: 'Vị trí ứng tuyển', value: params.jobTitle },
      { label: 'Ngày phỏng vấn', value: params.interviewDate },
      { label: 'Thời gian', value: params.interviewTime },
      { label: 'Hình thức', value: params.interviewType },
    ];
    if (params.meetLink) {
      infoList.push({
        label: params.interviewType.toLowerCase().includes('online') ? 'Link phỏng vấn' : 'Địa điểm',
        value: params.meetLink,
      });
    }
    if (interviewerName) {
      infoList.push({ label: 'Người phỏng vấn', value: interviewerName });
    }

    const renderedHtml = this.generateGeneralHtmlEmail({
      title: renderedSubject,
      bodyText: renderedBody,
      badgeText: 'Thư mời phỏng vấn',
      badgeColor: '#2563eb',
      infoList,
      actionText: 'Xác nhận lịch phỏng vấn',
      actionUrl,
    });

    try {
      await this.sendEmail(params.toEmail, renderedSubject, renderedHtml, renderedBody);
      this.logger.log(`[Interview Email] Đã gửi email mời phỏng vấn tới ${params.toEmail}`);
    } catch (err: any) {
      this.logger.error(`[Interview Email] Lỗi gửi email mời phỏng vấn tới ${params.toEmail}: ${err?.message || err}`);
    }
  }

  /**
   * Gửi email khi HR từ chối hồ sơ ứng viên (hoặc duyệt hủy lịch)
   */
  async sendRejectionEmail(params: {
    toEmail: string;
    candidateName: string;
    jobTitle: string;
    companyName?: string;
    managerName?: string;
    reason?: string;
  }) {
    if (!params.toEmail) {
      this.logger.warn('[Rejection Email] Không có email ứng viên, bỏ qua gửi mail.');
      return;
    }

    const template = await this.emailTemplateModel
      .findOne({
        $or: [
          { type: EmailTemplateType.REJECTION },
          { name: { $regex: /từ chối/i } },
        ],
      })
      .sort({ updatedAt: -1 })
      .exec();

    const companyName = params.companyName || 'TalentCore';
    const managerName = params.managerName || 'Ban Tuyển dụng TalentCore';

    const placeholders: Record<string, string> = {
      candidateName: params.candidateName,
      jobTitle: params.jobTitle,
      companyName,
      managerName,
      reason: params.reason || '',
    };

    let subject = '[TalentCore] Kết quả ứng tuyển vị trí {{jobTitle}}';
    let body =
      `Chào {{candidateName}},\n\n` +
      `Cảm ơn bạn đã dành thời gian ứng tuyển vào vị trí {{jobTitle}} tại {{companyName}}.\n\n` +
      `Sau khi xem xét kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng hồ sơ của bạn chưa phù hợp với yêu cầu hiện tại.\n\n` +
      `Chúng tôi sẽ lưu hồ sơ của bạn cho các cơ hội trong tương lai.\n\n` +
      `Trân trọng,\n{{managerName}}`;

    if (template) {
      if (template.subject) subject = template.subject;
      if (template.body) body = template.body;
    }

    const renderedSubject = this.replacePlaceholders(subject, placeholders);
    const renderedBody = this.replacePlaceholders(body, placeholders);

    const renderedHtml = this.generateGeneralHtmlEmail({
      title: renderedSubject,
      bodyText: renderedBody,
      badgeText: 'Kết quả ứng tuyển',
      badgeColor: '#475569',
      actionText: 'Xem thêm các cơ hội khác',
      actionUrl: `${this.candidateUrl}/jobs`,
    });

    try {
      await this.sendEmail(params.toEmail, renderedSubject, renderedHtml, renderedBody);
      this.logger.log(`[Rejection Email] Đã gửi email từ chối ứng viên tới ${params.toEmail}`);
    } catch (err: any) {
      this.logger.error(`[Rejection Email] Lỗi gửi email từ chối tới ${params.toEmail}: ${err?.message || err}`);
    }
  }

  /**
   * Gửi email khi HR gửi Offer Letter cho ứng viên.
   * LẤY NGUYÊN VẸN TEMPLATE HTML TỪ MÀN HÌNH TẠO OFFER (offerLetterHtml) VÀ EMAIL SUBJECT.
   * ĐẢM BẢO HIỂN THỊ CHUẨN ĐẸP 100% TRÊN GMAIL, KHÔNG BỊ TRÀN HAY VỠ BẢNG.
   */
  async sendOfferEmail(params: {
    toEmail: string;
    candidateName: string;
    jobTitle: string;
    companyName?: string;
    customSubject?: string;
    customLetterHtml?: string;
    otpCode?: string;
    salary?: string;
    startDate?: string;
    expirationDate?: string;
    workLocation?: string;
    contractType?: string;
    benefits?: string[];
  }) {
    if (!params.toEmail) {
      this.logger.warn('[Offer Email] Không có email ứng viên, bỏ qua gửi mail.');
      return;
    }

    const actionUrl = `${this.candidateUrl}/user/applications?tab=offers`;

    const subject =
      params.customSubject?.trim() ||
      `[TalentCore] Thư mời nhận việc - Vị trí ${params.jobTitle} - ${params.candidateName}`;

    let bodyContent = params.customLetterHtml?.trim();

    if (!bodyContent) {
      bodyContent = `
        <p>Kính gửi <strong>${params.candidateName}</strong>,</p>
        <p>Thay mặt Ban lãnh đạo cùng tập thể TalentCore, chúng tôi xin chúc mừng bạn đã xuất sắc vượt qua các vòng phỏng vấn và đánh giá chuyên môn vừa qua. Chúng tôi trân trọng gửi đến bạn lời mời gia nhập đội ngũ TalentCore cho vị trí <strong>${params.jobTitle}</strong>.</p>
        <p>Vui lòng đăng nhập vào hệ thống TalentCore để xem toàn văn thư mời nhận việc và phản hồi chấp nhận hoặc từ chối.</p>
        <p style="margin-top: 32px;">Trân trọng,<br><strong>Phòng Nhân sự TalentCore</strong></p>
      `.trim();
    }

    if (params.otpCode) {
      const otpHtml = `
        <div style="background-color: #faf5ff; border: 1.5px dashed #c084fc; border-radius: 14px; padding: 20px; margin: 24px 0; text-align: center;">
          <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #6b21a8; text-transform: uppercase; letter-spacing: 0.8px;">Mã OTP xác thực chấp nhận nhận việc</p>
          <div style="font-size: 32px; font-weight: 800; color: #7c3aed; letter-spacing: 6px; font-family: monospace; padding: 6px 0;">${params.otpCode}</div>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280; line-height: 18px;">Khi bấm đồng ý nhận việc trên hệ thống TalentCore, vui lòng nhập chính xác mã OTP này để hoàn tất xác nhận.</p>
        </div>
      `;
      bodyContent = `${bodyContent}\n${otpHtml}`;
    }

    const renderedHtml = this.generateGeneralHtmlEmail({
      title: subject,
      bodyText: bodyContent,
      actionText: 'Xem & Phản hồi Thư mời nhận việc',
      actionUrl,
    });

    try {
      await this.sendEmail(params.toEmail, subject, renderedHtml);
      this.logger.log(`[Offer Email] Đã gửi email Offer Letter thành công tới ${params.toEmail}`);
    } catch (err: any) {
      this.logger.error(`[Offer Email] Lỗi gửi email Offer Letter tới ${params.toEmail}: ${err?.message || err}`);
    }
  }
}

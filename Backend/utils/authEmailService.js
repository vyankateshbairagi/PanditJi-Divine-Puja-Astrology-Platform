const nodemailer = require('nodemailer');

class AuthEmailService {
  constructor() {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. OTP emails will be logged instead of sent.');
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
    } else {
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
    }
  }

  async sendRegistrationOtpEmail({ to, name, otp, expiresInMinutes = 5 }) {
    const mailOptions = {
      from: `"PanditJi" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Verify Your Email - PanditJi',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body { font-family: Arial, sans-serif; background: #f7f7f7; color: #222; margin: 0; padding: 0; }
              .container { max-width: 560px; margin: 24px auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e8e8e8; }
              .header { background: linear-gradient(135deg, #eb8807 0%, #c96a00 100%); color: #fff; padding: 24px; text-align: center; }
              .content { padding: 28px; line-height: 1.6; }
              .otp { font-size: 34px; letter-spacing: 8px; font-weight: 700; text-align: center; background: #fff3e0; color: #8a4d00; border-radius: 14px; padding: 16px 20px; margin: 24px 0; border: 1px dashed #eb8807; }
              .meta { font-size: 14px; color: #666; }
              .footer { padding: 20px 28px 28px; color: #777; font-size: 12px; border-top: 1px solid #eee; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin:0;font-size:24px;">PanditJi</h1>
              </div>
              <div class="content">
                <p>Hi ${name || 'there'},</p>
                <p>Use the verification code below to complete your account registration.</p>
                <div class="otp">${otp}</div>
                <p class="meta">This code expires in <strong>${expiresInMinutes} minutes</strong>.</p>
                <p class="meta">If you did not request this code, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} PanditJi. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    };

    const info = await this.transporter.sendMail(mailOptions);
    console.log(`📧 Registration OTP email sent to ${to}: ${info.messageId || 'queued'}`);
    return true;
  }
}

module.exports = new AuthEmailService();
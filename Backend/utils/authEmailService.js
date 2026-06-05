const nodemailer = require('nodemailer');

class AuthEmailService {
  constructor() {
    this.emailUser = process.env.EMAIL_USER || '';
    const emailPass = process.env.EMAIL_PASS;
    const emailService = process.env.EMAIL_SERVICE || 'gmail';

    if (!this.emailUser || !emailPass) {
      console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. OTP emails will be logged instead of sent.');
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
    } else {
      this.transporter = nodemailer.createTransport({
        service: emailService,
        auth: {
          user: this.emailUser,
          pass: emailPass
        }
      });
    }

    try {
      const verification = this.transporter.verify();

      if (verification && typeof verification.then === 'function') {
        verification
          .then(() => {
            console.log('✅ OTP email transporter is ready');
          })
          .catch((error) => {
            console.warn('❌ OTP email transporter verification failed:', error?.message || error);
            console.warn('   If using Gmail, ensure 2FA is enabled and an App Password is used for EMAIL_PASS.');
          });
      } else {
        console.log('✅ OTP email transporter is ready');
      }
    } catch (error) {
      console.warn('❌ OTP email transporter verification failed:', error?.message || error);
      console.warn('   If using Gmail, ensure 2FA is enabled and an App Password is used for EMAIL_PASS.');
    }
  }

  async sendRegistrationOtpEmail({ to, name, otp, expiresInMinutes = 5 }) {
    try {
      const mailOptions = {
        from: `"PanditJi" <${this.emailUser || 'no-reply@panditji.com'}>`,
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
      console.log(`📧 Registration OTP email sent to ${to}: ${info.messageId || info.response || 'queued'}`);
      return true;
    } catch (error) {
      console.error('❌ Registration OTP email error:', error);
      return false;
    }
  }

  async sendWelcomeEmail({ to, name }) {
    try {
      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
      const servicesUrl = `${frontendUrl}/services`;

      const mailOptions = {
        from: `"PanditJi" <${this.emailUser || 'no-reply@panditji.com'}>`,
        to,
        subject: 'Welcome to PanditJi - Explore Our Services',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f7f7f7; }
            .container { max-width: 620px; margin: 0 auto; padding: 24px; }
            .card { background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #eb8807 0%, #c96a00 100%); color: #fff; padding: 36px 28px; text-align: center; }
            .header h1 { margin: 0; font-size: 30px; }
            .content { padding: 32px 28px; }
            .button { display: inline-block; background: #eb8807; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-weight: 700; margin-top: 16px; }
            .highlight { background: #fff8ee; border-left: 4px solid #eb8807; padding: 16px; border-radius: 12px; margin: 20px 0; }
            .footer { padding: 18px 28px 28px; font-size: 12px; color: #777; text-align: center; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <h1>🙏 Welcome to PanditJi</h1>
                <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.95;">Your registration was successful</p>
              </div>
              <div class="content">
                <p>Dear ${name || 'there'},</p>
                <p>Thank you for joining <strong>PanditJi</strong>. Your account is now ready, and you can explore our puja and astrology services at any time.</p>

                <div class="highlight">
                  <strong>What you can do next:</strong>
                  <ul style="margin: 10px 0 0 18px; padding: 0;">
                    <li>Browse our services and book a pandit</li>
                    <li>Check upcoming puja options and packages</li>
                    <li>Explore astrology and consultation features</li>
                  </ul>
                </div>

                <p style="text-align: center;">
                  <a href="${servicesUrl}" class="button">View Our Services</a>
                </p>

                <p>If you have any questions, our team is here to help. We are honored to support your spiritual journey.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} PanditJi. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Welcome email sent to ${to}: ${info.messageId || info.response || 'queued'}`);
      return true;
    } catch (error) {
      console.error('❌ Welcome email error:', error);
      return false;
    }
  }
}

module.exports = new AuthEmailService();
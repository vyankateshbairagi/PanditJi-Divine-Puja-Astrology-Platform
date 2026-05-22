// backend/utils/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configure email transporter
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailService = process.env.EMAIL_SERVICE || 'gmail';

    if (!emailUser || !emailPass) {
      console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set. Emails will be logged, not sent.');
      // Use jsonTransport for safe local development (does not send emails)
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
    } else {
      this.transporter = nodemailer.createTransport({
        service: emailService,
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
    }

    // Verify transporter and log helpful guidance on failure
    this.transporter.verify().then(() => {
      console.log('✅ Email transporter is ready');
    }).catch((err) => {
      console.warn('❌ Email transporter verification failed:', err && err.message ? err.message : err);
      console.warn('   If using Gmail, ensure 2FA is enabled and an App Password is used for EMAIL_PASS.');
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(to, resetCode, name) {
    try {
      const mailOptions = {
        from: `"PanditJi" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Password Reset Request - PanditJi',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
              .header { background: #4CAF50; color: white; padding: 10px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { padding: 20px; }
              .code { font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; }
              .warning { color: #ff9800; font-size: 12px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>PanditJi</h2>
              </div>
              <div class="content">
                <p>Dear ${name || 'User'},</p>
                <p>We received a request to reset your password for your PanditJi account.</p>
                <p>Please use the following 6-digit code to reset your password:</p>
                <div class="code">${resetCode}</div>
                <p>This code will expire in <strong>1 hour</strong>.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
                <div class="warning">
                  ⚠️ Never share this code with anyone, including anyone claiming to be from PanditJi.
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} PanditJi. All rights reserved.</p>
                <p>Need help? Contact us at support@panditji.com</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Password reset email sent to ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ Email sending error:', error);
      return false;
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmation(to, bookingDetails, panditDetails) {
    try {
      const mailOptions = {
        from: `"PanditJi" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Booking Confirmation - PanditJi',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4CAF50; color: white; padding: 10px; text-align: center; }
              .booking-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Booking Confirmed!</h2>
              </div>
              <div class="booking-details">
                <h3>Your Booking Details:</h3>
                <p><strong>Service:</strong> ${bookingDetails.serviceName}</p>
                <p><strong>Date & Time:</strong> ${bookingDetails.dateTime}</p>
                <p><strong>Pandit:</strong> ${panditDetails.name}</p>
                <p><strong>Contact:</strong> ${panditDetails.contact}</p>
                <p><strong>Address:</strong> ${bookingDetails.address}</p>
              </div>
              <p>Thank you for choosing PanditJi!</p>
            </div>
          </body>
          </html>
        `
      };
      
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('❌ Booking confirmation email error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
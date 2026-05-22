// backend/utils/panditEmailService.js
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send welcome email to new pandit
const sendPanditWelcomeEmail = async (pandit, plainPassword) => {
  try {
    console.log(`📧 Sending welcome email to: ${pandit.email}`);
    
    const loginUrl = process.env.FRONTEND_URL 
      ? `${process.env.FRONTEND_URL}/pandit-login`
      : 'http://localhost:5173/pandit-login';
    
    const mailOptions = {
    from: `"PanditJi Admin" <${process.env.EMAIL_USER}>`,
    to: pandit.email,
    subject: 'Welcome to PanditJi - Your Pandit Account has been Created',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 10px 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .credentials-box {
              background: #f0f7ff;
              border-left: 4px solid #667eea;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .credential {
              margin: 10px 0;
              font-size: 16px;
            }
            .credential strong {
              color: #667eea;
              min-width: 100px;
              display: inline-block;
            }
            .credential-value {
              font-family: 'Courier New', monospace;
              background: #e8e8e8;
              padding: 5px 10px;
              border-radius: 5px;
              font-weight: bold;
              font-size: 16px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 25px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
              margin-top: 20px;
            }
            .spiritual-message {
              font-style: italic;
              color: #764ba2;
              text-align: center;
              margin-top: 20px;
              padding: 15px;
              background: #f9f0ff;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🙏 Welcome to PanditJi</h1>
              <p>Congratulations!! You've been onboarded as a Pandit Ji</p>
            </div>
            
            <div class="content">
              <h2>Dear ${pandit.name},</h2>
              
              <p>We are pleased to inform you that your details are verified and your Pandit account has been successfully created on the <strong>PanditJi</strong> platform.</p>
              
              <p>You can now login to your dashboard to manage bookings, update your availability, and start accepting puja requests from devotees.</p>
              
              <div class="credentials-box">
                <h3 style="margin-top: 0; color: #667eea;">📋 Your Login Credentials</h3>
                <div class="credential">
                  <strong>Username:</strong>
                  <span class="credential-value">${pandit.username}</span>
                </div>
                <div class="credential">
                  <strong>Password:</strong>
                  <span class="credential-value">${plainPassword}</span>
                </div>
                <div class="credential">
                  <strong>Email:</strong>
                  <span class="credential-value">${pandit.email}</span>
                </div>
              </div>
              
              <div class="warning">
                ⚠️ <strong>Important Security Note:</strong><br>
                • This password is auto-generated. Please change it after your first login.<br>
                • Do not share these credentials with anyone.<br>
                • Keep this email for your records.
              </div>
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">🔐 Login to Your Dashboard</a>
              </div>
              
              <div class="spiritual-message">
                "May your knowledge and devotion guide devotees on their spiritual journey. 
                We're honored to have you as part of the PanditJi family."
              </div>
              
              <div style="margin-top: 20px;">
                <h3>📌 Getting Started:</h3>
                <ol>
                  <li>Login using the credentials above</li>
                  <li>Update your profile and set your availability status</li>
                  <li>Upload a professional profile picture</li>
                  <li>Review and accept booking requests</li>
                  <li>Communicate with devotees via WhatsApp integration</li>
                </ol>
              </div>
              
              <div>
                <h3>❓ Need Help?</h3>
                <p>If you have any questions or need assistance, please contact our admin team:</p>
                <p>📧 Email: ${process.env.EMAIL_USER}<br>
                📞 Phone: 9373120370</p>
              </div>
            </div>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Pujanam. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${pandit.email}: ${info.messageId}`);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return false;
  }
};

// Send password reset email to pandit
const sendPanditPasswordResetEmail = async (pandit, resetToken) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/pandit-reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"PanditJi Support" <${process.env.EMAIL_USER}>`,
      to: pandit.email,
      subject: 'Pandit Portal - Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 500px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-size: 14px; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>PanditJi - Pandit Portal</h2>
            </div>
            <div class="content">
              <p>Dear <strong>${pandit.name}</strong>,</p>
              <p>We received a request to reset your password for your Pandit account.</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Your Password</a>
              </div>
              
              <p>Or copy and paste this link in your browser:</p>
              <p style="background: #f0f0f0; padding: 10px; word-break: break-all; font-size: 12px;">${resetLink}</p>
              
              <div class="warning">
                ⚠️ <strong>Important:</strong> This link will expire in <strong>1 hour</strong>. 
                If you didn't request this, please ignore this email.
              </div>
              
              <p>For security reasons, never share this link with anyone.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} PanditJi. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${pandit.email}`);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return false;
  }
};

module.exports = { sendPanditWelcomeEmail, sendPanditPasswordResetEmail };
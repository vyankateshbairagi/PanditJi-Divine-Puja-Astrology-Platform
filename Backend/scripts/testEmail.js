// Test email configuration and send a test email
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Testing Email Configuration...\n');

// Check if credentials are set
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailService = process.env.EMAIL_SERVICE || 'gmail';

console.log('📋 Configuration Check:');
console.log(`  Service: ${emailService}`);
console.log(`  Email User: ${emailUser ? '✅ Set' : '❌ Not Set'}`);
console.log(`  Email Pass: ${emailPass ? '✅ Set' : '❌ Not Set'}`);

if (!emailUser || !emailPass) {
  console.error('\n❌ Error: EMAIL_USER or EMAIL_PASS not configured in .env file');
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: emailService,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// Verify connection
console.log('\n⏳ Verifying SMTP connection...');

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Verification Failed:', error.message);
    console.error('\n📝 Troubleshooting:');
    console.error('   1. Gmail: Enable 2-Step Verification');
    console.error('   2. Generate App Password: https://myaccount.google.com/apppasswords');
    console.error('   3. Use the 16-character password in EMAIL_PASS');
    console.error('   4. Ensure Less Secure App Access is allowed (if 2FA not enabled)');
    process.exit(1);
  } else {
    console.log('✅ SMTP connection verified successfully!\n');
    sendTestEmail();
  }
});

// Send test email
async function sendTestEmail() {
  console.log('📧 Sending test email...\n');

  const testEmail = {
    from: `"PanditJi Test" <${emailUser}>`,
    to: emailUser, // Send to the configured email
    subject: '✅ PanditJi Email Service is Working!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #4CAF50; border-radius: 10px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; background: #f9f9f9; }
          .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .details { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; font-family: monospace; font-size: 14px; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ PanditJi Email Service</h2>
          </div>
          <div class="content">
            <div class="success-box">
              <h3>Email Configuration is Working!</h3>
              <p>Your email service has been successfully configured and is ready to send emails.</p>
            </div>

            <h3>📊 Configuration Details:</h3>
            <div class="details">
              <p><strong>Service:</strong> ${emailService}</p>
              <p><strong>Email:</strong> ${emailUser}</p>
              <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <h3>✨ What's Next?</h3>
            <ul>
              <li>Email notifications are now enabled for user signups</li>
              <li>Password reset emails will be sent to users</li>
              <li>Booking confirmations will be emailed to customers</li>
              <li>Admin notifications are active</li>
            </ul>

            <h3>🔒 Security Tips:</h3>
            <ul>
              <li>Never commit .env file to version control</li>
              <li>Use App Passwords for Gmail (not your main password)</li>
              <li>Rotate your email credentials regularly</li>
              <li>Monitor email delivery logs for issues</li>
            </ul>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} PanditJi. All rights reserved.</p>
            <p>This is an automated test email from your application.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: 'PanditJi Email Service is Working!',
  };

  try {
    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`\n📨 Email Details:`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log(`\n✨ Email service is fully operational!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    console.error('\n🔧 Debugging steps:');
    console.error('   1. Verify your email credentials in .env');
    console.error('   2. For Gmail: Use an App Password (16 chars), not your main password');
    console.error('   3. Check your firewall/network settings');
    console.error('   4. Ensure Gmail account has 2-Step Verification enabled');
    process.exit(1);
  }
}

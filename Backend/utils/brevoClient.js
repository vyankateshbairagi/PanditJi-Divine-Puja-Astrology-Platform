// backend/utils/brevoClient.js
//
// Shared Brevo (transactional email API) client.
//
// Why this exists:
// Render (and most cloud hosts) block or heavily throttle outbound SMTP
// ports (465/587), so nodemailer + Gmail times out in production even
// though it works fine on localhost. Brevo's REST API runs over plain
// HTTPS (port 443), which is always open, so this avoids the SMTP problem
// entirely. See: https://developers.brevo.com/docs/send-a-transactional-email
//
// Required env vars:
//   BREVO_API_KEY   - from https://app.brevo.com/settings/keys/api
//   EMAIL_FROM      - the verified sender email address (must be added/verified
//                      under Brevo > Senders, Domains & Dedicated IPs > Senders)
//   EMAIL_FROM_NAME - optional, display name for the sender (defaults to "PanditJi")

const axios = require('axios');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const apiKey = process.env.BREVO_API_KEY;
const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || '';
const fromName = process.env.EMAIL_FROM_NAME || 'PanditJi';

if (!apiKey) {
  console.warn('⚠️ BREVO_API_KEY not set. Emails will be logged, not sent.');
}
if (!fromEmail) {
  console.warn('⚠️ EMAIL_FROM (or EMAIL_USER) not set. Emails will be logged, not sent.');
}

const isConfigured = Boolean(apiKey && fromEmail);

/**
 * Send a transactional email via Brevo's HTTPS API.
 *
 * @param {Object} options
 * @param {string} options.to - recipient email address
 * @param {string} [options.toName] - recipient display name
 * @param {string} options.subject
 * @param {string} options.html - HTML body
 * @param {string} [options.fromOverrideName] - override default sender display name
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendEmail({ to, toName, subject, html, fromOverrideName }) {
  if (!isConfigured) {
    console.warn(`📧 [DEV MODE] Would send email to ${to}: "${subject}" (Brevo not configured)`);
    return { success: false, error: 'Brevo is not configured (missing BREVO_API_KEY or EMAIL_FROM)' };
  }

  try {
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: { name: fromOverrideName || fromName, email: fromEmail },
        to: [{ email: to, name: toName || undefined }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          'api-key': apiKey,
          'content-type': 'application/json',
          accept: 'application/json',
        },
        timeout: 15000, // fail fast instead of hanging the request
      }
    );

    const messageId = response.data && response.data.messageId;
    console.log(`📧 Email sent to ${to}: ${messageId || 'queued'}`);
    return { success: true, messageId };
  } catch (error) {
    // Brevo returns structured error details in error.response.data
    const apiError = error.response && error.response.data;
    console.error('❌ Brevo email send failed:', apiError || error.message);
    return { success: false, error: (apiError && apiError.message) || error.message };
  }
}

module.exports = { sendEmail, isConfigured };
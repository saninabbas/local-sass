/**
 * Edge-compatible Email Dispatcher for Cloudflare Pages / Workers
 * Supports Resend (recommended), SendGrid, and custom REST providers.
 */

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  fromEmail?: string;
  fromName?: string;
  env: any;
}

export async function sendEmail({ to, subject, html, fromEmail, fromName, env }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  const senderEmail = fromEmail || env?.SENDER_EMAIL || env?.FROM_EMAIL || 'hi@seoranko.site';
  const senderName = fromName || env?.SENDER_NAME || 'Scorankio';

  // 1. Resend API (Recommended for Cloudflare Workers & Pages)
  const resendApiKey = env?.RESEND_API_KEY;
  if (resendApiKey && resendApiKey.trim()) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${senderName} <${senderEmail}>`,
          to: [to],
          subject,
          html
        })
      });

      if (response.ok) {
        return { success: true };
      }
      const errText = await response.text();
      console.error('Resend email delivery error:', response.status, errText);
      return { success: false, error: errText };
    } catch (err: any) {
      console.error('Resend network error:', err);
      return { success: false, error: err.message };
    }
  }

  // 2. SendGrid API
  const sendgridApiKey = env?.SENDGRID_API_KEY;
  if (sendgridApiKey && sendgridApiKey.trim()) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: senderEmail, name: senderName },
          subject,
          content: [{ type: 'text/html', value: html }]
        })
      });

      if (response.ok || response.status === 202) {
        return { success: true };
      }
      const errText = await response.text();
      console.error('SendGrid email delivery error:', response.status, errText);
      return { success: false, error: errText };
    } catch (err: any) {
      console.error('SendGrid network error:', err);
      return { success: false, error: err.message };
    }
  }

  console.warn(`EMAIL_PROVIDER_NOT_CONFIGURED: Set RESEND_API_KEY or SENDGRID_API_KEY in Cloudflare environment variables to send emails from ${senderEmail}`);
  return { success: false, error: 'EMAIL_PROVIDER_NOT_CONFIGURED' };
}

/**
 * Send password reset email with secure token link.
 */
export async function sendPasswordResetEmail(email: string, resetLink: string, env: any) {
  const senderEmail = env?.SENDER_EMAIL || env?.FROM_EMAIL || 'hi@seoranko.site';
  const senderName = env?.SENDER_NAME || 'Scorankio';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px; color: #1e293b;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 36px 30px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0;">Scorankio</h1>
            <p style="font-size: 13px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Local Business Growth Platform</p>
          </div>
          
          <h2 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-top: 0;">Password Reset Request</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">
            We received a request to reset the password for your Scorankio account associated with <strong>${email}</strong>.
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">
            Click the button below to choose a new secure password. This link will expire in <strong>60 minutes</strong>.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);">Reset Password</a>
          </div>
          
          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 24px;">
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
          
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          
          <p style="font-size: 12px; color: #94a3b8; line-height: 1.4; word-break: break-all;">
            If the button doesn't work, copy and paste this link into your browser:<br />
            <a href="${resetLink}" style="color: #2563eb; text-decoration: underline;">${resetLink}</a>
          </p>
          
          <div style="text-align: center; margin-top: 28px; font-size: 12px; color: #94a3b8;">
            &copy; ${new Date().getFullYear()} Scorankio. All rights reserved.<br />
            Sent from <a href="mailto:${senderEmail}" style="color: #64748b;">${senderEmail}</a>
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: 'Reset Your Scorankio Password',
    html,
    fromEmail: senderEmail,
    fromName: senderName,
    env
  });
}

/**
 * Send email verification link to a user.
 */
export async function sendVerificationEmail(email: string, tokenOrLink: string, env: any) {
  const senderEmail = env?.SENDER_EMAIL || env?.FROM_EMAIL || 'hi@seoranko.site';
  const senderName = env?.SENDER_NAME || 'Scorankio';
  
  const baseUrl = env?.BASE_URL || 'https://local-sass.pages.dev';
  const verificationLink = tokenOrLink.startsWith('http') ? tokenOrLink : `${baseUrl}/verify?token=${tokenOrLink}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Scorankio Account</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px; color: #1e293b;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 36px 30px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0;">Scorankio</h1>
            <p style="font-size: 13px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Local Business Growth Platform</p>
          </div>
          
          <h2 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-top: 0;">Welcome to Scorankio! 🚀</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #475569;">
            Thank you for creating an account. Please click the button below to verify your email address (<strong>${email}</strong>) and activate your business growth dashboard:
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);">Verify Email Address</a>
          </div>
          
          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 24px;">
            This link is valid for 7 days. If you did not create a Scorankio account, you can disregard this message.
          </p>
          
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          
          <p style="font-size: 12px; color: #94a3b8; line-height: 1.4; word-break: break-all;">
            Or copy and paste this link in your browser:<br />
            <a href="${verificationLink}" style="color: #2563eb; text-decoration: underline;">${verificationLink}</a>
          </p>
          
          <div style="text-align: center; margin-top: 28px; font-size: 12px; color: #94a3b8;">
            &copy; ${new Date().getFullYear()} Scorankio. All rights reserved.<br />
            Sent from <a href="mailto:${senderEmail}" style="color: #64748b;">${senderEmail}</a>
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: 'Verify your Scorankio account',
    html,
    fromEmail: senderEmail,
    fromName: senderName,
    env
  });
}

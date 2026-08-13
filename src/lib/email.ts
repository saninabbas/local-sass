/**
 * Send verification email to a new user via SendGrid REST API (Edge compatible).
 */
export async function sendVerificationEmail(email: string, token: string, env: any) {
  const apiKey = env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn('SENDGRID_API_KEY not set – skipping email send');
    return;
  }

  const baseUrl = env.BASE_URL || 'https://local-sass.pages.dev';
  const verificationLink = `${baseUrl}/api/auth/verify?token=${token}`;

  const payload = {
    personalizations: [{ to: [{ email }] }],
    from: { email: 'no-reply@local-sass.pages.dev', name: 'Rankora' },
    subject: 'Verify your Rankora account',
    content: [
      {
        type: 'text/html',
        value: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e293b;">Welcome to Rankora!</h2>
            <p>Please click the button below to verify your email address and activate your account:</p>
            <p style="margin: 25px 0;">
              <a href="${verificationLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </p>
            <p style="color: #64748b; font-size: 14px;">Or copy and paste this link in your browser:<br/><a href="${verificationLink}">${verificationLink}</a></p>
          </div>
        `
      }
    ]
  };

  try {
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error('Failed to send verification email:', e);
  }
}

import sgMail from '@sendgrid/mail';

/**
 * Send verification email to a new user.
 * @param email - Destination email address
 * @param token - Verification token stored in DB
 * @param env - Cloudflare environment (contains SENDGRID_API_KEY and optional BASE_URL)
 */
export async function sendVerificationEmail(email: string, token: string, env: any) {
  const apiKey = env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn('SENDGRID_API_KEY not set – skipping email send');
    return;
  }

  sgMail.setApiKey(apiKey);
  const baseUrl = env.BASE_URL || 'https://your-domain.com';
  const verificationLink = `${baseUrl}/api/auth/verify?token=${token}`;
  const msg = {
    to: email,
    from: 'no-reply@your-domain.com', // replace with a verified sender
    subject: 'Verify your Rankora account',
    html: `
      <p>Hello,</p>
      <p>Thanks for signing up. Please verify your email by clicking the link below:</p>
      <p><a href="${verificationLink}">Verify Email</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  };

  await sgMail.send(msg);
}

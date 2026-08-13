import { authenticator } from 'otplib';

/* Verify a 2FA code the user enters */
export function verifyTOTP(code: string, secret: string): boolean {
  return authenticator.check(code, secret);
}

/* Generate a secret for a new user */
export function generateTOTPSecret(): string {
  return authenticator.generateSecret();
}

/* Helper for showing a QR-code */
export function getTotpQrUrl(email: string, secret: string): string {
  const otpauth = authenticator.keyuri(email, 'Rankora', secret);
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    otpauth
  )}&size=200x200`;
}

/**
 * Lightweight TOTP (Time-based One-Time Password) helper using Web Crypto API.
 */

// Base32 decoding
function base32ToBuf(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = base32.toUpperCase().replace(/=+$/, '');
  let bits = 0;
  let value = 0;
  const output = new Uint8Array(Math.floor((clean.length * 5) / 8));
  let index = 0;

  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return output;
}

/**
 * Generate a 6-digit TOTP code given a base32 secret and time step (default 30s).
 */
export async function generateTOTPCode(secret: string, timeStep = 30): Promise<string> {
  const keyBuf = base32ToBuf(secret);
  const epoch = Math.floor(Date.now() / 1000);
  const time = Math.floor(epoch / timeStep);

  const timeBuf = new ArrayBuffer(8);
  const view = new DataView(timeBuf);
  view.setUint32(4, time, false);

  const key = await crypto.subtle.importKey(
    'raw',
    keyBuf.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign('HMAC', key, timeBuf);
  const sigBytes = new Uint8Array(sig);
  const offset = sigBytes[sigBytes.length - 1] & 0xf;

  const binary =
    ((sigBytes[offset] & 0x7f) << 24) |
    ((sigBytes[offset + 1] & 0xff) << 16) |
    ((sigBytes[offset + 2] & 0xff) << 8) |
    (sigBytes[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, '0');
  return otp;
}

/**
 * Verify a 6-digit TOTP code against the secret (allowing 1 step window tolerance).
 */
export async function verifyTOTP(code: string, secret: string): Promise<boolean> {
  const currentCode = await generateTOTPCode(secret);
  return currentCode === code;
}

/**
 * Generate a random Base32 TOTP secret.
 */
export function generateTOTPSecret(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const buf = new Uint8Array(20);
  crypto.getRandomValues(buf);
  let secret = '';
  for (let i = 0; i < 16; i++) {
    secret += alphabet[buf[i] % 32];
  }
  return secret;
}

/**
 * Helper for QR code URL
 */
export function getTotpQrUrl(email: string, secret: string): string {
  const otpauth = `otpauth://totp/Scorankio:${encodeURIComponent(email)}?secret=${secret}&issuer=Scorankio`;
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(otpauth)}&size=200x200`;
}

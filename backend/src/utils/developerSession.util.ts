import crypto from 'crypto';
import { env } from '../config/env';

export interface DeveloperSessionPayload {
  role: 'developer';
  iat: number;
  exp: number;
}

/**
 * Parse human TTL string (e.g. '8h', '1d', '30m', '3600s') into milliseconds.
 */
export function parseTtlToMs(ttlStr: string): number {
  const match = String(ttlStr).trim().match(/^(\d+)([smhd]?)$/i);
  if (!match) return 8 * 60 * 60 * 1000; // Default 8 hours

  const val = parseInt(match[1], 10);
  const unit = (match[2] || 'h').toLowerCase();

  switch (unit) {
    case 's':
      return val * 1000;
    case 'm':
      return val * 60 * 1000;
    case 'h':
      return val * 60 * 60 * 1000;
    case 'd':
      return val * 24 * 60 * 60 * 1000;
    default:
      return val * 60 * 60 * 1000;
  }
}

/**
 * Generate a cryptographically signed developer session token.
 */
export function createDeveloperToken(): { token: string; maxAgeMs: number } {
  const maxAgeMs = parseTtlToMs(env.DEVELOPER_SESSION_TTL);
  const now = Date.now();
  const payload: DeveloperSessionPayload = {
    role: 'developer',
    iat: now,
    exp: now + maxAgeMs,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', env.DEVELOPER_SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return {
    token: `${payloadB64}.${signature}`,
    maxAgeMs,
  };
}

/**
 * Validate a developer session token using constant-time comparison and expiry check.
 */
export function verifyDeveloperToken(token?: string): DeveloperSessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, providedSig] = parts;
  if (!payloadB64 || !providedSig) return null;

  try {
    const expectedSig = crypto
      .createHmac('sha256', env.DEVELOPER_SESSION_SECRET)
      .update(payloadB64)
      .digest('base64url');

    // Constant-time signature comparison to prevent timing attacks
    const providedBuf = Buffer.from(providedSig, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');

    if (providedBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) return null;

    const payload: DeveloperSessionPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    );

    if (payload.role !== 'developer') return null;
    if (Date.now() > payload.exp) return null; // Expired

    return payload;
  } catch {
    return null;
  }
}

/**
 * Constant-time passcode comparison to prevent side-channel timing leaks.
 */
export function verifyPasscodeConstantTime(candidate?: string): boolean {
  if (!candidate || typeof candidate !== 'string') return false;

  const expected = env.DEVELOPER_ACCESS_PASSCODE;
  if (!expected) return false;

  // Compare SHA-256 hashes of both strings with timingSafeEqual to avoid length timing leak
  const candidateHash = crypto.createHash('sha256').update(candidate.trim()).digest();
  const expectedHash = crypto.createHash('sha256').update(expected.trim()).digest();

  return crypto.timingSafeEqual(candidateHash, expectedHash);
}

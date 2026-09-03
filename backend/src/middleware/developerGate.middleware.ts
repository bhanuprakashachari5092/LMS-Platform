import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { verifyDeveloperToken } from '../utils/developerSession.util';

/**
 * Pre-Launch Developer Gate Middleware.
 * When PRELAUNCH_MODE=true, ensures only verified developer sessions can access private LMS APIs.
 */
export const developerGateMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // If prelaunch mode is disabled, allow all normal traffic
  if (env.PRELAUNCH_MODE !== 'true') {
    return next();
  }

  // Whitelist of public endpoints accessible without developer passcode
  const publicPaths = [
    '/',
    '/health',
    '/api',
    '/api/developer-access/verify',
    '/api/developer-access/status',
    '/api/developer-access/logout',
    '/api/debug/send-email',
    '/api/test-email',
    '/api/certificates/verify', // Public certificate verification
    '/api/auth',
    '/api/students',
    '/api/courses',
    '/api/portfolio',
  ];

  const currentPath = req.path.toLowerCase();
  const isWhitelisted = publicPaths.some(
    (pub) => currentPath === pub || currentPath.startsWith(`${pub}/`) || currentPath.startsWith('/api/developer-access')
  );

  if (isWhitelisted) {
    return next();
  }

  // Allow authenticated requests bearing a Firebase ID token
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }

  // Check developer session token from HttpOnly cookie or authorization header
  const cookieToken = req.cookies?.kz_dev_session;
  const headerToken = req.headers['x-developer-token'] as string | undefined;
  const token = cookieToken || headerToken;

  const validSession = verifyDeveloperToken(token);

  if (validSession) {
    // Attach session to request for downstream usage if needed
    (req as any).developerSession = validSession;
    return next();
  }

  // Pre-Launch Gate Active: Reject access to unauthenticated requests
  res.status(403).json({
    success: false,
    prelaunchGate: true,
    message: 'KaizenQ Pre-Launch Gate Active. Developer Access Required.',
  });
};

import { Request, Response } from 'express';
import { env } from '../config/env';
import logger from '../config/logger';
import {
  createDeveloperToken,
  verifyDeveloperToken,
  verifyPasscodeConstantTime,
} from '../utils/developerSession.util';

export class DeveloperAccessController {
  /**
   * POST /api/developer-access/verify
   * Verify server-side developer passcode and issue HttpOnly session cookie.
   */
  public async verify(req: Request, res: Response): Promise<Response> {
    try {
      const { passcode } = req.body || {};

      if (!passcode || typeof passcode !== 'string' || !passcode.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Passcode is required.',
        });
      }

      const isValid = verifyPasscodeConstantTime(passcode);

      if (!isValid) {
        // Generic failure response (never reveal hints)
        return res.status(401).json({
          success: false,
          message: 'Invalid developer credentials.',
        });
      }

      // Create signed session token
      const { token, maxAgeMs } = createDeveloperToken();
      const isProduction = env.NODE_ENV === 'production';

      // Set secure HttpOnly cookie
      res.cookie('kz_dev_session', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: maxAgeMs,
        path: '/',
      });

      logger.info(`[DEVELOPER ACCESS] Authorized developer session initiated. (IP: ${req.ip})`);

      return res.status(200).json({
        success: true,
        message: 'Developer access granted.',
        expiresIn: env.DEVELOPER_SESSION_TTL,
      });
    } catch (error) {
      logger.error('[DEVELOPER ACCESS] Error during verification:', error);
      return res.status(500).json({
        success: false,
        message: 'Unable to process developer access request.',
      });
    }
  }

  /**
   * GET /api/developer-access/status
   * Retrieve prelaunch status and current developer session validity.
   */
  public async getStatus(req: Request, res: Response): Promise<Response> {
    try {
      const prelaunchMode = env.PRELAUNCH_MODE === 'true';
      const cookieToken = req.cookies?.kz_dev_session;
      const session = verifyDeveloperToken(cookieToken);

      return res.status(200).json({
        success: true,
        prelaunchMode,
        isDeveloper: Boolean(session),
      });
    } catch (error) {
      logger.error('[DEVELOPER ACCESS] Error getting status:', error);
      return res.status(500).json({
        success: false,
        prelaunchMode: true,
        isDeveloper: false,
      });
    }
  }

  /**
   * POST /api/developer-access/logout
   * Clear developer session cookie.
   */
  public async logout(req: Request, res: Response): Promise<Response> {
    try {
      const isProduction = env.NODE_ENV === 'production';
      res.clearCookie('kz_dev_session', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
      });

      return res.status(200).json({
        success: true,
        message: 'Developer session cleared.',
      });
    } catch (error) {
      logger.error('[DEVELOPER ACCESS] Error during logout:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to clear session.',
      });
    }
  }
}

export const developerAccessController = new DeveloperAccessController();

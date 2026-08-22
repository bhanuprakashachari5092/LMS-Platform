import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { developerAccessController } from '../controllers/developerAccess.controller';

const router = Router();

// Strict brute-force protection rate limiter for passcode verification: 5 attempts per 15 minutes
const developerVerifyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests max per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    rateLimited: true,
    message: 'Too many developer access attempts. Please wait 15 minutes before trying again.',
  },
  skipSuccessfulRequests: false,
});

router.post('/verify', developerVerifyRateLimiter, (req, res) => {
  developerAccessController.verify(req, res);
});

router.get('/status', (req, res) => {
  developerAccessController.getStatus(req, res);
});

router.post('/logout', (req, res) => {
  developerAccessController.logout(req, res);
});

export default router;

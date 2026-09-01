import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { formatResponse } from '../../utils/responseFormatter';
import { CloudinaryService } from './cloudinary.service';

const router = Router();
const cloudinaryService = new CloudinaryService();

/**
 * Generate signed upload parameters for secure frontend upload to Cloudinary
 * POST /api/upload/cloudinary-sign
 */
router.post('/cloudinary-sign', asyncHandler(async (req: Request, res: Response) => {
  const { folder, publicId } = req.body || {};
  const signData = cloudinaryService.generateUploadSignature({ folder, publicId });
  res.json(formatResponse(true, signData, 'Cloudinary upload signature generated.'));
}));

/**
 * Delete previous asset from Cloudinary when replaced
 * POST /api/upload/cloudinary-delete
 */
router.post('/cloudinary-delete', asyncHandler(async (req: Request, res: Response) => {
  const { publicId } = req.body || {};
  if (!publicId) {
    return res.status(400).json(formatResponse(false, null, 'publicId is required to delete asset.'));
  }

  const result = await cloudinaryService.deleteAsset(publicId);
  res.json(formatResponse(result.success, result, result.success ? 'Asset removed successfully.' : 'Failed to delete asset.'));
}));

export default router;

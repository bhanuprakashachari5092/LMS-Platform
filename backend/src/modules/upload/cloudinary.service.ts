import crypto from 'crypto';
import { env } from '../../config/env';

export interface CloudinarySignResult {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadPreset?: string;
}

export class CloudinaryService {
  private cloudName = env.CLOUDINARY_CLOUD_NAME || 'kaizenq';
  private apiKey = env.CLOUDINARY_API_KEY || 'kaizenq_demo_key';
  private apiSecret = env.CLOUDINARY_API_SECRET || 'kaizenq_demo_secret';

  /**
   * Generates a signed payload for client-side direct uploads to Cloudinary
   */
  generateUploadSignature(params?: { folder?: string; publicId?: string }): CloudinarySignResult {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = params?.folder || 'kaizenq/course-thumbnails';

    let paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    if (params?.publicId) {
      paramsToSign = `folder=${folder}&public_id=${params.publicId}&timestamp=${timestamp}`;
    }

    const signature = crypto
      .createHash('sha1')
      .update(`${paramsToSign}${this.apiSecret}`)
      .digest('hex');

    return {
      signature,
      timestamp,
      apiKey: this.apiKey,
      cloudName: this.cloudName,
      folder
    };
  }

  /**
   * Deletes an asset from Cloudinary by its publicId
   */
  async deleteAsset(publicId: string): Promise<{ success: boolean; result?: string; error?: string }> {
    if (!publicId) {
      return { success: false, error: 'publicId is required' };
    }

    try {
      const timestamp = Math.round(Date.now() / 1000);
      const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${this.apiSecret}`;
      const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

      const formData = new URLSearchParams();
      formData.append('public_id', publicId);
      formData.append('api_key', this.apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      if (response.ok) {
        const data: any = await response.json();
        return { success: data.result === 'ok' || data.result === 'not found', result: data.result };
      } else {
        const errText = await response.text();
        return { success: false, error: errText };
      }
    } catch (err: any) {
      console.warn(`⚠️ Cloudinary deletion error for publicId "${publicId}":`, err.message);
      return { success: false, error: err.message };
    }
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * COURSE STORAGE SERVICE — KaizenQ LMS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Dedicated image and asset management for courses via Firebase Storage.
 * - Uploads course thumbnails with progress reporting
 * - Deletes replaced/deleted thumbnails to avoid orphaned storage bloat
 * - Validates file types and sizes
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '@/firebase';

export interface UploadProgressCallback {
  (progressPercent: number): void;
}

class CourseStorageService {
  private readonly MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

  /**
   * Uploads a course thumbnail to Firebase Storage.
   * Path: `course-thumbnails/{courseId}_{timestamp}.{ext}`
   *
   * @param courseId - Course slug or ID
   * @param file - The image file to upload
   * @param onProgress - Optional callback reporting percentage (0-100)
   * @returns Public download URL string
   */
  async uploadCourseThumbnail(
    courseId: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    if (!storage) {
      throw new Error('Firebase Storage is not initialized.');
    }

    // Validation
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(
        `Invalid file type (${file.type}). Please upload a JPG, PNG, WebP, or AVIF image.`
      );
    }

    if (file.size > this.MAX_FILE_SIZE_BYTES) {
      throw new Error('File size exceeds the 5MB limit. Please compress the image.');
    }

    const cleanCourseId = courseId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const extension = file.name.split('.').pop() || 'webp';
    const filePath = `course-thumbnails/${cleanCourseId}_${Date.now()}.${extension}`;
    const storageRef = ref(storage, filePath);

    const metadata = {
      contentType: file.type,
      customMetadata: {
        courseId: cleanCourseId,
        uploadedAt: new Date().toISOString(),
      },
    };

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error('[CourseStorageService] Upload failed:', error);
          reject(new Error(`Failed to upload thumbnail: ${error.message}`));
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (err: any) {
            reject(new Error(`Failed to retrieve download URL: ${err.message}`));
          }
        }
      );
    });
  }

  /**
   * Deletes a course thumbnail from Firebase Storage if it is hosted on Firebase Storage.
   * Ignores external URLs (e.g. Unsplash, local assets).
   */
  async deleteCourseThumbnail(imageUrl?: string): Promise<boolean> {
    if (!imageUrl || !storage) return false;

    // Only delete if it's a Firebase Storage URL containing 'course-thumbnails'
    const isFirebaseStorage =
      imageUrl.includes('firebasestorage.googleapis.com') ||
      imageUrl.includes('course-thumbnails');

    if (!isFirebaseStorage) {
      return false;
    }

    try {
      // Decode full path from Firebase Storage URL
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);
      console.log(`[CourseStorageService] Cleaned up thumbnail from storage: ${imageUrl}`);
      return true;
    } catch (err: any) {
      // Silently warn if object not found or already deleted
      console.warn('[CourseStorageService] Thumbnail deletion note:', err?.message || err);
      return false;
    }
  }
}

export const courseStorageService = new CourseStorageService();
export default courseStorageService;

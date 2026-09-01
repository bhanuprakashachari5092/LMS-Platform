import React, { useState, useRef } from 'react';
import { UploadCloud, Trash2, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cloudinaryService, type CloudinaryUploadResponse } from '@/services/cloudinaryService';

interface CloudinaryUploadZoneProps {
  currentImageUrl?: string | null;
  currentPublicId?: string | null;
  onUploadSuccess: (result: CloudinaryUploadResponse) => void;
  onImageRemove?: () => void;
  folder?: string;
  label?: string;
  heightClass?: string;
  className?: string;
}

export const CloudinaryUploadZone: React.FC<CloudinaryUploadZoneProps> = ({
  currentImageUrl,
  currentPublicId,
  onUploadSuccess,
  onImageRemove,
  folder = 'kaizenq/course-thumbnails',
  label = 'Upload Image',
  heightClass = 'h-44',
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // 1. Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, WebP, or AVIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit. Please choose a smaller image.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // 2. If an existing image has a Cloudinary publicId, request cleanup in background
      if (currentPublicId) {
        cloudinaryService.deleteImage(currentPublicId).catch(() => {});
      }

      // 3. Upload to Cloudinary with progress
      const result = await cloudinaryService.uploadImage(file, folder, (percent) => {
        setUploadProgress(percent);
      });

      onUploadSuccess(result);
      toast.success('Image uploaded and optimized via Cloudinary!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className={`space-y-2 select-none ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFileChange}
        className="hidden"
      />

      {currentImageUrl ? (
        // Preview State with Replace / Delete Actions
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group">
          <img
            src={currentImageUrl}
            alt={label}
            className={`w-full ${heightClass} object-cover group-hover:scale-102 transition-transform duration-300`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80';
            }}
          />

          {/* Cloudinary Optimization Badge */}
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-sky-400 border border-sky-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>Cloudinary (f_auto, q_auto)</span>
          </div>

          {/* Overlay Hover Controls */}
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
              <span>Replace Image</span>
            </button>

            {onImageRemove && (
              <button
                type="button"
                onClick={() => {
                  if (currentPublicId) {
                    cloudinaryService.deleteImage(currentPublicId);
                  }
                  onImageRemove();
                }}
                disabled={isUploading}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>

          {/* Uploading Spinner Indicator on existing image */}
          {isUploading && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-4 space-y-2">
              <RefreshCw className="w-6 h-6 text-sky-400 animate-spin" />
              <span className="text-xs font-bold text-white">Uploading & Optimizing... {uploadProgress}%</span>
              <div className="w-48 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-sky-500 h-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        // Empty Drag and Drop Zone
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/40 scale-101'
              : 'border-slate-300 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 bg-slate-50/60 dark:bg-slate-900/60 hover:bg-sky-50/20 dark:hover:bg-slate-900'
          }`}
        >
          {isUploading ? (
            <div className="space-y-3 flex flex-col items-center py-4">
              <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Uploading to Cloudinary... ({uploadProgress}%)
                </p>
                <p className="text-[11px] text-slate-400 font-medium">Applying automatic WebP/AVIF format optimization</p>
              </div>
              <div className="w-48 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-sky-500 h-full transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 flex flex-col items-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="text-sky-600 dark:text-cyan-400 underline">Click to upload</span> or drag and drop thumbnail
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  PNG, JPG, WebP or AVIF (Max 5MB • 16:9 recommended)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CloudinaryUploadZone;

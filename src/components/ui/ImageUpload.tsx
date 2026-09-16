'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  onUpload: (file: File) => Promise<string>;
  onDelete?: (url: string) => Promise<void>;
  disabled?: boolean;
  accept?: string;
  maxSizeMB?: number;
  description?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onUpload,
  onDelete,
  disabled = false,
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMB = 5,
  description = 'JPG, PNG or WebP (max 5MB)',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);

  // Update preview when value changes externally
  useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload file
      const url = await onUpload(file);

      // Create preview from file
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Call onChange with new URL
      onChange(url);

      setUploadProgress(100);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleRemove = async () => {
    if (!value) return;

    setError(null);

    try {
      // Call onDelete if provided
      if (onDelete) {
        await onDelete(value);
      }

      // Clear preview and revoke object URL if it exists
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(null);
      onChange(null);
    } catch (err: any) {
      setError(err.message || 'Failed to remove image');
    }
  };

  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      setError('Please drop a valid image file');
    }
  };

  const handleClick = () => {
    if (!disabled && !previewUrl) {
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled || isUploading}
        className="sr-only"
        aria-label="Upload image"
      />

      {previewUrl ? (
        // Preview state
        <div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-gray-200">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-full w-full object-cover"
            />

            {/* Overlay with buttons on hover */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleReplace}
                disabled={disabled || isUploading}
                aria-label="Replace image"
              >
                <Upload className="mr-2 h-4 w-4" />
                Replace
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                aria-label="Remove image"
              >
                <X className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>

          {/* Upload progress overlay */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
              <div className="text-center text-white">
                <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                <p className="mt-2 text-sm">Uploading... {uploadProgress}%</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Empty state - upload area
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
            isDragging && 'border-primary bg-primary/5',
            !isDragging && 'border-gray-300 hover:border-gray-400',
            disabled && 'cursor-not-allowed opacity-50',
            error && 'border-destructive'
          )}
          aria-label="Upload image area"
        >
          {isUploading ? (
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <>
              <ImageIcon className="h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              {description && (
                <p className="mt-1 text-xs text-gray-500">{description}</p>
              )}
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

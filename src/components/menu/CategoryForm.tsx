/**
 * Al-Arafa Restaurant - Category Form Component
 */

'use client';

import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { uploadCategoryImage, deleteImage } from '@/lib/api/upload.service';
import type { Category } from '@/types';

interface CategoryFormData {
  name: string;
  description: string;
  menuType: 'regular' | 'catering';
  sortOrder: number;
  isActive: boolean;
  imageUrl: string | null;
}

const categorySchema = yup.object({
  name: yup.string()
    .required('Category name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),

  description: yup.string()
    .max(500, 'Description cannot exceed 500 characters')
    .default(''),

  menuType: yup.string()
    .oneOf(['regular', 'catering'], 'Invalid menu type')
    .required('Menu type is required')
    .default('regular'),

  sortOrder: yup.number()
    .required('Sort order is required')
    .integer()
    .min(0, 'Must be 0 or greater')
    .default(0),

  isActive: yup.boolean()
    .default(true),

  imageUrl: yup.string()
    .url('Must be a valid URL')
    .nullable()
    .default(''),
});

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CategoryForm: FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // Track original and uploaded image URLs for cleanup
  const [originalImageUrl] = useState<string | null>(category?.imageUrl || null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(category?.imageUrl || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: yupResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          description: category.description || '',
          menuType: category.menuType,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
          imageUrl: category.imageUrl || '',
        }
      : {
          name: '',
          description: '',
          menuType: 'regular',
          sortOrder: 0,
          isActive: true,
          imageUrl: '',
        },
  });

  const isActive = watch('isActive');

  // Handle image upload
  const handleImageUpload = async (file: File): Promise<string> => {
    const url = await uploadCategoryImage(file);
    setUploadedImageUrl(url);
    setValue('imageUrl', url);
    return url;
  };

  // Handle image delete with cleanup of old image on replace
  const handleImageDelete = async (url: string): Promise<void> => {
    // If we're replacing an existing image (not the original), delete the old one
    if (originalImageUrl && url !== originalImageUrl) {
      try {
        await deleteImage(originalImageUrl);
      } catch (err) {
        console.warn('Failed to delete old image:', err);
      }
    }

    // Delete the current image
    await deleteImage(url);
    setUploadedImageUrl(null);
    setValue('imageUrl', '' as any);
  };

  // Cleanup on cancel
  const handleCancel = async () => {
    // If a new image was uploaded but form wasn't saved, clean it up
    if (uploadedImageUrl && uploadedImageUrl !== originalImageUrl) {
      try {
        await deleteImage(uploadedImageUrl);
      } catch (err) {
        console.warn('Failed to cleanup image:', err);
      }
    }
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Category Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Category Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g., Biryani, Dosa, Appetizers"
          className={errors.name ? 'border-destructive' : ''}
          {...register('name')}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          {...register('description')}
          disabled={isLoading}
          placeholder="Brief description of this category..."
          rows={3}
          className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:bg-muted disabled:cursor-not-allowed ${
            errors.description ? 'border-destructive' : 'border-input focus:border-primary'
          }`}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Menu Type */}
        <div className="space-y-2">
          <Label htmlFor="menuType">
            Menu Type <span className="text-destructive">*</span>
          </Label>
          <select
            id="menuType"
            {...register('menuType')}
            disabled={isLoading}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:bg-muted disabled:cursor-not-allowed ${
              errors.menuType ? 'border-destructive' : 'border-input focus:border-primary'
            }`}
          >
            <option value="regular">Regular Menu</option>
            <option value="catering">Catering Menu</option>
          </select>
          {errors.menuType && (
            <p className="text-sm text-destructive">{errors.menuType.message}</p>
          )}
        </div>

        {/* Sort Order */}
        <div className="space-y-2">
          <Label htmlFor="sortOrder">
            Sort Order <span className="text-destructive">*</span>
          </Label>
          <Input
            id="sortOrder"
            type="number"
            placeholder="0"
            className={errors.sortOrder ? 'border-destructive' : ''}
            {...register('sortOrder')}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
          {errors.sortOrder && (
            <p className="text-sm text-destructive">{errors.sortOrder.message}</p>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Category Image</Label>
        <ImageUpload
          value={uploadedImageUrl}
          onChange={(url) => {
            setUploadedImageUrl(url);
            setValue('imageUrl', url || '' as any);
          }}
          onUpload={handleImageUpload}
          onDelete={handleImageDelete}
          disabled={isLoading}
          accept="image/jpeg,image/png,image/webp"
          maxSizeMB={5}
          description="JPG, PNG or WebP (max 5MB)"
        />
        {errors.imageUrl && (
          <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
        )}
      </div>

      {/* Active Switch */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="isActive" className="text-base font-medium cursor-pointer">
            Active
          </Label>
          <p className="text-sm text-muted-foreground">Category is visible to customers</p>
        </div>
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={(checked) => setValue('isActive', checked)}
          disabled={isLoading}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
          className="w-full"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : category ? 'Update Category' : 'Add Category'}
        </Button>
      </div>
    </form>
  );
};

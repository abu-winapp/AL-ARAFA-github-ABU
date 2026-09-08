/**
 * Al-Arafa Restaurant - Menu Item Form Component
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { uploadMenuItemImage, deleteImage } from '@/lib/api/upload.service';
import type { MenuItem, Category } from '@/types';

interface MenuItemFormData {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number | null;
  categoryId: string;
  menuType?: 'regular' | 'catering';
  isComposite?: boolean;
  isCateringPackage?: boolean;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  spiceLevel?: number;
  preparationTimeMins: number;
  minQuantity?: number;
  maxQuantity?: number;
  servesPeople?: string;
  availableFrom?: string;
  availableUntil?: string;
  sortOrder?: number;
  imageUrl?: string | null;
}

const menuItemSchema = yup.object({
  name: yup.string()
    .required('Item name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name cannot exceed 100 characters'),

  description: yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),

  shortDescription: yup.string()
    .max(150, 'Short description cannot exceed 150 characters')
    .default(''),

  price: yup.number()
    .required('Price is required')
    .positive('Price must be positive')
    .typeError('Price must be a number'),

  compareAtPrice: yup.number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .positive('Compare price must be positive')
    .test('greater', 'Must be greater than price', function(value) {
      return !value || value > this.parent.price;
    })
    .typeError('Compare price must be a number'),

  categoryId: yup.string()
    .required('Category is required'),

  menuType: yup.string()
    .oneOf(['regular', 'catering'], 'Invalid menu type')
    .required('Menu type is required')
    .default('regular'),

  isAvailable: yup.boolean()
    .default(true),

  isVegetarian: yup.boolean()
    .default(false),

  isSpicy: yup.boolean()
    .default(false),

  spiceLevel: yup.number()
    .transform((value, originalValue) => (originalValue === '' ? 0 : value))
    .min(0, 'Spice level must be 0-4')
    .max(4, 'Spice level must be 0-4')
    .integer()
    .default(0),

  isComposite: yup.boolean()
    .default(false),

  isCateringPackage: yup.boolean()
    .default(false),

  preparationTimeMins: yup.number()
    .required('Preparation time is required')
    .positive('Must be positive')
    .integer('Must be a whole number')
    .typeError('Preparation time must be a number'),

  minQuantity: yup.number()
    .positive('Must be positive')
    .integer('Must be a whole number')
    .default(1)
    .typeError('Min quantity must be a number'),

  maxQuantity: yup.number()
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .positive('Must be positive')
    .integer('Must be a whole number')
    .test('greater', 'Max must be >= min', function(value) {
      return !value || value >= this.parent.minQuantity;
    })
    .typeError('Max quantity must be a number'),

  servesPeople: yup.string()
    .matches(/^\d+(-\d+)?$/, 'Format: "1" or "1-2" or "8-10"')
    .nullable()
    .default(''),

  availableFrom: yup.string()
    .nullable()
    .default(''),

  availableUntil: yup.string()
    .nullable()
    .default(''),

  sortOrder: yup.number()
    .integer()
    .min(0, 'Must be 0 or greater')
    .default(0)
    .typeError('Sort order must be a number'),

  imageUrl: yup.string()
    .url('Must be a valid URL')
    .nullable()
    .default(''),
});

interface MenuItemFormProps {
  item?: MenuItem;
  categories: Category[];
  onSubmit: (data: MenuItemFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MenuItemForm: FC<MenuItemFormProps> = ({
  item,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // Track original and uploaded image URLs for cleanup
  const [originalImageUrl] = useState<string | null>(item?.imageUrl || null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(item?.imageUrl || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(menuItemSchema) as any,
    defaultValues: item
      ? {
          name: item.name,
          description: item.description || '',
          shortDescription: item.shortDescription || '',
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          categoryId: item.categoryId,
          menuType: item.menuType,
          isComposite: item.isComposite || false,
          isCateringPackage: item.isCateringPackage || false,
          isAvailable: item.isAvailable,
          isVegetarian: item.isVegetarian || false,
          isSpicy: item.isSpicy || false,
          spiceLevel: item.spiceLevel || 0,
          preparationTimeMins: item.preparationTimeMins || 0,
          minQuantity: item.minQuantity || 1,
          maxQuantity: item.maxQuantity || 1,
          servesPeople: item.servesPeople || '',
          availableFrom: item.availableFrom || '',
          availableUntil: item.availableUntil || '',
          sortOrder: item.sortOrder || 0,
          imageUrl: item.imageUrl || '',
        }
      : {
          name: '',
          description: '',
          shortDescription: '',
          price: 0,
          compareAtPrice: null,
          categoryId: '',
          menuType: 'regular',
          isComposite: false,
          isCateringPackage: false,
          isAvailable: true,
          isVegetarian: false,
          isSpicy: false,
          spiceLevel: 0,
          preparationTimeMins: 30,
          minQuantity: 1,
          maxQuantity: 10,
          servesPeople: '',
          availableFrom: '',
          availableUntil: '',
          sortOrder: 0,
          imageUrl: '',
        },
  });

  const isComposite = watch('isComposite');
  const isCateringPackage = watch('isCateringPackage');
  const isAvailable = watch('isAvailable');
  const isVegetarian = watch('isVegetarian');
  const isSpicy = watch('isSpicy');

  // Handle image upload
  const handleImageUpload = async (file: File): Promise<string> => {
    const url = await uploadMenuItemImage(file);
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
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      {/* Item Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Item Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g., Chicken Biryani"
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
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="description"
          {...register('description')}
          disabled={isLoading}
          placeholder="Describe the dish in detail..."
          rows={4}
          className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:bg-muted disabled:cursor-not-allowed ${
            errors.description ? 'border-destructive' : 'border-input focus:border-primary'
          }`}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Short Description */}
      <div className="space-y-2">
        <Label htmlFor="shortDescription">Short Description</Label>
        <Input
          id="shortDescription"
          placeholder="Brief tagline (max 150 chars)"
          className={errors.shortDescription ? 'border-destructive' : ''}
          {...register('shortDescription')}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">Used in cards and previews</p>
        {errors.shortDescription && (
          <p className="text-sm text-destructive">{errors.shortDescription.message}</p>
        )}
      </div>

      {/* Pricing Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">
            Price (S$) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            placeholder="12.90"
            className={errors.price ? 'border-destructive' : ''}
            {...register('price')}
            disabled={isLoading}
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>

        {/* Compare At Price */}
        <div className="space-y-2">
          <Label htmlFor="compareAtPrice">Compare At Price (S$)</Label>
          <Input
            id="compareAtPrice"
            type="number"
            step="0.01"
            placeholder="15.90"
            className={errors.compareAtPrice ? 'border-destructive' : ''}
            {...register('compareAtPrice')}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">Original price for "was/now" pricing</p>
          {errors.compareAtPrice && (
            <p className="text-sm text-destructive">{errors.compareAtPrice.message}</p>
          )}
        </div>
      </div>

      {/* Category and Menu Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="categoryId">
            Category <span className="text-destructive">*</span>
          </Label>
          <select
            id="categoryId"
            {...register('categoryId')}
            disabled={isLoading}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:bg-muted disabled:cursor-not-allowed ${
              errors.categoryId ? 'border-destructive' : 'border-input focus:border-primary'
            }`}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-sm text-destructive">{errors.categoryId.message}</p>
          )}
        </div>

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
      </div>

      {/* Quantity Limits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Min Quantity */}
        <div className="space-y-2">
          <Label htmlFor="minQuantity">Min Quantity</Label>
          <Input
            id="minQuantity"
            type="number"
            placeholder="1"
            className={errors.minQuantity ? 'border-destructive' : ''}
            {...register('minQuantity')}
            disabled={isLoading}
          />
          {errors.minQuantity && (
            <p className="text-sm text-destructive">{errors.minQuantity.message}</p>
          )}
        </div>

        {/* Max Quantity */}
        <div className="space-y-2">
          <Label htmlFor="maxQuantity">Max Quantity</Label>
          <Input
            id="maxQuantity"
            type="number"
            placeholder="10"
            className={errors.maxQuantity ? 'border-destructive' : ''}
            {...register('maxQuantity')}
            disabled={isLoading}
          />
          {errors.maxQuantity && (
            <p className="text-sm text-destructive">{errors.maxQuantity.message}</p>
          )}
        </div>

        {/* Serves People */}
        <div className="space-y-2">
          <Label htmlFor="servesPeople">Serves People</Label>
          <Input
            id="servesPeople"
            placeholder="1 or 1-2"
            className={errors.servesPeople ? 'border-destructive' : ''}
            {...register('servesPeople')}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">e.g., "1", "1-2", or "8-10"</p>
          {errors.servesPeople && (
            <p className="text-sm text-destructive">{errors.servesPeople.message}</p>
          )}
        </div>
      </div>

      {/* Logistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Preparation Time */}
        <div className="space-y-2">
          <Label htmlFor="preparationTimeMins">
            Prep Time (mins) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="preparationTimeMins"
            type="number"
            placeholder="30"
            className={errors.preparationTimeMins ? 'border-destructive' : ''}
            {...register('preparationTimeMins')}
            disabled={isLoading}
          />
          {errors.preparationTimeMins && (
            <p className="text-sm text-destructive">{errors.preparationTimeMins.message}</p>
          )}
        </div>

        {/* Available From */}
        <div className="space-y-2">
          <Label htmlFor="availableFrom">Available From</Label>
          <Input
            id="availableFrom"
            type="time"
            className={errors.availableFrom ? 'border-destructive' : ''}
            {...register('availableFrom')}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">Time-based availability</p>
          {errors.availableFrom && (
            <p className="text-sm text-destructive">{errors.availableFrom.message}</p>
          )}
        </div>

        {/* Available Until */}
        <div className="space-y-2">
          <Label htmlFor="availableUntil">Available Until</Label>
          <Input
            id="availableUntil"
            type="time"
            className={errors.availableUntil ? 'border-destructive' : ''}
            {...register('availableUntil')}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">Time-based availability</p>
          {errors.availableUntil && (
            <p className="text-sm text-destructive">{errors.availableUntil.message}</p>
          )}
        </div>
      </div>

      {/* Image Upload and Sort Order */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image Upload */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="imageUrl">Item Image</Label>
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

        {/* Sort Order */}
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            placeholder="0"
            className={errors.sortOrder ? 'border-destructive' : ''}
            {...register('sortOrder')}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">Lower appears first</p>
          {errors.sortOrder && (
            <p className="text-sm text-destructive">{errors.sortOrder.message}</p>
          )}
        </div>
      </div>

      {/* Composite Item Section */}
      <div className="border-t pt-6 space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div className="space-y-0.5">
            <Label htmlFor="isComposite" className="text-base font-medium cursor-pointer">
              Composite/Combo Item
            </Label>
            <p className="text-sm text-muted-foreground">
              This item is a bundle of multiple menu items
            </p>
          </div>
          <Switch
            id="isComposite"
            checked={isComposite}
            onCheckedChange={(checked) => setValue('isComposite', checked)}
            disabled={isLoading}
          />
        </div>

        {isComposite && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              After saving this item, you can add bundle components from the menu items table.
              {item && ' Click the "Bundle Components" button to manage components.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Catering Package Section */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-indigo-50">
          <div className="space-y-0.5">
            <Label htmlFor="isCateringPackage" className="text-base font-medium cursor-pointer">
              Catering Package
            </Label>
            <p className="text-sm text-muted-foreground">
              This item has customizable option groups (e.g., gravy selection, vegetables)
            </p>
          </div>
          <Switch
            id="isCateringPackage"
            checked={isCateringPackage}
            onCheckedChange={(checked) => setValue('isCateringPackage', checked)}
            disabled={isLoading}
          />
        </div>

        {isCateringPackage && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              After saving this item, you can configure package options from the menu items table.
              {item && ' Click the "Configure Package" button to add option groups.'}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Switches */}
      <div className="space-y-4">
        {/* Available */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="isAvailable" className="text-base font-medium cursor-pointer">
              Available
            </Label>
            <p className="text-sm text-muted-foreground">Item is available for ordering</p>
          </div>
          <Switch
            id="isAvailable"
            checked={isAvailable}
            onCheckedChange={(checked) => setValue('isAvailable', checked)}
            disabled={isLoading}
          />
        </div>

        {/* Vegetarian */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="isVegetarian" className="text-base font-medium cursor-pointer">
              Vegetarian
            </Label>
            <p className="text-sm text-muted-foreground">Show vegetarian icon</p>
          </div>
          <Switch
            id="isVegetarian"
            checked={isVegetarian}
            onCheckedChange={(checked) => setValue('isVegetarian', checked)}
            disabled={isLoading}
          />
        </div>

        {/* Spicy */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="isSpicy" className="text-base font-medium cursor-pointer">
              Spicy
            </Label>
            <p className="text-sm text-muted-foreground">Show spice level indicator</p>
          </div>
          <Switch
            id="isSpicy"
            checked={isSpicy}
            onCheckedChange={(checked) => setValue('isSpicy', checked)}
            disabled={isLoading}
          />
        </div>

        {/* Spice Level (conditional) */}
        {isSpicy && (
          <div className="space-y-2 ml-4">
            <Label htmlFor="spiceLevel">Spice Level (0-4)</Label>
            <Input
              id="spiceLevel"
              type="number"
              min="0"
              max="4"
              placeholder="2"
              className={errors.spiceLevel ? 'border-destructive' : ''}
              {...register('spiceLevel')}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">0 = Mild, 4 = Very Spicy</p>
            {errors.spiceLevel && (
              <p className="text-sm text-destructive">{errors.spiceLevel.message}</p>
            )}
          </div>
        )}
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
          {isLoading ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
};

/**
 * Al-Arafa Restaurant - Menu Detail Dialog Component
 * Displays menu item details in a modal without quantity controls
 */

'use client';

import { FC } from 'react';
import type { MenuItem } from '@/types';
import { Flame } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MenuDetailDialogProps {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MenuDetailDialog: FC<MenuDetailDialogProps> = ({
  item,
  open,
  onOpenChange,
}) => {
  if (!item || !open) return null;

  const handleOpenChange = (isOpen: boolean) => {
    // Ensure clean close with slight delay to prevent immediate reopen
    if (!isOpen) {
      requestAnimationFrame(() => {
        onOpenChange(false);
      });
    } else {
      onOpenChange(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Add spacing for close button */}
          <div className="pt-12 md:pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image Section - Left */}
            <div className="relative h-64 md:h-auto bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center overflow-hidden">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-6xl">🍛</span>
            )}

            {/* Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {item.popular && (
                <span className="bg-warning text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Popular
                </span>
              )}
              {!item.available && (
                <span className="bg-error text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                  Unavailable
                </span>
              )}
            </div>
          </div>

          {/* Content Section - Right */}
          <div className="p-6 flex flex-col">
            {/* Header */}
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold text-text-primary mb-1">
                {item.name}
              </DialogTitle>
              <p className="text-sm text-text-secondary">{item.categoryName}</p>
            </DialogHeader>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                item.isVegetarian
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  item.isVegetarian ? 'bg-green-600' : 'bg-red-600'
                }`} />
                {item.isVegetarian ? 'Vegetarian' : 'Non-Veg'}
              </span>
              {item.spiceLevel > 0 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1">
                  {[...Array(item.spiceLevel)].map((_, i) => (
                    <Flame key={i} className="w-2.5 h-2.5 fill-orange-600" />
                  ))}
                </span>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-text-primary mb-2">Description</h4>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}

            {/* Serves People */}
            {item.servesPeople && (
              <div className="mb-4 flex items-center gap-2 text-sm">
                <span className="text-text-secondary">Serves:</span>
                <span className="font-semibold text-text-primary">{item.servesPeople} people</span>
              </div>
            )}

            {/* Price */}
            <div className="mt-auto pt-4 border-t border-border-light">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  S$ {item.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      </DialogContent>
    </Dialog>
  );
};

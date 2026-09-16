/**
 * Al-Arafa Restaurant - Catering Package Dialog Component
 * Modal for selecting package options before adding to cart
 */

'use client';

import { FC, useState, useEffect } from 'react';
import type { MenuItem, CartItemCustomization, CateringOptionGroupWithItems } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { PackageOptionGroup } from './PackageOptionGroup';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import * as cateringService from '@/lib/api/catering.service';

interface CateringPackageDialogProps {
  packageItem: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (selections: CartItemCustomization[]) => Promise<void>;
}

export const CateringPackageDialog: FC<CateringPackageDialogProps> = ({
  packageItem,
  open,
  onOpenChange,
  onAddToCart,
}) => {
  const [optionGroups, setOptionGroups] = useState<CateringOptionGroupWithItems[]>([]);
  const [selections, setSelections] = useState<Map<string, Set<string>>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Map<string, string>>(new Map());

  // Load option groups when dialog opens
  useEffect(() => {
    if (!open) return;

    const loadOptionGroups = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const groups = await cateringService.getPackageOptions(packageItem.id);
        setOptionGroups(groups);

        // Initialize selections with default items
        const initialSelections = new Map<string, Set<string>>();
        groups.forEach((group) => {
          const defaults = group.options
            .filter(opt => opt.isDefault)
            .map(opt => opt.menuItemId);

          if (defaults.length > 0) {
            // For single-select groups, only use the first default
            if (group.maxSelections === 1) {
              initialSelections.set(group.id, new Set([defaults[0]]));
            } else {
              // For multi-select, use all defaults (up to max)
              const defaultsToUse = defaults.slice(0, group.maxSelections);
              initialSelections.set(group.id, new Set(defaultsToUse));
            }
          } else {
            initialSelections.set(group.id, new Set());
          }
        });
        setSelections(initialSelections);
      } catch (err: any) {
        console.error('Failed to load package options:', err);
        setError(err?.message || 'Failed to load package options');
      } finally {
        setIsLoading(false);
      }
    };

    loadOptionGroups();
  }, [open, packageItem.id]);

  // Validate selections
  const validateSelections = (): boolean => {
    const errors = new Map<string, string>();

    optionGroups.forEach((group) => {
      const groupSelections = selections.get(group.id) || new Set();

      if (group.isRequired && groupSelections.size === 0) {
        errors.set(group.id, 'This selection is required');
      } else if (groupSelections.size < group.minSelections) {
        errors.set(group.id, `Please select at least ${group.minSelections} option(s)`);
      } else if (groupSelections.size > group.maxSelections) {
        errors.set(group.id, `You can select up to ${group.maxSelections} option(s)`);
      }
    });

    setValidationErrors(errors);
    return errors.size === 0;
  };

  // Validate on selection change
  useEffect(() => {
    if (optionGroups.length > 0) {
      validateSelections();
    }
  }, [selections, optionGroups]);

  // Convert selections to catering selections format (simpler format for dedicated API)
  const convertToCustomizations = (): CartItemCustomization[] => {
    const customizations: CartItemCustomization[] = [];

    optionGroups.forEach((group) => {
      const selectedIds = selections.get(group.id) || new Set();

      selectedIds.forEach((itemId) => {
        const option = group.options.find(opt => opt.menuItemId === itemId);
        if (option) {
          // Store in simple format for catering API
          customizations.push({
            optionId: group.id,  // Will be converted to optionGroupId in MenuCard
            optionName: group.groupLabel,
            choiceId: option.menuItemId,  // Will be converted to selectedItemId in MenuCard
            choiceName: option.itemName || '',
            priceModifier: option.additionalPrice || 0,  // Will be converted to additionalPrice in MenuCard
          });
        }
      });
    });

    return customizations;
  };

  // Handle selection change
  const handleSelectionChange = (groupId: string, itemId: string, selected: boolean) => {
    setSelections(prev => {
      const newSelections = new Map(prev);
      const groupSelections = new Set(newSelections.get(groupId) || []);

      if (selected) {
        groupSelections.add(itemId);
      } else {
        groupSelections.delete(itemId);
      }

      newSelections.set(groupId, groupSelections);
      return newSelections;
    });
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!validateSelections()) {
      return;
    }

    setIsAdding(true);
    try {
      const customizations = convertToCustomizations();
      await onAddToCart(customizations);
      onOpenChange(false);
    } catch (err: any) {
      console.error('Failed to add package to cart:', err);
      setError(err?.message || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  // Calculate total selections
  const totalSelections = Array.from(selections.values()).reduce(
    (sum, set) => sum + set.size,
    0
  );

  // Calculate total price (base + additional charges)
  const calculateTotalPrice = (): number => {
    let total = packageItem.price;

    optionGroups.forEach((group) => {
      const selectedIds = selections.get(group.id) || new Set();
      selectedIds.forEach((itemId) => {
        const option = group.options.find(opt => opt.menuItemId === itemId);
        if (option && option.additionalPrice) {
          total += option.additionalPrice;
        }
      });
    });

    return total;
  };

  const isValid = validationErrors.size === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-start gap-4">
            {/* Package Image */}
            {packageItem.imageUrl ? (
              <img
                src={packageItem.imageUrl}
                alt={packageItem.name}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-background-gray flex items-center justify-center flex-shrink-0">
                <span className="text-4xl">🍛</span>
              </div>
            )}

            {/* Package Info */}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold mb-1">
                {packageItem.name}
              </DialogTitle>
              {packageItem.description && (
                <p className="text-sm text-text-secondary mb-2">
                  {packageItem.description}
                </p>
              )}
              <div className="text-xl font-bold text-primary">
                S$ {packageItem.price.toFixed(2)}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          <div className="py-6 space-y-8">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading options...</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : optionGroups.length === 0 ? (
              <Alert>
                <AlertDescription>
                  This package has no options configured. Click "Add to Cart" to proceed.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Option Groups */}
                {optionGroups.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <PackageOptionGroup
                      group={group}
                      selectedItemIds={selections.get(group.id) || new Set()}
                      onSelectionChange={(itemId, selected) =>
                        handleSelectionChange(group.id, itemId, selected)
                      }
                      disabled={isAdding}
                    />
                    {/* Validation Error */}
                    {validationErrors.has(group.id) && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {validationErrors.get(group.id)}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-background-gray flex-shrink-0">
          <div className="flex items-center justify-between w-full gap-4">
            {/* Selection Summary */}
            <div className="flex flex-col gap-1">
              {totalSelections > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  {isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-error" />
                  )}
                  <span className="text-text-secondary">
                    {totalSelections} selection{totalSelections !== 1 ? 's' : ''} made
                  </span>
                </div>
              )}
              <div className="text-xl font-bold text-primary">
                Total: S$ {calculateTotalPrice().toFixed(2)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isAdding}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToCart}
                disabled={!isValid || isAdding || isLoading}
              >
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

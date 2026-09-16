/**
 * Al-Arafa Restaurant - Option Items List Component
 * Display items within an option group with actions
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import type { CateringOptionItem, UpdateOptionItemRequest } from '@/types';

interface OptionItemsListProps {
  items: CateringOptionItem[];
  onUpdateItem: (itemId: string, data: UpdateOptionItemRequest) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onReorderItem: (itemId: string, direction: 'up' | 'down') => Promise<void>;
  isLoading?: boolean;
}

export function OptionItemsList({
  items,
  onUpdateItem,
  onDeleteItem,
  onReorderItem,
  isLoading = false,
}: OptionItemsListProps) {
  const [itemToDelete, setItemToDelete] = useState<CateringOptionItem | null>(null);

  const handleToggleDefault = async (item: CateringOptionItem) => {
    await onUpdateItem(item.id, { isDefault: !item.isDefault });
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      await onDeleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No items in this group yet. Add items below.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
          >
            {/* Reorder buttons */}
            <div className="flex flex-col gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onReorderItem(item.id, 'up')}
                disabled={index === 0 || isLoading}
                title="Move up"
              >
                <ChevronUp className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onReorderItem(item.id, 'down')}
                disabled={index === items.length - 1 || isLoading}
                title="Move down"
              >
                <ChevronDown className="w-3 h-3" />
              </Button>
            </div>

            {/* Item details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">
                  {item.itemName || item.menuItem?.name || 'Unknown Item'}
                </span>
                {item.isDefault && (
                  <Badge variant="secondary" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Base: ${(item.itemBasePrice ?? item.menuItem?.price ?? 0).toFixed(2)}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant={item.isDefault ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleToggleDefault(item)}
                disabled={isLoading}
                title={item.isDefault ? 'Remove default' : 'Set as default'}
              >
                {item.isDefault ? 'Default' : 'Set Default'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setItemToDelete(item)}
                disabled={isLoading}
                title="Delete item"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Option Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{itemToDelete?.itemName || itemToDelete?.menuItem?.name}&quot; from this option group?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

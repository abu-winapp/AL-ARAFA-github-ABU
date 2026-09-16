/**
 * Al-Arafa Restaurant - Suggestions Dialog Component
 * Displays suggested menu items after adding an item to cart
 */

'use client';

import { FC } from 'react';
import type { MenuItem } from '@/types';
import { SuggestionCard } from './SuggestionCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';

interface SuggestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: MenuItem[];
  locationId: string;
}

export const SuggestionsDialog: FC<SuggestionsDialogProps> = ({
  open,
  onOpenChange,
  suggestions,
  locationId,
}) => {
  const handleItemAdded = () => {
    // Refresh is handled by the cart store
    // Dialog stays open after adding
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0 gap-0">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-5 border-b">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl">You might also like...</DialogTitle>
            <DialogDescription className="text-base">
              Complete your meal with these popular items
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable content area */}
        <div className="px-6 py-5 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-2 gap-4">
            {suggestions.map((item) => (
              <SuggestionCard
                key={item.id}
                item={item}
                locationId={locationId}
                onItemAdded={handleItemAdded}
              />
            ))}
          </div>
        </div>

        {/* Footer with border top */}
        <div className="border-t bg-background-gray/30 px-6 py-4">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full h-12 text-base font-semibold"
          >
            Continue Ordering
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

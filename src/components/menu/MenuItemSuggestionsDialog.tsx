/**
 * MenuItemSuggestionsDialog - Manage suggestions for a menu item
 */

'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SuggestionsList } from './SuggestionsList';
import type { MenuItem, MenuItemSuggestion } from '@/types';
import * as adminMenuService from '@/lib/api/admin-menu.service';
import { Plus, AlertCircle } from 'lucide-react';

interface MenuItemSuggestionsDialogProps {
  menuItem: MenuItem;
  allMenuItems: MenuItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_SUGGESTIONS = 6;

export function MenuItemSuggestionsDialog({
  menuItem,
  allMenuItems,
  open,
  onOpenChange,
}: MenuItemSuggestionsDialogProps) {
  const [suggestions, setSuggestions] = useState<MenuItemSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  // Load suggestions when dialog opens
  useEffect(() => {
    if (open) {
      loadSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, menuItem.id, allMenuItems]);

  const loadSuggestions = async () => {
    try {
      setIsLoading(true);
      const data = await adminMenuService.getMenuItemSuggestions(menuItem.id);

      // Enrich suggestions with item data if backend doesn't populate it
      const enrichedSuggestions = data.map(suggestion => {
        if (!suggestion.suggestedItem) {
          // Look up the item from allMenuItems
          const item = allMenuItems.find(i => i.id === suggestion.suggestedItemId);
          return {
            ...suggestion,
            suggestedItem: item,
          };
        }
        return suggestion;
      });

      setSuggestions(enrichedSuggestions);
    } catch (error: any) {
      console.error('Failed to load suggestions:', error);
      toast.error('Failed to load suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestion = async () => {
    if (!selectedItemId) {
      toast.error('Please select an item to add');
      return;
    }

    if (suggestions.length >= MAX_SUGGESTIONS) {
      toast.error(`Maximum ${MAX_SUGGESTIONS} suggestions allowed`);
      return;
    }

    try {
      setIsLoading(true);
      // Auto-assign next sortOrder
      const nextSortOrder = suggestions.length > 0
        ? Math.max(...suggestions.map(s => s.sortOrder)) + 1
        : 0;

      await adminMenuService.addMenuItemSuggestion(
        menuItem.id,
        selectedItemId,
        nextSortOrder
      );

      toast.success('Suggestion added successfully');
      setSelectedItemId(''); // Reset selection
      await loadSuggestions(); // Reload to get updated data
    } catch (error: any) {
      console.error('Failed to add suggestion:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to add suggestion';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (suggestionId: string, direction: 'up' | 'down') => {
    const currentIndex = suggestions.findIndex(s => s.id === suggestionId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= suggestions.length) return;

    const currentSuggestion = suggestions[currentIndex];
    const targetSuggestion = suggestions[targetIndex];

    try {
      // Optimistic update
      const newSuggestions = [...suggestions];
      newSuggestions[currentIndex] = { ...currentSuggestion, sortOrder: targetSuggestion.sortOrder };
      newSuggestions[targetIndex] = { ...targetSuggestion, sortOrder: currentSuggestion.sortOrder };
      newSuggestions.sort((a, b) => a.sortOrder - b.sortOrder);
      setSuggestions(newSuggestions);

      // Swap sortOrder values
      await Promise.all([
        adminMenuService.updateSuggestionOrder(
          menuItem.id,
          currentSuggestion.id,
          targetSuggestion.sortOrder
        ),
        adminMenuService.updateSuggestionOrder(
          menuItem.id,
          targetSuggestion.id,
          currentSuggestion.sortOrder
        ),
      ]);

      toast.success('Order updated');
    } catch (error: any) {
      console.error('Failed to reorder suggestions:', error);
      toast.error('Failed to update order');
      // Reload to restore correct state
      await loadSuggestions();
    }
  };

  const handleRemove = async (suggestionId: string) => {
    try {
      setIsLoading(true);
      await adminMenuService.removeMenuItemSuggestion(menuItem.id, suggestionId);
      toast.success('Suggestion removed');
      await loadSuggestions();
    } catch (error: any) {
      console.error('Failed to remove suggestion:', error);
      toast.error('Failed to remove suggestion');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out current item and already suggested items
  const availableItems = allMenuItems.filter(
    item =>
      item.id !== menuItem.id &&
      !suggestions.some(s => s.suggestedItemId === item.id) &&
      item.isAvailable
  );

  const isMaxSuggestions = suggestions.length >= MAX_SUGGESTIONS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Manage Suggestions for {menuItem.name}
          </DialogTitle>
          <DialogDescription>
            Add items that go well with this menu item. Maximum {MAX_SUGGESTIONS} suggestions allowed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning when approaching limit */}
          {suggestions.length >= MAX_SUGGESTIONS - 1 && suggestions.length < MAX_SUGGESTIONS && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are approaching the maximum limit of {MAX_SUGGESTIONS} suggestions.
              </AlertDescription>
            </Alert>
          )}

          {/* Max limit reached */}
          {isMaxSuggestions && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Maximum limit of {MAX_SUGGESTIONS} suggestions reached. Remove a suggestion to add more.
              </AlertDescription>
            </Alert>
          )}

          {/* Add New Suggestion */}
          <div className="space-y-3">
            <Label>Add New Suggestion</Label>
            <div className="flex gap-2">
              <Select
                value={selectedItemId}
                onValueChange={setSelectedItemId}
                disabled={isLoading || isMaxSuggestions}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a menu item to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableItems.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      No available items to add
                    </div>
                  ) : (
                    availableItems.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} - ${item.price.toFixed(2)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddSuggestion}
                disabled={!selectedItemId || isLoading || isMaxSuggestions}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {/* Current Suggestions */}
          <div className="space-y-3">
            <Label>
              Current Suggestions ({suggestions.length}/{MAX_SUGGESTIONS})
            </Label>
            {isLoading && suggestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading suggestions...
              </div>
            ) : (
              <SuggestionsList
                suggestions={suggestions}
                onReorder={handleReorder}
                onRemove={handleRemove}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

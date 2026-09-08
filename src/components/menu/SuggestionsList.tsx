/**
 * SuggestionsList - Display and manage menu item suggestions
 */

'use client';

import { Button } from '@/components/ui/Button';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import type { MenuItemSuggestion } from '@/types';

interface SuggestionsListProps {
  suggestions: MenuItemSuggestion[];
  onReorder: (suggestionId: string, direction: 'up' | 'down') => void;
  onRemove: (suggestionId: string) => void;
  isLoading?: boolean;
}

export function SuggestionsList({
  suggestions,
  onReorder,
  onRemove,
  isLoading = false,
}: SuggestionsListProps) {
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
        <p>No suggestions added yet.</p>
        <p className="text-sm mt-1">Add items that go well with this menu item.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {suggestions.map((suggestion, index) => {
        const item = suggestion.suggestedItem;
        const isFirst = index === 0;
        const isLast = index === suggestions.length - 1;

        // Safety check: if suggestedItem is not populated by backend
        if (!item) {
          return (
            <div
              key={suggestion.id}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
            >
              <div className="flex-1 text-sm text-muted-foreground">
                Item data not available (ID: {suggestion.suggestedItemId})
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(suggestion.id)}
                disabled={isLoading}
                title="Remove suggestion"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          );
        }

        return (
          <div
            key={suggestion.id}
            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
          >
            {/* Item Image and Details */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">🍛</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                  ${item.price.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Reorder Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReorder(suggestion.id, 'up')}
                disabled={isFirst || isLoading}
                title="Move up"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReorder(suggestion.id, 'down')}
                disabled={isLast || isLoading}
                title="Move down"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(suggestion.id)}
              disabled={isLoading}
              title="Remove suggestion"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Al-Arafa Restaurant - Package Option Group Component
 * Displays a single option group with selectable items for catering packages
 */

'use client';

import { FC } from 'react';
import type { CateringOptionGroupWithItems, CateringOptionItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PackageOptionGroupProps {
  group: CateringOptionGroupWithItems;
  selectedItemIds: Set<string>;
  onSelectionChange: (itemId: string, selected: boolean) => void;
  disabled?: boolean;
}

export const PackageOptionGroup: FC<PackageOptionGroupProps> = ({
  group,
  selectedItemIds,
  onSelectionChange,
  disabled = false,
}) => {
  const isSingleSelect = group.maxSelections === 1;
  const isFull = selectedItemIds.size >= group.maxSelections;

  // Generate selection rule text (e.g., "Choose 1" or "Choose 1-2")
  const getSelectionRuleText = () => {
    if (group.selectionRuleText) {
      return group.selectionRuleText;
    }
    if (group.minSelections === group.maxSelections) {
      return `Choose ${group.maxSelections}`;
    }
    return `Choose ${group.minSelections}-${group.maxSelections}`;
  };

  const handleRadioChange = (itemId: string) => {
    // Clear all previous selections
    selectedItemIds.forEach(id => {
      if (id !== itemId) {
        onSelectionChange(id, false);
      }
    });
    // Select the new one
    onSelectionChange(itemId, true);
  };

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    onSelectionChange(itemId, checked);
  };

  return (
    <div className="space-y-4">
      {/* Group Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            {group.groupLabel}
            {group.isRequired && <span className="text-error ml-1">*</span>}
          </h3>
          {group.description && (
            <p className="text-sm text-text-secondary mt-1">{group.description}</p>
          )}
        </div>
        <Badge variant="secondary" className="flex-shrink-0">
          {getSelectionRuleText()}
        </Badge>
      </div>

      {/* Items List */}
      {isSingleSelect ? (
        // Radio buttons for single selection
        <RadioGroup
          value={Array.from(selectedItemIds)[0] || ''}
          onValueChange={handleRadioChange}
          disabled={disabled}
        >
          <div className="space-y-3">
            {group.options.map((option) => (
              <div
                key={option.id}
                className={cn(
                  'relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer',
                  selectedItemIds.has(option.menuItemId)
                    ? 'border-primary bg-primary/5'
                    : 'border-border-light hover:border-primary/50 bg-white',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <RadioGroupItem
                  value={option.menuItemId}
                  id={`radio-${option.id}`}
                  disabled={disabled}
                />
                <Label
                  htmlFor={`radio-${option.id}`}
                  className="flex-1 flex items-start gap-3 cursor-pointer"
                >
                  {/* Item Image/Icon */}
                  {option.itemImageUrl ? (
                    <img
                      src={option.itemImageUrl}
                      alt={option.itemName}
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-background-gray flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🍛</span>
                    </div>
                  )}

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-text-primary">
                        {option.itemName}
                      </span>
                      {option.isDefault && (
                        <Badge variant="outline" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    {option.itemBasePrice !== undefined && (
                      <div className="text-sm text-text-secondary mt-0.5">
                        S$ {option.itemBasePrice.toFixed(2)}
                        {option.additionalPrice > 0 && (
                          <span className="text-green-600 ml-1">
                            (+${option.additionalPrice.toFixed(2)})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      ) : (
        // Checkboxes for multiple selection
        <div className="space-y-3">
          {group.options.map((option) => {
            const isSelected = selectedItemIds.has(option.menuItemId);
            const isDisabled = disabled || (isFull && !isSelected);

            return (
              <div
                key={option.id}
                className={cn(
                  'relative flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border-light hover:border-primary/50 bg-white',
                  isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                )}
              >
                <Checkbox
                  id={`checkbox-${option.id}`}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(option.menuItemId, checked as boolean)
                  }
                  disabled={isDisabled}
                />
                <Label
                  htmlFor={`checkbox-${option.id}`}
                  className={cn(
                    'flex-1 flex items-start gap-3',
                    isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                  )}
                >
                  {/* Item Image/Icon */}
                  {option.itemImageUrl ? (
                    <img
                      src={option.itemImageUrl}
                      alt={option.itemName}
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-background-gray flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🍛</span>
                    </div>
                  )}

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-text-primary">
                        {option.itemName}
                      </span>
                      {option.isDefault && (
                        <Badge variant="outline" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    {option.itemBasePrice !== undefined && (
                      <div className="text-sm text-text-secondary mt-0.5">
                        S$ {option.itemBasePrice.toFixed(2)}
                        {option.additionalPrice > 0 && (
                          <span className="text-green-600 ml-1">
                            (+${option.additionalPrice.toFixed(2)})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

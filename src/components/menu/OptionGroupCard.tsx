/**
 * Al-Arafa Restaurant - Option Group Card Component
 * Container for single option group with all items and actions
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { OptionItemsList } from './OptionItemsList';
import { ChevronUp, ChevronDown, Edit, Trash2, Plus } from 'lucide-react';
import type {
  CateringOptionGroupWithItems,
  MenuItem,
  UpdateOptionGroupRequest,
  AddOptionItemRequest,
  UpdateOptionItemRequest,
} from '@/types';

interface OptionGroupCardProps {
  packageId: string;
  group: CateringOptionGroupWithItems;
  availableMenuItems: MenuItem[];
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (groupId: string, data: UpdateOptionGroupRequest) => Promise<void>;
  onDelete: (groupId: string) => Promise<void>;
  onReorder: (groupId: string, direction: 'up' | 'down') => Promise<void>;
  onAddItem: (groupId: string, data: AddOptionItemRequest) => Promise<void>;
  onUpdateItem: (groupId: string, itemId: string, data: UpdateOptionItemRequest) => Promise<void>;
  onDeleteItem: (groupId: string, itemId: string) => Promise<void>;
  onReorderItem: (groupId: string, itemId: string, direction: 'up' | 'down') => Promise<void>;
  onEditGroup: () => void;
  isLoading?: boolean;
}

export function OptionGroupCard({
  packageId,
  group,
  availableMenuItems,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onReorder,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onReorderItem,
  onEditGroup,
  isLoading = false,
}: OptionGroupCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [isDefault, setIsDefault] = useState<boolean>(false);

  // Ensure options array exists (backend uses "options", not "items")
  const items = group.options || [];

  // Filter out items that are already in this group
  const addedItemIds = new Set(items.map((item) => item.menuItemId));
  const filteredMenuItems = availableMenuItems.filter((item) => !addedItemIds.has(item.id));

  const getSelectionText = () => {
    if (group.minSelections === group.maxSelections) {
      return `Select ${group.maxSelections}`;
    } else if (group.minSelections === 0) {
      return `Select up to ${group.maxSelections}`;
    } else {
      return `Select ${group.minSelections}-${group.maxSelections}`;
    }
  };

  const handleAddItem = async () => {
    if (!selectedItemId) return;

    const nextSortOrder = items.length > 0
      ? Math.max(...items.map((i) => i.sortOrder)) + 1
      : 1;

    await onAddItem(group.id, {
      menuItemId: selectedItemId,
      additionalPrice: 0, // No additional price for now
      isDefault,
      sortOrder: nextSortOrder,
    });

    // Reset form
    setSelectedItemId('');
    setIsDefault(false);
  };

  const handleDeleteGroup = async () => {
    await onDelete(group.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg">{group.groupLabel}</CardTitle>
                {group.isRequired && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {getSelectionText()}
                </Badge>
              </div>
              {group.description && (
                <CardDescription>{group.description}</CardDescription>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                ID: {group.groupName}
              </div>
            </div>

            {/* Group action buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onReorder(group.id, 'up')}
                disabled={isFirst || isLoading}
                title="Move group up"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onReorder(group.id, 'down')}
                disabled={isLast || isLoading}
                title="Move group down"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onEditGroup}
                disabled={isLoading}
                title="Edit group"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isLoading}
                title="Delete group"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Items list */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Items in this group</h4>
            <OptionItemsList
              items={items}
              onUpdateItem={(itemId, data) => onUpdateItem(group.id, itemId, data)}
              onDeleteItem={(itemId) => onDeleteItem(group.id, itemId)}
              onReorderItem={(itemId, direction) => onReorderItem(group.id, itemId, direction)}
              isLoading={isLoading}
            />
          </div>

          {/* Add item form */}
          {filteredMenuItems.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">Add Item</h4>
              <div className="flex gap-3">
                {/* Item selector */}
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`item-select-${group.id}`}>Menu Item</Label>
                  <Select
                    value={selectedItemId}
                    onValueChange={setSelectedItemId}
                    disabled={isLoading}
                  >
                    <SelectTrigger id={`item-select-${group.id}`}>
                      <SelectValue placeholder="Select item..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredMenuItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} (${item.price.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Is Default checkbox */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer h-10 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      disabled={isLoading}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Default</span>
                  </label>
                </div>

                {/* Add button */}
                <div className="flex items-end">
                  <Button
                    onClick={handleAddItem}
                    disabled={!selectedItemId || isLoading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {filteredMenuItems.length === 0 && items.length > 0 && (
            <div className="text-sm text-muted-foreground text-center py-2 border-t">
              All available menu items have been added to this group
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Option Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{group.groupLabel}&quot;?
              {items.length > 0 && (
                <span className="block mt-2 font-semibold text-destructive">
                  This group contains {items.length} item(s) which will also be removed.
                </span>
              )}
              <span className="block mt-2">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

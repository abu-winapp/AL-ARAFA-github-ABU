/**
 * ComponentsList - Display and manage composite item components
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChevronUp, ChevronDown, Trash2, Edit, Check, X } from 'lucide-react';
import type { CompositeComponent } from '@/types';

interface ComponentsListProps {
  components: CompositeComponent[];
  onUpdateQuantity: (componentId: string, quantity: number) => void;
  onReorder: (componentId: string, direction: 'up' | 'down') => void;
  onRemove: (componentId: string) => void;
  isLoading?: boolean;
}

export function ComponentsList({
  components,
  onUpdateQuantity,
  onReorder,
  onRemove,
  isLoading = false,
}: ComponentsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<string>('');

  const handleStartEdit = (component: CompositeComponent) => {
    setEditingId(component.id);
    setEditQuantity(component.quantity.toString());
  };

  const handleSaveEdit = (componentId: string) => {
    const quantityNum = parseFloat(editQuantity);
    if (!isNaN(quantityNum) && quantityNum > 0) {
      onUpdateQuantity(componentId, quantityNum);
      setEditingId(null);
      setEditQuantity('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuantity('');
  };

  if (components.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
        <p>No components added yet.</p>
        <p className="text-sm mt-1">Add menu items to build this combo package.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {components.map((component, index) => {
        const item = component.menuItem;
        const isFirst = index === 0;
        const isLast = index === components.length - 1;
        const isEditing = editingId === component.id;

        // Safety check: if menuItem is not populated by backend
        if (!item) {
          return (
            <div
              key={component.id}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
            >
              <div className="flex-1 text-sm text-muted-foreground">
                Item data not available (ID: {component.componentItemId})
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(component.id)}
                disabled={isLoading}
                title="Remove component"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          );
        }

        const subtotal = component.quantity * item.price;

        return (
          <div
            key={component.id}
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
                  ${item.price.toFixed(2)} × {component.quantity} = ${subtotal.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Quantity Edit Controls */}
            {isEditing ? (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="w-20"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(component.id);
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSaveEdit(component.id)}
                  title="Save"
                >
                  <Check className="w-4 h-4 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  title="Cancel"
                >
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStartEdit(component)}
                disabled={isLoading}
                title="Edit quantity"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}

            {/* Reorder Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReorder(component.id, 'up')}
                disabled={isFirst || isLoading || isEditing}
                title="Move up"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReorder(component.id, 'down')}
                disabled={isLast || isLoading || isEditing}
                title="Move down"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(component.id)}
              disabled={isLoading || isEditing}
              title="Remove component"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}

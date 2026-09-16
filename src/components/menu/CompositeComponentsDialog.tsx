/**
 * CompositeComponentsDialog - Manage bundle components for a composite menu item
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
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ComponentsList } from './ComponentsList';
import type { MenuItem, CompositeComponent, CompositeComponentsResponse } from '@/types';
import * as adminMenuService from '@/lib/api/admin-menu.service';
import { Plus, AlertCircle, TrendingDown } from 'lucide-react';

interface CompositeComponentsDialogProps {
  compositeItem: MenuItem;
  allMenuItems: MenuItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompositeComponentsDialog({
  compositeItem,
  allMenuItems,
  open,
  onOpenChange,
}: CompositeComponentsDialogProps) {
  const [componentsData, setComponentsData] = useState<CompositeComponentsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');

  // Load components when dialog opens
  useEffect(() => {
    if (open) {
      loadComponents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, compositeItem.id, allMenuItems]);

  const loadComponents = async () => {
    try {
      setIsLoading(true);
      const data = await adminMenuService.getCompositeComponents(compositeItem.id);

      console.log('Components data from backend:', data);

      // Enrich components with item data if backend doesn't populate it
      const enrichedComponents = (data.components || []).map(component => {
        if (!component.menuItem) {
          const item = allMenuItems.find(i => i.id === component.componentItemId);
          return {
            ...component,
            menuItem: item,
          };
        }
        return component;
      });

      setComponentsData({
        components: enrichedComponents,
        componentsTotal: data.componentsTotal ?? 0,
        bundlePrice: data.bundlePrice ?? 0,
        savings: data.savings ?? 0,
        savingsPercentage: data.savingsPercentage ?? 0,
      });
    } catch (error: any) {
      console.error('Failed to load components:', error);
      toast.error('Failed to load bundle components');
      // Set empty state on error
      setComponentsData({
        components: [],
        componentsTotal: 0,
        bundlePrice: 0,
        savings: 0,
        savingsPercentage: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComponent = async () => {
    if (!selectedItemId) {
      toast.error('Please select an item to add');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    try {
      setIsLoading(true);
      // Auto-assign next sortOrder
      const nextSortOrder = componentsData && componentsData.components.length > 0
        ? Math.max(...componentsData.components.map(c => c.sortOrder)) + 1
        : 0;

      await adminMenuService.addCompositeComponent(
        compositeItem.id,
        {
          componentItemId: selectedItemId,
          quantity: quantityNum,
          sortOrder: nextSortOrder,
        }
      );

      toast.success('Component added successfully');
      setSelectedItemId(''); // Reset selection
      setQuantity('1'); // Reset quantity
      await loadComponents(); // Reload to get updated pricing
    } catch (error: any) {
      console.error('Failed to add component:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to add component';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (componentId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    try {
      setIsLoading(true);
      await adminMenuService.updateCompositeComponent(
        compositeItem.id,
        componentId,
        { quantity: newQuantity }
      );
      toast.success('Quantity updated');
      await loadComponents(); // Reload to recalculate pricing
    } catch (error: any) {
      console.error('Failed to update quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (componentId: string, direction: 'up' | 'down') => {
    if (!componentsData) return;

    const components = componentsData.components;
    const currentIndex = components.findIndex(c => c.id === componentId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= components.length) return;

    const currentComponent = components[currentIndex];
    const targetComponent = components[targetIndex];

    try {
      // Optimistic update
      const newComponents = [...components];
      newComponents[currentIndex] = { ...currentComponent, sortOrder: targetComponent.sortOrder };
      newComponents[targetIndex] = { ...targetComponent, sortOrder: currentComponent.sortOrder };
      newComponents.sort((a, b) => a.sortOrder - b.sortOrder);
      setComponentsData({
        ...componentsData,
        components: newComponents,
      });

      // Swap sortOrder values
      await Promise.all([
        adminMenuService.updateCompositeComponent(
          compositeItem.id,
          currentComponent.id,
          { sortOrder: targetComponent.sortOrder }
        ),
        adminMenuService.updateCompositeComponent(
          compositeItem.id,
          targetComponent.id,
          { sortOrder: currentComponent.sortOrder }
        ),
      ]);

      toast.success('Order updated');
    } catch (error: any) {
      console.error('Failed to reorder components:', error);
      toast.error('Failed to update order');
      // Reload to restore correct state
      await loadComponents();
    }
  };

  const handleRemove = async (componentId: string) => {
    try {
      setIsLoading(true);
      await adminMenuService.removeCompositeComponent(compositeItem.id, componentId);
      toast.success('Component removed');
      await loadComponents();
    } catch (error: any) {
      console.error('Failed to remove component:', error);
      toast.error('Failed to remove component');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out composite items, current item, and already added items
  const availableItems = allMenuItems.filter(
    item =>
      !item.isComposite && // No composite items as components
      item.id !== compositeItem.id &&
      (!componentsData || !componentsData.components.some(c => c.componentItemId === item.id)) &&
      item.isAvailable
  );

  const hasComponents = componentsData && componentsData.components.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Manage Bundle Components for {compositeItem.name}
          </DialogTitle>
          <DialogDescription>
            Add menu items to create a combo package with discounted pricing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pricing Summary */}
          {hasComponents && componentsData && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg border">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Items Total</div>
                <div className="text-lg font-semibold">
                  ${(componentsData.componentsTotal ?? 0).toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Bundle Price</div>
                <div className="text-lg font-semibold text-primary">
                  ${(componentsData.bundlePrice ?? 0).toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Savings
                </div>
                <div className="text-lg font-semibold text-green-600">
                  ${(componentsData.savings ?? 0).toFixed(2)}
                  <span className="text-sm ml-1">
                    ({(componentsData.savingsPercentage ?? 0).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warning when no components */}
          {!hasComponents && !isLoading && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This combo item has no components yet. Add menu items below to build the bundle.
              </AlertDescription>
            </Alert>
          )}

          {/* Add New Component */}
          <div className="space-y-3">
            <Label>Add Component to Bundle</Label>
            <div className="flex gap-2">
              <Select
                value={selectedItemId}
                onValueChange={setSelectedItemId}
                disabled={isLoading}
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
              <div className="w-28">
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  placeholder="Qty"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleAddComponent}
                disabled={!selectedItemId || isLoading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Quantity supports decimals (e.g., 0.5, 1.5, 2.5 portions)
            </p>
          </div>

          {/* Current Components */}
          <div className="space-y-3">
            <Label>
              Bundle Components ({componentsData?.components.length || 0})
            </Label>
            {isLoading && (!componentsData || componentsData.components.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading components...
              </div>
            ) : (
              <ComponentsList
                components={componentsData?.components || []}
                onUpdateQuantity={handleUpdateQuantity}
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

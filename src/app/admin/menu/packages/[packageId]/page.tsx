/**
 * Al-Arafa Restaurant - Admin Catering Package Configuration Page
 */

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PackageHeader } from '@/components/menu/PackageHeader';
import { OptionGroupsList } from '@/components/menu/OptionGroupsList';
import { OptionGroupForm } from '@/components/menu/OptionGroupForm';
import { Plus, AlertCircle } from 'lucide-react';
import type {
  MenuItem,
  CateringOptionGroupWithItems,
  CateringOptionGroup,
  CreateOptionGroupRequest,
  UpdateOptionGroupRequest,
  AddOptionItemRequest,
  UpdateOptionItemRequest,
} from '@/types';
import * as adminMenuService from '@/lib/api/admin-menu.service';
import * as adminCateringService from '@/lib/api/admin-catering.service';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface PageProps {
  params: Promise<{
    packageId: string;
  }>;
}

export default function PackageConfigPage({ params: paramsPromise }: PageProps) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  // Data state
  const [packageItem, setPackageItem] = useState<MenuItem | null>(null);
  const [optionGroups, setOptionGroups] = useState<CateringOptionGroupWithItems[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CateringOptionGroup | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [item, groups, items] = await Promise.all([
        adminMenuService.getMenuItem(params.packageId),
        adminCateringService.getOptionGroups(params.packageId),
        adminMenuService.getAllMenuItems(),
      ]);

      // Verify it's a catering package
      if (!item.isCateringPackage) {
        setError('This item is not configured as a catering package.');
        return;
      }

      setPackageItem(item);
      setOptionGroups(groups);
      setAllMenuItems(items);

      // Debug logging
      console.log('Loaded option groups:', groups);
      console.log('Groups with options:', groups.map(g => ({
        id: g.id,
        label: g.groupLabel,
        optionsCount: g.options?.length || 0,
        options: g.options
      })));
    } catch (err: any) {
      console.error('Failed to load package data:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to load package data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated || user?.userType !== 'admin') {
      router.push('/admin/login');
      return;
    }

    loadData();
  }, [isAuthenticated, user, isInitialized, router, params.packageId]);

  
  // Option Group CRUD
  

  const handleCreateOrUpdateGroup = async (data: CreateOptionGroupRequest) => {
    try {
      setIsSubmitting(true);

      if (editingGroup) {
        // Update existing group
        await adminCateringService.updateOptionGroup(
          params.packageId,
          editingGroup.id,
          data
        );
        toast.success('Option group updated successfully');
      } else {
        // Create new group
        await adminCateringService.createOptionGroup(params.packageId, data);
        toast.success('Option group created successfully');
      }

      await loadData();
      setShowGroupDialog(false);
      setEditingGroup(null);
    } catch (err: any) {
      console.error('Failed to save option group:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to save option group';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGroup = async (
    groupId: string,
    data: UpdateOptionGroupRequest
  ) => {
    try {
      await adminCateringService.updateOptionGroup(params.packageId, groupId, data);
      toast.success('Option group updated successfully');
      await loadData();
    } catch (err: any) {
      console.error('Failed to update option group:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to update option group';
      toast.error(errorMessage);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await adminCateringService.deleteOptionGroup(params.packageId, groupId);
      toast.success('Option group deleted successfully');
      await loadData();
    } catch (err: any) {
      console.error('Failed to delete option group:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to delete option group';
      toast.error(errorMessage);
    }
  };

  const handleReorderGroup = async (groupId: string, direction: 'up' | 'down') => {
    const sortedGroups = [...optionGroups].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sortedGroups.findIndex((g) => g.id === groupId);

    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sortedGroups.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentGroup = sortedGroups[index];
    const targetGroup = sortedGroups[targetIndex];

    try {
      // Swap sort orders
      await Promise.all([
        adminCateringService.updateOptionGroup(params.packageId, currentGroup.id, {
          sortOrder: targetGroup.sortOrder,
        }),
        adminCateringService.updateOptionGroup(params.packageId, targetGroup.id, {
          sortOrder: currentGroup.sortOrder,
        }),
      ]);
      await loadData();
    } catch (err: any) {
      console.error('Failed to reorder groups:', err);
      toast.error('Failed to reorder groups');
    }
  };

  
  // Option Item CRUD
  

  const handleAddItem = async (groupId: string, data: AddOptionItemRequest) => {
    try {
      await adminCateringService.addOptionItem(params.packageId, groupId, data);
      toast.success('Item added successfully');
      await loadData();
    } catch (err: any) {
      console.error('Failed to add item:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to add item';
      toast.error(errorMessage);
    }
  };

  const handleUpdateItem = async (
    groupId: string,
    itemId: string,
    data: UpdateOptionItemRequest
  ) => {
    try {
      await adminCateringService.updateOptionItem(
        params.packageId,
        groupId,
        itemId,
        data
      );
      toast.success('Item updated successfully');
      await loadData();
    } catch (err: any) {
      console.error('Failed to update item:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to update item';
      toast.error(errorMessage);
    }
  };

  const handleDeleteItem = async (groupId: string, itemId: string) => {
    try {
      await adminCateringService.deleteOptionItem(params.packageId, groupId, itemId);
      toast.success('Item deleted successfully');
      await loadData();
    } catch (err: any) {
      console.error('Failed to delete item:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to delete item';
      toast.error(errorMessage);
    }
  };

  const handleReorderItem = async (
    groupId: string,
    itemId: string,
    direction: 'up' | 'down'
  ) => {
    const group = optionGroups.find((g) => g.id === groupId);
    if (!group) return;

    const sortedItems = [...(group.options || [])].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sortedItems.findIndex((i) => i.id === itemId);

    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sortedItems.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentItem = sortedItems[index];
    const targetItem = sortedItems[targetIndex];

    try {
      // Swap sort orders
      await Promise.all([
        adminCateringService.updateOptionItem(
          params.packageId,
          groupId,
          currentItem.id,
          { sortOrder: targetItem.sortOrder }
        ),
        adminCateringService.updateOptionItem(
          params.packageId,
          groupId,
          targetItem.id,
          { sortOrder: currentItem.sortOrder }
        ),
      ]);
      await loadData();
    } catch (err: any) {
      console.error('Failed to reorder items:', err);
      toast.error('Failed to reorder items');
    }
  };

  const handleEditGroup = (group: CateringOptionGroupWithItems) => {
    setEditingGroup(group);
    setShowGroupDialog(true);
  };

  const handleAddNewGroup = () => {
    setEditingGroup(null);
    setShowGroupDialog(true);
  };

  // Calculate next sort order
  const nextSortOrder =
    optionGroups.length > 0
      ? Math.max(...optionGroups.map((g) => g.sortOrder)) + 1
      : 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading package configuration...</p>
        </div>
      </div>
    );
  }

  if (error || !packageItem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push('/admin/menu')} className="mb-4">
          Back to Menu
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Package not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Package header */}
      <PackageHeader
        packageItem={packageItem}
        onBack={() => router.push('/admin/menu')}
      />

      {/* Page title and action */}
      <div className="flex items-center justify-between my-8">
        <div>
          <h2 className="text-2xl font-bold">Option Groups</h2>
          <p className="text-muted-foreground">
            Configure customizable options for this package
          </p>
        </div>
        <Button onClick={handleAddNewGroup}>
          <Plus className="w-4 h-4 mr-2" />
          Add Option Group
        </Button>
      </div>

      {/* Option groups list */}
      <OptionGroupsList
        packageId={params.packageId}
        groups={optionGroups}
        availableMenuItems={allMenuItems}
        onUpdateGroup={handleUpdateGroup}
        onDeleteGroup={handleDeleteGroup}
        onReorderGroup={handleReorderGroup}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onReorderItem={handleReorderItem}
        onEditGroup={handleEditGroup}
        isLoading={isSubmitting}
      />

      {/* Create/Edit Group Dialog */}
      <OptionGroupForm
        open={showGroupDialog}
        onOpenChange={(open) => {
          setShowGroupDialog(open);
          if (!open) {
            setEditingGroup(null);
          }
        }}
        onSubmit={handleCreateOrUpdateGroup}
        editingGroup={editingGroup}
        nextSortOrder={nextSortOrder}
        isLoading={isSubmitting}
      />
    </div>
  );
}

/**
 * Al-Arafa Restaurant - Option Groups List Component
 * Container for all option groups
 */

'use client';

import { OptionGroupCard } from './OptionGroupCard';
import type {
  CateringOptionGroupWithItems,
  MenuItem,
  UpdateOptionGroupRequest,
  AddOptionItemRequest,
  UpdateOptionItemRequest,
} from '@/types';

interface OptionGroupsListProps {
  packageId: string;
  groups: CateringOptionGroupWithItems[];
  availableMenuItems: MenuItem[];
  onUpdateGroup: (groupId: string, data: UpdateOptionGroupRequest) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;
  onReorderGroup: (groupId: string, direction: 'up' | 'down') => Promise<void>;
  onAddItem: (groupId: string, data: AddOptionItemRequest) => Promise<void>;
  onUpdateItem: (groupId: string, itemId: string, data: UpdateOptionItemRequest) => Promise<void>;
  onDeleteItem: (groupId: string, itemId: string) => Promise<void>;
  onReorderItem: (groupId: string, itemId: string, direction: 'up' | 'down') => Promise<void>;
  onEditGroup: (group: CateringOptionGroupWithItems) => void;
  isLoading?: boolean;
}

export function OptionGroupsList({
  packageId,
  groups,
  availableMenuItems,
  onUpdateGroup,
  onDeleteGroup,
  onReorderGroup,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onReorderItem,
  onEditGroup,
  isLoading = false,
}: OptionGroupsListProps) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold mb-2">No option groups yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first option group to get started with package configuration.
        </p>
      </div>
    );
  }

  // Sort groups by sortOrder
  const sortedGroups = [...groups].sort((a, b) => a.sortOrder - b.sortOrder);

  // Debug: Log groups to verify options array
  console.log('Rendering groups:', sortedGroups.map(g => ({
    id: g.id,
    label: g.groupLabel,
    optionsCount: g.options?.length || 0
  })));

  return (
    <div className="space-y-6">
      {sortedGroups.map((group, index) => (
        <OptionGroupCard
          key={group.id}
          packageId={packageId}
          group={group}
          availableMenuItems={availableMenuItems}
          isFirst={index === 0}
          isLast={index === sortedGroups.length - 1}
          onUpdate={onUpdateGroup}
          onDelete={onDeleteGroup}
          onReorder={onReorderGroup}
          onAddItem={onAddItem}
          onUpdateItem={onUpdateItem}
          onDeleteItem={onDeleteItem}
          onReorderItem={onReorderItem}
          onEditGroup={() => onEditGroup(group)}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

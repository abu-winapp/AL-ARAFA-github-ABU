/**
 * Al-Arafa Restaurant - Option Group Form Component
 * Create/edit option group dialog form
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { CateringOptionGroup, CreateOptionGroupRequest } from '@/types';

type FormData = {
  groupLabel: string;
  groupName: string;
  description: string;
  minSelections: number;
  maxSelections: number;
  isRequired: boolean;
};

// Validation schema
const schema: yup.ObjectSchema<FormData> = yup.object({
  groupLabel: yup
    .string()
    .required('Group label is required')
    .min(3, 'Group label must be at least 3 characters')
    .max(100, 'Group label must be at most 100 characters'),
  groupName: yup
    .string()
    .required('Group name is required')
    .matches(/^[a-z0-9-_]+$/, 'Group name must contain only lowercase letters, numbers, hyphens, and underscores'),
  description: yup.string().default('').max(255, 'Description must be at most 255 characters'),
  minSelections: yup
    .number()
    .required('Minimum selections is required')
    .integer('Must be a whole number')
    .min(0, 'Must be at least 0'),
  maxSelections: yup
    .number()
    .required('Maximum selections is required')
    .integer('Must be a whole number')
    .positive('Must be at least 1')
    .test(
      'greater-than-min',
      'Maximum must be greater than or equal to minimum',
      function (value) {
        return value >= this.parent.minSelections;
      }
    ),
  isRequired: yup.boolean().required(),
}).required();

interface OptionGroupFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateOptionGroupRequest) => Promise<void>;
  editingGroup?: CateringOptionGroup | null;
  nextSortOrder: number;
  isLoading?: boolean;
}

export function OptionGroupForm({
  open,
  onOpenChange,
  onSubmit,
  editingGroup,
  nextSortOrder,
  isLoading = false,
}: OptionGroupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      groupLabel: '',
      groupName: '',
      description: '',
      minSelections: 1,
      maxSelections: 1,
      isRequired: true,
    },
  });

  const groupLabel = watch('groupLabel');
  const isRequired = watch('isRequired');

  // Auto-generate groupName from groupLabel (kebab-case)
  useEffect(() => {
    if (!editingGroup && groupLabel) {
      const kebab = groupLabel
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('groupName', kebab);
    }
  }, [groupLabel, editingGroup, setValue]);

  // Reset form when dialog opens/closes or editing changes
  useEffect(() => {
    if (open && editingGroup) {
      reset({
        groupLabel: editingGroup.groupLabel,
        groupName: editingGroup.groupName,
        description: editingGroup.description || '',
        minSelections: editingGroup.minSelections,
        maxSelections: editingGroup.maxSelections,
        isRequired: editingGroup.isRequired,
      });
    } else if (open && !editingGroup) {
      reset({
        groupLabel: '',
        groupName: '',
        description: '',
        minSelections: 1,
        maxSelections: 1,
        isRequired: true,
      });
    }
  }, [open, editingGroup, reset]);

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      groupLabel: data.groupLabel,
      groupName: data.groupName,
      description: data.description || undefined,
      minSelections: data.minSelections,
      maxSelections: data.maxSelections,
      isRequired: data.isRequired,
      sortOrder: editingGroup?.sortOrder ?? nextSortOrder,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingGroup ? 'Edit Option Group' : 'Create Option Group'}
          </DialogTitle>
          <DialogDescription>
            {editingGroup
              ? 'Update the option group configuration.'
              : 'Create a new option group for customers to select from.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Group Label */}
          <div className="space-y-2">
            <Label htmlFor="groupLabel">
              Group Label <span className="text-destructive">*</span>
            </Label>
            <Input
              id="groupLabel"
              placeholder="e.g., Choose Your Gravy"
              {...register('groupLabel')}
              disabled={isLoading}
            />
            {errors.groupLabel && (
              <p className="text-sm text-destructive">{errors.groupLabel.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Display name shown to customers
            </p>
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName">
              Group Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="groupName"
              placeholder="e.g., gravy-selection"
              {...register('groupName')}
              disabled={isLoading || !!editingGroup}
            />
            {errors.groupName && (
              <p className="text-sm text-destructive">{errors.groupName.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {editingGroup
                ? 'Internal ID (cannot be changed)'
                : 'Internal ID (auto-generated, lowercase with hyphens)'}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="e.g., Select your preferred gravy option"
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Help text shown to customers
            </p>
          </div>

          {/* Min/Max Selections */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minSelections">
                Min Selections <span className="text-destructive">*</span>
              </Label>
              <Input
                id="minSelections"
                type="number"
                min={0}
                {...register('minSelections', { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.minSelections && (
                <p className="text-sm text-destructive">{errors.minSelections.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxSelections">
                Max Selections <span className="text-destructive">*</span>
              </Label>
              <Input
                id="maxSelections"
                type="number"
                min={1}
                {...register('maxSelections', { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.maxSelections && (
                <p className="text-sm text-destructive">{errors.maxSelections.message}</p>
              )}
            </div>
          </div>

          {/* Is Required */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isRequired" className="cursor-pointer">
                Required Selection
              </Label>
              <p className="text-sm text-muted-foreground">
                Customer must make a selection from this group
              </p>
            </div>
            <Switch
              id="isRequired"
              checked={isRequired}
              onCheckedChange={(checked) => setValue('isRequired', checked)}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : editingGroup ? 'Update Group' : 'Create Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

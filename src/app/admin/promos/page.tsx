/**
 * Al-Arafa Restaurant - Admin Promo Codes Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/Modal';
import type { PromoCode } from '@/types';
import * as adminPromoService from '@/lib/api/admin-promo.service';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface PromoFormData {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  maxUsageCount?: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
}

export default function AdminPromosPage() {
  const router = useRouter();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { isAuthenticated, user } = useAuthStore();

  const promoForm = useForm<PromoFormData>({
    defaultValues: {
      discountType: 'percentage',
      active: true,
    },
  });

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'admin') {
      router.push('/admin/login');
      return;
    }

    loadPromos();
  }, [isAuthenticated, user, router]);

  const loadPromos = async () => {
    try {
      setIsLoading(true);
      const data = await adminPromoService.getAllPromoCodes();
      setPromos(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load promo codes:', error);
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await adminPromoService.togglePromoStatus(id);
      loadPromos();
    } catch (error) {
      alert('Failed to update promo status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    try {
      await adminPromoService.deletePromoCode(id);
      loadPromos();
    } catch (error) {
      alert('Failed to delete promo code');
    }
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    promoForm.reset({
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minOrderAmount: promo.minOrderAmount,
      maxDiscountAmount: promo.maxDiscountAmount,
      maxUsageCount: promo.maxUsageCount,
      validFrom: promo.validFrom.split('T')[0],
      validUntil: promo.validUntil.split('T')[0],
      active: promo.active,
    });
  };

  const handleSavePromo = async (data: PromoFormData) => {
    try {
      setIsSaving(true);
      if (editingPromo) {
        await adminPromoService.updatePromoCode(editingPromo.id, data);
      } else {
        await adminPromoService.createPromoCode(data);
      }
      setEditingPromo(null);
      setShowPromoForm(false);
      promoForm.reset();
      loadPromos();
    } catch (error) {
      alert('Failed to save promo code');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading promo codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Header with Add Button */}
        {promos.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary">Promo Codes</h2>
            <Button onClick={() => setShowPromoForm(true)}>
              + Add Promo Code
            </Button>
          </div>
        )}

        {/* Promo Codes Grid */}
        {promos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🎟️</div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">No promo codes yet</h3>
            <p className="text-text-secondary mb-6">Create your first promo code to offer discounts</p>
            <Button onClick={() => setShowPromoForm(true)}>
              + Add Promo Code
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promos.map((promo) => (
              <div
                key={promo.id}
                className="bg-white rounded-xl shadow-lg p-6 border-2 border-border-light hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-primary mb-2 font-mono">
                      {promo.code}
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2">{promo.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(promo.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      promo.active ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                    }`}
                  >
                    {promo.active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {/* Discount Details */}
                <div className="bg-secondary/10 rounded-lg p-4 mb-4">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {promo.discountType === 'percentage'
                      ? `${promo.discountValue}% OFF`
                      : `S$ ${promo.discountValue.toFixed(2)} OFF`}
                  </div>
                  {promo.minOrderAmount && (
                    <div className="text-xs text-text-tertiary">
                      Min order: S$ {promo.minOrderAmount.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Usage Stats */}
                <div className="flex items-center justify-between text-sm text-text-tertiary mb-4">
                  <span>Used: {promo.currentUsageCount}</span>
                  {promo.maxUsageCount && <span>Max: {promo.maxUsageCount}</span>}
                </div>

                {/* Validity */}
                <div className="text-xs text-text-tertiary mb-4">
                  Valid: {new Date(promo.validFrom).toLocaleDateString()} -{' '}
                  {new Date(promo.validUntil).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(promo)}
                    className="flex-1 py-2 text-primary border-2 border-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-all text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="px-4 py-2 text-error border-2 border-error rounded-lg font-semibold hover:bg-error hover:text-white transition-all text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Promo Form Modal */}
      <Modal
        isOpen={showPromoForm || !!editingPromo}
        onClose={() => {
          setShowPromoForm(false);
          setEditingPromo(null);
          promoForm.reset();
        }}
        title={editingPromo ? `Edit Promo: ${editingPromo.code}` : 'Add Promo Code'}
        size="lg"
      >
        <form onSubmit={promoForm.handleSubmit(handleSavePromo)} className="space-y-6">
          {/* Promo Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Promo Code</Label>
            <Input
              id="code"
              placeholder="WELCOME15"
              className={promoForm.formState.errors.code ? 'border-destructive' : ''}
              {...promoForm.register('code', {
                required: 'Promo code is required',
                pattern: {
                  value: /^[A-Z0-9]+$/,
                  message: 'Only uppercase letters and numbers allowed',
                },
              })}
              disabled={isSaving}
            />
            <p className="text-xs text-text-tertiary">Uppercase letters and numbers only</p>
            {promoForm.formState.errors.code && (
              <p className="text-sm text-destructive">{promoForm.formState.errors.code.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="15% off on first order"
              className={promoForm.formState.errors.description ? 'border-destructive' : ''}
              {...promoForm.register('description', {
                required: 'Description is required',
              })}
              disabled={isSaving}
            />
            {promoForm.formState.errors.description && (
              <p className="text-sm text-destructive">{promoForm.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Discount Type */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">
                Discount Type <span className="text-error">*</span>
              </label>
              <select
                {...promoForm.register('discountType')}
                disabled={isSaving}
                className="w-full px-4 py-3 rounded-lg border-2 border-border-light focus:border-primary focus:outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (S$)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div className="space-y-2">
              <Label htmlFor="discountValue">Discount Value</Label>
              <Input
                id="discountValue"
                type="number"
                step="0.01"
                placeholder="15"
                className={promoForm.formState.errors.discountValue ? 'border-destructive' : ''}
                {...promoForm.register('discountValue', {
                  required: 'Discount value is required',
                  min: { value: 0.01, message: 'Must be greater than 0' },
                })}
                disabled={isSaving}
              />
              {promoForm.formState.errors.discountValue && (
                <p className="text-sm text-destructive">{promoForm.formState.errors.discountValue.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Min Order Amount */}
            <div className="space-y-2">
              <Label htmlFor="minOrderAmount">Min Order Amount (S$)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                step="0.01"
                placeholder="30.00"
                className={promoForm.formState.errors.minOrderAmount ? 'border-destructive' : ''}
                {...promoForm.register('minOrderAmount', {
                  min: { value: 0, message: 'Must be 0 or more' },
                })}
                disabled={isSaving}
              />
              <p className="text-xs text-text-tertiary">Optional</p>
              {promoForm.formState.errors.minOrderAmount && (
                <p className="text-sm text-destructive">{promoForm.formState.errors.minOrderAmount.message}</p>
              )}
            </div>

            {/* Max Usage */}
            <div className="space-y-2">
              <Label htmlFor="maxUsageCount">Max Usage Count</Label>
              <Input
                id="maxUsageCount"
                type="number"
                placeholder="100"
                className={promoForm.formState.errors.maxUsageCount ? 'border-destructive' : ''}
                {...promoForm.register('maxUsageCount', {
                  min: { value: 1, message: 'Must be at least 1' },
                })}
                disabled={isSaving}
              />
              <p className="text-xs text-text-tertiary">Optional (unlimited if blank)</p>
              {promoForm.formState.errors.maxUsageCount && (
                <p className="text-sm text-destructive">{promoForm.formState.errors.maxUsageCount.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Valid From */}
            <div className="space-y-2">
              <Label htmlFor="validFrom">Valid From</Label>
              <Input
                id="validFrom"
                type="date"
                className={promoForm.formState.errors.validFrom ? 'border-destructive' : ''}
                {...promoForm.register('validFrom', {
                  required: 'Valid from date is required',
                })}
                disabled={isSaving}
              />
              {promoForm.formState.errors.validFrom && (
                <p className="text-sm text-destructive">{promoForm.formState.errors.validFrom.message}</p>
              )}
            </div>

            {/* Valid Until */}
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                className={promoForm.formState.errors.validUntil ? 'border-destructive' : ''}
                {...promoForm.register('validUntil', {
                  required: 'Valid until date is required',
                })}
                disabled={isSaving}
              />
              {promoForm.formState.errors.validUntil && (
                <p className="text-sm text-destructive">{promoForm.formState.errors.validUntil.message}</p>
              )}
            </div>
          </div>

          {/* Active Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...promoForm.register('active')}
              disabled={isSaving}
              className="w-5 h-5 text-primary rounded focus:ring-primary"
            />
            <span className="font-semibold text-text-primary">Active</span>
          </label>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPromoForm(false);
                setEditingPromo(null);
                promoForm.reset();
              }}
              disabled={isSaving}
              className="w-full"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? 'Saving...' : editingPromo ? 'Update Promo' : 'Add Promo'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

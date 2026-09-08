/**
 * Al-Arafa Restaurant - Admin Settings Page (Redesigned)
 * Uses lookup-based API structure with tabbed interface
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/lib/store/useAuthStore';
import {
  getAllSettingsV2,
  groupSettingsByType,
  updateSettingValue
} from '@/lib/api/admin-settings.service';
import type { LookupDetail, SettingGroup, SettingType, SettingMetadata } from '@/types';
import {
  Settings,
  DollarSign,
  Gift,
  ShoppingBag,
  UtensilsCrossed,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Friendly labels for setting codes (UPPERCASE as per API)
const SETTING_LABELS: Record<string, string> = {
  // Loyalty
  'POINTS_PER_DOLLAR': 'Points Per Dollar',
  'POINTS_VALUE': 'Points Value (SGD)',
  'MIN_REDEMPTION': 'Minimum Redemption Points',
  // Order
  'MIN_ORDER_DELIVERY': 'Minimum Order for Delivery (SGD)',
  // Catering
  'MIN_LEAD_HOURS': 'Minimum Lead Time (Hours)',
  // Tax
  'GST_RATE': 'GST Rate (%)',
  'GST_ENABLED': 'GST Enabled'
};

// Parse metadata JSON string
function parseMetadata(metadataString?: string): SettingMetadata {
  if (!metadataString) return {};
  try {
    return JSON.parse(metadataString);
  } catch {
    return {};
  }
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  const [settingsGroups, setSettingsGroups] = useState<SettingGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('loyalty');

  // One form per tab
  const loyaltyForm = useForm<Record<string, string>>();
  const orderForm = useForm<Record<string, string>>();
  const cateringForm = useForm<Record<string, string>>();
  const taxForm = useForm<Record<string, string>>();

  // Auth guard
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated || user?.userType !== 'admin') {
      router.push('/admin/login');
      return;
    }

    loadSettings();
  }, [isAuthenticated, user, isInitialized, router]);

  // Load all settings and group them
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const allSettings = await getAllSettingsV2();

      // Check if we got valid data
      if (!Array.isArray(allSettings)) {
        console.error('getAllSettingsV2 did not return an array:', allSettings);
        throw new Error('Invalid settings data received from server');
      }

      if (allSettings.length === 0) {
        console.warn('No settings found in response');
        toast.error('No settings found. Please check if the backend has settings configured.');
      }

      // Debug: Log all settings and their types
      console.log('All settings received:', allSettings);
      console.log('Setting types found:', [...new Set(allSettings.map(s => s.lookupType))]);

      const grouped = groupSettingsByType(allSettings);
      console.log('Grouped settings:', grouped);
      setSettingsGroups(grouped);

      // Populate each form
      grouped.forEach(group => {
        const formData: Record<string, string> = {};
        group.settings.forEach(setting => {
          formData[setting.lookupCode] = setting.displayValue;
        });

        switch (group.type) {
          case 'LOYALTY_CONFIG':
            loyaltyForm.reset(formData);
            break;
          case 'ORDER_CONFIG':
            orderForm.reset(formData);
            break;
          case 'CATERING_CONFIG':
            cateringForm.reset(formData);
            break;
          case 'TAX_CONFIG':
            taxForm.reset(formData);
            break;
        }
      });

      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load settings. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  // Save handler for a specific setting type
  const handleSaveSettings = async (type: SettingType, formData: Record<string, string>) => {
    try {
      setIsSaving(true);

      const group = settingsGroups.find(g => g.type === type);
      if (!group) {
        toast.error('Settings group not found');
        return;
      }

      // Update each changed setting
      const updates = group.settings
        .filter(s => formData[s.lookupCode] !== s.displayValue)
        .map(s => updateSettingValue(type, s.lookupCode, formData[s.lookupCode]));

      if (updates.length === 0) {
        toast.info('No changes to save');
        setIsSaving(false);
        return;
      }

      await Promise.all(updates);
      await loadSettings(); // Refresh data

      toast.success('Settings updated successfully');
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Render dynamic fields for a setting group
  const renderSettingFields = (group: SettingGroup) => {
    return group.settings.map((setting) => {
      const metadata = parseMetadata(setting.metadata);
      const label = SETTING_LABELS[setting.lookupCode] || setting.lookupCode;
      const inputType = metadata.type === 'decimal' || metadata.type === 'integer' ? 'number' : 'text';
      const step = metadata.type === 'decimal' ? '0.01' : metadata.type === 'integer' ? '1' : undefined;

      // Get the appropriate form based on group type
      const form = group.type === 'LOYALTY_CONFIG' ? loyaltyForm :
                   group.type === 'ORDER_CONFIG' ? orderForm :
                   group.type === 'CATERING_CONFIG' ? cateringForm :
                   taxForm;

      // Special handling for GST_ENABLED - render as Switch
      if (setting.lookupCode === 'GST_ENABLED') {
        const currentValue = form.watch(setting.lookupCode);
        const isEnabled = currentValue === 'true';

        return (
          <div key={setting.id} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor={setting.lookupCode} className="text-base font-semibold">
                  {label}
                </Label>
                {setting.description && (
                  <p className="text-sm text-text-tertiary">
                    {setting.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <Switch
                  id={setting.lookupCode}
                  checked={isEnabled}
                  onCheckedChange={(checked) => {
                    form.setValue(setting.lookupCode, checked ? 'true' : 'false');
                  }}
                />
              </div>
            </div>
          </div>
        );
      }

      // Regular input fields for other settings
      return (
        <div key={setting.id} className="space-y-3 p-4 border rounded-lg">
          <Label htmlFor={setting.lookupCode} className="text-base font-semibold">
            {label}
          </Label>

          <div className="space-y-2">
            <Input
              id={setting.lookupCode}
              type={inputType}
              step={step}
              min={metadata.min}
              max={metadata.max}
              {...form.register(setting.lookupCode)}
            />
            {setting.description && (
              <p className="text-sm text-text-tertiary">
                {setting.description}
                {metadata.unit && ` (${metadata.unit})`}
              </p>
            )}
          </div>
        </div>
      );
    });
  };

  // Loading state
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">
            {!isInitialized ? 'Initializing...' : 'Loading settings...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadSettings} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const loyaltyGroup = settingsGroups.find(g => g.type === 'LOYALTY_CONFIG');
  const orderGroup = settingsGroups.find(g => g.type === 'ORDER_CONFIG');
  const cateringGroup = settingsGroups.find(g => g.type === 'CATERING_CONFIG');
  const taxGroup = settingsGroups.find(g => g.type === 'TAX_CONFIG');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          System Settings
        </h1>
        <p className="text-text-secondary mt-2">
          Configure platform-wide settings for your restaurant
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="loyalty" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            <span className="hidden sm:inline">Loyalty</span>
          </TabsTrigger>
          <TabsTrigger value="order" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Order</span>
          </TabsTrigger>
          <TabsTrigger value="catering" className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4" />
            <span className="hidden sm:inline">Catering</span>
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Tax</span>
          </TabsTrigger>
        </TabsList>

        {/* Loyalty Tab */}
        <TabsContent value="loyalty">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Program Settings</CardTitle>
              <CardDescription>
                Configure loyalty points earning and redemption rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loyaltyGroup ? (
                <form onSubmit={loyaltyForm.handleSubmit((data) => handleSaveSettings('LOYALTY_CONFIG', data))} className="space-y-4">
                  {renderSettingFields(loyaltyGroup)}
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  No loyalty settings found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Order Tab */}
        <TabsContent value="order">
          <Card>
            <CardHeader>
              <CardTitle>Order Settings</CardTitle>
              <CardDescription>
                Configure order requirements and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orderGroup ? (
                <form onSubmit={orderForm.handleSubmit((data) => handleSaveSettings('ORDER_CONFIG', data))} className="space-y-4">
                  {renderSettingFields(orderGroup)}
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  No order settings found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Catering Tab */}
        <TabsContent value="catering">
          <Card>
            <CardHeader>
              <CardTitle>Catering Order Settings</CardTitle>
              <CardDescription>
                Configure catering-specific requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cateringGroup ? (
                <form onSubmit={cateringForm.handleSubmit((data) => handleSaveSettings('CATERING_CONFIG', data))} className="space-y-4">
                  {renderSettingFields(cateringGroup)}
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  No catering settings found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Tab */}
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>Tax Configuration</CardTitle>
              <CardDescription>
                Manage Goods and Services Tax (GST) settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {taxGroup ? (
                <form onSubmit={taxForm.handleSubmit((data) => handleSaveSettings('TAX_CONFIG', data))} className="space-y-4">
                  {renderSettingFields(taxGroup)}
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  No tax settings found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

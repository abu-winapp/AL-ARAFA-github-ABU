/**
 * Al-Arafa Restaurant - Admin Settings API Service
 */

import apiClient from './client';
import type {
  GSTSettings,
  Location,
  AllSettings,
  LoyaltySettings,
  OrderSettings,
  CateringSettings,
  LookupDetail,
  SettingType,
  SettingGroup
} from '@/types';


// Settings Management


/**
 * Get all settings
 */
export async function getAllSettings(): Promise<AllSettings> {
  const response = await apiClient.get('/settings');
  return response.data.data;
}

/**
 * Get GST settings
 */
export async function getGSTSettings(): Promise<GSTSettings> {
  const response = await apiClient.get('/settings/gst');
  return response.data.data;
}

/**
 * Get loyalty settings
 */
export async function getLoyaltySettings(): Promise<LoyaltySettings> {
  const response = await apiClient.get('/settings/loyalty');
  return response.data.data;
}

/**
 * Get order settings
 */
export async function getOrderSettings(): Promise<OrderSettings> {
  const response = await apiClient.get('/settings/order');
  return response.data.data;
}

/**
 * Get catering settings
 */
export async function getCateringSettings(): Promise<CateringSettings> {
  const response = await apiClient.get('/settings/catering');
  return response.data.data;
}

/**
 * Update GST settings (admin)
 */
export async function updateGSTSettings(data: GSTSettings): Promise<GSTSettings> {
  const response = await apiClient.put('/admin/settings/gst', data);
  return response.data.data;
}

/**
 * Get platform settings
 */
export async function getPlatformSettings(): Promise<any> {
  const response = await apiClient.get('/settings/platform');
  return response.data.data;
}

/**
 * Update platform settings (admin)
 */
export async function updatePlatformSettings(data: any): Promise<any> {
  const response = await apiClient.put('/admin/settings/platform', data);
  return response.data.data;
}


// Lookup-based Settings API (New Structure)


/**
 * Default TAX_CONFIG settings if not returned by API
 */
const DEFAULT_TAX_SETTINGS: LookupDetail[] = [
  {
    id: 'temp-gst-rate',
    lookupMasterId: 'temp-tax-master',
    lookupCode: 'GST_RATE',
    displayValue: '9',
    description: 'GST rate in percentage',
    sortOrder: 1,
    isDefault: false,
    isActive: true,
    metadata: '{"type": "decimal"}',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lookupType: 'TAX_CONFIG'
  },
  {
    id: 'temp-gst-enabled',
    lookupMasterId: 'temp-tax-master',
    lookupCode: 'GST_ENABLED',
    displayValue: 'true',
    description: 'Enable or disable GST',
    sortOrder: 2,
    isDefault: false,
    isActive: true,
    metadata: '{"type": "boolean"}',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lookupType: 'TAX_CONFIG'
  }
];

/**
 * Get all settings (returns flat array from all types)
 * Fetches TAX_CONFIG separately since it's not included in the main endpoint
 */
export async function getAllSettingsV2(): Promise<LookupDetail[]> {
  const response = await apiClient.get('/admin/settings');

  // Handle different response structures
  const data = response.data?.data || response.data;

  let allSettings: LookupDetail[] = [];

  // Ensure we return an array
  if (Array.isArray(data)) {
    allSettings = data;
  } else if (data && typeof data === 'object') {
    // If data is an object with nested arrays, flatten them
    Object.values(data).forEach(value => {
      if (Array.isArray(value)) {
        allSettings.push(...value);
      }
    });
  }

  // Check if TAX_CONFIG exists in the response
  const hasTaxConfig = allSettings.some(setting =>
    setting.lookupType === 'TAX_CONFIG' ||
    (setting as any).type === 'TAX_CONFIG'
  );

  // If TAX_CONFIG is not included, fetch it separately
  if (!hasTaxConfig) {
    console.log('TAX_CONFIG not found in /admin/settings, fetching separately from /admin/settings/TAX_CONFIG');
    try {
      const taxSettings = await getSettingsByType('TAX_CONFIG');
      if (taxSettings.length > 0) {
        console.log('Successfully fetched TAX_CONFIG settings:', taxSettings);
        allSettings.push(...taxSettings);
      } else {
        console.warn('No TAX_CONFIG settings returned, using defaults');
        allSettings.push(...DEFAULT_TAX_SETTINGS);
      }
    } catch (err) {
      console.error('Failed to fetch TAX_CONFIG settings, using defaults:', err);
      allSettings.push(...DEFAULT_TAX_SETTINGS);
    }
  }

  if (allSettings.length === 0) {
    console.warn('getAllSettingsV2: No settings returned from API', response.data);
  }

  return allSettings;
}

/**
 * Get settings by type (returns array for that type)
 */
export async function getSettingsByType(type: SettingType): Promise<LookupDetail[]> {
  const response = await apiClient.get(`/admin/settings/${type}`);
  const data = response.data?.data || response.data;
  return Array.isArray(data) ? data : [];
}

/**
 * Helper to group settings by type for UI
 */
export function groupSettingsByType(settings: LookupDetail[]): SettingGroup[] {
  // Defensive check: ensure settings is an array
  if (!Array.isArray(settings)) {
    console.error('groupSettingsByType: settings is not an array', settings);
    return [];
  }

  const groups = new Map<SettingType, LookupDetail[]>();

  settings.forEach(setting => {
    // Handle different possible field names and normalize the type
    const type = (setting.lookupType || (setting as any).type || (setting as any).lookupMasterType) as SettingType;

    if (!type) {
      console.warn('Setting missing lookupType field:', setting);
      return;
    }

    // Normalize to uppercase (in case API returns lowercase)
    const normalizedType = type.toUpperCase() as SettingType;

    if (!groups.has(normalizedType)) {
      groups.set(normalizedType, []);
    }
    groups.get(normalizedType)!.push({...setting, lookupType: normalizedType});
  });

  // Sort settings within each group by sortOrder
  const result: SettingGroup[] = [];
  groups.forEach((settings, type) => {
    result.push({
      type,
      settings: settings.sort((a, b) => a.sortOrder - b.sortOrder)
    });
  });

  return result;
}

/**
 * Update single setting value
 */
export async function updateSettingValue(
  type: SettingType,
  code: string,
  displayValue: string
): Promise<LookupDetail> {
  const response = await apiClient.put(
    `/admin/settings/${type}/${code}`,
    { displayValue }
  );
  return response.data.data;
}

/**
 * Toggle setting active status
 */
export async function updateSettingStatus(
  settingId: string,
  isActive: boolean
): Promise<LookupDetail> {
  const response = await apiClient.put(
    `/admin/settings/detail/${settingId}/status`,
    { isActive }
  );
  return response.data.data;
}


// Locations Management (DEPRECATED - Not used in settings page)


/**
 * Get all locations
 * @deprecated Location management removed from settings page
 */
export async function getAllLocations(): Promise<Location[]> {
  const response = await apiClient.get('/locations');
  return response.data;
}

/**
 * Update location (admin)
 * @deprecated Location management removed from settings page
 */
export async function updateLocation(id: string, data: Partial<Location>): Promise<Location> {
  const response = await apiClient.put(`/admin/locations/${id}`, data);
  return response.data.data;
}

/**
 * Toggle location status (admin)
 * @deprecated Location management removed from settings page
 */
export async function toggleLocationStatus(id: string): Promise<Location> {
  const response = await apiClient.put(`/admin/locations/${id}/status`);
  return response.data.data;
}

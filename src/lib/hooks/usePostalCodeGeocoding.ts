/**
 * Al-Arafa Restaurant - Postal Code Geocoding Hook
 *
 * Custom hook for auto-populating address fields from postal code geocoding API
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { geocodePostalCode as geocodePostalCodeApi } from '@/lib/api/geocoding.service';

/**
 * Convert uppercase text to Pascal case (Title Case) for better readability
 * Example: "TOWNER ROAD" -> "Towner Road"
 */
function toPascalCase(text: string): string {
  if (!text) return text;

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface UsePostalCodeGeocodingProps {
  onAddressFound: (data: { addressLine1?: string; buildingName?: string; latitude?: number; longitude?: number }) => void;
}

interface UsePostalCodeGeocodingReturn {
  geocodePostalCode: (postalCode: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook to geocode Singapore postal codes and auto-populate address fields
 */
export function usePostalCodeGeocoding({
  onAddressFound,
}: UsePostalCodeGeocodingProps): UsePostalCodeGeocodingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastGeocodedPostalCodeRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    // Also reset the last geocoded postal code when clearing errors
    lastGeocodedPostalCodeRef.current = null;
  }, []);

  const geocodePostalCode = useCallback(
    async (postalCode: string) => {
      // Clear previous error
      setError(null);

      // Validate postal code format (6 digits)
      if (!/^\d{6}$/.test(postalCode)) {
        return;
      }

      // Skip API call if postal code hasn't changed from last geocoded value
      if (lastGeocodedPostalCodeRef.current === postalCode) {
        console.log('Postal code unchanged, skipping geocoding API call');
        return;
      }

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the API call (300ms)
      debounceTimerRef.current = setTimeout(async () => {
        try {
          setIsLoading(true);

          // Create new abort controller for this request
          abortControllerRef.current = new AbortController();

          // apiRequest unwraps the response, so we get GeocodingData directly
          const data = await geocodePostalCodeApi(postalCode);

          // Check if request was aborted
          if (abortControllerRef.current.signal.aborted) {
            return;
          }

          console.log('Geocoding response:', data); // Debug log

          // Check if geocoding was successful
          if (data.success) {
            // Store the successfully geocoded postal code
            lastGeocodedPostalCodeRef.current = postalCode;

            // Parse and invoke callback with populated data (convert to Pascal case)
            const addressData: { addressLine1?: string; buildingName?: string; latitude?: number; longitude?: number } = {};

            if (data.roadName) {
              addressData.addressLine1 = toPascalCase(data.roadName);
            }

            if (data.buildingName) {
              addressData.buildingName = toPascalCase(data.buildingName);
            }

            if (data.latitude) {
              addressData.latitude = data.latitude;
            }

            if (data.longitude) {
              addressData.longitude = data.longitude;
            }

            console.log('Auto-filling address data:', addressData); // Debug log
            onAddressFound(addressData);
          } else {
            // API returned error or postal code not found
            const errorMsg = data.errorMessage || 'Postal code not found. Please enter address manually.';
            setError(errorMsg);
            console.warn('Geocoding failed:', errorMsg);
          }
        } catch (err: any) {
          // Don't show error if request was aborted
          if (err.name === 'AbortError') {
            return;
          }

          console.error('Geocoding error:', err); // Always log errors

          // Handle different error types
          if (err.message?.toLowerCase().includes('not found') || err.message?.includes('404')) {
            setError('Postal code not found. Please enter address manually.');
          } else if (err.message?.toLowerCase().includes('network')) {
            setError('Unable to verify postal code. You can enter address manually.');
          } else {
            // Generic error - show user-friendly message
            setError('Unable to verify postal code. You can enter address manually.');
          }
        } finally {
          setIsLoading(false);
        }
      }, 300);
    },
    [onAddressFound]
  );

  return {
    geocodePostalCode,
    isLoading,
    error,
    clearError,
  };
}

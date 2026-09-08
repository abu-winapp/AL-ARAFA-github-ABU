'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  MapPin,
  Clock,
  Phone,
  Truck,
  Store,
  Pencil,
  Trash2,
  Plus,
  Search,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import {
  getAllLocations,
  createLocation,
  updateLocation,
  updateLocationStatus,
  deleteLocation,
} from '@/lib/api/admin-locations.service';
import { LocationForm, type LocationFormData } from '@/components/locations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import type { Location } from '@/types';

// Helper function to format time from "HH:mm:ss" to "HH:mm AM/PM"
function formatTime(time: string | undefined): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export default function LocationsPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, user } = useAuthStore();

  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load locations
  const loadLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllLocations();
      setLocations(data);
    } catch (err) {
      setError('Failed to load locations');
      toast.error('Failed to load locations');
      console.error('Error loading locations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auth guard and initial load
  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated || user?.userType !== 'admin') {
      router.push('/admin/login');
      return;
    }

    loadLocations();
  }, [isInitialized, isAuthenticated, user, router]);

  // Create or update location
  const handleSaveLocation = async (formData: LocationFormData) => {
    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, formData);
        toast.success('Location updated successfully');
      } else {
        await createLocation(formData);
        toast.success('Location created successfully');
      }
      setShowLocationDialog(false);
      setEditingLocation(null);
      loadLocations();
    } catch (error) {
      toast.error('Failed to save location');
      console.error('Error saving location:', error);
      throw error; // Re-throw to keep form loading state
    }
  };

  // Toggle location status
  const handleToggleStatus = async (location: Location) => {
    try {
      await updateLocationStatus(location.id, !location.isActive);
      toast.success(`Location ${!location.isActive ? 'activated' : 'deactivated'}`);
      loadLocations();
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  // Delete location
  const handleDelete = async () => {
    if (!locationToDelete) return;
    try {
      await deleteLocation(locationToDelete.id);
      toast.success('Location deleted');
      setLocationToDelete(null);
      loadLocations();
    } catch (error) {
      toast.error('Failed to delete location');
      console.error('Error deleting location:', error);
    }
  };

  // Edit location handler
  const handleEdit = (location: Location) => {
    setEditingLocation(location);
  };

  // Filter locations by search query
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations;

    const query = searchQuery.toLowerCase();
    return locations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query) ||
        loc.address.toLowerCase().includes(query) ||
        loc.postalCode.includes(query)
    );
  }, [locations, searchQuery]);

  // Loading state
  if (!isInitialized || (isLoading && locations.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Location Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage restaurant locations and their settings
              </p>
            </div>
            <Button onClick={() => setShowLocationDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, address, or postal code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg">
            <p className="text-error">{error}</p>
          </div>
        )}

        {/* Locations Grid */}
        {filteredLocations.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No locations found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Get started by adding your first location'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowLocationDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => (
              <Card key={location.id} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg truncate">{location.name}</CardTitle>
                    <button onClick={() => handleToggleStatus(location)}>
                      <Badge variant={location.isActive ? 'default' : 'secondary'}>
                        {location.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Address */}
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <p>{location.address}</p>
                      <p>Singapore {location.postalCode}</p>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span>
                      {formatTime(location.openingTime)} - {formatTime(location.closingTime)}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{location.phone}</span>
                  </div>

                  {/* Service Badges */}
                  <div className="flex gap-2 pt-2">
                    {location.acceptsDelivery && (
                      <Badge variant="outline" className="text-xs">
                        <Truck className="h-3 w-3 mr-1" /> Delivery
                      </Badge>
                    )}
                    {location.acceptsPickup && (
                      <Badge variant="outline" className="text-xs">
                        <Store className="h-3 w-3 mr-1" /> Self Collect
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(location)}>
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocationToDelete(location)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog
          open={showLocationDialog || !!editingLocation}
          onOpenChange={(open) => {
            if (!open) {
              setShowLocationDialog(false);
              setEditingLocation(null);
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? `Edit: ${editingLocation.name}` : 'Add New Location'}
              </DialogTitle>
            </DialogHeader>
            <LocationForm
              location={editingLocation || undefined}
              onSubmit={handleSaveLocation}
              onCancel={() => {
                setShowLocationDialog(false);
                setEditingLocation(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!locationToDelete} onOpenChange={() => setLocationToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Location</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{locationToDelete?.name}&quot;? This action
                cannot be undone and may affect existing orders.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-error hover:bg-error/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

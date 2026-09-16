/**
 * Al-Arafa Restaurant - Package Header Component
 * Display package metadata at top of page
 */

'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import type { MenuItem } from '@/types';

interface PackageHeaderProps {
  packageItem: MenuItem;
  onBack: () => void;
}

export function PackageHeader({ packageItem, onBack }: PackageHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Menu
      </Button>

      {/* Package info card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Package image */}
            <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
              {packageItem.imageUrl ? (
                <img
                  src={packageItem.imageUrl}
                  alt={packageItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl">🍱</span>
              )}
            </div>

            {/* Package details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{packageItem.name}</h1>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{packageItem.categoryName}</Badge>
                    {packageItem.menuType === 'catering' && (
                      <Badge className="bg-purple-100 text-purple-800">Catering</Badge>
                    )}
                    {packageItem.isCateringPackage && (
                      <Badge className="bg-indigo-100 text-indigo-800">Package</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    ${packageItem.price.toFixed(2)}
                  </div>
                  {packageItem.compareAtPrice && (
                    <div className="text-sm text-muted-foreground line-through">
                      ${packageItem.compareAtPrice.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground mb-3">{packageItem.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Serves:</span>
                  <span className="ml-2 font-medium">{packageItem.servesPeople || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Prep Time:</span>
                  <span className="ml-2 font-medium">{packageItem.preparationTimeMins} mins</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`ml-2 font-medium ${packageItem.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {packageItem.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Min Qty:</span>
                  <span className="ml-2 font-medium">{packageItem.minQuantity}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

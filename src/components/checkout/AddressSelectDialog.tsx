'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Plus, MapPin } from 'lucide-react';
import { AddressCard } from './AddressCard';
import type { UserAddress } from '@/types';

interface AddressSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addresses: UserAddress[];
  selectedAddressId: string | number | null;
  onSelectAddress: (address: UserAddress) => void;
  onAddNewAddress: () => void;
  onEditAddress?: (address: UserAddress) => void;
  onDeleteAddress?: (address: UserAddress) => void;
}

export function AddressSelectDialog({
  open,
  onOpenChange,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
  onEditAddress,
  onDeleteAddress,
}: AddressSelectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-5 sm:p-6 bg-[#FFFDF9] border border-[#EAE2D5] rounded-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-3 border-b border-[#F0EBE3]">
          <DialogTitle className="text-lg font-bold text-[#1C1613] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#95221C]" />
            <span>Select Delivery Address</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-[#8E8279]">
            Choose an address for your order delivery
          </DialogDescription>
        </DialogHeader>

        {/* Address List */}
        <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 my-1">
          {addresses.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#8E8279]">
              No saved addresses found.
            </div>
          ) : (
            addresses.map((addr) => {
              const isSelected = String(addr.id) === String(selectedAddressId);
              return (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  selected={isSelected}
                  onSelect={() => {
                    onSelectAddress(addr);
                    onOpenChange(false);
                  }}
                  onEdit={onEditAddress}
                  onDelete={onDeleteAddress}
                />
              );
            })
          )}
        </div>

        {/* Add Address CTA Button */}
        <div className="pt-3 border-t border-[#F0EBE3]">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onAddNewAddress();
            }}
            className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#D0C6B8] hover:border-[#95221C] bg-white hover:bg-[#FAF7F2] text-[#95221C] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


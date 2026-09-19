'use client';

import { FC } from 'react';
import type { UserAddress } from '@/types';
import { Home, Briefcase, MapPin, Check, Edit2, Trash2 } from 'lucide-react';

interface AddressCardProps {
  address: UserAddress;
  selected?: boolean;
  onSelect?: (address: UserAddress) => void;
  onEdit?: (address: UserAddress) => void;
  onDelete?: (address: UserAddress) => void;
  showActions?: boolean;
  userPhone?: string;
}

export const AddressCard: FC<AddressCardProps> = ({
  address,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const getLabelDisplay = () => {
    if (address.customLabel) return address.customLabel;
    if (address.label) {
      return address.label.charAt(0).toUpperCase() + address.label.slice(1);
    }
    return 'Address';
  };

  const getFullAddress = () => {
    const parts = [];
    if (address.unitNumber) parts.push(`#${address.unitNumber}`);
    if (address.buildingName) parts.push(address.buildingName);
    if (address.addressLine1) parts.push(address.addressLine1);
    if (address.addressLine2) parts.push(address.addressLine2);
    parts.push(`Singapore ${address.postalCode}`);
    return parts.join(', ');
  };

  const isHome = address.label?.toLowerCase() === 'home';
  const isWork = address.label?.toLowerCase() === 'work';

  return (
    <div
      {...(onSelect && { onClick: () => onSelect(address) })}
      className={`
        relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-all duration-200
        ${onSelect ? 'cursor-pointer' : ''}
        ${
          selected
            ? 'border-[#95221C] bg-[#FFFDF9] ring-1 ring-[#95221C] shadow-sm'
            : 'border-[#EAE2D5] bg-[#FFFFFF] hover:border-[#95221C]/40 hover:bg-[#FDFBF7]'
        }
      `}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              selected ? 'bg-[#95221C] text-white' : 'bg-[#FAF7F2] text-[#5C524B]'
            }`}
          >
            {isHome ? (
              <Home className="w-4 h-4" />
            ) : isWork ? (
              <Briefcase className="w-4 h-4" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-[#1C1613]">
                {getLabelDisplay()}
              </h4>
              {address.isDefault && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-[#FAF3E0] text-[#B88E34] px-1.5 py-0.5 rounded border border-[#F0DFBE]">
                  Default
                </span>
              )}
            </div>
            <p className="text-xs text-[#8E8279]">
              Singapore {address.postalCode}
            </p>
          </div>
        </div>

        {/* Selected Indicator */}
        {selected ? (
          <div className="w-5 h-5 rounded-full bg-[#95221C] text-white flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        ) : onSelect ? (
          <div className="w-5 h-5 rounded-full border border-[#D0C6B8] bg-transparent shrink-0" />
        ) : null}
      </div>

      {/* Address line */}
      <p className="text-xs sm:text-sm text-[#5C524B] leading-relaxed mb-4">
        {getFullAddress()}
      </p>

      {/* Actions */}
      {showActions && (onEdit || onDelete) && (
        <div className="flex items-center gap-3 pt-3 border-t border-[#F0EBE3] mt-auto">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(address);
              }}
              className="text-xs font-semibold text-[#5C524B] hover:text-[#95221C] flex items-center gap-1 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(address);
              }}
              className="text-xs font-semibold text-[#B3261E] hover:opacity-80 flex items-center gap-1 transition-colors ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

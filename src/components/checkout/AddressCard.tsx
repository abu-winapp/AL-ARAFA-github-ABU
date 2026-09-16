/**
 * Al-Arafa Restaurant - Address Card Component
 */

'use client';

import { FC } from 'react';
import type { UserAddress } from '@/types';
import clsx from 'clsx';

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

    // Add unit number if available
    if (address.unitNumber) {
      parts.push(`#${address.unitNumber}`);
    }

    // Add building name if available
    if (address.buildingName) {
      parts.push(address.buildingName);
    }

    // Add address lines
    if (address.addressLine1) {
      parts.push(address.addressLine1);
    }
    if (address.addressLine2) {
      parts.push(address.addressLine2);
    }

    // Add postal code
    parts.push(`Singapore ${address.postalCode}`);

    return parts.join(', ');
  };

  return (
    <div
      {...(onSelect && { onClick: () => onSelect(address) })}
      className={clsx(
        'bg-white rounded-xl p-5 border-2 transition-all h-full flex flex-col relative',
        onSelect && 'cursor-pointer',
        selected
          ? 'border-primary shadow-lg'
          : 'border-border-light hover:border-primary/50 shadow-md hover:shadow-lg'
      )}
    >
      {/* Default Badge - Top Right */}
      {address.isDefault && (
        <span className="absolute top-5 right-5 text-xs font-semibold bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
          DEFAULT
        </span>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className={clsx(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              selected ? 'bg-primary/10' : 'bg-background-gray'
            )}
          >
            <svg
              className={clsx('w-5 h-5', selected ? 'text-primary' : 'text-text-tertiary')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {address.label?.toLowerCase() === 'home' && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              )}
              {address.label?.toLowerCase() === 'work' && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              )}
              {(!address.label || address.label?.toLowerCase() === 'other') && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              )}
            </svg>
          </div>

          {/* Label */}
          <div>
            <h3 className="font-bold text-text-primary">{getLabelDisplay()}</h3>
            <p className="text-sm text-text-tertiary">Singapore {address.postalCode}</p>
          </div>
        </div>

        {/* Selection Indicator */}
        {selected && (
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Full Address */}
      <p className="text-text-secondary text-sm leading-relaxed">{getFullAddress()}</p>

      {/* Actions */}
      {showActions && (onEdit || onDelete) && (
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border-light">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(address);
              }}
              className="text-sm text-primary hover:text-primary-dark font-semibold flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(address);
              }}
              className="text-sm text-error hover:text-error/80 font-semibold flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

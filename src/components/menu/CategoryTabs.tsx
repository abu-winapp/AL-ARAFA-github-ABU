/**
 * Al-Arafa Restaurant - Category Tabs Component
 */

'use client';

import { FC } from 'react';
import type { Category } from '@/types';
import clsx from 'clsx';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoryTabs: FC<CategoryTabsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="bg-white border-b border-border-light sticky top-20 lg:top-24 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center overflow-x-auto scrollbar-hide py-4 gap-3">
          {/* All Items Tab */}
          <button
            onClick={() => onSelectCategory(null)}
            className={clsx(
              'px-6 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all flex-shrink-0',
              selectedCategoryId === null
                ? 'bg-primary text-white shadow-md'
                : 'bg-background-gray text-text-primary hover:bg-primary/10'
            )}
          >
            All Items
          </button>

          {/* Category Tabs */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={clsx(
                'px-6 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all flex-shrink-0',
                selectedCategoryId === category.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-background-gray text-text-primary hover:bg-primary/10'
              )}
            >
              {category.name}
              {category.itemCount !== undefined && category.itemCount > 0 && (
                <span className="ml-2 text-xs opacity-75">({category.itemCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

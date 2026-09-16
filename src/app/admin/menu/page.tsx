/**
 * Al-Arafa Restaurant - Admin Menu Management Page
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MenuItemForm } from '@/components/menu/MenuItemForm';
import { CategoryForm } from '@/components/menu/CategoryForm';
import { MenuItemSuggestionsDialog } from '@/components/menu/MenuItemSuggestionsDialog';
import { CompositeComponentsDialog } from '@/components/menu/CompositeComponentsDialog';
import type { MenuItem, Category } from '@/types';
import * as adminMenuService from '@/lib/api/admin-menu.service';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Leaf, Flame, Lightbulb, Package, Settings } from 'lucide-react';

type Tab = 'items' | 'categories';

export default function AdminMenuPage() {
  const router = useRouter();

  // Data state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<Tab>('items');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Delete confirmation state
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Suggestions dialog state
  const [managingSuggestionsFor, setManagingSuggestionsFor] = useState<MenuItem | null>(null);

  // Composite components dialog state
  const [managingComponentsFor, setManagingComponentsFor] = useState<MenuItem | null>(null);

  // Pagination state (client-side)
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedMenuType, setSelectedMenuType] = useState<string>('');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('');
  const [showVegetarianOnly, setShowVegetarianOnly] = useState(false);

  const { isAuthenticated, user, isInitialized } = useAuthStore();

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [items, cats] = await Promise.all([
        adminMenuService.getAllMenuItems(),
        adminMenuService.getAllCategories(),
      ]);

      setMenuItems(items);
      setCategories(cats);
    } catch (err: any) {
      console.error('Failed to load menu data:', err);
      const errorMessage = err?.response?.data?.message ||
                          err?.message ||
                          'Failed to load menu data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth to initialize before checking authentication
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated || user?.userType !== 'admin') {
      router.push('/admin/login');
      return;
    }

    loadData();
  }, [isAuthenticated, user, isInitialized, router]);

  // Client-side filtering
  const filteredItems = useMemo(() => {
    let filtered = [...menuItems];

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.categoryName?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.categoryId === selectedCategory);
    }

    // Menu type filter
    if (selectedMenuType) {
      filtered = filtered.filter(item => item.menuType === selectedMenuType);
    }

    // Availability filter
    if (selectedAvailability === 'available') {
      filtered = filtered.filter(item => item.isAvailable);
    } else if (selectedAvailability === 'unavailable') {
      filtered = filtered.filter(item => !item.isAvailable);
    }

    // Vegetarian filter
    if (showVegetarianOnly) {
      filtered = filtered.filter(item => item.isVegetarian);
    }

    return filtered;
  }, [menuItems, searchQuery, selectedCategory, selectedMenuType, selectedAvailability, showVegetarianOnly]);

  // Client-side pagination
  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const paginatedItems = filteredItems.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // Reset to page 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, selectedCategory, selectedMenuType, selectedAvailability, showVegetarianOnly]);

  // Handlers
  const handleToggleItemAvailability = async (id: string) => {
    try {
      await adminMenuService.toggleItemAvailability(id);
      await loadData();
      toast.success('Item availability updated');
    } catch (error) {
      console.error('Failed to update availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      await adminMenuService.deleteMenuItem(itemToDelete.id);
      await loadData();
      toast.success('Menu item deleted successfully');
      setItemToDelete(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const handleToggleCategoryStatus = async (id: string) => {
    try {
      await adminMenuService.toggleCategoryStatus(id);
      await loadData();
      toast.success('Category status updated');
    } catch (error) {
      console.error('Failed to update category status:', error);
      toast.error('Failed to update category status');
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await adminMenuService.deleteCategory(categoryToDelete.id);
      await loadData();
      toast.success('Category deleted successfully');
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleSaveItem = async (data: any) => {
    try {
      if (editingItem) {
        await adminMenuService.updateMenuItem(editingItem.id, data);
        toast.success('Menu item updated successfully');
      } else {
        await adminMenuService.createMenuItem(data);
        toast.success('Menu item created successfully');
      }
      setEditingItem(null);
      setShowItemDialog(false);
      await loadData();
    } catch (error: any) {
      console.error('Failed to save item:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to save menu item';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleSaveCategory = async (data: any) => {
    try {
      if (editingCategory) {
        await adminMenuService.updateCategory(editingCategory.id, data);
        toast.success('Category updated successfully');
      } else {
        await adminMenuService.createCategory(data);
        toast.success('Category created successfully');
      }
      setEditingCategory(null);
      setShowCategoryDialog(false);
      await loadData();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to save category';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Loading state
  if (isLoading && !menuItems.length && !categories.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading menu data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Menu Management</h1>
        <p className="text-muted-foreground">Manage menu items and categories</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Tab)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="items">
            Menu Items ({menuItems.length})
          </TabsTrigger>
          <TabsTrigger value="categories">
            Categories ({categories.length})
          </TabsTrigger>
        </TabsList>

        {/* Menu Items Tab */}
        <TabsContent value="items" className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={() => setShowItemDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={selectedCategory || undefined}
                onValueChange={(value) => setSelectedCategory(value || '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Menu Type Filter */}
            <div className="space-y-2">
              <Label>Menu Type</Label>
              <Select
                value={selectedMenuType || undefined}
                onValueChange={(value) => setSelectedMenuType(value || '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                </SelectContent>
              </Select>
              {selectedMenuType && (
                <button
                  onClick={() => setSelectedMenuType('')}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Availability Filter */}
            <div className="space-y-2">
              <Label>Availability</Label>
              <Select
                value={selectedAvailability || undefined}
                onValueChange={(value) => setSelectedAvailability(value || '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
              {selectedAvailability && (
                <button
                  onClick={() => setSelectedAvailability('')}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Vegetarian Filter */}
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="vegetarian-filter"
                checked={showVegetarianOnly}
                onCheckedChange={setShowVegetarianOnly}
              />
              <Label htmlFor="vegetarian-filter" className="cursor-pointer">
                Vegetarian only
              </Label>
            </div>
          </div>

          {/* Results Summary */}
          <div className="text-sm text-muted-foreground">
            Showing {paginatedItems.length} of {filteredItems.length} items
            {filteredItems.length !== menuItems.length && ` (filtered from ${menuItems.length} total)`}
          </div>

          {/* Items Table */}
          <div className="bg-card rounded-lg shadow overflow-hidden border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Item</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Attributes</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Available</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                        {searchQuery || selectedCategory || selectedMenuType || selectedAvailability || showVegetarianOnly
                          ? 'No items match your filters'
                          : 'No menu items yet. Add your first item to get started.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-2xl">🍛</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold truncate">{item.name}</div>
                              {item.shortDescription && (
                                <div className="text-xs text-muted-foreground truncate">{item.shortDescription}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {item.categoryName || categories.find((c) => c.id === item.categoryId)?.name || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold">
                            ${item.price.toFixed(2)}
                          </div>
                          {item.compareAtPrice && (
                            <div className="text-xs text-muted-foreground line-through">
                              ${item.compareAtPrice.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.menuType === 'catering'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.menuType === 'catering' ? 'Catering' : 'Regular'}
                            </span>
                            {item.isComposite && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <Package className="w-3 h-3 mr-1" />
                                Combo
                              </span>
                            )}
                            {item.isCateringPackage && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                <Settings className="w-3 h-3 mr-1" />
                                Package
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {item.isVegetarian && (
                              <div title="Vegetarian">
                                <Leaf className="w-4 h-4 text-green-600" />
                              </div>
                            )}
                            {item.isSpicy && (
                              <div className="flex items-center gap-1" title={`Spice level: ${item.spiceLevel}`}>
                                <Flame className="w-4 h-4 text-orange-600" />
                                <span className="text-xs text-orange-600">{item.spiceLevel}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Switch
                            checked={item.isAvailable}
                            onCheckedChange={() => handleToggleItemAvailability(item.id)}
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.isComposite && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setManagingComponentsFor(item)}
                                title="Manage Bundle Components"
                              >
                                <Package className="w-4 h-4" />
                              </Button>
                            )}
                            {item.isCateringPackage && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/admin/menu/packages/${item.id}`)}
                                title="Configure Package Options"
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setManagingSuggestionsFor(item)}
                              title="Manage Suggestions"
                            >
                              <Lightbulb className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingItem(item);
                                setShowItemDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setItemToDelete(item)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Categories</h2>
              <p className="text-sm text-muted-foreground">Manage menu categories</p>
            </div>
            <Button onClick={() => setShowCategoryDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No categories yet. Add your first category to get started.
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-card rounded-lg shadow border p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl mb-1 truncate">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                      )}
                    </div>
                    <Switch
                      checked={category.isActive}
                      onCheckedChange={() => handleToggleCategoryStatus(category.id)}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{category.itemCount || 0} items</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.menuType === 'catering'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {category.menuType === 'catering' ? 'Catering' : 'Regular'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setEditingCategory(category);
                        setShowCategoryDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCategoryToDelete(category)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Menu Item Dialog */}
      <Dialog
        open={showItemDialog || !!editingItem}
        onOpenChange={(open) => {
          if (!open) {
            setShowItemDialog(false);
            setEditingItem(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit Menu Item: ${editingItem.name}` : 'Add Menu Item'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the menu item details below.' : 'Fill in the details to create a new menu item.'}
            </DialogDescription>
          </DialogHeader>
          <MenuItemForm
            item={editingItem || undefined}
            categories={categories}
            onSubmit={handleSaveItem}
            onCancel={() => {
              setShowItemDialog(false);
              setEditingItem(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog
        open={showCategoryDialog || !!editingCategory}
        onOpenChange={(open) => {
          if (!open) {
            setShowCategoryDialog(false);
            setEditingCategory(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update the category details below.' : 'Fill in the details to create a new category.'}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            category={editingCategory || undefined}
            onSubmit={handleSaveCategory}
            onCancel={() => {
              setShowCategoryDialog(false);
              setEditingCategory(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Item Confirmation */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{itemToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{categoryToDelete?.name}&quot;? This action cannot be undone.
              {categoryToDelete && categoryToDelete.itemCount > 0 && (
                <span className="block mt-2 font-semibold text-destructive">
                  Warning: This category contains {categoryToDelete.itemCount} item(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Menu Item Suggestions Dialog */}
      {managingSuggestionsFor && (
        <MenuItemSuggestionsDialog
          menuItem={managingSuggestionsFor}
          allMenuItems={menuItems}
          open={!!managingSuggestionsFor}
          onOpenChange={(open) => !open && setManagingSuggestionsFor(null)}
        />
      )}

      {/* Composite Components Dialog */}
      {managingComponentsFor && managingComponentsFor.isComposite && (
        <CompositeComponentsDialog
          compositeItem={managingComponentsFor}
          allMenuItems={menuItems}
          open={!!managingComponentsFor}
          onOpenChange={(open) => !open && setManagingComponentsFor(null)}
        />
      )}
    </div>
  );
}

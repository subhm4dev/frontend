'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useProducts';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useLocations, useSellers, useAdjustStock } from '@/hooks/useInventory';
import { formatPrice } from '@ecom/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Admin Catalog Management Page
 * 
 * Manage categories and products with Enterprise design.
 */
export default function AdminCatalogPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const { data: categories } = useCategories();
  const { data: productsData } = useProducts({ page: 0, size: 50 });
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const adjustStockMutation = useAdjustStock();

  const products = productsData?.content || [];

  const handleCategorySubmit = async (data) => {
    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          categoryId: editingCategory.id,
          data,
        });
      } else {
        await createCategoryMutation.mutateAsync(data);
      }
      setShowCategoryForm(false);
      setEditingCategory(null);
    } catch (error) {
      alert('Failed to save category. Please try again.');
    }
  };

  const handleProductSubmit = async (data) => {
    try {
      let product;
      
      // Extract inventory data before submitting product
      const { locationId, inventoryQuantity, ...productData } = data;
      
      if (editingProduct) {
        product = await updateProductMutation.mutateAsync({
          productId: editingProduct.id,
          data: productData,
        });
      } else {
        product = await createProductMutation.mutateAsync(productData);
      }

      // If inventory should be created/connected, do it after product creation
      if (locationId && locationId !== 'none' && inventoryQuantity) {
        // Create or update inventory using the adjust stock API
        // The API uses 'delta' (change in quantity) not 'quantity' (absolute)
        // For initial stock, we set delta to the desired quantity
        try {
          await adjustStockMutation.mutateAsync({
            sku: product.sku,
            locationId: locationId,
            delta: parseInt(inventoryQuantity, 10),
            reason: 'INITIAL_STOCK',
            orderId: null,
          });
        } catch (inventoryError) {
          console.error('Failed to create inventory:', inventoryError);
          // Don't fail the product creation if inventory fails
          // Just log the error - admin can manually adjust inventory later
        }
      }

      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Product submission error:', error);
      alert('Failed to save product. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-neutral-900 mb-2 text-3xl font-semibold">Catalog Management</h1>
        <p className="text-neutral-600">Manage categories and products</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Categories</CardTitle>
                <Button
                  onClick={() => {
                    setEditingCategory(null);
                    setShowCategoryForm(true);
                  }}
                  className="bg-amber-700 hover:bg-amber-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showCategoryForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-6 bg-neutral-50 rounded-lg border border-neutral-200"
                >
                  <h2 className="text-neutral-900 mb-6 text-xl font-semibold">
                    {editingCategory ? 'Edit Category' : 'Create Category'}
                  </h2>
                  <CategoryForm
                    defaultValues={editingCategory}
                    categories={categories}
                    onSubmit={handleCategorySubmit}
                    onCancel={() => {
                      setShowCategoryForm(false);
                      setEditingCategory(null);
                    }}
                    isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  />
                </motion.div>
              )}

              <div className="space-y-3">
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg p-4 border border-neutral-200 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <h3 className="text-neutral-900 font-medium">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-neutral-500 mt-1">{category.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setEditingCategory(category);
                            setShowCategoryForm(true);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this category?')) {
                              deleteCategoryMutation.mutate(category.id);
                            }
                          }}
                          disabled={deleteCategoryMutation.isPending}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 border-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-neutral-500 text-center py-8">No categories found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Products</CardTitle>
                <Button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductForm(true);
                  }}
                  className="bg-amber-700 hover:bg-amber-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showProductForm && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-6 bg-neutral-50 rounded-lg border border-neutral-200"
                >
                  <h2 className="text-neutral-900 mb-6 text-xl font-semibold">
                    {editingProduct ? 'Edit Product' : 'Create Product'}
                  </h2>
                  <ProductForm
                    defaultValues={editingProduct}
                    categories={categories}
                    onSubmit={handleProductSubmit}
                    onCancel={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                    isLoading={createProductMutation.isPending || updateProductMutation.isPending || adjustStockMutation.isPending}
                  />
                </motion.div>
              )}

              <div className="space-y-4">
                {products.length > 0 ? (
                  products.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg p-4 border border-neutral-200 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg flex-shrink-0 overflow-hidden">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-neutral-900 font-medium">{product.name}</h3>
                          <p className="text-sm text-neutral-500">SKU: {product.sku || 'N/A'}</p>
                          <p className="text-lg font-semibold text-neutral-900 mt-1">
                            {formatPrice(product.price, product.currency || 'INR')}
                          </p>
                          <span
                            className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${
                              product.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            {product.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => router.push(`/products/${product.id}`)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowProductForm(true);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this product?')) {
                              deleteProductMutation.mutate(product.id);
                            }
                          }}
                          disabled={deleteProductMutation.isPending}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 border-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-neutral-500 text-center py-8">No products found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

// Category Form Component
function CategoryForm({ defaultValues, categories, onSubmit, onCancel, isLoading }) {
  const [name, setName] = useState(defaultValues?.name || '');
  const [description, setDescription] = useState(defaultValues?.description || '');
  const [parentId, setParentId] = useState(defaultValues?.parentId ? defaultValues.parentId : 'none');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      description: description || undefined,
      parentId: parentId === 'none' ? undefined : parentId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category-name">
          Category Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="category-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="category-description">Description</Label>
        <textarea
          id="category-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
        />
      </div>

      <div>
        <Label htmlFor="category-parent">Parent Category (for subcategories)</Label>
        <Select value={parentId} onValueChange={setParentId}>
          <SelectTrigger id="category-parent">
            <SelectValue placeholder="None (Top-level category)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (Top-level category)</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-amber-700 hover:bg-amber-800"
        >
          {isLoading ? 'Saving...' : 'Save Category'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            variant="outline"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

// Product Form Component
function ProductForm({ defaultValues, categories, onSubmit, onCancel, isLoading }) {
  const [name, setName] = useState(defaultValues?.name || '');
  const [sku, setSku] = useState(defaultValues?.sku || '');
  const [description, setDescription] = useState(defaultValues?.description || '');
  const [price, setPrice] = useState(defaultValues?.price || '');
  const [categoryId, setCategoryId] = useState(defaultValues?.categoryId ? defaultValues.categoryId : 'none');
  const [status, setStatus] = useState(defaultValues?.status || 'ACTIVE');
  const [images, setImages] = useState(defaultValues?.images?.join(', ') || '');
  
  // New fields for seller, location, and inventory
  const [sellerId, setSellerId] = useState(defaultValues?.sellerId ? defaultValues.sellerId : 'none');
  const [locationId, setLocationId] = useState(defaultValues?.locationId ? defaultValues.locationId : 'none');
  const [inventoryQuantity, setInventoryQuantity] = useState(defaultValues?.inventoryQuantity || '');
  const [createInventory, setCreateInventory] = useState(false);

  // Fetch sellers and locations from API
  const { data: sellersData = [] } = useSellers();
  const { data: locationsData = [] } = useLocations();

  // Transform sellers data to match expected format
  const sellers = Array.isArray(sellersData) ? sellersData.map(seller => ({
    id: seller.id || seller.userId,
    name: seller.fullName || seller.name || seller.email || 'Unknown',
    email: seller.email || '',
  })) : [];

  // Transform locations data to match expected format
  const locations = Array.isArray(locationsData) ? locationsData.map(location => ({
    id: location.id || location.locationId,
    name: location.name || 'Unnamed Location',
    address: location.address || `${location.line1 || ''} ${location.city || ''} ${location.state || ''}`.trim() || 'No address',
  })) : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = {
      name,
      sku,
      description: description || undefined,
      price: parseFloat(price),
      categoryId: categoryId === 'none' ? undefined : categoryId,
      status,
      images: images ? images.split(',').map((url) => url.trim()).filter(Boolean) : [],
    };

    // Add sellerId if selected
    if (sellerId !== 'none') {
      productData.sellerId = sellerId;
    }

    // Add location and inventory data if creating inventory
    if (createInventory && locationId !== 'none' && inventoryQuantity) {
      productData.locationId = locationId;
      productData.inventoryQuantity = parseInt(inventoryQuantity, 10);
    }

    onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="product-name">
            Product Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="product-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="product-sku">
            SKU <span className="text-red-500">*</span>
          </Label>
          <Input
            id="product-sku"
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="product-description">Description</Label>
        <textarea
          id="product-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="product-price">
            Price <span className="text-red-500">*</span>
          </Label>
          <Input
            id="product-price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="product-category">Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="product-category">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select Category</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="product-status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="product-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="DELETED">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="product-images">Image URLs (comma-separated)</Label>
          <Input
            id="product-images"
            type="text"
            value={images}
            onChange={(e) => setImages(e.target.value)}
            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          />
        </div>
      </div>

      {/* Seller Selection */}
      <div>
        <Label htmlFor="product-seller">Seller</Label>
        <Select value={sellerId} onValueChange={setSellerId}>
          <SelectTrigger id="product-seller">
            <SelectValue placeholder="Select Seller" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Seller</SelectItem>
            {sellers.map((seller) => (
              <SelectItem key={seller.id} value={seller.id}>
                {seller.name} ({seller.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-neutral-500 mt-1">
          Select a seller to associate this product with, or leave as "No Seller" for marketplace products
        </p>
      </div>

      {/* Inventory Section */}
      <div className="border-t border-neutral-200 pt-4">
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="create-inventory"
            checked={createInventory}
            onChange={(e) => setCreateInventory(e.target.checked)}
            className="w-4 h-4 text-amber-700 border-neutral-300 rounded focus:ring-amber-700"
          />
          <Label htmlFor="create-inventory" className="font-medium cursor-pointer">
            Create or Connect Inventory
          </Label>
        </div>

        {createInventory && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-amber-200">
            <div>
              <Label htmlFor="inventory-location">Location</Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger id="inventory-location">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Location</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} - {location.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="inventory-quantity">
                Initial Stock Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="inventory-quantity"
                type="number"
                min="0"
                step="1"
                value={inventoryQuantity}
                onChange={(e) => setInventoryQuantity(e.target.value)}
                placeholder="0"
                required={createInventory}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Set the initial stock quantity for this product at the selected location
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-amber-700 hover:bg-amber-800"
        >
          {isLoading ? 'Saving...' : 'Save Product'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            variant="outline"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

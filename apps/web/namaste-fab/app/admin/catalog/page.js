'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useProducts';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { formatPrice } from '@ecom/utils';

/**
 * Admin Catalog Management Page
 * 
 * Manage categories, subcategories, and products.
 */
export default function AdminCatalogPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products'); // 'categories' or 'products'
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
      
    }
  };

  const handleProductSubmit = async (data) => {
    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          productId: editingProduct.id,
          data,
        });
      } else {
        await createProductMutation.mutateAsync(data);
      }
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light text-gray-900">Catalog Management</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'categories'
              ? 'text-amber-900 border-b-2 border-amber-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'products'
              ? 'text-amber-900 border-b-2 border-amber-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Products
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryForm(true);
                }}
                className="px-4 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium"
              >
                + Add Category
              </button>
            </div>

            {showCategoryForm && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                <h2 className="text-xl font-light text-gray-900 mb-6">
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </h2>
                <CategoryForm
                  defaultValues={editingCategory}
                  onSubmit={handleCategorySubmit}
                  onCancel={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                  }}
                  isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                />
              </div>
            )}

            <div className="space-y-3">
              {categories?.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                    )}
                    {category.parentId && (
                      <p className="text-xs text-gray-400 mt-1">Subcategory of: {category.parentId}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setShowCategoryForm(true);
                      }}
                      className="px-4 py-2 text-sm text-amber-900 hover:text-amber-800 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this category?')) {
                          deleteCategoryMutation.mutate(category.id);
                        }
                      }}
                      disabled={deleteCategoryMutation.isPending}
                      className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <motion.div
            key="products"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
                className="px-4 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition-colors font-medium"
              >
                + Add Product
              </button>
            </div>

            {showProductForm && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                <h2 className="text-xl font-light text-gray-900 mb-6">
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
                  isLoading={createProductMutation.isPending || updateProductMutation.isPending}
                />
              </div>
            )}

            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-lg flex-shrink-0"></div>
                    <div>
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {formatPrice(product.price, product.currency)}
                      </p>
                      <span
                        className={`inline-block mt-2 px-2 py-0.5 text-xs rounded ${
                          product.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/products/${product.id}`)}
                      className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowProductForm(true);
                      }}
                      className="px-4 py-2 text-sm text-amber-900 hover:text-amber-800 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this product?')) {
                          deleteProductMutation.mutate(product.id);
                        }
                      }}
                      disabled={deleteProductMutation.isPending}
                      className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Category Form Component
function CategoryForm({ defaultValues, onSubmit, onCancel, isLoading }) {
  const [name, setName] = useState(defaultValues?.name || '');
  const [description, setDescription] = useState(defaultValues?.description || '');
  const [parentId, setParentId] = useState(defaultValues?.parentId || '');

  const { data: categories } = useCategories();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      description: description || undefined,
      parentId: parentId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Parent Category (for subcategories)
        </label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
        >
          <option value="">None (Top-level category)</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-amber-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Category'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
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
  const [categoryId, setCategoryId] = useState(defaultValues?.categoryId || '');
  const [status, setStatus] = useState(defaultValues?.status || 'ACTIVE');
  const [images, setImages] = useState(defaultValues?.images?.join(', ') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      sku,
      description: description || undefined,
      price: parseFloat(price),
      categoryId: categoryId || undefined,
      status,
      images: images ? images.split(',').map((url) => url.trim()).filter(Boolean) : [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
          >
            <option value="">Select Category</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DELETED">Deleted</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URLs (comma-separated)
          </label>
          <input
            type="text"
            value={images}
            onChange={(e) => setImages(e.target.value)}
            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-amber-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Product'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}


'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useAddToCart, useCart } from '@/hooks/useCart';
import { ProductCard } from '@ecom/components';
import { Header } from '@/components/Header';
import { FilterSidebar } from '@/components/FilterSidebar';
import { Footer } from '@/components/Footer';
import { QuickLookModal } from '@/components/QuickLookModal';

/**
 * Catalog Page
 * 
 * Full product catalog with:
 * - Filter sidebar
 * - Product grid with pagination
 * - Search functionality
 * - Responsive design
 */

export default function CatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { openLogin } = useAuthModal();
  const { data: cart } = useCart({ enabled: isAuthenticated });
  
  // Filter state
  const [filters, setFilters] = useState({
    price: null,
    categories: [],
    colors: [],
    fabrics: [],
  });

  // Search query state - initialize from URL params
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize search query from URL params
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam));
    }
  }, [searchParams]);

  // Pagination state (backend uses 0-indexed pages)
  const [currentPage, setCurrentPage] = useState(0);
  const [productsPerPage] = useState(12);

  // Filter sidebar state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Quick Look Modal state
  const [quickLookProduct, setQuickLookProduct] = useState(null);

  // Build API params from filters and pagination
  const apiParams = useMemo(() => {
    const params = {
      page: currentPage,
      size: productsPerPage,
    };

    // Add search query
    if (searchQuery) {
      params.query = searchQuery;
    }

    // Add category filter (if any selected)
    if (filters.categories && filters.categories.length > 0) {
      params.categoryId = filters.categories[0]; // Backend supports single category for now
    }

    // Add price filter
    if (filters.price) {
      const [min, max] = filters.price.split('-').map(Number);
      params.minPrice = min;
      if (max !== Infinity) {
        params.maxPrice = max;
      }
    }

    return params;
  }, [currentPage, productsPerPage, searchQuery, filters]);

  // Fetch products from API
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts(apiParams);
  
  // Fetch categories for filter sidebar
  const { data: categoriesData } = useCategories();

  // Add to cart mutation
  const addToCartMutation = useAddToCart();

  // Extract products from API response
  const products = useMemo(() => {
    if (!productsData?.content) return [];
    return productsData.content.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: null,
      image: product.images?.[0] || null,
      discount: 0,
      inStock: product.status === 'ACTIVE',
      isNew: false,
      category: product.categoryName || product.category?.name,
      fabric: product.fabric,
      region: product.region,
    }));
  }, [productsData]);

  // Pagination info from API
  const totalPages = productsData?.totalPages || 0;
  const totalProducts = productsData?.totalElements || 0;

  // Current products are already paginated by backend
  const currentProducts = products;

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'clear') {
      setFilters({
        price: null,
        categories: [],
        colors: [],
        fabrics: [],
      });
      setSearchQuery('');
      setCurrentPage(0);
    } else {
      setFilters((prev) => ({
        ...prev,
        [filterType]: value,
      }));
      setCurrentPage(0);
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(0);
    // Update URL with search query
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    router.push(`/catalog?${params.toString()}`);
  };

  // Handle add to cart
  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    
    try {
      await addToCartMutation.mutateAsync({
        productId,
        quantity: 1,
      });
    } catch (error) {
      // Error feedback could be shown via toast notification
    }
  };

  // Handle product click
  const handleProductClick = (productId) => {
    router.push(`/products/${productId}`);
  };

  // Handle Quick Look
  const handleQuickLook = (product) => {
    setQuickLookProduct(product);
  };

  // Close Quick Look Modal
  const closeQuickLook = () => {
    setQuickLookProduct(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <Header 
        onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />

      {/* Main Content - Product Catalog */}
      <main className="container mx-auto px-4 py-12 lg:py-16 flex-1">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
          />

          {/* Product Catalog */}
          <div className="flex-1 min-w-0">
            {/* Catalog Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mb-8 flex items-center justify-between"
            >
              <div>
                <h1 className="text-3xl font-semibold text-neutral-900 mb-1">
                  Our Collection
                </h1>
                <motion.p
                  key={totalProducts}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-neutral-500"
                >
                  {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
                </motion.p>
              </div>

              {/* Sort Options */}
              <motion.select
                whileHover={{ scale: 1.05 }}
                className="text-sm text-neutral-600 border-0 bg-transparent cursor-pointer focus:outline-none hover:text-neutral-900"
              >
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </motion.select>
            </motion.div>

            {/* Loading State */}
            {productsLoading && (
              <div className="text-center py-24">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
                <p className="mt-4 text-neutral-500">Loading products...</p>
              </div>
            )}

            {/* Error State */}
            {productsError && !productsLoading && (
              <div className="text-center py-24">
                <p className="text-red-600 mb-4">Failed to load products</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-amber-700 hover:text-amber-800 transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Product Grid */}
            {!productsLoading && !productsError && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`page-${currentPage}-${JSON.stringify(filters)}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ willChange: 'opacity' }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16"
                >
                  {currentProducts.map((product, index) => {
                    // Check if product is in cart
                    const isInCart = cart?.items?.some(
                      (item) => item.productId === product.id
                    ) || false;
                    
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                        isInCart={isInCart}
                        onAddToCart={handleAddToCart}
                        onProductClick={handleProductClick}
                        onQuickLook={handleQuickLook}
                      />
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Pagination */}
            {totalPages > 1 && !productsLoading && (
              <div className="flex justify-center items-center gap-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ←
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i).map((page) => {
                    const displayPage = page + 1;
                    if (
                      page === 0 ||
                      page === totalPages - 1 ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm transition-colors ${
                            currentPage === page
                              ? 'text-amber-700 font-medium'
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          {displayPage}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-neutral-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  →
                </button>
              </div>
            )}

            {/* Empty State */}
            {!productsLoading && !productsError && currentProducts.length === 0 && (
              <div className="text-center py-24">
                <p className="text-neutral-400 mb-4">No products found</p>
                <button
                  onClick={() => handleFilterChange('clear', null)}
                  className="text-sm text-amber-700 hover:text-amber-800 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Quick Look Modal */}
      <QuickLookModal
        product={quickLookProduct}
        isOpen={!!quickLookProduct}
        onClose={closeQuickLook}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}


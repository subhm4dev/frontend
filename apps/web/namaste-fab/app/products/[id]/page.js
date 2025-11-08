'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useAddToCart, useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthModal } from '@/hooks/useAuthModal';
import { formatPrice } from '@ecom/utils';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@ecom/components';

/**
 * Product Detail Page
 * 
 * Displays full product information with:
 * - Image gallery
 * - Product details
 * - Add to cart functionality
 * - Related products
 */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;
  
  const { isAuthenticated } = useAuthStore();
  const { openLogin } = useAuthModal();
  const { data: product, isLoading, error } = useProduct(productId);
  const { data: relatedProductsData } = useProducts({ page: 0, size: 4 });
  const { data: cart } = useCart({ enabled: isAuthenticated });
  const addToCartMutation = useAddToCart();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Check if current product is in cart
  const isProductInCart = cart?.items?.some(
    (item) => item.productId === productId
  ) || false;

  // Extract related products
  const relatedProducts = relatedProductsData?.content
    ?.filter((p) => p.id !== productId)
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: null,
      image: p.images?.[0] || null,
      discount: 0,
      inStock: p.status === 'ACTIVE',
      isNew: false,
    })) || [];

  const images = product?.images || [];
  const currentImage = images[selectedImageIndex] || null;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity,
      });
      // Success - could show toast notification
    } catch (error) {
      
      // Error - could show toast notification
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
          <p className="mt-4 text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Product not found</p>
          <button
            onClick={() => router.push('/')}
            className="text-amber-900 hover:text-amber-800 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #fef9f3 0%, #ffffff 50%, #fef9f3 100%)',
      }}
    >
      <Header />

      <main className="container mx-auto px-4 py-12 lg:py-16">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-600">
          <button onClick={() => router.push('/')} className="hover:text-amber-900 transition-colors">
            Home
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Product</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="aspect-square bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-xl overflow-hidden"
            >
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </motion.div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? 'border-amber-900'
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Product Name */}
            <h1 className="text-3xl lg:text-4xl font-light text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-gray-900">
                {formatPrice(product.price, product.currency || 'INR')}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* SKU */}
            {product.sku && (
              <div className="text-sm text-gray-500">
                SKU: <span className="font-mono">{product.sku}</span>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  −
                </button>
                <span className="px-4 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: isProductInCart ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.status !== 'ACTIVE' || isProductInCart}
              className={`w-full font-medium py-3.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                isProductInCart 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-amber-900 text-white hover:bg-amber-800'
              }`}
            >
              {isAddingToCart 
                ? 'Adding to Cart...' 
                : isProductInCart 
                  ? '✓ In Cart' 
                  : product.status === 'ACTIVE' 
                    ? 'Add to Cart' 
                    : 'Out of Stock'}
            </motion.button>

            {/* Status Badge */}
            {product.status !== 'ACTIVE' && (
              <div className="text-sm text-red-600">
                This product is currently unavailable.
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-light text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct, index) => {
                // Check if related product is in cart
                const isRelatedInCart = cart?.items?.some(
                  (item) => item.productId === relatedProduct.id
                ) || false;
                
                return (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                    index={index}
                    isInCart={isRelatedInCart}
                    onAddToCart={(id) => {
                      if (!isAuthenticated) {
                        openLogin();
                        return;
                      }
                      addToCartMutation.mutate({ productId: id, quantity: 1 });
                    }}
                    onProductClick={(id) => router.push(`/products/${id}`)}
                  />
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </motion.div>
  );
}


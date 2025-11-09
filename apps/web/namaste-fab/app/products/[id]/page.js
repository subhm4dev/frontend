'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Zap, Heart, Share2, Truck, Shield, RefreshCw } from 'lucide-react';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useAddToCart, useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthModal } from '@/hooks/useAuthModal';
import { formatPrice } from '@ecom/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { EnterpriseProductCard } from '@/components/EnterpriseProductCard';

/**
 * Product Detail Page - Enterprise Design
 * 
 * Matches Enterprise ProductDetailsPage design while preserving all functionality
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
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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
      images: p.images || [],
      category: p.categoryName || p.category?.name,
      fabric: p.fabric,
      region: p.region,
    })) || [];

  const images = product?.images || [];
  const currentImage = images[selectedImageIndex] || product?.images?.[0] || null;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity: 1,
      });
      // Success - could show toast notification
    } catch (error) {
      // Error - could show toast notification
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity: 1,
      });
      router.push('/cart');
    } catch (error) {
      // Error - could show toast notification
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleProductClick = (productId) => {
    router.push(`/products/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            <p className="mt-4 text-neutral-500">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Product not found</p>
            <Button onClick={() => router.push('/')} variant="outline">
            Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate discount if originalPrice exists
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 mb-4 group cursor-zoom-in"
              onMouseEnter={() => setIsImageZoomed(true)}
              onMouseLeave={() => setIsImageZoomed(false)}
            >
              {currentImage ? (
                <motion.img
                  key={selectedImageIndex}
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, scale: isImageZoomed ? 1.5 : 1 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                  <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {/* Wishlist Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <Heart className="w-5 h-5 text-neutral-700" />
              </motion.button>
            </motion.div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-amber-600' : 'border-neutral-200'
                    }`}
                  >
                    <img src={image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Breadcrumb */}
            <div className="text-sm text-neutral-500 mb-4">
              <button onClick={() => router.push('/')} className="hover:text-amber-700 transition-colors">
                Home
              </button>
              {product.region && (
                <>
                  <span className="mx-2">/</span>
                  <span>{product.region}</span>
                </>
              )}
              {product.categoryName && (
                <>
                  <span className="mx-2">/</span>
                  <span>{product.categoryName}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-neutral-900 mb-4 text-3xl font-semibold">{product.name}</h1>

            {/* Region Badge */}
            {(product.region || product.categoryName) && (
              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-sm mb-4">
                <span className="w-2 h-2 bg-amber-600 rounded-full" />
                {product.region || product.categoryName} Handloom
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-neutral-900 text-2xl font-semibold">
                {formatPrice(product.price, product.currency || 'INR')}
              </span>
              {product.originalPrice && discountPercent && (
                <>
                  <span className="text-neutral-400 line-through">
                    {formatPrice(product.originalPrice, product.currency || 'INR')}
                  </span>
                  <span className="text-green-600 text-sm font-medium">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-neutral-900 mb-2 font-semibold">Description</h3>
                <p className="text-neutral-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {product.fabric && (
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="text-sm text-neutral-500 mb-1">Fabric</div>
                  <div className="text-neutral-900 font-medium">{product.fabric}</div>
                </div>
              )}
              {product.categoryName && (
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="text-sm text-neutral-500 mb-1">Category</div>
                  <div className="text-neutral-900 font-medium">{product.categoryName}</div>
                </div>
              )}
            </div>

            {/* Care Instructions */}
            {product.careInstructions && (
              <div className="bg-amber-50 p-4 rounded-lg mb-6">
                <h4 className="text-neutral-900 text-sm mb-2 font-semibold">Care Instructions</h4>
                <p className="text-neutral-700 text-sm">{product.careInstructions}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="lg"
                className="flex-1 border-2 border-neutral-300 hover:border-amber-600 hover:bg-amber-50 hover:text-amber-700"
                disabled={isAddingToCart || product.status !== 'ACTIVE'}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button
                onClick={handleBuyNow}
                size="lg"
                className="flex-1 bg-amber-700 hover:bg-amber-800"
                disabled={isAddingToCart || product.status !== 'ACTIVE'}
              >
                <Zap className="w-5 h-5 mr-2" />
                Buy Now
              </Button>
            </div>

            {/* Share Button */}
            <Button variant="ghost" size="sm" className="w-full mb-6">
              <Share2 className="w-4 h-4 mr-2" />
              Share this product
            </Button>

            <Separator className="mb-6" />

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-neutral-900 text-sm font-medium">Free Shipping</div>
                  <div className="text-neutral-500 text-xs">On orders above ₹999</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-neutral-900 text-sm font-medium">Authentic Guarantee</div>
                  <div className="text-neutral-500 text-xs">100% genuine handloom</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-neutral-900 text-sm font-medium">Easy Returns</div>
                  <div className="text-neutral-500 text-xs">7 days return policy</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-neutral-900 mb-8 text-3xl font-semibold">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <EnterpriseProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  onProductClick={handleProductClick}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

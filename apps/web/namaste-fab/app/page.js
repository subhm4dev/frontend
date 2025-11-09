'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useProducts } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';
import { EnterpriseProductCard } from '@/components/EnterpriseProductCard';

/**
 * Home Page
 * 
 * Main homepage featuring:
 * - Hero section
 * - Featured Collection
 * - Newest Arrivals
 * - Bestsellers
 * - Trust Section
 */

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { openLogin } = useAuthModal();
  
  // Fetch featured products for hero and sections (first page, 6 products)
  const { data: featuredProductsData } = useProducts({ page: 0, size: 6 });

  // Add to cart mutation
  const addToCartMutation = useAddToCart();

  // Extract featured products for hero and sections
  const featuredProducts = useMemo(() => {
    if (!featuredProductsData?.content) return [];
    return featuredProductsData.content.slice(0, 6).map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: null,
      image: product.images?.[0] || null,
      images: product.images || [],
      category: product.categoryName || product.category?.name,
      fabric: product.fabric,
      region: product.region,
    }));
  }, [featuredProductsData]);

  // Featured products (first 6)
  const featuredCollection = featuredProducts.slice(0, 6);

  // Newest arrivals (same as featured for now, can be sorted by dateAdded if available)
  const newestArrivals = featuredProducts.slice(0, 6);
  
  // Bestsellers (same as featured for now, can be filtered by isBestseller if available)
  const bestsellers = featuredProducts.slice(0, 6);

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

  // Handle buy now
  const handleBuyNow = async (productId) => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    
    try {
      await addToCartMutation.mutateAsync({
        productId,
        quantity: 1,
      });
      router.push('/cart');
    } catch (error) {
      // Error feedback could be shown via toast notification
    }
  };

  // Handle search (for header)
  const handleSearch = (query) => {
    router.push(`/catalog?search=${encodeURIComponent(query)}`);
  };


  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <Header 
        onSearch={handleSearch}
      />

      {/* Hero Section */}
      <Hero featuredProducts={featuredProducts} />

      {/* Featured Collection */}
      {featuredCollection.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-neutral-900 mb-4 text-3xl font-semibold">Featured Collection</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Handpicked selection of our finest sarees, curated for their exceptional beauty and craftsmanship
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCollection.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <EnterpriseProductCard
                  product={product}
                  onProductClick={handleProductClick}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Newest Arrivals */}
      {newestArrivals.length > 0 && (
        <section className="bg-neutral-100 py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-neutral-900 mb-4 text-3xl font-semibold">Newest Arrivals</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Discover our latest additions - fresh designs and timeless classics
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newestArrivals.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EnterpriseProductCard
                        product={product}
                    onProductClick={handleProductClick}
                        onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                      />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
            )}

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-neutral-900 mb-4 text-3xl font-semibold">Bestsellers</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Customer favorites - the most loved sarees from our collection
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bestsellers.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                        >
                <EnterpriseProductCard
                  product={product}
                  onProductClick={handleProductClick}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              </motion.div>
            ))}
                </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="bg-neutral-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Authentic Handloom',
                description: 'Every saree is certified handwoven by master artisans',
              },
              {
                title: 'Direct from Weavers',
                description: 'Supporting local communities and traditional crafts',
              },
              {
                title: 'Premium Quality',
                description: 'Carefully curated for the finest materials and finish',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50"
              >
                <h3 className="text-neutral-900 mb-2 font-semibold text-lg">{item.title}</h3>
                <p className="text-neutral-600 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

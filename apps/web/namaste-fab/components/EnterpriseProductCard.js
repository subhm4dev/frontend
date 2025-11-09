'use client';

import { motion } from 'motion/react';
import { ShoppingCart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Enterprise ProductCard Component
 * 
 * Matches Enterprise design exactly while preserving functionality
 */

export function EnterpriseProductCard({ product, onProductClick, onAddToCart, onBuyNow }) {
  const handleProductClick = () => {
    if (onProductClick) {
      // If product is an object with id, pass the id, otherwise pass the product
      if (typeof onProductClick === 'function') {
        if (product?.id) {
          onProductClick(product.id);
        } else {
          onProductClick(product);
        }
      }
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (onAddToCart && product?.id) {
      onAddToCart(product.id);
    }
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (onBuyNow && product?.id) {
      onBuyNow(product.id);
    }
  };

  // Get product image - support both image and images array
  const productImage = product?.image || product?.images?.[0] || '/namastefab.png';
  
  // Calculate discount if originalPrice exists
  const discountPercent = product?.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative overflow-hidden aspect-[3/4]" onClick={handleProductClick}>
        <motion.img
          src={productImage}
          alt={product?.name || 'Product'}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Discount Badge */}
        {discountPercent && discountPercent > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium"
          >
            {discountPercent}% OFF
          </motion.div>
        )}

        {/* Region/Category Badge */}
        {(product?.region || product?.category) && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-neutral-700 font-medium">
            {product.region || product.category}
          </div>
        )}

        {/* Quick View Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center"
        >
          <motion.p
            initial={{ y: 10 }}
            whileHover={{ y: 0 }}
            className="text-white text-sm font-medium"
          >
            Click to view details
          </motion.p>
        </motion.div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-neutral-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors font-medium">
          {product?.name || 'Product Name'}
        </h3>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-neutral-900 font-semibold">₹{product?.price?.toLocaleString('en-IN') || '0'}</span>
          {product?.originalPrice && (
            <span className="text-neutral-400 line-through text-sm">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {(product?.fabric || product?.category) && (
          <div className="text-xs text-neutral-500 mb-3">
            {product.fabric ? `${product.fabric} • ` : ''}{product.category || ''}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleAddToCart}
            variant="outline"
            size="sm"
            className="flex-1 group/btn hover:bg-amber-50 hover:border-amber-600 hover:text-amber-700"
          >
            <ShoppingCart className="w-4 h-4 mr-1 group-hover/btn:scale-110 transition-transform" />
            Add
          </Button>
          <Button
            onClick={handleBuyNow}
            size="sm"
            className="flex-1 bg-amber-700 hover:bg-amber-800"
          >
            <Zap className="w-4 h-4 mr-1" />
            Buy
          </Button>
        </div>
      </div>
    </motion.div>
  );
}


'use client';

import { motion } from 'motion/react';

/**
 * ProductCard Component
 * 
 * Elegant product card with glassmorphism effect and animations.
 * Features Quick Look modal on hover.
 */

export function ProductCard({ product, onAddToCart, onProductClick, onQuickLook, index = 0, isInCart = false }) {
  const {
    id,
    name,
    price,
    originalPrice,
    image,
    discount,
    inStock = true,
    isNew = false,
  } = product || {};

  const discountPercent = discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  // Animation variants - Using Motion.dev best practices
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: index * 0.05,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const imageVariants = {
    hover: {
      scale: 1.1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      },
    },
  };

  const badgeVariants = {
    hover: {
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4 }}
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
        willChange: 'transform',
      }}
      className="group relative rounded-xl overflow-hidden cursor-pointer"
      onClick={() => onProductClick?.(id)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50/50 aspect-[3/4]">
        <motion.div
          variants={imageVariants}
          whileHover="hover"
          style={{ willChange: 'transform' }}
        >
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </motion.div>

        {/* Badges - Glassmorphism with animations */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discountPercent > 0 && (
            <motion.span
              variants={badgeVariants}
              whileHover="hover"
              className="text-white text-xs font-medium px-2.5 py-1 rounded-lg"
              style={{
                background: 'rgba(146, 64, 14, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
              }}
            >
              {discountPercent}% OFF
            </motion.span>
          )}
          {isNew && (
            <motion.span
              variants={badgeVariants}
              whileHover="hover"
              className="text-white text-xs font-medium px-2.5 py-1 rounded-lg"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
              }}
            >
              NEW
            </motion.span>
          )}
        </div>

        {/* Stock Badge - Glassmorphism */}
        {!inStock && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <span
              className="text-gray-800 px-4 py-2 rounded-lg font-medium text-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
              }}
            >
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Look Button (on hover) - Glassmorphism with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            willChange: 'opacity, transform',
          }}
          className="absolute bottom-0 left-0 right-0 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              onQuickLook?.(product);
            }}
            disabled={!inStock}
            className="w-full text-amber-900 font-medium py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            Quick Look
          </motion.button>
        </motion.div>
      </div>

      {/* Product Info - Glassmorphism background */}
      <div
        className="p-4"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <motion.h3
          whileHover={{ color: '#92400E' }}
          className="text-gray-900 font-medium text-base mb-2 line-clamp-2 transition-colors leading-snug"
        >
          {name || 'Saree Name'}
        </motion.h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-semibold text-gray-900">
            ₹{price?.toLocaleString('en-IN') || '0'}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-400 line-through">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Add to Cart Button - Glassmorphism with animation */}
        <motion.button
          whileHover={{ scale: isInCart ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            if (!isInCart) {
              onAddToCart?.(id);
            }
          }}
          disabled={!inStock || isInCart}
          className="w-full font-medium py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          style={{
            background: isInCart 
              ? 'rgba(34, 197, 94, 0.9)' // Green for "In Cart"
              : 'rgba(146, 64, 14, 0.9)', // Amber for "Add to Cart"
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: isInCart
              ? '0 4px 16px 0 rgba(34, 197, 94, 0.2)'
              : '0 4px 16px 0 rgba(146, 64, 14, 0.2)',
            color: 'white',
          }}
        >
          {!inStock 
            ? 'Out of Stock' 
            : isInCart 
              ? '✓ In Cart' 
              : 'Add to Cart'}
        </motion.button>
      </div>
    </motion.div>
  );
}

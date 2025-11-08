'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthModal } from '@/hooks/useAuthModal';

/**
 * QuickLookModal Component
 * 
 * Modal displaying product details with smooth animations.
 * Uses Framer Motion for elegant transitions.
 */

export function QuickLookModal({ product, isOpen, onClose, onAddToCart }) {
  const { isAuthenticated } = useAuthStore();
  const { openLogin } = useAuthModal();

  if (!product) return null;

  const {
    id,
    name,
    price,
    originalPrice,
    image,
    discount,
    inStock = true,
    isNew = false,
    description = 'Beautiful handcrafted saree with traditional Odia patterns. Made with premium quality fabric and authentic craftsmanship.',
    fabric = 'Cotton',
    care = 'Dry clean only',
  } = product;

  const discountPercent = discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      openLogin();
      onClose();
      return;
    }
    onAddToCart?.(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="quick-look-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal - Using independent transforms per Motion.dev */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            style={{ 
              willChange: 'transform, opacity',
            }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-lg transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              <div className="flex flex-col lg:flex-row">
                {/* Image Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="lg:w-1/2 bg-gradient-to-br from-amber-50 to-orange-50/50 relative overflow-hidden"
                >
                  <div className="aspect-square lg:aspect-auto lg:h-full p-8 flex items-center justify-center">
                    {image ? (
                      <motion.img
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        src={image}
                        alt={name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {discountPercent > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        className="bg-amber-900 text-white text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg"
                      >
                        {discountPercent}% OFF
                      </motion.span>
                    )}
                    {isNew && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.35, type: 'spring' }}
                        className="bg-gray-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg"
                      >
                        NEW
                      </motion.span>
                    )}
                  </div>
                </motion.div>

                {/* Content Section */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="lg:w-1/2 p-8 overflow-y-auto max-h-[90vh]"
                >
                  <div className="space-y-6">
                    {/* Title */}
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl font-light text-gray-900 leading-tight"
                    >
                      {name}
                    </motion.h2>

                    {/* Price */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="flex items-baseline gap-3"
                    >
                      <span className="text-3xl font-semibold text-gray-900">
                        ₹{price?.toLocaleString('en-IN') || '0'}
                      </span>
                      {originalPrice && originalPrice > price && (
                        <span className="text-lg text-gray-400 line-through">
                          ₹{originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </motion.div>

                    {/* Description */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-4"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{description}</p>
                    </motion.div>

                    {/* Details */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200"
                    >
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fabric</p>
                        <p className="text-gray-900">{fabric}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Care</p>
                        <p className="text-gray-900">{care}</p>
                      </div>
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-col sm:flex-row gap-3 pt-4"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddToCart}
                        disabled={!inStock}
                        className="flex-1 bg-amber-900 text-white font-medium py-3.5 rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        {inStock ? 'Add to Cart' : 'Out of Stock'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          // Navigate to product detail page
                          onClose();
                        }}
                        className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-medium py-3.5 rounded-lg hover:border-amber-900 hover:text-amber-900 transition-colors"
                      >
                        View Full Details
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }


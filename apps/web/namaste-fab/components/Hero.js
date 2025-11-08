'use client';

import { motion } from 'motion/react';

/**
 * Hero Section Component
 * 
 * Elegant hero banner with subtle Odia cultural elements.
 * Professional and sophisticated design appealing to all ages.
 * Features smooth animations on page load.
 */

export function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50/30 to-white py-20 lg:py-28"
    >
      {/* Subtle Pattern Overlay (inspired by Sambalpuri ikat - very subtle) */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(139, 69, 19, 0.1) 20px,
            rgba(139, 69, 19, 0.1) 21px
          )`,
        }}></div>
      </div>

      {/* Elegant Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tagline - Subtle with animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <p className="text-amber-900/60 text-sm lg:text-base font-medium tracking-wide">
              Authentic Handcrafted Sarees
            </p>
          </motion.div>

          {/* Main Heading - Elegant Typography with animation */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight tracking-tight"
          >
            Beautiful Odia Sarees
            <br />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="font-normal text-amber-900"
            >
              Handcrafted with Love
            </motion.span>
          </motion.h1>

          {/* Subheading with animation */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg lg:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Discover the timeless elegance of Sambalpuri Ikat, Bomkai, and traditional Odia textiles
          </motion.p>

          {/* CTA Buttons - Elegant and Professional with animations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3.5 bg-amber-900 text-white font-medium rounded-md shadow-sm hover:bg-amber-800 transition-colors duration-200 text-base"
            >
              Shop Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:border-amber-900 hover:text-amber-900 transition-colors duration-200 text-base"
            >
              Explore Collection
            </motion.button>
          </motion.div>

          {/* Subtle Decorative Elements with animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-16 flex justify-center gap-6"
          >
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1, type: 'spring', stiffness: 200 }}
                className="w-2 h-2 rounded-full bg-amber-900/30"
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Elegant Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>

      {/* Subtle Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32.5C840 35 960 40 1080 42.5C1200 45 1320 45 1380 45L1440 45V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="white" opacity="0.8"/>
        </svg>
      </div>
    </motion.section>
  );
}

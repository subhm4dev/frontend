'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

/**
 * Hero Section Component - Enterprise Design
 * 
 * Matches Enterprise HomePage hero section design
 */

export function Hero({ featuredProducts = [] }) {
  const router = useRouter();
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const heroRef = useRef(null);

  // Track hero section visibility for floating button
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingButton(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  const handleExploreCollection = () => {
    router.push('/catalog');
  };

  return (
    <div>
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[600px] bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-amber-600 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-600 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="max-w-2xl">
          <motion.div
              initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
          >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-neutral-700">Celebrating India's Textile Heritage</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl lg:text-5xl font-semibold text-neutral-900 mb-6"
          >
              Discover Authentic
            <br />
              <span className="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                Odisha Handloom Sarees
              </span>
          </motion.h1>

          <motion.p
              initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-neutral-600 mb-8 leading-relaxed text-lg"
          >
              Immerse yourself in the timeless beauty of handwoven masterpieces. Each saree tells a story of tradition, craftsmanship, and cultural pride.
          </motion.p>

          <motion.div
              initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex gap-4"
          >
              <Button
                size="lg"
                className="bg-amber-700 hover:bg-amber-800 group"
                onClick={handleExploreCollection}
            >
              Explore Collection
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="border-neutral-300 hover:border-amber-600 hover:text-amber-700">
                Learn Our Story
              </Button>
          </motion.div>
          </div>

          {/* Hero Image */}
          {featuredProducts && featuredProducts.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px]"
            >
              <div className="relative w-full h-full">
          <motion.div
                  animate={{
                    rotate: [0, 5, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute top-0 right-0 w-80 h-96 rounded-2xl overflow-hidden shadow-2xl"
          >
                  <img
                    src={featuredProducts[0]?.image || featuredProducts[0]?.images?.[0] || '/namastefab.png'}
                    alt="Featured Saree"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              <motion.div
                  animate={{
                    rotate: [0, -5, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                  }}
                  className="absolute bottom-0 right-20 w-64 h-80 rounded-2xl overflow-hidden shadow-2xl"
                >
                  <img
                    src={featuredProducts[1]?.image || featuredProducts[1]?.images?.[0] || '/namastefab.png'}
                    alt="Featured Saree"
                    className="w-full h-full object-cover"
              />
                </motion.div>
              </div>
          </motion.div>
          )}
        </div>
      </section>

      {/* Floating Explore Collection Button */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ 
          opacity: showFloatingButton ? 1 : 0,
          y: showFloatingButton ? 0 : 100,
        }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-8 right-8 z-50"
        style={{ pointerEvents: showFloatingButton ? 'auto' : 'none' }}
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Button
            size="lg"
            className="bg-amber-700 hover:bg-amber-800 shadow-2xl group"
            onClick={handleExploreCollection}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Explore Collection
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>
      </div>
  );
}

'use client';

import { motion } from 'motion/react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
  ];

  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg flex items-center justify-center">
                <span className="text-white">साड़ी</span>
              </div>
              <div>
                <div className="text-white tracking-tight font-semibold">Namaste Fab</div>
                <div className="text-xs text-neutral-400">Handloom Heritage</div>
              </div>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Celebrating India's rich textile heritage with authentic handloom sarees from across the nation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4 font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <motion.a
                  href="#"
                  whileHover={{ x: 5 }}
                  className="hover:text-amber-500 transition-colors inline-block"
                >
                  About Us
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  whileHover={{ x: 5 }}
                  className="hover:text-amber-500 transition-colors inline-block"
                >
                  Our Artisans
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  whileHover={{ x: 5 }}
                  className="hover:text-amber-500 transition-colors inline-block"
                >
                  Shipping Policy
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  whileHover={{ x: 5 }}
                  className="hover:text-amber-500 transition-colors inline-block"
                >
                  Return & Exchange
                </motion.a>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-white mb-4 font-semibold">Customer Care</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <motion.a
                  href="#"
                  whileHover={{ x: 5 }}
                  className="hover:text-amber-500 transition-colors inline-block"
                >
                  Help Center
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  whileHover={{ x: 5 }}
                  className="hover:text-amber-500 transition-colors inline-block"
                >
                  Track Order
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  whileHover={{ x: 5 }}
                  className="hover:text-amber-500 transition-colors inline-block"
                >
                  Size Guide
                </motion.a>
              </li>
              <li>
                <motion.a
                  href="#"
                  whileHover={{ x: 5 }}
                  className="hover:text-amber-500 transition-colors inline-block"
                >
                  Care Instructions
                </motion.a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4 font-semibold">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500" />
                <span>support@namastefab.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>+91 9876543210</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5" />
                <span>Bhubaneswar, Odisha, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-neutral-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            © 2025 Namaste Fab. All rights reserved. Handcrafted with love.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-neutral-800 rounded-full hover:bg-amber-700 transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

/**
 * Footer Component
 * 
 * Elegant footer with subtle Odia design elements.
 * Professional and clean design.
 */

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      {/* Subtle Top Border */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent"></div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Namaste Fab
            </h3>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Celebrating the rich heritage of Odia textiles and bringing authentic handcrafted sarees to your doorstep.
            </p>
            <p className="text-gray-500 text-xs">
              Beautiful Sarees from Odia Culture
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-amber-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Collections</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Customer Service</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-amber-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Connect With Us</h4>
            <div className="flex gap-3 mb-4">
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-900 transition-colors">
                <span className="text-sm">f</span>
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-900 transition-colors">
                <span className="text-sm">in</span>
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-900 transition-colors">
                <span className="text-sm">ig</span>
              </a>
            </div>
            <p className="text-xs text-gray-500">
              Subscribe to our newsletter for exclusive offers
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2024 Namaste Fab. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

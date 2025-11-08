'use client';

import { useState } from 'react';

/**
 * FilterSidebar Component
 * 
 * Minimal, elegant filter sidebar with clean design.
 * Less visual clutter, more breathing room.
 */

export function FilterSidebar({ filters, onFilterChange, isOpen, onToggle }) {
  const [expandedSections, setExpandedSections] = useState({
    price: false,
    category: false,
    color: false,
    fabric: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Price ranges (in INR)
  const priceRanges = [
    { label: 'Under ₹2,000', min: 0, max: 2000 },
    { label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
    { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
    { label: '₹10,000 - ₹20,000', min: 10000, max: 20000 },
    { label: 'Above ₹20,000', min: 20000, max: Infinity },
  ];

  const categories = [
    'Sambalpuri Ikat',
    'Bomkai',
    'Khandua',
    'Pasapalli',
    'Temple Border',
    'Appliqué',
    'Kotpad',
    'Other States',
  ];

  const colors = [
    { name: 'Red', value: 'red', hex: '#DC2626' },
    { name: 'Maroon', value: 'maroon', hex: '#991B1B' },
    { name: 'Orange', value: 'orange', hex: '#EA580C' },
    { name: 'Yellow', value: 'yellow', hex: '#FBBF24' },
    { name: 'Green', value: 'green', hex: '#16A34A' },
    { name: 'Blue', value: 'blue', hex: '#2563EB' },
    { name: 'Purple', value: 'purple', hex: '#9333EA' },
    { name: 'Black', value: 'black', hex: '#000000' },
    { name: 'White', value: 'white', hex: '#FFFFFF' },
  ];

  const fabrics = [
    'Cotton',
    'Silk',
    'Tussar',
    'Bomkai Silk',
    'Ikat Cotton',
    'Handloom',
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-full lg:h-auto
          w-72 bg-white z-50 lg:z-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}
      >
        <div className="p-6">
          {/* Header - Minimal */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-base font-medium text-gray-900">
              Filters
            </h2>
            <button
              onClick={onToggle}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Price Range */}
          <div className="mb-8">
            <button
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-900 mb-4 py-1"
            >
              <span>Price</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.price && (
              <div className="space-y-3 pl-1">
                {priceRanges.map((range) => (
                  <label
                    key={range.label}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="price"
                      value={`${range.min}-${range.max}`}
                      checked={filters?.price === `${range.min}-${range.max}`}
                      onChange={(e) => onFilterChange?.('price', e.target.value)}
                      className="w-3.5 h-3.5 text-amber-900 focus:ring-0"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">{range.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Category */}
          <div className="mb-8">
            <button
              onClick={() => toggleSection('category')}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-900 mb-4 py-1"
            >
              <span>Category</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.category ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.category && (
              <div className="space-y-3 pl-1">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={filters?.categories?.includes(category)}
                      onChange={(e) => {
                        const current = filters?.categories || [];
                        const updated = e.target.checked
                          ? [...current, category]
                          : current.filter(c => c !== category);
                        onFilterChange?.('categories', updated);
                      }}
                      className="w-3.5 h-3.5 text-amber-900 focus:ring-0 rounded"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Color */}
          <div className="mb-8">
            <button
              onClick={() => toggleSection('color')}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-900 mb-4 py-1"
            >
              <span>Color</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.color ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.color && (
              <div className="grid grid-cols-4 gap-4">
                {colors.map((color) => (
                  <label
                    key={color.value}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={filters?.colors?.includes(color.value)}
                      onChange={(e) => {
                        const current = filters?.colors || [];
                        const updated = e.target.checked
                          ? [...current, color.value]
                          : current.filter(c => c !== color.value);
                        onFilterChange?.('colors', updated);
                      }}
                      className="hidden"
                    />
                    <div
                      className={`w-10 h-10 rounded-full border transition-all ${
                        filters?.colors?.includes(color.value)
                          ? 'border-amber-900 border-2 scale-110'
                          : 'border-gray-200 group-hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Fabric */}
          <div className="mb-8">
            <button
              onClick={() => toggleSection('fabric')}
              className="w-full flex items-center justify-between text-sm font-medium text-gray-900 mb-4 py-1"
            >
              <span>Fabric</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.fabric ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.fabric && (
              <div className="space-y-3 pl-1">
                {fabrics.map((fabric) => (
                  <label
                    key={fabric}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={filters?.fabrics?.includes(fabric)}
                      onChange={(e) => {
                        const current = filters?.fabrics || [];
                        const updated = e.target.checked
                          ? [...current, fabric]
                          : current.filter(f => f !== fabric);
                        onFilterChange?.('fabrics', updated);
                      }}
                      className="w-3.5 h-3.5 text-amber-900 focus:ring-0 rounded"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">{fabric}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Clear Filters - Minimal */}
          {(filters?.price || filters?.categories?.length > 0 || filters?.colors?.length > 0 || filters?.fabrics?.length > 0) && (
            <button
              onClick={() => onFilterChange?.('clear', null)}
              className="w-full text-sm text-gray-500 hover:text-gray-900 transition-colors py-2"
            >
              Clear all
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

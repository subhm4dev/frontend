/**
 * Format price with currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'INR')
 * @param {boolean} showDecimals - Whether to show decimal places (default: true)
 * @returns {string} Formatted price string (e.g., "₹1,234.56" or "₹1,235")
 */
export function formatPrice(amount, currency = 'INR', showDecimals = true) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return currency === 'INR' ? '₹0' : `0 ${currency}`;
    }
  
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(amount);
  }
  
  /**
   * Format number with Indian number system (lakhs, crores)
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  export function formatNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) {
      return '0';
    }
  
    return new Intl.NumberFormat('en-IN').format(num);
  }
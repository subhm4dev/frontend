/**
 * Format price in Indian Rupees (₹)
 * @param {number} amount - Amount to format
 * @param {boolean} showDecimals - Whether to show decimal places (default: true)
 * @returns {string} Formatted price string (e.g., "₹1,234.56" or "₹1,235")
 */
export function formatPrice(amount, showDecimals = true) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '₹0';
    }
  
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
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
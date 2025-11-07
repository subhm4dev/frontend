/**
 * Format date in Indian format
 * @param {Date|string} date - Date to format
 * @param {'short'|'long'|'time'|'datetime'} format - Format type
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'short') {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
  
    const options = {
      timeZone: 'Asia/Kolkata', // Indian timezone
    };
  
    switch (format) {
      case 'long':
        return new Intl.DateTimeFormat('en-IN', {
          ...options,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(dateObj);
  
      case 'time':
        return new Intl.DateTimeFormat('en-IN', {
          ...options,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(dateObj);
  
      case 'datetime':
        return new Intl.DateTimeFormat('en-IN', {
          ...options,
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(dateObj);
  
      case 'short':
      default:
        return new Intl.DateTimeFormat('en-IN', {
          ...options,
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(dateObj);
    }
  }
  
  /**
   * Format date as relative time (e.g., "2 days ago", "in 3 hours")
   * @param {Date|string} date - Date to format
   * @returns {string} Relative time string
   */
  export function formatRelativeTime(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
  
    const now = new Date();
    const diffMs = now - dateObj;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
  
    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return formatDate(dateObj, 'short');
  }
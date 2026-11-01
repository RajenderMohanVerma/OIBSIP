/**
 * Format a number as Indian Rupees
 */
export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date string
 */
export const formatDate = (dateStr, options = {}) => {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  }).format(new Date(dateStr));
};

/**
 * Get CSS class for order status
 */
export const getStatusClass = (status) => {
  const map = {
    placed: 'status-placed',
    confirmed: 'status-confirmed',
    preparing: 'status-preparing',
    out_for_delivery: 'status-out_for_delivery',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled',
    paid: 'status-paid',
    pending: 'status-pending',
    failed: 'status-failed',
    not_applicable: 'status-confirmed',
  };
  return map[status] || 'status-placed';
};

/**
 * Humanize order status label
 */
export const humanizeStatus = (status) => {
  const map = {
    placed: 'Order Placed',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    paid: 'Paid',
    pending: 'Payment Pending',
    failed: 'Payment Failed',
    not_applicable: 'Cash on Delivery',
  };
  return map[status] || status;
};

/**
 * Get error message from API error response
 */
export const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'An unexpected error occurred.'
  );
};

/**
 * Debounce a function
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Truncate text to a max length
 */
export const truncate = (text, max = 100) => {
  if (!text || text.length <= max) return text;
  return text.slice(0, max) + '…';
};


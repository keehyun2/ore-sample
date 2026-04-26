/**
 * Number formatting utilities
 */

export const formatNumber = (num, options = {}) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(num)
}

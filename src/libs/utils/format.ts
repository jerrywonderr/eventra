/**
 * Formatting Utility Functions
 * Helper functions for formatting data for display
 */

/**
 * Format currency
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Format date
 * @param date - Date string or Date object
 * @param format - Format type
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date,
  format: "short" | "long" | "relative" = "short"
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (format === "relative") {
    return formatRelativeTime(dateObj);
  }

  const options: Intl.DateTimeFormatOptions =
    format === "long"
      ? {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      : { year: "numeric", month: "short", day: "numeric" };

  return new Intl.DateTimeFormat("en-US", options).format(dateObj);
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return formatDate(date, "short");
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Format wallet address (show first and last 4 characters)
 * @param address - Wallet address
 * @returns Formatted address
 */
export const formatWalletAddress = (address: string): string => {
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

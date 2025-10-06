/**
 * Utility functions for consistent date formatting across the admin panel
 */

export const formatDate = (dateString: string | Date, options?: {
  includeTime?: boolean;
  timezone?: string;
  format?: 'short' | 'long' | 'full';
}) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  const defaultOptions = {
    includeTime: true,
    timezone: 'Asia/Kolkata', // IST timezone
    format: 'long' as const,
    ...options
  };

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: defaultOptions.format === 'short' ? 'short' : 'long',
    day: 'numeric',
    timeZone: defaultOptions.timezone,
    timeZoneName: 'short'
  };

  if (defaultOptions.includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
  }

  return date.toLocaleDateString('en-US', formatOptions);
};

export const formatTimeAgo = (date: Date | string): string => {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffInMinutes = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (diffInMinutes < 10080) { // 7 days
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else {
    return formatDate(targetDate, { includeTime: false });
  }
};

export const formatDateTime = (input: Date | string | undefined) => {
  if (!input) return '—';
  const d = typeof input === 'string' ? new Date(input) : input;
  try {
    return formatDate(d, { includeTime: true, timezone: 'Asia/Kolkata' });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

/**
 * Get the current timestamp in UTC format
 */
export const getCurrentUTCTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Convert a local date to UTC string
 */
export const toUTCString = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
};

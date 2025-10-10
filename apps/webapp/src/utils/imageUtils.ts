/**
 * Utility functions for handling image URLs
 */

import { getProxiedUrl, getFallbackImageUrl as getProxyFallback } from './s3UrlProxy';

/**
 * Converts a Google Drive view URL to a direct download URL
 * @param url - The Google Drive URL
 * @returns The direct download URL or the original URL if it's not a Google Drive URL
 */
export function getDirectImageUrl(url: string): string {
  if (!url) return '';
  
  // If it's a Google Drive URL with export=view, convert to export=download
  if (url.includes('drive.google.com') && url.includes('export=view')) {
    return url.replace('export=view', 'export=download');
  }
  
  return url;
}

/**
 * Gets a fallback image URL for when the primary image fails to load
 * @param brandName - The name of the brand
 * @returns A placeholder image URL
 */
export function getFallbackImageUrl(brandName: string): string {
  // Use a more reliable placeholder service that works better with proxies
  const firstLetter = brandName.charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=random&color=fff&size=48&bold=true`;
}

/**
 * Gets a brand logo URL using the proxy system to avoid CORS and proxy authentication issues
 * @param logoUrl - The original logo URL from the database
 * @param brandName - The name of the brand (for fallback)
 * @returns A proxied URL or fallback URL
 */
export function getBrandLogoUrl(logoUrl: string | undefined, brandName: string): string {
  if (!logoUrl) {
    return getFallbackImageUrl(brandName);
  }

  // Convert Google Drive view URLs to download URLs
  const directUrl = getDirectImageUrl(logoUrl);
  
  // Use the proxy system to handle external URLs
  return getProxiedUrl(directUrl);
}

/**
 * Gets a brand-specific icon URL that works better in restricted networks
 * @param brandName - The name of the brand
 * @returns A reliable icon URL
 */
export function getBrandIconUrl(brandName: string): string {
  // Map brand names to more reliable icon sources
  const brandIconMap: { [key: string]: string } = {
    'BBlunt': 'https://img.icons8.com/color/48/hair-salon.png',
    'Blue Tokai': 'https://img.icons8.com/color/48/coffee.png',
    'BOAT': 'https://img.icons8.com/color/48/headphones.png',
    'Chaayos': 'https://img.icons8.com/color/48/tea.png',
    "D'Decor": 'https://img.icons8.com/color/48/home.png',
    'Decathlon': 'https://img.icons8.com/color/48/sports.png',
    'Dominos': 'https://img.icons8.com/color/48/pizza.png',
    'EatFit Club': 'https://img.icons8.com/color/48/healthy-food.png',
    'GIVA': 'https://img.icons8.com/color/48/diamond.png',
    'Ixigo': 'https://img.icons8.com/color/48/airplane.png',
    'Lifestyle': 'https://img.icons8.com/color/48/shopping-bag.png',
    'Looks Salon': 'https://img.icons8.com/color/48/hair-salon.png',
    'McDonalds': 'https://img.icons8.com/color/48/hamburger.png',
    'Mokobara': 'https://img.icons8.com/color/48/suitcase.png',
    'MyMuse': 'https://img.icons8.com/color/48/love.png',
    'Myntra': 'https://img.icons8.com/color/48/shopping-bag.png',
    'Native by UC': 'https://img.icons8.com/color/48/cleaning-service.png',
    "Nature's Basket": 'https://img.icons8.com/color/48/grocery-bag.png',
    'Nykaa': 'https://img.icons8.com/color/48/makeup.png',
    'Oziva': 'https://img.icons8.com/color/48/pills.png',
    'PharmEasy': 'https://img.icons8.com/color/48/pharmacy.png',
    'PVR INOX': 'https://img.icons8.com/color/48/movie.png',
    'Rapido': 'https://img.icons8.com/color/48/motorcycle.png',
    'RedBus': 'https://img.icons8.com/color/48/bus.png',
    'Shuttl': 'https://img.icons8.com/color/48/bus.png',
    'Swiggy': 'https://img.icons8.com/color/48/delivery.png',
    'The Good Bug': 'https://img.icons8.com/color/48/bug.png',
    'The Man Company': 'https://img.icons8.com/color/48/male-user.png',
    'The Whole Truth': 'https://img.icons8.com/color/48/truth.png',
    'Vijay Sales': 'https://img.icons8.com/color/48/shopping-bag.png',
    'Zepto': 'https://img.icons8.com/color/48/delivery.png',
  };

  const iconUrl = brandIconMap[brandName] || getFallbackImageUrl(brandName);
  
  // Use the proxy system for external icon URLs
  return getProxiedUrl(iconUrl);
}

/**
 * Utility functions for fixing old Replit development URLs
 */

/**
 * Fix old Replit development URLs to use current domain
 */
export function fixImageUrl(url: string): string {
  if (!url) return url;
  
  // Fix specific old Replit development URL
  if (url.includes('3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev')) {
    return url.replace('https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev', window.location.origin);
  }
  
  // Fix any other old Replit URLs
  if (url.includes('.kirk.replit.dev')) {
    return url.replace(/https:\/\/[^.]+\.kirk\.replit\.dev/, window.location.origin);
  }
  
  // Fix any other old Replit deployment URLs
  if (url.includes('.repl.co')) {
    return url.replace(/https:\/\/[^.]+\.repl\.co/, window.location.origin);
  }
  
  return url;
}

/**
 * Fix an array of image URLs
 */
export function fixImageUrls(urls: string[]): string[] {
  return urls.map(fixImageUrl);
}

/**
 * Fix URLs in any object or array recursively
 */
export function fixUrlsInData(data: any): any {
  if (typeof data === 'string') {
    return fixImageUrl(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(fixUrlsInData);
  }
  
  if (data && typeof data === 'object') {
    const fixed: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Check for common URL field names
      if ((key.includes('url') || key.includes('photo') || key.includes('image') || key.includes('media')) && typeof value === 'string') {
        fixed[key] = fixImageUrl(value);
      } else {
        fixed[key] = fixUrlsInData(value);
      }
    }
    return fixed;
  }
  
  return data;
}
/**
 * Geocoding Service - Convert coordinates to readable addresses
 */

export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'RankItPro/1.0 (support@rankitpro.com)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.address) {
      const address = data.address;
      
      // Build a formatted address
      const parts = [];
      
      // Street only (without house number)
      if (address.road) {
        parts.push(address.road);
      }
      
      // City - try multiple location types
      if (address.city || address.town || address.village || address.suburb || address.neighbourhood || address.hamlet) {
        parts.push(address.city || address.town || address.village || address.suburb || address.neighbourhood || address.hamlet);
      }
      
      // State
      if (address.state) {
        parts.push(address.state);
      }
      
      // Postal code
      if (address.postcode) {
        parts.push(address.postcode);
      }
      
      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
    
    // Fallback to display name if available
    if (data && data.display_name) {
      return data.display_name;
    }
    
    // Final fallback to coordinates
    return `${latitude}, ${longitude}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${latitude}, ${longitude}`;
  }
}

export function formatLocationAddress(location: string, latitude?: number, longitude?: number): string {
  // If location already looks like an address, return it
  if (location && location.includes(',') && !location.match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/)) {
    return location;
  }
  
  // If we have coordinates but no proper address, indicate we need geocoding
  if (latitude && longitude) {
    return `${latitude}, ${longitude}`;
  }
  
  return location || 'Location not specified';
}
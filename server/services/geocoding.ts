/**
 * Geocoding service to convert GPS coordinates to readable addresses
 * Uses reverse geocoding to convert latitude/longitude to street addresses
 */

interface AddressComponents {
  streetNumber?: string;
  streetName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface GeocodingResult {
  formattedAddress: string;
  components: AddressComponents;
  success: boolean;
  error?: string;
}

/**
 * Convert GPS coordinates to a readable address
 * Uses OpenStreetMap Nominatim API (free service) for reverse geocoding
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult> {
  try {
    // Validate coordinates
    if (!isValidCoordinate(latitude, longitude)) {
      return {
        formattedAddress: `${latitude}, ${longitude}`,
        components: {},
        success: false,
        error: 'Invalid coordinates'
      };
    }

    // Use OpenStreetMap Nominatim API for reverse geocoding
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RankItPro-SaaS/1.0 (contact@rankitpro.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.error) {
      return {
        formattedAddress: `${latitude}, ${longitude}`,
        components: {},
        success: false,
        error: data.error || 'No address found'
      };
    }

    // Parse address components from OpenStreetMap response
    const address = data.address || {};
    const components: AddressComponents = {
      streetNumber: address.house_number,
      streetName: address.road || address.street,
      city: address.city || address.town || address.village || address.municipality,
      state: address.state || address.province || address.region,
      zipCode: address.postcode,
      country: address.country
    };

    // Build formatted address
    let formattedAddress = '';
    
    if (components.streetNumber && components.streetName) {
      formattedAddress += `${components.streetNumber} ${components.streetName}`;
    } else if (components.streetName) {
      formattedAddress += components.streetName;
    }
    
    if (components.city) {
      formattedAddress += formattedAddress ? `, ${components.city}` : components.city;
    }
    
    if (components.state) {
      formattedAddress += formattedAddress ? `, ${components.state}` : components.state;
    }
    
    if (components.zipCode) {
      formattedAddress += ` ${components.zipCode}`;
    }

    // Fallback to display name if we couldn't build a good address
    if (!formattedAddress && data.display_name) {
      formattedAddress = data.display_name;
    }

    // Final fallback to coordinates
    if (!formattedAddress) {
      formattedAddress = `${latitude}, ${longitude}`;
    }

    return {
      formattedAddress,
      components,
      success: true
    };

  } catch (error: any) {
    console.error('Geocoding error:', error);
    
    return {
      formattedAddress: `${latitude}, ${longitude}`,
      components: {},
      success: false,
      error: error.message || 'Geocoding service unavailable'
    };
  }
}

/**
 * Validate that coordinates are within valid ranges
 */
function isValidCoordinate(latitude: number, longitude: number): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180 &&
    !isNaN(latitude) && !isNaN(longitude)
  );
}

/**
 * Parse GPS coordinates from a location string
 * Supports various formats: "lat,lng", "lat, lng", "(lat,lng)"
 */
export function parseCoordinates(location: string): { latitude: number; longitude: number } | null {
  if (!location || typeof location !== 'string') {
    return null;
  }

  // Remove parentheses and clean up the string
  const cleaned = location.replace(/[()]/g, '').trim();
  
  // Split by comma
  const parts = cleaned.split(',');
  
  if (parts.length !== 2) {
    return null;
  }

  const latitude = parseFloat(parts[0].trim());
  const longitude = parseFloat(parts[1].trim());

  if (isValidCoordinate(latitude, longitude)) {
    return { latitude, longitude };
  }

  return null;
}

/**
 * Convert location string to formatted address if it contains coordinates
 */
export async function formatLocationAddress(location: string): Promise<string> {
  if (!location) {
    return '';
  }

  // Try to parse as coordinates
  const coords = parseCoordinates(location);
  
  if (coords) {
    // It's coordinates, convert to address
    const result = await reverseGeocode(coords.latitude, coords.longitude);
    return result.formattedAddress;
  }

  // It's already a formatted address, return as-is
  return location;
}
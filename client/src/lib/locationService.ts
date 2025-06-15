/**
 * Unified Location Service for GPS Detection
 * Provides consistent, high-accuracy location detection across all components
 */

export interface LocationData {
  streetName: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
  accuracy: number;
  source: string;
  isReliable: boolean;
}

export interface LocationPermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

/**
 * Check current location permission status
 */
export async function checkLocationPermission(): Promise<LocationPermissionStatus> {
  if (!('permissions' in navigator)) {
    return { granted: false, denied: false, prompt: true };
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return {
      granted: permission.state === 'granted',
      denied: permission.state === 'denied',
      prompt: permission.state === 'prompt'
    };
  } catch (error) {
    console.log('Permission API not supported:', error);
    return { granted: false, denied: false, prompt: true };
  }
}

/**
 * Get current GPS location with high accuracy
 */
export async function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    console.log('🔧 Starting high-accuracy GPS location detection...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        console.log('🗺️ GPS Location Detected:', {
          latitude,
          longitude,
          accuracy: accuracy + 'm',
          timestamp: new Date(position.timestamp).toISOString(),
          source: 'Device GPS Hardware'
        });

        // Determine location source and reliability based on accuracy
        let sourceType: string;
        let isReliable: boolean;
        
        if (accuracy < 10) {
          sourceType = 'GPS Satellite (Excellent)';
          isReliable = true;
        } else if (accuracy < 50) {
          sourceType = 'GPS Satellite (Good)';
          isReliable = true;
        } else if (accuracy < 100) {
          sourceType = 'Assisted GPS/WiFi';
          isReliable = true;
        } else if (accuracy < 1000) {
          sourceType = 'Cell Tower';
          isReliable = false;
        } else {
          sourceType = 'IP Geolocation (UNRELIABLE)';
          isReliable = false;
        }

        try {
          // Use OpenStreetMap Nominatim for reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18&extratags=1`
          );

          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};

            // Extract address components (no street numbers for privacy)
            const streetName = address.road || address.street || '';
            const city = address.city || address.town || address.village || '';
            const state = address.state || address.province || '';
            const zipCode = address.postcode || '';

            const fullAddress = `${streetName}, ${city}, ${state} ${zipCode}`
              .replace(/,\s*,/g, ',')
              .replace(/^\s*,\s*/, '')
              .trim();

            const locationData: LocationData = {
              streetName: streetName || 'Street not found',
              city: city || 'City not found',
              state: state || 'State not found',
              zipCode: zipCode || 'Zip not found',
              fullAddress: fullAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              accuracy,
              source: sourceType,
              isReliable
            };

            resolve(locationData);
          } else {
            throw new Error('Geocoding service unavailable');
          }
        } catch (geocodingError) {
          console.error('Reverse geocoding failed:', geocodingError);
          
          // Fallback to coordinates
          const fallbackAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          const locationData: LocationData = {
            streetName: fallbackAddress,
            city: '',
            state: '',
            zipCode: '',
            fullAddress: fallbackAddress,
            accuracy,
            source: sourceType,
            isReliable
          };

          resolve(locationData);
        }
      },
      (error) => {
        console.error('GPS location error:', error);
        
        let errorMessage = 'Location detection failed';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable GPS access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,  // Force GPS over network/wifi location
        timeout: 15000,            // 15 second timeout
        maximumAge: 0              // No cached locations - get fresh GPS reading
      }
    );
  });
}

/**
 * Get fallback location when GPS fails
 */
export function getFallbackLocation(): LocationData {
  return {
    streetName: 'Location not detected',
    city: '',
    state: '',
    zipCode: '',
    fullAddress: 'Please enter your work location manually',
    accuracy: 0,
    source: 'Manual Entry Required',
    isReliable: false
  };
}

/**
 * Format location for display (street, city, state zip)
 */
export function formatLocationDisplay(location: LocationData): string {
  const parts = [location.streetName, location.city, location.state, location.zipCode]
    .filter(part => part && part !== 'not found')
    .filter(Boolean);
  
  return parts.length > 0 ? parts.join(', ') : location.fullAddress;
}
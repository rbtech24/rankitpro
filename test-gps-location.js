/**
 * GPS Location Detection Test
 * Tests if the mobile app actually uses real GPS coordinates
 */

// Test GPS location detection functionality
async function testGPSLocationDetection() {
  console.log('🗺️ Testing GPS Location Detection...\n');

  // Test 1: Check if geolocation API is available
  console.log('1. Testing Geolocation API availability...');
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    console.log('✅ Geolocation API is available');
  } else {
    console.log('❌ Geolocation API not available (running in Node.js)');
    console.log('   This test needs to run in a browser with GPS access');
    return;
  }

  // Test 2: Check GPS permissions and accuracy
  console.log('\n2. Testing GPS coordinate detection...');
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });

    const { latitude, longitude, accuracy } = position.coords;
    
    console.log('✅ GPS coordinates detected:');
    console.log(`   Latitude: ${latitude}`);
    console.log(`   Longitude: ${longitude}`);
    console.log(`   Accuracy: ±${Math.round(accuracy)}m`);

    // Test 3: Verify coordinates are real (not default/mock values)
    console.log('\n3. Validating coordinate authenticity...');
    const isValidLat = latitude >= -90 && latitude <= 90 && latitude !== 0;
    const isValidLon = longitude >= -180 && longitude <= 180 && longitude !== 0;
    const hasAccuracy = accuracy > 0 && accuracy < 10000; // Reasonable accuracy range

    if (isValidLat && isValidLon && hasAccuracy) {
      console.log('✅ Coordinates appear to be real GPS data');
    } else {
      console.log('⚠️  Coordinates may be mock/default values');
    }

    // Test 4: Test reverse geocoding
    console.log('\n4. Testing address lookup from coordinates...');
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18&extratags=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        
        const streetName = address.road || '';
        const city = address.city || address.town || address.village || '';
        const state = address.state || '';
        const zipCode = address.postcode || '';
        
        const fullAddress = `${streetName}, ${city}, ${state} ${zipCode}`.replace(/,\s*,/g, ',').replace(/^\s*,\s*/, '');
        
        console.log('✅ Address resolved successfully:');
        console.log(`   ${fullAddress}`);
        console.log(`   Raw components: Street=${streetName}, City=${city}, State=${state}, Zip=${zipCode}`);
      } else {
        console.log('❌ Failed to resolve address from coordinates');
      }
    } catch (error) {
      console.log('❌ Error during address lookup:', error.message);
    }

  } catch (error) {
    console.log('❌ GPS detection failed:', error.message);
    console.log('   Common causes:');
    console.log('   - Location services disabled');
    console.log('   - No GPS signal');
    console.log('   - Permission denied');
    console.log('   - Running in non-HTTPS environment');
  }

  console.log('\n📱 To test in the mobile app:');
  console.log('1. Open the Field Mobile page on a device with GPS');
  console.log('2. Allow location permissions when prompted');
  console.log('3. Look for the yellow debug banner showing actual coordinates');
  console.log('4. Verify the location display shows your real street, city, state, zip');
}

// Run test if in browser environment
if (typeof window !== 'undefined') {
  testGPSLocationDetection();
} else {
  console.log('📱 GPS Location Detection Test');
  console.log('=====================================');
  console.log('This test must run in a browser with GPS access.');
  console.log('');
  console.log('To verify real GPS detection:');
  console.log('1. Open the mobile field app: /field-mobile');
  console.log('2. Allow location permissions');
  console.log('3. Check for debug banner with actual coordinates');
  console.log('4. Verify address format: "Street Name, City, State Zip"');
  console.log('5. Confirm NO street numbers or lat/long shown to user');
}
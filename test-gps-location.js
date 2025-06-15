/**
 * GPS Location Detection Test Script
 * Tests if the device can access real GPS coordinates vs network location
 */

async function testGPSLocationDetection() {
  console.log('🧪 Starting GPS Location Detection Test...\n');
  
  if (!navigator.geolocation) {
    console.log('❌ Geolocation API not supported');
    return;
  }

  console.log('✅ Geolocation API supported');
  
  // Test 1: High accuracy GPS request
  console.log('\n📡 Test 1: High Accuracy GPS Request');
  
  const options = {
    enableHighAccuracy: true,    // Force GPS hardware
    timeout: 30000,              // 30 second timeout for GPS
    maximumAge: 0                // No cached locations
  };
  
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
    
    const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;
    const timestamp = new Date(position.timestamp);
    
    console.log('📍 GPS Position Acquired:');
    console.log(`   Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    console.log(`   Accuracy: ±${Math.round(accuracy)}m`);
    console.log(`   Altitude: ${altitude ? altitude.toFixed(2) + 'm' : 'N/A'}`);
    console.log(`   Altitude Accuracy: ${altitudeAccuracy ? '±' + altitudeAccuracy.toFixed(2) + 'm' : 'N/A'}`);
    console.log(`   Heading: ${heading ? heading.toFixed(2) + '°' : 'N/A'}`);
    console.log(`   Speed: ${speed ? speed.toFixed(2) + 'm/s' : 'N/A'}`);
    console.log(`   Timestamp: ${timestamp.toISOString()}`);
    
    // Analyze accuracy to determine source
    let sourceType;
    if (accuracy < 10) {
      sourceType = '🛰️ GPS Satellite (Excellent)';
    } else if (accuracy < 50) {
      sourceType = '🛰️ GPS Satellite (Good)';
    } else if (accuracy < 100) {
      sourceType = '📡 Assisted GPS/WiFi (Fair)';
    } else if (accuracy < 1000) {
      sourceType = '📶 Cell Tower Triangulation';
    } else {
      sourceType = '🌐 IP-based Geolocation (Poor)';
    }
    
    console.log(`   Source Type: ${sourceType}`);
    
    // Test reverse geocoding
    console.log('\n🗺️ Test 2: Reverse Geocoding');
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        
        console.log('📮 Address Resolution:');
        console.log(`   Display Name: ${data.display_name || 'N/A'}`);
        console.log(`   Country: ${address.country || 'N/A'}`);
        console.log(`   State/Province: ${address.state || address.province || 'N/A'}`);
        console.log(`   City: ${address.city || address.town || address.village || 'N/A'}`);
        console.log(`   Street: ${address.road || 'N/A'}`);
        console.log(`   Postal Code: ${address.postcode || 'N/A'}`);
        
        // Check if location makes sense geographically
        if (address.country) {
          console.log(`\n🌍 Geographic Analysis:`);
          console.log(`   Detected Country: ${address.country}`);
          
          // Common South American countries
          const southAmericanCountries = [
            'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 
            'Ecuador', 'French Guiana', 'Guyana', 'Paraguay', 
            'Peru', 'Suriname', 'Uruguay', 'Venezuela'
          ];
          
          const isInSouthAmerica = southAmericanCountries.some(country => 
            address.country.toLowerCase().includes(country.toLowerCase())
          );
          
          if (isInSouthAmerica) {
            console.log('   ✅ Location matches South America');
          } else {
            console.log('   ⚠️ Location does NOT match expected South America region');
            console.log('   🔍 This suggests IP-based or cached location data');
          }
        }
      } else {
        console.log('❌ Reverse geocoding failed');
      }
    } catch (error) {
      console.log('❌ Reverse geocoding error:', error.message);
    }
    
    // Test 3: Watch position for changes
    console.log('\n👀 Test 3: Position Monitoring (5 seconds)');
    
    let watchId;
    let positionCount = 0;
    
    const watchPromise = new Promise((resolve) => {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          positionCount++;
          const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords;
          console.log(`   Update ${positionCount}: ${lat.toFixed(6)}, ${lng.toFixed(6)} (±${Math.round(acc)}m)`);
        },
        (error) => {
          console.log(`   Watch error: ${error.message}`);
        },
        options
      );
      
      setTimeout(() => {
        navigator.geolocation.clearWatch(watchId);
        resolve();
      }, 5000);
    });
    
    await watchPromise;
    console.log(`   Received ${positionCount} position updates`);
    
  } catch (error) {
    console.log('\n❌ GPS Test Failed:');
    console.log(`   Error Code: ${error.code}`);
    console.log(`   Error Message: ${error.message}`);
    
    switch (error.code) {
      case 1:
        console.log('   🚫 Permission denied - User blocked location access');
        break;
      case 2:
        console.log('   📡 Position unavailable - GPS/network error');
        break;
      case 3:
        console.log('   ⏱️ Timeout - GPS took too long to respond');
        break;
      default:
        console.log('   ❓ Unknown error');
    }
  }
  
  // Test 4: Permission API check
  console.log('\n🔐 Test 4: Permission Status');
  
  if ('permissions' in navigator) {
    try {
      const permission = await navigator.permissions.query({name: 'geolocation'});
      console.log(`   Geolocation Permission: ${permission.state}`);
      
      if (permission.state === 'granted') {
        console.log('   ✅ Permission granted');
      } else if (permission.state === 'prompt') {
        console.log('   ⚠️ Permission will be requested');
      } else {
        console.log('   ❌ Permission denied');
      }
    } catch (error) {
      console.log('   ❓ Permission check not supported');
    }
  } else {
    console.log('   ❓ Permissions API not supported');
  }
  
  console.log('\n🏁 GPS Location Test Complete');
  console.log('\n💡 Analysis:');
  console.log('   • Accuracy < 50m = Real GPS satellite data');
  console.log('   • Accuracy 50-100m = Assisted GPS/WiFi');
  console.log('   • Accuracy > 1000m = IP/network-based location');
  console.log('   • If showing US location while in South America = IP geolocation');
}

// Run the test
testGPSLocationDetection().catch(console.error);
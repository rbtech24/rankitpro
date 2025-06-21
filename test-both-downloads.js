/**
 * Test Both WordPress Plugin Download Endpoints
 */

async function testBothDownloads() {
  console.log('🧪 Testing Both WordPress Plugin Downloads...\n');
  
  try {
    // Test 1: Integration endpoint
    console.log('1️⃣ Testing /api/integration/wordpress/download-plugin...');
    const response1 = await fetch('/api/integration/wordpress/download-plugin', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/zip' }
    });
    
    if (response1.ok) {
      const blob1 = await response1.blob();
      const arrayBuffer1 = await blob1.arrayBuffer();
      const uint8Array1 = new Uint8Array(arrayBuffer1);
      const isZip1 = uint8Array1[0] === 0x50 && uint8Array1[1] === 0x4B;
      
      console.log(`Status: ${response1.status}, Size: ${blob1.size} bytes`);
      console.log(`Valid ZIP: ${isZip1 ? '✅' : '❌'}`);
      
      if (!isZip1) {
        const textContent = new TextDecoder().decode(uint8Array1.slice(0, 100));
        console.log('Content preview:', textContent);
      }
    } else {
      console.log(`❌ Failed: ${response1.status} ${response1.statusText}`);
    }
    
    // Test 2: WordPress endpoint
    console.log('\n2️⃣ Testing /api/wordpress/plugin...');
    const response2 = await fetch('/api/wordpress/plugin', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/zip' }
    });
    
    if (response2.ok) {
      const blob2 = await response2.blob();
      const arrayBuffer2 = await blob2.arrayBuffer();
      const uint8Array2 = new Uint8Array(arrayBuffer2);
      const isZip2 = uint8Array2[0] === 0x50 && uint8Array2[1] === 0x4B;
      
      console.log(`Status: ${response2.status}, Size: ${blob2.size} bytes`);
      console.log(`Valid ZIP: ${isZip2 ? '✅' : '❌'}`);
      
      if (!isZip2) {
        const textContent = new TextDecoder().decode(uint8Array2.slice(0, 100));
        console.log('Content preview:', textContent);
      }
    } else {
      console.log(`❌ Failed: ${response2.status} ${response2.statusText}`);
    }
    
    // Test 3: Authentication check
    console.log('\n3️⃣ Checking authentication...');
    const authResponse = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Authenticated as:', authData.user?.email);
    } else {
      console.log('❌ Not authenticated');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the test
testBothDownloads();
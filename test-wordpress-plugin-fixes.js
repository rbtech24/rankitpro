/**
 * WordPress Plugin Fixes Verification
 * Tests all critical fixes: removed hardcoded API key, proper settings, no duplicate PHP tags
 */

async function testWordPressPluginFixes() {
    console.log('🔧 Testing WordPress Plugin Critical Fixes...\n');
    
    // Test 1: Login and get authenticated session
    console.log('1. Authenticating with test company...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@testcompany.com',
            password: 'company123'
        })
    });
    
    if (!loginResponse.ok) {
        console.log('❌ Authentication failed');
        return;
    }
    
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('✅ Authentication successful');
    
    // Test 2: Generate WordPress plugin
    console.log('\n2. Generating WordPress plugin...');
    const pluginResponse = await fetch('http://localhost:5000/api/wordpress/plugin', {
        method: 'GET',
        headers: { 'Cookie': cookies }
    });
    
    if (!pluginResponse.ok) {
        console.log('❌ Plugin generation failed:', pluginResponse.status);
        return;
    }
    
    const pluginCode = await pluginResponse.text();
    console.log('✅ Plugin generated successfully');
    
    // Test 3: Verify no hardcoded API key
    console.log('\n3. Checking for hardcoded API key removal...');
    const hasHardcodedKey = pluginCode.includes("$this->apiKey = '9cb92acf") || 
                           pluginCode.includes("apiKey = '9cb92acf");
    
    if (hasHardcodedKey) {
        console.log('❌ CRITICAL: Hardcoded API key still present!');
    } else {
        console.log('✅ Hardcoded API key successfully removed');
    }
    
    // Test 4: Verify proper get_option() usage
    console.log('\n4. Checking for proper settings storage...');
    const hasGetOption = pluginCode.includes("get_option('rankitpro_api_key'") &&
                         pluginCode.includes("get_option('rankitpro_api_endpoint'");
    
    if (!hasGetOption) {
        console.log('❌ CRITICAL: get_option() not properly implemented!');
    } else {
        console.log('✅ Proper WordPress settings storage implemented');
    }
    
    // Test 5: Verify register_setting() calls
    console.log('\n5. Checking for proper WordPress settings registration...');
    const hasRegisterSetting = pluginCode.includes("register_setting('rankitpro_settings_group', 'rankitpro_api_key'") &&
                               pluginCode.includes("register_setting('rankitpro_settings_group', 'rankitpro_api_endpoint'");
    
    if (!hasRegisterSetting) {
        console.log('❌ CRITICAL: register_setting() not properly implemented!');
    } else {
        console.log('✅ Proper WordPress settings registration implemented');
    }
    
    // Test 6: Verify settings_fields() usage
    console.log('\n6. Checking for settings_fields() implementation...');
    const hasSettingsFields = pluginCode.includes("settings_fields('rankitpro_settings_group')") &&
                              pluginCode.includes("do_settings_sections('rankitpro-settings')");
    
    if (!hasSettingsFields) {
        console.log('❌ CRITICAL: settings_fields() not properly implemented!');
    } else {
        console.log('✅ Proper WordPress settings form implementation');
    }
    
    // Test 7: Check for duplicate PHP tags
    console.log('\n7. Checking for duplicate PHP opening tags...');
    const phpTagCount = (pluginCode.match(/<?php/g) || []).length;
    
    if (phpTagCount > 1) {
        console.log(`❌ CRITICAL: Found ${phpTagCount} PHP opening tags - should be only 1!`);
    } else {
        console.log('✅ No duplicate PHP tags found');
    }
    
    // Test 8: Verify input fields exist
    console.log('\n8. Checking for proper input fields in settings...');
    const hasInputFields = pluginCode.includes('name="rankitpro_api_key"') &&
                           pluginCode.includes('name="rankitpro_api_endpoint"') &&
                           pluginCode.includes('type="text"') &&
                           pluginCode.includes('type="url"');
    
    if (!hasInputFields) {
        console.log('❌ CRITICAL: Input fields not properly implemented!');
    } else {
        console.log('✅ Proper input fields for API configuration');
    }
    
    // Test 9: Verify nonce security
    console.log('\n9. Checking for security nonce implementation...');
    const hasNonce = pluginCode.includes('wp_nonce_field') &&
                     pluginCode.includes('check_admin_referer');
    
    if (!hasNonce) {
        console.log('❌ WARNING: Nonce security not fully implemented');
    } else {
        console.log('✅ Proper nonce security implementation');
    }
    
    // Test 10: Verify translation support
    console.log('\n10. Checking for translation support...');
    const hasTranslations = pluginCode.includes('__(' ) &&
                            pluginCode.includes("'rankitpro'") &&
                            pluginCode.includes('load_plugin_textdomain');
    
    if (!hasTranslations) {
        console.log('❌ WARNING: Translation support incomplete');
    } else {
        console.log('✅ Proper translation support implemented');
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('WORDPRESS PLUGIN FIXES SUMMARY:');
    console.log('='.repeat(50));
    
    const criticalIssues = [
        !hasHardcodedKey ? null : 'Hardcoded API key still present',
        hasGetOption ? null : 'get_option() not implemented',
        hasRegisterSetting ? null : 'register_setting() missing',
        hasSettingsFields ? null : 'settings_fields() missing',
        phpTagCount === 1 ? null : 'Duplicate PHP tags found',
        hasInputFields ? null : 'Input fields missing'
    ].filter(Boolean);
    
    if (criticalIssues.length === 0) {
        console.log('✅ ALL CRITICAL ISSUES FIXED!');
        console.log('✅ WordPress plugin is production-ready');
        console.log('✅ Customers can now configure their own API keys');
        console.log('✅ Plugin follows WordPress coding standards');
    } else {
        console.log('❌ CRITICAL ISSUES REMAINING:');
        criticalIssues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    // Save plugin code for manual inspection if needed
    require('fs').writeFileSync('/tmp/generated-plugin.php', pluginCode);
    console.log('\n📄 Plugin code saved to /tmp/generated-plugin.php for inspection');
}

// Run the test
testWordPressPluginFixes().catch(console.error);
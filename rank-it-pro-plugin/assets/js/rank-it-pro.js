/**
 * Rank It Pro Plugin JavaScript
 * Enhanced with debugging for troubleshooting
 */
(function() {
    'use strict';
    
    console.log('Rank It Pro: JavaScript file loaded');
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRankItPro);
    } else {
        initRankItPro();
    }
    
    function initRankItPro() {
        console.log('Rank It Pro: Initializing plugin');
        
        // Enhanced widget detection
        const containers = document.querySelectorAll('[data-rankitpro-widget]');
        console.log('Rank It Pro: Found', containers.length, 'widget containers');
        
        if (containers.length > 0) {
            containers.forEach(function(container, index) {
                console.log('Rank It Pro: Processing container', index + 1, container);
                
                const widgetType = container.getAttribute('data-rankitpro-widget');
                const companyId = container.getAttribute('data-company-id');
                const limit = container.getAttribute('data-limit');
                
                console.log('Rank It Pro: Widget details -', {
                    type: widgetType,
                    companyId: companyId,
                    limit: limit
                });
                
                // Add enhanced loading state
                if (!container.querySelector('.rankitpro-loading')) {
                    container.innerHTML = '<div class="rankitpro-loading">Loading ' + widgetType + ' data...</div>';
                }
            });
        } else {
            console.warn('Rank It Pro: No widget containers found on this page');
        }
    }
    
    // Enhanced error handling
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('rankitpro')) {
            console.error('Rank It Pro: JavaScript error detected:', e.message);
        }
    });
    
    // Debugging helper
    window.rankItProDebug = function() {
        console.log('=== Rank It Pro Debug Info ===');
        console.log('Containers found:', document.querySelectorAll('[data-rankitpro-widget]').length);
        console.log('Loading elements:', document.querySelectorAll('.rankitpro-loading').length);
        console.log('Error elements:', document.querySelectorAll('.rankitpro-error').length);
        console.log('Content elements:', document.querySelectorAll('.rankitpro-checkin').length);
        console.log('===============================');
    };
    
})();
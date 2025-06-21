// Complete WordPress Plugin Assets - Original CSS and JavaScript

export const getCompleteCSS = () => `/* RankItPro WordPress Integration Styles - Complete Original Code */

/* Reset and Base Styles */
.rankitpro-container * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.rankitpro-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #333;
    line-height: 1.6;
}

/* Service Visit/Check-in Card Styles */
.rankitpro-visit-card {
    max-width: 450px;
    margin: 20px auto;
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #eee;
}

.rankitpro-visit-header {
    padding: 20px;
    background: white;
    border-bottom: 1px solid #eee;
}

.rankitpro-visit-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
}

.rankitpro-visit-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.rankitpro-technician {
    font-size: 14px;
    color: #666;
}

.rankitpro-visit-date {
    font-size: 14px;
    color: #666;
}

.rankitpro-visit-location {
    display: flex;
    align-items: center;
    color: #e91e63;
    font-size: 14px;
    font-weight: 500;
}

.rankitpro-visit-location::before {
    content: "📍";
    margin-right: 8px;
}

/* Map Container */
.rankitpro-map-container {
    height: 200px;
    position: relative;
    background: #e8f5e8;
    border: 1px solid #ddd;
    margin: 0 20px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
}

.rankitpro-map-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #e8f5e8 25%, #f0f8f0 25%, #f0f8f0 50%, #e8f5e8 50%, #e8f5e8 75%, #f0f8f0 75%);
    background-size: 20px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.rankitpro-map-marker {
    width: 30px;
    height: 30px;
    background: #2196f3;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    position: relative;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.rankitpro-map-marker::after {
    content: '';
    width: 14px;
    height: 14px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
}

/* Visit Description */
.rankitpro-visit-description {
    padding: 20px;
    font-size: 14px;
    line-height: 1.8;
    color: #444;
    text-align: center;
}

/* Photos Section */
.rankitpro-photos-section {
    padding: 0 20px 20px 20px;
}

.rankitpro-photos-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.rankitpro-photo-container {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.rankitpro-photo {
    width: 100%;
    height: 150px;
    object-fit: cover;
    display: block;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.rankitpro-photo:hover {
    transform: scale(1.05);
}

.rankitpro-photo-label {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}

/* Hashtags */
.rankitpro-hashtags {
    padding: 20px;
    border-top: 1px solid #eee;
    background: #fafafa;
}

.rankitpro-hashtag {
    display: inline-block;
    color: #1976d2;
    text-decoration: none;
    font-size: 12px;
    margin-right: 8px;
    margin-bottom: 5px;
    font-weight: 500;
}

.rankitpro-hashtag:hover {
    text-decoration: underline;
}

/* Blog Post Styles */
.rankitpro-blog-card {
    max-width: 600px;
    margin: 20px auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    overflow: hidden;
    border: 1px solid #e0e0e0;
}

.rankitpro-blog-header {
    padding: 25px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.rankitpro-blog-title {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 10px;
    line-height: 1.3;
}

.rankitpro-blog-meta {
    font-size: 14px;
    opacity: 0.9;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.rankitpro-blog-content {
    padding: 25px;
}

.rankitpro-blog-excerpt {
    font-size: 16px;
    line-height: 1.7;
    color: #555;
    margin-bottom: 20px;
}

.rankitpro-blog-read-more {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.rankitpro-blog-read-more:hover {
    text-decoration: underline;
}

/* Review Card Styles */
.rankitpro-review-card {
    max-width: 500px;
    margin: 20px auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 3px 12px rgba(0,0,0,0.08);
    padding: 25px;
    border: 1px solid #f0f0f0;
    position: relative;
}

.rankitpro-review-card::before {
    content: '"';
    position: absolute;
    top: -10px;
    left: 20px;
    font-size: 60px;
    color: #e0e0e0;
    font-family: serif;
}

.rankitpro-review-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
}

.rankitpro-review-rating {
    display: flex;
    gap: 2px;
}

.rankitpro-star {
    color: #ffd700;
    font-size: 18px;
}

.rankitpro-star.empty {
    color: #e0e0e0;
}

.rankitpro-review-date {
    font-size: 12px;
    color: #999;
}

.rankitpro-review-text {
    font-size: 16px;
    line-height: 1.6;
    color: #444;
    margin-bottom: 20px;
    font-style: italic;
}

.rankitpro-review-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #f0f0f0;
    padding-top: 15px;
}

.rankitpro-customer-name {
    font-weight: 600;
    color: #333;
    font-size: 14px;
}

.rankitpro-service-type {
    font-size: 12px;
    color: #666;
    background: #f8f9fa;
    padding: 4px 8px;
    border-radius: 4px;
}

/* Audio/Video Testimonial Styles */
.rankitpro-testimonial-card {
    max-width: 400px;
    margin: 20px auto;
    background: white;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    overflow: hidden;
    border: 1px solid #e8e8e8;
    transition: all 0.3s ease;
}

.rankitpro-testimonial-header {
    padding: 20px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    color: white;
    text-align: center;
}

.rankitpro-testimonial-type {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.9;
}

.rankitpro-testimonial-title {
    font-size: 18px;
    font-weight: 600;
    margin-top: 5px;
}

.rankitpro-media-container {
    padding: 20px;
    text-align: center;
}

.rankitpro-audio-player,
.rankitpro-video-player {
    width: 100%;
    border-radius: 8px;
    background: #f8f9fa;
}

.rankitpro-testimonial-meta {
    padding: 0 20px 20px 20px;
    text-align: center;
}

.rankitpro-testimonial-customer {
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
}

.rankitpro-testimonial-service {
    font-size: 12px;
    color: #666;
}

/* List Layouts */
.rankitpro-visits-list,
.rankitpro-blogs-list,
.rankitpro-reviews-list {
    display: grid;
    gap: 20px;
    margin: 20px 0;
}

.rankitpro-visits-list {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.rankitpro-blogs-list {
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
}

.rankitpro-reviews-list {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}

/* Responsive Design */
@media (max-width: 768px) {
    .rankitpro-visit-card,
    .rankitpro-blog-card,
    .rankitpro-review-card,
    .rankitpro-testimonial-card {
        margin: 15px;
        max-width: none;
    }
    
    .rankitpro-visits-list,
    .rankitpro-blogs-list,
    .rankitpro-reviews-list {
        grid-template-columns: 1fr;
        margin: 15px;
    }
    
    .rankitpro-visit-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    
    .rankitpro-photos-grid {
        grid-template-columns: 1fr;
    }
    
    .rankitpro-review-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
}

/* Loading States */
.rankitpro-loading {
    text-align: center;
    padding: 40px;
    color: #666;
}

.rankitpro-loading::after {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #333;
    border-radius: 50%;
    animation: rankitpro-spin 1s linear infinite;
    margin-left: 10px;
}

@keyframes rankitpro-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Error States */
.rankitpro-error {
    background: #fee;
    border: 1px solid #fcc;
    color: #a00;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    margin: 20px;
}

/* No Content States */
.rankitpro-no-content {
    text-align: center;
    padding: 40px;
    color: #666;
    font-style: italic;
}

/* Widget Styles */
.widget .rankitpro-widget {
    background: white;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.widget .rankitpro-widget-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 15px;
    color: #333;
    border-bottom: 2px solid #667eea;
    padding-bottom: 8px;
}

/* Shortcode Container */
.rankitpro-shortcode-container {
    margin: 20px 0;
    clear: both;
}

/* Print Styles */
@media print {
    .rankitpro-container {
        box-shadow: none !important;
        border: 1px solid #ccc !important;
    }
    
    .rankitpro-map-container {
        display: none;
    }
}`;

export const getCompleteJS = (apiKey) => `/* RankItPro WordPress Integration JavaScript - Complete Original Code */

(function($) {
    'use strict';

    // Initialize when document is ready
    $(document).ready(function() {
        initRankItPro();
    });

    function initRankItPro() {
        console.log('RankItPro WordPress Integration Loading...');
        
        // Initialize photo lightbox
        initPhotoLightbox();
        
        // Initialize map interactions
        initMapInteractions();
        
        // Initialize audio/video players
        initMediaPlayers();
        
        // Initialize lazy loading for images
        initLazyLoading();
        
        // Initialize AJAX refresh functionality
        initAutoRefresh();
        
        // Initialize star ratings
        initStarRatings();
        
        console.log('RankItPro WordPress Integration Loaded Successfully!');
    }

    // Photo lightbox functionality
    function initPhotoLightbox() {
        $('.rankitpro-photo').on('click', function(e) {
            e.preventDefault();
            
            const imgSrc = $(this).attr('src');
            const imgAlt = $(this).attr('alt') || '';
            
            // Create lightbox overlay
            const lightbox = $(\`
                <div class="rankitpro-lightbox">
                    <div class="rankitpro-lightbox-overlay"></div>
                    <div class="rankitpro-lightbox-content">
                        <img src="\${imgSrc}" alt="\${imgAlt}">
                        <button class="rankitpro-lightbox-close">&times;</button>
                    </div>
                </div>
            \`);
            
            $('body').append(lightbox);
            lightbox.fadeIn(300);
            
            // Close lightbox handlers
            lightbox.find('.rankitpro-lightbox-close, .rankitpro-lightbox-overlay').on('click', function() {
                lightbox.fadeOut(300, function() {
                    lightbox.remove();
                });
            });
            
            // Close on escape key
            $(document).on('keyup.rankitpro-lightbox', function(e) {
                if (e.keyCode === 27) {
                    lightbox.fadeOut(300, function() {
                        lightbox.remove();
                    });
                    $(document).off('keyup.rankitpro-lightbox');
                }
            });
        });
    }

    // Map interaction functionality
    function initMapInteractions() {
        $('.rankitpro-map-container').on('click', function() {
            const location = $(this).closest('.rankitpro-visit-card').find('.rankitpro-visit-location').text();
            if (location) {
                const encodedLocation = encodeURIComponent(location.replace('📍', '').trim());
                window.open(\`https://maps.google.com/maps?q=\${encodedLocation}\`, '_blank');
            }
        });
        
        // Add hover effect to maps
        $('.rankitpro-map-container').hover(
            function() {
                $(this).css('cursor', 'pointer');
                $(this).find('.rankitpro-map-placeholder').css('opacity', '0.8');
            },
            function() {
                $(this).find('.rankitpro-map-placeholder').css('opacity', '1');
            }
        );
    }

    // Media player initialization
    function initMediaPlayers() {
        // Audio player enhancements
        $('.rankitpro-audio-player').each(function() {
            const audio = this;
            const container = $(this).closest('.rankitpro-testimonial-card');
            
            audio.addEventListener('play', function() {
                container.addClass('playing');
            });
            
            audio.addEventListener('pause', function() {
                container.removeClass('playing');
            });
            
            audio.addEventListener('ended', function() {
                container.removeClass('playing');
            });
        });
        
        // Video player enhancements
        $('.rankitpro-video-player').each(function() {
            const video = this;
            const container = $(this).closest('.rankitpro-testimonial-card');
            
            video.addEventListener('play', function() {
                container.addClass('playing');
            });
            
            video.addEventListener('pause', function() {
                container.removeClass('playing');
            });
            
            video.addEventListener('ended', function() {
                container.removeClass('playing');
            });
        });
    }

    // Lazy loading for images
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // Auto-refresh functionality
    function initAutoRefresh() {
        const autoRefresh = $('.rankitpro-container').data('auto-refresh');
        const refreshInterval = $('.rankitpro-container').data('refresh-interval') || 300000; // 5 minutes default
        
        if (autoRefresh && typeof rankitpro_ajax !== 'undefined') {
            setInterval(function() {
                refreshRankItProContent();
            }, refreshInterval);
        }
    }

    // Refresh content via AJAX
    function refreshRankItProContent() {
        $('.rankitpro-container').each(function() {
            const container = $(this);
            const shortcode = container.data('shortcode');
            const params = container.data('params') || {};
            
            if (shortcode && typeof rankitpro_ajax !== 'undefined') {
                $.ajax({
                    url: rankitpro_ajax.ajax_url,
                    type: 'POST',
                    data: {
                        action: 'rankitpro_refresh_content',
                        shortcode: shortcode,
                        params: params,
                        nonce: rankitpro_ajax.nonce
                    },
                    success: function(response) {
                        if (response.success) {
                            container.html(response.data);
                            // Re-initialize features for new content
                            initPhotoLightbox();
                            initMapInteractions();
                            initMediaPlayers();
                            initStarRatings();
                        }
                    },
                    error: function() {
                        console.log('RankItPro: Failed to refresh content');
                    }
                });
            }
        });
    }

    // Star rating interaction
    function initStarRatings() {
        $('.rankitpro-review-rating').each(function() {
            const rating = $(this).data('rating');
            const stars = $(this).find('.rankitpro-star');
            
            stars.each(function(index) {
                if (index < rating) {
                    $(this).removeClass('empty');
                } else {
                    $(this).addClass('empty');
                }
            });
        });
    }

    // Smooth scrolling for anchor links
    $('a[href^="#rankitpro"]').on('click', function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 100
            }, 500);
        }
    });

    // Add loading states
    function showLoading(container) {
        container.html('<div class="rankitpro-loading">Loading content...</div>');
    }

    // Error handling
    function showError(container, message) {
        container.html(\`<div class="rankitpro-error">\${message}</div>\`);
    }

    // Initialize star ratings on page load
    $(window).on('load', function() {
        initStarRatings();
    });

})(jQuery);

// CSS for lightbox and dynamic styles (injected via JavaScript to avoid conflicts)
(function() {
    const lightboxCSS = \`
        .rankitpro-lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            display: none;
        }
        .rankitpro-lightbox-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
        }
        .rankitpro-lightbox-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            max-width: 90%;
            max-height: 90%;
        }
        .rankitpro-lightbox-content img {
            max-width: 100%;
            max-height: 100%;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
        .rankitpro-lightbox-close {
            position: absolute;
            top: -40px;
            right: 0;
            background: none;
            border: none;
            color: white;
            font-size: 30px;
            cursor: pointer;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .rankitpro-lightbox-close:hover {
            opacity: 0.7;
        }
        .rankitpro-testimonial-card.playing {
            box-shadow: 0 5px 25px rgba(255, 107, 107, 0.3);
            transform: translateY(-2px);
            transition: all 0.3s ease;
        }
        img.lazy {
            opacity: 0;
            transition: opacity 0.3s;
        }
        img.lazy.loaded {
            opacity: 1;
        }
        .rankitpro-map-container:hover .rankitpro-map-placeholder {
            opacity: 0.8;
        }
    \`;
    
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = lightboxCSS;
    document.getElementsByTagName('head')[0].appendChild(style);
})();`;
/* RankItPro WordPress Integration JavaScript */

(function($) {
    'use strict';

    // Initialize when document is ready
    $(document).ready(function() {
        initRankItPro();
    });

    function initRankItPro() {
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
    }

    // Photo lightbox functionality
    function initPhotoLightbox() {
        $('.rankitpro-photo').on('click', function(e) {
            e.preventDefault();
            
            const imgSrc = $(this).attr('src');
            const imgAlt = $(this).attr('alt') || '';
            
            // Create lightbox overlay
            const lightbox = $(`
                <div class="rankitpro-lightbox">
                    <div class="rankitpro-lightbox-overlay"></div>
                    <div class="rankitpro-lightbox-content">
                        <img src="${imgSrc}" alt="${imgAlt}">
                        <button class="rankitpro-lightbox-close">&times;</button>
                    </div>
                </div>
            `);
            
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
                window.open(`https://maps.google.com/maps?q=${encodedLocation}`, '_blank');
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
        
        if (autoRefresh && rankitpro_ajax) {
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
            
            if (shortcode) {
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
                        }
                    },
                    error: function() {
                        logger.info('RankItPro: Failed to refresh content');
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
        container.html(`<div class="rankitpro-error">${message}</div>`);
    }

    // Initialize star ratings on page load
    $(window).on('load', function() {
        initStarRatings();
    });

})(jQuery);

// CSS for lightbox (injected via JavaScript to avoid conflicts)
(function() {
    const lightboxCSS = `
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
    `;
    
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = lightboxCSS;
    document.getElementsByTagName('head')[0].appendChild(style);
})();
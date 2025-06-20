<?php
/**
 * Plugin Name: Rank It Pro Integration
 * Description: Display technician visits and customer reviews from Rank It Pro on your WordPress site
 * Version: 1.0.0
 * Author: Rank It Pro
 * Text Domain: rankitpro
 * Domain Path: /languages
 * License: GPL v2 or later
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class RankItProIntegration {
    private $version = '1.0.0';
    private $plugin_url;
    private $plugin_path;
    
    public function __construct() {
        $this->plugin_url = plugin_dir_url(__FILE__);
        $this->plugin_path = plugin_dir_path(__FILE__);
        
        // Initialize plugin
        add_action('init', array($this, 'init'));
        
        // Activation/deactivation hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Admin hooks
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
        add_action('admin_notices', array($this, 'admin_notices'));
        
        // Frontend hooks
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        
        // Shortcodes
        add_shortcode('rankitpro_visits', array($this, 'visits_shortcode'));
        add_shortcode('rankitpro_reviews', array($this, 'reviews_shortcode'));
        add_shortcode('rankitpro_testimonials', array($this, 'testimonials_shortcode'));
        add_shortcode('rankitpro_recent_work', array($this, 'recent_work_shortcode'));
        add_shortcode('rankitpro_technician_profile', array($this, 'technician_profile_shortcode'));
        add_shortcode('rankitpro_blog', array($this, 'blog_shortcode'));
        add_shortcode('rankitpro_video_testimonials', array($this, 'video_testimonials_shortcode'));
        
        // Widget
        add_action('widgets_init', array($this, 'register_widgets'));
        
        // Translation support
        add_action('plugins_loaded', array($this, 'load_textdomain'));
    }
    
    public function init() {
        // Plugin initialization
    }
    
    public function activate() {
        // Set default options
        add_option('rankitpro_api_key', '{{API_KEY}}');
        add_option('rankitpro_api_endpoint', '{{API_ENDPOINT}}');
        add_option('rankitpro_cache_duration', 3600);
        add_option('rankitpro_show_photos', 1);
        add_option('rankitpro_auto_refresh', 1);
        add_option('rankitpro_version', $this->version);
        
        // Flush rewrite rules
        flush_rewrite_rules();
        
        // Set activation notice flag
        set_transient('rankitpro_activation_notice', true, 30);
    }
    
    public function deactivate() {
        // Clean up
        delete_transient('rankitpro_activation_notice');
        delete_transient('rankitpro_api_test_result');
        flush_rewrite_rules();
    }
    
    public function load_textdomain() {
        load_plugin_textdomain('rankitpro', false, dirname(plugin_basename(__FILE__)) . '/languages/');
    }
    
    public function admin_menu() {
        add_options_page(
            __('Rank It Pro Settings', 'rankitpro'),
            __('Rank It Pro', 'rankitpro'),
            'manage_options',
            'rankitpro-settings',
            array($this, 'settings_page')
        );
    }
    
    public function admin_init() {
        // Register settings
        register_setting('rankitpro_settings', 'rankitpro_api_key', array(
            'sanitize_callback' => 'sanitize_text_field'
        ));
        register_setting('rankitpro_settings', 'rankitpro_api_endpoint', array(
            'sanitize_callback' => 'esc_url_raw'
        ));
        register_setting('rankitpro_settings', 'rankitpro_cache_duration', array(
            'sanitize_callback' => 'absint'
        ));
        register_setting('rankitpro_settings', 'rankitpro_show_photos', array(
            'sanitize_callback' => 'rest_sanitize_boolean'
        ));
        register_setting('rankitpro_settings', 'rankitpro_auto_refresh', array(
            'sanitize_callback' => 'rest_sanitize_boolean'
        ));
        register_setting('rankitpro_settings', 'rankitpro_enable_schema', array(
            'sanitize_callback' => 'rest_sanitize_boolean'
        ));
        register_setting('rankitpro_settings', 'rankitpro_business_name');
        register_setting('rankitpro_settings', 'rankitpro_business_phone');
        register_setting('rankitpro_settings', 'rankitpro_business_address');
    }
    
    public function admin_notices() {
        // Activation notice
        if (get_transient('rankitpro_activation_notice')) {
            echo '<div class="notice notice-success is-dismissible">';
            echo '<p><strong>' . __('Rank It Pro activated!', 'rankitpro') . '</strong> ';
            echo __('Configure your API settings to get started.', 'rankitpro');
            echo ' <a href="' . admin_url('options-general.php?page=rankitpro-settings') . '">';
            echo __('Go to Settings', 'rankitpro') . '</a></p>';
            echo '</div>';
            delete_transient('rankitpro_activation_notice');
        }
        
        // API key missing notice
        $api_key = get_option('rankitpro_api_key', '');
        if (empty($api_key) || $api_key === '{{API_KEY}}') {
            echo '<div class="notice notice-warning">';
            echo '<p><strong>' . __('Rank It Pro:', 'rankitpro') . '</strong> ';
            echo __('Please configure your API key to start displaying content.', 'rankitpro');
            echo ' <a href="' . admin_url('options-general.php?page=rankitpro-settings') . '">';
            echo __('Configure Now', 'rankitpro') . '</a></p>';
            echo '</div>';
        }
    }
    
    public function settings_page() {
        // Handle form submission
        if (isset($_POST['test_connection']) && wp_verify_nonce($_POST['_wpnonce'], 'rankitpro_test')) {
            $test_result = $this->test_api_connection();
            set_transient('rankitpro_api_test_result', $test_result, 30);
        }
        
        $api_key = get_option('rankitpro_api_key', '');
        $api_endpoint = get_option('rankitpro_api_endpoint', '');
        $cache_duration = get_option('rankitpro_cache_duration', 3600);
        $show_photos = get_option('rankitpro_show_photos', 1);
        $auto_refresh = get_option('rankitpro_auto_refresh', 1);
        $test_result = get_transient('rankitpro_api_test_result');
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <div class="nav-tab-wrapper">
                <a href="#settings" class="nav-tab nav-tab-active" id="settings-tab"><?php _e('Settings', 'rankitpro'); ?></a>
                <a href="#shortcodes" class="nav-tab" id="shortcodes-tab"><?php _e('Shortcodes', 'rankitpro'); ?></a>
                <a href="#examples" class="nav-tab" id="examples-tab"><?php _e('Examples', 'rankitpro'); ?></a>
            </div>
            
            <!-- Settings Tab -->
            <div id="settings-content" class="tab-content">
                <form method="post" action="options.php">
                    <?php settings_fields('rankitpro_settings'); ?>
                    
                    <h2><?php _e('API Configuration', 'rankitpro'); ?></h2>
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="rankitpro_api_key"><?php _e('API Key', 'rankitpro'); ?></label>
                            </th>
                            <td>
                                <input type="text" id="rankitpro_api_key" name="rankitpro_api_key" 
                                       value="<?php echo esc_attr($api_key); ?>" class="regular-text" 
                                       placeholder="<?php _e('Enter your API key', 'rankitpro'); ?>" />
                                <p class="description">
                                    <?php _e('Get your API key from your Rank It Pro company dashboard.', 'rankitpro'); ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="rankitpro_api_endpoint"><?php _e('API Endpoint', 'rankitpro'); ?></label>
                            </th>
                            <td>
                                <input type="url" id="rankitpro_api_endpoint" name="rankitpro_api_endpoint" 
                                       value="<?php echo esc_attr($api_endpoint); ?>" class="regular-text" />
                                <p class="description">
                                    <?php _e('Your Rank It Pro API endpoint URL.', 'rankitpro'); ?>
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <h2><?php _e('Display Options', 'rankitpro'); ?></h2>
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="rankitpro_enable_schema"><?php _e('Enable Schema.org Markup', 'rankitpro'); ?></label>
                            </th>
                            <td>
                                <input type="checkbox" id="rankitpro_enable_schema" name="rankitpro_enable_schema" 
                                       value="1" <?php checked(get_option('rankitpro_enable_schema', 1)); ?> />
                                <p class="description">
                                    <?php _e('Automatically generate Schema.org structured data for better SEO and local search visibility.', 'rankitpro'); ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="rankitpro_business_name"><?php _e('Business Name', 'rankitpro'); ?></label>
                            </th>
                            <td>
                                <input type="text" id="rankitpro_business_name" name="rankitpro_business_name" 
                                       value="<?php echo esc_attr(get_option('rankitpro_business_name', get_bloginfo('name'))); ?>" class="regular-text" />
                                <p class="description">
                                    <?php _e('Business name for Schema.org markup (defaults to site title).', 'rankitpro'); ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="rankitpro_business_phone"><?php _e('Business Phone', 'rankitpro'); ?></label>
                            </th>
                            <td>
                                <input type="tel" id="rankitpro_business_phone" name="rankitpro_business_phone" 
                                       value="<?php echo esc_attr(get_option('rankitpro_business_phone', '')); ?>" class="regular-text" />
                                <p class="description">
                                    <?php _e('Business phone number for local search optimization.', 'rankitpro'); ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="rankitpro_business_address"><?php _e('Business Address', 'rankitpro'); ?></label>
                            </th>
                            <td>
                                <textarea id="rankitpro_business_address" name="rankitpro_business_address" 
                                          class="regular-text" rows="3"><?php echo esc_textarea(get_option('rankitpro_business_address', '')); ?></textarea>
                                <p class="description">
                                    <?php _e('Business address for local Schema.org markup.', 'rankitpro'); ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><?php _e('Show Photos', 'rankitpro'); ?></th>
                            <td>
                                <label for="rankitpro_show_photos">
                                    <input type="checkbox" id="rankitpro_show_photos" name="rankitpro_show_photos" 
                                           value="1" <?php checked(1, $show_photos); ?> />
                                    <?php _e('Display photos in visits and reviews', 'rankitpro'); ?>
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><?php _e('Auto Refresh', 'rankitpro'); ?></th>
                            <td>
                                <label for="rankitpro_auto_refresh">
                                    <input type="checkbox" id="rankitpro_auto_refresh" name="rankitpro_auto_refresh" 
                                           value="1" <?php checked(1, $auto_refresh); ?> />
                                    <?php _e('Automatically refresh content from API', 'rankitpro'); ?>
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="rankitpro_cache_duration"><?php _e('Cache Duration', 'rankitpro'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="rankitpro_cache_duration" name="rankitpro_cache_duration" 
                                       value="<?php echo esc_attr($cache_duration); ?>" min="300" max="86400" class="small-text" />
                                <span><?php _e('seconds', 'rankitpro'); ?></span>
                                <p class="description">
                                    <?php _e('How long to cache API responses (300-86400 seconds).', 'rankitpro'); ?>
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <?php submit_button(); ?>
                </form>
                
                <!-- Connection Test -->
                <h2><?php _e('Connection Test', 'rankitpro'); ?></h2>
                <form method="post">
                    <?php wp_nonce_field('rankitpro_test'); ?>
                    <p>
                        <input type="submit" name="test_connection" class="button button-secondary" 
                               value="<?php _e('Test API Connection', 'rankitpro'); ?>" />
                    </p>
                    <?php if ($test_result !== false): ?>
                        <div class="notice notice-<?php echo $test_result['success'] ? 'success' : 'error'; ?>">
                            <p><?php echo esc_html($test_result['message']); ?></p>
                        </div>
                    <?php endif; ?>
                </form>
            </div>
            
            <!-- Shortcodes Tab -->
            <div id="shortcodes-content" class="tab-content" style="display: none;">
                <h2><?php _e('Available Shortcodes', 'rankitpro'); ?></h2>
                <p><?php _e('Use these shortcodes to display content from Rank It Pro anywhere on your site.', 'rankitpro'); ?></p>
                
                <div class="shortcode-section">
                    <h3><?php _e('Recent Technician Visits', 'rankitpro'); ?></h3>
                    <code>[rankitpro_visits]</code>
                    <p><?php _e('Display recent technician visits and job completions.', 'rankitpro'); ?></p>
                    <h4><?php _e('Parameters:', 'rankitpro'); ?></h4>
                    <ul>
                        <li><strong>limit</strong> - <?php _e('Number of visits to show (default: 5)', 'rankitpro'); ?></li>
                        <li><strong>type</strong> - <?php _e('Filter by job type (default: all)', 'rankitpro'); ?></li>
                        <li><strong>technician</strong> - <?php _e('Filter by technician ID (default: all)', 'rankitpro'); ?></li>
                        <li><strong>show_photos</strong> - <?php _e('Show photos (true/false, default: true)', 'rankitpro'); ?></li>
                    </ul>
                </div>
                
                <div class="shortcode-section">
                    <h3><?php _e('Customer Reviews', 'rankitpro'); ?></h3>
                    <code>[rankitpro_reviews]</code>
                    <p><?php _e('Display customer reviews and testimonials.', 'rankitpro'); ?></p>
                    <h4><?php _e('Parameters:', 'rankitpro'); ?></h4>
                    <ul>
                        <li><strong>limit</strong> - <?php _e('Number of reviews to show (default: 5)', 'rankitpro'); ?></li>
                        <li><strong>rating</strong> - <?php _e('Minimum star rating (1-5, default: all)', 'rankitpro'); ?></li>
                        <li><strong>show_photos</strong> - <?php _e('Show photos (true/false, default: true)', 'rankitpro'); ?></li>
                        <li><strong>show_names</strong> - <?php _e('Show customer names (true/false, default: true)', 'rankitpro'); ?></li>
                    </ul>
                </div>
                
                <div class="shortcode-section">
                    <h3><?php _e('Customer Testimonials', 'rankitpro'); ?></h3>
                    <code>[rankitpro_testimonials]</code>
                    <p><?php _e('Display featured customer testimonials with rich formatting.', 'rankitpro'); ?></p>
                    <h4><?php _e('Parameters:', 'rankitpro'); ?></h4>
                    <ul>
                        <li><strong>limit</strong> - <?php _e('Number of testimonials to show (default: 3)', 'rankitpro'); ?></li>
                        <li><strong>style</strong> - <?php _e('Display style (grid/slider/list, default: grid)', 'rankitpro'); ?></li>
                        <li><strong>show_ratings</strong> - <?php _e('Show star ratings (true/false, default: true)', 'rankitpro'); ?></li>
                    </ul>
                </div>
                
                <div class="shortcode-section">
                    <h3><?php _e('Recent Work Gallery', 'rankitpro'); ?></h3>
                    <code>[rankitpro_recent_work]</code>
                    <p><?php _e('Display a gallery of recent work photos from completed jobs.', 'rankitpro'); ?></p>
                    <h4><?php _e('Parameters:', 'rankitpro'); ?></h4>
                    <ul>
                        <li><strong>limit</strong> - <?php _e('Number of photos to show (default: 12)', 'rankitpro'); ?></li>
                        <li><strong>columns</strong> - <?php _e('Number of columns (2-6, default: 3)', 'rankitpro'); ?></li>
                        <li><strong>type</strong> - <?php _e('Filter by job type (default: all)', 'rankitpro'); ?></li>
                        <li><strong>lightbox</strong> - <?php _e('Enable lightbox view (true/false, default: true)', 'rankitpro'); ?></li>
                    </ul>
                </div>
                
                <div class="shortcode-section">
                    <h3><?php _e('Service Blog Posts', 'rankitpro'); ?></h3>
                    <code>[rankitpro_blog]</code>
                    <p><?php _e('Display professional service blog posts with detailed case studies.', 'rankitpro'); ?></p>
                    <h4><?php _e('Parameters:', 'rankitpro'); ?></h4>
                    <ul>
                        <li><strong>limit</strong> - <?php _e('Number of blog posts to show (default: 5)', 'rankitpro'); ?></li>
                        <li><strong>type</strong> - <?php _e('Filter by service type (default: all)', 'rankitpro'); ?></li>
                        <li><strong>show_full</strong> - <?php _e('Show full blog posts (true/false, default: false)', 'rankitpro'); ?></li>
                        <li><strong>technician</strong> - <?php _e('Filter by technician (default: all)', 'rankitpro'); ?></li>
                    </ul>
                </div>
                
                <div class="shortcode-section">
                    <h3><?php _e('Video Testimonials', 'rankitpro'); ?></h3>
                    <code>[rankitpro_video_testimonials]</code>
                    <p><?php _e('Display professional video testimonials with interactive player controls.', 'rankitpro'); ?></p>
                    <h4><?php _e('Parameters:', 'rankitpro'); ?></h4>
                    <ul>
                        <li><strong>limit</strong> - <?php _e('Number of videos to show (default: 3)', 'rankitpro'); ?></li>
                        <li><strong>show_controls</strong> - <?php _e('Show video controls (true/false, default: true)', 'rankitpro'); ?></li>
                        <li><strong>show_transcript</strong> - <?php _e('Show video transcript (true/false, default: true)', 'rankitpro'); ?></li>
                        <li><strong>show_related</strong> - <?php _e('Show related videos (true/false, default: true)', 'rankitpro'); ?></li>
                        <li><strong>autoplay</strong> - <?php _e('Enable autoplay (true/false, default: false)', 'rankitpro'); ?></li>
                    </ul>
                </div>
                
                <div class="shortcode-section">
                    <h3><?php _e('Technician Profile', 'rankitpro'); ?></h3>
                    <code>[rankitpro_technician_profile]</code>
                    <p><?php _e('Display technician profile with recent work and reviews.', 'rankitpro'); ?></p>
                    <h4><?php _e('Parameters:', 'rankitpro'); ?></h4>
                    <ul>
                        <li><strong>technician_id</strong> - <?php _e('Technician ID to display (required)', 'rankitpro'); ?></li>
                        <li><strong>show_recent_work</strong> - <?php _e('Show recent work (true/false, default: true)', 'rankitpro'); ?></li>
                        <li><strong>show_reviews</strong> - <?php _e('Show customer reviews (true/false, default: true)', 'rankitpro'); ?></li>
                        <li><strong>work_limit</strong> - <?php _e('Number of recent jobs to show (default: 5)', 'rankitpro'); ?></li>
                    </ul>
                </div>
            </div>
            
            <!-- Examples Tab -->
            <div id="examples-content" class="tab-content" style="display: none;">
                <h2><?php _e('Shortcode Examples', 'rankitpro'); ?></h2>
                
                <div class="example-section">
                    <h3><?php _e('Basic Usage', 'rankitpro'); ?></h3>
                    <p><code>[rankitpro_visits]</code></p>
                    <p><?php _e('Show 5 most recent visits with default settings.', 'rankitpro'); ?></p>
                    
                    <p><code>[rankitpro_reviews limit="10"]</code></p>
                    <p><?php _e('Show 10 most recent customer reviews.', 'rankitpro'); ?></p>
                </div>
                
                <div class="example-section">
                    <h3><?php _e('Advanced Usage', 'rankitpro'); ?></h3>
                    <p><code>[rankitpro_visits limit="8" type="plumbing" show_photos="true"]</code></p>
                    <p><?php _e('Show 8 recent plumbing visits with photos.', 'rankitpro'); ?></p>
                    
                    <p><code>[rankitpro_reviews limit="6" rating="4" show_names="false"]</code></p>
                    <p><?php _e('Show 6 reviews with 4+ stars, hide customer names.', 'rankitpro'); ?></p>
                    
                    <p><code>[rankitpro_recent_work limit="15" columns="4" type="electrical"]</code></p>
                    <p><?php _e('Show 15 electrical work photos in 4 columns.', 'rankitpro'); ?></p>
                </div>
                
                <div class="example-section">
                    <h3><?php _e('Specialized Displays', 'rankitpro'); ?></h3>
                    <p><code>[rankitpro_testimonials style="slider" limit="5"]</code></p>
                    <p><?php _e('Display 5 testimonials in a rotating slider.', 'rankitpro'); ?></p>
                    
                    <p><code>[rankitpro_technician_profile technician_id="123" work_limit="10"]</code></p>
                    <p><?php _e('Show profile for technician #123 with 10 recent jobs.', 'rankitpro'); ?></p>
                </div>
            </div>
        </div>
        
        <style>
        .shortcode-section, .example-section {
            margin-bottom: 30px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background: #f9f9f9;
        }
        .shortcode-section h3, .example-section h3 {
            margin-top: 0;
            color: #23282d;
        }
        .shortcode-section code, .example-section code {
            background: #333;
            color: #fff;
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 14px;
        }
        .tab-content {
            margin-top: 20px;
        }
        </style>
        
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Tab functionality
            var tabs = document.querySelectorAll('.nav-tab');
            var contents = document.querySelectorAll('.tab-content');
            
            tabs.forEach(function(tab) {
                tab.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active class from all tabs
                    tabs.forEach(function(t) { t.classList.remove('nav-tab-active'); });
                    contents.forEach(function(c) { c.style.display = 'none'; });
                    
                    // Add active class to clicked tab
                    this.classList.add('nav-tab-active');
                    
                    // Show corresponding content
                    var target = this.getAttribute('href').substring(1) + '-content';
                    var targetContent = document.getElementById(target);
                    if (targetContent) {
                        targetContent.style.display = 'block';
                    }
                });
            });
        });
        </script>
        <?php
    }
    
    public function enqueue_scripts() {
        // Enqueue the main RankItPro stylesheet
        wp_enqueue_style('rankitpro-styles', $this->plugin_url . 'rankitpro-styles.css', array(), $this->version);
        
        // Enqueue optional JavaScript for interactive features
        wp_enqueue_script('rankitpro-script', $this->plugin_url . 'rankitpro-script.js', array('jquery'), $this->version, true);
        
        // Localize script for AJAX calls
        wp_localize_script('rankitpro-script', 'rankitpro_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('rankitpro_nonce')
        ));
    }
    
    // Shortcode handlers
    public function visits_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 5,
            'type' => 'all',
            'technician' => 'all',
            'show_photos' => 'true'
        ), $atts, 'rankitpro_visits');
        
        $visits = $this->get_api_data('visits', $atts);
        return $this->render_visits($visits, $atts);
    }
    
    public function reviews_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 5,
            'rating' => 'all',
            'show_photos' => 'true',
            'show_names' => 'true'
        ), $atts, 'rankitpro_reviews');
        
        $reviews = $this->get_api_data('reviews', $atts);
        return $this->render_reviews($reviews, $atts);
    }
    
    public function testimonials_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 3,
            'style' => 'grid',
            'show_ratings' => 'true'
        ), $atts, 'rankitpro_testimonials');
        
        $testimonials = $this->get_api_data('testimonials', $atts);
        return $this->render_testimonials($testimonials, $atts);
    }
    
    public function recent_work_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 12,
            'columns' => 3,
            'type' => 'all',
            'lightbox' => 'true'
        ), $atts, 'rankitpro_recent_work');
        
        $work = $this->get_api_data('recent_work', $atts);
        return $this->render_recent_work($work, $atts);
    }
    
    public function technician_profile_shortcode($atts) {
        $atts = shortcode_atts(array(
            'technician_id' => '',
            'show_recent_work' => 'true',
            'show_reviews' => 'true',
            'work_limit' => 5
        ), $atts, 'rankitpro_technician_profile');
        
        if (empty($atts['technician_id'])) {
            return '<p>' . __('Error: technician_id parameter is required', 'rankitpro') . '</p>';
        }
        
        $profile = $this->get_api_data('technician_profile', $atts);
        return $this->render_technician_profile($profile, $atts);
    }
    
    public function blog_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 5,
            'type' => 'all',
            'show_full' => 'false',
            'technician' => 'all'
        ), $atts, 'rankitpro_blog');
        
        $blogs = $this->get_api_data('blogs', $atts);
        return $this->render_blogs($blogs, $atts);
    }
    
    public function video_testimonials_shortcode($atts) {
        $atts = shortcode_atts(array(
            'limit' => 3,
            'show_controls' => 'true',
            'show_transcript' => 'true',
            'show_related' => 'true',
            'autoplay' => 'false'
        ), $atts, 'rankitpro_video_testimonials');
        
        $videos = $this->get_api_data('video_testimonials', $atts);
        return $this->render_video_testimonials($videos, $atts);
    }
    
    // API and rendering methods
    private function get_api_data($endpoint, $params = array()) {
        $api_key = get_option('rankitpro_api_key', '');
        $api_endpoint = get_option('rankitpro_api_endpoint', '');
        
        if (empty($api_key) || empty($api_endpoint)) {
            return array();
        }
        
        $cache_key = 'rankitpro_' . $endpoint . '_' . md5(serialize($params));
        $cached_data = get_transient($cache_key);
        
        if ($cached_data !== false) {
            return $cached_data;
        }
        
        $url = rtrim($api_endpoint, '/') . '/api/wordpress/public/' . $endpoint;
        $url = add_query_arg(array_merge($params, array('apiKey' => $api_key)), $url);
        
        $response = wp_remote_get($url, array(
            'timeout' => 15,
            'sslverify' => true
        ));
        
        if (is_wp_error($response)) {
            error_log('Rank It Pro API Error: ' . $response->get_error_message());
            return array();
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data || isset($data['error'])) {
            error_log('Rank It Pro API Response Error: ' . ($data['error'] ?? 'Unknown error'));
            return array();
        }
        
        $cache_duration = get_option('rankitpro_cache_duration', 3600);
        set_transient($cache_key, $data, $cache_duration);
        
        return $data;
    }
    
    // Schema.org markup generation methods
    private function generate_local_business_schema() {
        $business_name = get_option('rankitpro_business_name', get_bloginfo('name'));
        $business_phone = get_option('rankitpro_business_phone', '');
        $business_address = get_option('rankitpro_business_address', '');
        
        $schema = array(
            '@context' => 'https://schema.org',
            '@type' => 'LocalBusiness',
            'name' => $business_name,
            'description' => 'Professional service provider offering quality maintenance and repair services',
            'url' => home_url(),
            'telephone' => $business_phone,
            'address' => array(
                '@type' => 'PostalAddress',
                'streetAddress' => $business_address
            ),
            'serviceType' => array('HVAC', 'Plumbing', 'Electrical', 'General Maintenance'),
            'areaServed' => array(
                '@type' => 'State',
                'name' => 'Local Area'
            )
        );
        
        return '<script type="application/ld+json">' . json_encode($schema, JSON_PRETTY_PRINT) . '</script>';
    }
    
    private function generate_service_schema($visit) {
        $business_name = get_option('rankitpro_business_name', get_bloginfo('name'));
        
        $schema = array(
            '@context' => 'https://schema.org',
            '@type' => 'Service',
            'name' => $visit['jobType'] ?? 'Professional Service',
            'description' => $visit['notes'] ?? 'Professional service completed',
            'provider' => array(
                '@type' => 'LocalBusiness',
                'name' => $business_name,
                'url' => home_url()
            ),
            'serviceType' => $visit['jobType'] ?? 'General Service',
            'dateModified' => date('c', strtotime($visit['createdAt'] ?? 'now'))
        );
        
        if (!empty($visit['photoUrls'])) {
            $schema['image'] = array_map(function($photo) use ($visit) {
                return array(
                    '@type' => 'ImageObject',
                    'url' => $photo,
                    'caption' => ($visit['jobType'] ?? 'Service') . ' documentation photo'
                );
            }, $visit['photoUrls']);
        }
        
        return '<script type="application/ld+json">' . json_encode($schema, JSON_PRETTY_PRINT) . '</script>';
    }
    
    private function generate_review_schema($review) {
        $business_name = get_option('rankitpro_business_name', get_bloginfo('name'));
        
        $schema = array(
            '@context' => 'https://schema.org',
            '@type' => 'Review',
            'reviewRating' => array(
                '@type' => 'Rating',
                'ratingValue' => $review['rating'] ?? 5,
                'bestRating' => 5,
                'worstRating' => 1
            ),
            'author' => array(
                '@type' => 'Person',
                'name' => $review['customerName'] ?? 'Satisfied Customer'
            ),
            'reviewBody' => $review['comment'] ?? 'Excellent service provided',
            'datePublished' => date('c', strtotime($review['createdAt'] ?? 'now')),
            'itemReviewed' => array(
                '@type' => 'LocalBusiness',
                'name' => $business_name,
                'serviceType' => $review['serviceType'] ?? 'Professional Service'
            )
        );
        
        return '<script type="application/ld+json">' . json_encode($schema, JSON_PRETTY_PRINT) . '</script>';
    }
    
    private function generate_aggregate_rating_schema($reviews) {
        if (empty($reviews)) return '';
        
        $business_name = get_option('rankitpro_business_name', get_bloginfo('name'));
        $total_rating = array_sum(array_column($reviews, 'rating'));
        $average_rating = $total_rating / count($reviews);
        
        $schema = array(
            '@context' => 'https://schema.org',
            '@type' => 'LocalBusiness',
            'name' => $business_name,
            'aggregateRating' => array(
                '@type' => 'AggregateRating',
                'ratingValue' => round($average_rating, 1),
                'reviewCount' => count($reviews),
                'bestRating' => 5,
                'worstRating' => 1
            )
        );
        
        return '<script type="application/ld+json">' . json_encode($schema, JSON_PRETTY_PRINT) . '</script>';
    }
    
    private function generate_blog_posting_schema($post) {
        $business_name = get_option('rankitpro_business_name', get_bloginfo('name'));
        
        $schema = array(
            '@context' => 'https://schema.org',
            '@type' => 'BlogPosting',
            'headline' => $post['title'] ?? 'Service Case Study',
            'articleBody' => $post['content'] ?? 'Professional service documentation',
            'datePublished' => date('c', strtotime($post['createdAt'] ?? 'now')),
            'author' => array(
                '@type' => 'Organization',
                'name' => $business_name
            ),
            'publisher' => array(
                '@type' => 'Organization',
                'name' => $business_name
            ),
            'mainEntityOfPage' => array(
                '@type' => 'WebPage',
                '@id' => get_permalink()
            ),
            'keywords' => array($post['serviceType'] ?? 'professional service', 'case study', 'documentation'),
            'articleSection' => 'Service Case Studies'
        );
        
        if (!empty($post['images'])) {
            $schema['image'] = array_map(function($image) {
                return array(
                    '@type' => 'ImageObject',
                    'url' => $image,
                    'caption' => 'Service documentation photo'
                );
            }, $post['images']);
        }
        
        return '<script type="application/ld+json">' . json_encode($schema, JSON_PRETTY_PRINT) . '</script>';
    }

    private function render_visits($visits, $atts) {
        if (empty($visits)) {
            return '<p>' . __('No recent visits available.', 'rankitpro') . '</p>';
        }
        
        $output = '';
        
        // Add schema markup for local business
        if (get_option('rankitpro_enable_schema', true)) {
            $output .= $this->generate_local_business_schema();
            
            // Add service schema for each visit
            foreach ($visits as $visit) {
                $output .= $this->generate_service_schema($visit);
            }
        }
        
        $output .= '<div class="rankitpro-visits">';
        foreach ($visits as $visit) {
            $output .= '<div class="rankitpro-visit-item">';
            $output .= '<h4>' . esc_html($visit['jobType'] ?? 'Service Visit') . '</h4>';
            if (!empty($visit['notes'])) {
                $output .= '<p>' . esc_html($visit['notes']) . '</p>';
            }
            if ($atts['show_photos'] === 'true' && !empty($visit['photoUrls'])) {
                $output .= '<div class="rankitpro-photos">';
                foreach ($visit['photoUrls'] as $photo) {
                    $output .= '<img src="' . esc_url($photo) . '" alt="' . __('Visit photo', 'rankitpro') . '" />';
                }
                $output .= '</div>';
            }
            $output .= '<div class="rankitpro-meta">' . date('F j, Y', strtotime($visit['createdAt'])) . '</div>';
            $output .= '</div>';
        }
        $output .= '</div>';
        
        return $output;
    }
    
    private function render_reviews($reviews, $atts) {
        if (empty($reviews)) {
            return '<div class="rankitpro-no-content">' . __('No customer reviews available.', 'rankitpro') . '</div>';
        }
        
        $output = '<div class="rankitpro-reviews-container">';
        
        foreach ($reviews as $review) {
            $output .= '<div class="review-container">';
            
            // Review Header
            $output .= '<div class="review-header">';
            $output .= '<h1 class="review-title">Customer Review</h1>';
            
            $output .= '<div class="customer-info">';
            if ($atts['show_names'] === 'true') {
                $output .= '<span class="customer-name">Customer: ' . esc_html($review['customerName'] ?? 'Customer') . '</span>';
            } else {
                $output .= '<span class="customer-name">Verified Customer</span>';
            }
            $output .= '<span class="review-date">' . date('F j, Y', strtotime($review['respondedAt'] ?? $review['createdAt'])) . '</span>';
            $output .= '</div>';
            
            // Location
            if (!empty($review['location'])) {
                $output .= '<div class="review-location">' . esc_html($review['location']) . '</div>';
            }
            
            // Star Rating
            if (!empty($review['rating'])) {
                $output .= '<div class="star-rating">';
                $output .= '<div class="stars">';
                for ($i = 1; $i <= 5; $i++) {
                    $starClass = $i <= $review['rating'] ? 'star' : 'star empty';
                    $output .= '<span class="' . $starClass . '">★</span>';
                }
                $output .= '</div>';
                $output .= '<span class="rating-text">' . $review['rating'] . '.0 out of 5 stars</span>';
                $output .= '</div>';
            }
            
            $output .= '<div class="verified-badge">Verified Purchase</div>';
            $output .= '</div>';
            
            // Map Container (if location coordinates available)
            if (!empty($review['latitude']) && !empty($review['longitude'])) {
                $output .= '<div class="map-container">';
                $output .= '<div class="map-placeholder">';
                $output .= '<div class="map-marker"></div>';
                $output .= '<div class="map-controls">';
                $output .= '<button class="map-btn">+</button>';
                $output .= '<button class="map-btn">−</button>';
                $output .= '</div>';
                $output .= '</div>';
                $output .= '</div>';
            }
            
            // Review Content
            $output .= '<div class="review-content">';
            
            if (!empty($review['feedback'])) {
                $output .= '<div class="review-text">' . esc_html($review['feedback']) . '</div>';
            }
            
            // Service Details (if available from related job)
            if (!empty($review['serviceDetails'])) {
                $output .= '<div class="service-details">';
                $output .= '<div class="service-title">Services Completed:</div>';
                $output .= '<ul class="service-list">';
                foreach ($review['serviceDetails'] as $service) {
                    $output .= '<li class="service-item">' . esc_html($service) . '</li>';
                }
                $output .= '</ul>';
                $output .= '</div>';
            }
            
            // Photos Section
            if ($atts['show_photos'] === 'true' && !empty($review['photos'])) {
                $output .= '<div class="photos-section">';
                $output .= '<div class="photos-grid">';
                
                foreach ($review['photos'] as $index => $photo) {
                    $label = $index === 0 ? 'Before' : 'After';
                    $photoClass = $index === 0 ? 'before-photo' : 'after-photo';
                    
                    $output .= '<div class="photo-container">';
                    $output .= '<img class="photo ' . $photoClass . '" src="' . esc_url($photo) . '" alt="' . __('Service photo', 'rankitpro') . '" />';
                    $output .= '<div class="photo-label">' . $label . '</div>';
                    $output .= '</div>';
                }
                
                $output .= '</div>';
                $output .= '</div>';
            }
            
            // Recommendation
            if (!empty($review['wouldRecommend']) && $review['wouldRecommend']) {
                $output .= '<div class="recommendation">';
                $output .= '<div class="recommendation-text">';
                $output .= 'I would definitely recommend this service to anyone needing professional repairs. Excellent results!';
                $output .= '</div>';
                $output .= '</div>';
            }
            
            $output .= '</div>';
            
            // Helpful Section
            $output .= '<div class="helpful-section">';
            $output .= '<span class="helpful-text">Was this review helpful?</span>';
            $output .= '<div class="helpful-buttons">';
            $output .= '<button class="helpful-btn">👍 Yes</button>';
            $output .= '<button class="helpful-btn">👎 No</button>';
            $output .= '</div>';
            $output .= '</div>';
            
            // Hashtags
            if (!empty($review['jobType']) || !empty($review['location'])) {
                $output .= '<div class="hashtags">';
                
                if (!empty($review['jobType'])) {
                    $jobType = strtolower(str_replace(' ', '-', $review['jobType']));
                    $output .= '<a href="#" class="hashtag">#' . $jobType . '</a>';
                }
                
                if (!empty($review['city'])) {
                    $city = strtolower(str_replace(' ', '', $review['city']));
                    $output .= '<a href="#" class="hashtag">#' . $city . '</a>';
                }
                
                $output .= '<a href="#" class="hashtag">#excellent-service</a>';
                $output .= '<a href="#" class="hashtag">#professional-repair</a>';
                
                if (!empty($review['rating']) && $review['rating'] == 5) {
                    $output .= '<a href="#" class="hashtag">#five-stars</a>';
                }
                
                $output .= '<a href="#" class="hashtag">#recommended</a>';
                $output .= '</div>';
            }
            
            $output .= '</div>';
        }
        
        $output .= '</div>';
        return $output;
    }
    
    private function render_testimonials($testimonials, $atts) {
        // Similar implementation for testimonials
        return $this->render_reviews($testimonials, $atts);
    }
    
    private function render_recent_work($work, $atts) {
        if (empty($work)) {
            return '<p>' . __('No recent work photos available.', 'rankitpro') . '</p>';
        }
        
        $columns = max(2, min(6, intval($atts['columns'])));
        $output = '<div class="rankitpro-gallery columns-' . $columns . '">';
        
        foreach ($work as $item) {
            if (!empty($item['photoUrls'])) {
                foreach ($item['photoUrls'] as $photo) {
                    $output .= '<div class="rankitpro-gallery-item">';
                    $output .= '<img src="' . esc_url($photo) . '" alt="' . __('Work photo', 'rankitpro') . '" />';
                    $output .= '</div>';
                }
            }
        }
        
        $output .= '</div>';
        return $output;
    }
    
    private function render_technician_profile($profile, $atts) {
        if (empty($profile)) {
            return '<p>' . __('Technician profile not found.', 'rankitpro') . '</p>';
        }
        
        $output = '<div class="rankitpro-technician-profile">';
        $output .= '<h3>' . esc_html($profile['name'] ?? 'Technician') . '</h3>';
        
        if ($atts['show_recent_work'] === 'true' && !empty($profile['recentWork'])) {
            $output .= '<h4>' . __('Recent Work', 'rankitpro') . '</h4>';
            $output .= $this->render_visits($profile['recentWork'], array('show_photos' => 'true'));
        }
        
        if ($atts['show_reviews'] === 'true' && !empty($profile['reviews'])) {
            $output .= '<h4>' . __('Customer Reviews', 'rankitpro') . '</h4>';
            $output .= $this->render_reviews($profile['reviews'], array('show_names' => 'true'));
        }
        
        $output .= '</div>';
        return $output;
    }
    
    private function render_blogs($blogs, $atts) {
        if (empty($blogs)) {
            return '<div class="rankitpro-no-content">' . __('No blog posts available.', 'rankitpro') . '</div>';
        }
        
        $output = '<div class="rankitpro-blogs-container">';
        
        foreach ($blogs as $blog) {
            $output .= '<article class="blog-container">';
            
            // Blog Header
            $output .= '<header class="blog-header">';
            $output .= '<h1 class="blog-title">' . esc_html($blog['title'] ?? 'Service Blog Post') . '</h1>';
            if (!empty($blog['subtitle'])) {
                $output .= '<p class="blog-subtitle">' . esc_html($blog['subtitle']) . '</p>';
            }
            $output .= '</header>';
            
            // Blog Meta
            $output .= '<div class="blog-meta">';
            $output .= '<div class="meta-grid">';
            
            if (!empty($blog['technicianName'])) {
                $output .= '<div class="meta-item">';
                $output .= '<span class="meta-icon">👨‍🔧</span>';
                $output .= '<span class="meta-label">Technician:</span>';
                $output .= '<span>' . esc_html($blog['technicianName']) . '</span>';
                $output .= '</div>';
            }
            
            if (!empty($blog['createdAt'])) {
                $output .= '<div class="meta-item">';
                $output .= '<span class="meta-icon">📅</span>';
                $output .= '<span class="meta-label">Service Date:</span>';
                $output .= '<span>' . date('F j, Y', strtotime($blog['createdAt'])) . '</span>';
                $output .= '</div>';
            }
            
            if (!empty($blog['jobType'])) {
                $output .= '<div class="meta-item">';
                $output .= '<span class="meta-icon">🏠</span>';
                $output .= '<span class="meta-label">Service Type:</span>';
                $output .= '<span>' . esc_html($blog['jobType']) . '</span>';
                $output .= '</div>';
            }
            
            $output .= '</div>';
            $output .= '</div>';
            
            // Blog Content
            $output .= '<main class="blog-content">';
            
            if (!empty($blog['description'])) {
                $output .= '<div class="intro-text">' . esc_html($blog['description']) . '</div>';
            }
            
            // Location Section
            if (!empty($blog['location'])) {
                $output .= '<div class="location-section">';
                $output .= '<h3 class="location-title">Service Location Details</h3>';
                $output .= '<p><strong>Address:</strong> ' . esc_html($blog['location']) . '</p>';
                
                if (!empty($blog['latitude']) && !empty($blog['longitude'])) {
                    $output .= '<div class="map-container">';
                    $output .= '<div class="map-placeholder">';
                    $output .= '<div class="map-marker"></div>';
                    $output .= '<div class="map-controls">';
                    $output .= '<button class="map-btn">+</button>';
                    $output .= '<button class="map-btn">−</button>';
                    $output .= '</div>';
                    $output .= '</div>';
                    $output .= '</div>';
                }
                
                $output .= '</div>';
            }
            
            // Work Details Section
            if (!empty($blog['workDetails'])) {
                $output .= '<div class="work-details">';
                $output .= '<h3 class="section-title">Work Completed</h3>';
                $output .= '<ul class="work-list">';
                
                foreach ($blog['workDetails'] as $detail) {
                    $output .= '<li class="work-item">';
                    $output .= '<div class="work-item-text">';
                    $output .= '<div class="work-item-title">' . esc_html($detail['title'] ?? 'Service Item') . '</div>';
                    if (!empty($detail['description'])) {
                        $output .= '<div class="work-item-desc">' . esc_html($detail['description']) . '</div>';
                    }
                    $output .= '</div>';
                    $output .= '</li>';
                }
                
                $output .= '</ul>';
                $output .= '</div>';
            }
            
            // Photos Section
            if (!empty($blog['photos'])) {
                $output .= '<section class="section photos-section">';
                $output .= '<h2 class="section-title">Before & After Documentation</h2>';
                $output .= '<div class="photos-grid">';
                
                foreach ($blog['photos'] as $index => $photo) {
                    $label = $index === 0 ? 'Before' : 'After';
                    $photoClass = $index === 0 ? 'before-photo' : 'after-photo';
                    
                    $output .= '<div class="photo-container">';
                    $output .= '<img class="photo ' . $photoClass . '" src="' . esc_url($photo) . '" alt="' . __('Service photo', 'rankitpro') . '" />';
                    $output .= '<div class="photo-label">' . $label . '</div>';
                    $output .= '</div>';
                }
                
                $output .= '</div>';
                $output .= '</section>';
            }
            
            // Tags Section
            if (!empty($blog['tags'])) {
                $output .= '<div class="tags-section">';
                $output .= '<h3 class="tags-title">Related Topics</h3>';
                $output .= '<div class="tags-container">';
                
                foreach ($blog['tags'] as $tag) {
                    $output .= '<a href="#" class="tag">' . esc_html($tag) . '</a>';
                }
                
                $output .= '</div>';
                $output .= '</div>';
            }
            
            $output .= '</main>';
            $output .= '</article>';
        }
        
        $output .= '</div>';
        return $output;
    }
    
    private function render_video_testimonials($videos, $atts) {
        if (empty($videos)) {
            return '<div class="rankitpro-no-content">' . __('No video testimonials available.', 'rankitpro') . '</div>';
        }
        
        $output = '<div class="rankitpro-video-testimonials-container">';
        
        foreach ($videos as $video) {
            $output .= '<div class="video-review-container">';
            
            // Video Header
            $output .= '<div class="video-header">';
            $output .= '<h1 class="video-title">Video Review</h1>';
            
            $output .= '<div class="reviewer-info">';
            $output .= '<span class="reviewer-name">Reviewer: ' . esc_html($video['customerName'] ?? 'Customer') . '</span>';
            $output .= '<span class="video-date">' . date('F j, Y', strtotime($video['createdAt'])) . '</span>';
            $output .= '</div>';
            
            if (!empty($video['location'])) {
                $output .= '<div class="location">' . esc_html($video['location']) . '</div>';
            }
            
            // Star Rating
            if (!empty($video['rating'])) {
                $output .= '<div class="star-rating">';
                $output .= '<div class="stars">';
                for ($i = 1; $i <= 5; $i++) {
                    $output .= '<span class="star">★</span>';
                }
                $output .= '</div>';
                $output .= '<span class="rating-text">' . $video['rating'] . '.0 out of 5 stars</span>';
                $output .= '</div>';
            }
            
            // Video Stats
            $output .= '<div class="video-stats">';
            $output .= '<div class="stat-item"><span>👁️</span><span>' . ($video['views'] ?? '0') . ' views</span></div>';
            $output .= '<div class="stat-item"><span>👍</span><span>' . ($video['likes'] ?? '0') . ' likes</span></div>';
            $output .= '<div class="stat-item"><span>📺</span><span>' . ($video['duration'] ?? '0:00') . ' duration</span></div>';
            $output .= '</div>';
            
            $output .= '<div class="verified-video">Verified Customer Video</div>';
            $output .= '</div>';
            
            // Video Container
            $output .= '<div class="video-container">';
            $output .= '<div class="video-player">';
            
            if (!empty($video['videoUrl'])) {
                $output .= '<video class="rankitpro-video-player" controls>';
                $output .= '<source src="' . esc_url($video['videoUrl']) . '" type="video/mp4">';
                $output .= 'Your browser does not support the video tag.';
                $output .= '</video>';
            } else {
                $output .= '<div class="video-thumbnail">';
                $output .= '<div class="play-button">';
                $output .= '<div class="play-icon"></div>';
                $output .= '</div>';
                $output .= '</div>';
            }
            
            if (!empty($video['duration'])) {
                $output .= '<div class="video-duration">' . esc_html($video['duration']) . '</div>';
            }
            $output .= '</div>';
            
            if ($atts['show_controls'] === 'true') {
                $output .= '<div class="video-controls">';
                $output .= '<button class="control-btn">⏯️</button>';
                $output .= '<div class="progress-bar">';
                $output .= '<div class="progress-fill">';
                $output .= '<div class="progress-handle"></div>';
                $output .= '</div>';
                $output .= '</div>';
                $output .= '<div class="time-display">0:00 / ' . ($video['duration'] ?? '0:00') . '</div>';
                $output .= '<button class="control-btn">🔊</button>';
                $output .= '<button class="control-btn">⛶</button>';
                $output .= '</div>';
            }
            
            $output .= '</div>';
            
            // Map Container
            if (!empty($video['latitude']) && !empty($video['longitude'])) {
                $output .= '<div class="map-container">';
                $output .= '<div class="map-placeholder">';
                $output .= '<div class="map-marker"></div>';
                $output .= '</div>';
                $output .= '</div>';
            }
            
            // Video Content
            $output .= '<div class="video-content">';
            
            if (!empty($video['description'])) {
                $output .= '<div class="video-description">' . esc_html($video['description']) . '</div>';
            }
            
            // Service Showcase
            if (!empty($video['serviceHighlights'])) {
                $output .= '<div class="service-showcase">';
                $output .= '<div class="showcase-title">Featured in Video:</div>';
                $output .= '<ul class="showcase-list">';
                foreach ($video['serviceHighlights'] as $highlight) {
                    $output .= '<li class="showcase-item">' . esc_html($highlight) . '</li>';
                }
                $output .= '</ul>';
                $output .= '</div>';
            }
            
            // Engagement Stats
            $output .= '<div class="engagement-stats">';
            $output .= '<div class="stat-card">';
            $output .= '<span class="stat-number">' . ($video['likes'] ?? '0') . '</span>';
            $output .= '<span class="stat-label">Likes</span>';
            $output .= '</div>';
            $output .= '<div class="stat-card">';
            $output .= '<span class="stat-number">' . ($video['comments'] ?? '0') . '</span>';
            $output .= '<span class="stat-label">Comments</span>';
            $output .= '</div>';
            $output .= '<div class="stat-card">';
            $output .= '<span class="stat-number">' . ($video['shares'] ?? '0') . '</span>';
            $output .= '<span class="stat-label">Shares</span>';
            $output .= '</div>';
            $output .= '</div>';
            
            // Transcript
            if ($atts['show_transcript'] === 'true' && !empty($video['transcript'])) {
                $output .= '<div class="transcript-section">';
                $output .= '<div class="transcript-title">Video Transcript (Excerpt):</div>';
                $output .= '<div class="transcript-text">' . esc_html($video['transcript']) . '</div>';
                $output .= '</div>';
            }
            
            // Action Buttons
            $output .= '<div class="action-buttons">';
            $output .= '<button class="action-btn primary">👍 Like Video</button>';
            $output .= '<button class="action-btn">📤 Share</button>';
            $output .= '<button class="action-btn">💾 Save</button>';
            $output .= '<button class="action-btn">📝 Comment</button>';
            $output .= '</div>';
            
            $output .= '</div>';
            
            // Related Videos
            if ($atts['show_related'] === 'true' && !empty($video['relatedVideos'])) {
                $output .= '<div class="related-videos">';
                $output .= '<div class="related-title">Related Service Videos</div>';
                $output .= '<div class="related-grid">';
                
                foreach ($video['relatedVideos'] as $related) {
                    $output .= '<div class="related-item">';
                    $output .= '<div class="related-thumb">';
                    $output .= '<div class="related-play"></div>';
                    $output .= '</div>';
                    $output .= '<div class="related-info">';
                    $output .= '<div class="related-title-text">' . esc_html($related['title'] ?? 'Related Video') . '</div>';
                    $output .= '<div class="related-duration">' . esc_html($related['duration'] ?? '0:00') . '</div>';
                    $output .= '</div>';
                    $output .= '</div>';
                }
                
                $output .= '</div>';
                $output .= '</div>';
            }
            
            // Hashtags
            $output .= '<div class="hashtags">';
            if (!empty($video['jobType'])) {
                $jobType = strtolower(str_replace(' ', '-', $video['jobType']));
                $output .= '<a href="#" class="hashtag">#' . $jobType . '-video</a>';
            }
            if (!empty($video['city'])) {
                $city = strtolower(str_replace(' ', '', $video['city']));
                $output .= '<a href="#" class="hashtag">#' . $city . '</a>';
            }
            $output .= '<a href="#" class="hashtag">#customer-review</a>';
            $output .= '<a href="#" class="hashtag">#professional-service</a>';
            $output .= '<a href="#" class="hashtag">#five-star-review</a>';
            $output .= '</div>';
            
            $output .= '</div>';
        }
        
        $output .= '</div>';
        return $output;
    }
    
    private function test_api_connection() {
        $api_key = get_option('rankitpro_api_key', '');
        $api_endpoint = get_option('rankitpro_api_endpoint', '');
        
        if (empty($api_key) || empty($api_endpoint)) {
            return array(
                'success' => false,
                'message' => __('API key and endpoint are required.', 'rankitpro')
            );
        }
        
        $url = rtrim($api_endpoint, '/') . '/api/wordpress/public/visits';
        $url = add_query_arg(array('apiKey' => $api_key, 'limit' => 1), $url);
        
        $response = wp_remote_get($url, array(
            'timeout' => 10,
            'sslverify' => true
        ));
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'message' => __('Connection failed: ', 'rankitpro') . $response->get_error_message()
            );
        }
        
        $code = wp_remote_retrieve_response_code($response);
        if ($code === 200) {
            return array(
                'success' => true,
                'message' => __('Connection successful!', 'rankitpro')
            );
        } else {
            return array(
                'success' => false,
                'message' => __('API returned error code: ', 'rankitpro') . $code
            );
        }
    }
    
    public function register_widgets() {
        // Widget registration would go here
    }
}

// Initialize the plugin
new RankItProIntegration();

// Uninstall hook
register_uninstall_hook(__FILE__, 'rankitpro_uninstall');

function rankitpro_uninstall() {
    // Clean up options
    delete_option('rankitpro_api_key');
    delete_option('rankitpro_api_endpoint');
    delete_option('rankitpro_cache_duration');
    delete_option('rankitpro_show_photos');
    delete_option('rankitpro_auto_refresh');
    delete_option('rankitpro_version');
    
    // Clean up transients
    delete_transient('rankitpro_activation_notice');
    delete_transient('rankitpro_api_test_result');
    
    // Clear all cached data
    global $wpdb;
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_rankitpro_%'");
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_rankitpro_%'");
}
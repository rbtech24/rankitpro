<?php
/**
 * Plugin Name: RankItPro Service Integration
 * Plugin URI: https://rankitpro.com
 * Description: Display your RankItPro service reports, reviews, and blog posts on your WordPress site with seamless theme integration.
 * Version: 1.2.0
 * Author: RankItPro
 * License: GPL v2 or later
 * Text Domain: rankitpro
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class RankItProPlugin {
    
    private $api_base_url = 'https://3ba12234-e3a1-4984-9152-1724cec12a3c-00-3d1awbp5bhqqy.kirk.replit.dev';
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        
        // Register all shortcodes
        add_shortcode('rankitpro', array($this, 'shortcode'));
        add_shortcode('rankitpro_checkins', array($this, 'checkins_shortcode'));
        add_shortcode('rankitpro_reviews', array($this, 'reviews_shortcode'));
        add_shortcode('rankitpro_testimonials', array($this, 'testimonials_shortcode'));
        add_shortcode('rankitpro_blogs', array($this, 'blogs_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }
    
    public function init() {
        // Plugin initialization
    }
    
    public function admin_menu() {
        add_options_page(
            'RankItPro Settings',
            'RankItPro',
            'manage_options',
            'rankitpro-settings',
            array($this, 'settings_page')
        );
    }
    
    public function admin_init() {
        register_setting('rankitpro_settings', 'rankitpro_company_id');
        register_setting('rankitpro_settings', 'rankitpro_api_domain');
        register_setting('rankitpro_settings', 'rankitpro_cache_time');
    }
    
    public function settings_page() {
        if (isset($_POST['submit'])) {
            update_option('rankitpro_company_id', sanitize_text_field($_POST['company_id']));
            update_option('rankitpro_api_domain', sanitize_url($_POST['api_domain']));
            update_option('rankitpro_cache_time', intval($_POST['cache_time']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }
        
        $company_id = get_option('rankitpro_company_id', '');
        $api_domain = get_option('rankitpro_api_domain', $this->api_base_url);
        $cache_time = get_option('rankitpro_cache_time', 300);
        ?>
        <div class="wrap">
            <h1>RankIt Pro Integration Settings</h1>
            <p>Configure your RankIt Pro API connection for displaying service reports on your website.</p>
            
            <form method="post">
                <table class="form-table">
                    <tr>
                        <th scope="row">Company ID</th>
                        <td>
                            <input type="text" name="company_id" value="<?php echo esc_attr($company_id); ?>" class="regular-text" required />
                            <p class="description">Your RankItPro Company ID (found in your dashboard settings)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">API Domain</th>
                        <td>
                            <input type="url" name="api_domain" value="<?php echo esc_attr($api_domain); ?>" class="regular-text" required />
                            <p class="description"><strong>For development/testing:</strong> Use your Replit URL<br>
                            <strong>For production:</strong> Use https://rankitpro.com</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Cache Time (seconds)</th>
                        <td>
                            <input type="number" name="cache_time" value="<?php echo esc_attr($cache_time); ?>" class="small-text" min="60" />
                            <p class="description">How long to cache content (default: 300 seconds / 5 minutes)</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
            
            <h2>Usage</h2>
            <p>Use these shortcodes to display RankItPro content:</p>
            <ul>
                <li><code>[rankitpro]</code> - Show all content types</li>
                <li><code>[rankitpro type="checkins"]</code> - Show only service check-ins</li>
                <li><code>[rankitpro type="blogs"]</code> - Show only blog posts</li>
                <li><code>[rankitpro type="reviews"]</code> - Show only customer reviews</li>
                <li><code>[rankitpro limit="5"]</code> - Limit number of items displayed</li>
                <li><code>[rankitpro type="checkins" limit="3"]</code> - Show 3 recent check-ins</li>
            </ul>
            
            <?php if ($company_id): ?>
            <h3>Test Your Integration</h3>
            <p>Company ID: <strong><?php echo esc_html($company_id); ?></strong></p>
            <p>Widget URL: <code><?php echo esc_html($api_domain); ?>/widget/<?php echo esc_html($company_id); ?></code></p>
            <?php endif; ?>
        </div>
        <?php
    }
    
    public function shortcode($atts) {
        $atts = shortcode_atts(array(
            'type' => 'checkins',
            'limit' => '5',
            'company' => get_option('rankitpro_company_id'),
        ), $atts);
        
        $company_id = $atts['company'] ? $atts['company'] : get_option('rankitpro_company_id');
        $type = sanitize_text_field($atts['type']);
        $limit = intval($atts['limit']);
        $api_domain = get_option('rankitpro_api_domain', $this->api_base_url);
        
        if (!$company_id) {
            return '<div class="rankitpro-error">RankItPro: Company ID not configured. Please check plugin settings.</div>';
        }
        
        // Generate unique container ID
        $container_id = 'rankitpro-' . uniqid();
        
        ob_start();
        ?>
        <div id="<?php echo esc_attr($container_id); ?>" 
             data-rankitpro-widget="<?php echo esc_attr($type); ?>" 
             data-limit="<?php echo esc_attr($limit); ?>"
             data-company-id="<?php echo esc_attr($company_id); ?>"
             class="rankitpro-container">
            <div class="rankitpro-loading">Loading RankItPro content...</div>
        </div>
        
        <script>
        (function() {
            console.log('RankItPro: Initializing widget for company <?php echo esc_js($company_id); ?>');
            console.log('RankItPro: Type: <?php echo esc_js($type); ?>, Limit: <?php echo esc_js($limit); ?>');
            
            var script = document.createElement('script');
            var scriptUrl = '<?php echo esc_js($api_domain); ?>/widget/<?php echo esc_js($company_id); ?>?type=<?php echo esc_js($type); ?>&limit=<?php echo esc_js($limit); ?>';
            console.log('RankItPro: Loading script from:', scriptUrl);
            
            script.src = scriptUrl;
            script.async = true;
            script.onload = function() {
                console.log('RankItPro: Widget script loaded successfully');
                var loadingElements = document.querySelectorAll('.rankitpro-loading');
                loadingElements.forEach(function(el) {
                    el.style.display = 'none';
                });
            };
            script.onerror = function() {
                console.error('RankItPro: Failed to load widget script from:', scriptUrl);
                document.getElementById('<?php echo esc_js($container_id); ?>').innerHTML = 
                    '<div class="rankitpro-error">Unable to connect to RankItPro services. Please try refreshing the page.</div>';
            };
            document.head.appendChild(script);
        })();
        </script>
        <?php
        return ob_get_clean();
    }
    
    // Test API connection
    private function test_connection($company_id, $api_domain) {
        if (!$company_id || !$api_domain) return false;
        
        $url = $api_domain . '/widget/' . $company_id . '?type=checkins&limit=1';
        $response = wp_remote_get($url, array('timeout' => 10));
        
        if (is_wp_error($response)) return false;
        
        $body = wp_remote_retrieve_body($response);
        return (strpos($body, 'WIDGET_CONFIG') !== false);
    }
    
    // Specific shortcode handlers
    public function checkins_shortcode($atts) {
        $atts['type'] = 'checkins';
        return $this->shortcode($atts);
    }
    
    public function reviews_shortcode($atts) {
        $atts['type'] = 'reviews';
        return $this->shortcode($atts);
    }
    
    public function testimonials_shortcode($atts) {
        $atts['type'] = 'testimonials';
        return $this->shortcode($atts);
    }
    
    public function blogs_shortcode($atts) {
        $atts['type'] = 'blogs';
        return $this->shortcode($atts);
    }
    
    public function enqueue_scripts() {
        wp_enqueue_style('rankitpro-style', plugin_dir_url(__FILE__) . 'rankitpro.css', array(), '1.0.0');
    }
}

// Initialize the plugin
new RankItProPlugin();

// Widget for WordPress admin
class RankItPro_Widget extends WP_Widget {
    
    public function __construct() {
        parent::__construct(
            'rankitpro_widget',
            'RankItPro Content',
            array('description' => 'Display your RankItPro service content')
        );
    }
    
    public function widget($args, $instance) {
        echo $args['before_widget'];
        
        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }
        
        $shortcode = '[rankitpro';
        if (!empty($instance['type'])) {
            $shortcode .= ' type="' . esc_attr($instance['type']) . '"';
        }
        if (!empty($instance['limit'])) {
            $shortcode .= ' limit="' . esc_attr($instance['limit']) . '"';
        }
        $shortcode .= ']';
        
        echo do_shortcode($shortcode);
        
        echo $args['after_widget'];
    }
    
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : '';
        $type = !empty($instance['type']) ? $instance['type'] : 'all';
        $limit = !empty($instance['limit']) ? $instance['limit'] : '5';
        ?>
        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>">Title:</label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" 
                   name="<?php echo $this->get_field_name('title'); ?>" type="text" 
                   value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('type'); ?>">Content Type:</label>
            <select class="widefat" id="<?php echo $this->get_field_id('type'); ?>" 
                    name="<?php echo $this->get_field_name('type'); ?>">
                <option value="all" <?php selected($type, 'all'); ?>>All Content</option>
                <option value="checkins" <?php selected($type, 'checkins'); ?>>Service Check-ins</option>
                <option value="blogs" <?php selected($type, 'blogs'); ?>>Blog Posts</option>
                <option value="reviews" <?php selected($type, 'reviews'); ?>>Customer Reviews</option>
            </select>
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('limit'); ?>">Number of Items:</label>
            <input class="tiny-text" id="<?php echo $this->get_field_id('limit'); ?>" 
                   name="<?php echo $this->get_field_name('limit'); ?>" type="number" 
                   value="<?php echo esc_attr($limit); ?>" min="1" max="20">
        </p>
        <?php
    }
    
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = (!empty($new_instance['title'])) ? strip_tags($new_instance['title']) : '';
        $instance['type'] = (!empty($new_instance['type'])) ? strip_tags($new_instance['type']) : 'all';
        $instance['limit'] = (!empty($new_instance['limit'])) ? intval($new_instance['limit']) : 5;
        return $instance;
    }
}

// Register widget
function register_rankitpro_widget() {
    register_widget('RankItPro_Widget');
}
add_action('widgets_init', 'register_rankitpro_widget');
?>
<?php
/**
 * Plugin Name: Rank It Pro Integration
 * Plugin URI: https://rankitpro.com
 * Description: Automatically publish technician check-ins to your WordPress site for improved local SEO and customer transparency.
 * Version: 1.3.0.0
 * Author: Rank It Pro
 * Author URI: https://rankitpro.com
 * Text Domain: rank-it-pro
 * Domain Path: /languages
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('RANK_IT_PRO_VERSION', '1.0.0');
define('RANK_IT_PRO_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('RANK_IT_PRO_PLUGIN_URL', plugin_dir_url(__FILE__));

class RankItProPlugin {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    public function init() {
        // Admin menu
        add_action('admin_menu', array($this, 'admin_menu'));
        
        // Settings
        add_action('admin_init', array($this, 'admin_init'));
        
        // AJAX handlers
        add_action('wp_ajax_rank_it_pro_test_connection', array($this, 'test_connection'));
        add_action('wp_ajax_rank_it_pro_sync_checkins', array($this, 'sync_checkins'));
        
        // Webhook endpoint for receiving check-ins
        add_action('rest_api_init', array($this, 'register_webhook_endpoint'));
        
        // Schedule sync if enabled
        if (get_option('rank_it_pro_auto_sync', false)) {
            add_action('rank_it_pro_sync_event', array($this, 'sync_checkins'));
            if (!wp_next_scheduled('rank_it_pro_sync_event')) {
                wp_schedule_event(time(), 'hourly', 'rank_it_pro_sync_event');
            }
        }
    }
    
    public function activate() {
        // Create custom post type for check-ins
        $this->create_checkin_post_type();
        flush_rewrite_rules();
        
        // Set default options
        add_option('rank_it_pro_api_url', '');
        add_option('rank_it_pro_api_key', '');
        add_option('rank_it_pro_secret_key', '');
        add_option('rank_it_pro_auto_sync', true);
        add_option('rank_it_pro_post_status', 'publish');
        add_option('rank_it_pro_post_category', '');
    }
    
    public function deactivate() {
        wp_clear_scheduled_hook('rank_it_pro_sync_event');
    }
    
    public function admin_menu() {
        add_options_page(
            'Rank It Pro Settings',
            'Rank It Pro',
            'manage_options',
            'rank-it-pro',
            array($this, 'admin_page')
        );
    }
    
    public function admin_init() {
        register_setting('rank_it_pro_settings', 'rank_it_pro_api_url');
        register_setting('rank_it_pro_settings', 'rank_it_pro_api_key');
        register_setting('rank_it_pro_settings', 'rank_it_pro_secret_key');
        register_setting('rank_it_pro_settings', 'rank_it_pro_auto_sync');
        register_setting('rank_it_pro_settings', 'rank_it_pro_post_status');
        register_setting('rank_it_pro_settings', 'rank_it_pro_post_category');
    }
    
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>Rank It Pro Integration Settings</h1>
            
            <div class="notice notice-info">
                <p><strong>Welcome to Rank It Pro!</strong> This plugin automatically publishes your technician check-ins to your WordPress site, boosting your local SEO and keeping customers informed.</p>
            </div>
            
            <form method="post" action="options.php">
                <?php settings_fields('rank_it_pro_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="rank_it_pro_api_url">Rank It Pro API URL</label>
                        </th>
                        <td>
                            <input type="url" id="rank_it_pro_api_url" name="rank_it_pro_api_url" 
                                   value="<?php echo esc_attr(get_option('rank_it_pro_api_url')); ?>" 
                                   class="regular-text" placeholder="https://your-domain.rankitpro.com" />
                            <p class="description">Your Rank It Pro platform URL (found in your dashboard)</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="rank_it_pro_api_key">API Key</label>
                        </th>
                        <td>
                            <input type="text" id="rank_it_pro_api_key" name="rank_it_pro_api_key" 
                                   value="<?php echo esc_attr(get_option('rank_it_pro_api_key')); ?>" 
                                   class="regular-text" />
                            <p class="description">Your WordPress API key from Rank It Pro dashboard</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="rank_it_pro_secret_key">Secret Key</label>
                        </th>
                        <td>
                            <input type="password" id="rank_it_pro_secret_key" name="rank_it_pro_secret_key" 
                                   value="<?php echo esc_attr(get_option('rank_it_pro_secret_key')); ?>" 
                                   class="regular-text" />
                            <p class="description">Your WordPress secret key from Rank It Pro dashboard</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">Post Settings</th>
                        <td>
                            <fieldset>
                                <label>
                                    <input type="checkbox" name="rank_it_pro_auto_sync" value="1" 
                                           <?php checked(get_option('rank_it_pro_auto_sync'), 1); ?> />
                                    Automatically sync check-ins hourly
                                </label>
                                <br><br>
                                
                                <label for="rank_it_pro_post_status">Post Status:</label>
                                <select id="rank_it_pro_post_status" name="rank_it_pro_post_status">
                                    <option value="publish" <?php selected(get_option('rank_it_pro_post_status'), 'publish'); ?>>Published</option>
                                    <option value="draft" <?php selected(get_option('rank_it_pro_post_status'), 'draft'); ?>>Draft</option>
                                    <option value="private" <?php selected(get_option('rank_it_pro_post_status'), 'private'); ?>>Private</option>
                                </select>
                                <br><br>
                                
                                <label for="rank_it_pro_post_category">Default Category:</label>
                                <?php wp_dropdown_categories(array(
                                    'name' => 'rank_it_pro_post_category',
                                    'selected' => get_option('rank_it_pro_post_category'),
                                    'show_option_none' => 'Select Category',
                                    'option_none_value' => ''
                                )); ?>
                            </fieldset>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
            
            <hr>
            
            <h2>Connection Test</h2>
            <p>Test your connection to the Rank It Pro platform:</p>
            <button type="button" id="test-connection" class="button button-secondary">Test Connection</button>
            <div id="connection-result" style="margin-top: 10px;"></div>
            
            <hr>
            
            <h2>Manual Sync</h2>
            <p>Manually sync recent check-ins from your Rank It Pro platform:</p>
            <button type="button" id="manual-sync" class="button button-secondary">Sync Now</button>
            <div id="sync-result" style="margin-top: 10px;"></div>
            
            <script>
            jQuery(document).ready(function($) {
                $('#test-connection').click(function() {
                    var button = $(this);
                    var result = $('#connection-result');
                    
                    button.prop('disabled', true).text('Testing...');
                    result.html('<div class="notice notice-info"><p>Testing connection...</p></div>');
                    
                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: {
                            action: 'rank_it_pro_test_connection',
                            nonce: '<?php echo wp_create_nonce('rank_it_pro_nonce'); ?>'
                        },
                        success: function(response) {
                            if (response.success) {
                                result.html('<div class="notice notice-success"><p>' + response.data + '</p></div>');
                            } else {
                                result.html('<div class="notice notice-error"><p>' + response.data + '</p></div>');
                            }
                        },
                        error: function() {
                            result.html('<div class="notice notice-error"><p>Connection test failed</p></div>');
                        },
                        complete: function() {
                            button.prop('disabled', false).text('Test Connection');
                        }
                    });
                });
                
                $('#manual-sync').click(function() {
                    var button = $(this);
                    var result = $('#sync-result');
                    
                    button.prop('disabled', true).text('Syncing...');
                    result.html('<div class="notice notice-info"><p>Syncing check-ins...</p></div>');
                    
                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: {
                            action: 'rank_it_pro_sync_checkins',
                            nonce: '<?php echo wp_create_nonce('rank_it_pro_nonce'); ?>'
                        },
                        success: function(response) {
                            if (response.success) {
                                result.html('<div class="notice notice-success"><p>' + response.data + '</p></div>');
                            } else {
                                result.html('<div class="notice notice-error"><p>' + response.data + '</p></div>');
                            }
                        },
                        error: function() {
                            result.html('<div class="notice notice-error"><p>Sync failed</p></div>');
                        },
                        complete: function() {
                            button.prop('disabled', false).text('Sync Now');
                        }
                    });
                });
            });
            </script>
        </div>
        <?php
    }
    
    public function test_connection() {
        check_ajax_referer('rank_it_pro_nonce', 'nonce');
        
        $api_url = get_option('rank_it_pro_api_url');
        $api_key = get_option('rank_it_pro_api_key');
        $secret_key = get_option('rank_it_pro_secret_key');
        
        if (empty($api_url) || empty($api_key) || empty($secret_key)) {
            wp_send_json_error('Please fill in all API credentials');
        }
        
        $response = wp_remote_get($api_url . '/api/integration/wordpress/test', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'X-Secret-Key' => $secret_key
            ),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error('Connection failed: ' . $response->get_error_message());
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        
        if ($status_code === 200) {
            wp_send_json_success('✅ Connection successful! Plugin is ready to sync check-ins.');
        } else {
            wp_send_json_error('Connection failed with status code: ' . $status_code);
        }
    }
    
    public function sync_checkins() {
        $api_url = get_option('rank_it_pro_api_url');
        $api_key = get_option('rank_it_pro_api_key');
        $secret_key = get_option('rank_it_pro_secret_key');
        
        if (empty($api_url) || empty($api_key) || empty($secret_key)) {
            if (wp_doing_ajax()) {
                wp_send_json_error('API credentials not configured');
            }
            return;
        }
        
        $response = wp_remote_get($api_url . '/api/integration/wordpress/checkins', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'X-Secret-Key' => $secret_key
            ),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            if (wp_doing_ajax()) {
                wp_send_json_error('Sync failed: ' . $response->get_error_message());
            }
            return;
        }
        
        $data = json_decode(wp_remote_retrieve_body($response), true);
        
        if (!$data || !isset($data['checkins'])) {
            if (wp_doing_ajax()) {
                wp_send_json_error('Invalid response from Rank It Pro');
            }
            return;
        }
        
        $synced_count = 0;
        
        foreach ($data['checkins'] as $checkin) {
            if ($this->create_checkin_post($checkin)) {
                $synced_count++;
            }
        }
        
        if (wp_doing_ajax()) {
            wp_send_json_success("✅ Successfully synced {$synced_count} check-ins");
        }
    }
    
    private function create_checkin_post($checkin) {
        // Check if post already exists
        $existing_post = get_posts(array(
            'post_type' => 'rank_it_pro_checkin',
            'meta_key' => '_rank_it_pro_checkin_id',
            'meta_value' => $checkin['id'],
            'post_status' => 'any',
            'numberposts' => 1
        ));
        
        if (!empty($existing_post)) {
            return false; // Already exists
        }
        
        // Create post content
        $title = $this->generate_post_title($checkin);
        $content = $this->generate_post_content($checkin);
        
        $post_data = array(
            'post_title' => $title,
            'post_content' => $content,
            'post_status' => get_option('rank_it_pro_post_status', 'publish'),
            'post_type' => 'rank_it_pro_checkin',
            'post_author' => 1,
            'post_date' => $checkin['created_at']
        );
        
        // Set category if configured
        $category = get_option('rank_it_pro_post_category');
        if (!empty($category)) {
            $post_data['post_category'] = array($category);
        }
        
        $post_id = wp_insert_post($post_data);
        
        if ($post_id) {
            // Add custom meta fields
            update_post_meta($post_id, '_rank_it_pro_checkin_id', $checkin['id']);
            update_post_meta($post_id, '_rank_it_pro_job_type', $checkin['job_type']);
            update_post_meta($post_id, '_rank_it_pro_location', $checkin['location']);
            update_post_meta($post_id, '_rank_it_pro_technician', $checkin['technician_name']);
            update_post_meta($post_id, '_rank_it_pro_customer', $checkin['customer_name']);
            
            // Handle photos
            if (!empty($checkin['photos'])) {
                $this->handle_checkin_photos($post_id, $checkin['photos']);
            }
            
            return true;
        }
        
        return false;
    }
    
    private function generate_post_title($checkin) {
        $template = "{job_type} Service Completed in {location}";
        
        $title = str_replace(
            array('{job_type}', '{location}'),
            array($checkin['job_type'], $checkin['location']),
            $template
        );
        
        return $title;
    }
    
    private function generate_post_content($checkin) {
        $content = "<div class='rank-it-pro-checkin'>\n";
        
        if (!empty($checkin['photos'])) {
            $content .= "<div class='checkin-photos'>\n";
            foreach ($checkin['photos'] as $photo) {
                $content .= "<img src='{$photo['url']}' alt='Service Photo' class='checkin-photo' style='max-width: 100%; height: auto; margin: 10px 0;' />\n";
            }
            $content .= "</div>\n";
        }
        
        $content .= "<div class='checkin-details'>\n";
        $content .= "<h3>Service Details</h3>\n";
        $content .= "<ul>\n";
        $content .= "<li><strong>Service Type:</strong> {$checkin['job_type']}</li>\n";
        $content .= "<li><strong>Location:</strong> {$checkin['location']}</li>\n";
        $content .= "<li><strong>Technician:</strong> {$checkin['technician_name']}</li>\n";
        $content .= "<li><strong>Date:</strong> " . date('F j, Y', strtotime($checkin['created_at'])) . "</li>\n";
        $content .= "</ul>\n";
        $content .= "</div>\n";
        
        if (!empty($checkin['notes'])) {
            $content .= "<div class='checkin-notes'>\n";
            $content .= "<h3>Service Notes</h3>\n";
            $content .= "<p>" . nl2br(esc_html($checkin['notes'])) . "</p>\n";
            $content .= "</div>\n";
        }
        
        if (!empty($checkin['ai_summary'])) {
            $content .= "<div class='checkin-summary'>\n";
            $content .= "<h3>Service Summary</h3>\n";
            $content .= "<p>" . wpautop($checkin['ai_summary']) . "</p>\n";
            $content .= "</div>\n";
        }
        
        $content .= "</div>\n";
        
        return $content;
    }
    
    private function handle_checkin_photos($post_id, $photos) {
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        
        foreach ($photos as $photo) {
            $image_url = $photo['url'];
            $image_data = wp_remote_get($image_url);
            
            if (!is_wp_error($image_data)) {
                $upload = wp_upload_bits(
                    basename($image_url),
                    null,
                    wp_remote_retrieve_body($image_data)
                );
                
                if (!$upload['error']) {
                    $attachment = array(
                        'post_mime_type' => $image_data['headers']['content-type'],
                        'post_title' => sanitize_file_name(basename($image_url)),
                        'post_content' => '',
                        'post_status' => 'inherit'
                    );
                    
                    $attachment_id = wp_insert_attachment($attachment, $upload['file'], $post_id);
                    
                    if ($attachment_id) {
                        $attachment_metadata = wp_generate_attachment_metadata($attachment_id, $upload['file']);
                        wp_update_attachment_metadata($attachment_id, $attachment_metadata);
                    }
                }
            }
        }
    }
    
    public function register_webhook_endpoint() {
        register_rest_route('rank-it-pro/v1', '/webhook', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_webhook'),
            'permission_callback' => array($this, 'verify_webhook_signature')
        ));
    }
    
    public function verify_webhook_signature($request) {
        $signature = $request->get_header('X-Rank-It-Pro-Signature');
        $secret_key = get_option('rank_it_pro_secret_key');
        
        if (empty($signature) || empty($secret_key)) {
            return false;
        }
        
        $payload = $request->get_body();
        $expected_signature = hash_hmac('sha256', $payload, $secret_key);
        
        return hash_equals($signature, $expected_signature);
    }
    
    public function handle_webhook($request) {
        $data = $request->get_json_params();
        
        if (!$data || !isset($data['type'])) {
            return new WP_Error('invalid_data', 'Invalid webhook data', array('status' => 400));
        }
        
        switch ($data['type']) {
            case 'checkin.created':
                if (isset($data['checkin'])) {
                    $this->create_checkin_post($data['checkin']);
                }
                break;
                
            case 'checkin.updated':
                if (isset($data['checkin'])) {
                    $this->update_checkin_post($data['checkin']);
                }
                break;
        }
        
        return array('success' => true);
    }
    
    private function create_checkin_post_type() {
        register_post_type('rank_it_pro_checkin', array(
            'labels' => array(
                'name' => 'Service Check-ins',
                'singular_name' => 'Service Check-in'
            ),
            'public' => true,
            'has_archive' => true,
            'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
            'menu_icon' => 'dashicons-yes-alt'
        ));
    }
}

// Initialize the plugin
new RankItProPlugin();

?>
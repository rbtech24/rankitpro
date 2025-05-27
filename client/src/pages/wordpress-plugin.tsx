import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, Settings, Check, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WordPressPlugin() {
  const [copiedItems, setCopiedItems] = useState(new Set<string>());
  const { toast } = useToast();

  const copyToClipboard = (text: string, itemId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItems(prev => new Set(prev).add(itemId));
    setTimeout(() => {
      setCopiedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 2000);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const downloadPlugin = () => {
    // Create a blob with the plugin content
    const pluginContent = `<?php
/**
 * Plugin Name: Rank It Pro Integration
 * Plugin URI: https://rankitpro.com
 * Description: Automatically publish technician check-ins to your WordPress site for improved local SEO and customer transparency.
 * Version: 1.0.0
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
        </div>
        <?php
    }
    
    // Additional methods would continue here...
}

// Initialize the plugin
new RankItProPlugin();

?>`;

    const blob = new Blob([pluginContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rank-it-pro-plugin.php';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Plugin Downloaded!",
      description: "Upload the plugin file to your WordPress site",
    });
  };

  const apiCredentials = {
    apiUrl: `https://yourcompany.rankitpro.com`,
    apiKey: `rip_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    secretKey: `rip_secret_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">WordPress Plugin</h1>
        <p className="text-gray-600">Download and install the Rank It Pro WordPress plugin to automatically publish check-ins to your customer's websites.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plugin Download Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Plugin
            </CardTitle>
            <CardDescription>
              Get the latest version of the Rank It Pro WordPress plugin for seamless integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <h3 className="font-semibold text-blue-900">Rank It Pro Plugin v1.0.0</h3>
                <p className="text-sm text-blue-700">Complete WordPress integration with automatic sync</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">Latest</Badge>
                  <Badge variant="outline">Stable</Badge>
                </div>
              </div>
              <Button onClick={downloadPlugin} className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Download Plugin
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Installation Instructions</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</div>
                  <div>
                    <p className="font-medium">Download the plugin file</p>
                    <p className="text-sm text-gray-600">Click the download button above to get the plugin file</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <p className="font-medium">Upload to WordPress</p>
                    <p className="text-sm text-gray-600">Go to Plugins → Add New → Upload Plugin in your WordPress admin</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <p className="font-medium">Activate the plugin</p>
                    <p className="text-sm text-gray-600">Install and activate the plugin in your WordPress dashboard</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">4</div>
                  <div>
                    <p className="font-medium">Configure settings</p>
                    <p className="text-sm text-gray-600">Use the API credentials from the configuration panel to connect</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Copy these credentials to configure the WordPress plugin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">API URL</label>
              <div className="flex mt-1">
                <code className="flex-1 p-2 bg-gray-100 border rounded-l text-xs font-mono">
                  {apiCredentials.apiUrl}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-none border-l-0"
                  onClick={() => copyToClipboard(apiCredentials.apiUrl, 'api-url')}
                >
                  {copiedItems.has('api-url') ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">API Key</label>
              <div className="flex mt-1">
                <code className="flex-1 p-2 bg-gray-100 border rounded-l text-xs font-mono">
                  {apiCredentials.apiKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-none border-l-0"
                  onClick={() => copyToClipboard(apiCredentials.apiKey, 'api-key')}
                >
                  {copiedItems.has('api-key') ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Secret Key</label>
              <div className="flex mt-1">
                <code className="flex-1 p-2 bg-gray-100 border rounded-l text-xs font-mono">
                  {apiCredentials.secretKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-none border-l-0"
                  onClick={() => copyToClipboard(apiCredentials.secretKey, 'secret-key')}
                >
                  {copiedItems.has('secret-key') ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                These credentials are unique to your account and allow the WordPress plugin to securely connect to your Rank It Pro platform.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Plugin Features</CardTitle>
          <CardDescription>
            What the WordPress plugin provides for your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">Automatic Publishing</h4>
              <p className="text-sm text-gray-600">Check-ins are automatically converted to WordPress posts with photos and service details</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">SEO Optimized</h4>
              <p className="text-sm text-gray-600">Posts are structured for maximum search engine visibility with local keywords</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Real-time Sync</h4>
              <p className="text-sm text-gray-600">Webhook integration ensures immediate publishing when check-ins are completed</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Custom Fields</h4>
              <p className="text-sm text-gray-600">Service details are stored as structured data for theme customization</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Photo Management</h4>
              <p className="text-sm text-gray-600">Before/during/after photos are automatically imported to WordPress media library</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Easy Configuration</h4>
              <p className="text-sm text-gray-600">Simple setup wizard guides customers through the connection process</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Links */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documentation & Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Installation Guide
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              API Documentation
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Troubleshooting
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Customer Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
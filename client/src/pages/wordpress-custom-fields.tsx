import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Sidebar from '@/components/layout/sidebar';
import { 
  Save, 
  Copy, 
  RefreshCw,
  Code,
  Globe,
  Settings2,
  Layers,
  FileCode,
  CheckCircle,
  AlertCircle,
  Braces,
  X
} from 'lucide-react';

// Define schemas for form validation
const wordpressConnectionSchema = z.object({
  siteUrl: z.string().url({ message: "Please enter a valid WordPress site URL." }),
  apiKey: z.string().min(10, { message: "API key must be at least 10 characters." }),
  secretKey: z.string().min(20, { message: "Secret key must be at least 20 characters." }),
  useRestApi: z.boolean().default(true),
  autoPublish: z.boolean().default(false),
  category: z.string().optional(),
  author: z.string().optional(),
  postStatus: z.enum(["publish", "draft", "pending"]).default("draft"),
});

const fieldMappingSchema = z.object({
  titlePrefix: z.string().optional(),
  contentFieldMapping: z.string().min(1, { message: "Content field mapping is required." }),
  includePhotos: z.boolean().default(true),
  includeLocation: z.boolean().default(true),
  customFields: z.array(
    z.object({
      wpField: z.string().min(1, { message: "WordPress field name is required." }),
      checkInField: z.string().min(1, { message: "Check-in field is required." }),
      isActive: z.boolean().default(true),
    })
  ).default([]),
  metaPrefix: z.string().default("rankitpro_"),
  advancedMapping: z.string().optional(),
});

// Sample WordPress post types
const wpPostTypes = [
  { id: "post", name: "Post" },
  { id: "page", name: "Page" },
  { id: "service", name: "Service" },
  { id: "project", name: "Project" },
  { id: "testimonial", name: "Testimonial" },
  { id: "check_in", name: "Check-in" },
];

// Sample WordPress categories
const wpCategories = [
  { id: "1", name: "Uncategorized" },
  { id: "2", name: "Projects" },
  { id: "3", name: "Services" },
  { id: "4", name: "HVAC" },
  { id: "5", name: "Plumbing" },
  { id: "6", name: "Electrical" },
  { id: "7", name: "Roofing" },
];

// Sample WordPress users (authors)
const wpUsers = [
  { id: "1", name: "admin" },
  { id: "2", name: "editor" },
  { id: "3", name: "author" },
  { id: "4", name: "contributor" },
];

// Sample check-in fields
const checkInFields = [
  { id: "technician_name", name: "Technician Name", type: "text" },
  { id: "job_type", name: "Job Type", type: "text" },
  { id: "location", name: "Location", type: "text" },
  { id: "notes", name: "Notes", type: "text" },
  { id: "summary", name: "AI Summary", type: "text" },
  { id: "completion_date", name: "Completion Date", type: "date" },
  { id: "photos", name: "Photos", type: "array" },
  { id: "customer_name", name: "Customer Name", type: "text" },
  { id: "rating", name: "Rating", type: "number" },
  { id: "coordinates", name: "GPS Coordinates", type: "object" },
];

// Interface for custom field mappings
interface CustomFieldMapping {
  wpField: string;
  checkInField: string;
  isActive: boolean;
}

// Default field mappings - what gets created initially
const defaultFieldMappings: CustomFieldMapping[] = [
  { wpField: "post_title", checkInField: "job_type", isActive: true },
  { wpField: "post_content", checkInField: "notes", isActive: true },
  { wpField: "rp_technician", checkInField: "technician_name", isActive: true },
  { wpField: "rp_location", checkInField: "location", isActive: true },
  { wpField: "rp_completion_date", checkInField: "completion_date", isActive: true },
];

// Sample connection status based on checked URL
const connectionStatus = {
  status: "connected", // connected, error, pending
  version: "6.4.2",
  apiStatus: "active",
  lastSuccessfulSync: "2025-05-21T09:15:23Z",
  postCount: 284,
};

export default function WordPressCustomFields() {
  const [testingConnection, setTestingConnection] = useState(false);
  const [activePostType, setActivePostType] = useState("post");
  const [fieldMappings, setFieldMappings] = useState<CustomFieldMapping[]>(defaultFieldMappings);
  const [connStatus, setConnStatus] = useState<{
    status: "connected" | "error" | "pending";
    message?: string;
    version?: string;
    apiStatus?: string;
  }>({ status: "pending" });
  
  const { toast } = useToast();
  
  // Fetch existing WordPress custom fields configuration
  const { data: wpCustomFields, isLoading: isLoadingWpCustomFields } = useQuery({
    queryKey: ['/api/wordpress/custom-fields'],
    enabled: true,
  });

  // Mutation for saving WordPress connection
  const saveConnectionMutation = useMutation({
    mutationFn: (data: z.infer<typeof wordpressConnectionSchema>) => 
      apiRequest('POST', '/api/wordpress/custom-fields/connection', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wordpress/custom-fields'] });
      toast({
        title: "WordPress Connection Saved",
        description: "Your WordPress connection settings have been saved successfully.",
      });
      // Test the connection automatically after saving
      testConnection();
    },
    onError: (error) => {
      toast({
        title: "Error Saving Connection",
        description: "There was an error saving your WordPress connection settings.",
        variant: "destructive",
      });
    }
  });

  // Mutation for saving field mappings
  const saveFieldMappingMutation = useMutation({
    mutationFn: (data: z.infer<typeof fieldMappingSchema>) => 
      apiRequest('POST', '/api/wordpress/custom-fields/mapping', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wordpress/custom-fields'] });
      toast({
        title: "Field Mappings Saved",
        description: "Your WordPress field mappings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Saving Field Mappings",
        description: "There was an error saving your WordPress field mappings.",
        variant: "destructive",
      });
    }
  });

  // Mutation for testing connection
  const testConnectionMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/wordpress/custom-fields/test-connection'),
    onSuccess: async (data) => {
      const response = await data.json();
      setConnStatus({
        status: response.isConnected ? "connected" : "error",
        version: response.version,
        apiStatus: response.isConnected ? "active" : "inactive",
        message: response.message
      });
      
      toast({
        title: response.isConnected ? "Connection Successful" : "Connection Failed",
        description: response.message,
        variant: response.isConnected ? "default" : "destructive",
      });
    },
    onError: (error) => {
      setConnStatus({
        status: "error",
        message: "Failed to connect to WordPress site"
      });
      
      toast({
        title: "Connection Failed",
        description: "Failed to connect to the WordPress site. Please check your credentials.",
        variant: "destructive",
      });
    }
  });
  
  // WordPress connection form
  const connectionForm = useForm<z.infer<typeof wordpressConnectionSchema>>({
    resolver: zodResolver(wordpressConnectionSchema),
    defaultValues: {
      siteUrl: wpCustomFields?.siteUrl || "https://example.com",
      apiKey: wpCustomFields?.apiKey || "",
      secretKey: wpCustomFields?.secretKey || "",
      useRestApi: wpCustomFields?.useRestApi ?? true,
      autoPublish: wpCustomFields?.autoPublish ?? false,
      postStatus: wpCustomFields?.postStatus || "draft",
    }
  });
  
  // Update form values when data is loaded
  React.useEffect(() => {
    if (wpCustomFields) {
      connectionForm.reset({
        siteUrl: wpCustomFields.siteUrl,
        apiKey: wpCustomFields.apiKey,
        secretKey: wpCustomFields.secretKey,
        useRestApi: wpCustomFields.useRestApi,
        autoPublish: wpCustomFields.autoPublish,
        postStatus: wpCustomFields.postStatus,
      });
      
      fieldMappingForm.reset({
        titlePrefix: wpCustomFields.titlePrefix || "[Check-in] ",
        contentFieldMapping: wpCustomFields.contentTemplate || "notes",
        includePhotos: wpCustomFields.includePhotos,
        includeLocation: wpCustomFields.includeLocation,
        customFields: wpCustomFields.customFieldMappings || defaultFieldMappings,
        metaPrefix: wpCustomFields.metaPrefix || "rankitpro_",
        advancedMapping: wpCustomFields.advancedMapping || "// Add custom JavaScript mapping function here\nfunction mapFields(checkIn) {\n  return {\n    // your custom mapping logic\n  };\n}",
      });
      
      if (wpCustomFields.isConnected) {
        setConnStatus({
          status: "connected",
          version: wpCustomFields.lastSyncStatus || "Unknown",
          apiStatus: "active",
          message: "Connected to WordPress site"
        });
      }
    }
  }, [wpCustomFields]);
  
  // Field mapping form
  const fieldMappingForm = useForm<z.infer<typeof fieldMappingSchema>>({
    resolver: zodResolver(fieldMappingSchema),
    defaultValues: {
      titlePrefix: "[Check-in] ",
      contentFieldMapping: "notes",
      includePhotos: true,
      includeLocation: true,
      customFields: defaultFieldMappings,
      metaPrefix: "rankitpro_",
      advancedMapping: "// Add custom JavaScript mapping function here\nfunction mapFields(checkIn) {\n  return {\n    // your custom mapping logic\n  };\n}",
    }
  });
  
  // Handle testing WordPress connection
  const testConnection = async () => {
    setTestingConnection(true);
    try {
      await testConnectionMutation.mutateAsync();
    } finally {
      setTestingConnection(false);
    }
  };
  
  // Submit handler for WordPress connection form
  const onSubmitConnection = async (data: z.infer<typeof wordpressConnectionSchema>) => {
    await saveConnectionMutation.mutateAsync(data);
  };
  
  // Submit handler for field mapping form
  const onSubmitFieldMapping = async (data: z.infer<typeof fieldMappingSchema>) => {
    // Update local state and save to API
    setFieldMappings(data.customFields);
    await saveFieldMappingMutation.mutateAsync(data);
  };
  
  // Add a new custom field mapping
  const addCustomField = () => {
    const currentFields = fieldMappingForm.getValues("customFields");
    fieldMappingForm.setValue("customFields", [
      ...currentFields,
      { wpField: "", checkInField: "", isActive: true }
    ]);
  };
  
  // Remove a custom field mapping
  const removeCustomField = (index: number) => {
    const currentFields = fieldMappingForm.getValues("customFields");
    fieldMappingForm.setValue(
      "customFields",
      currentFields.filter((_, i) => i !== index)
    );
  };
  
  // Sync check-ins to WordPress
  const syncMutation = useMutation({
    mutationFn: (data: { checkInIds?: number[] }) => 
      apiRequest('POST', '/api/wordpress/custom-fields/sync', data),
    onSuccess: async (data) => {
      const response = await data.json();
      
      toast({
        title: "Sync Completed",
        description: response.message || `Synced ${response.synced} check-ins. ${response.failed} failed.`,
      });
      
      // Refresh custom fields data to update last sync info
      queryClient.invalidateQueries({ queryKey: ['/api/wordpress/custom-fields'] });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync check-ins to WordPress. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle sync button click
  const handleSync = async () => {
    await syncMutation.mutateAsync({});
  };
  
  // Generate WordPress shortcode
  const generateShortcode = () => {
    const shortcode = '[rankitpro_checkins count="5" job_type="all" technician_id="all" display="grid"]';
    
    // Copy to clipboard
    navigator.clipboard.writeText(shortcode).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Shortcode has been copied to your clipboard.",
      });
    });
    
    return shortcode;
  };
  
  // Generate WordPress widget code
  const generateWidgetCode = () => {
    const widgetCode = `<?php
// Add this code to your theme's functions.php file
function register_rankitpro_widget() {
    register_widget('RankItPro_CheckIns_Widget');
}
add_action('widgets_init', 'register_rankitpro_widget');

class RankItPro_CheckIns_Widget extends WP_Widget {
    function __construct() {
        parent::__construct(
            'rankitpro_checkins',
            'Rank It Pro Check-ins',
            array('description' => 'Display your latest service check-ins')
        );
    }
    
    // Widget output
    public function widget($args, $instance) {
        echo $args['before_widget'];
        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }
        
        // Get check-ins from API (you would implement this)
        echo do_shortcode('[rankitpro_checkins count="' . $instance['count'] . '" job_type="all" technician_id="all" display="list"]');
        
        echo $args['after_widget'];
    }
    
    // Widget admin form
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : 'Recent Service Visits';
        $count = !empty($instance['count']) ? $instance['count'] : 5;
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('title')); ?>">Title:</label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('title')); ?>" 
                   name="<?php echo esc_attr($this->get_field_name('title')); ?>" type="text" 
                   value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('count')); ?>">Number to show:</label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('count')); ?>" 
                   name="<?php echo esc_attr($this->get_field_name('count')); ?>" type="number" 
                   value="<?php echo esc_attr($count); ?>" min="1" max="10">
        </p>
        <?php
    }
    
    // Sanitize widget form values
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = (!empty($new_instance['title'])) ? sanitize_text_field($new_instance['title']) : '';
        $instance['count'] = (!empty($new_instance['count'])) ? absint($new_instance['count']) : 5;
        return $instance;
    }
}
?>`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(widgetCode).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Widget code has been copied to your clipboard.",
      });
    });
    
    return widgetCode;
  };
  
  // Generate WordPress API plugin code
  const generatePluginCode = () => {
    const pluginCode = `<?php
/**
 * Plugin Name: Rank It Pro WordPress Integration
 * Description: Integrates your WordPress site with Rank It Pro to display check-ins and sync content
 * Version: 1.0.0
 * Author: Rank It Pro
 */

defined('ABSPATH') or die('Direct access not allowed!');

class RankItProIntegration {
    private $api_key;
    private $secret_key;
    private $meta_prefix = 'rankitpro_';
    
    public function __construct() {
        // Register activation/deactivation hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Load settings from options
        $this->api_key = get_option('rankitpro_api_key', '');
        $this->secret_key = get_option('rankitpro_secret_key', '');
        $this->meta_prefix = get_option('rankitpro_meta_prefix', 'rankitpro_');
        
        // Register actions and hooks
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('rest_api_init', array($this, 'register_api_endpoints'));
        add_shortcode('rankitpro_checkins', array($this, 'checkins_shortcode'));
        
        // Custom post type for check-ins (optional)
        add_action('init', array($this, 'register_checkin_post_type'));
    }
    
    // Plugin activation
    public function activate() {
        // Set up default options
        add_option('rankitpro_api_key', '');
        add_option('rankitpro_secret_key', '');
        add_option('rankitpro_auto_publish', 'draft');
        add_option('rankitpro_meta_prefix', 'rankitpro_');
        
        // Flush rewrite rules if creating custom post type
        flush_rewrite_rules();
    }
    
    // Plugin deactivation
    public function deactivate() {
        flush_rewrite_rules();
    }
    
    // Add menu to WordPress admin
    public function add_admin_menu() {
        add_options_page(
            'Rank It Pro Integration',
            'Rank It Pro',
            'manage_options',
            'rankitpro-settings',
            array($this, 'settings_page')
        );
    }
    
    // Register settings
    public function register_settings() {
        register_setting('rankitpro_settings', 'rankitpro_api_key');
        register_setting('rankitpro_settings', 'rankitpro_secret_key');
        register_setting('rankitpro_settings', 'rankitpro_auto_publish');
        register_setting('rankitpro_settings', 'rankitpro_meta_prefix');
    }
    
    // Create settings page
    public function settings_page() {
        ?>
        <div class="wrap">
            <h1>Rank It Pro WordPress Integration</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('rankitpro_settings');
                do_settings_sections('rankitpro_settings');
                ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">API Key</th>
                        <td>
                            <input type="text" name="rankitpro_api_key" 
                                   value="<?php echo esc_attr(get_option('rankitpro_api_key')); ?>" class="regular-text">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Secret Key</th>
                        <td>
                            <input type="password" name="rankitpro_secret_key" 
                                   value="<?php echo esc_attr(get_option('rankitpro_secret_key')); ?>" class="regular-text">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Default Publish Status</th>
                        <td>
                            <select name="rankitpro_auto_publish">
                                <option value="draft" <?php selected(get_option('rankitpro_auto_publish'), 'draft'); ?>>Draft</option>
                                <option value="publish" <?php selected(get_option('rankitpro_auto_publish'), 'publish'); ?>>Publish</option>
                                <option value="pending" <?php selected(get_option('rankitpro_auto_publish'), 'pending'); ?>>Pending Review</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Meta Prefix</th>
                        <td>
                            <input type="text" name="rankitpro_meta_prefix" 
                                   value="<?php echo esc_attr(get_option('rankitpro_meta_prefix')); ?>" class="regular-text">
                            <p class="description">Prefix for custom fields (e.g., rankitpro_)</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
            
            <hr>
            
            <h2>API Status</h2>
            <p>
                <button class="button button-secondary" id="rankitpro-test-connection">Test Connection</button>
                <span id="rankitpro-connection-status">Unknown</span>
            </p>
            
            <h2>Shortcode Usage</h2>
            <p>Use the following shortcode to display check-ins on your site:</p>
            <pre>[rankitpro_checkins count="5" job_type="all" technician_id="all" display="grid"]</pre>
            
            <h3>Available Parameters:</h3>
            <ul>
                <li><strong>count</strong>: Number of check-ins to display (default: 5)</li>
                <li><strong>job_type</strong>: Filter by job type (default: all)</li>
                <li><strong>technician_id</strong>: Filter by technician (default: all)</li>
                <li><strong>display</strong>: Display style - grid, list, or carousel (default: grid)</li>
            </ul>
        </div>
        <?php
    }
    
    // Register custom post type for check-ins
    public function register_checkin_post_type() {
        $labels = array(
            'name'               => 'Check-ins',
            'singular_name'      => 'Check-in',
            'menu_name'          => 'Check-ins',
            'add_new'            => 'Add New',
            'add_new_item'       => 'Add New Check-in',
            'edit_item'          => 'Edit Check-in',
            'new_item'           => 'New Check-in',
            'view_item'          => 'View Check-in',
            'search_items'       => 'Search Check-ins',
            'not_found'          => 'No check-ins found',
            'not_found_in_trash' => 'No check-ins found in Trash',
        );
        
        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array('slug' => 'check-in'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => null,
            'supports'           => array('title', 'editor', 'author', 'thumbnail', 'excerpt', 'custom-fields'),
            'menu_icon'          => 'dashicons-clipboard',
        );
        
        register_post_type('rankitpro_checkin', $args);
    }
    
    // Register REST API endpoints
    public function register_api_endpoints() {
        register_rest_route('rankitpro/v1', '/status', array(
            'methods' => 'GET',
            'callback' => array($this, 'api_status'),
            'permission_callback' => array($this, 'api_permissions_check'),
        ));
        
        register_rest_route('rankitpro/v1', '/checkins', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_checkin'),
            'permission_callback' => array($this, 'api_permissions_check'),
        ));
    }
    
    // API permissions check
    public function api_permissions_check($request) {
        $headers = $request->get_headers();
        
        // Check for API key in headers
        if (!isset($headers['x_rankitpro_api_key'][0]) || $headers['x_rankitpro_api_key'][0] !== $this->api_key) {
            return new WP_Error('unauthorized', 'Invalid API key', array('status' => 401));
        }
        
        return true;
    }
    
    // API status endpoint
    public function api_status($request) {
        return array(
            'status' => 'connected',
            'version' => get_bloginfo('version'),
            'api_version' => '1.0.0',
            'site_name' => get_bloginfo('name'),
            'plugin_version' => '1.0.0',
        );
    }
    
    // Create check-in API endpoint
    public function create_checkin($request) {
        $params = $request->get_params();
        
        // Validate required fields
        if (empty($params['job_type']) || empty($params['technician_name'])) {
            return new WP_Error('missing_fields', 'Required fields are missing', array('status' => 400));
        }
        
        // Prepare post data
        $post_data = array(
            'post_title' => isset($params['title_prefix']) ? $params['title_prefix'] . ' ' . $params['job_type'] : $params['job_type'],
            'post_content' => $params['notes'] ?? '',
            'post_status' => get_option('rankitpro_auto_publish', 'draft'),
            'post_type' => 'rankitpro_checkin',
        );
        
        // Insert the post
        $post_id = wp_insert_post($post_data);
        
        if (is_wp_error($post_id)) {
            return new WP_Error('post_creation_failed', $post_id->get_error_message(), array('status' => 500));
        }
        
        // Add custom fields (meta data)
        foreach ($params as $key => $value) {
            if ($key !== 'title' && $key !== 'content') {
                update_post_meta($post_id, $this->meta_prefix . $key, $value);
            }
        }
        
        // Handle image uploads if present
        if (!empty($params['photos']) && is_array($params['photos'])) {
            foreach ($params['photos'] as $photo_url) {
                $this->attach_remote_image($post_id, $photo_url);
            }
        }
        
        return array(
            'success' => true,
            'post_id' => $post_id,
            'permalink' => get_permalink($post_id),
        );
    }
    
    // Attach remote image to post
    private function attach_remote_image($post_id, $image_url) {
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        
        // Download file to temp dir
        $tmp = download_url($image_url);
        
        if (is_wp_error($tmp)) {
            return false;
        }
        
        $file_array = array(
            'name' => basename($image_url),
            'tmp_name' => $tmp
        );
        
        // Do the validation and storage
        $id = media_handle_sideload($file_array, $post_id);
        
        // Clean up
        if (is_wp_error($id)) {
            @unlink($tmp);
            return false;
        }
        
        // Set as featured image if this is the first one
        if (get_post_thumbnail_id($post_id) === false) {
            set_post_thumbnail($post_id, $id);
        }
        
        return $id;
    }
    
    // Shortcode function
    public function checkins_shortcode($atts) {
        $atts = shortcode_atts(array(
            'count' => 5,
            'job_type' => 'all',
            'technician_id' => 'all',
            'display' => 'grid',
        ), $atts, 'rankitpro_checkins');
        
        $args = array(
            'post_type' => 'rankitpro_checkin',
            'posts_per_page' => intval($atts['count']),
            'post_status' => 'publish',
        );
        
        // Add meta query for filtering
        if ($atts['job_type'] !== 'all') {
            $args['meta_query'][] = array(
                'key' => $this->meta_prefix . 'job_type',
                'value' => $atts['job_type'],
                'compare' => '=',
            );
        }
        
        if ($atts['technician_id'] !== 'all') {
            $args['meta_query'][] = array(
                'key' => $this->meta_prefix . 'technician_id',
                'value' => $atts['technician_id'],
                'compare' => '=',
            );
        }
        
        $query = new WP_Query($args);
        
        ob_start();
        
        if ($query->have_posts()) {
            // Choose template based on display style
            $template = $atts['display'] === 'list' ? 'list' : ($atts['display'] === 'carousel' ? 'carousel' : 'grid');
            
            echo '<div class="rankitpro-checkins ' . esc_attr($template) . '">';
            
            while ($query->have_posts()) {
                $query->the_post();
                $job_type = get_post_meta(get_the_ID(), $this->meta_prefix . 'job_type', true);
                $technician = get_post_meta(get_the_ID(), $this->meta_prefix . 'technician_name', true);
                $location = get_post_meta(get_the_ID(), $this->meta_prefix . 'location', true);
                $date = get_post_meta(get_the_ID(), $this->meta_prefix . 'completion_date', true);
                
                // Format the date if present
                $formatted_date = !empty($date) ? date('F j, Y', strtotime($date)) : '';
                
                echo '<div class="rankitpro-checkin">';
                
                if (has_post_thumbnail()) {
                    echo '<div class="rankitpro-checkin-image">';
                    echo the_post_thumbnail('medium');
                    echo '</div>';
                }
                
                echo '<div class="rankitpro-checkin-content">';
                echo '<h3>' . esc_html(get_the_title()) . '</h3>';
                
                if (!empty($technician)) {
                    echo '<p class="rankitpro-technician"><strong>Technician:</strong> ' . esc_html($technician) . '</p>';
                }
                
                if (!empty($job_type)) {
                    echo '<p class="rankitpro-job-type"><strong>Service:</strong> ' . esc_html($job_type) . '</p>';
                }
                
                if (!empty($location)) {
                    echo '<p class="rankitpro-location"><strong>Location:</strong> ' . esc_html($location) . '</p>';
                }
                
                if (!empty($formatted_date)) {
                    echo '<p class="rankitpro-date"><strong>Completed:</strong> ' . esc_html($formatted_date) . '</p>';
                }
                
                echo '<div class="rankitpro-excerpt">' . get_the_excerpt() . '</div>';
                echo '<a href="' . get_permalink() . '" class="rankitpro-read-more">Read More</a>';
                echo '</div>';
                
                echo '</div>';
            }
            
            echo '</div>';
            
            // Add basic styles
            echo '<style>
                .rankitpro-checkins.grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }
                
                .rankitpro-checkins.list .rankitpro-checkin {
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #eee;
                }
                
                .rankitpro-checkin {
                    background: #fff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .rankitpro-checkin-image {
                    height: 200px;
                    overflow: hidden;
                }
                
                .rankitpro-checkin-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .rankitpro-checkin-content {
                    padding: 15px;
                }
                
                .rankitpro-checkin h3 {
                    margin-top: 0;
                    margin-bottom: 10px;
                }
                
                .rankitpro-read-more {
                    display: inline-block;
                    margin-top: 10px;
                    color: #0073aa;
                    text-decoration: none;
                }
                
                .rankitpro-read-more:hover {
                    text-decoration: underline;
                }
                
                @media (max-width: 768px) {
                    .rankitpro-checkins.grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>';
        } else {
            echo '<p>No check-ins found.</p>';
        }
        
        wp_reset_postdata();
        
        return ob_get_clean();
    }
}

// Initialize the plugin
$rankitpro_integration = new RankItProIntegration();`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(pluginCode).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Plugin code has been copied to your clipboard.",
      });
    });
    
    return pluginCode;
  };
  
  // Status badge styling based on connection status
  const getStatusBadge = () => {
    if (connStatus.status === "connected") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Connected
        </Badge>
      );
    } else if (connStatus.status === "error") {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700">
          <AlertCircle className="w-3 h-3 mr-1" />
          Error
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          Pending
        </Badge>
      );
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto p-6">
        <h1 className="text-2xl font-bold mb-6">WordPress Integration</h1>
        
        <Tabs defaultValue="connection">
          <TabsList className="mb-6">
            <TabsTrigger value="connection" className="flex items-center">
              <Globe className="mr-2 h-4 w-4" />
              Connection
            </TabsTrigger>
            <TabsTrigger value="field-mapping" className="flex items-center">
              <Settings2 className="mr-2 h-4 w-4" />
              Field Mapping
            </TabsTrigger>
            <TabsTrigger value="shortcodes" className="flex items-center">
              <Braces className="mr-2 h-4 w-4" />
              Shortcodes
            </TabsTrigger>
            <TabsTrigger value="installation" className="flex items-center">
              <FileCode className="mr-2 h-4 w-4" />
              Installation
            </TabsTrigger>
          </TabsList>
          
          {/* Connection Tab */}
          <TabsContent value="connection">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>WordPress Connection</CardTitle>
                    <CardDescription>
                      Connect to your WordPress site to sync check-ins
                    </CardDescription>
                  </div>
                  {getStatusBadge()}
                </div>
              </CardHeader>
              <CardContent>
                <Form {...connectionForm}>
                  <form onSubmit={connectionForm.handleSubmit(onSubmitConnection)} className="space-y-6">
                    <FormField
                      control={connectionForm.control}
                      name="siteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WordPress Site URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            The URL of your WordPress site
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={connectionForm.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input placeholder="Your WordPress API key" {...field} />
                            </FormControl>
                            <FormDescription>
                              API key generated by the WordPress plugin
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={connectionForm.control}
                        name="secretKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secret Key</FormLabel>
                            <FormControl>
                              <Input placeholder="Your WordPress secret key" type="password" {...field} />
                            </FormControl>
                            <FormDescription>
                              Secret key generated by the WordPress plugin
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-base">Connection Options</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={connectionForm.control}
                          name="useRestApi"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Use REST API</FormLabel>
                                <FormDescription>
                                  Use WordPress REST API for integration
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={connectionForm.control}
                          name="autoPublish"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Auto-Publish</FormLabel>
                                <FormDescription>
                                  Automatically publish synced check-ins
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={connectionForm.control}
                        name="postStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Post Status</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select post status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="publish">Published</SelectItem>
                                <SelectItem value="pending">Pending Review</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Default status when creating WordPress posts
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={connectionForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Category</FormLabel>
                            <Select 
                              value={field.value || ""} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">No Category</SelectItem>
                                {wpCategories.map(category => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Default category for synced check-ins
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Save Connection
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={testConnection}
                        disabled={testingConnection}
                      >
                        {testingConnection ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Test Connection
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {connStatus.status === "connected" && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Connection Details</CardTitle>
                  <CardDescription>
                    Information about the connected WordPress site
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">WordPress Version</h3>
                      <p>{connectionStatus.version}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">API Status</h3>
                      <p>{connectionStatus.apiStatus}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Last Successful Sync</h3>
                      <p>{new Date(connectionStatus.lastSuccessfulSync).toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Posts Created</h3>
                      <p>{connectionStatus.postCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Field Mapping Tab */}
          <TabsContent value="field-mapping">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>WordPress Field Mapping</CardTitle>
                    <CardDescription>
                      Configure how check-in fields map to WordPress fields
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...fieldMappingForm}>
                  <form onSubmit={fieldMappingForm.handleSubmit(onSubmitFieldMapping)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Basic Mapping</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={fieldMappingForm.control}
                          name="titlePrefix"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title Prefix</FormLabel>
                              <FormControl>
                                <Input placeholder="[Check-in] " {...field} />
                              </FormControl>
                              <FormDescription>
                                Optional prefix for WordPress post titles
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={fieldMappingForm.control}
                          name="contentFieldMapping"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Main Content Field</FormLabel>
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select field" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {checkInFields.map(checkInField => (
                                    <SelectItem key={checkInField.id} value={checkInField.id}>
                                      {checkInField.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Field to use for WordPress post content
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={fieldMappingForm.control}
                          name="includePhotos"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Include Photos</FormLabel>
                                <FormDescription>
                                  Include check-in photos in WordPress posts
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={fieldMappingForm.control}
                          name="includeLocation"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Include Location</FormLabel>
                                <FormDescription>
                                  Include location information in WordPress posts
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-medium">Custom Field Mappings</h3>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={addCustomField}
                        >
                          Add Field Mapping
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500 pb-2">
                          <div className="col-span-5">WordPress Field</div>
                          <div className="col-span-5">Check-in Field</div>
                          <div className="col-span-1 text-center">Active</div>
                          <div className="col-span-1"></div>
                        </div>
                        
                        {fieldMappingForm.getValues("customFields").map((field, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-5">
                              <Input
                                placeholder="WordPress field"
                                value={field.wpField}
                                onChange={(e) => {
                                  const newFields = [...fieldMappingForm.getValues("customFields")];
                                  newFields[index].wpField = e.target.value;
                                  fieldMappingForm.setValue("customFields", newFields);
                                }}
                              />
                            </div>
                            
                            <div className="col-span-5">
                              <Select 
                                value={field.checkInField}
                                onValueChange={(newValue) => {
                                  const newFields = [...fieldMappingForm.getValues("customFields")];
                                  newFields[index].checkInField = newValue;
                                  fieldMappingForm.setValue("customFields", newFields);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select field" />
                                </SelectTrigger>
                                <SelectContent>
                                  {checkInFields.map(checkInField => (
                                    <SelectItem key={checkInField.id} value={checkInField.id}>
                                      {checkInField.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="col-span-1 flex justify-center">
                              <Checkbox
                                checked={field.isActive}
                                onCheckedChange={(checked) => {
                                  const newFields = [...fieldMappingForm.getValues("customFields")];
                                  newFields[index].isActive = !!checked;
                                  fieldMappingForm.setValue("customFields", newFields);
                                }}
                              />
                            </div>
                            
                            <div className="col-span-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeCustomField(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <FormField
                      control={fieldMappingForm.control}
                      name="metaPrefix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Field Prefix</FormLabel>
                          <FormControl>
                            <Input placeholder="rankitpro_" {...field} />
                          </FormControl>
                          <FormDescription>
                            Prefix for WordPress custom meta fields (e.g., rankitpro_technician, rankitpro_location)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Advanced Mapping</h3>
                      
                      <FormField
                        control={fieldMappingForm.control}
                        name="advancedMapping"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom JavaScript Mapping</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="// Add custom JavaScript mapping function here"
                                className="font-mono text-sm min-h-[200px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Advanced custom mapping using JavaScript. Use this function to transform check-in data before sending to WordPress.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Save Field Mappings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Shortcodes Tab */}
          <TabsContent value="shortcodes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>WordPress Shortcode</CardTitle>
                  <CardDescription>
                    Use this shortcode to display check-ins on your WordPress site
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                        {`[rankitpro_checkins count="5" job_type="all" technician_id="all" display="grid"]`}
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => generateShortcode()}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Available Parameters:</h3>
                      <ul className="space-y-1 text-sm">
                        <li><strong>count</strong>: Number of check-ins to display (default: 5)</li>
                        <li><strong>job_type</strong>: Filter by job type (default: all)</li>
                        <li><strong>technician_id</strong>: Filter by technician (default: all)</li>
                        <li><strong>display</strong>: Display style - grid, list, or carousel (default: grid)</li>
                      </ul>
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="text-sm font-medium mb-2">Example Shortcodes:</h3>
                      <div className="space-y-2 text-sm">
                        <p><code>[rankitpro_checkins count="3" display="list"]</code> - Show 3 check-ins in a list format</p>
                        <p><code>[rankitpro_checkins job_type="Repair"]</code> - Show only repair check-ins</p>
                        <p><code>[rankitpro_checkins technician_id="54" count="10"]</code> - Show 10 check-ins from technician #54</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>WordPress Widget</CardTitle>
                  <CardDescription>
                    Use this widget code to add a check-ins widget to your sidebar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => generateWidgetCode()}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Widget Code
                    </Button>
                    
                    <div className="pt-2">
                      <h3 className="text-sm font-medium mb-2">Widget Features:</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Display the latest check-ins in your WordPress sidebar</li>
                        <li>• Customizable title and number of check-ins to display</li>
                        <li>• Responsive design that adapts to your theme</li>
                        <li>• Includes technician name, service type, and completion date</li>
                      </ul>
                    </div>
                    
                    <div className="pt-2">
                      <h3 className="text-sm font-medium mb-2">Installation:</h3>
                      <ol className="space-y-1 text-sm list-decimal list-inside">
                        <li>Copy the widget code to your clipboard</li>
                        <li>Add it to your theme's functions.php file</li>
                        <li>Go to Appearance → Widgets in your WordPress admin</li>
                        <li>Drag the "Rank It Pro Check-ins" widget to your sidebar</li>
                        <li>Configure the widget title and number of check-ins to display</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Display Example</CardTitle>
                <CardDescription>
                  Preview of how check-ins will appear on your WordPress site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Grid Display (Default)</h3>
                    <div className="border rounded-md p-4 bg-white">
                      <div className="grid grid-cols-2 gap-4">
                        {[1, 2].map(i => (
                          <div key={i} className="border rounded-md overflow-hidden">
                            <div className="h-32 bg-gray-200 flex items-center justify-center">
                              <div className="text-gray-400">Check-in Photo</div>
                            </div>
                            <div className="p-3">
                              <h4 className="font-medium text-sm">HVAC Repair</h4>
                              <p className="text-xs text-gray-500 mt-1">Technician: John Smith</p>
                              <p className="text-xs text-gray-500">Location: Seattle, WA</p>
                              <p className="text-xs text-gray-500">Completed: May 21, 2025</p>
                              <div className="text-xs mt-2">Fixed air handler unit and replaced filter...</div>
                              <a href="#" className="text-xs text-primary mt-2 inline-block">Read More</a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">List Display</h3>
                    <div className="border rounded-md p-4 bg-white">
                      <div className="space-y-4">
                        {[1, 2].map(i => (
                          <div key={i} className="border-b pb-4 last:border-0 last:pb-0 flex gap-3">
                            <div className="w-24 h-24 bg-gray-200 flex-shrink-0 flex items-center justify-center">
                              <div className="text-gray-400 text-xs">Photo</div>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">Plumbing Service</h4>
                              <p className="text-xs text-gray-500 mt-1">Technician: Sarah Johnson</p>
                              <p className="text-xs text-gray-500">Location: Bellevue, WA</p>
                              <div className="text-xs mt-1">Repaired leaking kitchen faucet and inspected...</div>
                              <a href="#" className="text-xs text-primary mt-1 inline-block">Read More</a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Installation Tab */}
          <TabsContent value="installation">
            <Card>
              <CardHeader>
                <CardTitle>WordPress Plugin Installation</CardTitle>
                <CardDescription>
                  Install the Rank It Pro WordPress plugin on your site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => generatePluginCode()}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Plugin Code
                    </Button>
                    
                    <h3 className="text-base font-medium pt-4">Manual Installation</h3>
                    <ol className="space-y-4 list-decimal list-inside">
                      <li className="pl-2">
                        <p className="font-medium inline">Create a new plugin file</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Navigate to your WordPress installation and go to the <code className="text-xs bg-gray-100 p-1 rounded">wp-content/plugins</code> directory.
                          Create a new folder named <code className="text-xs bg-gray-100 p-1 rounded">rankitpro-integration</code>.
                        </p>
                      </li>
                      
                      <li className="pl-2">
                        <p className="font-medium inline">Add the plugin code</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Inside the new folder, create a file named <code className="text-xs bg-gray-100 p-1 rounded">rankitpro-integration.php</code>.
                          Copy and paste the plugin code from above into this file.
                        </p>
                      </li>
                      
                      <li className="pl-2">
                        <p className="font-medium inline">Activate the plugin</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Go to your WordPress admin dashboard, navigate to Plugins, and activate the "Rank It Pro WordPress Integration" plugin.
                        </p>
                      </li>
                      
                      <li className="pl-2">
                        <p className="font-medium inline">Configure the plugin</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Go to Settings → Rank It Pro to configure the plugin. Enter your API key and secret key from this page.
                        </p>
                      </li>
                      
                      <li className="pl-2">
                        <p className="font-medium inline">Test the connection</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Click "Test Connection" on both the WordPress admin page and this integration page to verify the connection.
                        </p>
                      </li>
                    </ol>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div>
                      <h3 className="text-base font-medium mb-3">Plugin Features</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Custom post type for check-ins</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">REST API endpoints for integration</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Shortcode for displaying check-ins</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Widget for sidebar display</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Custom field mapping support</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Image attachment handling</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-3">Requirements</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">WordPress 5.6 or higher</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">REST API enabled</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">PHP 7.4 or higher</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">File upload permissions</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">Custom post types support</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-base font-medium mb-3">API Integration Details</h3>
                    <div className="bg-gray-50 rounded-md p-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium">WordPress REST API Endpoints</h4>
                        <ul className="mt-2 text-sm space-y-1">
                          <li><code className="text-xs bg-gray-100 p-1 rounded">/wp-json/rankitpro/v1/status</code> - Check API status</li>
                          <li><code className="text-xs bg-gray-100 p-1 rounded">/wp-json/rankitpro/v1/checkins</code> - Create check-in posts</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium">API Authentication</h4>
                        <p className="mt-1 text-sm">
                          Requests to the WordPress API must include the following headers:
                        </p>
                        <ul className="mt-2 text-sm space-y-1">
                          <li><code className="text-xs bg-gray-100 p-1 rounded">X-RankItPro-API-Key</code> - Your API key</li>
                          <li><code className="text-xs bg-gray-100 p-1 rounded">Content-Type</code> - application/json</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
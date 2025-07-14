import React from 'react';
import { InfoPageLayout } from '../../components/layouts/InfoPageLayout';
import { Link } from 'wouter';

export default function WordPressIntegrationGuide() {
  return (
    <InfoPageLayout
      title="WordPress Integration Guide"
      description="How to seamlessly connect Rank It Pro with your WordPress website"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-4">🔄</span>
            <div>
              <h2 className="text-xl font-bold text-primary">WordPress Integration Guide</h2>
              <p className="text-slate-600">Last updated: May 15, 2025</p>
            </div>
          </div>
          <p className="text-slate-700">
            This comprehensive guide will walk you through seamlessly connecting your Rank It Pro account
            with your WordPress website, enabling automatic publication of service check-ins, technician
            profiles, and customer reviews to boost your online presence and SEO.
          </p>
        </div>

        <div className="prose prose-slate max-w-none mb-12">
          <h2>Integration Overview</h2>
          <p>
            Rank It Pro offers a powerful WordPress integration that automatically publishes content
            from your technicians' check-ins directly to your website. This integration helps:
          </p>
          <ul>
            <li>Create regular, location-specific content for improved local SEO</li>
            <li>Showcase your team's expertise and quality workmanship</li>
            <li>Build a searchable portfolio of completed services</li>
            <li>Display verified customer reviews</li>
            <li>Create rich content without additional marketing effort</li>
          </ul>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
            <p className="text-sm text-yellow-800">
              <strong>Before You Begin:</strong> You'll need administrator access to your WordPress website and your
              Rank It Pro account. It's also recommended to create a backup of your site before installation.
            </p>
          </div>

          <h2>Integration Options</h2>
          <p>
            Rank It Pro offers two methods for WordPress integration. Choose the option that best fits your needs:
          </p>
          
          <div className="not-prose my-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-lg mb-3">Plugin Method</h3>
                <div className="bg-green-50 text-green-800 text-sm px-3 py-1 rounded inline-block mb-3">Recommended</div>
                <p className="text-sm mb-4">
                  Install our dedicated WordPress plugin for the most seamless experience and full feature set.
                </p>
                <h4 className="font-semibold text-sm mb-2">Best for:</h4>
                <ul className="list-disc pl-5 text-sm mb-4">
                  <li>WordPress.org sites (self-hosted)</li>
                  <li>Sites without code restrictions</li>
                  <li>Users wanting advanced customization</li>
                  <li>Access to all integration features</li>
                </ul>
                <h4 className="font-semibold text-sm mb-2">Difficulty:</h4>
                <div className="flex items-center mb-4">
                  <div className="bg-primary h-2 w-10 rounded-l"></div>
                  <div className="bg-primary h-2 w-10"></div>
                  <div className="bg-slate-200 h-2 w-10"></div>
                  <div className="bg-slate-200 h-2 w-10"></div>
                  <div className="bg-slate-200 h-2 w-10 rounded-r"></div>
                  <span className="ml-2 text-xs">Easy</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-lg mb-3">API Method</h3>
                <div className="bg-yellow-50 text-yellow-800 text-sm px-3 py-1 rounded inline-block mb-3">Advanced</div>
                <p className="text-sm mb-4">
                  Connect using our API for sites where plugin installation isn't possible or for custom implementations.
                </p>
                <h4 className="font-semibold text-sm mb-2">Best for:</h4>
                <ul className="list-disc pl-5 text-sm mb-4">
                  <li>WordPress.com sites with restrictions</li>
                  <li>Custom theme implementations</li>
                  <li>Developers wanting more control</li>
                  <li>Sites with special security requirements</li>
                </ul>
                <h4 className="font-semibold text-sm mb-2">Difficulty:</h4>
                <div className="flex items-center mb-4">
                  <div className="bg-primary h-2 w-10 rounded-l"></div>
                  <div className="bg-primary h-2 w-10"></div>
                  <div className="bg-primary h-2 w-10"></div>
                  <div className="bg-primary h-2 w-10"></div>
                  <div className="bg-slate-200 h-2 w-10 rounded-r"></div>
                  <span className="ml-2 text-xs">Advanced</span>
                </div>
              </div>
            </div>
          </div>

          <h2>Option 1: Plugin Installation Method</h2>
          <p>
            Follow these steps to install and configure the Rank It Pro WordPress plugin:
          </p>

          <h3>Step 1: Install the Plugin</h3>
          <ol>
            <li>
              <strong>Log in</strong> to your WordPress admin dashboard
            </li>
            <li>
              Navigate to <strong>Plugins → Add New</strong>
            </li>
            <li>
              Click the <strong>Upload Plugin</strong> button at the top of the page
            </li>
            <li>
              <strong>Download</strong> the Rank It Pro plugin from your Rank It Pro dashboard (Settings → WordPress Integration → Download Plugin)
            </li>
            <li>
              <strong>Choose the file</strong> you downloaded (rank-it-pro.zip) and click <strong>Install Now</strong>
            </li>
            <li>
              After installation completes, click <strong>Activate Plugin</strong>
            </li>
          </ol>

          <div className="not-prose my-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h4 className="font-semibold mb-2">Alternative Manual Installation</h4>
              <p className="text-sm mb-3">If you prefer manual installation, follow these steps:</p>
              <ol className="list-decimal pl-5 text-sm">
                <li>Download the plugin from your Rank It Pro dashboard</li>
                <li>Unzip the downloaded file</li>
                <li>Using FTP or your hosting file manager, upload the <code>rank-it-pro</code> folder to your <code>/wp-content/plugins/</code> directory</li>
                <li>Activate the plugin through the WordPress admin dashboard</li>
              </ol>
            </div>
          </div>

          <h3>Step 2: Connect Your Rank It Pro Account</h3>
          <ol>
            <li>
              In your WordPress admin, navigate to <strong>Rank It Pro → Settings</strong>
            </li>
            <li>
              You'll need your <strong>API Key</strong> from Rank It Pro:
              <ul>
                <li>Log in to your Rank It Pro dashboard</li>
                <li>Go to Settings → WordPress Integration</li>
                <li>Copy your API Key</li>
              </ul>
            </li>
            <li>
              Back in WordPress, paste your API Key into the field labeled <strong>"API Key"</strong>
            </li>
            <li>
              Click <strong>Verify Connection</strong>
            </li>
            <li>
              If successful, you'll see a green confirmation message
            </li>
          </ol>

          <h3>Step 3: Configure Content Settings</h3>
          <p>
            Now that your accounts are connected, you'll need to configure how content is published to your site:
          </p>
          <ol>
            <li>
              In WordPress, navigate to <strong>Rank It Pro → Content Settings</strong>
            </li>
            <li>
              <strong>Configure Check-in Publication:</strong>
              <ul>
                <li><strong>Post Type:</strong> Choose whether check-ins should be published as Posts, Pages, or a Custom Post Type</li>
                <li><strong>Categories:</strong> Select default categories or create new ones specifically for check-ins</li>
                <li><strong>Tags:</strong> Configure automatic tagging based on service type</li>
                <li><strong>Author:</strong> Choose a default author or map to technicians</li>
                <li><strong>Publication Status:</strong> Set to "Published" for immediate publication or "Draft" for review</li>
              </ul>
            </li>
            <li>
              <strong>Configure Review Publication:</strong>
              <ul>
                <li><strong>Display Location:</strong> Choose where reviews should appear (dedicated page, sidebar widget, or shortcode)</li>
                <li><strong>Review Filters:</strong> Set minimum star rating for public display (recommended: 4+)</li>
                <li><strong>Review Format:</strong> Select from available display templates</li>
              </ul>
            </li>
            <li>
              <strong>Configure Technician Profiles:</strong>
              <ul>
                <li><strong>Directory Page:</strong> Create or select a page to host technician profiles</li>
                <li><strong>Profile Details:</strong> Choose which information to display (photo, bio, specialties, etc.)</li>
              </ul>
            </li>
            <li>
              Click <strong>Save Settings</strong>
            </li>
          </ol>

          <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 my-8">
            <h3 className="font-bold text-lg mb-4">Content Mapping Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-primary mb-2">For Service Companies</h4>
                <ul className="list-disc pl-5 text-sm">
                  <li><strong>Check-ins:</strong> Custom Post Type with service category taxonomy</li>
                  <li><strong>URL Structure:</strong> /services/[category]/[post-name]</li>
                  <li><strong>Page Template:</strong> Service Showcase template</li>
                  <li><strong>Sidebar:</strong> Related services, call-to-action</li>
                  <li><strong>Automation:</strong> Full publication with image gallery</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">For Contractors</h4>
                <ul className="list-disc pl-5 text-sm">
                  <li><strong>Check-ins:</strong> Blog Posts with project categories</li>
                  <li><strong>URL Structure:</strong> /projects/[year]/[post-name]</li>
                  <li><strong>Page Template:</strong> Portfolio template</li>
                  <li><strong>Sidebar:</strong> Project details, testimonial</li>
                  <li><strong>Automation:</strong> Draft status for review before publishing</li>
                </ul>
              </div>
            </div>
          </div>

          <h3>Step 4: Design Integration</h3>
          <p>
            Customize how Rank It Pro content appears on your website:
          </p>
          <ol>
            <li>
              Navigate to <strong>Rank It Pro → Display Settings</strong>
            </li>
            <li>
              <strong>Choose a Template:</strong> Select from available display templates for check-ins, reviews, and technician profiles
            </li>
            <li>
              <strong>Customize Colors:</strong> Match the plugin styling to your website's color scheme
            </li>
            <li>
              <strong>Layout Options:</strong> Configure grid/list views, image sizes, and information displayed
            </li>
            <li>
              <strong>Preview</strong> your changes using the live preview tool
            </li>
            <li>
              Click <strong>Save Display Settings</strong>
            </li>
          </ol>

          <div className="not-prose my-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h4 className="font-semibold mb-2">Using Shortcodes</h4>
              <p className="text-sm mb-3">The plugin provides several shortcodes for flexible content placement:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <code className="bg-slate-200 p-1 rounded">[rankit_recent_checkins count="5"]</code>
                  <p className="mt-1 mb-3">Displays recent check-ins</p>
                  
                  <code className="bg-slate-200 p-1 rounded">[rankit_checkins_map]</code>
                  <p className="mt-1 mb-3">Shows a map of recent service locations</p>
                </div>
                <div>
                  <code className="bg-slate-200 p-1 rounded">[rankit_reviews rating="4" count="3"]</code>
                  <p className="mt-1 mb-3">Displays recent reviews with specified rating</p>
                  
                  <code className="bg-slate-200 p-1 rounded">[rankit_technician_profile id="123"]</code>
                  <p className="mt-1">Shows a specific technician's profile</p>
                </div>
              </div>
            </div>
          </div>

          <h3>Step 5: Test the Integration</h3>
          <p>
            Before relying on the integration for regular content, it's important to test it thoroughly:
          </p>
          <ol>
            <li>
              In your Rank It Pro account, navigate to <strong>Check-ins</strong> and select a recent check-in
            </li>
            <li>
              Click the <strong>Publish to WordPress</strong> button (or ensure auto-publishing is enabled)
            </li>
            <li>
              Visit your WordPress site to verify the content appears as expected
            </li>
            <li>
              Check mobile responsiveness by viewing the page on a mobile device
            </li>
            <li>
              Verify that images are properly sized and optimized
            </li>
            <li>
              Test any interactive elements like review carousels or service maps
            </li>
          </ol>

          <h2>Option 2: API Integration Method</h2>
          <p>
            For advanced users or sites where plugin installation isn't possible, you can use our API for a custom integration:
          </p>

          <h3>Step 1: Generate API Credentials</h3>
          <ol>
            <li>
              Log in to your Rank It Pro dashboard
            </li>
            <li>
              Navigate to <strong>Settings → API Access</strong>
            </li>
            <li>
              Click <strong>Generate New API Key</strong>
            </li>
            <li>
              Name your key (e.g., "WordPress Integration") and set appropriate permissions
            </li>
            <li>
              Store your API Key and Secret securely — they will only be shown once
            </li>
          </ol>

          <h3>Step 2: Install the Helper Class</h3>
          <div className="not-prose my-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm mb-3">Download our WordPress helper class and add it to your theme or plugin:</p>
              <pre className="text-xs bg-slate-100 p-3 rounded overflow-x-auto">
                {`// Include the RankItPro API Helper Class
require_once('rank-it-pro-api.php');

// Initialize the API with your credentials
$rankitpro = new RankItProAPI(
    'YOUR_API_KEY',
    'YOUR_API_SECRET'
);

// Verify connection
if($rankitpro->verifyConnection()) {
    echo 'Connection successful!';
} else {
    echo 'Connection failed: ' . $rankitpro->getLastError();
}`}
              </pre>
            </div>
          </div>

          <h3>Step 3: Create Content Import Functions</h3>
          <p>
            Add functions to import different content types from Rank It Pro:
          </p>
          <div className="not-prose my-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm mb-3">Example function to import check-ins as posts:</p>
              <pre className="text-xs bg-slate-100 p-3 rounded overflow-x-auto">
                {`/**
 * Import check-ins as WordPress posts
 */
function import_checkins_as_posts() {
    global $rankitpro;
    
    // Get recent check-ins
    $checkins = $rankitpro->getCheckIns([
        'limit' => 10,
        'status' => 'published',
        'since' => date('Y-m-d', strtotime('-1 week'))
    ]);
    
    if(!$checkins || isset($checkins->error)) {
        error_log('Error fetching check-ins: ' . ($checkins->error ?? 'Unknown error'));
        return false;
    }
    
    foreach($checkins as $checkin) {
        // Check if this check-in already exists
        $existing = get_posts([
            'meta_key' => 'rankitpro_checkin_id',
            'meta_value' => $checkin->id,
            'post_type' => 'post',
            'post_status' => 'any',
        ]);
        
        if(!empty($existing)) {
            continue; // Skip if already imported
        }
        
        // Prepare post data
        $post_data = [
            'post_title'   => $checkin->jobType . ' in ' . $checkin->location,
            'post_content' => $checkin->notes,
            'post_status'  => 'publish',
            'post_author'  => 1, // Default author ID
            'post_type'    => 'post',
            'meta_input'   => [
                'rankitpro_checkin_id' => $checkin->id,
                'rankitpro_technician' => $checkin->technicianName,
                'rankitpro_location'   => $checkin->location,
                'rankitpro_service'    => $checkin->jobType
            ]
        ];
        
        // Insert post
        $post_id = wp_insert_post($post_data);
        
        // Import images if available
        if($post_id && !is_wp_error($post_id) && !empty($checkin->photos)) {
            import_checkin_photos($checkin->photos, $post_id);
        }
    }
    
    return true;
}`}
              </pre>
            </div>
          </div>

          <h3>Step 4: Schedule Regular Content Import</h3>
          <p>
            Use WordPress cron to schedule regular content imports:
          </p>
          <div className="not-prose my-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <pre className="text-xs bg-slate-100 p-3 rounded overflow-x-auto">
                {`// Register cron schedule
register_activation_hook(__FILE__, 'activate_rankitpro_cron');
function activate_rankitpro_cron() {
    if(!wp_next_scheduled('rankitpro_import_content')) {
        wp_schedule_event(time(), 'hourly', 'rankitpro_import_content');
    }
}

// Cron hook
add_action('rankitpro_import_content', 'run_rankitpro_imports');
function run_rankitpro_imports() {
    import_checkins_as_posts();
    import_reviews();
    update_technician_profiles();
}`}
              </pre>
            </div>
          </div>

          <h3>Step 5: Create Display Templates</h3>
          <p>
            Create templates for displaying Rank It Pro content on your WordPress site:
          </p>
          <div className="not-prose my-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm mb-3">Example shortcode to display recent check-ins:</p>
              <pre className="text-xs bg-slate-100 p-3 rounded overflow-x-auto">
                {`// Register shortcode
add_shortcode('rankitpro_recent', 'rankitpro_recent_shortcode');

function rankitpro_recent_shortcode($atts) {
    $atts = shortcode_atts([
        'count'    => 5,
        'service'  => '',
        'location' => '',
    ], $atts);
    
    $args = [
        'post_type'      => 'post',
        'posts_per_page' => intval($atts['count']),
        'meta_query'     => [
            [
                'key'     => 'rankitpro_checkin_id',
                'compare' => 'EXISTS',
            ]
        ]
    ];
    
    // Add service filter if specified
    if(!empty($atts['service'])) {
        $args['meta_query'][] = [
            'key'     => 'rankitpro_service',
            'value'   => $atts['service'],
            'compare' => 'LIKE',
        ];
    }
    
    // Add location filter if specified
    if(!empty($atts['location'])) {
        $args['meta_query'][] = [
            'key'     => 'rankitpro_location',
            'value'   => $atts['location'],
            'compare' => 'LIKE',
        ];
    }
    
    $query = new WP_Query($args);
    
    ob_start();
    if($query->have_posts()) {
        echo '<div class="rankitpro-checkins">';
        while($query->have_posts()) {
            $query->the_post();
            echo '<div class="rankitpro-checkin">';
            echo '<h3>' . get_the_title() . '</h3>';
            echo '<div class="rankitpro-meta">';
            echo '<span class="technician">Technician: ' . get_post_meta(get_the_ID(), 'rankitpro_technician', true) . '</span>';
            echo '<span class="location">Location: ' . get_post_meta(get_the_ID(), 'rankitpro_location', true) . '</span>';
            echo '</div>';
            echo '<div class="rankitpro-content">' . get_the_content() . '</div>';
            echo '</div>';
        }
        echo '</div>';
    } else {
        echo 'No recent service check-ins found.';
    }
    wp_reset_postdata();
    
    return ob_get_clean();
}`}
              </pre>
            </div>
          </div>

          <h2>Advanced Configuration</h2>

          <h3>Custom Fields Integration</h3>
          <p>
            Rank It Pro check-ins include numerous data points that can be mapped to custom fields in WordPress:
          </p>
          <div className="not-prose my-6">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-slate-200">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="py-2 px-4 border-b text-left">Rank It Pro Field</th>
                    <th className="py-2 px-4 border-b text-left">WordPress Option</th>
                    <th className="py-2 px-4 border-b text-left">SEO Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-4 border-b">Job Type</td>
                    <td className="py-2 px-4 border-b">Category or Custom Taxonomy</td>
                    <td className="py-2 px-4 border-b">High - Service keyword targeting</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">Location</td>
                    <td className="py-2 px-4 border-b">Tag or Location Custom Field</td>
                    <td className="py-2 px-4 border-b">Very High - Local SEO targeting</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">Technician</td>
                    <td className="py-2 px-4 border-b">Author or Custom Field</td>
                    <td className="py-2 px-4 border-b">Medium - Builds E-E-A-T signals</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">Service Date</td>
                    <td className="py-2 px-4 border-b">Post Date or Custom Field</td>
                    <td className="py-2 px-4 border-b">Medium - Freshness signals</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">Photos</td>
                    <td className="py-2 px-4 border-b">Featured Image & Gallery</td>
                    <td className="py-2 px-4 border-b">High - Engagement and image search</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">Customer Name</td>
                    <td className="py-2 px-4 border-b">Custom Field (optional)</td>
                    <td className="py-2 px-4 border-b">Low - Privacy considerations</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-b">Equipment Details</td>
                    <td className="py-2 px-4 border-b">Custom Field or Content</td>
                    <td className="py-2 px-4 border-b">High - Specific product keywords</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h3>SEO Optimization</h3>
          <p>
            The plugin includes several features to maximize SEO benefit from check-ins:
          </p>
          <ul>
            <li>
              <strong>Schema Markup:</strong> Automatically adds LocalBusiness and Service schema to check-in pages
            </li>
            <li>
              <strong>Auto Meta Descriptions:</strong> Generates optimized meta descriptions from check-in content
            </li>
            <li>
              <strong>Geo Tagging:</strong> Adds precise geolocation metadata when available
            </li>
            <li>
              <strong>Image Optimization:</strong> Properly sizes, compresses, and adds alt text to all uploaded images
            </li>
            <li>
              <strong>Internal Linking:</strong> Creates intelligent links between related services and locations
            </li>
          </ul>

          <div className="not-prose my-6">
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-lg mb-4">SEO Best Practices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-primary mb-2">URL Structure</h4>
                  <div className="mb-2">
                    <p className="text-sm mb-1"><span className="text-red-500">❌ Poor:</span></p>
                    <code className="text-xs bg-slate-100 p-1.5 rounded block">yoursite.com/?p=123</code>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm mb-1"><span className="text-yellow-500">⚠️ Better:</span></p>
                    <code className="text-xs bg-slate-100 p-1.5 rounded block">yoursite.com/2023/05/service-checkin</code>
                  </div>
                  <div>
                    <p className="text-sm mb-1"><span className="text-green-500">✅ Best:</span></p>
                    <code className="text-xs bg-slate-100 p-1.5 rounded block">example.com/services/hvac/repair-brighton</code>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Title Format</h4>
                  <div className="mb-2">
                    <p className="text-sm mb-1"><span className="text-red-500">❌ Poor:</span></p>
                    <code className="text-xs bg-slate-100 p-1.5 rounded block">Check-in #123</code>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm mb-1"><span className="text-yellow-500">⚠️ Better:</span></p>
                    <code className="text-xs bg-slate-100 p-1.5 rounded block">AC Repair Service</code>
                  </div>
                  <div>
                    <p className="text-sm mb-1"><span className="text-green-500">✅ Best:</span></p>
                    <code className="text-xs bg-slate-100 p-1.5 rounded block">Emergency AC Repair in Brighton, CO</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h3>Integrating with Popular SEO Plugins</h3>
          <p>
            Rank It Pro works seamlessly with these popular WordPress SEO plugins:
          </p>
          <ul>
            <li>
              <strong>Yoast SEO:</strong> Auto-populates SEO title, meta description, and focus keyphrase
            </li>
            <li>
              <strong>Rank Math:</strong> Integrates with Advanced Schema and Local SEO modules
            </li>
            <li>
              <strong>All in One SEO Pack:</strong> Compatible with all features including local SEO
            </li>
            <li>
              <strong>SEOPress:</strong> Supports XML sitemap and structured data features
            </li>
          </ul>

          <h2>Troubleshooting Common Issues</h2>

          <div className="not-prose my-8">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-2">Content Not Importing</h3>
                <p className="text-sm mb-3">Check these common causes:</p>
                <ul className="list-disc pl-5 text-sm">
                  <li>Verify your API key is correct and active</li>
                  <li>Check that your WordPress user has sufficient permissions</li>
                  <li>Look for PHP errors in your server logs</li>
                  <li>Confirm WordPress permalinks are properly configured</li>
                  <li>Temporarily disable security plugins that might block API requests</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-2">Images Not Displaying</h3>
                <p className="text-sm mb-3">Try these solutions:</p>
                <ul className="list-disc pl-5 text-sm">
                  <li>Verify PHP has sufficient memory allocation for image processing</li>
                  <li>Check folder permissions for wp-content/uploads directory</li>
                  <li>Disable any image optimization plugins temporarily</li>
                  <li>Verify image URLs by inspecting the page source</li>
                  <li>Try different image upload settings in the plugin configuration</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-2">Formatting Issues</h3>
                <p className="text-sm mb-3">If content appears poorly formatted:</p>
                <ul className="list-disc pl-5 text-sm">
                  <li>Check for theme CSS conflicts and add specific style overrides</li>
                  <li>Verify your theme supports the required WordPress hooks</li>
                  <li>Try switching to a different content template in plugin settings</li>
                  <li>Disable other plugins that might affect content display</li>
                  <li>Consult the theme developer if custom post types aren't properly styled</li>
                </ul>
              </div>
            </div>
          </div>

          <h2>Support Resources</h2>
          <p>
            If you encounter issues with your WordPress integration, these resources can help:
          </p>
          <ul>
            <li>
              <strong>Documentation:</strong> Complete plugin documentation at <a href="#" className="text-primary hover:underline">docs.rankitpro.com/wordpress</a>
            </li>
            <li>
              <strong>Video Tutorials:</strong> Step-by-step visual guides on our <a href="#" className="text-primary hover:underline">YouTube channel</a>
            </li>
            <li>
              <strong>Support Ticket:</strong> Submit a support request directly from your Rank It Pro dashboard
            </li>
            <li>
              <strong>Developer Forum:</strong> Advanced help for custom implementations at <a href="#" className="text-primary hover:underline">community.rankitpro.com</a>
            </li>
            <li>
              <strong>WordPress.org:</strong> Plugin support forum for general questions
            </li>
          </ul>
        </div>

        <div className="bg-slate-100 rounded-xl p-8 mb-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Connect Your WordPress Site?</h2>
          <p className="mb-6">Download our integration package with plugin, documentation, and custom templates</p>
          <a
            href="#"
            className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            Download WordPress Integration Kit
          </a>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h3 className="font-bold text-lg mb-4">Related Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/resources/mobile-check-in-best-practices">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">📱</span>
                <h4 className="font-semibold mb-1">Mobile Check-In Best Practices</h4>
                <p className="text-sm text-slate-600">Optimize your check-in process</p>
              </a>
            </Link>
            <Link href="/resources/seo-impact-analysis">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">📊</span>
                <h4 className="font-semibold mb-1">SEO Impact Analysis</h4>
                <p className="text-sm text-slate-600">Understand SEO benefits of check-ins</p>
              </a>
            </Link>
            <Link href="/resources/content-creation-templates">
              <a className="block p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 inline-block">📝</span>
                <h4 className="font-semibold mb-1">Content Creation Templates</h4>
                <p className="text-sm text-slate-600">Templates for effective blog posts</p>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}
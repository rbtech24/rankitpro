=== Rank It Pro Integration ===
Contributors: rankitpro
Tags: service reports, reviews, testimonials, field service
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.2.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Display your Rank It Pro service reports, reviews, and testimonials on your WordPress site.

== Description ==

The Rank It Pro Integration plugin allows you to seamlessly display your service reports, customer reviews, and testimonials from your Rank It Pro account directly on your WordPress website.

Features:
* Display service check-ins with photos and details
* Show customer reviews and ratings  
* Display testimonials with enhanced styling
* Responsive design that works on all devices
* Easy shortcode implementation
* Enhanced debugging for troubleshooting

== Installation ==

1. Upload the plugin files to '/wp-content/plugins/rank-it-pro-plugin/' directory
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Configure your API settings in Settings > Rank It Pro
4. Use shortcodes like [rankitpro_checkins] in your posts or pages

== Configuration ==

After activation, go to Settings > Rank It Pro to configure:
* Company ID: Your Rank It Pro company identifier
* API Domain: Your Rank It Pro API endpoint
* Cache Duration: How long to cache API responses

== Shortcodes ==

* [rankitpro_checkins] - Display recent service check-ins
* [rankitpro_reviews] - Show customer reviews
* [rankitpro_testimonials] - Display testimonials

== Changelog ==

= 1.2.1 =
* Enhanced debugging capabilities
* Improved error handling
* Better container detection
* Added console logging for troubleshooting

= 1.2.0 =
* Added API Domain configuration field
* Improved shortcode rendering
* Enhanced security measures

= 1.0.0 =
* Initial release
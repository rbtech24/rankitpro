import { Router, Request, Response } from 'express';
import JSZip from 'jszip';
import { promises as fs } from 'fs';
import path from 'path';

import { logger } from '../services/logger';
const router = Router();

// Simple test route to verify routing works
router.get('/test', async (req: Request, res: Response) => {
  res.json({ message: 'WordPress routes working', timestamp: new Date().toISOString() });
});

// WordPress Plugin Download Endpoint - Simplified version
router.get('/plugin', async (req: Request, res: Response) => {
  try {
    logger.info('WordPress plugin download requested - entering try block');
    
    // Use a simple embedded plugin code that works
    logger.info('Starting plugin code generation');
    const pluginCode = `<?php
/**
 * Plugin Name: Rank It Pro
 * Description: Display customer testimonials, reviews, and check-ins from Rank It Pro
 * Version: 1.5.0
 * Author: Rank It Pro
 * Text Domain: rank-it-pro
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Basic shortcode for testimonials
add_shortcode('rankitpro_testimonials', function($atts) {
    $atts = shortcode_atts(array(
        'company_id' => '',
        'limit' => 5,
        'columns' => 1
    ), $atts);
    
    if (empty($atts['company_id'])) {
        return '<p>Error: Company ID required</p>';
    }
    
    $response = wp_remote_get('https://rankitpro.com/api/testimonials/company/' . $atts['company_id']);
    if (is_wp_error($response)) {
        return '<p>Error loading testimonials</p>';
    }
    
    $testimonials = json_decode(wp_remote_retrieve_body($response), true);
    if (empty($testimonials)) {
        return '<p>No testimonials found</p>';
    }
    
    $output = '<div class="rankitpro-testimonials" style="display: grid; grid-template-columns: repeat(' . $atts['columns'] . ', 1fr); gap: 20px; margin: 20px 0;">';
    foreach (array_slice($testimonials, 0, $atts['limit']) as $testimonial) {
        $output .= '<div class="testimonial" style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">';
        $output .= '<p style="font-style: italic; margin-bottom: 10px;">"' . esc_html($testimonial['content']) . '"</p>';
        $output .= '<cite style="font-weight: bold; color: #0088d2;">- ' . esc_html($testimonial['customerName']) . '</cite>';
        $output .= '</div>';
    }
    $output .= '</div>';
    return $output;
});

// Basic shortcode for check-ins
add_shortcode('rankitpro_checkins', function($atts) {
    $atts = shortcode_atts(array(
        'company_id' => '',
        'limit' => 5,
        'columns' => 1
    ), $atts);
    
    if (empty($atts['company_id'])) {
        return '<p>Error: Company ID required</p>';
    }
    
    $response = wp_remote_get('https://rankitpro.com/api/check-ins/company/' . $atts['company_id']);
    if (is_wp_error($response)) {
        return '<p>Error loading check-ins</p>';
    }
    
    $checkins = json_decode(wp_remote_retrieve_body($response), true);
    if (empty($checkins)) {
        return '<p>No check-ins found</p>';
    }
    
    $output = '<div class="rankitpro-checkins" style="display: grid; grid-template-columns: repeat(' . $atts['columns'] . ', 1fr); gap: 20px; margin: 20px 0;">';
    foreach (array_slice($checkins, 0, $atts['limit']) as $checkin) {
        $output .= '<div class="checkin-card" style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">';
        $output .= '<h4 style="margin: 0 0 10px 0; color: #0088d2;">' . esc_html($checkin['customerName']) . '</h4>';
        $output .= '<div style="font-size: 0.9em; color: #666; margin-bottom: 10px;">' . date('M j, Y', strtotime($checkin['createdAt'])) . '</div>';
        if (!empty($checkin['serviceType'])) {
            $output .= '<div style="background: #e8f4fd; padding: 5px 10px; border-radius: 4px; font-size: 0.9em; color: #0088d2; margin-bottom: 10px;">' . esc_html($checkin['serviceType']) . '</div>';
        }
        if (!empty($checkin['notes'])) {
            $output .= '<div style="color: #555; line-height: 1.5;">' . esc_html($checkin['notes']) . '</div>';
        }
        $output .= '</div>';
    }
    $output .= '</div>';
    return $output;
});
?>`;

    logger.info('Plugin code generated successfully', { length: pluginCode.length });
    
    // Send the plugin code directly as a PHP file
    logger.info('Setting headers and sending response');
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="rank-it-pro-plugin.php"');
    res.setHeader('Content-Length', Buffer.byteLength(pluginCode, 'utf8'));
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(pluginCode);
    
    logger.info('WordPress plugin file sent successfully');
  } catch (pluginError) {
    logger.error('Error in WordPress plugin generation', { 
      errorMessage: pluginError instanceof Error ? pluginError.message : String(pluginError),
      stack: pluginError instanceof Error ? pluginError.stack : undefined,
      errorType: typeof pluginError
    });
    res.status(500).json({ error: 'Failed to generate WordPress plugin' });
  }
});

export default router;
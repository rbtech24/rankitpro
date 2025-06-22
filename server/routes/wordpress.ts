import { Router, Request, Response } from 'express';
import JSZip from 'jszip';
import { promises as fs } from 'fs';
import path from 'path';

const router = Router();

// WordPress Plugin Download Endpoint
router.get('/plugin', async (req: Request, res: Response) => {
  try {
    const zip = new JSZip();
    
    // Read the actual enhanced plugin file
    const pluginPath = path.join(process.cwd(), 'wordpress-plugin', 'rankitpro-plugin.php');
    let pluginCode = '';
    
    try {
      pluginCode = await fs.readFile(pluginPath, 'utf8');
      // Ensure it's v1.2.1
      if (!pluginCode.includes('Version: 1.2.1')) {
        pluginCode = pluginCode.replace(/Version: \d+\.\d+\.\d+/, 'Version: 1.2.1');
      }
    } catch (error) {
      // Fallback minimal plugin
      pluginCode = `<?php
/*
Plugin Name: RankItPro Service Integration  
Plugin URI: https://rankitpro.com
Description: Display your RankItPro service reports with enhanced debugging
Version: 1.2.1
Author: RankItPro
*/

if (!defined('ABSPATH')) {
    exit;
}

function rankitpro_checkins_shortcode() {
    return '<div data-rankitpro-widget="checkins" class="rankitpro-container"><div class="rankitpro-loading">Loading service reports...</div></div>';
}
add_shortcode('rankitpro_checkins', 'rankitpro_checkins_shortcode');
`;
    }

    // Create ZIP with the plugin
    zip.file('rankitpro-plugin.php', pluginCode);

    console.log('Generating WordPress plugin ZIP v1.2.1...');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="rankitpro-plugin-v1.2.1.zip"');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    const zipBuffer = await zip.generateAsync({type: 'nodebuffer'});
    console.log('WordPress plugin generated successfully, size:', zipBuffer.length, 'bytes');
    
    res.send(zipBuffer);
  } catch (error) {
    console.error('WordPress plugin generation error:', error);
    res.status(500).json({ error: 'Failed to generate WordPress plugin' });
  }
});

export default router;
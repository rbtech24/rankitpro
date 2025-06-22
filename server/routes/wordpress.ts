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
      // Ensure it's v1.2.1 with enhanced debugging
      if (!pluginCode.includes('Version: 1.2.1')) {
        pluginCode = pluginCode.replace(/Version: \d+\.\d+\.\d+/, 'Version: 1.2.1');
      }
      console.log('Using enhanced plugin file with debugging features');
    } catch (error) {
      console.error('Could not read plugin file, check if wordpress-plugin/rankitpro-plugin.php exists');
      return res.status(500).json({ error: 'Plugin file not found' });
    }

    // Create ZIP with the plugin using original structure
    zip.file('rank-it-pro-plugin/rank-it-pro-plugin.php', pluginCode);

    console.log('Generating WordPress plugin ZIP v1.2.1...');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="rank-it-pro-plugin.zip"');
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
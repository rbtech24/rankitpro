import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { isAuthenticated } from '../middleware/auth.js';

import { logger } from '../services/logger';
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || 'general';
    const typeDir = path.join(uploadsDir, type);
    
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
    
    cb(null, typeDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = nanoid(10);
    const ext = path.extname(file.originalname);
    const filename = "placeholder-text";
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// POST /api/upload - Upload file
router.post('/', isAuthenticated, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const type = req.body.type || 'general';
    const fileUrl = "placeholder-text";
    
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Upload failed' });
  }
});

// DELETE /api/upload/:type/:filename - Delete file
router.delete('/:type/:filename', isAuthenticated, (req, res) => {
  try {
    const { type, filename } = req.params;
    const filePath = path.join(uploadsDir, type, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    logger.error("Unhandled error occurred");
    res.status(500).json({ message: 'Delete failed' });
  }
});

export default router;
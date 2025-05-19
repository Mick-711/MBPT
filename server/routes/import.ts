// server/routes/import.ts
import { Router } from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import { importFoodsFromBuffer } from '../../scripts/importFoodService';

const router = Router();

// Setup multer for file uploads (in-memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Route to import foods from a URL
router.post('/foods', async (req, res) => {
  // Validate that fileUrl is provided
  const { fileUrl } = req.body;
  
  if (!fileUrl) {
    return res.status(400).json({ success: false, error: "fileUrl is required" });
  }
  
  try {
    // Download the Excel file
    const resp = await fetch(fileUrl);
    
    if (!resp.ok) {
      throw new Error(`Failed to download file: ${resp.statusText}`);
    }
    
    // Convert to buffer
    const buffer = await resp.buffer();
    
    // Process the file using our import service
    const summary = await importFoodsFromBuffer(buffer);
    
    // Return the result
    return res.json({ success: true, summary });
    
  } catch (err) {
    console.error("Import error:", err);
    return res.status(500).json({ 
      success: false, 
      error: err instanceof Error ? err.message : "An unknown error occurred" 
    });
  }
});

// Route to import foods from a file upload
router.post('/foods/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    
    // Process the uploaded file
    const summary = await importFoodsFromBuffer(req.file.buffer);
    
    // Return the result
    return res.json({ success: true, summary });
    
  } catch (err) {
    console.error("Import error:", err);
    return res.status(500).json({ 
      success: false, 
      error: err instanceof Error ? err.message : "An unknown error occurred" 
    });
  }
});

export default router;
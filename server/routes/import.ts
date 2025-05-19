// server/routes/import.ts
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';
import { importFoodsFromBuffer, ImportFoodResult, importJobs } from '../../scripts/importFoodService';

const router = Router();

// Setup multer for file uploads (in-memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow Excel files
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream' // For some clients that don't set correct mime type
    ];
    
    // Check file extension
    const filename = file.originalname.toLowerCase();
    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      if (allowedTypes.includes(file.mimetype)) {
        return cb(null, true);
      }
    }
    
    cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
  }
});

// Middleware function to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ success: false, error: "Unauthorized" });
};

// Middleware function to check if user is a trainer
const isTrainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    
    // Get user from storage
    const user = await global.storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }
    
    if (user.role !== 'trainer') {
      return res.status(403).json({ success: false, error: "Access denied. Only trainers can import food data." });
    }
    
    return next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ success: false, error: "Server error during authentication" });
  }
};

// Route to import foods from a URL - protected for trainers only
router.post('/foods', isAuthenticated, isTrainer, async (req, res) => {
  // Validate that fileUrl is provided
  const { fileUrl, dryRun = false } = req.body;
  
  if (!fileUrl) {
    return res.status(400).json({ success: false, error: "fileUrl is required" });
  }
  
  // Create a job ID for tracking
  const jobId = randomUUID();
  
  // Initialize the job with pending status
  importJobs.set(jobId, {
    id: jobId,
    status: 'pending',
    progress: 0,
    success: true,
    validCount: 0,
    insertedCount: 0,
    skippedCount: 0,
    errorCount: 0,
    durationSeconds: 0
  });
  
  // Return the job ID immediately
  res.json({ success: true, jobId });
  
  // Process in background
  (async () => {
    try {
      // Update status to processing
      const job = importJobs.get(jobId)!;
      job.status = 'processing';
      importJobs.set(jobId, job);
      
      // Download the Excel file
      let resp;
      try {
        resp = await fetch(fileUrl);
        
        if (!resp.ok) {
          throw new Error(`Failed to download file: ${resp.statusText}`);
        }
      } catch (err) {
        // Handle network errors
        const errorJob = importJobs.get(jobId)!;
        errorJob.status = 'failed';
        errorJob.success = false;
        errorJob.errorCount = 1;
        errorJob.errorMessage = err instanceof Error 
          ? `Network error: ${err.message}` 
          : "Failed to download file";
        importJobs.set(jobId, errorJob);
        return;
      }
      
      // Convert to buffer
      const buffer = await resp.buffer();
      
      // Process the file using our import service
      const result = await importFoodsFromBuffer(buffer, {
        batchSize: 200,
        dryRun,
        jobId
      });
      
      // Update job with results
      const updatedJob = importJobs.get(jobId)!;
      updatedJob.status = 'completed';
      updatedJob.validCount = result.validCount;
      updatedJob.insertedCount = result.insertedCount;
      updatedJob.skippedCount = result.skippedCount;
      updatedJob.errorCount = result.errorCount;
      updatedJob.durationSeconds = result.durationSeconds;
      updatedJob.errorDetails = result.errorDetails;
      updatedJob.progress = 100;
      importJobs.set(jobId, updatedJob);
      
    } catch (err) {
      // Handle any unexpected errors
      console.error("Import error:", err);
      
      const failedJob = importJobs.get(jobId)!;
      failedJob.status = 'failed';
      failedJob.success = false;
      failedJob.errorCount = 1;
      failedJob.errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      importJobs.set(jobId, failedJob);
    }
  })();
});

// Route to import foods from a file upload - protected for trainers only
router.post('/foods/upload', isAuthenticated, isTrainer, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    
    // Create a job ID for tracking
    const jobId = randomUUID();
    const dryRun = req.body.dryRun === 'true';
    
    // Initialize the job with pending status
    importJobs.set(jobId, {
      id: jobId,
      status: 'pending',
      progress: 0,
      success: true,
      validCount: 0,
      insertedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      durationSeconds: 0
    });
    
    // Return the job ID immediately
    res.json({ success: true, jobId });
    
    // Process in background
    (async () => {
      try {
        // Update status to processing
        const job = importJobs.get(jobId)!;
        job.status = 'processing';
        importJobs.set(jobId, job);
        
        // Process the uploaded file
        const result = await importFoodsFromBuffer(req.file.buffer, {
          batchSize: 200,
          dryRun,
          jobId
        });
        
        // Update job with results
        const updatedJob = importJobs.get(jobId)!;
        updatedJob.status = 'completed';
        updatedJob.validCount = result.validCount;
        updatedJob.insertedCount = result.insertedCount;
        updatedJob.skippedCount = result.skippedCount;
        updatedJob.errorCount = result.errorCount;
        updatedJob.durationSeconds = result.durationSeconds;
        updatedJob.errorDetails = result.errorDetails;
        updatedJob.progress = 100;
        importJobs.set(jobId, updatedJob);
        
      } catch (err) {
        // Handle any unexpected errors
        console.error("Import error:", err);
        
        const failedJob = importJobs.get(jobId)!;
        failedJob.status = 'failed';
        failedJob.success = false;
        failedJob.errorCount = 1;
        failedJob.errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        importJobs.set(jobId, failedJob);
      }
    })();
    
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ 
      success: false, 
      error: err instanceof Error ? err.message : "An unknown error occurred" 
    });
  }
});

// Route to check job status
router.get('/foods/status/:jobId', isAuthenticated, async (req, res) => {
  const { jobId } = req.params;
  
  if (!jobId) {
    return res.status(400).json({ success: false, error: "jobId is required" });
  }
  
  const job = importJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({ success: false, error: "Job not found" });
  }
  
  return res.json({
    success: true,
    jobId,
    status: job.status,
    progress: job.progress,
    summary: {
      valid: job.validCount,
      inserted: job.insertedCount,
      skipped: job.skippedCount,
      errors: job.errorCount,
      duration: job.durationSeconds
    },
    errorMessage: job.errorMessage
  });
});

// Route to validate foods without inserting (dry run)
router.post('/foods/validate', isAuthenticated, isTrainer, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    
    // Create a job ID for tracking
    const jobId = randomUUID();
    
    // Initialize the job with pending status
    importJobs.set(jobId, {
      id: jobId,
      status: 'pending',
      progress: 0,
      success: true,
      validCount: 0,
      insertedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      durationSeconds: 0
    });
    
    // Return the job ID immediately
    res.json({ success: true, jobId });
    
    // Process in background with dryRun=true
    (async () => {
      try {
        // Update status to processing
        const job = importJobs.get(jobId)!;
        job.status = 'processing';
        importJobs.set(jobId, job);
        
        // Process the uploaded file
        const result = await importFoodsFromBuffer(req.file.buffer, {
          dryRun: true,
          jobId
        });
        
        // Update job with results
        const updatedJob = importJobs.get(jobId)!;
        updatedJob.status = 'completed';
        updatedJob.validCount = result.validCount;
        updatedJob.skippedCount = result.skippedCount;
        updatedJob.errorCount = result.errorCount;
        updatedJob.durationSeconds = result.durationSeconds;
        updatedJob.errorDetails = result.errorDetails;
        updatedJob.progress = 100;
        importJobs.set(jobId, updatedJob);
        
      } catch (err) {
        // Handle any unexpected errors
        console.error("Validation error:", err);
        
        const failedJob = importJobs.get(jobId)!;
        failedJob.status = 'failed';
        failedJob.success = false;
        failedJob.errorCount = 1;
        failedJob.errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        importJobs.set(jobId, failedJob);
      }
    })();
    
  } catch (err) {
    console.error("Validation error:", err);
    return res.status(500).json({ 
      success: false, 
      error: err instanceof Error ? err.message : "An unknown error occurred" 
    });
  }
});

export default router;
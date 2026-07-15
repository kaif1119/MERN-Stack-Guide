# 📘 Chapters 08–12: Advanced Multer Topics

> **Level:** 🔴 Advanced | **Language:** Hindi + English

---

# Chapter 08: Custom File Naming & Destination

---

## Custom Naming Strategies

### Strategy 1: UUID-based (Most Unique)

```javascript
const { v4: uuidv4 } = require('uuid'); // npm install uuid

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    // UUID: universally unique identifier
    // Example: '550e8400-e29b-41d4-a716-446655440000.jpg'
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uuidv4() + ext);
  }
});
```

### Strategy 2: User ID + Timestamp (Organized)

```javascript
filename: (req, file, cb) => {
  // req.user se user ID lo (auth middleware se milta hai)
  const userId = req.user?.id || 'anonymous';
  const timestamp = Date.now();
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Example: 'user_123_1720000000000.jpg'
  cb(null, `user_${userId}_${timestamp}${ext}`);
}
```

### Strategy 3: Slugified Original Name

```javascript
filename: (req, file, cb) => {
  // Original naam ko safe banao
  // "My Photo 2024.jpg" → "my-photo-2024-1720000000000.jpg"
  
  const originalName = path.basename(
    file.originalname,
    path.extname(file.originalname)
  );
  
  const slug = originalName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')  // Special chars ko - se replace karo
    .replace(/-+/g, '-')           // Multiple - ko single - banao
    .replace(/^-|-$/g, '');        // Start/end ke - hatao
  
  const ext = path.extname(file.originalname).toLowerCase();
  const timestamp = Date.now();
  
  cb(null, `${slug}-${timestamp}${ext}`);
}
```

### Strategy 4: Date-based Folder Structure

```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // "07"
    const day = String(now.getDate()).padStart(2, '0');          // "15"
    
    // Folder: 'uploads/2024/07/15/'
    const dir = `uploads/${year}/${month}/${day}`;
    
    // Folder create karo agar exist nahi karta
    fs.mkdirSync(dir, { recursive: true });
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uuidv4() + ext);
  }
});
```

---

# Chapter 09: Cloud Storage Integration

---

## Cloudinary Integration

### Setup

```bash
npm install cloudinary multer-storage-cloudinary
```

### Complete Cloudinary Upload

```javascript
const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const app = express();

// Cloudinary configure karo
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,    // Dashboard se
  api_key: process.env.CLOUDINARY_API_KEY,           // Dashboard se
  api_secret: process.env.CLOUDINARY_API_SECRET      // Dashboard se (secret raho!)
});

// Cloudinary Storage Engine
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'my-app/uploads',         // Cloudinary folder
    allowed_formats: ['jpg', 'png', 'gif', 'webp'],  // Allowed formats
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },  // Max size
      { quality: 'auto:good' }                        // Auto compress
    ],
    public_id: (req, file) => {
      // Custom public ID (Cloudinary mein naam)
      return `user-${req.user?.id || 'anon'}-${Date.now()}`;
    }
  }
});

const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Sirf images!'), false);
  }
});

// Upload route
app.post('/upload/cloudinary', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file!' });
  }
  
  // req.file mein Cloudinary-specific properties hain!
  res.json({
    success: true,
    image: {
      url: req.file.path,        // ← Cloudinary URL (secure_url)
      publicId: req.file.filename, // ← Cloudinary public ID
      format: req.file.format,
      size: req.file.size
    }
  });
});
```

## AWS S3 Integration

```bash
npm install @aws-sdk/client-s3 multer-s3
```

```javascript
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

// S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// S3 Storage
const s3Storage = multerS3({
  s3: s3Client,
  bucket: process.env.S3_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,  // Auto set Content-Type
  key: (req, file, cb) => {
    // S3 mein file path/key
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `uploads/${Date.now()}${ext}`);
  },
  metadata: (req, file, cb) => {
    // S3 object metadata
    cb(null, {
      fieldName: file.fieldname,
      uploadedBy: req.user?.id || 'anonymous'
    });
  }
});

const s3Upload = multer({
  storage: s3Storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

app.post('/upload/s3', s3Upload.single('file'), (req, res) => {
  res.json({
    success: true,
    file: {
      url: req.file.location,     // ← S3 URL
      bucket: req.file.bucket,
      key: req.file.key,          // ← S3 object key
      size: req.file.size
    }
  });
});
```

---

# Chapter 10: Image Processing with Sharp

---

## Sharp Integration

```bash
npm install sharp
```

### Resize + Compress After Upload

```javascript
const sharp = require('sharp');
const multer = require('multer');

// memoryStorage use karo — disk pe save nahi karna pehle
const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload/optimized', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file!' });
  
  const outputPath = `uploads/optimized-${Date.now()}.webp`;
  
  // Sharp se process karo
  await sharp(req.file.buffer)         // Buffer se input lo (memoryStorage!)
    .resize({
      width: 800,                       // Max width
      height: 800,                      // Max height
      fit: 'inside',                    // Aspect ratio maintain karo
      withoutEnlargement: true          // Chhoti images enlarge mat karo
    })
    .webp({ quality: 80 })             // WebP format mein convert karo
    .toFile(outputPath);               // Disk pe save karo
  
  res.json({
    success: true,
    originalSize: `${(req.file.size / 1024).toFixed(2)} KB`,
    savedTo: outputPath
  });
});

// Multiple sizes generate karo (thumbnails!)
app.post('/upload/thumbnails', upload.single('image'), async (req, res) => {
  const timestamp = Date.now();
  const sizes = [
    { name: 'small', width: 150, height: 150 },
    { name: 'medium', width: 400, height: 400 },
    { name: 'large', width: 800, height: 800 }
  ];
  
  const results = {};
  
  for (const size of sizes) {
    const filename = `${timestamp}-${size.name}.webp`;
    const outputPath = `uploads/thumbnails/${filename}`;
    
    await sharp(req.file.buffer)
      .resize(size.width, size.height, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    results[size.name] = {
      width: size.width,
      height: size.height,
      path: outputPath,
      url: `http://localhost:3000/uploads/thumbnails/${filename}`
    };
  }
  
  res.json({ success: true, thumbnails: results });
});
```

---

# Chapter 11: Security Best Practices

---

## Security Checklist

```javascript
// ✅ 1. File Size Limit — HAMESHA SET KARO
limits: { fileSize: 5 * 1024 * 1024 }

// ✅ 2. File Count Limit
limits: { files: 10 }

// ✅ 3. MIME Type + Extension Dual Validation
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png'];
  const allowedExts = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type!'), false);
  }
};

// ✅ 4. Path Traversal Prevention — CRITICAL!
// Kabhi bhi original filename ko directly path mein use mat karo!
// WRONG:
const filepath = `uploads/${req.file.originalname}`;  // ← DANGEROUS!
// Attacker: filename = '../etc/passwd' → path traversal attack!

// CORRECT:
const filename = path.basename(req.file.originalname);  // path.basename removes ../ 
const safeFilename = Date.now() + path.extname(filename);  // Timestamp use karo
const filepath = path.join('uploads', safeFilename);

// ✅ 5. Don't Execute Uploaded Files
// Uploads folder ko executable directory mat banao!
// Nginx/Apache mein X-Content-Type-Options header add karo

// ✅ 6. Rate Limiting Upload Routes
// npm install express-rate-limit
const rateLimit = require('express-rate-limit');
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                     // Max 10 uploads per IP per 15 mins
  message: 'Too many uploads from this IP, please try again later'
});
app.post('/upload', uploadLimiter, upload.single('file'), handler);

// ✅ 7. Virus Scanning (Production)
// Use ClamAV or similar for virus scanning
// npm install clamscan
const NodeClam = require('clamscan');

// ✅ 8. Generate Random Filenames (koi naam se path predict na kar sake)
const crypto = require('crypto');
const randomName = crypto.randomBytes(16).toString('hex') + '.jpg';

// ✅ 9. Serve Files With Proper Headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', 'attachment');  // Download force karo, execute mat karo
  next();
}, express.static('uploads'));

// ✅ 10. Magic Number Validation (Deep File Validation)
// MIME type spoof detection — actual file content check karo
// npm install file-type
const { fileTypeFromBuffer } = require('file-type');

app.post('/upload/secure', upload.single('file'), async (req, res) => {
  // memoryStorage mein actual bytes hain
  const fileType = await fileTypeFromBuffer(req.file.buffer);
  
  if (!fileType || !['jpg', 'png', 'gif'].includes(fileType.ext)) {
    return res.status(400).json({ error: 'Invalid file content!' });
  }
  
  // Safe to process
  res.json({ success: true });
});
```

---

# Chapter 12: Performance Optimization

---

## Performance Best Practices

```javascript
// ✅ 1. Streaming — Large Files Ko Stream Karo
// Disk pe file directly stream karo, memory mein poora load mat karo
// diskStorage automatically streaming karta hai

// ✅ 2. Compression Before Storage
// Sharp se compress karo:
await sharp(buffer).jpeg({ quality: 75 }).toFile(path);

// ✅ 3. Parallel Processing
// Multiple files ko parallel process karo
const processFiles = async (files) => {
  const promises = files.map(file =>
    sharp(fs.readFileSync(file.path))
      .resize(800, 800)
      .webp({ quality: 80 })
      .toFile(`uploads/processed/${file.filename}`)
  );
  await Promise.all(promises);  // Parallel!
};

// ✅ 4. CDN Integration
// Production mein files CDN pe serve karo
// CloudFront (AWS), Cloudflare, etc.
// Multer → S3 → CloudFront URL serve karo

// ✅ 5. Lazy Processing with Queue
// npm install bull (Redis-based queue)
const Queue = require('bull');
const imageQueue = new Queue('image processing');

app.post('/upload', upload.single('image'), async (req, res) => {
  // File save karo, processing queue mein daalo
  await imageQueue.add({ filePath: req.file.path });
  
  // Immediately respond (user ko wait mat karao)
  res.json({ success: true, message: 'File received, processing in background...' });
});

// Worker (alag process mein)
imageQueue.process(async (job) => {
  const { filePath } = job.data;
  // Heavy processing yahan karo
  await sharp(filePath).resize(800).toFile(filePath + '.processed.webp');
});

// ✅ 6. Cleanup Temp Files
// diskStorage se processed files delete karo
const fs = require('fs').promises;

const processAndClean = async (req, res) => {
  const tempPath = req.file.path;
  
  try {
    // Process karo
    await sharp(tempPath).resize(800).webp().toFile('uploads/final.webp');
    
    // Temp file delete karo
    await fs.unlink(tempPath);
    
    res.json({ success: true });
  } catch (err) {
    // Error pe bhi cleanup karo
    await fs.unlink(tempPath).catch(() => {}); // Silent fail ok
    throw err;
  }
};

// ✅ 7. Memory Monitoring
process.on('warning', (warning) => {
  if (warning.name === 'MemoryUsage') {
    console.warn('High memory usage!', process.memoryUsage());
  }
});

// ✅ 8. Multer Instance Reuse
// ❌ Wrong: Har request pe naya instance
app.post('/upload', (req, res) => {
  const upload = multer({ dest: 'uploads/' }); // Don't do this!
  upload.single('file')(req, res, () => {});
});

// ✅ Correct: Module level pe banao
const upload = multer({ dest: 'uploads/' }); // Once!
app.post('/upload', upload.single('file'), handler);
```

---

<div align="center">

**[⬅️ Chapter 07: Error Handling](chapter-07-error-handling.md)** | **[Interview Questions ➡️](../interview/beginner-questions.md)**

</div>

# 🏗️ Project 04: Production-Ready File Server

> **Level:** 🔴 Production | **Time:** 8–12 hours | **Stack:** Node.js + Express + Multer + MongoDB + Cloudinary + Redis

---

## 📋 Project Overview

Ek **Enterprise-Grade File Management System** banao jisme:
- JWT Authentication
- Rate Limiting
- Virus Scanning (mock)
- Cloud Storage (Cloudinary)
- File metadata MongoDB mein
- Redis caching
- Swagger API docs
- Comprehensive error handling
- Docker support

---

## 📁 Project Architecture

```
production-file-server/
├── src/
│   ├── config/
│   │   ├── multer.config.js     ← Multer configuration
│   │   ├── cloudinary.config.js ← Cloudinary setup
│   │   ├── database.config.js   ← MongoDB connection
│   │   └── redis.config.js      ← Redis connection
│   ├── models/
│   │   └── File.model.js        ← File schema (MongoDB)
│   ├── middleware/
│   │   ├── auth.middleware.js   ← JWT verification
│   │   ├── rateLimit.middleware.js ← Rate limiting
│   │   ├── validate.middleware.js ← Request validation
│   │   └── error.middleware.js  ← Error handling
│   ├── controllers/
│   │   └── file.controller.js   ← Business logic
│   ├── routes/
│   │   └── file.routes.js       ← API routes
│   ├── services/
│   │   ├── upload.service.js    ← Upload logic
│   │   ├── cloud.service.js     ← Cloudinary operations
│   │   └── cache.service.js     ← Redis caching
│   └── utils/
│       ├── logger.js            ← Winston logger
│       └── validators.js        ← Input validators
├── tests/
│   └── file.test.js             ← Jest tests
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── app.js
└── package.json
```

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "multer-storage-cloudinary": "^4.0.0",
    "cloudinary": "^1.41.3",
    "mongoose": "^7.6.3",
    "redis": "^4.6.10",
    "jsonwebtoken": "^9.0.2",
    "express-rate-limit": "^7.1.4",
    "file-type": "^18.7.0",
    "sharp": "^0.32.6",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-validator": "^7.0.1",
    "streamifier": "^0.1.1",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "nodemon": "^3.0.1"
  }
}
```

---

## 🔧 Core Production Files

### app.js

```javascript
// app.js — Main application
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');

const fileRoutes = require('./src/routes/file.routes');
const { errorHandler, notFound } = require('./src/middleware/error.middleware');
const logger = require('./src/utils/logger');

const app = express();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECURITY MIDDLEWARE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(helmet());   // Security headers automatically set karo
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BODY PARSING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REQUEST LOGGING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use('/api/v1/files', fileRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR HANDLING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(notFound);
app.use(errorHandler);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATABASE + SERVER START
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('✅ MongoDB connected');
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection failed:', err);
    process.exit(1);
  });

module.exports = app;
```

### src/models/File.model.js

```javascript
// File model — MongoDB schema
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USER ASSOCIATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FILE METADATA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  originalName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  
  filename: {
    type: String,
    required: true,
    unique: true
  },
  
  mimeType: {
    type: String,
    required: true
  },
  
  size: {
    type: Number,
    required: true,
    min: 0
  },
  
  category: {
    type: String,
    enum: ['image', 'document', 'video', 'audio', 'other'],
    default: 'other'
  },
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STORAGE INFO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  storage: {
    type: {
      type: String,
      enum: ['local', 'cloudinary', 's3'],
      default: 'cloudinary'
    },
    url: String,         // Public URL
    secureUrl: String,   // HTTPS URL
    publicId: String,    // Cloud storage ID
    path: String         // Local path (agar local)
  },
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IMAGE SPECIFIC
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  imageInfo: {
    width: Number,
    height: Number,
    format: String
  },
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SECURITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  hash: {
    type: String,
    index: true  // Deduplication ke liye
  },
  
  isPublic: {
    type: Boolean,
    default: false
  },
  
  tags: [String],
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SOFT DELETE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  
  deletedAt: Date
  
}, {
  timestamps: true,   // createdAt, updatedAt automatic
  
  // Virtual fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VIRTUAL FIELDS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
fileSchema.virtual('sizeKB').get(function() {
  return (this.size / 1024).toFixed(2);
});

fileSchema.virtual('sizeMB').get(function() {
  return (this.size / (1024 * 1024)).toFixed(2);
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INDEXES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ hash: 1, userId: 1 });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATIC METHODS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
fileSchema.statics.findByUser = function(userId, options = {}) {
  return this.find({ userId, isDeleted: false, ...options })
             .sort({ createdAt: -1 });
};

fileSchema.statics.findDuplicate = function(userId, hash) {
  return this.findOne({ userId, hash, isDeleted: false });
};

module.exports = mongoose.model('File', fileSchema);
```

### src/services/upload.service.js

```javascript
// upload.service.js — Core upload business logic
const crypto = require('crypto');
const { fileTypeFromBuffer } = require('file-type');
const File = require('../models/File.model');
const cloudService = require('./cloud.service');
const logger = require('../utils/logger');

class UploadService {
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MAIN UPLOAD METHOD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async processUpload(file, userId, options = {}) {
    const startTime = Date.now();
    
    try {
      // STEP 1: Deep validation (magic number check)
      await this.validateFileContent(file);
      
      // STEP 2: Compute hash (deduplication)
      const hash = this.computeHash(file.buffer);
      
      // STEP 3: Check for duplicate
      const duplicate = await File.findDuplicate(userId, hash);
      if (duplicate && !options.allowDuplicates) {
        logger.info(`Duplicate file detected for user ${userId}`);
        return {
          success: true,
          isDuplicate: true,
          file: duplicate,
          message: 'Yeh file pehle se upload hai!'
        };
      }
      
      // STEP 4: Determine category
      const category = this.getCategory(file.mimetype);
      
      // STEP 5: Upload to cloud
      const cloudResult = await cloudService.upload(file.buffer, {
        folder: `users/${userId}/${category}s`,
        filename: `${hash.substring(0, 8)}-${Date.now()}`,
        resourceType: category === 'video' ? 'video' : 'auto'
      });
      
      // STEP 6: Save to database
      const savedFile = await File.create({
        userId,
        originalName: file.originalname,
        filename: cloudResult.public_id,
        mimeType: file.mimetype,
        size: file.size,
        category,
        hash,
        storage: {
          type: 'cloudinary',
          url: cloudResult.url,
          secureUrl: cloudResult.secure_url,
          publicId: cloudResult.public_id
        },
        ...(cloudResult.width && {
          imageInfo: {
            width: cloudResult.width,
            height: cloudResult.height,
            format: cloudResult.format
          }
        })
      });
      
      const duration = Date.now() - startTime;
      logger.info(`File uploaded in ${duration}ms: ${savedFile._id}`);
      
      return {
        success: true,
        isDuplicate: false,
        file: savedFile,
        message: 'File successfully upload ho gayi!'
      };
      
    } catch (error) {
      logger.error('Upload failed:', error);
      throw error;
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONTENT VALIDATION (MAGIC NUMBERS)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async validateFileContent(file) {
    const type = await fileTypeFromBuffer(file.buffer);
    
    if (!type) {
      throw new Error('File content validate nahi ho saka — unknown format');
    }
    
    // MIME type consistency check
    if (!file.mimetype.includes(type.mime) && !type.mime.includes(file.mimetype.split('/')[0])) {
      throw new Error(
        `File content mismatch! Claimed: ${file.mimetype}, Actual: ${type.mime}`
      );
    }
    
    return type;
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // HASH COMPUTATION (SHA-256)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  computeHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CATEGORY DETERMINATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  getCategory(mimetype) {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.includes('pdf') || mimetype.includes('document') || 
        mimetype.includes('word')) return 'document';
    return 'other';
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DELETE FILE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async deleteFile(fileId, userId) {
    const file = await File.findOne({ _id: fileId, userId, isDeleted: false });
    
    if (!file) throw new Error('File nahi mili ya access nahi hai!');
    
    // Cloud se delete karo
    await cloudService.delete(file.storage.publicId);
    
    // Soft delete (actually delete nahi karte, mark karte hain)
    file.isDeleted = true;
    file.deletedAt = new Date();
    await file.save();
    
    return { success: true, message: 'File delete ho gayi!' };
  }
}

module.exports = new UploadService();
```

### src/middleware/error.middleware.js

```javascript
// error.middleware.js — Centralized error handling
const logger = require('../utils/logger');

// 404 Not Found handler
exports.notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.url}`);
  error.statusCode = 404;
  next(error);
};

// Global error handler
exports.errorHandler = (err, req, res, next) => {
  
  // Log the error
  logger.error('Error:', {
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    userId: req.user?.id
  });
  
  // Determine status code
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Server mein kuch gadbad ho gayi!';
  let code = err.code || 'INTERNAL_ERROR';
  
  // Multer specific errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    const multerMessages = {
      LIMIT_FILE_SIZE:      [413, 'FILE_TOO_LARGE',     'File bahut badi hai!'],
      LIMIT_FILE_COUNT:     [400, 'TOO_MANY_FILES',     'Bahut zyada files!'],
      LIMIT_UNEXPECTED_FILE:[400, 'UNEXPECTED_FIELD',   `Unexpected file field: ${err.field}`],
      LIMIT_FIELD_COUNT:    [400, 'TOO_MANY_FIELDS',    'Bahut zyada form fields!'],
    };
    const [s, c, m] = multerMessages[err.code] || [400, err.code, err.message];
    statusCode = s; code = c; message = m;
  }
  
  // MongoDB errors
  if (err.name === 'ValidationError') {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }
  
  if (err.code === 11000) { // Duplicate key
    statusCode = 409;
    code = 'DUPLICATE_ERROR';
    message = 'Yeh file pehle se exist karti hai!';
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token!';
  }
  
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id']
  });
};
```

### src/routes/file.routes.js

```javascript
// file.routes.js — Production API routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { verifyToken } = require('../middleware/auth.middleware');
const fileController = require('../controllers/file.controller');
const logger = require('../utils/logger');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RATE LIMITING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 20,                    // Max 20 uploads per 15 min
  message: { success: false, error: 'Too many uploads! 15 min baad try karo.' },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,             // 100 API calls per minute
  message: { success: false, error: 'Too many requests!' }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MULTER CONFIGURATION (memoryStorage → Cloudinary)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ALLOWED_MIMES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'video/mp4', 'video/quicktime'
];

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type "${file.mimetype}" allowed nahi hai!`), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024,  // 50MB max
    files: 5
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// POST /api/v1/files/upload — Upload a file
router.post('/upload',
  apiLimiter,
  uploadLimiter,
  verifyToken,
  upload.single('file'),
  fileController.uploadFile
);

// POST /api/v1/files/upload/multiple — Upload multiple files
router.post('/upload/multiple',
  apiLimiter,
  uploadLimiter,
  verifyToken,
  upload.array('files', 5),
  fileController.uploadMultiple
);

// GET /api/v1/files — Get user's files (paginated)
router.get('/',
  apiLimiter,
  verifyToken,
  fileController.getUserFiles
);

// GET /api/v1/files/:id — Get specific file
router.get('/:id',
  apiLimiter,
  verifyToken,
  fileController.getFile
);

// DELETE /api/v1/files/:id — Delete a file
router.delete('/:id',
  apiLimiter,
  verifyToken,
  fileController.deleteFile
);

module.exports = router;
```

---

## 🐳 Docker Setup

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "app.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/fileserver
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    volumes:
      - ./uploads:/app/uploads
  
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:
```

---

## 🧪 Testing

```javascript
// tests/file.test.js
const request = require('supertest');
const app = require('../app');
const path = require('path');

describe('File Upload API', () => {
  let authToken;
  
  beforeAll(async () => {
    // Get auth token (setup mein)
    authToken = 'Bearer test-jwt-token';
  });
  
  test('✅ Upload valid image file', async () => {
    const res = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', authToken)
      .attach('file', path.join(__dirname, 'fixtures/test-image.jpg'));
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.file).toHaveProperty('storage.secureUrl');
  });
  
  test('❌ Reject executable file', async () => {
    const buffer = Buffer.from('MZ....'); // Fake EXE header
    const res = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', authToken)
      .attach('file', buffer, { filename: 'virus.exe', contentType: 'application/x-executable' });
    
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  
  test('❌ Reject oversized file', async () => {
    const largeBuffer = Buffer.alloc(60 * 1024 * 1024); // 60MB
    const res = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', authToken)
      .attach('file', largeBuffer, { filename: 'large.jpg', contentType: 'image/jpeg' });
    
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('FILE_TOO_LARGE');
  });
  
  test('❌ Unauthorized upload', async () => {
    const res = await request(app)
      .post('/api/v1/files/upload')
      .attach('file', Buffer.from('test'), { filename: 'test.jpg', contentType: 'image/jpeg' });
    
    expect(res.status).toBe(401);
  });
});
```

---

## ✅ Production Features

- [x] JWT Authentication on all routes
- [x] Rate limiting (upload: 20/15min, API: 100/min)
- [x] File content validation (magic numbers)
- [x] SHA-256 file deduplication
- [x] Cloud storage (Cloudinary)
- [x] MongoDB metadata storage
- [x] Soft delete with audit trail
- [x] Comprehensive error handling + codes
- [x] Winston logging
- [x] Docker + Docker Compose
- [x] Jest integration tests
- [x] Helmet security headers
- [x] CORS configuration
- [x] Pagination support

---

<div align="center">

**[⬅️ Project 03](../03-media-gallery/README.md)** | **[⬅️ Back to README](../../README.md)**

*"Production mein kuch bhi assume mat karo — hamesha validate, always log, never trust."* 🛡️

</div>

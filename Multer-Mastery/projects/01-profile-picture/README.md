# 🎯 Project 01: Profile Picture Upload System

> **Level:** 🟢 Beginner | **Time:** 2–3 hours | **Stack:** Node.js + Express + Multer

---

## 📋 Project Overview

Ek complete **Profile Picture Upload System** banao jisme:
- User apni profile picture upload kar sake
- Image resize aur compress ho automatically
- Preview dikh sake before upload
- Success/Error feedback ho

---

## 📁 Project Structure

```
profile-upload/
├── server.js              ← Main server
├── config/
│   └── multer.js          ← Multer configuration
├── routes/
│   └── upload.routes.js   ← Upload routes
├── controllers/
│   └── upload.controller.js ← Business logic
├── uploads/
│   └── avatars/           ← Profile pictures yahan
├── public/
│   └── index.html         ← Frontend
├── package.json
└── .env
```

---

## 📦 Installation

```bash
mkdir profile-upload && cd profile-upload
npm init -y
npm install express multer sharp dotenv
mkdir -p uploads/avatars public config routes controllers
```

---

## 🔧 Server Files

### .env

```env
PORT=3000
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads/avatars
```

### config/multer.js

```javascript
// config/multer.js — Multer configuration
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads/avatars';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.memoryStorage(); // Memory for Sharp processing

// File filter — only images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedExts.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    files: 1
  }
});

module.exports = upload;
```

### controllers/upload.controller.js

```javascript
// controllers/upload.controller.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads/avatars';

// Upload avatar controller
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Koi file select nahi ki!'
      });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `avatar-${timestamp}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);
    
    // Process image with Sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(300, 300, {          // 300x300 thumbnail
        fit: 'cover',              // Crop to fill
        position: 'centre'         // Center crop
      })
      .webp({ quality: 85 })       // WebP format, 85% quality
      .withMetadata(false)         // Strip EXIF data (privacy!)
      .toBuffer();
    
    // Save processed image
    await fs.writeFile(outputPath, processedImage);
    
    // Get processed image info
    const imageInfo = await sharp(processedImage).metadata();
    
    // Generate URL
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${filename}`;
    
    res.status(200).json({
      success: true,
      message: 'Profile picture successfully upload ho gayi! 🎉',
      avatar: {
        url: imageUrl,
        filename,
        format: imageInfo.format,
        width: imageInfo.width,
        height: imageInfo.height,
        originalSize: `${(req.file.size / 1024).toFixed(2)} KB`,
        processedSize: `${(processedImage.length / 1024).toFixed(2)} KB`
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload process mein kuch gadbad ho gayi!'
    });
  }
};

// Delete avatar controller
exports.deleteAvatar = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security: path traversal prevent karo
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, safeName);
    
    // Check file exists
    await fs.access(filePath);
    
    // Delete
    await fs.unlink(filePath);
    
    res.json({ success: true, message: 'Avatar delete ho gaya!' });
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ success: false, error: 'File nahi mili!' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### routes/upload.routes.js

```javascript
// routes/upload.routes.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { uploadAvatar, deleteAvatar } = require('../controllers/upload.controller');

// POST /api/upload/avatar — Upload new avatar
router.post('/avatar', upload.single('avatar'), uploadAvatar);

// DELETE /api/upload/avatar/:filename — Delete avatar
router.delete('/avatar/:filename', deleteAvatar);

module.exports = router;
```

### server.js

```javascript
// server.js — Main Express server
require('dotenv').config();

const express = require('express');
const path = require('path');
const uploadRoutes = require('./routes/upload.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Routes
app.use('/api/upload', uploadRoutes);

// Error handling middleware (4 params!)
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File bahut badi hai! Maximum 5MB allowed hai.'
    });
  }
  
  res.status(400).json({
    success: false,
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} pe chal raha hai`);
  console.log(`📁 Avatars 'uploads/avatars/' mein save honge`);
});
```

### public/index.html — Beautiful Frontend

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Profile Picture Upload</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      padding: 48px;
      width: 420px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
    
    h1 {
      color: #fff;
      font-size: 24px;
      margin-bottom: 8px;
      text-align: center;
    }
    
    .subtitle {
      color: rgba(255,255,255,0.5);
      font-size: 14px;
      text-align: center;
      margin-bottom: 32px;
    }
    
    /* Avatar Preview Circle */
    .avatar-container {
      position: relative;
      width: 140px;
      height: 140px;
      margin: 0 auto 32px;
    }
    
    .avatar-preview {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.05);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .avatar-placeholder {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      border: 2px dashed rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .avatar-placeholder:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.5);
    }
    
    #previewImg {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      object-fit: cover;
      display: none;
      border: 3px solid #4CAF50;
    }
    
    /* File Input Hidden */
    #fileInput { display: none; }
    
    .upload-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 16px;
    }
    
    .upload-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102,126,234,0.4);
    }
    
    .upload-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .info {
      color: rgba(255,255,255,0.4);
      font-size: 12px;
      text-align: center;
      margin-top: 12px;
    }
    
    .result {
      margin-top: 20px;
      padding: 16px;
      border-radius: 12px;
      display: none;
      font-size: 14px;
    }
    
    .success {
      background: rgba(76,175,80,0.15);
      border: 1px solid rgba(76,175,80,0.4);
      color: #81C784;
    }
    
    .error {
      background: rgba(244,67,54,0.15);
      border: 1px solid rgba(244,67,54,0.4);
      color: #EF9A9A;
    }
    
    .progress-bar {
      width: 100%;
      height: 4px;
      background: rgba(255,255,255,0.1);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 12px;
      display: none;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      width: 0%;
      transition: width 0.3s;
      border-radius: 2px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>📸 Profile Picture</h1>
    <p class="subtitle">Click avatar to select image (Max 5MB)</p>
    
    <div class="avatar-container">
      <div class="avatar-placeholder" id="placeholder" onclick="document.getElementById('fileInput').click()">
        👤
      </div>
      <img id="previewImg" src="" alt="Preview">
    </div>
    
    <input type="file" id="fileInput" accept="image/*">
    
    <button class="upload-btn" id="uploadBtn" disabled onclick="uploadFile()">
      🚀 Upload Profile Picture
    </button>
    
    <div class="progress-bar" id="progressBar">
      <div class="progress-fill" id="progressFill"></div>
    </div>
    
    <p class="info">Supported: JPG, PNG, GIF, WebP • Auto-resized to 300×300</p>
    
    <div class="result" id="result"></div>
  </div>
  
  <script>
    const fileInput  = document.getElementById('fileInput');
    const preview    = document.getElementById('previewImg');
    const placeholder = document.getElementById('placeholder');
    const uploadBtn  = document.getElementById('uploadBtn');
    const resultDiv  = document.getElementById('result');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    
    let selectedFile = null;
    
    // File select hone pe preview dikhao
    fileInput.addEventListener('change', (e) => {
      selectedFile = e.target.files[0];
      if (!selectedFile) return;
      
      // Client-side validation
      if (selectedFile.size > 5 * 1024 * 1024) {
        showResult('error', '❌ File 5MB se badi hai!');
        return;
      }
      
      // Preview dikhao
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
        uploadBtn.disabled = false;
        resultDiv.style.display = 'none';
      };
      reader.readAsDataURL(selectedFile);
    });
    
    // Drag & Drop support
    const avatarContainer = document.querySelector('.avatar-container');
    
    avatarContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      placeholder.style.background = 'rgba(255,255,255,0.15)';
    });
    
    avatarContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change'));
      }
    });
    
    // Upload function
    async function uploadFile() {
      if (!selectedFile) return;
      
      uploadBtn.disabled = true;
      uploadBtn.textContent = '⏳ Uploading...';
      progressBar.style.display = 'block';
      
      const formData = new FormData();
      formData.append('avatar', selectedFile);
      
      try {
        // XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const pct = (e.loaded / e.total * 100).toFixed(0);
            progressFill.style.width = pct + '%';
          }
        });
        
        xhr.onload = () => {
          progressFill.style.width = '100%';
          const data = JSON.parse(xhr.responseText);
          
          if (data.success) {
            showResult('success', `
              ✅ <strong>Upload successful!</strong><br>
              📐 Size: ${data.avatar.width}×${data.avatar.height}px<br>
              📦 Original: ${data.avatar.originalSize} → Processed: ${data.avatar.processedSize}<br>
              🔗 <a href="${data.avatar.url}" target="_blank" style="color:#81C784">View Image</a>
            `);
          } else {
            showResult('error', `❌ ${data.error}`);
          }
          
          uploadBtn.textContent = '🚀 Upload Profile Picture';
          uploadBtn.disabled = false;
          setTimeout(() => progressBar.style.display = 'none', 2000);
        };
        
        xhr.onerror = () => {
          showResult('error', '❌ Network error!');
          uploadBtn.textContent = '🚀 Upload Profile Picture';
          uploadBtn.disabled = false;
        };
        
        xhr.open('POST', '/api/upload/avatar');
        xhr.send(formData);
        
      } catch (err) {
        showResult('error', `❌ Error: ${err.message}`);
        uploadBtn.textContent = '🚀 Upload Profile Picture';
        uploadBtn.disabled = false;
      }
    }
    
    function showResult(type, html) {
      resultDiv.className = `result ${type}`;
      resultDiv.innerHTML = html;
      resultDiv.style.display = 'block';
    }
  </script>
</body>
</html>
```

---

## 🚀 Run Karo

```bash
# Server start karo
node server.js

# Browser mein dekho
# http://localhost:3000

# Test karo curl se
curl -X POST http://localhost:3000/api/upload/avatar \
  -F "avatar=@/path/to/your/photo.jpg"
```

---

## ✅ Features Implemented

- [x] Single file upload
- [x] Image type validation (MIME + Extension)
- [x] File size limit (5MB)
- [x] Image resize (300×300, cover crop)
- [x] WebP conversion (smaller size!)
- [x] EXIF strip (privacy!)
- [x] Upload progress bar
- [x] Drag & Drop support
- [x] Preview before upload
- [x] Error handling
- [x] Beautiful glassmorphism UI

---

## 🎓 What You Learned

```
✅ multer.memoryStorage() + Sharp combination
✅ fileFilter implementation
✅ Controller/Route separation (MVC pattern)
✅ Sharp: resize, format convert, EXIF strip
✅ Frontend: FormData, XHR progress, drag/drop
✅ Error handling patterns
✅ Security: path traversal, MIME validation
```

---

<div align="center">

**[⬅️ README](../README.md)** | **[Project 02: Document Manager ➡️](02-document-manager/README.md)**

</div>

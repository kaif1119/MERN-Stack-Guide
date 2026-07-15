// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXAMPLE 01: Basic File Upload
// Chapter 02 - Setup & Installation
// 
// Run: npm install && node server.js
// Test: Open http://localhost:3000
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Required modules import karo
const express = require('express');   // Web framework
const multer  = require('multer');    // File upload middleware
const path    = require('path');      // Path utilities (built-in)
const fs      = require('fs');        // File system (built-in)

// Express app banao
const app = express();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UPLOADS FOLDER ENSURE KARO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Agar 'uploads' folder exist nahi karta toh banao
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
  console.log('📁 uploads/ folder create kiya');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MULTER CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Step 1: Storage engine configure karo
const storage = multer.diskStorage({
  
  // destination: File KAHAN save hogi
  // - req: HTTP request object
  // - file: Uploaded file ka metadata
  // - cb: Callback(error, destination)
  destination: function(req, file, cb) {
    cb(null, 'uploads/');  // 'uploads/' folder mein save karo
  },
  
  // filename: File ka NAAM kya hoga disk pe
  // - req: HTTP request object
  // - file: Uploaded file ka metadata
  // - cb: Callback(error, filename)
  filename: function(req, file, cb) {
    // Unique naam generate karo: timestamp + original extension
    // Example: 1720000000000.jpg
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// Step 2: File filter banao (sirf images accept karo)
const fileFilter = function(req, file, cb) {
  // MIME type check karo
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);  // Accept karo
  } else {
    // Reject karo with error
    cb(new Error('Sirf image files allowed hain! (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Step 3: Multer instance banao with configuration
const upload = multer({
  storage: storage,       // Humara storage config
  fileFilter: fileFilter, // Humara file filter
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB max file size
    // 5 (MB) × 1024 (KB/MB) × 1024 (bytes/KB) = 5,242,880 bytes
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATIC FILES SERVE KARO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// '/uploads' URL pe jaane se uploads/ folder ki files milegi
app.use('/uploads', express.static('uploads'));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// HOME ROUTE: HTML form serve karo
app.get('/', function(req, res) {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Multer Basic Upload Example</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background: #f0f2f5;
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-bottom: 5px; }
        p { color: #666; margin-bottom: 25px; }
        input[type="file"] {
          display: block;
          width: 100%;
          padding: 12px;
          border: 2px dashed #ddd;
          border-radius: 8px;
          margin-bottom: 15px;
          font-size: 14px;
          cursor: pointer;
        }
        input[type="file"]:hover { border-color: #667eea; }
        button {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-size: 15px;
          cursor: pointer;
          width: 100%;
        }
        button:hover { opacity: 0.9; }
        .info {
          background: #e8f4fd;
          border-left: 4px solid #2196F3;
          padding: 12px 16px;
          border-radius: 0 8px 8px 0;
          margin-top: 15px;
          font-size: 13px;
          color: #555;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🚀 Multer Basic Upload</h1>
        <p>Chapter 02 — Setup & Installation Example</p>
        
        <!--
          IMPORTANT:
          enctype="multipart/form-data" → FILE UPLOAD KE LIYE ZAROORI!
          method="POST" → POST request use karni hai
          action="/upload" → Is route pe submit hoga
        -->
        <form action="/upload" method="POST" enctype="multipart/form-data">
          
          <!--
            name="myFile" → Yahi naam Multer mein upload.single() mein use karo
            accept="image/*" → Browser sirf image files dikhayega
          -->
          <input type="file" name="myFile" accept="image/*" required>
          
          <button type="submit">📤 File Upload Karo</button>
        </form>
        
        <div class="info">
          💡 <strong>Note:</strong> Sirf images allowed hain (max 5MB).
          Uploaded files <code>uploads/</code> folder mein save hongi.
        </div>
      </div>
    </body>
    </html>
  `);
});

// UPLOAD ROUTE: File receive karo aur process karo
// upload.single('myFile') → 'myFile' naam ke field se ek file
app.post('/upload', upload.single('myFile'), function(req, res) {
  
  // Check karo ki file mili ya nahi
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Koi file select nahi ki! Please ek file choose karo.'
    });
  }
  
  // req.file mein file ki saari information hai
  console.log('\n📁 File Upload Successful!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Field Name  :', req.file.fieldname);
  console.log('Original    :', req.file.originalname);
  console.log('MIME Type   :', req.file.mimetype);
  console.log('Size        :', (req.file.size / 1024).toFixed(2), 'KB');
  console.log('Saved As    :', req.file.filename);
  console.log('Path        :', req.file.path);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // File URL generate karo
  const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  
  // Success response bhejo
  res.status(200).json({
    success: true,
    message: '✅ File successfully upload ho gayi!',
    file: {
      fieldName: req.file.fieldname,       // HTML input name
      originalName: req.file.originalname, // User ka original naam
      savedAs: req.file.filename,           // Server pe kya naam diya
      mimeType: req.file.mimetype,          // JPEG/PNG etc.
      sizeKB: (req.file.size / 1024).toFixed(2) + ' KB',
      path: req.file.path,                  // Relative path
      url: fileUrl                          // Access URL
    }
  });
});

// FILES LIST ROUTE: Saari uploaded files dekho
app.get('/files', function(req, res) {
  fs.readdir('uploads', function(err, files) {
    if (err) {
      return res.status(500).json({ error: 'Files read karne mein error!' });
    }
    
    // Har file ki stats lo
    const fileList = files.map(filename => {
      const stats = fs.statSync(`uploads/${filename}`);
      return {
        name: filename,
        sizeKB: (stats.size / 1024).toFixed(2) + ' KB',
        url: `http://localhost:3000/uploads/${filename}`,
        uploadedAt: stats.mtime
      };
    });
    
    res.json({
      count: files.length,
      files: fileList
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR HANDLING MIDDLEWARE
// (4 parameters → yeh error middleware hai!)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(function(err, req, res, next) {
  console.error('❌ Error:', err.message);
  
  // Multer error codes handle karo
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File bahut badi hai! Maximum 5MB allowed hai.'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Unexpected file field! Check field name.'
    });
  }
  
  // Custom/other errors
  res.status(400).json({
    success: false,
    error: err.message
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVER START
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PORT = 3000;

app.listen(PORT, function() {
  console.log('');
  console.log('🚀 Multer Basic Upload Example');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`📤 Upload: POST http://localhost:${PORT}/upload`);
  console.log(`📋 Files:  GET  http://localhost:${PORT}/files`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Test karo:');
  console.log(`curl -X POST http://localhost:${PORT}/upload -F "myFile=@/path/to/image.jpg"`);
  console.log('');
});

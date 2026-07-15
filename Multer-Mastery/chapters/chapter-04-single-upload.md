# 📘 Chapter 04: Single File Upload

> **Level:** 🟢 Beginner | **Time:** 30 min | **Language:** Hindi + English

---

## 📑 Table of Contents

1. [Single File Upload Kya Hai?](#1-single-file-upload-kya-hai)
2. [upload.single() Method](#2-uploadsingle-method)
3. [Complete Working Example](#3-complete-working-example)
4. [req.file Object — Puri Details](#4-reqfile-object)
5. [File Access Karna (Serve Karna)](#5-file-access-karna)
6. [Form Data Ke Saath Upload](#6-form-data-ke-saath-upload)
7. [Expected Output](#7-expected-output)
8. [Common Mistakes](#8-common-mistakes)
9. [Best Practices](#9-best-practices)
10. [Interview Questions](#10-interview-questions)

---

## 1. Single File Upload Kya Hai?

**Single File Upload** matlab: ek request mein **sirf ek file** upload karna.

> 🔑 **Real World Example:** WhatsApp pe ek photo bhejte ho — yeh single file upload hai.

### Use Cases

```
✅ Profile picture upload
✅ Resume/CV upload
✅ Single document upload
✅ Logo upload
✅ Certificate upload
```

---

## 2. upload.single() Method

### Syntax

```javascript
upload.single(fieldname)
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `fieldname` | String | HTML form input ka `name` attribute |

### Important Rules

```
✅ upload.single('photo')  → Sirf ek file accept karega
❌ Agar 2 files bhejein   → Error: LIMIT_UNEXPECTED_FILE
❌ Field name match karo   → HTML name="photo" AND upload.single('photo')
```

---

## 3. Complete Working Example

### Folder Structure

```
04-single-upload/
├── index.js
├── public/
│   └── index.html
├── uploads/
└── package.json
```

### index.js — Server Code (Har Line Explain)

```javascript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILE: index.js
// PURPOSE: Single file upload server
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const express = require('express');  // Web framework
const multer  = require('multer');   // File upload middleware
const path    = require('path');     // Path utilities (built-in Node.js)
const fs      = require('fs');       // File system (built-in Node.js)

const app = express();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 1: Ensure uploads folder exists
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// fs.existsSync → Synchronously check karo folder hai ya nahi
// fs.mkdirSync  → Synchronously folder banao
// { recursive: true } → Nested folders bhi banao agar zaroorat ho
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 uploads/ folder create kiya');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 2: Storage Configuration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const storage = multer.diskStorage({
  
  destination: (req, file, cb) => {
    // Sab files 'uploads/' mein jayein
    cb(null, 'uploads/');
  },
  
  filename: (req, file, cb) => {
    // Unique naam generate karo
    // Example: "1720000000000-photo.jpg"
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname); // ".jpg", ".pdf", etc.
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    // Output: "avatar-1720000000000-123456789.jpg"
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 3: File Filter (Sirf Images Allow Karo)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    // cb(null, true) → File accept karo
    cb(null, true);
  } else {
    // cb(error, false) → File reject karo
    // new Error() → Custom error message
    cb(new Error('Sirf image files allowed hain! (JPEG, PNG, GIF, WebP)'), false);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 4: Multer Instance
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const upload = multer({
  storage: storage,    // Humara storage config
  fileFilter: fileFilter, // Humara filter
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB max
    // 5 (MB) * 1024 (KB/MB) * 1024 (Bytes/KB) = 5,242,880 bytes
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 5: Serve Static Files
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// express.static → ek folder ke files directly serve karta hai
// '/uploads' → URL path
// 'uploads' → Actual folder
app.use('/uploads', express.static('uploads'));

// HTML files serve karo
app.use(express.static('public'));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ROUTE 1: Upload endpoint
// POST /upload/avatar
// upload.single('avatar') → 'avatar' field ki ek file
app.post('/upload/avatar', upload.single('avatar'), (req, res) => {
  
  // Agar file nahi mili
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Koi file upload nahi ki!'
    });
  }
  
  // File URL generate karo (frontend ko dene ke liye)
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
  // Success response
  res.status(200).json({
    success: true,
    message: 'Avatar successfully upload hua! 🎉',
    data: {
      url: fileUrl,
      details: {
        fieldName: req.file.fieldname,
        originalName: req.file.originalname,
        savedAs: req.file.filename,
        mimeType: req.file.mimetype,
        size: `${(req.file.size / 1024).toFixed(2)} KB`,
        path: req.file.path
      },
      // req.body mein text fields aate hain
      formData: req.body
    }
  });
});

// ROUTE 2: Get all uploaded files list
app.get('/files', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Files read nahi kar sake' });
    }
    res.json({
      count: files.length,
      files: files
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR HANDLING MIDDLEWARE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Multer errors ko handle karo
// Note: 4 parameters → yeh error middleware hai Express mein
app.use((err, req, res, next) => {
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File bahut badi hai! Maximum 5MB allowed hai.'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Unexpected file field. Check field name.'
    });
  }
  
  // General error
  res.status(400).json({
    success: false,
    error: err.message
  });
});

// SERVER START
app.listen(3000, () => {
  console.log('✅ Server http://localhost:3000 pe chal raha hai');
});
```

### public/index.html — Frontend Form

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Avatar Upload - Multer Example</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 { color: #333; margin-bottom: 10px; }
    p { color: #666; margin-bottom: 25px; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; font-weight: 600; color: #555; }
    input[type="text"], input[type="file"] {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 14px;
      transition: border-color 0.3s;
    }
    input:focus { outline: none; border-color: #667eea; }
    .btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .btn:hover { transform: translateY(-2px); }
    #result {
      margin-top: 20px;
      padding: 15px;
      border-radius: 10px;
      display: none;
    }
    .success { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }
    .error { background: #ffebee; color: #c62828; border: 1px solid #ef9a9a; }
    #preview { max-width: 100%; border-radius: 10px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>📸 Avatar Upload</h1>
    <p>Apni profile photo upload karo (Max: 5MB, Images only)</p>
    
    <!--
      action="/upload/avatar" → Yeh route pe form submit hoga
      method="POST"           → POST request
      enctype="multipart/form-data" → FILE UPLOAD KE LIYE ZAROORI!
    -->
    <form id="uploadForm" action="/upload/avatar" method="POST" enctype="multipart/form-data">
      
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" placeholder="Apna naam likho..." required>
      </div>
      
      <div class="form-group">
        <label for="avatar">Profile Photo:</label>
        <!--
          name="avatar" → Yahi naam Multer mein use karo: upload.single('avatar')
          accept="image/*" → Browser sirf image files dikhayega
        -->
        <input type="file" id="avatar" name="avatar" accept="image/*" required>
      </div>
      
      <button type="submit" class="btn">🚀 Upload Karo</button>
    </form>
    
    <div id="result"></div>
    <img id="preview" style="display:none">
  </div>

  <script>
    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
      e.preventDefault(); // Form ka default submit rok do
      
      const formData = new FormData(e.target); // FormData object banao
      const resultDiv = document.getElementById('result');
      const preview = document.getElementById('preview');
      
      try {
        const response = await fetch('/upload/avatar', {
          method: 'POST',
          body: formData  // FormData automatically multipart/form-data set karta hai
        });
        
        const data = await response.json();
        
        if (data.success) {
          resultDiv.className = 'success';
          resultDiv.style.display = 'block';
          resultDiv.innerHTML = `
            <strong>✅ ${data.message}</strong><br>
            <small>File: ${data.data.details.originalName}</small><br>
            <small>Size: ${data.data.details.size}</small><br>
            <small>URL: <a href="${data.data.url}" target="_blank">${data.data.url}</a></small>
          `;
          
          // Image preview dikhao
          preview.src = data.data.url;
          preview.style.display = 'block';
        } else {
          resultDiv.className = 'error';
          resultDiv.style.display = 'block';
          resultDiv.innerHTML = `<strong>❌ Error:</strong> ${data.message || data.error}`;
        }
      } catch (err) {
        resultDiv.className = 'error';
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<strong>❌ Network Error:</strong> ${err.message}`;
      }
    });
  </script>
</body>
</html>
```

---

## 4. req.file Object — Puri Details

```javascript
// upload.single() ke baad req.file aise dikhta hai:
req.file = {
  
  fieldname: 'avatar',
  // ↑ HTML input ka name attribute
  // HTML: <input type="file" name="avatar">
  
  originalname: 'my-beautiful-photo.jpg',
  // ↑ User ke computer pe file ka original naam
  // Note: Spaces, special characters, etc. original rahengi
  
  encoding: '7bit',
  // ↑ File ki encoding type (mostly 7bit ya base64)
  // Usually aapko isse kuch nahi karna
  
  mimetype: 'image/jpeg',
  // ↑ File ka MIME type (official content type)
  // Common examples:
  //   'image/jpeg'       → JPEG image
  //   'image/png'        → PNG image
  //   'image/gif'        → GIF image
  //   'application/pdf'  → PDF document
  //   'video/mp4'        → MP4 video
  //   'text/plain'       → Plain text file
  
  destination: 'uploads/',
  // ↑ Folder jahan file save hua
  // diskStorage specific (memoryStorage mein nahi hoga)
  
  filename: 'avatar-1720000000000-987654321.jpg',
  // ↑ Server pe file ka naam (humne filename function mein set kiya)
  // diskStorage specific
  
  path: 'uploads/avatar-1720000000000-987654321.jpg',
  // ↑ File ka poora path (destination + filename)
  // diskStorage specific
  
  size: 102400
  // ↑ File size in BYTES
  // 102400 bytes = 100 KB
  // Convert karna:
  //   KB: size / 1024
  //   MB: size / (1024 * 1024)
}
```

---

## 5. File Access Karna (Serve Karna)

### Static Files Serve Karo

```javascript
// Express se uploaded files serve karo
app.use('/uploads', express.static('uploads'));

// Ab URL se access kar sakte hain:
// http://localhost:3000/uploads/avatar-1720000000000.jpg
```

### File URL Generate Karo

```javascript
// Dynamic URL banana
const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

// req.protocol → 'http' ya 'https'
// req.get('host') → 'localhost:3000'
// Output: 'http://localhost:3000/uploads/avatar-1720000000000.jpg'
```

---

## 6. Form Data Ke Saath Upload

### Text + File Ek Saath

```javascript
// Server side:
app.post('/upload/profile', upload.single('photo'), (req, res) => {
  // req.file → uploaded file
  // req.body → text fields (name, email, etc.)
  
  console.log('File:', req.file);
  console.log('Text Data:', req.body);
  // req.body.name, req.body.email, etc.
  
  res.json({
    file: req.file,
    textData: req.body
  });
});
```

```html
<!-- HTML Form -->
<form action="/upload/profile" method="POST" enctype="multipart/form-data">
  <input type="text" name="name" placeholder="Aapka naam">
  <input type="email" name="email" placeholder="Email">
  <input type="file" name="photo">
  <button type="submit">Submit</button>
</form>
```

---

## 7. Expected Output

### Successful Upload

```json
{
  "success": true,
  "message": "Avatar successfully upload hua! 🎉",
  "data": {
    "url": "http://localhost:3000/uploads/avatar-1720000000000-987654321.jpg",
    "details": {
      "fieldName": "avatar",
      "originalName": "my-photo.jpg",
      "savedAs": "avatar-1720000000000-987654321.jpg",
      "mimeType": "image/jpeg",
      "size": "245.67 KB",
      "path": "uploads/avatar-1720000000000-987654321.jpg"
    },
    "formData": {
      "username": "RajKumar"
    }
  }
}
```

### File Type Error

```json
{
  "success": false,
  "error": "Sirf image files allowed hain! (JPEG, PNG, GIF, WebP)"
}
```

### File Too Large

```json
{
  "success": false,
  "error": "File bahut badi hai! Maximum 5MB allowed hai."
}
```

---

## 8. Common Mistakes

```
❌ MISTAKE 1: enctype bhool gaya
<form method="POST" action="/upload">  ← WRONG (enctype missing!)

✅ FIX:
<form method="POST" action="/upload" enctype="multipart/form-data">

────────────────────────────────────────────────

❌ MISTAKE 2: Field name mismatch
HTML: <input name="photo">
JS:   upload.single('image')  ← WRONG! 'photo' ≠ 'image'

✅ FIX:
HTML: <input name="photo">
JS:   upload.single('photo')  ← SAME naam!

────────────────────────────────────────────────

❌ MISTAKE 3: Uploads folder nahi banaya
cb(null, 'uploads/')  ← Multer error dega agar folder nahi hai!

✅ FIX:
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

────────────────────────────────────────────────

❌ MISTAKE 4: Error middleware bhool gaya
// Multer errors route handler tak nahi pahunchte directly
// Error middleware chahiye!

✅ FIX:
app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});
```

---

## 9. Best Practices

```
✅ 1. Hamesha file size limit set karo (limits.fileSize)
✅ 2. File type validation karo (fileFilter)
✅ 3. Unique filenames use karo (timestamp/UUID)
✅ 4. Uploads folder automatically create karo (fs.mkdirSync)
✅ 5. Error middleware add karo
✅ 6. File URL encode karo (special characters ke liye)
✅ 7. Production mein cloud storage use karo (S3/Cloudinary)
✅ 8. Original filename sanitize karo (path traversal se bachao)
```

---

## 10. Interview Questions

**Q1: upload.single() mein parameter kya hota hai?**
> HTML form input field ka `name` attribute. Yahi naam Multer use karta hai file ko identify karne ke liye.

**Q2: req.file kab undefined hota hai?**
> Jab koi file upload nahi ki gayi, ya field name mismatch hai, ya fileFilter ne reject kar diya (false pass kiya).

**Q3: Uploaded file ka URL kaise banate hain?**
> Express static middleware use karke: `app.use('/uploads', express.static('uploads'))`. Phir URL: `http://host/uploads/filename`

**Q4: Text fields aur file ek saath kaise receive karte hain?**
> `req.file` mein uploaded file hoti hai, `req.body` mein text form fields hote hain — dono ek saath available hain.

**Q5: Unique filename generate karne ke best ways kaunse hain?**
> 1. `Date.now()` + random number
> 2. UUID (`uuid` package)
> 3. Crypto random bytes

---

<div align="center">

**[⬅️ Chapter 03: Storage](chapter-03-storage.md)** | **[Chapter 05: Multiple Upload ➡️](chapter-05-multiple-upload.md)**

</div>

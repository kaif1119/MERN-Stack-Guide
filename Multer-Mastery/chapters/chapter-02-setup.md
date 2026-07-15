# 📘 Chapter 02: Setup & Installation

> **Level:** 🟢 Beginner | **Time:** 20 min | **Language:** Hindi + English

---

## 📑 Table of Contents

1. [Prerequisites Check](#1-prerequisites-check)
2. [Project Setup Karo](#2-project-setup-karo)
3. [Multer Install Karo](#3-multer-install-karo)
4. [Package.json Samjho](#4-packagejson-samjho)
5. [First Multer App Banao](#5-first-multer-app-banao)
6. [Test Karo](#6-test-karo)
7. [Common Setup Errors](#7-common-setup-errors)
8. [Quick Revision](#8-quick-revision)
9. [Interview Questions](#9-interview-questions)

---

## 1. Prerequisites Check

Pehle check karo ki sab installed hai:

```bash
# Node.js version check karo (14+ chahiye)
node --version
# Expected: v18.x.x ya usse zyada

# npm check karo
npm --version
# Expected: 8.x.x ya usse zyada

# Agar Node.js nahi hai, yahan se download karo:
# https://nodejs.org/en/download/
```

### Node.js Kya Hai? (Quick Reminder)

Node.js ek JavaScript runtime hai jo browser ke bahar JavaScript chalane deta hai. Multer Node.js pe hi kaam karta hai.

---

## 2. Project Setup Karo

### Step 1: Folder Banao

```bash
# Ek naya folder banao
mkdir my-multer-app

# Us folder mein jaao
cd my-multer-app
```

### Step 2: npm Initialize Karo

```bash
# npm project initialize karo
# -y flag matlab: sab defaults accept karo (manually questions nahi poochhunga)
npm init -y
```

**Yeh command chalane ke baad `package.json` ban jaata hai:**

```json
{
  "name": "my-multer-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

---

## 3. Multer Install Karo

```bash
# Express aur Multer dono install karo
npm install express multer
```

**Kya install hoga:**

| Package | Kya Hai | Version |
|---------|---------|---------|
| `express` | Web framework | 4.x |
| `multer` | File upload middleware | 1.4.x |
| `busboy` | (Automatically) multipart parser | Auto-installed |

### Verify Installation

```bash
# Check karo ki install hua
ls node_modules | grep multer
# Output: multer

# Ya package.json mein dekho
cat package.json
```

**Updated package.json:**

```json
{
  "name": "my-multer-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1"
  }
}
```

---

## 4. Package.json Samjho

```json
{
  "name": "my-multer-app",      // ← Aapke project ka naam
  "version": "1.0.0",           // ← Abhi version 1.0.0 hai
  "description": "",            // ← Project description (optional)
  "main": "index.js",           // ← Entry point file
  "scripts": {
    "start": "node index.js",   // ← npm start command
    "dev": "nodemon index.js"   // ← npm run dev (nodemon ke saath)
  },
  "dependencies": {
    "express": "^4.18.2",       // ← ^ matlab: 4.x.x koi bhi chalega
    "multer": "^1.4.5-lts.1"   // ← LTS version (Long Term Support)
  }
}
```

### Caret (^) aur Tilde (~) Ka Matlab

```
"^4.18.2" = 4.x.x mein koi bhi (4.18.2, 4.19.0, etc.)
            par 5.x.x NAHI

"~4.18.2" = 4.18.x mein koi bhi (4.18.2, 4.18.3)
            par 4.19.x NAHI

"4.18.2"  = Exactly 4.18.2 hi chahiye
```

---

## 5. First Multer App Banao

### Folder Structure

```
my-multer-app/
├── index.js          ← Main server file
├── uploads/          ← Files yahan save hongi (auto-create hoga)
├── package.json      ← Project config
└── node_modules/     ← Installed packages
```

### index.js Banao

```javascript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// File: index.js
// Purpose: Basic Multer setup with Express
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// LINE 1: express package import karo
// express ek web framework hai jo HTTP server banana aasaan banata hai
const express = require('express');

// LINE 2: multer package import karo
// multer ek middleware hai jo file uploads handle karta hai
const multer = require('multer');

// LINE 3: path module import karo
// path Node.js ka built-in module hai, file paths manage karta hai
const path = require('path');

// LINE 4: express application instance banao
// app ek object hai jisme saare routes aur middleware define karte hain
const app = express();

// LINE 5: PORT define karo
// Server kaunse port pe listen karega
// process.env.PORT → environment variable (production mein use hota)
// || 3000 → agar env variable nahi mila toh 3000 use karo
const PORT = process.env.PORT || 3000;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MULTER CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// LINE 8-19: diskStorage configure karo
// diskStorage = files ko disk (hard drive) pe save karta hai
const storage = multer.diskStorage({

  // destination: Yeh batata hai ki file KAHAN save ho
  // req   → HTTP request object
  // file  → Upload ho rahi file ka info
  // cb    → Callback function (error, destination)
  destination: function (req, file, cb) {
    // null → koi error nahi
    // 'uploads/' → is folder mein save karo
    cb(null, 'uploads/');
  },

  // filename: Yeh batata hai ki file ka NAAM kya ho
  // req   → HTTP request object
  // file  → Upload ho rahi file ka info
  // cb    → Callback function (error, filename)
  filename: function (req, file, cb) {
    // Date.now() → Current timestamp (unique naam ke liye)
    // path.extname(file.originalname) → Original extension (.jpg, .pdf, etc.)
    // Dono milate hain: "1234567890.jpg"
    cb(null, Date.now() + path.extname(file.originalname));
  }

});

// LINE 22: multer middleware configure karo
// { storage: storage } → Humne upar jo storage banai wo use karo
const upload = multer({ storage: storage });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// LINE 25-38: Home route
// GET / → Browser pe "/" URL pe jaane par yeh chalega
app.get('/', (req, res) => {
  // ek HTML form send karo
  res.send(`
    <h1>Multer File Upload Demo</h1>
    
    <!-- 
      action="/upload"  → Form kahan submit hoga
      method="POST"     → POST request use hogi
      enctype="multipart/form-data" → FILE UPLOAD KE LIYE ZAROORI!
    -->
    <form action="/upload" method="POST" enctype="multipart/form-data">
      
      <!-- 
        type="file"  → File input field
        name="myFile" → Yahi naam Multer use karega (req.file.fieldname)
      -->
      <input type="file" name="myFile" />
      
      <button type="submit">Upload Karo!</button>
    </form>
  `);
});

// LINE 41-58: Upload route
// POST /upload → Jab form submit hoga tab yeh route handle karega
// upload.single('myFile') → Ek single file upload karo, field name hai 'myFile'
app.post('/upload', upload.single('myFile'), (req, res) => {
  
  // req.file check karo
  // Agar file upload nahi hua toh req.file undefined hoga
  if (!req.file) {
    // 400 = Bad Request status code
    return res.status(400).json({
      success: false,
      message: 'Koi file nahi mili! Please select a file.'
    });
  }

  // Agar file upload hua toh success response bhejo
  res.json({
    success: true,
    message: 'File successfully upload ho gayi! 🎉',
    // req.file mein file ki saari information hai
    file: {
      originalName: req.file.originalname,  // User ne kya naam diya tha
      savedAs: req.file.filename,            // Server pe kis naam se save hua
      size: req.file.size + ' bytes',        // File kitni badi hai
      type: req.file.mimetype,               // File ka type (image/jpeg, etc.)
      location: req.file.path                // Kahan save hua
    }
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVER START
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// LINE 61: Server ko PORT pe start karo
// listen(PORT, callback)
app.listen(PORT, () => {
  // Yeh message console mein aayega jab server start ho
  console.log(`✅ Server chal raha hai: http://localhost:${PORT}`);
  console.log(`📁 Files 'uploads/' folder mein save hongi`);
});
```

### uploads/ Folder Banao

```bash
# Uploads folder banao manually
mkdir uploads
```

> ⚠️ **Important:** `uploads/` folder pehle se exist karna chahiye, warna Multer error dega!

---

## 6. Test Karo

### Server Start Karo

```bash
node index.js

# Output:
# ✅ Server chal raha hai: http://localhost:3000
# 📁 Files 'uploads/' folder mein save hongi
```

### Browser Se Test Karo

1. Browser open karo
2. `http://localhost:3000` pe jao
3. File choose karo
4. "Upload Karo!" button click karo
5. Success response dekho

### curl Se Test Karo (Terminal)

```bash
# curl se file upload test karo
curl -X POST http://localhost:3000/upload \
  -F "myFile=@/path/to/your/test-image.jpg"

# Expected Output:
# {
#   "success": true,
#   "message": "File successfully upload ho gayi! 🎉",
#   "file": {
#     "originalName": "test-image.jpg",
#     "savedAs": "1720000000000.jpg",
#     "size": "102400 bytes",
#     "type": "image/jpeg",
#     "location": "uploads/1720000000000.jpg"
#   }
# }
```

### Verify karo ki File Save Hua

```bash
# uploads folder mein dekho
ls uploads/

# Output:
# 1720000000000.jpg
```

---

## 7. Common Setup Errors

### Error 1: ENOENT - Folder Not Found

```
Error: ENOENT: no such file or directory, open 'uploads/...'
```

**Solution:**
```bash
# uploads folder banao
mkdir uploads
```

### Error 2: Cannot find module 'multer'

```
Error: Cannot find module 'multer'
```

**Solution:**
```bash
# Multer install karo
npm install multer
```

### Error 3: Unexpected field

```
MulterError: Unexpected field
```

**Solution:**
```javascript
// HTML form mein name attribute aur Multer mein field name SAME hona chahiye!

// HTML:
<input type="file" name="myFile">    // ← name="myFile"

// JavaScript:
upload.single('myFile')              // ← 'myFile' same hai!
```

### Error 4: req.file is undefined

**Possible reasons:**
```
1. HTML form mein enctype="multipart/form-data" nahi hai
2. Form field name aur Multer field name match nahi kar raha
3. Multer middleware route mein add nahi kiya
```

---

## 8. Quick Revision

```
✅ npm init -y → package.json banata hai
✅ npm install express multer → packages install karta hai
✅ multer.diskStorage() → file save karne ka configuration
✅ destination → file kahan save ho (folder path)
✅ filename → file ka kya naam ho
✅ multer({ storage }) → configured multer instance
✅ upload.single('fieldname') → ek file upload
✅ req.file → uploaded file ki info
✅ uploads/ folder pehle se exist karna chahiye
```

### Yaad Karne Ka Trick (SDRF):

```
S - Storage configure karo
D - Destination set karo  
R - Route mein middleware add karo
F - req.File use karo
```

---

## 9. Interview Questions

**Q1: Multer install karne ke liye kya command hai?**
> `npm install multer`

**Q2: multer.diskStorage() mein kaunse do functions hote hain?**
> `destination` (kahan save ho) aur `filename` (kya naam ho)

**Q3: Single file upload ke liye kaunsa method use hota hai?**
> `upload.single('fieldname')`

**Q4: req.file mein kya hota hai?**
> Uploaded file ki information: originalname, filename, mimetype, size, path, destination

**Q5: Agar req.file undefined hai toh kya problem ho sakti hai?**
> 1. HTML form mein `enctype="multipart/form-data"` missing hai
> 2. Field name mismatch hai
> 3. Multer middleware route mein nahi hai

---

<div align="center">

**[⬅️ Chapter 01: Introduction](chapter-01-introduction.md)** | **[Chapter 03: Storage Engines ➡️](chapter-03-storage.md)**

</div>

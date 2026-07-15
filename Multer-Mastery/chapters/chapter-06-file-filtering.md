# 📘 Chapter 06: File Filtering & Validation

> **Level:** 🟡 Intermediate | **Time:** 35 min | **Language:** Hindi + English

---

## 📑 Table of Contents

1. [File Filtering Kya Hai?](#1-file-filtering-kya-hai)
2. [fileFilter Function — Deep Dive](#2-filefilter-function)
3. [MIME Type Validation](#3-mime-type-validation)
4. [File Extension Validation](#4-file-extension-validation)
5. [Limits Configuration](#5-limits-configuration)
6. [Multi-Layer Validation](#6-multi-layer-validation)
7. [Interview Questions](#7-interview-questions)

---

## 1. File Filtering Kya Hai?

**File Filtering** = yeh decide karna ki **kaunsi files accept karein** aur **kaunsi reject karein**.

> 🔑 **Real World Analogy:** Airport security scanner — sirf allowed items hi andar jaate hain. Waise hi file filter decide karta hai ki kaunsi files server mein aayein.

### Kyun Zaroori Hai?

```
❌ Bina filtering ke:
   - User .exe (executable) file upload kar sakta hai → SECURITY RISK
   - User 1GB video upload kar sakta hai → SERVER CRASH
   - User .php file upload kar sakta hai → CODE EXECUTION RISK

✅ Filtering ke saath:
   - Sirf allowed MIME types accept karo
   - Size limit lagao
   - Extension check karo
```

---

## 2. fileFilter Function — Deep Dive

### Syntax

```javascript
const fileFilter = (req, file, cb) => {
  // req  → HTTP Request object
  // file → Incoming file ka metadata (NOT the actual data yet)
  // cb   → Callback: cb(error, acceptFile)

  if (/* file accepted */) {
    cb(null, true);   // Accept karo
  } else {
    cb(null, false);  // Silently reject (koi error nahi)
    // Ya error ke saath reject:
    // cb(new Error('Invalid file type!'), false);
  }
};
```

### cb() Parameters Explained

```javascript
// cb(error, acceptFile)
//
// error:
//   null → Koi error nahi
//   new Error('msg') → Error throw karo
//
// acceptFile:
//   true  → File accept karo, upload proceed karo
//   false → File reject karo, upload cancel karo

cb(null, true);               // ✅ Accept, no error
cb(null, false);              // ❌ Reject, no error (silent)
cb(new Error('message'));     // ❌ Reject with error
cb(new Error('message'), false); // ❌ Reject with error (explicit)
```

### file Object Mein Kya Available Hai (Filter Ke Time)?

```javascript
// fileFilter mein milta hai:
file = {
  fieldname: 'avatar',                    // HTML field name
  originalname: 'photo.jpg',              // Original file name
  encoding: '7bit',                       // Encoding
  mimetype: 'image/jpeg'                  // ← MIME type (yahi check karo!)
  // Note: size, destination, filename YET nahi hai
  // File abhi stream mein hai, disk pe nahi gayi
}
```

---

## 3. MIME Type Validation

### MIME Type Kya Hai?

**MIME (Multipurpose Internet Mail Extensions) Type** ek standard hai jo file ke content type ko describe karta hai.

```
Format: type/subtype

Images:
  image/jpeg → JPEG images (.jpg, .jpeg)
  image/png  → PNG images (.png)
  image/gif  → GIF images (.gif)
  image/webp → WebP images (.webp)
  image/svg+xml → SVG images (.svg)

Documents:
  application/pdf → PDF files (.pdf)
  application/msword → Word (.doc)
  application/vnd.openxmlformats-officedocument.wordprocessingml.document → .docx

Videos:
  video/mp4 → MP4 videos
  video/mpeg → MPEG videos
  video/quicktime → QuickTime (.mov)

Audio:
  audio/mpeg → MP3 audio
  audio/wav  → WAV audio
  audio/ogg  → OGG audio

Archives:
  application/zip → ZIP files
  application/x-rar-compressed → RAR files

Text:
  text/plain → .txt files
  text/csv   → .csv files
  text/html  → .html files
```

### MIME Type Filter Examples

```javascript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXAMPLE 1: Sirf Images Accept Karo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const imageOnlyFilter = (req, file, cb) => {
  // startsWith('image/') → koi bhi image type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sirf image files allowed hain!'), false);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXAMPLE 2: Specific Types Ki Whitelist
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const documentFilter = (req, file, cb) => {
  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sirf PDF, DOC, DOCX, TXT files allowed hain!'), false);
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXAMPLE 3: Multiple Categories
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const mediaFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');
  const isAudio = file.mimetype.startsWith('audio/');
  
  if (isImage || isVideo || isAudio) {
    cb(null, true);
  } else {
    cb(new Error('Sirf media files (image, video, audio) allowed hain!'), false);
  }
};
```

---

## 4. File Extension Validation

### Kyon Extension Bhi Check Karo?

```
⚠️ MIME Type Spoofing Attack:
   - Attacker .php file ka MIME type 'image/jpeg' set kar sakta hai
   - MIME check akele kaafi nahi
   - Extension check bhi karo!

✅ Double Validation:
   MIME Type + Extension = Secure!
```

### Extension Validation Code

```javascript
const path = require('path');

const strictImageFilter = (req, file, cb) => {
  
  // STEP 1: MIME Type check
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const isMimeValid = allowedMimes.includes(file.mimetype);
  
  // STEP 2: Extension check
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isExtValid = allowedExtensions.includes(fileExtension);
  
  // STEP 3: Dono check pass karne chahiye
  if (isMimeValid && isExtValid) {
    cb(null, true); // ✅ Safe file
  } else if (!isMimeValid) {
    cb(new Error(`Invalid MIME type: ${file.mimetype}`), false);
  } else {
    cb(new Error(`Invalid extension: ${fileExtension}`), false);
  }
};
```

### ⚠️ Extension Spoofing Warning

```javascript
// path.extname() se extension lena:
path.extname('photo.jpg')        // → '.jpg'
path.extname('photo.JPG')        // → '.JPG'  ← Case sensitive!
path.extname('photo.JPG').toLowerCase() // → '.jpg' ✅

// Double extension attack:
path.extname('malware.php.jpg')  // → '.jpg'  ← Last extension milti hai
// Yahan bhi check zaroori hai: originalname mein .php hai ya nahi

// Safe check:
const isSafe = !file.originalname.includes('.php') &&
               !file.originalname.includes('.exe') &&
               !file.originalname.includes('.sh');
```

---

## 5. Limits Configuration

### All Available Limits

```javascript
const upload = multer({
  storage: storage,
  limits: {
    
    fieldNameSize: 100,     // Field name ki maximum length (bytes) — default: 100
    fieldSize: 1024 * 1024, // Non-file field ka max size (bytes) — default: 1MB
    fields: 10,             // Maximum non-file fields count — default: unlimited
    fileSize: 5 * 1024 * 1024, // File ka max size (bytes) — default: unlimited
    files: 5,               // Maximum files per request — default: unlimited
    parts: 15,              // Maximum parts (files + fields) — default: unlimited
    headerPairs: 2000       // Maximum header key-value pairs — default: 2000
  }
});
```

### Practical Examples

```javascript
// Profile picture upload ke liye:
const profileUpload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,  // 2MB max
    files: 1                     // Sirf 1 file
  }
});

// Document upload ke liye:
const documentUpload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,  // 50MB max (bade documents)
    files: 1                      // Sirf 1 document
  }
});

// Gallery upload ke liye:
const galleryUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,  // 10MB per image
    files: 20                     // Max 20 images
  }
});
```

---

## 6. Multi-Layer Validation

### Complete Validation System

```javascript
const multer = require('multer');
const path = require('path');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VALIDATION CONFIG (centralized raho)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const VALIDATION = {
  image: {
    mimes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 5 * 1024 * 1024,   // 5MB
    maxFiles: 10
  },
  document: {
    mimes: ['application/pdf', 'application/msword'],
    extensions: ['.pdf', '.doc', '.docx'],
    maxSize: 50 * 1024 * 1024,  // 50MB
    maxFiles: 5
  },
  video: {
    mimes: ['video/mp4', 'video/mpeg', 'video/quicktime'],
    extensions: ['.mp4', '.mpeg', '.mov'],
    maxSize: 500 * 1024 * 1024, // 500MB
    maxFiles: 2
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FACTORY FUNCTION — Different uploads ke liye
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function createUploadMiddleware(type) {
  const config = VALIDATION[type];
  
  if (!config) throw new Error(`Unknown upload type: ${type}`);
  
  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeOk = config.mimes.includes(file.mimetype);
    const isExtOk = config.extensions.includes(ext);
    
    if (isMimeOk && isExtOk) {
      cb(null, true);
    } else {
      cb(new Error(
        `Invalid file! Allowed: ${config.extensions.join(', ')} | Got: ${ext} (${file.mimetype})`
      ), false);
    }
  };
  
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, `uploads/${type}s/`),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${type}-${Date.now()}${ext}`);
      }
    }),
    fileFilter,
    limits: {
      fileSize: config.maxSize,
      files: config.maxFiles
    }
  });
}

// Usage
const imageUpload    = createUploadMiddleware('image');
const documentUpload = createUploadMiddleware('document');
const videoUpload    = createUploadMiddleware('video');

// Routes
app.post('/upload/image',    imageUpload.single('image'),       (req, res) => { ... });
app.post('/upload/document', documentUpload.single('document'), (req, res) => { ... });
app.post('/upload/video',    videoUpload.single('video'),       (req, res) => { ... });
```

---

## 7. Interview Questions

**Q1: fileFilter mein cb() ke parameters kya hote hain?**
> `cb(error, acceptFile)` — pehla error (null if none), doosra boolean (true = accept, false = reject).

**Q2: Sirf MIME type check karna kaafi secure kyun nahi hai?**
> Attacker apni malicious file ka MIME type change kar sakta hai. MIME type + extension dono check karna chahiye for security.

**Q3: File size limit kaise set karte hain Multer mein?**
> `multer({ limits: { fileSize: 5 * 1024 * 1024 } })` — 5MB limit. LIMIT_FILE_SIZE error aata hai exceed hone pe.

**Q4: `files` limit aur `fileSize` limit mein kya fark hai?**
> `files` = maximum number of files per request. `fileSize` = each individual file ki maximum size.

**Q5: Ek file ka extension kaise extract karte hain Node.js mein?**
> `path.extname(filename)` — returns `.jpg`, `.pdf`, etc.

---

<div align="center">

**[⬅️ Chapter 05: Multiple Upload](chapter-05-multiple-upload.md)** | **[Chapter 07: Error Handling ➡️](chapter-07-error-handling.md)**

</div>

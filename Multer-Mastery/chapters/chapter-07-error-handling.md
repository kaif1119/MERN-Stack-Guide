# 📘 Chapter 07: Error Handling in Multer

> **Level:** 🟡 Intermediate | **Time:** 45 min | **Language:** Hindi + English

---

## 📑 Table of Contents

1. [Error Handling Kyun Zaroori Hai?](#1-error-handling-kyun-zaroori-hai)
2. [Multer Error Types](#2-multer-error-types)
3. [Error Codes Reference](#3-error-codes-reference)
4. [Basic Error Handling](#4-basic-error-handling)
5. [Advanced Error Handling](#5-advanced-error-handling)
6. [Custom Error Classes](#6-custom-error-classes)
7. [Interview Questions](#7-interview-questions)

---

## 1. Error Handling Kyun Zaroori Hai?

Bina error handling ke aapka server:
- Crash ho sakta hai (unhandled exception)
- User ko confusing "Internal Server Error" milega
- Security information leak ho sakti hai

---

## 2. Multer Error Types

Multer **do types** ke errors throw karta hai:

```
TYPE 1: MulterError
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Multer khud throw karta hai
err.name === 'MulterError'
err.code → specific error code hota hai

TYPE 2: Regular Error
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
fileFilter mein aapne throw kiya
new Error('message')
err.name === 'Error' (regular JavaScript error)
```

---

## 3. Error Codes Reference

| Error Code | Kab Aata Hai | Message |
|-----------|--------------|---------|
| `LIMIT_PART_COUNT` | Parts limit exceed | Too many parts |
| `LIMIT_FILE_SIZE` | File bahut badi | File too large |
| `LIMIT_FILE_COUNT` | Files limit exceed | Too many files |
| `LIMIT_FIELD_KEY` | Field name too long | Field name too long |
| `LIMIT_FIELD_VALUE` | Field value too large | Field value too large |
| `LIMIT_FIELD_COUNT` | Too many fields | Too many fields |
| `LIMIT_UNEXPECTED_FILE` | Unknown field | Unexpected field |

---

## 4. Basic Error Handling

### Pattern 1: Route Level (Individual Route)

```javascript
const express = require('express');
const multer = require('multer');

const app = express();
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// METHOD 1: Multer ko function call ki tarah use karo
// (Recommended — errors easily catch kar sakte hain)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/upload', (req, res) => {
  
  // upload.single() ko manually call karo
  upload.single('file')(req, res, (err) => {
    
    // err → Agar koi error hai
    if (err) {
      
      // MulterError check karo
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File bahut badi hai! Max 5MB allowed.',
          code: err.code
        });
      }
      
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          error: `Unexpected file field: "${err.field}"`,
          code: err.code
        });
      }
      
      // fileFilter error (custom)
      return res.status(400).json({
        success: false,
        error: err.message,
        code: 'INVALID_FILE'
      });
    }
    
    // Agar koi error nahi
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Koi file nahi mili!' });
    }
    
    res.json({
      success: true,
      file: req.file
    });
  });
});
```

### Pattern 2: Global Error Middleware

```javascript
// Multer middleware route mein add karo
app.post('/upload', upload.single('file'), (req, res) => {
  // Yahan Multer errors nahi pahunchte by default
  // Error middleware use karo
  res.json({ success: true, file: req.file });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GLOBAL ERROR MIDDLEWARE
// 4 parameters hone chahiye: (err, req, res, next)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use((err, req, res, next) => {
  
  console.error('Upload Error:', err);
  
  // Multer specific errors
  if (err.name === 'MulterError') {
    const errorMessages = {
      LIMIT_FILE_SIZE: 'File bahut badi hai! Allowed limit exceed ho gayi.',
      LIMIT_FILE_COUNT: 'Bahut zyada files! Allowed count exceed ho gaya.',
      LIMIT_FIELD_COUNT: 'Bahut zyada form fields!',
      LIMIT_UNEXPECTED_FILE: `"${err.field}" field expected nahi tha.`,
      LIMIT_PART_COUNT: 'Request mein bahut zyada parts hain.',
      LIMIT_FIELD_KEY: 'Field name bahut lamba hai.',
      LIMIT_FIELD_VALUE: 'Field value bahut badi hai.'
    };
    
    return res.status(400).json({
      success: false,
      errorType: 'MulterError',
      code: err.code,
      error: errorMessages[err.code] || err.message
    });
  }
  
  // Custom errors (fileFilter se)
  if (err instanceof Error) {
    return res.status(400).json({
      success: false,
      errorType: 'ValidationError',
      error: err.message
    });
  }
  
  // Unknown errors
  res.status(500).json({
    success: false,
    errorType: 'ServerError',
    error: 'Kuch galat ho gaya. Baad mein try karo.'
  });
});
```

---

## 5. Advanced Error Handling

### Async/Await Compatible Error Handler

```javascript
// Multer ko Promise mein wrap karo
function uploadFile(uploadMiddleware, req, res) {
  return new Promise((resolve, reject) => {
    uploadMiddleware(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Route mein async/await use karo
app.post('/upload', async (req, res) => {
  try {
    // Multer ka upload await karo
    await uploadFile(upload.single('avatar'), req, res);
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'File nahi mili!' });
    }
    
    res.json({ success: true, file: req.file });
    
  } catch (err) {
    // Error handle karo
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File bahut badi hai!'
      });
    }
    res.status(400).json({ success: false, error: err.message });
  }
});
```

### Complete Error Response Standard

```javascript
// Consistent error response format
const createErrorResponse = (code, message, details = null) => ({
  success: false,
  error: {
    code,
    message,
    ...(details && { details }),
    timestamp: new Date().toISOString()
  }
});

// Usage
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json(
      createErrorResponse('FILE_TOO_LARGE', 'Uploaded file size exceeds limit', {
        maxSize: '5MB',
        fileSize: req.headers['content-length']
      })
    );
  }
  // ...other errors
});
```

---

## 6. Custom Error Classes

```javascript
// Custom Multer Error class
class UploadError extends Error {
  constructor(message, code, statusCode = 400) {
    super(message);
    this.name = 'UploadError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Usage in fileFilter
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(
      new UploadError('Only images are allowed', 'INVALID_FILE_TYPE', 415),
      false
    );
  }
  cb(null, true);
};

// Error middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || (err.name === 'MulterError' ? 400 : 500);
  
  res.status(statusCode).json({
    success: false,
    error: err.message,
    code: err.code || 'UNKNOWN_ERROR'
  });
});
```

---

## 7. Interview Questions

**Q1: Multer errors Express error middleware tak kaise pahunchate hain?**
> Multer middleware errors automatically `next(err)` ke zariye propagate nahi karta jab middleware ke roop mein use karo. Isliye ya toh manual callback pattern use karo ya global error middleware + `next(err)` approach.

**Q2: MulterError aur regular Error mein kya fark hai Multer context mein?**
> `MulterError` Multer ki apni error class hai (code property hoti hai), jabki `Error` aapka custom error hai (fileFilter mein throw kiya). `err.name === 'MulterError'` ya `err instanceof multer.MulterError` se distinguish kar sakte hain.

**Q3: LIMIT_UNEXPECTED_FILE error kab aata hai?**
> Jab request mein ek aisa file field aata hai jo Multer configuration mein expected nahi tha. Example: `upload.single('avatar')` set hai par request mein `photo` field se file aayi.

**Q4: HTTP status code kaunsa use karein file too large error ke liye?**
> `413 Payload Too Large` — yeh standard HTTP status code hai. Multer ka LIMIT_FILE_SIZE error 413 ke saath respond karna chahiye.

**Q5: Async route mein Multer errors kaise handle karein?**
> Multer ko Promise mein wrap karo aur `try/catch` use karo. Ya `multer-promise` wrapper package use karo.

---

<div align="center">

**[⬅️ Chapter 06: File Filtering](chapter-06-file-filtering.md)** | **[Chapter 08: Custom Naming ➡️](chapter-08-custom-naming.md)**

</div>

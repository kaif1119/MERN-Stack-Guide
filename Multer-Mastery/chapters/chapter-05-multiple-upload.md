# 📘 Chapter 05: Multiple File Upload

> **Level:** 🟡 Intermediate | **Time:** 40 min | **Language:** Hindi + English

---

## 📑 Table of Contents

1. [Multiple Upload Kya Hai?](#1-multiple-upload-kya-hai)
2. [upload.array() — Same Field Se Multiple Files](#2-uploadarray)
3. [upload.fields() — Different Fields Se Files](#3-uploadfields)
4. [upload.any() — Koi Bhi Field](#4-uploadany)
5. [req.files vs req.file](#5-reqfiles-vs-reqfile)
6. [Complete Working Example](#6-complete-working-example)
7. [Best Practices](#7-best-practices)
8. [Interview Questions](#8-interview-questions)

---

## 1. Multiple Upload Kya Hai?

**Multiple File Upload** = ek hi request mein **ek se zyada files** upload karna.

> 🔑 **Real World Examples:**
> - Product ke multiple photos upload karna (front, back, side)
> - Documents ki gallery upload karna
> - Music album ke songs upload karna

### Upload Methods Comparison

```
upload.single('field')    → Exactly 1 file, 1 field
upload.array('field', n)  → Multiple files, SAME field
upload.fields([...])      → Multiple files, DIFFERENT fields
upload.any()              → Koi bhi files, koi bhi fields
upload.none()             → Sirf text, koi file nahi
```

---

## 2. upload.array() — Same Field Se Multiple Files

### Syntax

```javascript
upload.array(fieldname, maxCount)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `fieldname` | String | HTML input ka `name` |
| `maxCount` | Number | Maximum kitni files (optional) |

### Server Code

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads', { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB per file
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// upload.array('photos', 5):
//   'photos' → HTML input name="photos"
//   5        → Maximum 5 files
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/upload/gallery', upload.array('photos', 5), (req, res) => {
  
  // req.files → Array of file objects (array!)
  // req.file  → undefined (single ke liye hota hai)
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Koi file upload nahi ki!'
    });
  }
  
  // Har file ka URL generate karo
  const uploadedFiles = req.files.map(file => ({
    originalName: file.originalname,
    savedAs: file.filename,
    size: `${(file.size / 1024).toFixed(2)} KB`,
    type: file.mimetype,
    url: `http://localhost:3000/uploads/${file.filename}`
  }));
  
  res.json({
    success: true,
    message: `${req.files.length} files upload ho gayi! 🎉`,
    files: uploadedFiles
  });
});

app.use('/uploads', express.static('uploads'));
app.listen(3000, () => console.log('Server http://localhost:3000 pe chal raha hai'));
```

### HTML Form — Multiple Files

```html
<form action="/upload/gallery" method="POST" enctype="multipart/form-data">
  
  <!--
    multiple → Yeh attribute batata hai ki multiple files select ho sakti hain
    name="photos" → Multer mein upload.array('photos') se match karo
  -->
  <input type="file" name="photos" multiple accept="image/*">
  
  <button type="submit">Upload Gallery</button>
</form>
```

---

## 3. upload.fields() — Different Fields Se Files

### Kab Use Karo?

Jab form mein **alag alag name** ke file inputs hon:

```html
<!-- Different field names -->
<input type="file" name="avatar">      <!-- Profile photo -->
<input type="file" name="coverPhoto">  <!-- Cover photo -->
<input type="file" name="resume">      <!-- Resume PDF -->
```

### Syntax

```javascript
upload.fields([
  { name: 'fieldname1', maxCount: 1 },
  { name: 'fieldname2', maxCount: 5 },
  // ...
])
```

### Complete Example

```javascript
// upload.fields() ka use
app.post('/upload/profile', 
  
  // Array of field configs
  upload.fields([
    { name: 'avatar', maxCount: 1 },      // Sirf 1 avatar
    { name: 'coverPhoto', maxCount: 1 },  // Sirf 1 cover photo
    { name: 'portfolio', maxCount: 10 }   // Up to 10 portfolio images
  ]),
  
  (req, res) => {
    // upload.fields() ke saath req.files ek OBJECT hota hai
    // req.files = {
    //   avatar: [ { ...file info } ],
    //   coverPhoto: [ { ...file info } ],
    //   portfolio: [ { ...file info }, { ...file info }, ... ]
    // }
    
    const { avatar, coverPhoto, portfolio } = req.files;
    
    const response = {
      success: true,
      uploaded: {}
    };
    
    if (avatar && avatar[0]) {
      response.uploaded.avatar = {
        url: `/uploads/${avatar[0].filename}`,
        size: avatar[0].size
      };
    }
    
    if (coverPhoto && coverPhoto[0]) {
      response.uploaded.coverPhoto = {
        url: `/uploads/${coverPhoto[0].filename}`,
        size: coverPhoto[0].size
      };
    }
    
    if (portfolio && portfolio.length > 0) {
      response.uploaded.portfolio = portfolio.map(f => ({
        url: `/uploads/${f.filename}`,
        size: f.size
      }));
    }
    
    res.json(response);
  }
);
```

### HTML Form

```html
<form action="/upload/profile" method="POST" enctype="multipart/form-data">
  
  <label>Profile Photo:</label>
  <input type="file" name="avatar" accept="image/*">
  
  <label>Cover Photo:</label>
  <input type="file" name="coverPhoto" accept="image/*">
  
  <label>Portfolio Images (max 10):</label>
  <input type="file" name="portfolio" multiple accept="image/*">
  
  <button type="submit">Update Profile</button>
</form>
```

---

## 4. upload.any() — Koi Bhi Field

### Warning ⚠️

```
upload.any() use karne se pehle soch lo!
- Koi bhi field name se file accept karega
- Security risk ho sakta hai
- Use karo sirf jab aap fields control nahi kar sakte
```

### Syntax

```javascript
app.post('/upload', upload.any(), (req, res) => {
  // req.files → Array of all files from any field
  req.files.forEach(file => {
    console.log(`Field: ${file.fieldname}, File: ${file.originalname}`);
  });
  res.json({ files: req.files });
});
```

---

## 5. req.files vs req.file

### Comparison Table

| Property | Method | Type | Description |
|----------|--------|------|-------------|
| `req.file` | `upload.single()` | Object | Sirf ek file ka info |
| `req.files` | `upload.array()` | Array | Files ka array |
| `req.files` | `upload.fields()` | Object | Field name → array mapping |
| `req.files` | `upload.any()` | Array | Saari files ka array |

### Visual

```
upload.single('avatar')
req.file = { fieldname, originalname, ... }  ← Single Object

upload.array('photos', 5)
req.files = [
  { fieldname, originalname, ... },  ← Array Item 1
  { fieldname, originalname, ... },  ← Array Item 2
]

upload.fields([{name:'avatar'}, {name:'gallery'}])
req.files = {
  avatar: [ { fieldname, originalname, ... } ],      ← Key: field name
  gallery: [ { ... }, { ... }, { ... } ]             ← Multiple files
}
```

---

## 6. Complete Working Example

```javascript
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Product Upload Example — Multiple images for a product
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

// Folders ensure karo
['uploads/products', 'uploads/thumbnails'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Field ke hisaab se folder choose karo
    if (file.fieldname === 'thumbnail') {
      cb(null, 'uploads/thumbnails/');
    } else {
      cb(null, 'uploads/products/');
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${timestamp}${ext}`);
  }
});

// File filter — sirf images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sirf image files allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Product upload route
app.post('/products',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },    // Main product image
    { name: 'gallery', maxCount: 8 }        // Gallery images
  ]),
  (req, res) => {
    const { name, price, description } = req.body;
    const { thumbnail, gallery } = req.files || {};
    
    const product = {
      name,
      price: parseFloat(price),
      description,
      thumbnail: thumbnail ? `/uploads/thumbnails/${thumbnail[0].filename}` : null,
      gallery: gallery ? gallery.map(f => `/uploads/products/${f.filename}`) : []
    };
    
    // Normally yahan database mein save karte
    res.json({
      success: true,
      message: 'Product create ho gaya!',
      product
    });
  }
);

// Error handler
app.use((err, req, res, next) => {
  res.status(400).json({ success: false, error: err.message });
});

app.use('/uploads', express.static('uploads'));
app.listen(3000, () => console.log('Product server http://localhost:3000 pe chal raha hai'));
```

---

## 7. Best Practices

```
✅ upload.array() mein hamesha maxCount set karo
✅ upload.fields() use karo jab fields clear ho
✅ upload.any() se bachao production mein
✅ Har file ka size check karo (per file limit)
✅ Total file count limit lagao
✅ Sab files process karo loop mein (req.files.forEach)
✅ Partial uploads handle karo (kuch files fail hone pe)
```

---

## 8. Interview Questions

**Q1: upload.array() aur upload.fields() mein kya fark hai?**
> `upload.array('photos', 5)` — same field name se multiple files. `req.files` array hota hai.
> `upload.fields([...])` — different fields se files. `req.files` object hota hai jahan keys field names hoti hain.

**Q2: req.files kab array hota hai aur kab object?**
> `upload.array()` ya `upload.any()` ke baad Array. `upload.fields()` ke baad Object (key = fieldname).

**Q3: Multiple files upload ke liye HTML mein kya attribute chahiye?**
> `multiple` attribute: `<input type="file" name="photos" multiple>`

**Q4: Agar user se zyada files bheje toh kya hoga?**
> Multer `LIMIT_UNEXPECTED_FILE` error throw karega maxCount exceed hone pe.

**Q5: upload.none() kab use karte hain?**
> Jab route mein sirf text form data accept karna ho, koi file nahi. Multer multipart parse karega par file mile toh error dega.

---

<div align="center">

**[⬅️ Chapter 04: Single Upload](chapter-04-single-upload.md)** | **[Chapter 06: File Filtering ➡️](chapter-06-file-filtering.md)**

</div>

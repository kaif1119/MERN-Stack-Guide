# ⚡ Multer Complete Cheat Sheet

> *Ek page mein sab kuch — Quick Reference Guide*

---

## 📦 Installation

```bash
npm install multer              # Core package
npm install multer uuid         # + UUID for filenames
npm install multer sharp        # + Image processing
npm install multer-storage-cloudinary cloudinary  # + Cloudinary
npm install multer-s3 @aws-sdk/client-s3          # + AWS S3
```

---

## ⚙️ Basic Setup

```javascript
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// 1. Storage configure karo
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

// 2. File filter
const fileFilter = (req, file, cb) => {
  file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only!'), false);
};

// 3. Upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
```

---

## 🎯 Upload Methods

| Method | HTML | req Property | Use Case |
|--------|------|-------------|---------|
| `upload.single('field')` | `<input name="field">` | `req.file` | 1 file |
| `upload.array('field', n)` | `<input name="field" multiple>` | `req.files[]` | n files, same field |
| `upload.fields([{name, maxCount}])` | Multiple inputs | `req.files.field[]` | Different fields |
| `upload.any()` | Any | `req.files[]` | Any field (⚠️ insecure) |
| `upload.none()` | No file | req.body only | Text only |

---

## 📋 req.file Properties

```javascript
req.file = {
  fieldname:    'avatar',           // HTML input name
  originalname: 'photo.jpg',        // User ka original naam
  encoding:     '7bit',             // File encoding
  mimetype:     'image/jpeg',       // MIME type ← validation ke liye
  destination:  'uploads/',         // Folder (diskStorage)
  filename:     '1234567890.jpg',   // Saved naam (diskStorage)
  path:         'uploads/1234567.jpg', // Full path (diskStorage)
  buffer:       <Buffer...>,        // Actual data (memoryStorage only!)
  size:         102400              // Bytes mein
}
```

---

## 💾 Storage Engines

```javascript
// DISK STORAGE (permanent)
const disk = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

// MEMORY STORAGE (RAM, for cloud upload / processing)
const memory = multer.memoryStorage();

// CLOUDINARY STORAGE
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloud = new CloudinaryStorage({
  cloudinary: cloudinaryInstance,
  params: { folder: 'uploads', allowed_formats: ['jpg', 'png'] }
});
```

---

## 🔍 File Filter Patterns

```javascript
// Images only
const imageFilter = (req, f, cb) =>
  f.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only!'), false);

// Specific types
const docFilter = (req, f, cb) =>
  ['application/pdf', 'application/msword'].includes(f.mimetype)
    ? cb(null, true)
    : cb(new Error('PDF/DOC only!'), false);

// Extension + MIME (more secure)
const strictFilter = (req, f, cb) => {
  const ext = path.extname(f.originalname).toLowerCase();
  const mime = f.mimetype;
  const ok = ['.jpg','.png'].includes(ext) && mime.startsWith('image/');
  ok ? cb(null, true) : cb(new Error('Invalid file!'), false);
};
```

---

## 📏 Limits Reference

```javascript
limits: {
  fieldNameSize: 100,            // Field name max bytes (default: 100)
  fieldSize:     1024 * 1024,    // Non-file field max size (default: 1MB)
  fields:        10,             // Max non-file fields (default: ∞)
  fileSize:      5 * 1024 * 1024,// Per file max size (default: ∞) ← SET THIS!
  files:         5,              // Max files per request (default: ∞)
  parts:         15,             // Max parts total (default: ∞)
  headerPairs:   2000            // Max header pairs (default: 2000)
}
```

---

## ❌ Error Handling

```javascript
// Pattern 1: Callback (recommended for per-route control)
app.post('/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Too large!' });
    if (err) return res.status(400).json({ error: err.message });
    res.json({ file: req.file });
  });
});

// Pattern 2: Global error middleware
app.use((err, req, res, next) => {
  const codes = {
    LIMIT_FILE_SIZE:      [413, 'File too large!'],
    LIMIT_FILE_COUNT:     [400, 'Too many files!'],
    LIMIT_UNEXPECTED_FILE:[400, `Unexpected field: ${err.field}`],
  };
  const [status, msg] = codes[err.code] || [400, err.message];
  res.status(status).json({ success: false, error: msg });
});
```

---

## 🔐 Security Checklist

```
✅ File size limit lagao (limits.fileSize)
✅ File count limit lagao (limits.files)  
✅ MIME type validate karo (fileFilter)
✅ Extension validate karo (path.extname)
✅ Magic number check karo (file-type package)
✅ Random/UUID filename use karo (path traversal prevent)
✅ Rate limiting lagao (express-rate-limit)
✅ EXIF strip karo (Sharp: .withMetadata(false))
✅ Content-Disposition: attachment header
✅ Production mein cloud storage use karo
```

---

## 🖼️ Image Processing (Sharp)

```javascript
const sharp = require('sharp');

// Resize + Convert + Compress
await sharp(req.file.buffer)
  .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 80 })
  .withMetadata(false)  // EXIF strip
  .toFile('uploads/output.webp');

// Multiple sizes
const sizes = [{ w: 150, n: 'thumb' }, { w: 400, n: 'medium' }, { w: 800, n: 'large' }];
await Promise.all(sizes.map(({ w, n }) =>
  sharp(req.file.buffer).resize(w, w, { fit: 'cover' }).webp({ quality: 80 })
    .toFile(`uploads/${n}-${Date.now()}.webp`)
));
```

---

## ☁️ Cloudinary Upload (memoryStorage)

```javascript
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;

const uploadToCloud = (buffer) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: 'uploads', transformation: [{ width: 800, crop: 'limit' }] },
    (err, result) => err ? reject(err) : resolve(result)
  );
  streamifier.createReadStream(buffer).pipe(stream);
});

// In route:
const result = await uploadToCloud(req.file.buffer);
// result.secure_url = Cloudinary URL
```

---

## 🏗️ HTML Form

```html
<!-- Single file -->
<form method="POST" action="/upload" enctype="multipart/form-data">
  <input type="file" name="avatar" accept="image/*">
  <button>Upload</button>
</form>

<!-- Multiple files -->
<form method="POST" action="/upload/gallery" enctype="multipart/form-data">
  <input type="file" name="photos" multiple accept="image/*">
  <button>Upload Gallery</button>
</form>
```

---

## 🚀 Fetch Upload (JavaScript)

```javascript
// Single file
const formData = new FormData();
formData.append('avatar', fileInput.files[0]);
const res = await fetch('/upload', { method: 'POST', body: formData });

// Multiple files
const formData = new FormData();
[...fileInput.files].forEach(f => formData.append('photos', f));
const res = await fetch('/upload/gallery', { method: 'POST', body: formData });

// With text fields
formData.append('username', 'john');
formData.append('photo', file);
```

---

## 🧪 Testing (Supertest)

```javascript
const request = require('supertest');

// Single file upload test
const res = await request(app)
  .post('/upload')
  .attach('file', './test/fixtures/image.jpg');

// With text fields
const res = await request(app)
  .post('/upload')
  .field('username', 'testuser')
  .attach('avatar', './test/fixtures/image.jpg');

// In-memory buffer
const buffer = Buffer.from('fake image');
const res = await request(app)
  .post('/upload')
  .attach('file', buffer, { filename: 'test.jpg', contentType: 'image/jpeg' });
```

---

## 🗂️ MIME Types Quick Reference

| Extension | MIME Type |
|-----------|-----------|
| .jpg/.jpeg | `image/jpeg` |
| .png | `image/png` |
| .gif | `image/gif` |
| .webp | `image/webp` |
| .svg | `image/svg+xml` |
| .pdf | `application/pdf` |
| .doc | `application/msword` |
| .docx | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| .mp4 | `video/mp4` |
| .mp3 | `audio/mpeg` |
| .zip | `application/zip` |
| .csv | `text/csv` |
| .txt | `text/plain` |

---

## ⚡ Common Error Codes

| Code | Problem | Fix |
|------|---------|-----|
| `LIMIT_FILE_SIZE` | File too large | Increase limit ya smaller file bhejo |
| `LIMIT_FILE_COUNT` | Too many files | Reduce file count |
| `LIMIT_UNEXPECTED_FILE` | Wrong field name | Match HTML name & upload.single() |
| `LIMIT_FIELD_COUNT` | Too many text fields | Reduce form fields |
| `ENOENT` | Folder not found | `fs.mkdirSync(dir, {recursive:true})` |
| `INVALID_FILE_TYPE` | Wrong file type | Check fileFilter |

---

## 📌 Memory Trick (MULTER)

```
M — Middleware hai (Express ke saath use hota hai)
U — Uploads handle karta hai (multipart/form-data)
L — Limits set karo (fileSize, files)
T — Type validate karo (fileFilter, MIME)
E — Errors handle karo (MulterError)
R — req.file/req.files provide karta hai
```

---

*"Yeh cheat sheet apne desk pe chipkao — Interview mein kaam aayegi!"* 📌

**[⬅️ Back to README](../README.md)**

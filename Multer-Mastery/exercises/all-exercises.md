# 💪 Multer Practice Exercises — All Levels

> **Language:** Hindi + English | *Practice karo, master bano!*

---

# 🟢 BEGINNER EXERCISES (1–15)

---

## Exercise 1: Basic Setup ⭐

**Task:** Ek simple Node.js + Express server banao jisme:
- `GET /` pe ek HTML form serve ho
- Form mein ek file input ho (name="document")
- `POST /upload` pe Multer se file receive karo
- Console mein file info print karo
- Response mein filename aur size bhejo

**Requirements:**
```
- express
- multer
- uploads/ folder mein save
- Success message response mein
```

<details>
<summary>💡 Solution Dekho</summary>

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

app.get('/', (req, res) => {
  res.send(`
    <form method="POST" action="/upload" enctype="multipart/form-data">
      <input type="file" name="document">
      <button>Upload</button>
    </form>
  `);
});

app.post('/upload', upload.single('document'), (req, res) => {
  console.log('File info:', req.file);
  
  if (!req.file) return res.status(400).json({ error: 'No file!' });
  
  res.json({
    success: true,
    filename: req.file.filename,
    size: req.file.size + ' bytes'
  });
});

app.listen(3000, () => console.log('Server http://localhost:3000'));
```

</details>

---

## Exercise 2: Multiple Files ⭐⭐

**Task:** Gallery upload system banao:
- Maximum 5 images ek saath upload
- Sirf JPEG aur PNG accept karo
- Har file ka naam, size, aur type response mein bhejo

<details>
<summary>💡 Solution Dekho</summary>

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('JPEG/PNG only!'), false);
  },
  limits: { files: 5 }
});

app.post('/upload/gallery', upload.array('photos', 5), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ error: 'No files!' });
  
  res.json({
    success: true,
    count: req.files.length,
    files: req.files.map(f => ({
      name: f.originalname,
      size: `${(f.size / 1024).toFixed(2)} KB`,
      type: f.mimetype
    }))
  });
});

app.use((err, req, res, next) => res.status(400).json({ error: err.message }));
app.listen(3000);
```

</details>

---

## Exercise 3: File Type Validation ⭐⭐

**Task:** Ek document upload endpoint banao jo sirf PDF files accept kare. Non-PDF files ke liye proper error message bhejo.

---

## Exercise 4: File Size Limit ⭐⭐

**Task:** Profile picture upload banao jisme:
- Maximum file size: 2MB
- Sirf images
- Agar size exceed ho → custom error message "Aapki image 2MB se badi hai! Chhoti image use karo."

---

## Exercise 5: Different Upload Folders ⭐⭐⭐

**Task:** Ek server banao jisme:
- Images → `uploads/images/`
- PDFs → `uploads/documents/`
- Videos → `uploads/videos/`
- File type ke hisaab se automatically correct folder mein save ho

<details>
<summary>💡 Hint</summary>

```javascript
destination: (req, file, cb) => {
  let dir = 'uploads/others/';
  if (file.mimetype.startsWith('image/')) dir = 'uploads/images/';
  else if (file.mimetype === 'application/pdf') dir = 'uploads/documents/';
  else if (file.mimetype.startsWith('video/')) dir = 'uploads/videos/';
  
  fs.mkdirSync(dir, { recursive: true });
  cb(null, dir);
}
```

</details>

---

## Exercise 6: Custom Filename with User Info ⭐⭐⭐

**Task:** Upload endpoint banao jisme filename pattern ho:
`userId_timestamp_originalname.ext`

Form mein ek text field `userId` bhi hoga.

---

## Exercise 7: req.file Properties Display ⭐

**Task:** Ek upload route banao jo `req.file` ki saari properties nicely formatted HTML mein display kare as response.

---

## Exercise 8: Uploads Folder Auto-Create ⭐⭐

**Task:** Server mein ek function banao `ensureDir(path)` jo:
- Folder exist kare toh kuch mat karo
- Folder nahi hai toh banao (nested bhi support karo)
- Multer ke saath use karo

---

## Exercise 9: File List API ⭐⭐

**Task:** Ek `GET /files` endpoint banao jo:
- `uploads/` folder mein saari files list kare
- Har file ka: naam, size, modified date
- JSON format mein return kare

---

## Exercise 10: Delete Upload ⭐⭐

**Task:** `DELETE /files/:filename` endpoint banao jo:
- File `uploads/` se delete kare
- File exist nahi toh 404 error
- Security: path traversal prevent karo

---

## Exercise 11: memoryStorage Practice ⭐⭐⭐

**Task:** memoryStorage use karo aur:
- File upload karo
- `req.file.buffer` se file size verify karo
- File ko manually `fs.writeFileSync` se save karo custom path pe

---

## Exercise 12: Form Data + File ⭐⭐

**Task:** Contact form banao jisme:
- Name (text field)
- Email (text field)
- Message (text field)
- Attachment (file, optional)

Server pe saara data + file info response mein bhejo.

---

## Exercise 13: HTML Preview ⭐⭐⭐

**Task:** Ek page banao jisme:
- File select karo
- Preview dikhao (JavaScript se, before upload)
- Upload button click karo
- After upload, server ka URL use karke image show karo

---

## Exercise 14: Error Message Translation ⭐⭐

**Task:** Multer ke har error code ke liye Hindi mein messages banao. Ek object create karo:
```javascript
const errorMessages = {
  LIMIT_FILE_SIZE: '...',
  LIMIT_FILE_COUNT: '...',
  // etc.
};
```

---

## Exercise 15: Upload Counter ⭐⭐⭐

**Task:** Ek in-memory counter rakho:
- Kitni files successfully upload huin
- Kitne errors aaye
- `GET /stats` pe yeh info bhejo

---

# 🟡 INTERMEDIATE EXERCISES (16–30)

---

## Exercise 16: Factory Function ⭐⭐⭐

**Task:** Ek factory function banao `createUploader(config)` jo:
```javascript
const imageUploader = createUploader({
  type: 'image',
  maxSize: 5,    // MB
  maxFiles: 10
});

const pdfUploader = createUploader({
  type: 'pdf',
  maxSize: 50,
  maxFiles: 1
});
```
Alag alag routes mein use karo.

---

## Exercise 17: Cloudinary Integration ⭐⭐⭐⭐

**Task:** memoryStorage + Cloudinary ke saath:
- Image upload karo
- Cloudinary pe store karo
- URL response mein bhejo

(Cloudinary free account create karo aur API keys use karo)

---

## Exercise 18: Image Resize ⭐⭐⭐⭐

**Task:** Sharp ke saath:
- Image upload karo (memoryStorage)
- 3 sizes generate karo: thumb (150px), medium (400px), large (800px)
- Sabhi sizes disk pe save karo
- Response mein sabhi URLs bhejo

---

## Exercise 19: File Deduplication ⭐⭐⭐⭐

**Task:** SHA-256 hash se file deduplication:
- File upload karo
- Hash compute karo
- Ek in-memory Map mein hash → filename store karo
- Agar same hash wali file already hai → "Already exists, URL: ..." response bhejo
- Nahi hai → save karo aur URL bhejo

---

## Exercise 20: Rate Limiting ⭐⭐⭐

**Task:** `express-rate-limit` ke saath:
- Upload route pe: 5 uploads per minute per IP
- Limit exceed pe: custom error message Hindi mein
- `X-RateLimit-*` headers include karo

---

## Exercise 21: Progress Tracking ⭐⭐⭐⭐

**Task:** XMLHttpRequest ya fetch ke saath:
- Frontend mein progress bar dikhao
- Percentage update karo real-time
- Upload complete hone pe file info dikhao

---

## Exercise 22: Authentication Guard ⭐⭐⭐⭐

**Task:** Simple JWT middleware banao:
- `/upload` route protect karo
- Token nahi → 401 Unauthorized
- Invalid token → 401
- Valid token → upload allow karo

---

## Exercise 23: Soft Delete ⭐⭐⭐

**Task:** Files ko actual delete mat karo, sirf mark karo:
- `deletedFiles` array maintain karo
- DELETE endpoint → file ko array mein add karo
- GET /files → deleted files ko filter out karo

---

## Exercise 24: Multi-tenant Upload ⭐⭐⭐⭐

**Task:** Header `x-user-id` se user ID lo aur:
- Files `uploads/{userId}/` mein save karo
- GET /my-files → sirf us user ki files

---

## Exercise 25: Chunked Upload ⭐⭐⭐⭐⭐

**Task:** Large file chunked upload implement karo:
- Client side: File ko 1MB chunks mein divide karo
- Har chunk separate request mein bhejo
- Server: chunks collect karo, sab aa gaye toh file assemble karo
- Progress track karo

---

## Exercise 26: CSV Import ⭐⭐⭐

**Task:** CSV file upload karke data import karo:
- Multer se CSV receive karo
- `csv-parser` se parse karo
- Data validate karo (required fields check)
- Valid data → JSON format mein response
- Invalid rows → error list

---

## Exercise 27: Zip Upload ⭐⭐⭐⭐

**Task:** ZIP file upload karke extract karo:
- Multer se ZIP receive karo
- `unzipper` package se extract karo
- Extracted files list response mein bhejo

---

## Exercise 28: Image Watermark ⭐⭐⭐⭐

**Task:** Sharp ke saath:
- Image upload karo
- Watermark text add karo (company naam)
- Watermarked image save karo
- URL bhejo

---

## Exercise 29: EXIF Data Extract ⭐⭐⭐

**Task:** Image upload karke EXIF data extract karo:
- `exifr` package use karo
- GPS coordinates, camera model, date/time extract karo
- Response mein bhejo (agar available hai)

---

## Exercise 30: S3 Upload ⭐⭐⭐⭐⭐

**Task:** AWS S3 ke saath:
- Local S3 (LocalStack) ya actual AWS
- File upload karo
- S3 URL response mein bhejo
- Signed URL generate karo (1 hour valid)

---

# 🔴 ADVANCED EXERCISES (31–40)

---

## Exercise 31: Bull Queue + Image Processing

**Task:** Bull queue ke saath background image processing:
- Image upload immediately acknowledge karo
- Processing queue mein daalo
- Worker: resize + compress
- WebSocket se frontend ko notify karo jab done

---

## Exercise 32: Virus Scanner Integration

**Task:** ClamAV integration (ya mock):
- File upload karo
- Virus scan karo
- Infected → delete + error
- Clean → save + proceed

---

## Exercise 33: End-to-End Encrypted Upload

**Task:** File encrypt karke upload aur decrypt karke serve karo:
- AES-256-CBC encryption
- IV (Initialization Vector) random generate karo
- Encrypted file save karo
- Download pe decrypt karke serve karo

---

## Exercise 34: Resumable Upload (TUS Protocol)

**Task:** `@tus-node/server` use karke:
- Resumable uploads implement karo
- 50% pe connection cut karo (simulate)
- Resume karo same file se
- Verify ki complete file same hai

---

## Exercise 35: Complete File Manager API

**Task:** Full CRUD REST API:
```
POST   /files          → Upload
GET    /files          → List (pagination, filter)
GET    /files/:id      → Single file details
PUT    /files/:id      → Update metadata
DELETE /files/:id      → Soft delete
GET    /files/:id/download → Streaming download
```

Full tests likhna zaroori hai (Jest + Supertest).

---

## Challenge Problem: Production File Server 🏆

**Combine everything:**
1. JWT Auth + Role-based access (admin/user)
2. Rate limiting per user + per IP
3. Magic number validation
4. Cloud storage (Cloudinary/S3)
5. MongoDB metadata
6. Redis caching for file lists
7. Virus scanning (mock acceptable)
8. EXIF strip for privacy
9. Auto-generate thumbnails (3 sizes)
10. WebSocket progress updates
11. Complete error handling
12. Swagger documentation
13. Jest tests (>80% coverage)
14. Docker compose

**Yeh complete kar liya toh tum production-ready developer ho!** 🎉

---

<div align="center">

**[⬅️ Back to README](../README.md)** | **[Cheat Sheet ➡️](../cheatsheets/multer-cheatsheet.md)**

---

*"Har exercise ek kadam aage — ruko mat!"* 💪

</div>

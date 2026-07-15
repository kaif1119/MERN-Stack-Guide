# 🔥 Multer Interview Questions — Intermediate + Advanced (200 Questions)

> **Level:** 🟡 Intermediate + 🔴 Advanced | **Total:** 200 Questions

---

# INTERMEDIATE QUESTIONS (Q1–Q100)

## Section 1: Error Handling (Q1–Q25)

**Q1. Multer error middleware ka signature kya hai?**
```javascript
app.use((err, req, res, next) => { /* 4 params zaroori hain! */ });
```
> **Explanation:** Express mein error middleware exactly 4 parameters leti hai. 3 parameters wala normal middleware hai, 4 parameters wala error middleware.

**Q2. `MulterError` class ka `code` property kaunse values le sakta hai?**
> `LIMIT_FILE_SIZE`, `LIMIT_FILE_COUNT`, `LIMIT_FIELD_COUNT`, `LIMIT_PART_COUNT`, `LIMIT_FIELD_KEY`, `LIMIT_FIELD_VALUE`, `LIMIT_UNEXPECTED_FILE`

**Q3. `LIMIT_UNEXPECTED_FILE` error kab aata hai?**
> Jab client aisa file field bheje jo Multer configuration mein defined nahi hai. Example: config mein `upload.single('avatar')` hai par request mein `photo` field se file aayi.

**Q4. HTTP status code `413` kab use karte hain?**
> `413 Payload Too Large` — jab file size limit exceed ho (`LIMIT_FILE_SIZE` error).

**Q5. fileFilter mein error aur `cb(null, false)` mein kya fark hai behavior mein?**
> `cb(null, false)` — file silently reject hoti hai, error middleware nahi chalti.
> `cb(new Error('msg'))` — error middleware chalti hai, error response bheja jaata hai.

**Q6. Multer middleware function ke roop mein use karne ka benefit kya hai?**
```javascript
app.post('/upload', (req, res) => {
  upload.single('file')(req, res, (err) => { /* err handle karo */ });
});
```
> Individual route level pe granular error handling possible hai bina global middleware ke.

**Q7. `async/await` ke saath Multer kaise use karte hain?**
```javascript
const multerPromise = (middleware) => (req, res) =>
  new Promise((resolve, reject) =>
    middleware(req, res, (err) => (err ? reject(err) : resolve()))
  );
```

**Q8. Partial upload failure handle kaise karte hain (kuch files succeed, kuch fail)?**
> `upload.array()` ke baad agar fileFilter ne kuch files reject kiye, woh `req.files` mein nahi hongi — sirf accepted files hongi. Separate tracking mechanism banana padega.

**Q9. Multer error ke baad partially uploaded files cleanup kaise karte hain?**
> Error middleware mein `req.files` check karo aur `fs.unlink()` se disk pe saved files delete karo.

**Q10. `err.field` property kab available hoti hai Multer error mein?**
> `LIMIT_UNEXPECTED_FILE` error mein — `err.field` woh field name batata hai jo unexpected tha.

**Q11. Express ki error middleware order mein kahan honi chahiye?**
> Sab routes ke baad, `app.listen()` se pehle — error middleware last mein.

**Q12. Custom error class Multer errors ke liye kaise banate hain?**
```javascript
class UploadError extends Error {
  constructor(message, code, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}
```

**Q13. `next(err)` call karna kab important hai?**
> Jab aap error forward karna chahte ho next error middleware ko. Global error handler ko trigger karta hai.

**Q14. Multer timeout errors handle kaise karte hain?**
> `limits.fieldSize` aur `limits.fileSize` set karo. Network timeout ke liye HTTP server ka `timeout` property set karo: `server.timeout = 60000`.

**Q15. `ENOENT` error Multer context mein kya matlab rakhta hai?**
> `uploads/` destination folder exist nahi karta. Solution: `fs.mkdirSync(dir, { recursive: true })` pehle run karo.

---

## Section 2: Storage Engines Deep Dive (Q16–Q40)

**Q16. Custom storage engine banane ke liye kaunse methods implement karne hote hain?**
> `_handleFile(req, file, cb)` aur `_removeFile(req, file, cb)` — dono required hain.

**Q17. `_handleFile` mein `file.stream` kya hai?**
> Incoming file data ka Node.js Readable Stream — ise kisi bhi destination pe pipe kar sakte hain.

**Q18. multer-storage-cloudinary kya hai?**
> Ek third-party package jo Multer ka Cloudinary-compatible storage engine provide karta hai. `npm install multer-storage-cloudinary`.

**Q19. `multer-gridfs-storage` kya use case solve karta hai?**
> MongoDB GridFS mein directly file store karta hai — large files (16MB+) jo MongoDB mein store karni hon.

**Q20. memoryStorage se Cloudinary pe upload karne ka efficient pattern kya hai?**
```javascript
const uploadStream = cloudinary.uploader.upload_stream(opts, cb);
streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
```

**Q21. diskStorage mein dynamic destination kaise set karte hain (file type based)?**
```javascript
destination: (req, file, cb) => {
  const dir = file.mimetype.startsWith('image/') ? 'uploads/images' : 'uploads/docs';
  fs.mkdirSync(dir, { recursive: true });
  cb(null, dir);
}
```

**Q22. `file.stream` kab available hota hai?**
> `_handleFile` callback mein — yahan file abhi stream mein aa rahi hai, disk pe nahi gayi.

**Q23. S3 multipart upload kya hai aur kab use karte hain?**
> AWS S3 ki feature jo large files (100MB+) ko chunks mein upload karta hai. `multer-s3` automatically handle karta hai.

**Q24. GridFS se file retrieve kaise karte hain?**
> GridFS bucket se readStream banao: `bucket.openDownloadStreamByName(filename)` aur response pe pipe karo.

**Q25. Storage engine mein `_removeFile` implement karna kyun important hai?**
> Jab Multer upload cancel karta hai ya rollback chahiye, yeh method call hota hai cleanup ke liye. Implement nahi kiya toh orphan files reh jaati hain.

---

## Section 3: File Validation Advanced (Q26–Q50)

**Q26. MIME type spoofing kya hai?**
> Attacker file ka actual MIME type change karke malicious file ko safe content type ke roop mein bhejta hai. Solution: extension + magic number validation.

**Q27. Magic number validation kya hai?**
> File ke actual bytes (header bytes) check karna. Har file type ke specific starting bytes hote hain. `file-type` npm package yeh karta hai.

**Q28. `file-type` package kaise use karte hain?**
```javascript
const { fileTypeFromBuffer } = require('file-type');
const type = await fileTypeFromBuffer(req.file.buffer);
// type = { ext: 'jpg', mime: 'image/jpeg' }
```

**Q29. Path traversal attack Multer mein kya hai aur kaise bachte hain?**
> Attacker filename `"../../../etc/passwd"` set kare toh file wrong location pe save ho. `path.basename()` se sirf filename lao, directory component remove karo.

**Q30. `path.basename()` path traversal se kaise bachata hai?**
```javascript
// Dangerous:
const filename = req.file.originalname; // '../../../etc/passwd'
// Safe:
const filename = path.basename(req.file.originalname); // 'passwd' (path removed)
```

**Q31. Null byte injection attack kya hai file uploads mein?**
> Filename `"image.jpg\0.php"` set karne se kuch systems `.php` file create karte hain. Solution: filename sanitize karo, null bytes remove karo.

**Q32. Image dimensions validate kaise karte hain (min/max width, height)?**
```javascript
const sharp = require('sharp');
const metadata = await sharp(req.file.buffer).metadata();
if (metadata.width < 100 || metadata.height < 100) {
  throw new Error('Image too small! Min 100x100 required.');
}
```

**Q33. ZIP bomb attack kya hai aur kaise bachate hain?**
> Bahut compressed file jo extract hone pe TBs of data ban jaye. Solution: file size limit + actual content check.

**Q34. Executable file upload risk kya hai?**
> Attacker `.php`, `.js`, `.sh` files upload kare jaise agar web server unhe execute kare toh remote code execution. Solution: strict file type validation + serve with `Content-Disposition: attachment`.

**Q35. Antivirus scanning file uploads ke liye kaise integrate karte hain?**
```javascript
const NodeClam = require('clamscan');
const clam = await new NodeClam().init({ clamdscan: { active: true } });
const { isInfected } = await clam.isInfected(req.file.path);
if (isInfected) { /* delete file, throw error */ }
```

**Q36. Rate limiting file uploads ke liye kyon zaroori hai?**
> DoS attacks prevent karo — attacker repeatedly large files upload karke server resources exhaust kar sakta hai.

**Q37. EXIF data file uploads mein kya problem create karta hai?**
> Images mein GPS location, device info, user info hoti hai EXIF mein — privacy leak. Solution: Sharp se EXIF strip karo: `.withMetadata(false)`.

**Q38. File validation ko middleware ke roop mein extract kaise karte hain?**
```javascript
const validateFile = (allowedTypes, maxSize) => (req, res, next) => {
  if (!req.file) return next(new Error('No file'));
  if (!allowedTypes.includes(req.file.mimetype)) return next(new Error('Invalid type'));
  if (req.file.size > maxSize) return next(new Error('Too large'));
  next();
};
app.post('/upload', upload.single('f'), validateFile(['image/jpeg'], 5MB), handler);
```

**Q39. Content-Security-Policy header file uploads ke liye kyon important hai?**
> Uploaded files ko serve karte time CSP header prevent karta hai malicious scripts se — agar attacker SVG with script upload kare toh browser execute nahi karega.

**Q40. SVG files specially dangerous kyun hain upload ke context mein?**
> SVG XML format hai aur JavaScript embed kar sakta hai. Browser mein render hone pe script execute ho sakta hai (XSS attack). Solution: SVG sanitize karo ya serve karo `Content-Disposition: attachment` ke saath.

---

## Section 4: Integration & Patterns (Q41–Q70)

**Q41. Multer aur JWT authentication saath kaise use karte hain?**
```javascript
// Order: JWT verify → Multer upload
app.post('/upload', 
  verifyJWT,           // Pehle auth check karo
  upload.single('file'), // Phir upload
  (req, res) => { /* req.user available! */ }
);
```

**Q42. User ID se file organize kaise karte hain?**
```javascript
destination: (req, file, cb) => {
  const dir = `uploads/${req.user.id}`;
  fs.mkdirSync(dir, { recursive: true });
  cb(null, dir);
}
```

**Q43. Multer ke saath MongoDB save pattern kya hai?**
```javascript
app.post('/upload', upload.single('avatar'), async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: `/uploads/${req.file.filename}` },  // Path save karo
    { new: true }
  );
  res.json({ success: true, user });
});
```

**Q44. File replace karne ka pattern kya hai (pehli file delete karo)?**
```javascript
const user = await User.findById(req.user.id);
if (user.avatar) {
  const oldPath = path.join('uploads', path.basename(user.avatar));
  if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
}
// Phir naya file save karo
```

**Q45. Multer ke saath transactions (rollback) kaise handle karte hain?**
```javascript
// Upload → DB save → agar DB fail → file delete
const filePath = req.file.path;
try {
  await User.create({ ...data, avatar: filePath });
  res.json({ success: true });
} catch (dbErr) {
  fs.unlinkSync(filePath);  // Rollback
  throw dbErr;
}
```

**Q46. Express Router mein Multer kaise use karte hain?**
```javascript
// routes/upload.route.js
const router = express.Router();
const upload = require('../config/multer');

router.post('/', upload.single('file'), uploadController.upload);
module.exports = router;

// app.js
app.use('/upload', uploadRouter);
```

**Q47. MVC pattern mein Multer kahan fit hota hai?**
> Route (Multer middleware) → Controller (req.file process) → Service (DB save, cloud upload) → Response.

**Q48. File upload ke baad email notification kaise bhejte hain?**
```javascript
app.post('/upload', upload.single('doc'), async (req, res) => {
  // 1. File save (already done by Multer)
  // 2. DB update
  await Document.create({ path: req.file.path, userId: req.user.id });
  // 3. Email bhejo
  await emailService.send({
    to: req.user.email,
    subject: 'Document uploaded',
    text: `Your file ${req.file.originalname} was uploaded successfully`
  });
  res.json({ success: true });
});
```

**Q49. Multiple file upload ke liye progress tracking backend pe kaise karte hain?**
> WebSocket ya Server-Sent Events use karo. Upload complete hone pe event emit karo.

**Q50. File upload ke baad thumbnail generate karne ka complete pattern?**
```javascript
// 1. Upload (memoryStorage)
// 2. Sharp se resize
// 3. Multiple sizes save
// 4. DB mein paths save
const sizes = { thumb: 150, medium: 400, large: 800 };
const paths = {};
for (const [name, size] of Object.entries(sizes)) {
  const filename = `${Date.now()}-${name}.webp`;
  await sharp(req.file.buffer).resize(size, size, { fit: 'cover' }).webp().toFile(`uploads/${filename}`);
  paths[name] = `/uploads/${filename}`;
}
```

---

## Section 5: Testing & Debugging (Q51–Q75)

**Q51. Multer routes ka testing kaise karte hain (Jest + Supertest)?**
```javascript
const request = require('supertest');
const path = require('path');

test('should upload file', async () => {
  const response = await request(app)
    .post('/upload')
    .attach('file', path.join(__dirname, 'fixtures/test-image.jpg'));
  
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
});
```

**Q52. `.attach()` method Supertest mein kya karta hai?**
> File attach karta hai request mein. Automatically `multipart/form-data` set karta hai.

**Q53. Multer debugging ke liye kaise log karte hain?**
```javascript
filename: (req, file, cb) => {
  console.log('Incoming file:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype
  });
  cb(null, Date.now() + path.extname(file.originalname));
}
```

**Q54. Postman se file upload kaise test karte hain?**
> Body → form-data → Key mein "file" type "File" select karo → Value mein file choose karo → POST bhejo.

**Q55. cURL se file upload command?**
```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@/path/to/file.jpg" \
  -F "username=testuser"
```

**Q56. Integration test mein mock uploads kaise karte hain?**
```javascript
// In-memory buffer se file banao (real file ki zaroorat nahi)
const buffer = Buffer.from('fake image content');
const response = await request(app)
  .post('/upload')
  .attach('file', buffer, { filename: 'test.jpg', contentType: 'image/jpeg' });
```

**Q57. File upload ka end-to-end test strategy kya hai?**
> 1. Valid file upload test, 2. Invalid type reject test, 3. Size exceed test, 4. Missing file test, 5. Multiple files test.

---

## Section 6: Performance & Scaling (Q76–Q100)

**Q76. Multer streaming vs buffering — difference?**
> `diskStorage` = streaming (disk pe direct write, low memory), `memoryStorage` = buffering (poori file RAM mein).

**Q77. Large file upload (500MB) ke liye best approach?**
> `diskStorage` use karo, chunked upload implement karo (client side), aur S3 multipart upload use karo.

**Q78. Production mein local disk storage kyun nahi use karte?**
> Multiple server instances hone pe ek server pe uploaded file doosre server pe accessible nahi hogi. Cloud storage (S3, GCS) sabhi instances accessible hai.

**Q79. CDN integration file uploads ke saath kaise karte hain?**
> Files → S3 → CloudFront (CDN). CloudFront URLs serve karo, S3 direct access nahi dete. CDN caching automatically hoti hai.

**Q80. File upload queue kab zaroorat hoti hai?**
> Jab file processing heavy hai (video transcoding, PDF generation) — immediately respond karo, background mein process karo.

**Q81. Bull queue ke saath file processing?**
```javascript
const imageQueue = new Bull('image-processing');

// Producer: Route mein
await imageQueue.add({ filePath: req.file.path, userId: req.user.id });
res.json({ success: true, message: 'Processing in background' });

// Consumer: Worker mein
imageQueue.process(async (job) => {
  await processImage(job.data.filePath);
});
```

**Q82. Horizontal scaling ke liye shared file system alternatives?**
> AWS S3, Google Cloud Storage, Azure Blob Storage, MinIO (self-hosted S3-compatible).

**Q83. File upload memory leak kaise prevent karte hain?**
> 1. memoryStorage large files ke liye avoid karo, 2. Processed temp files cleanup karo, 3. Request timeout set karo, 4. `limits` set karo.

**Q84. Concurrent uploads handle kaise karta hai Node.js?**
> Node.js event-driven async hai — multiple uploads simultaneously handle kar sakta hai bina blocking ke. Lekin CPU-intensive processing (Sharp) ke liye worker threads use karo.

**Q85. Worker threads image processing ke liye?**
```javascript
const { Worker } = require('worker_threads');

// Main thread mein:
const worker = new Worker('./imageProcessor.js', { workerData: { path: filePath } });
worker.on('message', (result) => { /* done */ });

// imageProcessor.js:
const { workerData, parentPort } = require('worker_threads');
sharp(workerData.path).resize(800).toFile('processed.jpg').then(() => parentPort.postMessage('done'));
```

---

# ADVANCED QUESTIONS (Q86–Q200)

**Q86. Multer internally Busboy ka kaise use karta hai?**
> Multer request ko Busboy instance se pipe karta hai. Busboy multipart data stream parse karta hai aur field/file events emit karta hai. Multer in events ko handle karke storage engine call karta hai.

**Q87. Multer source code mein request flow trace karo.**
> `multer()` call → middleware function return hota hai → request aane pe middleware execute → Busboy create → stream pipe → storage `_handleFile` → req populate → next().

**Q88. Express 5 ke saath Multer compatibility?**
> Express 5 async errors automatically handle karta hai. Multer errors bhi propagate ho sakti hain bina explicit next(err) ke (express 5 mein promise rejection automatic forward hoti hai).

**Q89. Multer v2 (upcoming) mein kya changes expect hain?**
> Complete rewrite, ES Modules support, better TypeScript integration, breaking API changes. `v1.x.x-lts` current stable hai.

**Q90. WebSocket ke through file upload kaise karte hain?**
> WebSocket binary frames support karta hai. Client side Binary data chunked bhejo, server side reconstruct karo. Alternative: Socket.io ke saath.

**Q91. Resumable upload kaise implement karte hain?**
> TUS protocol implement karo ya `tus-js-client` + `@tus-node/server` use karo. Client chunked upload karta hai, server state track karta hai.

**Q92. File deduplication kaise karte hain (same file dobara upload na ho)?**
```javascript
const crypto = require('crypto');
// File ka hash compute karo
const hash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
// DB mein check karo
const existing = await File.findOne({ hash });
if (existing) return res.json({ url: existing.url, deduplicated: true });
// Nahi mila → save karo naya
```

**Q93. Signed URLs S3 ke liye kaise generate karte hain?**
```javascript
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

const url = await getSignedUrl(s3Client, new GetObjectCommand({
  Bucket: 'my-bucket',
  Key: 'uploads/file.jpg'
}), { expiresIn: 3600 }); // 1 hour
```

**Q94. File encryption at rest kaise implement karte hain?**
```javascript
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

// Encrypt before save
const cipher = crypto.createCipheriv(algorithm, key, iv);
const encrypted = Buffer.concat([cipher.update(req.file.buffer), cipher.final()]);
// Save encrypted buffer

// Decrypt when serving
const decipher = crypto.createDecipheriv(algorithm, key, iv);
const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
```

**Q95. Streaming downloads (large files) serve kaise karte hain?**
```javascript
app.get('/download/:filename', (req, res) => {
  const filePath = path.join('uploads', req.params.filename);
  const stat = fs.statSync(filePath);
  
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
  
  // Stream karo, poora file memory mein mat lo
  fs.createReadStream(filePath).pipe(res);
});
```

**Q96. Range requests (video streaming) kaise handle karte hain?**
```javascript
app.get('/video/:file', (req, res) => {
  const filePath = path.join('uploads', req.params.file);
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  if (range) {
    const [start, end] = range.replace('bytes=', '').split('-').map(Number);
    const chunkEnd = end || Math.min(start + 1024 * 1024, fileSize - 1);
    
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${chunkEnd}/${fileSize}`,
      'Content-Length': chunkEnd - start + 1,
      'Content-Type': 'video/mp4'
    });
    
    fs.createReadStream(filePath, { start, end: chunkEnd }).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': 'video/mp4' });
    fs.createReadStream(filePath).pipe(res);
  }
});
```

**Q97. Microservices architecture mein file upload kaise handle karte hain?**
> 1. Upload Service — sirf file receive aur cloud pe store karo, URL return karo
> 2. Other services — URL use karte hain, actual file access nahi
> Message queue se notify karo ki file ready hai.

**Q98. File upload monitoring aur alerting kaise set up karte hain?**
> 1. Upload success/failure rates log karo, 2. File sizes track karo, 3. Storage usage monitor karo, 4. Slow uploads alert karo (> 30s), 5. Error rate threshold pe alarm.

**Q99. Zero-downtime deployment mein file uploads kaise handle karte hain?**
> Cloud storage use karo (S3) — files server-specific nahi hoti. Load balancer sticky sessions ya shared storage ensure karo.

**Q100. Multer ka future — v2 mein expected breaking changes?**
> ES Module support, new storage API, better error types, deprecated options removal. Migration guide follow karna padega.

---

# SCENARIO-BASED QUESTIONS (Q101–Q150)

**Q101. SCENARIO: User profile update karte time naya avatar upload karna hai, purana delete karna hai.**
```javascript
// 1. User dhundo
const user = await User.findById(userId);

// 2. Purana file delete karo (agar hai)
if (user.avatarPath) {
  const fullPath = path.join(__dirname, 'uploads', path.basename(user.avatarPath));
  if (fs.existsSync(fullPath)) await fs.promises.unlink(fullPath);
}

// 3. Naya save karo
user.avatarPath = req.file.path;
await user.save();
```

**Q102. SCENARIO: E-commerce product mein main image aur 5 gallery images ek saath upload karni hain.**
```javascript
upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'gallery', maxCount: 5 }
])
```

**Q103. SCENARIO: CSV file upload karna hai aur immediately data import karna hai.**
```javascript
const csv = require('csv-parser');
const results = [];
fs.createReadStream(req.file.path)
  .pipe(csv())
  .on('data', (row) => results.push(row))
  .on('end', async () => {
    await Model.insertMany(results);
    fs.unlinkSync(req.file.path); // Cleanup
    res.json({ success: true, imported: results.length });
  });
```

**Q104. SCENARIO: File upload progress real-time browser mein dikhani hai.**
> Server-Sent Events ya WebSocket use karo. Multer streaming events listen karo ya `busboy` directly use karo for byte counting.

**Q105. SCENARIO: User banned hai — upload block karna hai middleware mein.**
```javascript
const checkBanned = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (user.isBanned) return res.status(403).json({ error: 'Account banned' });
  next();
};
app.post('/upload', authMiddleware, checkBanned, upload.single('file'), handler);
```

**Q106. SCENARIO: File upload ke baad virus scan karna hai — synchronous flow mein.**
```javascript
const NodeClam = require('clamscan');
const clam = await new NodeClam().init();

// After upload, before response:
const { isInfected, viruses } = await clam.isInfected(req.file.path);
if (isInfected) {
  await fs.promises.unlink(req.file.path);
  return res.status(400).json({ error: `Malicious file detected: ${viruses}` });
}
```

**Q107. SCENARIO: Same file ko 3 different sizes mein process karke 3 different S3 buckets mein save karna hai.**
```javascript
const sizes = [
  { width: 150, suffix: 'thumb', bucket: 'thumbs-bucket' },
  { width: 800, suffix: 'medium', bucket: 'medium-bucket' },
  { width: 1920, suffix: 'large', bucket: 'large-bucket' }
];

await Promise.all(sizes.map(async ({ width, suffix, bucket }) => {
  const buffer = await sharp(req.file.buffer).resize(width).webp().toBuffer();
  await s3.putObject({ Bucket: bucket, Key: `${filename}-${suffix}.webp`, Body: buffer }).promise();
}));
```

**Q108. SCENARIO: Multi-tenant app mein har tenant ki files alag folder mein.**
```javascript
destination: (req, file, cb) => {
  const tenantId = req.headers['x-tenant-id'] || req.user.tenantId;
  const dir = `uploads/${tenantId}`;
  fs.mkdirSync(dir, { recursive: true });
  cb(null, dir);
}
```

---

# COMPANY-LEVEL QUESTIONS (Q151–Q200)

**Q151. Amazon (System Design): File upload service design karo jo 1 million concurrent uploads handle kare.**
> **Architecture:**
> - Load balancer → Multiple upload microservices
> - Direct S3 upload (presigned URLs) — server bypass karo
> - SQS queue for post-processing
> - Lambda for image processing
> - CloudFront CDN for serving
> - DynamoDB for metadata

**Q152. Google (Deep Technical): Multer aur Busboy ke bich interface kya hai?**
> Multer Busboy ko Node.js Readable Stream deta hai (HTTP request). Busboy events emit karta hai: `file` (jab file part aaye) aur `field` (jab text field aaye). Multer in events ke handlers mein storage engine call karta hai.

**Q153. Meta/Facebook: SVG upload security vulnerability describe karo aur fix karo.**
> SVG XML mein `<script>` tags ho sakte hain. Browser render karte time script execute karta hai (Stored XSS). Fix: SVG sanitize karo (`dompurify`), ya `Content-Disposition: attachment` header se download force karo, ya SVG ko PNG mein convert karo Sharp se.

**Q154. Netflix: Video upload pipeline describe karo (upload → transcode → CDN).**
> 1. Client → presigned S3 URL se chunked upload
> 2. S3 event → Lambda trigger
> 3. Lambda → MediaConvert job create (multiple resolutions: 1080p, 720p, 480p, 360p)
> 4. MediaConvert output → S3 different folder
> 5. CloudFront CDN pe distribute
> 6. HLS (m3u8) playlist generate karo adaptive streaming ke liye

**Q155. Startup Interview: File upload feature ke liye complete architecture banao MERN stack mein.**
```
Frontend (React):
  → File select → FormData → Axios POST → Progress tracking

Backend (Express + Multer):
  → Route → Auth → Multer (memoryStorage) → Sharp compress
  → Upload to Cloudinary → URL save to MongoDB → Response

Database (MongoDB):
  → Collection: files { userId, url, publicId, size, type, createdAt }

Cloud (Cloudinary):
  → Store images → Transformation on-the-fly
  → CDN delivery
```

**Q156. Banking: PII data containing files upload kaise handle karo securely?**
> 1. TLS 1.3 in transit, 2. AES-256 encryption at rest, 3. No plaintext logs, 4. Strict access control (IAM), 5. Audit logging, 6. Data retention policies, 7. GDPR compliance, 8. Virus scanning mandatory.

**Q157. Healthcare: HIPAA compliant file upload system design karo.**
> 1. Encrypted storage (AWS S3 SSE-KMS), 2. Encrypted transit (TLS), 3. Access controls (IAM), 4. Audit logs, 5. BAA with cloud provider, 6. No PHI in URLs, 7. Signed URLs with short expiry, 8. User consent tracking.

**Q158. E-commerce: Product image upload pipeline optimize karo (hundreds of sellers simultaneously).**
> 1. Presigned S3 URLs — direct client-to-S3, 2. SQS queue for image processing, 3. Lambda workers for resize/compress, 4. CloudFront CDN, 5. WebP conversion, 6. Multiple sizes auto-generate.

**Q159. Social Media: 1GB video upload feature design karo.**
> 1. TUS resumable upload protocol, 2. Chunked upload (5MB chunks), 3. S3 multipart upload API, 4. Progress tracking via WebSocket, 5. Background transcoding (FFmpeg + Bull queue), 6. HLS streaming output.

**Q160. Interview Final: "Multer mein security improvement suggest karo — 3 most critical."**
> **Top 3:**
> 1. **Magic number validation** — `file-type` package se actual content check karo (MIME spoofing prevent)
> 2. **Rate limiting** — `express-rate-limit` se upload routes protect karo (DoS prevent)
> 3. **Cloud storage instead of local disk** — Local execution risk + scaling issues both solve hoti hain

---

<div align="center">

**[⬅️ Beginner Questions](beginner-questions.md)** | **[Cheat Sheet ➡️](../cheatsheets/multer-cheatsheet.md)**

</div>

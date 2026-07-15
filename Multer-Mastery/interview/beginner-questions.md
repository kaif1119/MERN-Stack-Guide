# 🎯 Multer Interview Questions — Beginner Level (100 Questions)

> **Level:** 🟢 Beginner | **Total:** 100 Questions with Detailed Answers

---

## Section 1: Basics (Q1–Q25)

**Q1. Multer kya hai?**
> **Ans:** Multer ek Node.js middleware hai jo `multipart/form-data` format mein aane wali HTTP requests ko handle karta hai. Primarily file uploads ke liye use hota hai. Express.js ke saath commonly use hota hai aur `req.file` (single) ya `req.files` (multiple) provide karta hai.

**Q2. Multer ko install karne ka command kya hai?**
> **Ans:** `npm install multer`

**Q3. Multer kaunse npm package se related hai internally?**
> **Ans:** Multer internally `busboy` use karta hai — ek streaming multipart parser.

**Q4. `multipart/form-data` kya hai?**
> **Ans:** Yeh ek HTTP content type hai jo file uploads ke liye use hoti hai. Isme data ko "parts" mein bheja jaata hai — text parts aur binary (file) parts alag alag hote hain.

**Q5. HTML form mein file upload ke liye kaunsa attribute zaroori hai?**
> **Ans:** `enctype="multipart/form-data"` — bina iske file ka sirf naam jayega, actual data nahi.

**Q6. `upload.single()` kya karta hai?**
> **Ans:** Ek single file upload handle karta hai. Parameter mein HTML input field ka `name` attribute dete hain. Result `req.file` mein milta hai.

**Q7. `upload.array()` aur `upload.single()` mein kya fark hai?**
> **Ans:** `single()` sirf ek file accept karta hai → `req.file` (object). `array()` multiple files same field se accept karta hai → `req.files` (array).

**Q8. `req.file` mein kya hota hai?**
> **Ans:** Single uploaded file ka metadata: `fieldname`, `originalname`, `encoding`, `mimetype`, `destination`, `filename`, `path`, `size`.

**Q9. `req.files` kab use hota hai?**
> **Ans:** Jab multiple files upload hoti hain — `upload.array()`, `upload.fields()`, ya `upload.any()` ke saath.

**Q10. Default storage engine kaunsa hai Multer mein?**
> **Ans:** `memoryStorage` — agar koi storage specify nahi kiya toh files RAM mein Buffer mein jaati hain.

**Q11. `diskStorage` aur `memoryStorage` mein main fark kya hai?**
> **Ans:** `diskStorage` → files hard disk pe permanent storage. `memoryStorage` → files RAM mein temporary Buffer.

**Q12. `destination` callback mein kya set karte hain?**
> **Ans:** Woh folder jahan file save karni hai. `cb(null, 'uploads/')` se 'uploads/' folder specify karte hain.

**Q13. `filename` callback mein kya set karte hain?**
> **Ans:** Disk pe saved file ka naam. `cb(null, 'myfile.jpg')` se naam specify karte hain.

**Q14. Agar `filename` callback set nahi kiya toh kya hoga?**
> **Ans:** Multer ek random naam generate karega bina extension ke. Isliye hamesha `filename` set karo.

**Q15. `path.extname()` kya karta hai?**
> **Ans:** File ka extension return karta hai. `path.extname('photo.jpg')` → `'.jpg'`

**Q16. `Date.now()` unique filename ke liye kyon use karte hain?**
> **Ans:** `Date.now()` current timestamp milliseconds mein return karta hai — yeh practically unique hota hai aur same naam ki files conflict se bachata hai.

**Q17. `fileFilter` kya hai?**
> **Ans:** Multer configuration mein ek function jo decide karta hai ki file accept karni hai ya reject karni hai. `cb(null, true)` = accept, `cb(null, false)` = reject.

**Q18. MIME type kya hota hai?**
> **Ans:** Media type ya content type — file ka standardized format identifier. Examples: `image/jpeg`, `application/pdf`, `video/mp4`.

**Q19. `limits` option kya karta hai?**
> **Ans:** Upload ki constraints set karta hai: `fileSize` (file ka max size), `files` (max file count), `fields` (max text fields), etc.

**Q20. File size limit bytes mein kaise set karte hain 5MB ke liye?**
> **Ans:** `limits: { fileSize: 5 * 1024 * 1024 }` — 5 × 1024 × 1024 = 5,242,880 bytes.

**Q21. `req.body` mein kya hota hai jab file upload ke saath text fields bhi hain?**
> **Ans:** `req.body` mein text form fields ka data hota hai (non-file fields). File `req.file` mein hoti hai.

**Q22. Express mein uploaded files ko publicly serve kaise karte hain?**
> **Ans:** `app.use('/uploads', express.static('uploads'))` — `/uploads` URL se files access ho sakti hain.

**Q23. `upload.none()` kab use karte hain?**
> **Ans:** Jab sirf text fields ke saath multipart request aane ki expectation ho, koi file nahi. File aane pe error throw karta hai.

**Q24. Multer ka GitHub repository kahan hai?**
> **Ans:** `https://github.com/expressjs/multer` — Express.js organization ka official package.

**Q25. `req.file` undefined ho sakta hai kab?**
> **Ans:** 1) Koi file upload nahi ki gayi, 2) `fileFilter` ne reject kiya, 3) Field name mismatch hai, 4) Multer middleware route mein nahi hai.

---

## Section 2: Configuration (Q26–Q50)

**Q26. Multer ki basic import aur setup kaise karte hain?**
```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
// Ya detailed:
const upload = multer({ storage: multer.diskStorage({...}) });
```

**Q27. `multer({ dest: 'uploads/' })` shortcut kya karta hai?**
> **Ans:** Yeh `diskStorage` ke saath `destination` set karta hai. `filename` random hoga (extension nahi hogi).

**Q28. Multer middleware ko route mein kaise add karte hain?**
```javascript
app.post('/upload', upload.single('file'), (req, res) => {
  // req.file yahan available hai
});
```

**Q29. `upload.fields()` ka syntax kya hai?**
```javascript
upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
])
```

**Q30. `upload.fields()` ke baad `req.files` ka structure kya hota hai?**
> **Ans:** Object jisme keys field names hote hain: `req.files.avatar` (array), `req.files.gallery` (array).

**Q31. Multer mein multiple storage configurations kaise use karte hain?**
> **Ans:** Multiple upload instances banate hain: `const imageUpload = multer({...})`; `const docUpload = multer({...})` — alag alag routes ke liye alag instances.

**Q32. `multer.memoryStorage()` ko kaise use karte hain?**
```javascript
const storage = multer.memoryStorage();
const upload = multer({ storage });
// req.file.buffer mein data hoga
```

**Q33. `maxCount` kya karta hai `upload.fields()` mein?**
> **Ans:** Ek specific field se maximum kitni files accept karni hain — exceed karne pe `LIMIT_UNEXPECTED_FILE` error.

**Q34. Multer middleware ko router pe kaise use karte hain?**
```javascript
const router = express.Router();
router.post('/upload', upload.single('file'), controller.upload);
```

**Q35. Kya Multer TypeScript mein use ho sakta hai?**
> **Ans:** Haan! `npm install @types/multer --save-dev` se TypeScript types available hain.

**Q36. `file.fieldname` aur HTML input `name` attribute ka kya relation hai?**
> **Ans:** Dono same hote hain. `<input name="photo">` → `req.file.fieldname === 'photo'`.

**Q37. `storage` option mein kya pass karte hain?**
> **Ans:** `multer.diskStorage({...})`, `multer.memoryStorage()`, ya koi custom storage engine instance.

**Q38. Multer mein global configuration kaise share karte hain?**
> **Ans:** Ek separate file (e.g., `config/multer.js`) mein upload instance export karo, sab jagah import karo.

**Q39. `limits.fields` kya set karta hai?**
> **Ans:** Non-file form fields ki maximum count. Exceed karne pe `LIMIT_FIELD_COUNT` error.

**Q40. `limits.parts` kya hai?**
> **Ans:** Total parts limit (files + fields combined). Exceed pe `LIMIT_PART_COUNT` error.

**Q41. `limits.headerPairs` kya hai?**
> **Ans:** Multipart header mein maximum key-value pairs. Default 2000 — usually change nahi karte.

**Q42. Kya ek route mein multiple Multer middlewares chain kar sakte hain?**
> **Ans:** Nahi directly. Ek hi Multer instance per route use karo. Multiple instances karna nahi chahiye same route pe.

**Q43. `destination` callback mein error kaise throw karte hain?**
```javascript
destination: (req, file, cb) => {
  if (someCondition) cb(new Error('Cannot save here!'));
  else cb(null, 'uploads/');
}
```

**Q44. Agar `destination` mein folder exist nahi karta toh kya hoga?**
> **Ans:** Multer error throw karega. Isliye pehle `fs.mkdirSync(dir, { recursive: true })` se folder banao.

**Q45. `{ recursive: true }` `fs.mkdirSync` mein kya karta hai?**
> **Ans:** Nested folders bhi banata hai agar intermediate folders exist nahi karte. Example: `uploads/2024/07/15/` ek baar mein ban jaata hai.

**Q46. Multer aur body-parser saath mein kaise kaam karte hain?**
> **Ans:** `body-parser` JSON/URL-encoded ke liye, Multer multipart ke liye. Dono saath use kar sakte hain — alag alag routes ya same routes pe alag middlewares.

**Q47. Kya Multer GET requests handle karta hai?**
> **Ans:** Nahi. Multer sirf multipart/form-data requests handle karta hai, jo POST/PUT mein hoti hain. GET mein body nahi hota.

**Q48. `cb` callback mein `null` pehle parameter mein kyon pass karte hain?**
> **Ans:** Node.js convention: pehla parameter hamesha error hota hai. `null` matlab koi error nahi. Error-first callback pattern.

**Q49. Multer middleware kab execute hota hai?**
> **Ans:** Request aane ke baad, route handler se pehle — middleware chain mein apni position ke hisaab se.

**Q50. `upload.single()` ke baad kaunse req properties set hoti hain?**
> **Ans:** `req.file` (uploaded file info) aur `req.body` (text form fields).

---

## Section 3: req.file Properties (Q51–Q75)

**Q51. `req.file.originalname` kya hota hai?**
> **Ans:** User ke computer pe file ka original naam jaise user ne name diya tha. Example: `"my vacation photo.jpg"`.

**Q52. `req.file.mimetype` kya batata hai?**
> **Ans:** File ka MIME type — content type identifier. Example: `"image/jpeg"`, `"application/pdf"`.

**Q53. `req.file.size` kya return karta hai?**
> **Ans:** File ka size **bytes** mein. KB mein convert karna ho toh: `req.file.size / 1024`.

**Q54. `req.file.path` kya hota hai?**
> **Ans:** Disk pe saved file ka relative path. `diskStorage` specific — `memoryStorage` mein available nahi.

**Q55. `req.file.filename` kya hota hai?**
> **Ans:** Disk pe saved file ka naam (humne `filename` callback mein set kiya). `diskStorage` specific.

**Q56. `req.file.destination` kya hota hai?**
> **Ans:** Folder path jahan file save hui. `diskStorage` specific.

**Q57. `req.file.buffer` kab available hota hai?**
> **Ans:** Sirf `memoryStorage` use karne pe. File ke actual bytes Buffer ke roop mein. `diskStorage` mein `undefined` hoga.

**Q58. `req.file.encoding` kya hota hai?**
> **Ans:** File ki encoding type, usually `"7bit"`. File upload mein rarely important hota hai.

**Q59. `req.file.fieldname` aur `req.file.originalname` mein kya fark hai?**
> **Ans:** `fieldname` = HTML form ka `name` attribute. `originalname` = actual file ka naam on user's computer.

**Q60. `req.file.size` bytes mein hai — 1MB kaisa dikhega?**
> **Ans:** 1MB = 1,048,576 bytes (1024 × 1024). Code: `req.file.size === 1024 * 1024`.

**Q61. KB mein size dikhana ho toh kaise karein?**
> **Ans:** `(req.file.size / 1024).toFixed(2) + ' KB'`

**Q62. MB mein size dikhana ho toh?**
> **Ans:** `(req.file.size / (1024 * 1024)).toFixed(2) + ' MB'`

**Q63. `req.files` (array mein) first file kaise access karein?**
> **Ans:** `req.files[0]` — array indexing.

**Q64. `upload.fields()` ke baad `avatar` field ki file kaise access karein?**
> **Ans:** `req.files.avatar[0]` — kyunki `req.files` object hai aur har field array hai.

**Q65. `req.file` check karna kyon zaroori hai before processing?**
> **Ans:** Kyunki user file select nahi karta toh `req.file` `undefined` hoga — isko process karne se TypeError aayega.

**Q66. File URL generate karne ka standard way kya hai?**
```javascript
const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
```

**Q67. `req.protocol` kya return karta hai?**
> **Ans:** `'http'` ya `'https'` — current request ka protocol.

**Q68. `req.get('host')` kya return karta hai?**
> **Ans:** Request ka Host header — usually `'localhost:3000'` ya `'example.com'`.

**Q69. Uploaded file ko database mein kya store karte hain?**
> **Ans:** File ka path ya URL — actual file nahi (woh server ya cloud pe rehti hai). `filename`, `path`, ya cloud URL database mein.

**Q70. `req.file.mimetype` se image check kaise karte hain?**
> **Ans:** `req.file.mimetype.startsWith('image/')` — sab image types ke liye. Ya specific: `req.file.mimetype === 'image/jpeg'`.

**Q71. Extension extract karne ke 2 tarike kya hain?**
```javascript
// Method 1: path module
path.extname(req.file.originalname)  // '.jpg'

// Method 2: Split
req.file.originalname.split('.').pop()  // 'jpg' (no dot)
```

**Q72. `req.file.path` se file read kaise karte hain?**
```javascript
const fs = require('fs');
const data = fs.readFileSync(req.file.path);
// Ya async:
const data = await fs.promises.readFile(req.file.path);
```

**Q73. Upload ke baad original file delete kaise karte hain?**
```javascript
fs.unlinkSync(req.file.path);
// Ya async:
await fs.promises.unlink(req.file.path);
```

**Q74. `req.files` loop kaise karte hain (array case)?**
```javascript
req.files.forEach(file => {
  console.log(file.originalname, file.size);
});
// Ya:
const urls = req.files.map(file => `/uploads/${file.filename}`);
```

**Q75. Agar user ne ek file bheji par tum `req.files` access karo, kya hoga?**
> **Ans:** `upload.single()` use karne pe `req.files` undefined hoga — `req.file` use karo. `upload.array()` se ek file bhi `req.files[0]` mein hogi.

---

## Section 4: HTML Forms & Frontend (Q76–Q100)

**Q76. HTML mein file input kaise banate hain?**
```html
<input type="file" name="photo">
```

**Q77. Multiple file select karne ke liye HTML attribute?**
> **Ans:** `multiple` — `<input type="file" name="photos" multiple>`

**Q78. Specific file types restrict karne ke liye `accept` attribute?**
```html
<input type="file" accept="image/*">          <!-- Sirf images -->
<input type="file" accept=".pdf,.doc">         <!-- Sirf PDF, DOC -->
<input type="file" accept="image/jpeg,image/png"> <!-- Specific MIME -->
```

**Q79. `accept` attribute client-side restriction hai ya server-side?**
> **Ans:** Client-side only — browser mein filter dikhata hai. Server pe bhi validate karo (fileFilter use karo). Users `accept` bypass kar sakte hain.

**Q80. Fetch API se file upload kaise karte hain JavaScript mein?**
```javascript
const formData = new FormData();
formData.append('photo', fileInput.files[0]);

const response = await fetch('/upload', {
  method: 'POST',
  body: formData  // Content-Type auto: multipart/form-data
});
const data = await response.json();
```

**Q81. FormData mein text fields kaise add karte hain?**
```javascript
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('photo', file);
```

**Q82. Axios se file upload kaise karte hain?**
```javascript
const formData = new FormData();
formData.append('file', selectedFile);

const response = await axios.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

**Q83. Upload progress track kaise karte hain?**
```javascript
const response = await axios.post('/upload', formData, {
  onUploadProgress: (progressEvent) => {
    const percentage = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    );
    console.log(`${percentage}% uploaded`);
  }
});
```

**Q84. Drag and Drop file upload implement kaise karte hain?**
```javascript
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;  // Dropped files
  const formData = new FormData();
  formData.append('file', files[0]);
  // fetch se upload karo
});
```

**Q85. File preview (image) kaise dikhate hain before upload?**
```javascript
const fileInput = document.getElementById('photo');
const preview = document.getElementById('preview');

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);  // Local blob URL
    preview.style.display = 'block';
  }
});
```

**Q86. FileReader API kya hai?**
> **Ans:** Browser API jo file ko read karna allow karta hai — Base64, ArrayBuffer, ya text mein. `URL.createObjectURL()` faster hai preview ke liye.

**Q87. File ka client-side size validation kaise karte hain?**
```javascript
const maxSize = 5 * 1024 * 1024; // 5MB
if (file.size > maxSize) {
  alert('File bahut badi hai! Max 5MB.');
  return;
}
```

**Q88. Multiple files iterated kaise karte hain input element se?**
```javascript
const files = fileInput.files;  // FileList object
for (let i = 0; i < files.length; i++) {
  console.log(files[i].name, files[i].size);
}
// Ya spread operator:
[...files].forEach(file => console.log(file.name));
```

**Q89. `FormData` se specific field delete kaise karte hain?**
```javascript
formData.delete('fieldName');
```

**Q90. `FormData` ki entries iterate kaise karein?**
```javascript
for (let [key, value] of formData.entries()) {
  console.log(key, value);
}
```

**Q91. HTML form submit event prevent kyun karte hain?**
```javascript
form.addEventListener('submit', (e) => {
  e.preventDefault();  // Default form submit rok do (page reload)
  // Ab manually fetch se submit karo
});
```

**Q92. Upload cancel kaise karte hain (AbortController)?**
```javascript
const controller = new AbortController();

fetch('/upload', {
  method: 'POST',
  body: formData,
  signal: controller.signal
});

// Cancel karo:
controller.abort();
```

**Q93. File ka type client-side check kaise karte hain?**
```javascript
const file = fileInput.files[0];
if (!file.type.startsWith('image/')) {
  alert('Sirf images!');
  return;
}
```

**Q94. Multiple file input se FormData kaise banate hain?**
```javascript
const formData = new FormData();
const files = fileInput.files;
for (let file of files) {
  formData.append('photos', file);  // Same key multiple times
}
```

**Q95. React mein file upload kaise karte hain?**
```javascript
const handleUpload = async (event) => {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append('photo', file);
  
  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });
  const data = await response.json();
};

return <input type="file" onChange={handleUpload} />;
```

**Q96. React mein file state manage kaise karte hain?**
```javascript
const [selectedFile, setSelectedFile] = useState(null);

const handleFileChange = (e) => {
  setSelectedFile(e.target.files[0]);
};

const handleSubmit = async () => {
  const formData = new FormData();
  formData.append('file', selectedFile);
  await fetch('/upload', { method: 'POST', body: formData });
};
```

**Q97. File input reset kaise karte hain programmatically?**
```javascript
document.getElementById('fileInput').value = '';
// Ya:
fileInputRef.current.value = '';  // React
```

**Q98. Client-side file validation checklist kya hai?**
```
✅ File type check (MIME ya extension)
✅ File size check (max limit)
✅ File count check (multiple mein)
✅ Required check (field mandatory hai ya nahi)
✅ Image dimensions (agar image hai)
```

**Q99. `enctype` na dena ka kya consequence hai HTML form mein?**
> **Ans:** File ka sirf naam (string) POST body mein jayega, actual binary data nahi. Server pe `req.file` `undefined` hoga. Multer fail karega.

**Q100. Best practice — server pe bhi validate kyun karte hain agar client side pe validation hai?**
> **Ans:** Client-side validation bypass ho sakta hai (browser DevTools, curl, Postman). Server-side validation mandatory hai — security yahan ensure hoti hai. Client validation sirf UX improve karta hai.

---

<div align="center">

*"Practice makes perfect — Ek ek sawaal yaad karo!"* 🎯

**[⬅️ README](../README.md)** | **[Intermediate Questions ➡️](intermediate-questions.md)**

</div>

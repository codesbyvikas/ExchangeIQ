const express = require("express");
const upload = require("../utils/multer");
const cloudinary = require("../utils/cloudinary");
const authCheck = require("../middlewares/auth");
const router = express.Router();

const allowedTypes = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/avi', 'video/mov', 'video/webm'],
  audio: ['audio/mp3', 'audio/wav', 'audio/ogg'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

const sizeLimits = {
  image: 5 * 1024 * 1024,
  video: 50 * 1024 * 1024,
  audio: 10 * 1024 * 1024,
  document: 10 * 1024 * 1024
};

const getFileType = (mimetype) => {
  if (allowedTypes.image.includes(mimetype)) return 'image';
  if (allowedTypes.video.includes(mimetype)) return 'video';
  if (allowedTypes.audio.includes(mimetype)) return 'audio';
  if (allowedTypes.document.includes(mimetype)) return 'document';
  return null;
};

const validateFile = (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const fileType = getFileType(req.file.mimetype);
  if (!fileType) return res.status(400).json({ message: 'Unsupported file type' });
  if (req.file.size > sizeLimits[fileType]) {
    return res.status(400).json({ message: `File too large. Max size for ${fileType} is ${sizeLimits[fileType] / (1024 * 1024)}MB` });
  }
  req.fileType = fileType;
  next();
};

router.post("/upload", authCheck, upload.single("file"), validateFile, async (req, res) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        resource_type: "auto",
        folder: "chat_media",
        use_filename: true,
        unique_filename: true
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
      stream.end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      mediaType: req.fileType,
      originalName: req.file.originalname,
      size: req.file.size,
      duration: result.duration || null,
      width: result.width || null,
      height: result.height || null,
      format: result.format,
      resourceType: result.resource_type,
      createdAt: result.created_at
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Upload failed", error: error.message });
  }
});

router.get("/info/:publicId", authCheck, async (req, res) => {
  try {
    const result = await cloudinary.api.resource(req.params.publicId);
    res.json({
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      resourceType: result.resource_type,
      size: result.bytes,
      width: result.width,
      height: result.height,
      duration: result.duration,
      createdAt: result.created_at
    });
  } catch (error) {
    res.status(error.http_code || 500).json({ message: error.message });
  }
});

module.exports = router;

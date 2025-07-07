const express = require("express");
const upload = require("../utils/multer");
const cloudinary = require("../utils/cloudinary");
const authCheck = require("../middlewares/auth");

const router = express.Router();

// File type validation
const allowedTypes = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/avi', 'video/mov', 'video/webm'],
  audio: ['audio/mp3', 'audio/wav', 'audio/ogg'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// File size limits (in bytes)
const sizeLimits = {
  image: 5 * 1024 * 1024, // 5MB
  video: 50 * 1024 * 1024, // 50MB
  audio: 10 * 1024 * 1024, // 10MB
  document: 10 * 1024 * 1024 // 10MB
};

// Helper function to determine file type
const getFileType = (mimetype) => {
  if (allowedTypes.image.includes(mimetype)) return 'image';
  if (allowedTypes.video.includes(mimetype)) return 'video';
  if (allowedTypes.audio.includes(mimetype)) return 'audio';
  if (allowedTypes.document.includes(mimetype)) return 'document';
  return null;
};

// File validation middleware
const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const fileType = getFileType(req.file.mimetype);
  if (!fileType) {
    return res.status(400).json({ 
      message: 'Unsupported file type',
      supportedTypes: Object.keys(allowedTypes)
    });
  }

  const sizeLimit = sizeLimits[fileType];
  if (req.file.size > sizeLimit) {
    return res.status(400).json({ 
      message: `File too large. Maximum size for ${fileType} is ${sizeLimit / (1024 * 1024)}MB`,
      maxSize: sizeLimit
    });
  }

  req.fileType = fileType;
  next();
};

// Upload endpoint with enhanced validation
router.post("/upload", authCheck, upload.single("file"), validateFile, async (req, res) => {
  try {
    const { chatId } = req.body;
    
    // Optional: Validate chat access if chatId is provided
    if (chatId) {
      const Chat = require('../models/chat');
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.includes(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized for this chat' });
      }
    }

    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const uploadOptions = {
          resource_type: "auto",
          folder: "chat_media", // Organize files in folders
          use_filename: true,
          unique_filename: true,
          // Add transformation for images
          ...(req.fileType === 'image' && {
            transformation: [
              { quality: "auto:good", format: "auto" },
              { width: 1024, height: 1024, crop: "limit" }
            ]
          }),
          // Add duration limit for videos
          ...(req.fileType === 'video' && {
            video_codec: "auto",
            quality: "auto:good"
          })
        };

        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(fileBuffer);
      });
    };

    const result = await streamUpload(req.file.buffer);

    // Log upload for monitoring
    console.log(`File uploaded: ${result.public_id} by user ${req.user._id}`);

    res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
      mediaType: req.fileType,
      originalName: req.file.originalname,
      size: req.file.size,
      duration: result.duration || null, // For videos/audio
      width: result.width || null,
      height: result.height || null,
      format: result.format
    });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ 
      message: "Media upload failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete uploaded media
router.delete("/delete/:publicId", authCheck, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ message: 'Public ID required' });
    }

    // Optional: Add authorization check to ensure user owns the media
    // This would require storing media ownership in your database

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto"
    });

    if (result.result === 'ok') {
      res.json({ message: 'Media deleted successfully' });
    } else {
      res.status(404).json({ message: 'Media not found or already deleted' });
    }
  } catch (error) {
    console.error("Delete failed:", error);
    res.status(500).json({ 
      message: "Media deletion failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get media info
router.get("/info/:publicId", authCheck, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    const result = await cloudinary.api.resource(publicId);
    
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
    console.error("Info fetch failed:", error);
    if (error.http_code === 404) {
      res.status(404).json({ message: 'Media not found' });
    } else {
      res.status(500).json({ 
        message: "Failed to fetch media info",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

module.exports = router;
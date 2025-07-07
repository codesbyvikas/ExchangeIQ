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
      message: `File too large. Maximum size for ${fileType} is ${sizeLimit / (1024 * 1024)}MB`
    });
  }

  req.fileType = fileType;
  next();
};

// Fixed upload route with better error handling and logging
router.post("/upload", authCheck, upload.single("file"), validateFile, async (req, res) => {
  try {
    // console.log("🔁 /upload route triggered");
    // console.log("👤 User ID:", req.user._id);
    // console.log("📁 Received file:", req.file.originalname);
    // console.log("📦 MIME type:", req.file.mimetype);
    // console.log("📏 Size:", req.file.size);
    // console.log("📋 File type detected:", req.fileType);

    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const uploadOptions = {
          resource_type: "auto",
          folder: "chat_media",
          use_filename: true,
          unique_filename: true,
          ...(req.fileType === 'image' && {
            transformation: [
              { quality: "auto:good", format: "auto" },
              { width: 1024, height: 1024, crop: "limit" }
            ]
          }),
          ...(req.fileType === 'video' && {
            video_codec: "auto",
            quality: "auto:good"
          })
        };

        // console.log("📤 Starting Cloudinary upload with options:", uploadOptions);

        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              // console.error("❌ Cloudinary upload error:", error);
              // console.error("❌ Error details:", JSON.stringify(error, null, 2));
              reject(error);
            } else {
              // console.log("✅ Upload success!");
              // console.log("🌐 Secure URL:", result.secure_url);
              // console.log("🧾 Public ID:", result.public_id);
              // console.log("📊 Full result:", JSON.stringify(result, null, 2));
              resolve(result);
            }
          }
        );

        // Add timeout to catch hanging uploads
        const uploadTimeout = setTimeout(() => {
          // console.error("⏰ Upload timeout after 30 seconds");
          reject(new Error("Upload timeout"));
        }, 30000);

        // Check if fileBuffer exists and has content
        if (!fileBuffer) {
          // console.error("🚨 fileBuffer is undefined or null");
          reject(new Error("File buffer is missing"));
          return;
        }

        // console.log("📦 File buffer size:", fileBuffer.length);
        // console.log("🚀 Initiating stream.end()...");
        
        stream.end(fileBuffer);
        
        // Clear timeout on successful completion
        stream.on('finish', () => {
          // console.log("📤 Stream finished successfully");
          clearTimeout(uploadTimeout);
        });
        
        stream.on('error', (streamError) => {
          // console.error("❌ Stream error:", streamError);
          clearTimeout(uploadTimeout);
          reject(streamError);
        });
      });
    };

    // Upload to Cloudinary
    const result = await streamUpload(req.file.buffer);
    
    // This should now print the result
    // console.log("🎉 Final upload result:", result);

    // Send response with all necessary fields for the chat
    const response = {
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
      // Additional fields that might be useful
      resourceType: result.resource_type,
      createdAt: result.created_at
    };

    // console.log("📤 Sending response:", JSON.stringify(response, null, 2));
    
    res.status(200).json(response);

  } catch (error) {
    // console.error("❌ Upload failed with error:", error);
    // console.error("❌ Error stack:", error.stack);
    
    res.status(500).json({
      success: false,
      message: "Media upload failed",
      error: error.message,
      // Add more error details for debugging
      errorType: error.name,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack
      })
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
    // console.error("Info fetch failed:", error);
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
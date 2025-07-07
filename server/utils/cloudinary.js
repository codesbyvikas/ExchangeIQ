// Fixed cloudinary.js configuration file
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test the configuration
console.log("=== CLOUDINARY CONFIG ===");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing");
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing");

// Test connection
const testConnection = async () => {
    try {
        const result = await cloudinary.api.ping();
        console.log("✅ Cloudinary connection successful");
        return true;
    } catch (error) {
        console.error("❌ Cloudinary connection failed:", error.message);
        return false;
    }
};

// Test on module load
testConnection();

module.exports = cloudinary;
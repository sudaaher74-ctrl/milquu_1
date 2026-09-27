import express from 'express';
import { upload } from '../utils/uploadConfig.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only admin and delivery staff may upload. This runs before multer, so a
// customer's file is refused before it is streamed to Cloudinary — the check
// used to come after the upload had already happened.
const canUpload = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'delivery')) return next();
  res.status(403).json({ message: 'Not authorized to upload images' });
};

router.post('/', protect, canUpload, upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({
      message: 'Image uploaded successfully',
      url: req.file.path // Cloudinary URL
    });
  } else {
    res.status(400).json({ message: 'No image file provided' });
  }
});

export default router;

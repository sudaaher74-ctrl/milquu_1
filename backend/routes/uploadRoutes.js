import express from 'express';
import { upload } from '../utils/uploadConfig.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.single('image'), (req, res) => {
  // Only allow admin or delivery to upload
  if (req.user && (req.user.role === 'admin' || req.user.role === 'delivery')) {
    if (req.file) {
      res.json({
        message: 'Image uploaded successfully',
        url: req.file.path // Cloudinary URL
      });
    } else {
      res.status(400).json({ message: 'No image file provided' });
    }
  } else {
    res.status(403).json({ message: 'Not authorized to upload images' });
  }
});

export default router;

import express from 'express';
import { upload } from '../utils/uploadConfig.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, admin, upload.single('image'), (req, res) => {
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

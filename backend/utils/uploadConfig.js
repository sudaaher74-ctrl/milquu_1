import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const UPLOAD_PARAMS = {
  folder: 'milquu_fresh',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
};

/**
 * A multer storage engine that streams straight to Cloudinary. Replaces
 * multer-storage-cloudinary, which peer-depends on Cloudinary v1 and has had
 * no release since v2 shipped — its whole job was these two calls.
 */
class CloudinaryStorage {
  _handleFile(_req, file, callback) {
    const stream = cloudinary.uploader.upload_stream(UPLOAD_PARAMS, (error, result) => {
      if (error) return callback(error);
      callback(null, {
        path: result.secure_url,
        size: result.bytes,
        filename: result.public_id
      });
    });
    file.stream.pipe(stream);
  }

  _removeFile(_req, file, callback) {
    cloudinary.uploader.destroy(file.filename, { invalidate: true }, callback);
  }
}

const upload = multer({
  storage: new CloudinaryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

export { upload, cloudinary };

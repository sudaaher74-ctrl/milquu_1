import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = './public/img';
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.png')) {
    const inputPath = path.join(dir, file);
    const outputPath = path.join(dir, file.replace('.png', '.webp'));
    
    sharp(inputPath)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath)
      .then(() => {
        console.log(`Optimized ${file}`);
        // Optionally delete original PNG to force using WebP
        fs.unlinkSync(inputPath);
      })
      .catch(err => console.error(err));
  }
}

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgBuffer = fs.readFileSync(path.resolve(__dirname, '../public/favicon.svg'));

async function generateIcons() {
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve(__dirname, '../public/pwa-192x192.png'));
  console.log('pwa-192x192.png generated');

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve(__dirname, '../public/pwa-512x512.png'));
  console.log('pwa-512x512.png generated');

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve(__dirname, '../public/apple-touch-icon.png'));
  console.log('apple-touch-icon.png generated');
}

generateIcons().catch(console.error);

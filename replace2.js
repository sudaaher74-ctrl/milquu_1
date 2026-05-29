import fs from 'fs';
import path from 'path';

const dir = './frontend-react/src/pages/delivery';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes("import axios from 'axios'")) {
    content = content.replace("import axios from 'axios';", "import api from '../../utils/api.js';");
    content = content.replace(/axios\./g, "api.");
    content = content.replace(/https:\/\/milquu-backend\.onrender\.com/g, "");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

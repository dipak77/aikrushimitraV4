import fs from 'fs';
import path from 'path';
import https from 'https';

const img = { url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1920&auto=format&fit=crop", name: "bg-benefits.jpg" };
const dir = path.join(process.cwd(), 'public', 'images');

console.log(`Downloading ${img.name}...`);

const file = fs.createWriteStream(path.join(dir, img.name));
https.get(img.url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
}, response => {
  if (response.statusCode !== 200) {
    console.error(`Failed to get '${img.url}' (${response.statusCode})`);
    return;
  }
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log(`Downloaded ${img.name}`);
  });
}).on('error', err => {
  fs.unlink(path.join(dir, img.name), () => {});
  console.error(`Error downloading ${img.name}: ${err.message}`);
});

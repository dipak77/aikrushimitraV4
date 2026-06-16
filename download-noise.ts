import fs from 'fs';
import path from 'path';
import https from 'https';

const url = 'https://grainy-gradients.vercel.app/noise.svg';
const dir = path.join(process.cwd(), 'public');
const file = path.join(dir, 'noise.svg');

https.get(url, response => {
  const stream = fs.createWriteStream(file);
  response.pipe(stream);
  stream.on('finish', () => {
    stream.close();
    console.log('Downloaded noise.svg');
  });
}).on('error', err => {
  console.error('Error downloading noise.svg:', err.message);
});

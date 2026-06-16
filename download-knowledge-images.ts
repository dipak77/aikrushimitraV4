import fs from 'fs';
import path from 'path';
import https from 'https';

const images = [
  { url: 'https://images.unsplash.com/photo-1628277613967-6abca504d0ac?q=80&w=1200&auto=format&fit=crop', name: 'know-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1615470749906-f4a89f5b4d09?q=80&w=1200&auto=format&fit=crop', name: 'know-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1200&auto=format&fit=crop', name: 'know-3.jpg' },
  { url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1200&auto=format&fit=crop', name: 'know-4.jpg' },
  { url: 'https://images.unsplash.com/photo-1599940778173-e5ae6719f0e6?q=80&w=1200&auto=format&fit=crop', name: 'know-5.jpg' },
  { url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?q=80&w=1200&auto=format&fit=crop', name: 'know-6.jpg' },
  { url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=1200&auto=format&fit=crop', name: 'know-7.jpg' },
  { url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=1200&auto=format&fit=crop', name: 'know-8.jpg' },
  { url: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=1200&auto=format&fit=crop', name: 'know-9.jpg' },
  { url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1200&auto=format&fit=crop', name: 'know-10.jpg' },
  { url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop', name: 'know-11.jpg' },
  { url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1200&auto=format&fit=crop', name: 'know-12.jpg' },
  { url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1200&auto=format&fit=crop', name: 'know-13.jpg' },
  { url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1200&auto=format&fit=crop', name: 'know-14.jpg' },
  { url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=1200&auto=format&fit=crop', name: 'know-15.jpg' },
  { url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=1200&auto=format&fit=crop', name: 'know-16.jpg' },
];

const dir = path.join(process.cwd(), 'public', 'images');

console.log("Starting downloads for knowledge images...");

Promise.all(images.map(img => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(dir, img.name));
    https.get(img.url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${img.name}`);
        resolve(true);
      });
    }).on('error', err => {
      fs.unlink(path.join(dir, img.name), () => {});
      console.error(`Error downloading ${img.name}: ${err.message}`);
      reject(err);
    });
  });
})).then(() => {
  console.log("All knowledge downloads completed.");
}).catch(err => {
  console.error("Some downloads failed.");
});

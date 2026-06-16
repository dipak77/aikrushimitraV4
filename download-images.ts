import fs from 'fs';
import path from 'path';
import https from 'https';

const images = [
  { url: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1200&auto=format&fit=crop", name: "about-farm.jpg" },
  { url: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c4c12?q=80&w=1200&auto=format&fit=crop", name: "product-app.jpg" },
  { url: "https://images.unsplash.com/photo-1586771107146-f162f23d0402?q=80&w=1920&auto=format&fit=crop", name: "bg-features.jpg" },
  { url: "https://images.unsplash.com/photo-1530507629858-e49b73d0826a?q=80&w=1920&auto=format&fit=crop", name: "bg-benefits.jpg" },
  { url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800&auto=format&fit=crop", name: "sol-tractor.jpg" },
  { url: "https://images.unsplash.com/photo-1595844730298-b28a0635b6d1?q=80&w=800&auto=format&fit=crop", name: "feat-1.jpg" },
  { url: "https://images.unsplash.com/photo-1574943320219-55c5145f0a2a?q=80&w=800&auto=format&fit=crop", name: "feat-2.jpg" },
  { url: "https://images.unsplash.com/photo-1506869640319-ce1a44867630?q=80&w=400&auto=format&fit=crop", name: "avatar-1.jpg" },
  { url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop", name: "avatar-2.jpg" },
  { url: "https://images.unsplash.com/photo-1542838686-37ed7a7ef6f3?q=80&w=400&auto=format&fit=crop", name: "avatar-3.jpg" }
];

const dir = path.join(process.cwd(), 'public', 'images');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

console.log("Starting downloads...");

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
  console.log("All downloads completed.");
}).catch(err => {
  console.error("Some downloads failed.");
});

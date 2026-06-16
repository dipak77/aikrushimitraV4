import fs from 'fs';
import path from 'path';
import https from 'https';

const images = [
  { url: "https://images.unsplash.com/photo-1589923158776-cb4484d23663?q=80&w=800&auto=format&fit=crop", name: "feat-soil.jpg" },
  { url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=800&auto=format&fit=crop", name: "feat-weather.jpg" },
  { url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop", name: "feat-market.jpg" },
  { url: "https://images.unsplash.com/photo-1584473457406-6240473cb15c?q=80&w=800&auto=format&fit=crop", name: "feat-alerts.jpg" },
  { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop", name: "feat-analytics.jpg" }
];

const dir = path.join(process.cwd(), 'public', 'images');

console.log("Starting downloads for new features images...");

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
  console.log("All new downloads completed.");
}).catch(err => {
  console.error("Some downloads failed.");
});

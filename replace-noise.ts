import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('https://grainy-gradients.vercel.app/noise.svg')) {
    content = content.replace(/https:\/\/grainy-gradients\.vercel\.app\/noise\.svg/g, '/noise.svg');
    fs.writeFileSync(filePath, content);
    console.log(`Replaced in ${filePath}`);
  }
}

const files = [
  'components/views/AdminDashboard.tsx',
  'components/views/LoginView.tsx',
  'components/views/SchemeDetailView.tsx',
  'components/dashboard/VoiceWidget.tsx'
];

files.forEach(f => replaceInFile(path.join(process.cwd(), f)));

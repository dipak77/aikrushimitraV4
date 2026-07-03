
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Prioritize env file, then system env, checking common key names for AI Studio/Vercel/Local
  const apiKey = env.GEMINI_API_KEY || env.API_KEY || env.GOOGLE_API_KEY || 
                 process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY || '';

  // Use provided Client ID or fallback to the one in env/process
  const googleClientId = env.VITE_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '947961081206-0sh2q9fja06hcc65gj8o2tghhd164uia.apps.googleusercontent.com';

  return {
    plugins: [react()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    define: {
      // Prevents "process is not defined" in browser
      'process.env': {},
      'process.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(googleClientId),
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      allowedHosts: true,
      cors: true,
      hmr: false,
      watch: {
        usePolling: true,
      }
    }
  };
});

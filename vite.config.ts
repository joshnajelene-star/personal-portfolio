import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function profileUploadPlugin(): Plugin {
  return {
    name: 'profile-upload-handler',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/upload-profile' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const base64Data = data.image.replace(/^data:image\/\w+;base64,/, '');
              const buffer = Buffer.from(base64Data, 'base64');
              const publicDir = path.resolve(__dirname, 'public');
              if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
              }
              const filePath = path.join(publicDir, 'joshna-profile.jpg');
              fs.writeFileSync(filePath, buffer);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, url: '/joshna-profile.jpg' }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: String(err) }));
            }
          });
          return;
        }

        if (req.url === '/api/profile-status' && req.method === 'GET') {
          const filePath = path.resolve(__dirname, 'public/joshna-profile.jpg');
          const exists = fs.existsSync(filePath);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ hasPhoto: exists, url: exists ? '/joshna-profile.jpg' : null }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), profileUploadPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});


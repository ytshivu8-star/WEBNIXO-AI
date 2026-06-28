import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import url from 'url';
import {defineConfig} from 'vite';

function vercelServerlessLocalDevPlugin() {
  return {
    name: 'vercel-serverless-local-dev',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url && (req.url.startsWith('/api/') || req.url.startsWith('/api?'))) {
          const parsedUrl = url.parse(req.url, true);
          const pathname = parsedUrl.pathname || '';
          let relPath = pathname.slice(5); // remove '/api/'
          
          if (relPath === 'chat/title') {
            relPath = 'chat';
          } else if (relPath.startsWith('payment/')) {
            relPath = 'payment';
          } else if (relPath.startsWith('coupons/')) {
            relPath = 'coupons';
          }
          
          let filePath = '';
          const possiblePaths = [
            path.join(__dirname, 'api', relPath + '.ts'),
            path.join(__dirname, 'api', relPath, 'index.ts'),
          ];
          for (const p of possiblePaths) {
            if (fs.existsSync(p) && fs.statSync(p).isFile()) {
              filePath = p;
              break;
            }
          }

          if (!filePath) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Serverless API Route Not Found: ${pathname}` }));
            return;
          }

          try {
            // Read body if POST/PUT/PATCH/DELETE
            let body: any = {};
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
              const buffers: any[] = [];
              for await (const chunk of req) {
                buffers.push(chunk);
              }
              const raw = Buffer.concat(buffers).toString();
              if (raw) {
                try {
                  body = JSON.parse(raw);
                } catch {
                  body = raw;
                }
              }
            }

            // Decorate req and res for Vercel Serverless compatibility
            req.query = parsedUrl.query || {};
            req.body = body;

            res.status = function (code: number) {
              res.statusCode = code;
              return res;
            };
            res.json = function (data: any) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };
            res.send = function (data: any) {
              res.end(data);
              return res;
            };

            // Dynamically load & execute the serverless module
            const module = await server.ssrLoadModule(filePath);
            const handler = module.default;
            if (typeof handler === 'function') {
              await handler(req, res);
            } else {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: `Handler inside ${filePath} must be exported as default async function.` }));
            }
          } catch (err: any) {
            console.error(`[Local Serverless Error]`, err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || String(err) }));
          }
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), vercelServerlessLocalDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 1500,
    },
  };
});

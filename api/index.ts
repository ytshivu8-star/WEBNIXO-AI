import app from '../server';

export default function handler(req: any, res: any) {
  // Vercel serverless functions might strip the /api prefix or change the URL.
  // Ensure the URL starts with /api for Express routing to work.
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url === '/' ? '' : req.url);
  }
  
  // Delegate the request to the Express app
  return app(req, res);
}


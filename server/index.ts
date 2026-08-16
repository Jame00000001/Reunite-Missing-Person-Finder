import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import app from './app.ts';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

// In production, serve static files from dist directory
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

// Fallback for Single Page Application routing in production
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Reunite Server] Server is running on http://localhost:${PORT}`);
  console.log(`[Reunite Server] REST API available at http://localhost:${PORT}/api`);
});

export default app;

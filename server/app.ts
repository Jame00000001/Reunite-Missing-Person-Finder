import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.ts';
import reportRoutes from './routes/reportRoutes.ts';
import adminRoutes from './routes/adminRoutes.ts';
import { db } from './config/db.ts';

const app: Express = express();

// Middlewares
app.use(cors());
// Support base64 image uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Health Check & Stats
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const stats = await db.getStats();
    res.json({
      status: 'healthy',
      app: 'Reunite – Missing Person Finder API',
      database: db.isUsingMySql() ? 'MySQL (reunite_db)' : 'Persistent Local Engine',
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default app;

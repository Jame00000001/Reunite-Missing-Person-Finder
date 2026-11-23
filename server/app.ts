import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import notificationRoutes from './routes/notificationRoutes.ts';
import mapsRoutes from './routes/mapsRoutes.ts';

const app: Express = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes (OSM Geocoding Proxy + Web Push 10 km Notification Dispatcher)
app.use('/api/notifications', notificationRoutes);
app.use('/api/maps', mapsRoutes);

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    app: 'Reunite – Missing Person Finder API',
    database: 'Firebase Cloud Firestore',
    timestamp: new Date().toISOString(),
  });
});

export default app;

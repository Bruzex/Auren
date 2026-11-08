import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'ok',
    app: 'Auren Social API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: statusMap[dbStatus] || 'unknown',
  });
});

export default router;


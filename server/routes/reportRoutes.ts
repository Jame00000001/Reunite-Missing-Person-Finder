import { Router } from 'express';
import {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getMyReports,
} from '../controllers/reportController.ts';
import { verifyToken, optionalAuth } from '../middleware/auth.ts';

const router = Router();

// Public / searchable reports list
router.get('/', optionalAuth, getReports);

// Logged-in user's own reports
router.get('/user/my-reports', verifyToken, getMyReports);

// Get single report
router.get('/:id', optionalAuth, getReportById);

// Create new report (authenticated)
router.post('/', verifyToken, createReport);

// Update report (owner or admin)
router.put('/:id', verifyToken, updateReport);

// Delete report (owner or admin)
router.delete('/:id', verifyToken, deleteReport);

export default router;

import { Router } from 'express';
import {
  getAllReportsAdmin,
  updateReportStatus,
  getAllUsersAdmin,
  getDashboardStats,
} from '../controllers/adminController.ts';
import { verifyToken, requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Protect all admin routes
router.use(verifyToken, requireAdmin);

router.get('/reports', getAllReportsAdmin);
router.patch('/reports/:id/status', updateReportStatus);
router.get('/users', getAllUsersAdmin);
router.get('/stats', getDashboardStats);

export default router;

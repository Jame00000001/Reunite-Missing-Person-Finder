import { Response } from 'express';
import { db } from '../config/db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { ReportStatus } from '../types.ts';

export const getAllReportsAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, type, search } = req.query;
    const reports = await db.getReports({
      status: status ? String(status) : undefined,
      type: type ? String(type) : undefined,
      search: search ? String(search) : undefined,
      includePending: true, // admin gets everything
    });

    res.json({ success: true, count: reports.length, reports });
  } catch (error: any) {
    console.error('Admin get reports error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve reports.' });
  }
};

export const updateReportStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, admin_notes } = req.body;

    const validStatuses: ReportStatus[] = ['Pending', 'Missing', 'Found', 'Reunited', 'Closed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const report = await db.getReportById(id);
    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    const updated = await db.updateReport(id, {
      status,
      admin_notes: admin_notes !== undefined ? admin_notes : report.admin_notes,
    });

    res.json({
      success: true,
      message: `Report status updated to "${status}".`,
      report: updated,
    });
  } catch (error: any) {
    console.error('Admin update status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update report status.' });
  }
};

export const getAllUsersAdmin = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await db.getAllUsers();
    res.json({ success: true, count: users.length, users });
  } catch (error: any) {
    console.error('Admin get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

export const getDashboardStats = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const stats = await db.getStats();
    res.json({ success: true, stats, isMySqlConnected: db.isUsingMySql() });
  } catch (error: any) {
    console.error('Admin get stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard stats.' });
  }
};

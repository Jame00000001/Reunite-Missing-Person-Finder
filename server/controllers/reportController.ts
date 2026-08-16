import { Response } from 'express';
import { db } from '../config/db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { ReportType, Gender, ReportStatus } from '../types.ts';

export const getReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, type, gender, status, ageMin, ageMax, location } = req.query;

    const reports = await db.getReports({
      search: search ? String(search) : undefined,
      type: type ? String(type) : undefined,
      gender: gender ? String(gender) : undefined,
      status: status ? String(status) : undefined,
      ageMin: ageMin ? Number(ageMin) : undefined,
      ageMax: ageMax ? Number(ageMax) : undefined,
      location: location ? String(location) : undefined,
      includePending: false, // public listing only shows verified/reunited/etc.
    });

    res.json({ success: true, count: reports.length, reports });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports.', error: error.message });
  }
};

export const getReportById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid report ID.' });
      return;
    }

    const report = await db.getReportById(id);
    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    // If report is pending, only admin or creator can view it
    if (report.status === 'Pending') {
      const isOwner = req.user && req.user.id === report.user_id;
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        res.status(403).json({ success: false, message: 'This report is currently pending administrator verification.' });
        return;
      }
    }

    res.json({ success: true, report });
  } catch (error: any) {
    console.error('Error getting report by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve report.' });
  }
};

export const createReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required to file a report.' });
      return;
    }

    const {
      report_type,
      name,
      age,
      gender,
      photo_url,
      location,
      report_date,
      report_time,
      clothing_description,
      additional_info,
      contact_phone,
    } = req.body;

    if (!report_type || !gender || !photo_url || !location || !report_date || !contact_phone) {
      res.status(400).json({
        success: false,
        message: 'Missing required report fields. Please fill in all mandatory details.',
      });
      return;
    }

    if (report_type !== 'missing' && report_type !== 'found') {
      res.status(400).json({ success: false, message: 'Report type must be either "missing" or "found".' });
      return;
    }

    const parsedAge = parseInt(String(age), 10);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130) {
      res.status(400).json({ success: false, message: 'Please enter a valid age between 0 and 130.' });
      return;
    }

    // Default status is 'Pending' for review, unless admin submits it
    const initialStatus: ReportStatus = req.user.role === 'admin' 
      ? (report_type === 'missing' ? 'Missing' : 'Found')
      : 'Pending';

    const newReport = await db.createReport({
      user_id: req.user.id,
      report_type: report_type as ReportType,
      name: name ? name.trim() : (report_type === 'found' ? 'Unknown / Unidentified' : 'Unknown'),
      age: parsedAge,
      gender: gender as Gender,
      photo_url: photo_url.trim(),
      location: location.trim(),
      report_date: String(report_date).split('T')[0],
      report_time: report_time ? String(report_time).trim() : null,
      clothing_description: clothing_description ? clothing_description.trim() : null,
      additional_info: additional_info ? additional_info.trim() : null,
      contact_phone: contact_phone.trim(),
      status: initialStatus,
      admin_notes: req.user.role === 'admin' ? 'Directly created by administrator.' : null,
    });

    res.status(201).json({
      success: true,
      message: req.user.role === 'admin'
        ? 'Report created and published successfully.'
        : 'Report submitted successfully! It will be reviewed and approved by administrators.',
      report: newReport,
    });
  } catch (error: any) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, message: 'Failed to create report.', error: error.message });
  }
};

export const updateReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid report ID.' });
      return;
    }

    const existing = await db.getReportById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    const isOwner = existing.user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({ success: false, message: 'You can only edit your own reports.' });
      return;
    }

    const {
      name,
      age,
      gender,
      photo_url,
      location,
      report_date,
      report_time,
      clothing_description,
      additional_info,
      contact_phone,
      status,
      admin_notes,
    } = req.body;

    const updates: Partial<typeof existing> = {};
    if (name !== undefined) updates.name = name;
    if (age !== undefined) updates.age = parseInt(String(age), 10);
    if (gender !== undefined) updates.gender = gender;
    if (photo_url !== undefined) updates.photo_url = photo_url;
    if (location !== undefined) updates.location = location;
    if (report_date !== undefined) updates.report_date = String(report_date).split('T')[0];
    if (report_time !== undefined) updates.report_time = report_time;
    if (clothing_description !== undefined) updates.clothing_description = clothing_description;
    if (additional_info !== undefined) updates.additional_info = additional_info;
    if (contact_phone !== undefined) updates.contact_phone = contact_phone;

    // Regular users can only mark their own report as Reunited or Closed
    if (status !== undefined) {
      if (isAdmin) {
        updates.status = status;
      } else if (['Reunited', 'Closed'].includes(status)) {
        updates.status = status;
      }
    }

    if (admin_notes !== undefined && isAdmin) {
      updates.admin_notes = admin_notes;
    }

    const updated = await db.updateReport(id, updates);
    res.json({ success: true, message: 'Report updated successfully.', report: updated });
  } catch (error: any) {
    console.error('Error updating report:', error);
    res.status(500).json({ success: false, message: 'Failed to update report.' });
  }
};

export const deleteReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid report ID.' });
      return;
    }

    const existing = await db.getReportById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    const isOwner = existing.user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({ success: false, message: 'You can only delete your own reports.' });
      return;
    }

    const success = await db.deleteReport(id);
    if (success) {
      res.json({ success: true, message: 'Report deleted successfully.' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete report.' });
    }
  } catch (error: any) {
    console.error('Error deleting report:', error);
    res.status(500).json({ success: false, message: 'Failed to delete report.' });
  }
};

export const getMyReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const reports = await db.getReports({
      userId: req.user.id,
      includePending: true, // User sees all their reports including Pending
    });

    res.json({ success: true, count: reports.length, reports });
  } catch (error: any) {
    console.error('Error getting my reports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user reports.' });
  }
};

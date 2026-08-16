import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Trash2 } from 'lucide-react';
import { Report, ReportStatus, Gender } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface EditReportModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDelete?: (id: number) => void;
}

export const EditReportModal: React.FC<EditReportModalProps> = ({
  report,
  isOpen,
  onClose,
  onSuccess,
  onDelete,
}) => {
  const { isAdmin } = useAuth();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [photoUrl, setPhotoUrl] = useState('');
  const [location, setLocation] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [reportTime, setReportTime] = useState('');
  const [clothingDescription, setClothingDescription] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [status, setStatus] = useState<ReportStatus>('Pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (report) {
      setName(report.name || '');
      setAge(String(report.age));
      setGender(report.gender);
      setPhotoUrl(report.photo_url);
      setLocation(report.location);
      setReportDate(report.report_date);
      setReportTime(report.report_time || '');
      setClothingDescription(report.clothing_description || '');
      setAdditionalInfo(report.additional_info || '');
      setContactPhone(report.contact_phone);
      setStatus(report.status);
      setAdminNotes(report.admin_notes || '');
      setError(null);
    }
  }, [report]);

  if (!isOpen || !report) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setIsSaving(true);
    try {
      const res = await api.reports.update(report.id, {
        name: name.trim(),
        age: Number(age),
        gender,
        photo_url: photoUrl.trim(),
        location: location.trim(),
        report_date: reportDate,
        report_time: reportTime.trim() || null,
        clothing_description: clothingDescription.trim() || null,
        additional_info: additionalInfo.trim() || null,
        contact_phone: contactPhone.trim(),
        status,
        ...(isAdmin ? { admin_notes: adminNotes.trim() || null } : {}),
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to update report.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error occurred while saving changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Edit Case Report #{report.id}</h2>
            <p className="text-xs text-slate-400">Update person details, contact info, or case status</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Status Selection */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1.5">
              Case Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReportStatus)}
              className="w-full p-2.5 bg-white border border-blue-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-hidden"
            >
              {isAdmin && <option value="Pending">Pending (Under Review)</option>}
              <option value="Missing">Active Missing</option>
              <option value="Found">Found</option>
              <option value="Reunited">Safely Reunited (Resolved)</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Name & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Person Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Photo URL</label>
            <input
              type="text"
              required
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
              <input
                type="text"
                value={reportTime}
                onChange={(e) => setReportTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              required
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold"
            />
          </div>

          {/* Clothing */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clothing Description</label>
            <textarea
              rows={2}
              value={clothingDescription}
              onChange={(e) => setClothingDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          {/* Additional Info */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Additional Information</label>
            <textarea
              rows={2}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            />
          </div>

          {/* Admin Notes */}
          {isAdmin && (
            <div>
              <label className="block text-xs font-bold text-purple-900 mb-1">
                Admin Review Notes & Verification Details
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add verification notes, police report number, etc."
                className="w-full p-2.5 bg-purple-50/50 border border-purple-200 rounded-lg text-sm"
              />
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(report.id)}
                className="px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Report</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

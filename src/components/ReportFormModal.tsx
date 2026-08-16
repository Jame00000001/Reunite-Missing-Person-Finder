import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  AlertCircle,
  PlusCircle,
  Image as ImageIcon,
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ReportType, Gender } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: ReportType;
  onSuccess: () => void;
}

// Preset photo options to make testing effortless for professors & students
const SAMPLE_PHOTOS = [
  {
    label: 'Child / Toddler',
    url: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Elderly / Senior',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Elderly Male',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Young Teen',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
  },
];

export const ReportFormModal: React.FC<ReportFormModalProps> = ({
  isOpen,
  onClose,
  initialType = 'missing',
  onSuccess,
}) => {
  const { user, isAuthenticated } = useAuth();

  const [reportType, setReportType] = useState<ReportType>(initialType);
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<Gender>('Male');
  const [photoUrl, setPhotoUrl] = useState('');
  const [location, setLocation] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportTime, setReportTime] = useState('12:00 PM');
  const [clothingDescription, setClothingDescription] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setReportType(initialType);
    if (user?.phone && !contactPhone) {
      setContactPhone(user.phone);
    }
  }, [initialType, user]);

  if (!isOpen) return null;

  const isMissing = reportType === 'missing';

  // Handle local file upload converted to Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Photo size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setPhotoUrl(String(uploadEvent.target.result));
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      setError('You must be logged in to submit a report. Please log in or register.');
      return;
    }

    if (isMissing && !name.trim()) {
      setError('Please enter the missing person’s name.');
      return;
    }

    if (!age || isNaN(Number(age)) || Number(age) < 0 || Number(age) > 130) {
      setError('Please enter a valid age between 0 and 130.');
      return;
    }

    if (!photoUrl.trim()) {
      setError('Please provide a photo (upload or enter an image URL).');
      return;
    }

    if (!location.trim()) {
      setError(`Please specify the ${isMissing ? 'last seen location' : 'found location'}.`);
      return;
    }

    if (!reportDate) {
      setError('Please specify the date.');
      return;
    }

    if (!contactPhone.trim()) {
      setError(`Please provide the ${isMissing ? 'guardian phone number' : 'finder phone number'}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.reports.create({
        report_type: reportType,
        name: name.trim() || (isMissing ? 'Unknown Name' : 'Unidentified Person'),
        age: Number(age),
        gender,
        photo_url: photoUrl.trim(),
        location: location.trim(),
        report_date: reportDate,
        report_time: reportTime.trim() || null,
        clothing_description: clothingDescription.trim() || null,
        additional_info: additionalInfo.trim() || null,
        contact_phone: contactPhone.trim(),
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to submit report. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error occurred while submitting report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-6">
        {/* Modal Header */}
        <div
          className={`p-5 sm:p-6 text-white flex items-center justify-between ${
            isMissing ? 'bg-gradient-to-r from-rose-600 to-red-700' : 'bg-gradient-to-r from-emerald-600 to-teal-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              {isMissing ? <AlertCircle className="w-6 h-6 text-white" /> : <PlusCircle className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                {isMissing ? 'Report a Missing Person' : 'Report a Found Person'}
              </h2>
              <p className="text-xs text-white/80">
                {isMissing
                  ? 'Submit details to alert the community and emergency networks'
                  : 'Help a lost child or elderly person safely reconnect with their family'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Type Selector Tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={() => setReportType('missing')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              isMissing
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Missing Person (Search Case)</span>
          </button>

          <button
            type="button"
            onClick={() => setReportType('found')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              !isMissing
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Found Person (Safe Care Case)</span>
          </button>
        </div>

        {/* Form Error Banner */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Row 1: Name & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isMissing ? 'Full Name of Missing Person *' : 'Name of Found Person (Optional)'}
              </label>
              <input
                type="text"
                required={isMissing}
                placeholder={isMissing ? 'e.g. Lucas Davis' : 'e.g. Unknown / Emma'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isMissing ? 'Age (Years) *' : 'Est. Age *'}
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={130}
                  placeholder="e.g. 7"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Photo Upload & URL & Samples */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Photo of Person *</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste direct image URL (https://...)"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
                />
                <label className="cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Sample Photo Presets for rapid evaluator testing */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Quick Sample Photos:
                </span>
                {SAMPLE_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoUrl(sample.url)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              {/* Photo Preview */}
              {photoUrl && (
                <div className="flex items-center gap-3 p-2 bg-slate-100 rounded-xl">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setError('Invalid image URL. Please check the image link.')}
                    />
                  </div>
                  <div className="text-xs text-slate-600">
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Photo Loaded Successfully
                    </p>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{photoUrl}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              {isMissing ? 'Last Seen Location *' : 'Found Location *'}
            </label>
            <input
              type="text"
              required
              placeholder={
                isMissing
                  ? 'e.g. Greenwood Central Park Playground, Springfield'
                  : 'e.g. Metro Subway Station Entrance - North Line'
              }
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Row 4: Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                {isMissing ? 'Last Seen Date *' : 'Found Date *'}
              </label>
              <input
                type="date"
                required
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {isMissing ? 'Last Seen Time' : 'Found Time'}
              </label>
              <input
                type="text"
                placeholder="e.g. 04:30 PM"
                value={reportTime}
                onChange={(e) => setReportTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 5: Clothing Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Clothing Description (Colors, Jacket, Shoes, Accessories)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Blue dinosaur t-shirt, beige shorts, red light-up sneakers, wearing glasses"
              value={clothingDescription}
              onChange={(e) => setClothingDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Row 6: Additional Information */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Additional Information (Medical conditions, Memory loss, Identifying marks, Languages)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Friendly, responds to nickname Luke, has mild memory disorientation, carrying a small backpack..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Row 7: Contact Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              {isMissing ? 'Guardian Contact Phone Number *' : 'Finder Contact Phone Number *'}
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. +1 (555) 234-5678"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-blue-500 font-medium"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all ${
                isMissing
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              } disabled:opacity-50`}
            >
              {isSubmitting
                ? 'Submitting...'
                : isMissing
                ? 'Submit Missing Person Report'
                : 'Submit Found Person Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

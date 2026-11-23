import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Printer,
  Share2,
  Check,
  ShieldCheck,
  HeartHandshake,
  AlertTriangle,
  FileText,
  User as UserIcon,
  Tag,
} from 'lucide-react';
import { Report } from '../types/index.ts';
import { ReportLocationMap } from './maps/ReportLocationMap.tsx';

interface PersonDetailModalProps {
  report: Report | null;
  onClose: () => void;
  onPrintPoster: (report: Report) => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  report,
  onClose,
  onPrintPoster,
}) => {
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const isMissing = report.report_type === 'missing';

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(report.contact_phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Missing':
        return 'bg-rose-600 text-white';
      case 'Found':
        return 'bg-emerald-600 text-white';
      case 'Reunited':
        return 'bg-teal-600 text-white';
      case 'Closed':
        return 'bg-slate-600 text-white';
      default:
        return 'bg-amber-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-8">
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center transition-all shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Banner with Type & Status */}
        <div
          className={`px-6 py-4 flex flex-wrap items-center justify-between gap-3 ${
            isMissing ? 'bg-rose-50 border-b border-rose-100' : 'bg-emerald-50 border-b border-emerald-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                isMissing ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {isMissing ? 'Missing Person Case' : 'Found Person Report'}
            </span>
            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(report.status)}`}>
              Status: {report.status}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500">Case ID: #REP-{report.id.slice(0, 8)}</span>
        </div>

        {/* Main Body Grid */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Photo */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full aspect-4/5 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner relative">
                <img
                  src={report.photo_url}
                  alt={report.name || 'Person'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Poster Print Button */}
              <button
                onClick={() => onPrintPoster(report)}
                className="w-full mt-3 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Printer className="w-4 h-4 text-rose-600" />
                <span>Generate Printable Flyer / Poster</span>
              </button>
            </div>

            {/* Right Column: Key Details */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {report.name || (isMissing ? 'Unknown Name' : 'Unidentified Person')}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold">
                    {report.age} Years Old
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold">
                    {report.gender}
                  </span>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold">
                    {report.age <= 17 ? 'Minor / Child' : report.age >= 60 ? 'Senior / Elderly' : 'Adult'}
                  </span>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-start gap-2 text-sm text-slate-800">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase block">
                      {isMissing ? 'Last Seen Location' : 'Found Location'}
                    </span>
                    <p className="font-semibold text-slate-900">{report.location}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      <strong>Date:</strong> {report.report_date}
                    </span>
                  </div>
                  {report.report_time && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        <strong>Time:</strong> {report.report_time}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Box */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider uppercase text-blue-200 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {isMissing ? 'Guardian / Family Contact' : 'Finder Contact Number'}
                  </span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white font-medium">
                    Verified
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xl sm:text-2xl font-black tracking-tight">
                    {report.contact_phone}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${report.contact_phone}`}
                    className="py-2 px-3 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Directly</span>
                  </a>
                  <button
                    onClick={handleCopyPhone}
                    className="py-2 px-3 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Phone Copied!' : 'Copy Number'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Extended Details Section */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <ReportLocationMap
              latitude={report.latitude}
              longitude={report.longitude}
              locationLabel={report.location}
              personName={report.name || (isMissing ? 'Missing Person' : 'Found Person')}
              isMissing={isMissing}
            />

            {/* Clothing Description */}
            {report.clothing_description && (
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-700" />
                  Clothing & Physical Appearance
                </h4>
                <p className="text-sm text-slate-800 font-medium leading-relaxed">
                  {report.clothing_description}
                </p>
              </div>
            )}

            {/* Additional Info / Medical Notes */}
            {report.additional_info && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Additional Information / Identifying Marks / Medical
                </h4>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {report.additional_info}
                </p>
              </div>
            )}

            {/* Admin Notes if any */}
            {report.admin_notes && (
              <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-200 flex items-start gap-2 text-xs text-indigo-900">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Official Verification Note:</strong> {report.admin_notes}
                </div>
              </div>
            )}

            {/* Safety notice */}
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs flex items-start gap-2 border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>
                If you have seen this person or have immediate emergency information, please contact the guardian
                above or call national emergency services <strong>(999 / 911 / 109)</strong> right away.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

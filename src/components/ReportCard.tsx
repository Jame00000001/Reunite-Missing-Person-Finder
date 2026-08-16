import React from 'react';
import {
  MapPin,
  Calendar,
  Phone,
  Clock,
  Eye,
  Printer,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon,
} from 'lucide-react';
import { Report } from '../types/index.ts';

interface ReportCardProps {
  report: Report;
  onViewDetails: (report: Report) => void;
  onPrintPoster?: (report: Report) => void;
  onQuickContact?: (phone: string) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onViewDetails,
  onPrintPoster,
  onQuickContact,
}) => {
  const isMissing = report.report_type === 'missing';

  // Status Styling Config
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Missing':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          dot: 'bg-rose-600',
          label: 'Active Missing',
        };
      case 'Found':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
          label: 'Found Person',
        };
      case 'Reunited':
        return {
          bg: 'bg-teal-100 text-teal-800 border-teal-200',
          dot: 'bg-teal-600',
          label: 'Safely Reunited',
        };
      case 'Closed':
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          dot: 'bg-slate-500',
          label: 'Case Closed',
        };
      case 'Pending':
      default:
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          dot: 'bg-amber-600',
          label: 'Pending Review',
        };
    }
  };

  const statusConfig = getStatusBadge(report.status);

  // Age group helper
  const getAgeCategory = (age: number) => {
    if (age <= 12) return 'Child';
    if (age <= 17) return 'Teen';
    if (age >= 60) return 'Elderly / Senior';
    return 'Adult';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-xs hover:shadow-md transition-all duration-200 group">
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={report.photo_url}
          alt={report.name || 'Person Photo'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback placeholder
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          {/* Report Type Pill Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border shadow-xs ${
              isMissing
                ? 'bg-rose-100 text-rose-700 border-rose-200'
                : 'bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}
          >
            {isMissing ? 'Missing' : 'Found'}
          </span>

          {/* Age Category Pill */}
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-xs">
            {getAgeCategory(report.age)} ({report.age}y)
          </span>
        </div>

        {/* Status Badge Top Right */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs bg-white/95 backdrop-blur-md ${statusConfig.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
        </div>

        {/* Bottom overlay date */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-3 pt-6 text-white text-xs flex items-center justify-between font-medium">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-300" />
            {report.report_date}
          </span>
          {report.report_time && (
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3 h-3" />
              {report.report_time}
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Name & Demographic info */}
          <div className="mb-2.5">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {report.name || (isMissing ? 'Unknown Name' : 'Unidentified Person')}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {report.gender} • {report.age} Years Old
            </p>
          </div>

          {/* Location Details */}
          <div className="flex items-start gap-1.5 text-xs text-slate-700 font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              <strong className="text-slate-900">{isMissing ? 'Last Seen:' : 'Found At:'}</strong>{' '}
              {report.location}
            </span>
          </div>

          {/* Clothing or snippet */}
          {report.clothing_description && (
            <p className="text-xs text-slate-600 line-clamp-2 mb-2.5 bg-amber-50/80 text-amber-950 p-2 rounded-lg border border-amber-200/60">
              <strong className="text-amber-900 font-semibold">Clothing:</strong> {report.clothing_description}
            </p>
          )}

          {/* Additional Info snippet */}
          {report.additional_info && !report.clothing_description && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-2.5 italic">
              "{report.additional_info}"
            </p>
          )}
        </div>

        {/* Card Actions Footer */}
        <div className="pt-3 border-t border-slate-100 mt-1 space-y-2">
          {/* Guardian / Finder Contact Quick Bar */}
          <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 font-medium truncate">
              {isMissing ? 'Guardian:' : 'Finder:'}
            </span>
            <a
              href={`tel:${report.contact_phone}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onQuickContact) onQuickContact(report.contact_phone);
              }}
              className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Phone className="w-3 h-3" /> {report.contact_phone}
            </a>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              onClick={() => onViewDetails(report)}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Full Details</span>
            </button>

            {onPrintPoster ? (
              <button
                onClick={() => onPrintPoster(report)}
                className="w-full py-2 px-3 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-rose-600" />
                <span>Flyer / Poster</span>
              </button>
            ) : (
              <a
                href={`tel:${report.contact_phone}`}
                className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

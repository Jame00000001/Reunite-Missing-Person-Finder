import React from 'react';
import { X, Printer, Phone, MapPin, Calendar, AlertOctagon } from 'lucide-react';
import { Report } from '../types/index.ts';

interface MissingPosterModalProps {
  report: Report | null;
  onClose: () => void;
}

export const MissingPosterModal: React.FC<MissingPosterModalProps> = ({ report, onClose }) => {
  if (!report) return null;

  const isMissing = report.report_type === 'missing';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-300 relative my-4">
        {/* Modal Controls (Hidden when printing) */}
        <div className="bg-slate-900 text-white p-3.5 px-6 flex items-center justify-between print:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Printer className="w-4 h-4 text-blue-400" />
            Printable Alert Poster Generator
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Poster Area */}
        <div className="p-6 sm:p-8 bg-white print:p-0 print:m-0" id="printable-poster">
          {/* Main Poster Header */}
          <div
            className={`text-center py-4 px-2 rounded-xl mb-4 border-4 ${
              isMissing ? 'bg-red-600 text-white border-red-800' : 'bg-emerald-700 text-white border-emerald-900'
            }`}
          >
            <h1 className="text-3xl sm:text-4xl font-black tracking-widest uppercase flex items-center justify-center gap-2">
              <AlertOctagon className="w-8 h-8 shrink-0" />
              {isMissing ? 'MISSING PERSON' : 'FOUND PERSON'}
            </h1>
            <p className="text-xs sm:text-sm font-bold tracking-widest uppercase mt-0.5 opacity-90">
              PLEASE HELP US REUNITE THIS FAMILY • CALL IMMEDIATELY
            </p>
          </div>

          {/* Picture and Demographics */}
          <div className="flex flex-col sm:flex-row gap-6 items-center mb-6">
            <div className="w-48 h-56 sm:w-56 sm:h-64 shrink-0 rounded-xl overflow-hidden border-4 border-slate-900 shadow-md bg-slate-100">
              <img
                src={report.photo_url}
                alt={report.name || 'Person'}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {report.name || (isMissing ? 'Name Unknown' : 'Unidentified Individual')}
              </h2>
              <div className="inline-flex gap-2 text-sm font-bold text-slate-700">
                <span className="bg-slate-100 px-3 py-1 rounded-md border border-slate-300">
                  Age: {report.age}
                </span>
                <span className="bg-slate-100 px-3 py-1 rounded-md border border-slate-300">
                  Gender: {report.gender}
                </span>
              </div>

              <div className="pt-2 text-sm space-y-1 text-slate-800 font-medium">
                <p className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    <strong>{isMissing ? 'Last Seen:' : 'Found At:'}</strong> {report.location}
                  </span>
                </p>
                <p className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Date:</strong> {report.report_date} {report.report_time && `at ${report.report_time}`}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Description Box */}
          <div className="border-2 border-dashed border-slate-400 p-4 rounded-xl mb-6 bg-slate-50 space-y-2 text-xs sm:text-sm text-slate-800">
            {report.clothing_description && (
              <p>
                <strong className="font-bold text-slate-900 uppercase">Clothing Description: </strong>
                {report.clothing_description}
              </p>
            )}
            {report.additional_info && (
              <p>
                <strong className="font-bold text-slate-900 uppercase">Key Identifying Details / Health: </strong>
                {report.additional_info}
              </p>
            )}
          </div>

          {/* Big Emergency Contact Callout */}
          <div className="bg-slate-900 text-white p-5 rounded-xl text-center border-4 border-amber-400">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
              {isMissing ? 'ANY INFORMATION? CONTACT GUARDIAN / POLICE:' : 'ARE YOU THE FAMILY? CONTACT FINDER:'}
            </p>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <Phone className="w-7 h-7 text-emerald-400" />
              <span>{report.contact_phone}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-semibold">
              Or call National Emergency Helpline: 999 / 911 / 109
            </p>
          </div>

          {/* Project Tagline */}
          <div className="text-center mt-4 text-[10px] text-slate-500">
            Reunite Missing Person Finder System • Verified Public Case ID: #REP-{report.id}
          </div>
        </div>
      </div>
    </div>
  );
};

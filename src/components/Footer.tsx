import React from 'react';
import { Users, PhoneCall, Shield, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600">
      {/* Upper Footer Links and Hotlines */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Reunite</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Finder
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
              A university Software Engineering project dedicated to helping families quickly report,
              locate, and safely reunite with missing children and vulnerable elderly individuals.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" /> Verified Guardians
              </span>
              <span className="flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-blue-600" /> Community Supported
              </span>
            </div>
          </div>

          {/* Emergency Helplines */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Emergency Hotlines
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-rose-600 font-bold">
                <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                <span>Police Emergency: 999 / 911</span>
              </li>
              <li className="flex items-center gap-2 text-amber-700 font-semibold">
                <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                <span>Child Helpline: 109</span>
              </li>
              <li className="flex items-center gap-2 text-blue-700 font-semibold">
                <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                <span>Senior Helpline: 1098</span>
              </li>
              <li className="text-[11px] text-slate-400 pt-0.5">
                Available 24 hours a day, 7 days a week.
              </li>
            </ul>
          </div>

          {/* Project Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              System Architecture
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>Course: Software Engineering</li>
              <li>Frontend: React 19 + TypeScript + Tailwind</li>
              <li>Backend: Node.js + Express REST API</li>
              <li>Database: MySQL (reunite_db)</li>
              <li>Security: JWT + BCrypt Password Hash</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Compact Copyright Bar */}
      <div className="border-t border-slate-200 py-4 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} Reunite – Missing Person Finder. All rights reserved.</p>
          <p className="text-[11px] text-slate-400">
            Geometric Balance Design Architecture • University Project
          </p>
        </div>
      </div>
    </footer>
  );
};

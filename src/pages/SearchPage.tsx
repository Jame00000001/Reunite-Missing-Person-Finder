import React from 'react';
import { Search, AlertCircle, PlusCircle, Frown } from 'lucide-react';
import { Report } from '../types/index.ts';
import { ReportCard } from '../components/ReportCard.tsx';
import { SearchFilters, FilterState } from '../components/SearchFilters.tsx';

interface SearchPageProps {
  reports: Report[];
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onViewDetails: (report: Report) => void;
  onPrintPoster: (report: Report) => void;
  onOpenReportMissing: () => void;
  onOpenReportFound: () => void;
  isLoading: boolean;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  reports,
  filters,
  onFilterChange,
  onResetFilters,
  onViewDetails,
  onPrintPoster,
  onOpenReportMissing,
  onOpenReportFound,
  isLoading,
}) => {
  // Client-side age categorization filter helper
  const filteredReports = reports.filter((r) => {
    if (filters.ageCategory && filters.ageCategory !== 'all') {
      if (filters.ageCategory === 'child' && r.age > 12) return false;
      if (filters.ageCategory === 'teen' && (r.age < 13 || r.age > 17)) return false;
      if (filters.ageCategory === 'adult' && (r.age < 18 || r.age > 59)) return false;
      if (filters.ageCategory === 'elderly' && r.age < 60) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Search Missing & Found Persons Directory
          </h1>
          <p className="text-sm text-slate-500">
            Filter by name, age, gender, location, status, or report type
          </p>
        </div>

        {/* Quick Report Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReportMissing}
            className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-colors"
          >
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Report Missing</span>
          </button>

          <button
            onClick={onOpenReportFound}
            className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Report Found</span>
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <SearchFilters
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onResetFilters}
        totalResults={filteredReports.length}
      />

      {/* Results Section */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading cases...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Frown className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">No Matching Persons Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search keywords, clearing age/gender filters, or checking city spellings.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2">
            <button
              onClick={onResetFilters}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Clear All Filters
            </button>
            <button
              onClick={onOpenReportMissing}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Report Missing Person
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onViewDetails={onViewDetails}
              onPrintPoster={onPrintPoster}
            />
          ))}
        </div>
      )}
    </div>
  );
};

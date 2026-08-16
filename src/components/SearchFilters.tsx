import React from 'react';
import { Search, RotateCcw, SlidersHorizontal, MapPin, Tag } from 'lucide-react';

export interface FilterState {
  search: string;
  type: string; // 'all' | 'missing' | 'found'
  gender: string; // 'all' | 'Male' | 'Female' | 'Other'
  status: string; // 'all' | 'Missing' | 'Found' | 'Reunited' | 'Closed'
  ageCategory: string; // 'all' | 'child' | 'teen' | 'adult' | 'elderly'
  location: string;
}

interface SearchFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  totalResults: number;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalResults,
}) => {
  const isFiltered =
    Boolean(filters.search) ||
    filters.type !== 'all' ||
    filters.gender !== 'all' ||
    filters.status !== 'all' ||
    filters.ageCategory !== 'all' ||
    Boolean(filters.location);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 mb-6">
      {/* Top Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by person name, clothing, landmark, or description..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        <div className="relative sm:w-64">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter by city / area..."
            value={filters.location}
            onChange={(e) => onFilterChange({ location: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5" /> Type:
        </span>
        <button
          onClick={() => onFilterChange({ type: 'all' })}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filters.type === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Cases
        </button>
        <button
          onClick={() => onFilterChange({ type: 'missing' })}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filters.type === 'missing'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          Missing People
        </button>
        <button
          onClick={() => onFilterChange({ type: 'found' })}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filters.type === 'found'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          Found People
        </button>
      </div>

      {/* Dropdown Filters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Status */}
        <div>
          <label className="block text-slate-600 font-bold mb-1">Case Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:border-blue-600"
          >
            <option value="all">All Statuses</option>
            <option value="Missing">Active Missing</option>
            <option value="Found">Found</option>
            <option value="Reunited">Reunited</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-slate-600 font-bold mb-1">Gender</label>
          <select
            value={filters.gender}
            onChange={(e) => onFilterChange({ gender: e.target.value })}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:border-blue-600"
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Age Category */}
        <div>
          <label className="block text-slate-600 font-bold mb-1">Age Group</label>
          <select
            value={filters.ageCategory}
            onChange={(e) => onFilterChange({ ageCategory: e.target.value })}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:border-blue-600"
          >
            <option value="all">All Ages</option>
            <option value="child">Child (0 - 12 yrs)</option>
            <option value="teen">Teen (13 - 17 yrs)</option>
            <option value="adult">Adult (18 - 59 yrs)</option>
            <option value="elderly">Elderly / Senior (60+ yrs)</option>
          </select>
        </div>

        {/* Results count & Clear */}
        <div className="flex flex-col justify-end">
          {isFiltered ? (
            <button
              onClick={onReset}
              className="w-full p-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-bold hover:bg-rose-100 flex items-center justify-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          ) : (
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg text-center font-semibold text-xs">
              Showing {totalResults} cases
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

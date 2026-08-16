import React, { useState } from 'react';
import {
  Users,
  Search,
  PlusCircle,
  ShieldCheck,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  X,
  AlertCircle,
  PhoneCall,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenReportMissing: () => void;
  onOpenReportFound: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  pendingCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenReportMissing,
  onOpenReportFound,
  onOpenAuth,
  pendingCount = 0,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Emergency Hotline Banner */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-slate-300">24/7 Missing Person Emergency Hotline:</span>
            <a href="tel:999" className="underline font-bold text-rose-300 hover:text-white flex items-center gap-1">
              <PhoneCall className="w-3 h-3" /> 999 / 109 / (800) 555-0199
            </a>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-400 text-xs">
            <span>University Software Engineering Final Project</span>
            <span className="text-slate-600">•</span>
            <span>Verified Guardian Network</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-hidden"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-800">Reunite</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  Finder
                </span>
              </div>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-sm font-semibold transition-all py-1 ${
                currentTab === 'home'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavClick('search')}
              className={`text-sm font-medium transition-all py-1 flex items-center gap-1.5 ${
                currentTab === 'search'
                  ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search Directory</span>
            </button>

            <div className="h-6 w-[1px] bg-slate-200" />

            {/* Quick Action: Report Missing */}
            <button
              onClick={onOpenReportMissing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-xs"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Report Missing</span>
            </button>

            {/* Quick Action: Report Found */}
            <button
              onClick={onOpenReportFound}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Report Found</span>
            </button>

            {/* Dashboard Link if Logged In */}
            {isAuthenticated && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`text-sm font-medium transition-all py-1 flex items-center gap-1.5 ${
                  currentTab === 'dashboard'
                    ? 'text-blue-600 border-b-2 border-blue-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Reports</span>
              </button>
            )}

            {/* Admin Portal Link - Always accessible */}
            <button
              onClick={() => handleNavClick('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'admin'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Admin Portal</span>
              {pendingCount > 0 && (
                <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-amber-500 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          </nav>

          {/* Desktop Right Auth Section */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="h-6 w-[1px] bg-slate-200" />
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight">{user.name}</span>
                  <span className="text-[10px] text-slate-500 flex items-center justify-end gap-1 font-medium">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        user.role === 'admin' ? 'bg-purple-500' : 'bg-emerald-500'
                      }`}
                    />
                    {user.role === 'admin' ? 'Admin' : 'Guardian'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-xs transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'home' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('search')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
              currentTab === 'search' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search People</span>
          </button>
          <div className="grid grid-cols-2 gap-2 pt-2 pb-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReportMissing();
              }}
              className="px-3 py-2.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 flex items-center justify-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Report Missing</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReportFound();
              }}
              className="px-3 py-2.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Report Found</span>
            </button>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                currentTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>My Dashboard</span>
            </button>
          )}

          {/* Admin Portal Link */}
          <button
            onClick={() => handleNavClick('admin')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
              currentTab === 'admin'
                ? 'bg-purple-100 text-purple-800 font-bold'
                : 'text-purple-700 bg-purple-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Admin Portal</span>
            </div>
            {pendingCount > 0 && (
              <span className="text-xs bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">
                {pendingCount} Pending
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="flex-1 py-2 text-center text-sm font-semibold border border-slate-300 rounded-lg text-slate-700"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('register');
                }}
                className="flex-1 py-2 text-center text-sm font-semibold bg-blue-600 text-white rounded-lg"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

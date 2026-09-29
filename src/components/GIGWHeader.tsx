import React from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, RefreshCw, Globe } from 'lucide-react';
import { AppView, UserRole } from '../types';
import { PORTAL_CONFIG, SUPPORTED_LANGUAGES, SupportedLanguage } from '../config';

export const GIGWHeader: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    activeRole, 
    setActiveRole, 
    fontSize, 
    setFontSize, 
    language, 
    setLanguage,
    grievances,
    t,
    showToast
  } = useApp();

  const openGrievanceCount = grievances.filter(g => g.status === 'OPEN').length;

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
  };

  const handleRoleToggle = () => {
    const newRole: UserRole = activeRole === 'MINISTER_ADMIN' ? 'DISTRICT_NODAL_OFFICER' : 'MINISTER_ADMIN';
    setActiveRole(newRole);
  };

  return (
    <header className="w-full bg-white shadow-sm z-30 select-none border-b border-slate-300">
      
      {/* Ribbon 1: Utility Ribbon (Dark GoI Blue) */}
      <div className="bg-[#1D0A69] text-white px-4 py-1 text-xs border-b border-[#FF9933] flex justify-between items-center font-sans">
        <div className="flex items-center space-x-3">
          <span className="font-semibold tracking-wide">
            {t('gov_india')}
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-200">
            {t('mota_name')}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <a href="#main-content" className="hover:underline text-slate-200 text-[11px]">
            {t('skip_content')}
          </a>
          <span className="text-slate-400">|</span>
          
          {/* Font Size Selector (GIGW A- A A+) */}
          <div className="flex items-center space-x-1 border border-indigo-400/40 px-1 py-0.5 rounded bg-[#14064a]">
            <button 
              onClick={() => setFontSize('sm')} 
              className={`px-1 text-[10px] hover:text-amber-300 font-bold ${fontSize === 'sm' ? 'text-amber-300 underline' : ''}`}
              title="Decrease font size"
            >
              A-
            </button>
            <button 
              onClick={() => setFontSize('base')} 
              className={`px-1 text-[11px] hover:text-amber-300 font-bold ${fontSize === 'base' ? 'text-amber-300 underline' : ''}`}
              title="Standard font size"
            >
              A
            </button>
            <button 
              onClick={() => setFontSize('lg')} 
              className={`px-1 text-[12px] hover:text-amber-300 font-bold ${fontSize === 'lg' ? 'text-amber-300 underline' : ''}`}
              title="Increase font size"
            >
              A+
            </button>
          </div>

          <span className="text-slate-400">|</span>

          {/* Regional Language Selector (Bhashini AI) */}
          <div className="flex items-center space-x-1">
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <select
              value={language}
              onChange={(e) => {
                const nextLang = e.target.value as SupportedLanguage;
                setLanguage(nextLang);
                const selectedObj = SUPPORTED_LANGUAGES.find(l => l.code === nextLang);
                showToast(`Language switched to ${selectedObj?.nativeName} (${selectedObj?.name}) via Bhashini AI`, 'info');
              }}
              className="bg-[#14064a] text-amber-300 text-[11px] font-bold border border-indigo-400/40 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ribbon 2: Branding Ribbon (Tall White Background) */}
      <div className="px-5 py-2.5 flex justify-between items-center border-b border-slate-300 bg-white">
        <div className="flex items-center space-x-4">
          {/* National Emblem Lion Capital SVG */}
          <div className="flex items-center justify-center p-1 bg-amber-50/50 border border-slate-300 rounded w-12 h-14 shadow-xs">
            <svg className="w-9 h-12 text-[#1D0A69]" viewBox="0 0 100 130" fill="currentColor">
              <path d="M50 5 C35 5 25 15 25 30 C25 42 32 50 38 55 C32 60 20 70 20 85 C20 100 35 110 50 110 C65 110 80 100 80 85 C68 50 75 42 75 30 C75 15 65 5 50 5 Z M50 20 C55 20 60 24 60 30 C60 36 55 40 50 40 C45 40 40 36 40 30 C40 24 45 20 50 20 Z" opacity="0.9"></path>
              <rect x="30" y="112" width="40" height="4" fill="#1D0A69"></rect>
              <circle cx="50" cy="122" r="6" fill="none" stroke="#1D0A69" strokeWidth="2"></circle>
              <rect x="20" y="127" width="60" height="3" fill="#1D0A69"></rect>
            </svg>
          </div>

          <div>
            <div className="font-serif text-lg font-bold text-[#1D0A69] leading-tight tracking-tight">
              {PORTAL_CONFIG.GOVERNMENT_MINISTRY_HI}
            </div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">
              {t('mota_name').toUpperCase()}
            </div>
            <div className="text-[11px] font-semibold text-[#138808] uppercase tracking-wider flex items-center gap-1.5">
              <span>{t('mota_sub')}</span>
              <span className="bg-amber-100 text-amber-900 text-[9px] px-1.5 py-0.2 rounded border border-amber-300 font-mono">
                {PORTAL_CONFIG.GAZETTE_VERSION}
              </span>
            </div>
          </div>
        </div>

        {/* Partner GoI Badges */}
        <div className="hidden md:flex items-center space-x-4 divide-x divide-slate-300">
          <div className="px-2 text-center">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Digital Identity</div>
            <div className="font-serif font-bold text-xs text-[#1D0A69]">e-Pramaan / Aadhaar</div>
          </div>
          
          <div className="px-3 flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center bg-blue-50 text-[#1D0A69] font-bold text-xs">
              🇮🇳
            </div>
            <div className="text-left leading-none">
              <span className="text-[11px] font-bold text-slate-800 block">Digital India</span>
              <span className="text-[9px] text-slate-500">Power To Empower</span>
            </div>
          </div>

          <div className="pl-3 flex items-center space-x-2">
            <div className="w-8 h-8 rounded border border-slate-300 flex items-center justify-center bg-slate-100 text-[#1D0A69] font-extrabold text-[10px]">
              NIC
            </div>
            <div className="text-left leading-none">
              <span className="text-[11px] font-bold text-slate-800 block">NIC Cloud</span>
              <span className="text-[9px] text-slate-500">MeghRaj Staging</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ribbon 3: Navigation Ribbon (Saffron top-border, dark blue bg) */}
      {currentView !== 'LOGIN' && (
        <nav className="bg-[#1D0A69] border-t-2 border-[#FF9933] px-4 text-white text-xs font-semibold flex flex-wrap justify-between items-center">
          
          <div className="flex flex-wrap space-x-1">
            {/* Role A Links (Minister Admin) */}
            {activeRole === 'MINISTER_ADMIN' && (
              <>
                <button 
                  onClick={() => handleNavClick('MINISTER_DASHBOARD')}
                  className={`px-3 py-2 ${currentView === 'MINISTER_DASHBOARD' ? 'text-white bg-[#14064a] border-b-2 border-[#FF9933]' : 'text-slate-200 hover:text-white hover:bg-[#281382]'}`}
                >
                  {t('nav_dashboard')}
                </button>
                <button 
                  onClick={() => handleNavClick('RULE_ENGINE')}
                  className={`px-3 py-2 ${currentView === 'RULE_ENGINE' ? 'text-white bg-[#14064a] border-b-2 border-[#FF9933]' : 'text-slate-200 hover:text-white hover:bg-[#281382]'}`}
                >
                  {t('nav_rules')}
                </button>
                <button 
                  onClick={() => handleNavClick('PFMS')}
                  className={`px-3 py-2 ${currentView === 'PFMS' ? 'text-white bg-[#14064a] border-b-2 border-[#FF9933]' : 'text-slate-200 hover:text-white hover:bg-[#281382]'}`}
                >
                  {t('nav_pfms')}
                </button>
              </>
            )}

            {/* Role B Links (District Nodal Officer) */}
            {activeRole === 'DISTRICT_NODAL_OFFICER' && (
              <>
                <button 
                  onClick={() => handleNavClick('DNO_DASHBOARD')}
                  className={`px-3 py-2 ${currentView === 'DNO_DASHBOARD' ? 'text-white bg-[#14064a] border-b-2 border-[#FF9933]' : 'text-slate-200 hover:text-white hover:bg-[#281382]'}`}
                >
                  {t('nav_dno_dashboard')}
                </button>
                <button 
                  onClick={() => handleNavClick('TRIAGE')}
                  className={`px-3 py-2 ${currentView === 'TRIAGE' ? 'text-white bg-[#14064a] border-b-2 border-[#FF9933]' : 'text-slate-200 hover:text-white hover:bg-[#281382]'}`}
                >
                  {t('nav_triage')}
                </button>
              </>
            )}

            {/* Grievances Link */}
            <button 
              onClick={() => handleNavClick('GRIEVANCE')}
              className={`px-3 py-2 flex items-center ${currentView === 'GRIEVANCE' ? 'text-white bg-[#14064a] border-b-2 border-[#FF9933]' : 'text-slate-200 hover:text-white hover:bg-[#281382]'}`}
            >
              <span>{t('nav_grievance')}</span>
              {openGrievanceCount > 0 && (
                <span className="ml-1.5 bg-amber-400 text-slate-900 px-1 py-0.2 rounded text-[10px] font-bold">
                  {openGrievanceCount}
                </span>
              )}
            </button>
          </div>

          {/* User Profile & Role Switcher */}
          <div className="flex items-center space-x-3 py-1">
            
            {/* ROLE SWITCHER TOGGLE - EASILY REMOVABLE IN PROD VIA PORTAL_CONFIG */}
            {PORTAL_CONFIG.SHOW_DEMO_ROLE_SWITCHER && (
              <button 
                onClick={handleRoleToggle}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-bold px-2.5 py-1 rounded border border-amber-600 flex items-center space-x-1 cursor-pointer shadow-xs"
                title="Toggle Super Admin / District Officer (src/config.ts: SHOW_DEMO_ROLE_SWITCHER)"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Role: {activeRole === 'MINISTER_ADMIN' ? 'Minister Admin' : 'District Officer (DNO)'}</span>
              </button>
            )}

            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-amber-200 font-bold block">
                {activeRole === 'MINISTER_ADMIN' ? 'Shri S.K. Murmu, IAS' : 'Shri R.K. Oraon, DWO'}
              </span>
              <span className="text-[10px] text-slate-300">
                {activeRole === 'MINISTER_ADMIN' ? 'Joint Secretary (Scholarships)' : 'District Welfare Officer (Ranchi)'}
              </span>
            </div>

            <button 
              onClick={() => {
                setCurrentView('LOGIN');
                showToast('Logged out securely from NIC Session.', 'info');
              }} 
              className="bg-red-700 hover:bg-red-800 text-white text-[11px] font-bold px-2.5 py-1 rounded border border-red-900 flex items-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>{t('logout')}</span>
            </button>
          </div>

        </nav>
      )}

    </header>
  );
};

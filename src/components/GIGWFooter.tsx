import React from 'react';
import { useApp } from '../context/AppContext';

export const GIGWFooter: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <footer className="bg-[#0E1B38] text-slate-300 text-xs border-t-2 border-[#FF9933] select-none font-sans z-30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-700 pb-3 mb-3 text-[11px]">
          <div className="flex flex-wrap gap-4 text-slate-300 font-medium mb-2 md:mb-0">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-300">Website Policies</a>
            <span className="text-slate-600">|</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-300">Terms of Use</a>
            <span className="text-slate-600">|</span>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('GRIEVANCE'); }} className="hover:text-amber-300">Helpdesk & Grievance Redressal</a>
            <span className="text-slate-600">|</span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-300">GIGW 3.0 Compliance Certificate</a>
          </div>
          <div className="text-[10px] text-slate-400">
            Last Reviewed & Updated: <strong>30-Sep-2026 09:30 IST</strong>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 leading-normal">
          <div>
            Website Content Owned and Managed by <strong>Ministry of Tribal Affairs, Government of India</strong>.<br />
            Designed, Developed and Hosted by <strong>National Informatics Centre (NIC)</strong>.
          </div>
          <div className="flex items-center space-x-3 mt-2 md:mt-0">
            <div className="border border-slate-600 px-2 py-1 bg-slate-800 text-[10px] font-bold text-slate-200">
              W3C WAI-AA WCAG 2.1
            </div>
            <div className="border border-slate-600 px-2 py-1 bg-slate-800 text-[10px] font-bold text-slate-200">
              STQC Certified
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

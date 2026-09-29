import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, AlertCircle, ArrowRight, AlertTriangle } from 'lucide-react';

export const DNODashboardView: React.FC = () => {
  const { applications, setCurrentView, setTriageFolder, openSplitReviewForApp, t } = useApp();

  const assignedCount = applications.length;
  const verifiedCount = applications.filter(a => (a.aiConfidenceScore >= 95 || a.status === 'AUTO_VERIFIED') && a.status !== 'APPROVED' && a.status !== 'DEFECTIVE' && a.status !== 'REJECTED').length;
  const manualCount = applications.filter(a => ((a.aiConfidenceScore >= 50 && a.aiConfidenceScore < 95) || a.status === 'NEEDS_REVIEW') && a.status !== 'APPROVED' && a.status !== 'DEFECTIVE' && a.status !== 'REJECTED').length;
  const defectCount = applications.filter(a => a.status === 'DEFECTIVE').length;

  const flaggedCases = applications.filter(a => 
    (a.incomeMismatch || a.status === 'FLAGGED' || a.status === 'NEEDS_REVIEW') && 
    a.status !== 'APPROVED' && 
    a.status !== 'DEFECTIVE' && 
    a.status !== 'REJECTED'
  ).slice(0, 3);

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="bg-white border-l-4 border-[#138808] border-t border-r border-b border-slate-300 p-3 flex flex-wrap justify-between items-center gap-2">
        <div>
          <span className="text-xs font-bold text-slate-900">
            District Nodal Office: Ranchi (Jharkhand) & Bastar (CG) Scrutiny Cell
          </span>
          <span className="text-xs text-slate-600 ml-2">
            Nodal Officer: <strong>Shri R.K. Oraon, DWO</strong> | State Gateway: JH-01
          </span>
        </div>
        <button 
          onClick={() => setCurrentView('TRIAGE')}
          className="btn-nic btn-nic-success text-[11px] cursor-pointer"
        >
          Open Smart Verification Desk
        </button>
      </div>

      {/* KPI Widgets for DNO Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        
        <div className="bg-white border-2 border-slate-300 p-3">
          <div className="text-[11px] font-bold uppercase text-slate-500">{t('kpi_assigned_apps')}</div>
          <div className="text-2xl font-bold text-[#1D0A69] mt-1 font-sans">{assignedCount}</div>
          <div className="text-[11px] text-slate-600 mt-1">
            District Queue Balance
          </div>
        </div>

        <div className="bg-white border-2 border-green-600 p-3">
          <div className="text-[11px] font-bold uppercase text-green-800 flex justify-between items-center">
            <span>{t('kpi_ai_verified')}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
          </div>
          <div className="text-2xl font-bold text-green-700 mt-1 font-sans">{verifiedCount}</div>
          <div className="text-[11px] text-green-800 mt-1">
            Pending Batch Sanction
          </div>
        </div>

        <div className="bg-white border-2 border-amber-500 p-3">
          <div className="text-[11px] font-bold uppercase text-amber-800 flex justify-between items-center">
            <span>{t('kpi_manual_scrutiny')}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1 font-sans">{manualCount}</div>
          <div className="text-[11px] text-amber-800 mt-1">
            Requires Desk Inspection
          </div>
        </div>

        <div className="bg-white border-2 border-red-500 p-3">
          <div className="text-[11px] font-bold uppercase text-red-800 flex justify-between items-center">
            <span>{t('kpi_defects_raised')}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
          </div>
          <div className="text-2xl font-bold text-red-700 mt-1 font-sans">{defectCount}</div>
          <div className="text-[11px] text-red-800 mt-1">
            Notified to Students
          </div>
        </div>

      </div>

      {/* PROMINENT ACTION CENTER ALERT BOX */}
      <div className="bg-indigo-50 border-2 border-[#1D0A69] p-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-[#1D0A69] shrink-0 mt-1" />
          <div>
            <div className="font-bold text-sm text-[#1D0A69] uppercase tracking-wide">
              ACTION CENTER: HIGH CONFIDENCE VERIFICATION QUEUE READY
            </div>
            <div className="text-xs text-slate-800 mt-1 leading-relaxed">
              You have <strong>{verifiedCount} applications</strong> ready in the High Confidence Queue (&gt;95% AI accuracy). You can batch-approve these candidates with a single e-signature click or conduct spot checks.
            </div>
          </div>
        </div>
        <button 
          onClick={() => {
            setTriageFolder('high');
            setCurrentView('TRIAGE');
          }}
          className="btn-nic btn-nic-primary text-xs px-4 py-2 shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <span>Go to Smart Workspace Queue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Micro Scrutiny Priority Cases */}
      <div className="bg-white border border-slate-300">
        <div className="bg-slate-100 p-2.5 border-b border-slate-300 font-bold text-xs text-slate-800 flex justify-between items-center">
          <span>PRIORITY DISCREPANCY DOSSIERS REQUIRING DNO APPROVAL</span>
          <span className={`badge-nic ${flaggedCases.length > 0 ? 'badge-flagged' : 'badge-approved'}`}>
            {flaggedCases.length > 0 ? `${flaggedCases.length} Cases Pending` : 'All Cleared'}
          </span>
        </div>

        <div className="p-3 space-y-3">
          {flaggedCases.length > 0 ? (
            flaggedCases.map((item) => (
              <div 
                key={item.id}
                className="p-3 border-2 border-amber-400 bg-amber-50/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-red-900">#{item.id}</span>
                    <span className="font-bold text-sm text-slate-900">{item.applicantName}</span>
                    <span className="badge-nic badge-flagged">AI Score: {item.aiConfidenceScore}%</span>
                  </div>
                  <div className="text-xs text-slate-700 mt-1">
                    Scheme: {item.schemeName} | District: {item.district}, {item.state}
                  </div>
                  <div className="text-xs text-red-900 font-medium mt-1">
                    <strong>Discrepancy:</strong> {item.discrepancySignal}
                  </div>
                </div>
                <button 
                  onClick={() => openSplitReviewForApp(item.id)}
                  className="btn-nic btn-nic-warning text-[11px] shrink-0 cursor-pointer"
                >
                  Open Scrutiny Desk
                </button>
              </div>
            ))
          ) : (
            <div className="p-6 text-center border-2 border-dashed border-green-300 bg-green-50/50">
              <ShieldCheck className="w-8 h-8 text-green-700 mx-auto mb-1" />
              <div className="font-bold text-xs text-green-900">All Priority Discrepancy Dossiers Cleared</div>
              <div className="text-[11px] text-green-700 mt-0.5">
                No active discrepancy flags remain unaddressed in the district inbox.
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

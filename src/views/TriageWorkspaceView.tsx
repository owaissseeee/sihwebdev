import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, CheckSquare, Search, Filter } from 'lucide-react';
import { TriageFolder } from '../types';

export const TriageWorkspaceView: React.FC = () => {
  const { 
    applications, 
    triageFolder, 
    setTriageFolder, 
    openSplitReviewForApp, 
    batchApproveHighConfidence,
    approveApplication,
    showToast,
    t 
  } = useApp();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const folderItems = applications.filter(app => {
    const matchesSearch = 
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.state.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (triageFolder === 'high') {
      return (app.aiConfidenceScore >= 95 || app.status === 'AUTO_VERIFIED') && 
        app.status !== 'APPROVED' && app.status !== 'DEFECTIVE' && app.status !== 'REJECTED';
    }
    if (triageFolder === 'manual') {
      return ((app.aiConfidenceScore >= 50 && app.aiConfidenceScore < 95) || app.status === 'NEEDS_REVIEW') && 
        app.status !== 'APPROVED' && app.status !== 'DEFECTIVE' && app.status !== 'REJECTED';
    }
    if (triageFolder === 'flagged') {
      return (app.aiConfidenceScore < 50 || app.status === 'FLAGGED') && 
        app.status !== 'APPROVED' && app.status !== 'DEFECTIVE' && app.status !== 'REJECTED';
    }
    if (triageFolder === 'processed') {
      return app.status === 'APPROVED' || app.status === 'DEFECTIVE' || app.status === 'REJECTED';
    }
    return true;
  });

  const highCount = applications.filter(a => (a.aiConfidenceScore >= 95 || a.status === 'AUTO_VERIFIED') && a.status !== 'APPROVED' && a.status !== 'DEFECTIVE' && a.status !== 'REJECTED').length;
  const manualCount = applications.filter(a => ((a.aiConfidenceScore >= 50 && a.aiConfidenceScore < 95) || a.status === 'NEEDS_REVIEW') && a.status !== 'APPROVED' && a.status !== 'DEFECTIVE' && a.status !== 'REJECTED').length;
  const flaggedCount = applications.filter(a => (a.aiConfidenceScore < 50 || a.status === 'FLAGGED') && a.status !== 'APPROVED' && a.status !== 'DEFECTIVE' && a.status !== 'REJECTED').length;
  const processedCount = applications.filter(a => a.status === 'APPROVED' || a.status === 'DEFECTIVE' || a.status === 'REJECTED').length;

  const isAllSelected = folderItems.length > 0 && folderItems.every(item => selectedIds.includes(item.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      // Unselect all in current folder
      setSelectedIds(prev => prev.filter(id => !folderItems.some(item => item.id === id)));
    } else {
      // Select all in current folder
      const allFolderIds = folderItems.map(item => item.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...allFolderIds])));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleApproveSelected = async () => {
    if (selectedIds.length === 0) {
      showToast('Please select at least one application to approve.', 'warning');
      return;
    }
    for (const id of selectedIds) {
      await approveApplication(id);
    }
    setSelectedIds([]);
    showToast(`Approved ${selectedIds.length} selected applications for batch sanction!`, 'success');
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header Bar */}
      <div className="flex flex-wrap justify-between items-center bg-white p-3 border border-slate-300 gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Verification Triage: Automated Application Segregation
          </h2>
          <p className="text-xs text-slate-600">
            AI confidence models categorize applications into strict bureaucratic review buckets
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={batchApproveHighConfidence} 
            className="btn-nic btn-nic-success text-xs cursor-pointer shadow-xs"
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            <span>{t('generate_batch_sanction')}</span>
          </button>
        </div>
      </div>

      {/* Inbox Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Left 4 Columns: Queue Folder Navigation */}
        <div className="md:col-span-4 bg-white border border-slate-300 p-2 space-y-2">
          
          <div className="p-2.5 border-b border-slate-300 bg-slate-100">
            <div className="font-bold text-xs uppercase text-[#1D0A69] tracking-wide">
              Scrutiny Folders & Queues
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Select administrative queue to filter applications
            </div>
          </div>

          <div className="space-y-2">
            
            {/* Folder 1: High Confidence */}
            <button 
              onClick={() => {
                setTriageFolder('high');
                setSelectedIds([]);
              }}
              className={`w-full text-left p-3 border cursor-pointer transition-colors ${
                triageFolder === 'high' 
                  ? 'bg-green-50 border-l-4 border-green-600 border-slate-300 font-bold' 
                  : 'bg-white hover:bg-slate-50 border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
                  {t('folder_1_title')}
                </span>
                <span className="font-mono font-bold text-xs text-[#1D0A69] bg-white px-2 py-0.5 border border-slate-300">
                  {highCount.toLocaleString()}
                </span>
              </div>
              <div className="text-[11px] font-normal text-slate-600">
                {t('folder_1_sub')}
              </div>
            </button>

            {/* Folder 2: Needs Review */}
            <button 
              onClick={() => {
                setTriageFolder('manual');
                setSelectedIds([]);
              }}
              className={`w-full text-left p-3 border cursor-pointer transition-colors ${
                triageFolder === 'manual' 
                  ? 'bg-amber-50 border-l-4 border-amber-500 border-slate-300 font-bold' 
                  : 'bg-white hover:bg-slate-50 border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  {t('folder_2_title')}
                </span>
                <span className="font-mono font-bold text-xs text-slate-800 bg-white px-2 py-0.5 border border-slate-300">
                  {manualCount.toLocaleString()}
                </span>
              </div>
              <div className="text-[11px] font-normal text-slate-600">
                {t('folder_2_sub')}
              </div>
            </button>

            {/* Folder 3: Flagged Discrepancies */}
            <button 
              onClick={() => {
                setTriageFolder('flagged');
                setSelectedIds([]);
              }}
              className={`w-full text-left p-3 border cursor-pointer transition-colors ${
                triageFolder === 'flagged' 
                  ? 'bg-red-50 border-l-4 border-red-600 border-slate-300 font-bold' 
                  : 'bg-white hover:bg-slate-50 border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                  {t('folder_3_title')}
                </span>
                <span className="font-mono font-bold text-xs text-red-800 bg-white px-2 py-0.5 border border-slate-300">
                  {flaggedCount.toLocaleString()}
                </span>
              </div>
              <div className="text-[11px] font-normal text-slate-600">
                {t('folder_3_sub')}
              </div>
            </button>

            {/* Folder 4: Decided & Disposed Docket */}
            <button 
              onClick={() => {
                setTriageFolder('processed');
                setSelectedIds([]);
              }}
              className={`w-full text-left p-3 border cursor-pointer transition-colors ${
                triageFolder === 'processed' 
                  ? 'bg-slate-100 border-l-4 border-[#1D0A69] border-slate-300 font-bold' 
                  : 'bg-white hover:bg-slate-50 border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                  Decided & Disposed Dossiers
                </span>
                <span className="font-mono font-bold text-xs text-slate-800 bg-white px-2 py-0.5 border border-slate-300">
                  {processedCount.toLocaleString()}
                </span>
              </div>
              <div className="text-[11px] font-normal text-slate-600">
                Archived decisions: Approved, Defective & Rejected
              </div>
            </button>

          </div>

          <div className="m-1.5 p-2.5 bg-slate-50 border border-slate-300 text-[11px] text-slate-700 space-y-1.5">
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-600">Total Inflow in Queue:</span>
              <span className="font-mono font-bold text-slate-900">{applications.length} Records</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-600">Pending Scrutiny:</span>
              <span className="font-mono font-bold text-amber-800">{highCount + manualCount + flaggedCount} Pending</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span className="text-slate-600">Disposed Decisions:</span>
              <span className="font-mono font-bold text-green-800">{processedCount} Disposed</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Ruleset Engine:</span>
              <span className="font-mono font-bold text-slate-800">MoTA-GIGW-2026.3</span>
            </div>
          </div>

        </div>

        {/* Right 8 Columns: Applications Table */}
        <div className="md:col-span-8 bg-white border border-slate-300">
          
          <div className="p-2.5 bg-slate-100 border-b border-slate-300 flex flex-wrap justify-between items-center text-xs gap-2">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="select-all-triage" 
                checked={isAllSelected}
                onChange={handleToggleSelectAll}
                className="rounded-none cursor-pointer" 
              />
              <label htmlFor="select-all-triage" className="font-bold text-slate-800 cursor-pointer">
                {t('select_all')} ({folderItems.length} in view)
              </label>
              {selectedIds.length > 0 && (
                <span className="bg-indigo-100 text-[#1D0A69] px-1.5 py-0.2 rounded text-[10px] font-bold">
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter queue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-slate-300 px-2 py-0.5 text-xs bg-white pl-6 w-36"
                />
                <Search className="w-3 h-3 text-slate-400 absolute left-1.5 top-1.5" />
              </div>

              {selectedIds.length > 0 && (
                <button 
                  onClick={handleApproveSelected}
                  className="btn-nic btn-nic-primary text-[11px] cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5 mr-1" />
                  Approve Selected ({selectedIds.length})
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table-nic">
              <thead>
                <tr>
                  <th className="w-8 text-center">#</th>
                  <th>{t('th_app_id')}</th>
                  <th>{t('th_applicant')}</th>
                  <th>{t('th_location')}</th>
                  <th>{triageFolder === 'processed' ? 'Disposal Decision' : 'Discrepancy Signal'}</th>
                  <th>{t('th_ai_score')}</th>
                  <th className="text-center">{t('th_action')}</th>
                </tr>
              </thead>
              <tbody>
                {folderItems.length > 0 ? (
                  folderItems.map((item) => {
                    const isLowScore = item.aiConfidenceScore < 50;
                    const isChecked = selectedIds.includes(item.id);
                    const isApproved = item.status === 'APPROVED';
                    const isDefective = item.status === 'DEFECTIVE';
                    const isRejected = item.status === 'REJECTED';
                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-100 cursor-pointer ${isLowScore ? 'bg-red-50/60' : ''} ${isChecked ? 'bg-indigo-50/50' : ''}`}
                      >
                        <td className="text-center font-mono text-xs" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => handleToggleRow(item.id)}
                            className="rounded-none cursor-pointer" 
                          />
                        </td>
                        <td 
                          onClick={() => openSplitReviewForApp(item.id)} 
                          className={`font-mono font-bold ${isLowScore || isRejected ? 'text-red-700' : isApproved ? 'text-green-700' : 'text-[#1D0A69]'}`}
                        >
                          {item.id}
                        </td>
                        <td onClick={() => openSplitReviewForApp(item.id)} className="font-bold text-slate-900">
                          {item.applicantName}
                        </td>
                        <td onClick={() => openSplitReviewForApp(item.id)}>
                          {item.district}, {item.state}
                        </td>
                        <td onClick={() => openSplitReviewForApp(item.id)}>
                          {triageFolder === 'processed' ? (
                            <span className={`badge-nic ${
                              isApproved ? 'badge-approved' : isDefective ? 'badge-defective' : 'badge-flagged'
                            }`}>
                              {item.status}: {item.defectRemarks || item.rejectionReason || 'Sanctioned for DBT'}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-700 font-medium">{item.discrepancySignal}</span>
                          )}
                        </td>
                        <td onClick={() => openSplitReviewForApp(item.id)}>
                          <span className={`badge-nic ${
                            item.aiConfidenceScore >= 95 ? 'badge-ai-high' : item.aiConfidenceScore >= 50 ? 'badge-pending' : 'badge-flagged'
                          }`}>
                            {item.aiConfidenceScore}%
                          </span>
                        </td>
                        <td className="text-center">
                          <button 
                            onClick={() => openSplitReviewForApp(item.id)}
                            className={`btn-nic text-[10px] cursor-pointer ${isApproved ? 'btn-nic-outline' : isLowScore ? 'btn-nic-warning' : 'btn-nic-primary'}`}
                          >
                            {isApproved || isDefective || isRejected ? 'View Decision' : t('btn_review_dossier')}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-xs text-slate-500">
                      No applications currently in this scrutiny queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
};

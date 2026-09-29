import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { ShieldCheck, AlertTriangle, FileSpreadsheet, Search, ChevronRight, Layers, ArrowUpRight } from 'lucide-react';

const STATE_DISBURSEMENT_DATA = [
  { state: 'Jharkhand', amount: 340.5 },
  { state: 'Madhya Pradesh', amount: 290.0 },
  { state: 'Chhattisgarh', amount: 210.2 },
  { state: 'Rajasthan', amount: 185.8 },
  { state: 'Odisha', amount: 134.0 },
  { state: 'Telangana', amount: 80.0 }
];

const SCHEME_DISTRIBUTION_DATA = [
  { name: 'National Fellowship (NFST)', value: 45, color: '#1D0A69' },
  { name: 'Post-Matric ST', value: 35, color: '#138808' },
  { name: 'Pre-Matric ST', value: 12, color: '#FF9933' },
  { name: 'National Overseas', value: 8, color: '#D97706' }
];

export const MinisterDashboardView: React.FC = () => {
  const { applications, openSplitReviewForApp, setCurrentView, showToast, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredApps = applications.filter(app => 
    app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredApps.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedApps = filteredApps.slice(startIndex, startIndex + itemsPerPage);

  // Dynamic Live State Metrics
  const totalReceived = applications.length;
  const preVerifiedCount = applications.filter(a => a.status === 'AUTO_VERIFIED' || a.status === 'APPROVED').length;
  const pendingScrutinyCount = applications.filter(a => a.status === 'NEEDS_REVIEW' || a.status === 'FLAGGED').length;
  const defectCount = applications.filter(a => a.status === 'DEFECTIVE').length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;
  const dynamicDisbursed = (1240.50 + approvedCount * 0.15).toFixed(2);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      
      {/* Top Status Alert */}
      <div className="bg-white border-l-4 border-[#1D0A69] border-t border-r border-b border-slate-300 p-3 flex flex-wrap justify-between items-center gap-2">
        <div>
          <span className="text-xs font-bold text-slate-900">Welcome, Joint Secretary (Scholarships & DBT).</span>
          <span className="text-xs text-slate-600 ml-2">
            Last authenticated login: <strong>30 Sep 2026, 09:15:22 IST</strong> from IP 10.24.8.19 (NIC National Gateway).
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="badge-nic badge-approved">Session Secure (TLS 1.3)</span>
          <button 
            onClick={() => setCurrentView('RULE_ENGINE')} 
            className="btn-nic btn-nic-outline text-[11px] cursor-pointer"
          >
            Audit Config
          </button>
        </div>
      </div>

      {/* KPI Grid (Utilitarian Solid Borders, Live State Driven) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        
        <div className="bg-white border-2 border-slate-300 p-3">
          <div className="text-[11px] font-bold uppercase text-slate-500">{t('kpi_total_received') || 'Total Applications Active'}</div>
          <div className="text-2xl font-bold text-[#1D0A69] mt-1 font-sans">{totalReceived.toLocaleString()}</div>
          <div className="text-[11px] text-slate-600 mt-1 flex justify-between">
            <span>National ST Schemes</span>
            <span className="font-bold text-slate-800">Live Inflow</span>
          </div>
        </div>

        <div className="bg-white border-2 border-green-600 p-3">
          <div className="text-[11px] font-bold uppercase text-green-800 flex justify-between items-center">
            <span>{t('kpi_ai_verified') || 'AI Pre-Verified (Passed OCR)'}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
          </div>
          <div className="text-2xl font-bold text-green-700 mt-1 font-sans">{preVerifiedCount.toLocaleString()}</div>
          <div className="text-[11px] text-green-800 mt-1 flex justify-between">
            <span>Confidence Score &gt; 95%</span>
            <span className="font-bold">{totalReceived > 0 ? ((preVerifiedCount / totalReceived) * 100).toFixed(1) : 0}% Verified</span>
          </div>
        </div>

        <div className="bg-white border-2 border-amber-500 p-3">
          <div className="text-[11px] font-bold uppercase text-amber-800 flex justify-between items-center">
            <span>{t('kpi_pending_scrutiny') || 'Pending Manual Scrutiny'}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1 font-sans">{pendingScrutinyCount.toLocaleString()}</div>
          <div className="text-[11px] text-amber-800 mt-1 flex justify-between">
            <span>Queue Backlog</span>
            <span className={`font-bold ${pendingScrutinyCount > 0 ? 'text-red-700' : 'text-green-700'}`}>
              {pendingScrutinyCount > 0 ? 'Action Required' : 'Queue Cleared'}
            </span>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-400 p-3">
          <div className="text-[11px] font-bold uppercase text-slate-600">Total Disbursed (PFMS DBT)</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-sans">₹ {dynamicDisbursed} Cr</div>
          <div className="text-[11px] text-slate-600 mt-1 flex justify-between">
            <span>Approved: {approvedCount} | Defective: {defectCount}</span>
            <span className="font-bold text-green-700">Active</span>
          </div>
        </div>

      </div>

      {/* Live AI Anomaly Alert Box */}
      <div className="bg-red-50 border-2 border-red-500 p-3 flex flex-col sm:flex-row justify-between items-start gap-2">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-xs text-red-950 uppercase tracking-wide">
              SYSTEMIC AI ANOMALY ALERT: HIGH DISCREPANCY VOLUME DETECTED
            </div>
            <div className="text-xs text-red-900 mt-0.5">
              District Bastar (Chhattisgarh) and Ranchi (Jharkhand) report a <strong>surge in income certificate mismatches</strong> due to scanned digital stamp variations. SNO audits flagged for immediate scrutiny.
            </div>
          </div>
        </div>
        <button 
          onClick={() => setCurrentView('TRIAGE')} 
          className="btn-nic btn-nic-danger text-[11px] shrink-0 cursor-pointer"
        >
          Review Flagged Dossiers
        </button>
      </div>

      {/* Charts Section: Recharts Bar & Pie */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* State Disbursements Bar Chart */}
        <div className="md:col-span-8 bg-white border border-slate-300 p-3">
          <div className="border-b border-slate-200 pb-2 mb-3 flex justify-between items-center">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
              Disbursements by State (FY 2026-27 in ₹ Crores)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Source: PFMS Central Ledger</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STATE_DISBURSEMENT_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="state" tick={{ fontSize: 11, fill: '#334155' }} />
                <YAxis tick={{ fontSize: 11, fill: '#334155' }} />
                <Tooltip formatter={(val) => [`₹ ${val} Cr`, 'Disbursed']} />
                <Bar dataKey="amount" fill="#1D0A69" barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scheme Wise Distribution Pie Chart */}
        <div className="md:col-span-4 bg-white border border-slate-300 p-3">
          <div className="border-b border-slate-200 pb-2 mb-3">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
              Scheme Allocation (%)
            </h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={SCHEME_DISTRIBUTION_DATA} 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={65} 
                  dataKey="value" 
                  label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {SCHEME_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val}%`, 'Share']} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Applications Table Section with Full Pagination */}
      <div className="bg-white border border-slate-300">
        <div className="bg-slate-100 p-2.5 border-b border-slate-300 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
              Live Inflow: Scholarship Applications for Scrutiny
            </h3>
            <span className="badge-nic badge-pending">Real-Time Database Sync</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Filter by App ID, Name, State..." 
                value={searchQuery}
                onChange={handleSearchChange}
                className="border border-slate-300 px-2 py-1 text-xs w-64 bg-white pl-7" 
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
            </div>
            
            <button 
              onClick={() => showToast(`Exported NIC CSV file (${filteredApps.length} records)`, 'success')}
              className="btn-nic btn-nic-outline text-[11px] cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
              Export NIC CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-nic">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Applicant Name</th>
                <th>Scheme Name</th>
                <th>State / District</th>
                <th>Caste Validity</th>
                <th>AI Confidence</th>
                <th>Verification Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedApps.length > 0 ? (
                paginatedApps.map((app) => {
                  const isDiscrepant = app.status === 'FLAGGED' || app.status === 'REJECTED';
                  const isApproved = app.status === 'APPROVED';
                  const isDefective = app.status === 'DEFECTIVE';
                  return (
                    <tr key={app.id} className={isDiscrepant ? 'bg-red-50/50' : isApproved ? 'bg-green-50/40' : ''}>
                      <td className={`font-mono font-bold ${isDiscrepant ? 'text-red-700' : isApproved ? 'text-green-700' : 'text-[#1D0A69]'}`}>
                        {app.id}
                      </td>
                      <td className="font-bold text-slate-900">{app.applicantName}</td>
                      <td>{app.schemeName}</td>
                      <td>{app.state} / {app.district}</td>
                      <td>
                        <span className={`badge-nic ${app.casteVerified ? 'badge-approved' : 'badge-flagged'}`}>
                          {app.casteVerified ? 'Verified (e-District)' : 'Manual Review'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-nic ${app.aiConfidenceScore > 90 ? 'badge-ai-high' : app.aiConfidenceScore > 60 ? 'badge-pending' : 'badge-flagged'}`}>
                          {app.aiConfidenceScore}% ({app.aiConfidenceScore > 90 ? 'High' : app.aiConfidenceScore > 60 ? 'Medium' : 'Mismatch'})
                        </span>
                      </td>
                      <td>
                        <span className={`badge-nic ${isApproved ? 'badge-approved' : isDefective ? 'badge-defective' : isDiscrepant ? 'badge-flagged' : 'badge-pending'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <button 
                          onClick={() => openSplitReviewForApp(app.id)} 
                          className={`btn-nic text-[11px] cursor-pointer ${isDiscrepant ? 'btn-nic-warning' : isApproved ? 'btn-nic-outline' : 'btn-nic-primary'}`}
                        >
                          {isApproved ? 'View Dossier' : 'Conduct Scrutiny'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-xs text-slate-500">
                    No matching applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-2 bg-slate-50 border-t border-slate-300 flex flex-wrap justify-between items-center text-xs text-slate-600 gap-2">
          <span>
            Showing {filteredApps.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredApps.length)} of {filteredApps.length} applications (Page {safeCurrentPage} of {totalPages})
          </span>
          <div className="flex items-center space-x-1">
            <button 
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-2 py-0.5 border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              « Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button 
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-2.5 py-0.5 border cursor-pointer ${
                  safeCurrentPage === pageNum 
                    ? 'border-[#1D0A69] bg-indigo-100 font-bold text-[#1D0A69]' 
                    : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button 
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-2 py-0.5 border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next »
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

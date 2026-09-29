import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Zap, BellRing, Clock, CheckCircle } from 'lucide-react';

export const PfmsDisbursementView: React.FC = () => {
  const { 
    pfmsBatches, 
    pfmsFailures, 
    pushPfmsBatch, 
    notifyStudentBankUpdate, 
    showToast,
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sanction' | 'pending' | 'failed'>('sanction');

  const readyBatches = pfmsBatches.filter(b => b.status === 'READY');
  const pendingBatches = pfmsBatches.filter(b => b.status === 'TRANSMITTED');
  const pendingFailureCount = pfmsFailures.filter(f => f.status === 'ACTION_REQUIRED').length;

  const handlePushBatch = async (batchId: string) => {
    await pushPfmsBatch(batchId);
  };

  const handleNotifyStudent = async (failId: string) => {
    await notifyStudentBankUpdate(failId);
  };

  const handleNotifyAll = async () => {
    for (const f of pfmsFailures) {
      await notifyStudentBankUpdate(f.id);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header Bar */}
      <div className="bg-white border border-slate-300 p-3 flex flex-wrap justify-between items-center gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            {t('nav_pfms')} Gateway
          </h2>
          <p className="text-xs text-slate-600">
            Direct Benefit Transfer batch sanction generation, electronic signature & bank ledger clearance
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-600">PFMS Gateway Status:</span>
          <span className="badge-nic badge-approved">CONNECTED (ACK 200 OK)</span>
        </div>
      </div>

      {/* PFMS Tabs */}
      <div className="bg-white border border-slate-300">
        
        <div className="flex border-b border-slate-300 bg-slate-100 text-xs font-bold">
          <button 
            onClick={() => setActiveTab('sanction')}
            className={`px-4 py-2.5 cursor-pointer ${activeTab === 'sanction' ? 'text-[#1D0A69] border-b-2 border-[#1D0A69] bg-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Approved Batches for DBT ({readyBatches.length})
          </button>
          
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2.5 cursor-pointer ${activeTab === 'pending' ? 'text-[#1D0A69] border-b-2 border-[#1D0A69] bg-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Pending with PFMS Clearance ({pendingBatches.length})
          </button>

          <button 
            onClick={() => setActiveTab('failed')}
            className={`px-4 py-2.5 cursor-pointer ${activeTab === 'failed' ? 'text-red-700 border-b-2 border-red-700 bg-white' : 'text-red-700 hover:text-red-900'}`}
          >
            Failed Transactions (Action Needed)
            {pendingFailureCount > 0 && (
              <span className="ml-1.5 bg-red-100 text-red-800 px-1.5 py-0.2 rounded text-[10px] border border-red-300">
                {pendingFailureCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Approved Batches for DBT */}
        {activeTab === 'sanction' && (
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800">
                Ready Batch Sanction Orders (E-Sign Stamped)
              </span>
              
              {readyBatches.length > 0 && (
                <button 
                  onClick={() => handlePushBatch(readyBatches[0].id)}
                  className="btn-nic btn-nic-success cursor-pointer shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5 mr-1" />
                  {t('btn_push_pfms')}
                </button>
              )}
            </div>

            <table className="table-nic">
              <thead>
                <tr>
                  <th>Sanction Batch ID</th>
                  <th>Scheme</th>
                  <th>Beneficiary Count</th>
                  <th>Total Amount (INR)</th>
                  <th>Audit Verification</th>
                  <th>DSC Status</th>
                  <th className="text-center">{t('th_action')}</th>
                </tr>
              </thead>
              <tbody>
                {readyBatches.length > 0 ? (
                  readyBatches.map(batch => (
                    <tr key={batch.id}>
                      <td className="font-mono font-bold text-[#1D0A69]">{batch.batchCode}</td>
                      <td className="font-medium text-slate-900">{batch.schemeName}</td>
                      <td className="font-mono">{batch.beneficiaryCount.toLocaleString()} Scholars</td>
                      <td className="font-mono font-bold">₹ {batch.totalAmountInr}/-</td>
                      <td><span className="badge-nic badge-approved">{batch.auditVerification}</span></td>
                      <td><span className="badge-nic badge-approved">{batch.dscStatus}</span></td>
                      <td className="text-center">
                        <button 
                          onClick={() => handlePushBatch(batch.id)} 
                          className="btn-nic btn-nic-primary text-[10px] mr-1 cursor-pointer"
                        >
                          Push to PFMS
                        </button>
                        <button 
                          onClick={() => showToast('Batch Sanction Bill PDF downloaded', 'info')} 
                          className="btn-nic btn-nic-outline text-[10px] cursor-pointer"
                        >
                          Download Bill
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-xs text-slate-500">
                      All approved batches have been transmitted to PFMS.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Pending with PFMS Clearance */}
        {activeTab === 'pending' && (
          <div className="p-4 space-y-3">
            <div className="text-xs text-slate-600">
              Transmitted batches awaiting Reserve Bank of India (RBI) Clearing House E-Scroll acknowledgment.
            </div>

            <table className="table-nic">
              <thead>
                <tr>
                  <th>Batch Ref</th>
                  <th>Scheme</th>
                  <th>Transmitted Timestamp</th>
                  <th>Amount</th>
                  <th>PFMS Gateway ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingBatches.map(batch => (
                  <tr key={batch.id}>
                    <td className="font-mono font-bold text-[#1D0A69]">{batch.batchCode}</td>
                    <td>{batch.schemeName}</td>
                    <td className="text-slate-600">{batch.timestamp}</td>
                    <td className="font-mono font-bold">₹ {batch.totalAmountInr}</td>
                    <td className="font-mono text-slate-700">PFMS-MHA-90812</td>
                    <td>
                      <span className="badge-nic badge-pending flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" />
                        Clearing House Processing
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Failed Transactions */}
        {activeTab === 'failed' && (
          <div className="p-4 space-y-3">
            <div className="bg-red-50 border border-red-300 p-2.5 text-xs text-red-900 flex justify-between items-center">
              <span>
                <strong>Bank Exception Handling:</strong> {pfmsFailures.length} direct transfers rejected by destination banks during NEFT/NACH routing.
              </span>
              <button 
                onClick={handleNotifyAll}
                className="btn-nic btn-nic-danger text-[11px] cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5 mr-1" />
                Notify All Students via SMS Gateway
              </button>
            </div>

            <table className="table-nic">
              <thead>
                <tr>
                  <th>Beneficiary Name</th>
                  <th>Bank Account No</th>
                  <th>Reported IFSC</th>
                  <th>Failure Reason</th>
                  <th>Error Code</th>
                  <th className="text-center">Resolution Action</th>
                </tr>
              </thead>
              <tbody>
                {pfmsFailures.map(fail => (
                  <tr key={fail.id}>
                    <td className="font-bold text-slate-900">{fail.beneficiaryName}</td>
                    <td className="font-mono text-slate-800">{fail.accountNo}</td>
                    <td className="font-mono text-slate-800">{fail.ifsc}</td>
                    <td className="text-red-700 font-bold">{fail.failureReason}</td>
                    <td className="font-mono text-red-700 font-bold">{fail.errorCode}</td>
                    <td className="text-center">
                      {fail.status === 'STUDENT_NOTIFIED' ? (
                        <span className="badge-nic badge-approved">SMS Dispatched</span>
                      ) : (
                        <button 
                          onClick={() => handleNotifyStudent(fail.id)}
                          className="btn-nic btn-nic-warning text-[10px] cursor-pointer"
                        >
                          Notify Student to Update Bank
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

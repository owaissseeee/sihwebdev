import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Save, Calendar, CheckSquare, Layers, ShieldCheck, FolderPlus, X } from 'lucide-react';
import { ScholarshipScheme, RuleCondition } from '../types';

export const SchemeRuleEngineView: React.FC = () => {
  const { schemes, saveScheme, createNewScheme, addSchemeRule, removeSchemeRule, showToast, t } = useApp();

  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemes[0]?.id || 'SCH-NFST-01');
  const activeScheme = schemes.find(s => s.id === selectedSchemeId) || schemes[0];

  const [academicYear, setAcademicYear] = useState(activeScheme?.academicYear || '2026 - 2027');
  const [sanctionCap, setSanctionCap] = useState(activeScheme?.sanctionCap || 750);
  const [portalOpeningDate, setPortalOpeningDate] = useState(activeScheme?.portalOpeningDate || '2026-06-01');
  const [inoDeadline, setInoDeadline] = useState(activeScheme?.inoDeadline || '2026-09-30');
  const [dnoDeadline, setDnoDeadline] = useState(activeScheme?.dnoDeadline || '2026-10-31');
  const [docs, setDocs] = useState(activeScheme?.mandatoryDocuments || {
    aadhaar: true,
    casteCert: true,
    incomeCert: true,
    degreeMarksheet: true,
    bankPassbook: true,
    bonafideCert: true
  });

  // New Rule State
  const [newParameter, setNewParameter] = useState('Family Annual Income');
  const [newOperator, setNewOperator] = useState<RuleCondition['operator']>('LESS_THAN_OR_EQUAL');
  const [newValue, setNewValue] = useState('250000');

  // Modal State for Adding Brand New Scheme
  const [showAddSchemeModal, setShowAddSchemeModal] = useState(false);
  const [newSchemeName, setNewSchemeName] = useState('');
  const [newSchemeCode, setNewSchemeCode] = useState('');
  const [newSchemeCategory, setNewSchemeCategory] = useState('Higher & Technical Education');
  const [newSchemeBudget, setNewSchemeBudget] = useState('₹ 120.00 Cr');
  const [newSchemeCap, setNewSchemeCap] = useState(1500);
  const [newSchemeOpening, setNewSchemeOpening] = useState('2026-07-01');
  const [newSchemeInoCutoff, setNewSchemeInoCutoff] = useState('2026-10-15');
  const [newSchemeDnoCutoff, setNewSchemeDnoCutoff] = useState('2026-11-15');

  const handleAddRule = async () => {
    if (!activeScheme) return;
    await addSchemeRule(activeScheme.id, {
      parameter: newParameter,
      operator: newOperator,
      value: newValue,
      status: 'Strict Pass'
    });
  };

  const handleRemoveRule = async (ruleId: string) => {
    if (!activeScheme) return;
    await removeSchemeRule(activeScheme.id, ruleId);
  };

  const handleSave = async () => {
    if (!activeScheme) return;
    const updated: ScholarshipScheme = {
      ...activeScheme,
      academicYear,
      sanctionCap: Number(sanctionCap),
      portalOpeningDate,
      inoDeadline,
      dnoDeadline,
      mandatoryDocuments: docs
    };
    await saveScheme(updated);
  };

  const handleCreateSchemeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchemeName.trim() || !newSchemeCode.trim()) {
      showToast('Please enter Scheme Name and Scheme Code.', 'error');
      return;
    }

    await createNewScheme({
      name: newSchemeName,
      code: newSchemeCode,
      category: newSchemeCategory,
      academicYear: '2026 - 2027',
      sanctionCap: Number(newSchemeCap),
      annualBudget: newSchemeBudget,
      totalApplied: 0,
      verifiedCount: 0,
      pendingCount: 0,
      defectiveCount: 0,
      portalOpeningDate: newSchemeOpening,
      inoDeadline: newSchemeInoCutoff,
      dnoDeadline: newSchemeDnoCutoff,
      rules: [
        { id: 'r-init-1', parameter: 'Caste Category', operator: 'EQUALS', value: 'Scheduled Tribe (ST)', status: 'Strict Pass' },
        { id: 'r-init-2', parameter: 'Family Annual Income', operator: 'LESS_THAN_OR_EQUAL', value: '250000', status: 'Strict Pass' },
        { id: 'r-init-3', parameter: 'Aadhaar NPCI Status', operator: 'EQUALS', value: 'ACTIVE_NPCI_SEEDED', status: 'Strict Pass' }
      ],
      mandatoryDocuments: {
        aadhaar: true,
        casteCert: true,
        incomeCert: true,
        degreeMarksheet: true,
        bankPassbook: true,
        bonafideCert: true
      }
    });

    setShowAddSchemeModal(false);
    setNewSchemeName('');
    setNewSchemeCode('');
  };

  if (!activeScheme) {
    return <div className="p-4 text-center">Loading Scheme Rule Engine...</div>;
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-300 p-3 flex flex-wrap justify-between items-center gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            {t('nav_rules')} Configuration
          </h2>
          <p className="text-xs text-slate-600">
            Define automated AI eligibility logic and mandate verification constraints under MoTA schemes
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowAddSchemeModal(true)} 
            className="btn-nic btn-nic-success text-xs cursor-pointer shadow-xs"
          >
            <FolderPlus className="w-3.5 h-3.5 mr-1" />
            {t('btn_create_scheme')}
          </button>
          
          <button 
            onClick={handleSave} 
            className="btn-nic btn-nic-primary text-xs cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            {t('btn_save_deploy')}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-300 p-5 space-y-5">
        
        {/* Section 1: Target Scheme Parameters */}
        <div>
          <h3 className="text-xs font-bold uppercase text-[#1D0A69] border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#1D0A69]" />
            1. Scheme Basic Parameters & Quota
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Scholarship Scheme *</label>
              <select 
                value={selectedSchemeId}
                onChange={(e) => {
                  setSelectedSchemeId(e.target.value);
                  const selected = schemes.find(s => s.id === e.target.value);
                  if (selected) {
                    setAcademicYear(selected.academicYear);
                    setSanctionCap(selected.sanctionCap);
                    setPortalOpeningDate(selected.portalOpeningDate);
                    setInoDeadline(selected.inoDeadline);
                    setDnoDeadline(selected.dnoDeadline);
                    setDocs(selected.mandatoryDocuments);
                  }
                }}
                className="w-full border border-slate-300 p-1.5 text-xs bg-slate-50 font-medium cursor-pointer"
              >
                {schemes.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year Batch *</label>
              <input 
                type="text" 
                value={academicYear} 
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full border border-slate-300 p-1.5 text-xs bg-slate-50 font-mono" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sanction Quota / Beneficiary Cap</label>
              <input 
                type="number" 
                value={sanctionCap} 
                onChange={(e) => setSanctionCap(Number(e.target.value))}
                className="w-full border border-slate-300 p-1.5 text-xs bg-slate-50 font-mono" 
              />
            </div>
          </div>
        </div>

        {/* Section 2: Timeline Manager */}
        <div>
          <h3 className="text-xs font-bold uppercase text-[#1D0A69] border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#1D0A69]" />
            2. Operational Timelines & Cutoff Deadlines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Portal Opening Date</label>
              <input 
                type="date" 
                value={portalOpeningDate} 
                onChange={(e) => setPortalOpeningDate(e.target.value)}
                className="w-full border border-slate-300 p-1.5 text-xs bg-slate-50 font-mono" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Institute Verification Deadline (INO)</label>
              <input 
                type="date" 
                value={inoDeadline} 
                onChange={(e) => setInoDeadline(e.target.value)}
                className="w-full border border-slate-300 p-1.5 text-xs bg-slate-50 font-mono" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">District Verification Deadline (DNO)</label>
              <input 
                type="date" 
                value={dnoDeadline} 
                onChange={(e) => setDnoDeadline(e.target.value)}
                className="w-full border border-slate-300 p-1.5 text-xs bg-slate-50 font-mono" 
              />
            </div>
          </div>
        </div>

        {/* Section 3: Eligibility Logic Builder UI */}
        <div>
          <div className="flex justify-between items-center border-b border-slate-200 pb-1 mb-3">
            <h3 className="text-xs font-bold uppercase text-[#1D0A69] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1D0A69]" />
              3. Automated AI Eligibility Evaluator (Logic Builder)
            </h3>
          </div>

          {/* Active Rules List */}
          <div className="space-y-2 mb-4">
            {activeScheme.rules?.map((rule, idx) => (
              <div key={rule.id} className="flex items-center space-x-2 bg-slate-50 p-2 border border-slate-300">
                <span className="text-xs font-bold text-slate-500 w-16">Rule {idx + 1}:</span>
                
                <input 
                  type="text" 
                  readOnly 
                  value={rule.parameter} 
                  className="border border-slate-300 p-1 text-xs bg-white w-48 font-semibold text-slate-800" 
                />

                <span className="border border-slate-300 p-1 text-xs bg-white w-40 font-mono text-slate-700">
                  {rule.operator}
                </span>

                <input 
                  type="text" 
                  readOnly 
                  value={rule.value} 
                  className="border border-slate-300 p-1 text-xs bg-white flex-1 font-mono text-slate-900 font-bold" 
                />

                <span className="badge-nic badge-approved">{rule.status}</span>

                <button 
                  onClick={() => handleRemoveRule(rule.id)}
                  className="text-red-600 hover:text-red-800 p-1 text-xs cursor-pointer"
                  title="Remove Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Rule Controls */}
          <div className="bg-indigo-50/60 p-3 border border-indigo-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#1D0A69]">New Logic Rule:</span>
            
            <select 
              value={newParameter}
              onChange={(e) => setNewParameter(e.target.value)}
              className="border border-slate-300 p-1 text-xs bg-white w-44 font-medium cursor-pointer"
            >
              <option>Family Annual Income</option>
              <option>Caste Category</option>
              <option>Aadhaar NPCI Status</option>
              <option>Postgraduate Score (%)</option>
              <option>University World Ranking (QS)</option>
              <option>Disability Status</option>
            </select>

            <select 
              value={newOperator}
              onChange={(e) => setNewOperator(e.target.value as RuleCondition['operator'])}
              className="border border-slate-300 p-1 text-xs bg-white w-36 font-mono cursor-pointer"
            >
              <option value="EQUALS">Equals (=)</option>
              <option value="LESS_THAN_OR_EQUAL">Less than (&lt;=)</option>
              <option value="GREATER_THAN_OR_EQUAL">Greater than (&gt;=)</option>
              <option value="CONTAINS">Contains</option>
            </select>

            <input 
              type="text" 
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Rule value..."
              className="border border-slate-300 p-1 text-xs bg-white flex-1 font-mono" 
            />

            <button 
              onClick={handleAddRule}
              className="btn-nic btn-nic-primary text-[11px] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Rule Parameter
            </button>
          </div>
        </div>

        {/* Section 4: Mandatory Verification Documents Checklist */}
        <div>
          <h3 className="text-xs font-bold uppercase text-[#1D0A69] border-b border-slate-200 pb-1 mb-3 flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-[#1D0A69]" />
            4. Mandatory Verification Documents Checklist (OCR Scan Enforced)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <label className="flex items-center space-x-2 p-2 border border-slate-200 bg-slate-50 cursor-pointer">
              <input 
                type="checkbox" 
                checked={docs.aadhaar} 
                onChange={(e) => setDocs({ ...docs, aadhaar: e.target.checked })}
                className="rounded-none cursor-pointer" 
              />
              <span className="font-bold text-slate-800">Aadhaar Card (UIDAI Vault Sync)</span>
            </label>

            <label className="flex items-center space-x-2 p-2 border border-slate-200 bg-slate-50 cursor-pointer">
              <input 
                type="checkbox" 
                checked={docs.casteCert} 
                onChange={(e) => setDocs({ ...docs, casteCert: e.target.checked })}
                className="rounded-none cursor-pointer" 
              />
              <span className="font-bold text-slate-800">ST Caste Certificate (State Database)</span>
            </label>

            <label className="flex items-center space-x-2 p-2 border border-slate-200 bg-slate-50 cursor-pointer">
              <input 
                type="checkbox" 
                checked={docs.incomeCert} 
                onChange={(e) => setDocs({ ...docs, incomeCert: e.target.checked })}
                className="rounded-none cursor-pointer" 
              />
              <span className="font-bold text-slate-800">Competent Income Certificate</span>
            </label>

            <label className="flex items-center space-x-2 p-2 border border-slate-200 bg-slate-50 cursor-pointer">
              <input 
                type="checkbox" 
                checked={docs.degreeMarksheet} 
                onChange={(e) => setDocs({ ...docs, degreeMarksheet: e.target.checked })}
                className="rounded-none cursor-pointer" 
              />
              <span className="font-bold text-slate-800">Qualifying Degree Marksheet</span>
            </label>

            <label className="flex items-center space-x-2 p-2 border border-slate-200 bg-slate-50 cursor-pointer">
              <input 
                type="checkbox" 
                checked={docs.bankPassbook} 
                onChange={(e) => setDocs({ ...docs, bankPassbook: e.target.checked })}
                className="rounded-none cursor-pointer" 
              />
              <span className="font-bold text-slate-800">Bank Passbook (Core Banking IFSC)</span>
            </label>

            <label className="flex items-center space-x-2 p-2 border border-slate-200 bg-slate-50 cursor-pointer">
              <input 
                type="checkbox" 
                checked={docs.bonafideCert} 
                onChange={(e) => setDocs({ ...docs, bonafideCert: e.target.checked })}
                className="rounded-none cursor-pointer" 
              />
              <span className="font-bold text-slate-800">Bonafide Student Certificate (INO)</span>
            </label>
          </div>
        </div>

      </div>

      {/* Modal for Creating & Registering a New Scholarship Scheme */}
      {showAddSchemeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white border-2 border-[#1D0A69] p-5 max-w-xl w-full shadow-2xl space-y-4">
            
            <div className="bg-[#1D0A69] text-white p-3 -m-5 mb-3 flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-amber-300" />
                Register New National Scholarship Scheme
              </h3>
              <button 
                onClick={() => setShowAddSchemeModal(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchemeSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Full Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. National Tribal Excellence Fellowship"
                    value={newSchemeName}
                    onChange={(e) => setNewSchemeName(e.target.value)}
                    className="w-full border border-slate-300 p-1.5 text-xs bg-slate-50 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Code / Identifier *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. NTEF-ST-2026"
                    value={newSchemeCode}
                    onChange={(e) => setNewSchemeCode(e.target.value)}
                    className="w-full border border-slate-300 p-1.5 text-xs bg-slate-50 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input 
                    type="text" 
                    value={newSchemeCategory}
                    onChange={(e) => setNewSchemeCategory(e.target.value)}
                    className="w-full border border-slate-300 p-1.5 text-xs bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Annual Budget</label>
                  <input 
                    type="text" 
                    value={newSchemeBudget}
                    onChange={(e) => setNewSchemeBudget(e.target.value)}
                    className="w-full border border-slate-300 p-1.5 text-xs bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sanction Cap (Seats)</label>
                  <input 
                    type="number" 
                    value={newSchemeCap}
                    onChange={(e) => setNewSchemeCap(Number(e.target.value))}
                    className="w-full border border-slate-300 p-1.5 text-xs bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Portal Opening Date</label>
                  <input 
                    type="date" 
                    value={newSchemeOpening}
                    onChange={(e) => setNewSchemeOpening(e.target.value)}
                    className="w-full border border-slate-300 p-1.5 text-xs bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">INO Cutoff Date</label>
                  <input 
                    type="date" 
                    value={newSchemeInoCutoff}
                    onChange={(e) => setNewSchemeInoCutoff(e.target.value)}
                    className="w-full border border-slate-300 p-1.5 text-xs bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">DNO Cutoff Date</label>
                  <input 
                    type="date" 
                    value={newSchemeDnoCutoff}
                    onChange={(e) => setNewSchemeDnoCutoff(e.target.value)}
                    className="w-full border border-slate-300 p-1.5 text-xs bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowAddSchemeModal(false)}
                  className="btn-nic btn-nic-outline text-xs cursor-pointer"
                >
                  Cancel
                </button>
                
                <button 
                  type="submit"
                  className="btn-nic btn-nic-primary text-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  Register & Deploy Scheme to Backend
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

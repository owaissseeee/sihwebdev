import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, AlertTriangle, ArrowLeft, ZoomIn, ZoomOut, RotateCw, 
  Download, Printer, Hand, MousePointer, Maximize2, FileText, Check, AlertCircle, ShieldCheck
} from 'lucide-react';
import { DocumentDetail } from '../types';

export const SplitScreenReviewView: React.FC = () => {
  const { 
    applications, 
    selectedAppId, 
    setCurrentView, 
    approveApplication, 
    raiseDefect, 
    rejectApplication,
    showToast,
    t 
  } = useApp();

  const app = applications.find(a => a.id === selectedAppId) || applications[0];

  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isPanMode, setIsPanMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [remarks, setRemarks] = useState(
    app.defectRemarks || (app.incomeMismatch 
      ? `Income mismatch: Stamped Certificate shows ₹${app.annualIncomeExtracted.toLocaleString()} while portal declaration is ₹${app.annualIncomeDeclared.toLocaleString()}.` 
      : '')
  );
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Income Exceeds Scheme Cap');

  const docs = app.documentList || [];
  const currentDoc: DocumentDetail = docs[selectedDocIndex] || {
    id: 'doc-1',
    name: 'Income_Certificate_Signed.pdf',
    hasDiscrepancy: app.incomeMismatch,
    statusBadge: app.incomeMismatch ? '⚠️ Discrepancy Flagged' : '✅ Verified',
    type: 'INCOME',
    certNumber: app.casteCertNo.replace('ST', 'INC'),
    issueDate: '14/02/2026',
    issuingAuthority: `Office of Sub-Divisional Magistrate, ${app.district}`,
    extractedIncome: app.annualIncomeExtracted,
    qrHash: `MOTA-DOC-${app.id}`
  };

  // Mouse pan handlers for built-in PDF viewer feel
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPanMode || e.button === 1) { // Left click in pan mode or middle click
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 10 : -10;
      setZoomLevel(prev => Math.min(Math.max(prev + delta, 50), 200));
    }
  };

  const handleApprove = async () => {
    await approveApplication(app.id);
    setCurrentView('TRIAGE');
  };

  const handleConfirmDefect = async () => {
    if (!remarks.trim()) {
      showToast('Official defect remarks are mandatory.', 'error');
      return;
    }
    await raiseDefect(app.id, remarks);
    setShowDefectModal(false);
    setCurrentView('TRIAGE');
  };

  const handleConfirmReject = async () => {
    await rejectApplication(app.id, rejectReason);
    setShowRejectModal(false);
    setCurrentView('TRIAGE');
  };

  return (
    <div className="flex flex-col h-full space-y-2">
      
      {/* Top Scrutiny Bar */}
      <div className="bg-[#1D0A69] text-white px-4 py-2 flex flex-wrap justify-between items-center border-b-2 border-[#FF9933]">
        <div className="flex items-center space-x-2">
          <span className="text-xs uppercase text-amber-300 font-bold tracking-wide">
            {t('scrutiny_desk_title')}:
          </span>
          <span className="font-mono font-bold text-sm bg-indigo-900 px-2 py-0.5 rounded border border-indigo-700">
            #{app.id}
          </span>
          <span className="text-xs font-semibold text-slate-200">
            ({app.applicantName} - {app.schemeName})
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            app.aiConfidenceScore >= 90 ? 'bg-green-800 text-white' : app.aiConfidenceScore >= 60 ? 'bg-amber-700 text-white' : 'bg-red-800 text-white'
          }`}>
            AI Confidence: {app.aiConfidenceScore}% ({app.incomeMismatch ? 'Discrepancy Conflict' : 'Clean Match'})
          </span>

          <button 
            onClick={() => setCurrentView('TRIAGE')}
            className="btn-nic btn-nic-outline bg-white text-[11px] py-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            {t('back_to_queue')}
          </button>
        </div>
      </div>

      {/* Split Screen Panels */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 overflow-hidden" style={{ minHeight: '580px' }}>
        
        {/* LEFT PANEL (40% width): Extracted Application Data Form */}
        <div className="md:col-span-5 bg-white border border-slate-300 flex flex-col justify-between overflow-y-auto">
          <div className="p-3.5 space-y-3">
            <div className="bg-slate-100 p-2 border border-slate-300 font-bold text-xs uppercase text-slate-800 flex justify-between items-center">
              <span>{t('verified_registry')}</span>
              <span className="text-[10px] text-slate-500 font-normal">State Portal: {app.state} e-District</span>
            </div>

            {/* Field 1: Applicant Name */}
            <div className="p-2.5 border border-slate-200 bg-slate-50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-700">{t('th_applicant')}</span>
                <span className="flex items-center text-xs font-bold text-green-700">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-green-700" />
                  Aadhaar Matched (100%)
                </span>
              </div>
              <div className="font-bold text-sm text-slate-900">{app.applicantName}</div>
              <div className="text-[10px] text-slate-500">
                Father: <strong>{app.fatherName}</strong> | DOB: {app.dob} | Gender: {app.gender}
              </div>
            </div>

            {/* Field 2: Annual Family Income (DISCREPANCY ALERT CARD) */}
            <div className={`p-2.5 border-2 ${app.incomeMismatch ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-bold ${app.incomeMismatch ? 'text-red-950' : 'text-slate-700'}`}>
                  {t('annual_income')}
                </span>
                {app.incomeMismatch ? (
                  <span className="flex items-center text-xs font-bold text-red-700">
                    <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />
                    OCR Mismatch Flag
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-bold text-green-700">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-green-700" />
                    Verified Under Cap
                  </span>
                )}
              </div>
              
              <div className="flex items-baseline space-x-3">
                <div className={`font-mono font-bold text-base ${app.incomeMismatch ? 'text-red-900' : 'text-slate-900'}`}>
                  Declared: ₹ {app.annualIncomeDeclared.toLocaleString()}
                </div>
                {app.incomeMismatch && (
                  <div className="font-mono font-bold text-xs text-red-700">
                    (OCR: ₹ {app.annualIncomeExtracted.toLocaleString()})
                  </div>
                )}
              </div>

              {app.incomeMismatch && (
                <div className="mt-1.5 p-2 bg-white border border-red-300 text-[11px] text-red-900 font-medium">
                  <strong>AI OCR Conflict Note:</strong> Extracted text from Tehsildar Certificate states <strong>₹ {app.annualIncomeExtracted.toLocaleString()}</strong>. Income declaration conflicts with official revenue issuance.
                </div>
              )}
            </div>

            {/* Field 3: Aadhaar Seeding */}
            <div className="p-2.5 border border-slate-200 bg-slate-50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-700">{t('aadhaar_status')}</span>
                <span className={`badge-nic ${app.aadhaarSeeded ? 'badge-approved' : 'badge-pending'}`}>
                  {app.aadhaarSeeded ? 'NPCI Mapped (Active)' : 'Pending NPCI Link'}
                </span>
              </div>
              <div className="text-xs text-slate-800 font-mono">
                Bank: {app.bankName} (A/C ****{app.bankAccount.slice(-4)})
              </div>
              <div className="text-[10px] text-slate-500">
                IFSC: {app.bankIfsc} | DBT Direct Benefit Pathway: READY
              </div>
            </div>

            {/* Field 4: Caste Certificate */}
            <div className="p-2.5 border border-slate-200 bg-slate-50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-700">{t('caste_cert')}</span>
                <span className="text-xs font-bold text-green-700">{app.tribe} (ST - {app.state})</span>
              </div>
              <div className="text-xs font-mono text-slate-700">
                Certificate No: {app.casteCertNo}
              </div>
              <div className="text-[10px] text-slate-500">
                Issued by: Sub-Divisional Officer / Tehsildar ({app.district})
              </div>
            </div>

            {/* Field 5: Educational Institution */}
            <div className="p-2.5 border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-700 block mb-0.5">Enrolled Institution</span>
              <div className="text-xs font-semibold text-slate-900">{app.institution}</div>
              <div className="text-[10px] text-slate-500">District: {app.district}, State: {app.state}</div>
            </div>

          </div>

          {/* Sticky Bottom Scrutiny Remarks Area */}
          <div className="p-3 bg-slate-100 border-t border-slate-300">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('defect_remarks_label')}
            </label>
            <textarea 
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 bg-white focus:outline-none focus:border-[#1D0A69]" 
              rows={2} 
              placeholder="Enter official remarks or defect reason..."
            />
          </div>
        </div>

        {/* RIGHT PANEL (60% width): REAL IN-BUILT PDF READER SIMULATION */}
        <div className="md:col-span-7 bg-slate-800 border border-slate-700 flex flex-col justify-between overflow-hidden">
          
          {/* NATIVE PDF VIEWER DARK TOOLBAR */}
          <div className="bg-[#323639] text-slate-200 px-3 py-2 border-b border-slate-900 flex flex-wrap justify-between items-center text-xs select-none shadow-sm gap-2">
            
            {/* Document Switcher Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-medium">Document:</span>
              <select 
                value={selectedDocIndex}
                onChange={(e) => {
                  setSelectedDocIndex(Number(e.target.value));
                  setZoomLevel(100);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className="bg-[#202124] text-white border border-slate-600 px-2.5 py-1 text-xs font-mono rounded focus:outline-none focus:border-indigo-400 cursor-pointer shadow-inner"
              >
                {docs.map((doc, idx) => (
                  <option key={doc.id} value={idx}>
                    {doc.name} ({doc.statusBadge})
                  </option>
                ))}
              </select>
            </div>

            {/* Inbuilt PDF Controls: Page, Zoom, Pan Tool, Rotate, Print, Download */}
            <div className="flex items-center space-x-2">
              
              <span className="text-slate-400 text-[11px] font-mono">1 / 1</span>
              
              <div className="h-4 w-px bg-slate-600"></div>

              {/* Mode Toggle: Select Text vs Hand Pan */}
              <button 
                onClick={() => setIsPanMode(!isPanMode)}
                className={`p-1 rounded cursor-pointer ${isPanMode ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
                title={isPanMode ? 'Hand Tool Active (Drag to Pan)' : 'Select Mode Active'}
              >
                {isPanMode ? <Hand className="w-3.5 h-3.5" /> : <MousePointer className="w-3.5 h-3.5" />}
              </button>

              {/* Zoom Out */}
              <button 
                onClick={() => setZoomLevel(prev => Math.max(prev - 15, 50))}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <span className="font-mono text-[11px] text-slate-300 w-10 text-center">{zoomLevel}%</span>

              {/* Zoom In */}
              <button 
                onClick={() => setZoomLevel(prev => Math.min(prev + 15, 200))}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              {/* Reset to Fit */}
              <button 
                onClick={() => { setZoomLevel(100); setPanOffset({ x: 0, y: 0 }); setRotation(0); }}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
                title="Fit to Page Width"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Rotate Clockwise */}
              <button 
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
                title="Rotate Clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-px bg-slate-600"></div>

              <button 
                onClick={() => showToast(`Simulating print for ${currentDoc.name}`, 'info')}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
                title="Print Document"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>

              <button 
                onClick={() => showToast(`Downloading official verified copy of ${currentDoc.name}`, 'success')}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
                title="Download PDF"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

            </div>

          </div>

          {/* REALISTIC PDF CANVAS CONTAINER WITH GESTURE & PAN */}
          <div 
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            className={`flex-1 bg-[#525659] p-6 flex justify-center items-center overflow-hidden relative ${
              isPanMode ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
            }`}
          >
            
            {/* RENDERED DOCUMENT PAGE CONTAINER */}
            <div 
              style={{ 
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease'
              }}
              className="w-full max-w-lg bg-white border border-slate-900 p-8 shadow-2xl relative text-slate-900 select-text font-serif text-[11px] leading-relaxed min-h-[500px]"
            >
              
              {/* Background Official State Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none">
                <span className="text-6xl font-bold uppercase text-slate-900 transform -rotate-45 text-center">
                  GOVERNMENT OF {app.state.toUpperCase()}
                </span>
              </div>

              {/* DOCUMENT CONTENT DYNAMICALLY ADAPTING TO SELECTED FILE */}
              
              {/* 1. INCOME CERTIFICATE */}
              {currentDoc.type === 'INCOME' && (
                <div>
                  <div className="text-center border-b border-slate-400 pb-3 mb-4">
                    <div className="text-xs font-bold tracking-wide">
                      कार्यालय अनुमंडल दंडाधिकारी एवं तहसीलदार, {app.district} ({app.state})
                    </div>
                    <div className="text-[10px] font-sans text-slate-600 uppercase">
                      OFFICE OF THE REVENUE TEHSILDAR / SUB-DIVISIONAL MAGISTRATE, {app.district.toUpperCase()}
                    </div>
                    <div className="text-xs font-bold mt-1 uppercase underline text-[#1D0A69]">
                      आय प्रमाण पत्र / ANNUAL FAMILY INCOME CERTIFICATE
                    </div>
                  </div>

                  <div className="space-y-3 font-sans text-xs">
                    <div className="flex justify-between text-[11px]">
                      <span>प्रमाण पत्र संख्या / Cert No: <strong>{currentDoc.certNumber || app.casteCertNo.replace('ST', 'INC')}</strong></span>
                      <span>दिनांक / Date: <strong>{currentDoc.issueDate || '14/02/2026'}</strong></span>
                    </div>

                    <p>
                      प्रमाणित किया जाता है कि <strong>सुश्री / श्री {app.applicantName}</strong>, सुपुत्र/सुपुत्री श्री <strong>{app.fatherName}</strong>, ग्राम/मोहल्ला: खूंटी रोड, पोस्ट: मुख्य डाकघर, थाना: सदर, जिला: {app.district} ({app.state}) के स्थायी निवासी हैं।
                    </p>

                    <p>
                      राजस्व उप-निरीक्षक एवं अंचल अधिकारी (Tehsildar) के संयुक्त जांच प्रतिवेदन के अनुसार इनके परिवार की समस्त स्रोतों से कुल वार्षिक आय निम्नानुसार सत्यापित की जाती है:
                    </p>

                    {/* Bounding Box Target: The Income Amount */}
                    <div className="my-4 p-4 border border-slate-300 bg-amber-50/40 relative">
                      
                      {/* AI OCR BOUNDING BOX OVERLAY FOR DISCREPANCY */}
                      {app.incomeMismatch && (
                        <div className="absolute -inset-1.5 border-2 border-dashed border-red-600 pointer-events-none bg-red-500/10">
                          <span className="absolute -top-3.5 left-2 bg-red-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 tracking-wide uppercase shadow-sm">
                            AI OCR Conflict: 99.2% match with "₹ {app.annualIncomeExtracted.toLocaleString()}/-"
                          </span>
                        </div>
                      )}

                      <div className="text-center">
                        <div className="text-xs font-bold text-slate-600">कुल वार्षिक आय (Family Annual Income)</div>
                        <div className={`text-base font-bold font-mono tracking-wider mt-1 ${app.incomeMismatch ? 'text-red-950 font-black' : 'text-slate-900'}`}>
                          ₹ {app.annualIncomeExtracted.toLocaleString()}/- (रुपये {app.annualIncomeExtracted === 220000 ? 'दो लाख बीस हजार' : app.annualIncomeExtracted === 320000 ? 'तीन लाख बीस हजार' : 'एक लाख अस्सी हजार'} मात्र)
                        </div>
                      </div>

                    </div>

                    <div className="flex justify-between pt-6 border-t border-slate-300 items-end">
                      <div className="text-center">
                        <div className="w-16 h-12 border border-slate-400 bg-slate-100 flex items-center justify-center text-[9px] text-slate-500 mb-1 font-mono">
                          [QR Token]
                        </div>
                        <span className="text-[9px] text-slate-500 block font-mono">{currentDoc.qrHash || 'JharSewa-eDistrict-Token'}</span>
                      </div>

                      <div className="text-center font-serif text-[10px]">
                        <div className="text-slate-500 italic mb-1">[Digitally Signed via NIC CA]</div>
                        <div className="font-bold">सक्षम राजस्व प्राधिकारी (Competent Officer)</div>
                        <div className="text-slate-700">तहसीलदार / अनुमंडल दंडाधिकारी, {app.district}</div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* 2. CASTE CERTIFICATE */}
              {currentDoc.type === 'CASTE' && (
                <div>
                  <div className="text-center border-b border-slate-400 pb-3 mb-4">
                    <div className="text-xs font-bold tracking-wide">
                      जनजातीय कल्याण विभाग, {app.state} सरकार
                    </div>
                    <div className="text-[10px] font-sans text-slate-600 uppercase">
                      TRIBAL WELFARE DEPARTMENT, GOVERNMENT OF {app.state.toUpperCase()}
                    </div>
                    <div className="text-xs font-bold mt-1 uppercase underline text-[#1D0A69]">
                      अनुसूचित जनजाति प्रमाण पत्र / SCHEDULED TRIBE CERTIFICATE
                    </div>
                  </div>

                  <div className="space-y-3 font-sans text-xs">
                    <div className="flex justify-between">
                      <span>प्रमाण पत्र संख्या: <strong>{app.casteCertNo}</strong></span>
                      <span>जारी दिनांक: <strong>10/01/2024</strong></span>
                    </div>

                    <p>
                      यह प्रमाणित किया जाता है कि <strong>{app.applicantName}</strong>, सुपुत्र/सुपुत्री श्री <strong>{app.fatherName}</strong>, जिला {app.district} ({app.state}) के निवासी हैं और वे <strong>{app.tribe}</strong> समुदाय से संबंधित हैं।
                    </p>

                    <p>
                      यह समुदाय भारत के संविधान (अनुसूचित जनजाति) आदेश, 1950 के अंतर्गत {app.state} राज्य में <strong>अनुसूचित जनजाति (ST)</strong> के रूप में मान्य है।
                    </p>

                    <div className="my-4 p-3 bg-slate-50 border border-slate-300 flex justify-between items-center">
                      <div>
                        <div className="text-[10px] text-slate-500">Tribe Classification</div>
                        <div className="font-bold text-xs text-green-900">{app.tribe} - Scheduled Tribe</div>
                      </div>
                      <span className="badge-nic badge-approved">State Vault Verified</span>
                    </div>

                    <div className="flex justify-between pt-6 border-t border-slate-300 items-end">
                      <div className="font-mono text-[9px] text-slate-500">
                        [Barcode: ST-{app.casteCertNo}]
                      </div>
                      <div className="text-center font-serif text-[10px]">
                        <div className="text-slate-500 italic mb-1">[Digital e-District Seal]</div>
                        <div className="font-bold">सक्षम अधिकारी / Sub-Divisional Officer</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. AADHAAR E-KYC CARD */}
              {currentDoc.type === 'AADHAAR' && (
                <div className="space-y-3">
                  <div className="bg-[#1D0A69] text-white p-2.5 flex justify-between items-center">
                    <div className="font-bold text-xs tracking-wider">भारतीय विशिष्ट पहचान प्राधिकरण (UIDAI)</div>
                    <div className="text-[10px] font-mono">Government of India</div>
                  </div>

                  <div className="p-4 border-2 border-slate-300 bg-amber-50/20 space-y-3 font-sans">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{app.applicantName}</div>
                        <div className="text-xs text-slate-600">Father: {app.fatherName}</div>
                        <div className="text-xs text-slate-600">DOB: {app.dob} | Gender: {app.gender}</div>
                        <div className="text-xs text-slate-600 mt-1">Address: {app.district}, {app.state}</div>
                      </div>
                      <div className="w-16 h-20 border border-slate-400 bg-slate-200 flex flex-col items-center justify-center text-[9px] text-slate-500">
                        [Photo]
                      </div>
                    </div>

                    <div className="text-center py-2 bg-slate-100 border border-slate-300 font-mono font-bold text-base tracking-widest text-[#1D0A69]">
                      XXXX - XXXX - {app.bankAccount.slice(-4)}
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                      <span>Offline XML Biometric Token: Verified</span>
                      <span className="text-green-700 font-bold">✓ NPCI Seeding Active</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. BONAFIDE STUDENT CERTIFICATE */}
              {currentDoc.type === 'BONAFIDE' && (
                <div>
                  <div className="text-center border-b border-slate-400 pb-3 mb-4">
                    <div className="text-sm font-bold text-[#1D0A69]">{app.institution.toUpperCase()}</div>
                    <div className="text-[10px] text-slate-600">Office of the Dean / Principal Academic Affairs</div>
                    <div className="text-xs font-bold underline mt-1">BONAFIDE STUDENT INSTITUTIONAL CERTIFICATE</div>
                  </div>

                  <div className="space-y-3 font-sans text-xs">
                    <p>
                      This is to certify that <strong>{app.applicantName}</strong>, S/D of Shri <strong>{app.fatherName}</strong>, is a bonafide regular enrolled student in our institution for Academic Session 2026-27.
                    </p>

                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 border border-slate-300 text-xs">
                      <div>Scheme: <strong>{app.schemeName}</strong></div>
                      <div>Roll No: <strong className="font-mono">INST-2026-{app.id.slice(-4)}</strong></div>
                      <div>Category: <strong>Scheduled Tribe ({app.tribe})</strong></div>
                      <div>Attendance: <strong>92% (Satisfactory)</strong></div>
                    </div>

                    <div className="pt-8 flex justify-between items-end border-t border-slate-300">
                      <div className="text-[10px] text-slate-500">Official Institutional Seal</div>
                      <div className="text-center text-[10px]">
                        <div className="font-bold">Principal / Registrar</div>
                        <div>{app.institution}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. BANK PASSBOOK */}
              {currentDoc.type === 'BANK' && (
                <div className="space-y-3 font-sans">
                  <div className="bg-[#1D0A69] text-white p-2.5 flex justify-between items-center">
                    <span className="font-bold text-xs">{app.bankName.toUpperCase()}</span>
                    <span className="text-[10px] font-mono">Core Banking Direct Transfer</span>
                  </div>

                  <div className="p-4 border border-slate-300 bg-slate-50 space-y-2 text-xs">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-600">Account Holder:</span>
                      <span className="font-bold text-slate-900">{app.applicantName}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-600">Account Number:</span>
                      <span className="font-mono font-bold">{app.bankAccount}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-600">IFSC Code:</span>
                      <span className="font-mono font-bold text-indigo-900">{app.bankIfsc}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-slate-600">Aadhaar Seeding Status:</span>
                      <span className="badge-nic badge-approved">NPCI ACTIVE (DBT CLEARED)</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Sticky Bottom Review Action Bar */}
          <div className="p-3 bg-white border-t border-slate-300 flex flex-wrap justify-between items-center gap-2">
            <div className="text-xs text-slate-700">
              Scrutinizer: <strong>MoTA Section Officer (Tribal Welfare Desk)</strong>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowRejectModal(true)}
                className="btn-nic btn-nic-danger cursor-pointer"
              >
                <span>❌ {t('btn_reject')}</span>
              </button>

              <button 
                onClick={() => setShowDefectModal(true)}
                className="btn-nic btn-nic-warning cursor-pointer"
              >
                <span>⚠️ {t('btn_raise_defect')}</span>
              </button>

              <button 
                onClick={handleApprove}
                className="btn-nic btn-nic-success cursor-pointer"
              >
                <span>✅ {t('btn_approve')}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Modal for Raise Defect */}
      {showDefectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white border-2 border-amber-600 p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-amber-900 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Raise Official Defect to Student
              </h3>
              <p className="text-xs text-slate-600">
                A notice and SMS will be dispatched immediately to #{app.id} ({app.applicantName}).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Defect Instructions / Discrepancy Clarification *
              </label>
              <textarea 
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full border border-slate-300 p-2 text-xs bg-slate-50 font-medium focus:outline-none focus:border-[#1D0A69]"
                placeholder="e.g. Upload revised revenue income certificate matching declared amount..."
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button 
                onClick={() => setShowDefectModal(false)}
                className="btn-nic btn-nic-outline text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDefect}
                className="btn-nic btn-nic-warning text-xs cursor-pointer"
              >
                Transmit Defect Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Rejection Reason */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white border-2 border-red-600 p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-red-700 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Confirm Application Rejection
              </h3>
              <p className="text-xs text-slate-600">
                Rejection permanently archives application #{app.id} under MoTA audit rules.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Strict Bureaucratic Rejection Grounds *
              </label>
              <select 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border border-slate-300 p-2 text-xs bg-slate-50 font-medium cursor-pointer"
              >
                <option>Income Exceeds Scheme Cap (&gt; ₹2,50,000)</option>
                <option>Invalid Community / Tribe Certificate Hash</option>
                <option>Duplicate Application across Multiple States</option>
                <option>Non-Recognized Educational Institution</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="btn-nic btn-nic-outline text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmReject}
                className="btn-nic btn-nic-danger text-xs cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

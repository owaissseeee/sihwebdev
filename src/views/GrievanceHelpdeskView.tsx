import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bot, Send, CornerDownLeft } from 'lucide-react';

export const GrievanceHelpdeskView: React.FC = () => {
  const { 
    grievances, 
    selectedGrievanceId, 
    setSelectedGrievanceId, 
    resolveGrievance, 
    showToast,
    t 
  } = useApp();

  const ticket = grievances.find(g => g.id === selectedGrievanceId) || grievances[0];
  const [replyText, setReplyText] = useState(ticket?.officialReply || '');

  const handleSelectTicket = (id: number) => {
    setSelectedGrievanceId(id);
    const target = grievances.find(g => g.id === id);
    if (target) {
      setReplyText(target.officialReply || '');
    }
  };

  const handlePasteAiDraft = () => {
    if (!ticket) return;
    setReplyText(ticket.aiSuggestedDraft);
    showToast('AI Bureaucratic Draft pasted into official response area.', 'info');
  };

  const handleSendDisposal = async () => {
    if (!ticket) return;
    if (!replyText.trim()) {
      showToast('Please enter an official reply before sending disposal order.', 'error');
      return;
    }
    await resolveGrievance(ticket.id, replyText);
  };

  if (!ticket) {
    return <div className="p-4 text-center">Loading Grievances...</div>;
  }

  return (
    <div className="space-y-4">
      
      {/* Header Bar */}
      <div className="bg-white border border-slate-300 p-3 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            CPGRAMS & Tribal Portal Grievance Redressal
          </h2>
          <p className="text-xs text-slate-600">
            Student queries, defect complaints & AI-assisted bureaucratic response drafting
          </p>
        </div>
        <span className="badge-nic badge-pending">
          {grievances.filter(g => g.status === 'OPEN').length} Unresolved Tickets
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3" style={{ minHeight: '500px' }}>
        
        {/* Left 5 Columns: Grievance Inbox List */}
        <div className="md:col-span-5 bg-white border border-slate-300 divide-y divide-slate-200 overflow-y-auto">
          <div className="p-2.5 bg-slate-100 font-bold text-xs text-slate-700 flex justify-between">
            <span>Inbox: Student Petitions</span>
            <span className="text-slate-500 font-normal">Sorted by Age</span>
          </div>

          {grievances.map((item) => {
            const isSelected = item.id === selectedGrievanceId;
            return (
              <div 
                key={item.id}
                onClick={() => handleSelectTicket(item.id)}
                className={`p-3 cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-indigo-50/80 border-l-4 border-[#1D0A69]' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono font-bold text-xs text-[#1D0A69]">
                    #{item.ticketCode}
                  </span>
                  <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                </div>
                
                <div className="font-bold text-xs text-slate-900">{item.subject}</div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Applicant: <strong>{item.applicantName}</strong> ({item.schemeName})
                </div>
                
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-[10px] text-amber-800 font-medium">
                    District: {item.district}, {item.state}
                  </span>
                  <span className={`badge-nic ${item.status === 'RESOLVED' ? 'badge-approved' : 'badge-pending'}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 7 Columns: Ticket Detail & AI Suggested Draft */}
        <div className="md:col-span-7 bg-white border border-slate-300 flex flex-col justify-between p-4">
          <div>
            
            {/* Ticket Header */}
            <div className="border-b border-slate-300 pb-3 mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold font-mono text-[#1D0A69]">TICKET #{ticket.ticketCode}</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                    {ticket.subject} - {ticket.applicantName}
                  </h3>
                </div>
                <span className={`badge-nic ${ticket.status === 'RESOLVED' ? 'badge-approved' : 'badge-pending'}`}>
                  {ticket.status === 'RESOLVED' ? 'Resolved & Closed' : 'Under Scrutiny'}
                </span>
              </div>
              
              <div className="text-[11px] text-slate-600 mt-1">
                Reg No: <strong>{ticket.regNo}</strong> | Email: <code className="text-indigo-900">{ticket.email}</code> | Mobile: {ticket.mobile}
              </div>
            </div>

            {/* Student Message Body */}
            <div className="bg-slate-50 p-3 border border-slate-200 text-xs mb-4">
              <span className="font-bold text-slate-700 block text-[11px] mb-1">
                Applicant Representation:
              </span>
              <p className="text-slate-800 leading-relaxed italic">
                "{ticket.message}"
              </p>
            </div>

            {/* AI Suggested Draft Box (Bhashini NLP Bureaucratic Style) */}
            <div className="border-2 border-indigo-200 bg-indigo-50/50 p-3 mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-[#1D0A69] uppercase flex items-center gap-1">
                  <Bot className="w-4 h-4 text-indigo-700" />
                  AI Suggested Bureaucratic Draft (Bhashini NLP)
                </span>
                <button 
                  onClick={handlePasteAiDraft} 
                  className="btn-nic btn-nic-outline text-[10px] bg-white py-0.5 cursor-pointer"
                >
                  <CornerDownLeft className="w-3 h-3 mr-1" />
                  Paste into Reply Box
                </button>
              </div>
              
              <div className="text-xs font-serif text-slate-800 bg-white p-2.5 border border-indigo-100 italic leading-relaxed">
                "{ticket.aiSuggestedDraft}"
              </div>
            </div>

            {/* Official Response Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Disposal Order / Formal Response *
              </label>
              <textarea 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3} 
                className="w-full text-xs p-2.5 border border-slate-300 bg-white focus:outline-none focus:border-[#1D0A69]" 
                placeholder="Draft official reply here or click 'Paste into Reply Box' above..."
              />
            </div>

          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-slate-300 flex justify-between items-center mt-3">
            <span className="text-[11px] text-slate-500">
              Action will be logged in CPGRAMS central audit log.
            </span>
            <div className="space-x-2">
              <button 
                onClick={() => showToast(`Ticket #${ticket.ticketCode} escalated to District Welfare Officer (${ticket.district})`, 'info')}
                className="btn-nic btn-nic-outline cursor-pointer"
              >
                Forward to DWO
              </button>
              
              <button 
                onClick={handleSendDisposal}
                className="btn-nic btn-nic-primary cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                Send Formal Disposal Order
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

import React from 'react';

export const GIGWMarquee: React.FC = () => {
  return (
    <div className="bg-amber-100 border-b border-amber-300 px-4 py-1 text-xs text-amber-900 flex items-center font-sans">
      <span className="bg-[#1D0A69] text-white px-1.5 py-0.5 font-bold text-[10px] uppercase rounded-xs mr-2 shrink-0">
        Gazette Alert
      </span>
      <marquee behavior="scroll" direction="left" scrollamount="6" className="font-medium">
        Sanction Order Generation deadline for National Fellowship for ST (NFST) Batch 2026-Q3 extended to 31st October 2026. State Nodal Officers (SNO) are advised to complete pending biometric de-duplication audits immediately. Portal opening dates for Post-Matric FY 2026-27 updated.
      </marquee>
    </div>
  );
};

import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const bgColors = {
    success: 'bg-green-800 border-green-950 text-white',
    warning: 'bg-amber-700 border-amber-900 text-white',
    error: 'bg-red-800 border-red-950 text-white',
    info: 'bg-[#1D0A69] border-[#14064a] text-white',
  };

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-green-300 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />,
    error: <XCircle className="w-4 h-4 text-red-300 shrink-0" />,
    info: <Info className="w-4 h-4 text-amber-300 shrink-0" />,
  };

  return (
    <div className="fixed bottom-12 right-6 z-50 animate-bounce">
      <div className={`px-4 py-2.5 border shadow-lg text-xs font-semibold flex items-center space-x-2 rounded-xs ${bgColors[toast.type]}`}>
        {icons[toast.type]}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

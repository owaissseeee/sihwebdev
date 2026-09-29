import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Building2, RefreshCw, Phone, RotateCcw } from 'lucide-react';
import { UserRole } from '../types';

export const LoginView: React.FC = () => {
  const { setActiveRole, setCurrentView, showToast, resetDatabase, t } = useApp();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('MINISTER_ADMIN');
  const [userId, setUserId] = useState('MoTA_ADMIN_JS01');
  const [password, setPassword] = useState('••••••••••••');
  const [captchaCode, setCaptchaCode] = useState('7G9Xk2');
  const [captchaInput, setCaptchaInput] = useState('7G9Xk2');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput('');
    showToast('CAPTCHA refreshed', 'info');
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'MINISTER_ADMIN') setUserId('MoTA_ADMIN_JS01');
    if (role === 'DISTRICT_NODAL_OFFICER') setUserId('SNO_JHARKHAND_TRIBAL');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.toUpperCase() !== captchaCode.toUpperCase()) {
      showToast('Invalid CAPTCHA security code. Please try again.', 'error');
      generateCaptcha();
      return;
    }

    setActiveRole(selectedRole);
    if (selectedRole === 'MINISTER_ADMIN') {
      setCurrentView('MINISTER_DASHBOARD');
    } else {
      setCurrentView('DNO_DASHBOARD');
    }
    showToast('Authentication Successful via e-Pramaan Token. Session Encrypted.', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto my-6 bg-white border border-slate-300 shadow-sm">
      {/* Header Banner with discreet Reset Mock DB button */}
      <div className="bg-[#1D0A69] text-white p-3 border-b-2 border-[#FF9933] flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold tracking-wide uppercase">
            NATIONAL SCHOLARSHIP PORTAL FOR SCHEDULED TRIBES (MoTA)
          </h2>
          <p className="text-xs text-slate-300">{t('sign_in_title')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            type="button"
            onClick={resetDatabase}
            title="Reset Mock Database to Factory Defaults"
            className="text-[10px] text-indigo-200 hover:text-white bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-1 opacity-80 hover:opacity-100"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset DB</span>
          </button>
          <span className="bg-[#138808] text-white text-[10px] font-bold px-2 py-0.5 rounded">
            GIGW 3.0 Verified
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-300">
        
        {/* Left Side: Notices & Headquarters Information */}
        <div className="p-6 bg-slate-50 flex flex-col justify-between">
          <div>
            <div className="border-l-4 border-[#1D0A69] pl-3 mb-4">
              <h3 className="font-bold text-slate-800 text-sm">{t('official_notices')}</h3>
              <p className="text-xs text-slate-500">Government of India Gazette Notifications</p>
            </div>

            {/* Headquarters Photo SVG */}
            <div className="mb-4 bg-slate-200 border border-slate-300 h-36 flex flex-col items-center justify-center text-center p-3 relative overflow-hidden">
              <Building2 className="w-12 h-12 text-slate-500 mb-1" />
              <span className="font-bold text-xs text-slate-800">Shastri Bhawan, New Delhi</span>
              <span className="text-[10px] text-slate-600">Ministry of Tribal Affairs Headquarters</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-white border border-slate-200 rounded-sm">
                <span className="font-bold text-red-700 block text-[11px]">Notice No. MoTA/2026/SCH-09:</span>
                Mandatory biometric authentication for all verification desks before batch sanction list submission.
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-sm">
                <span className="font-bold text-[#1D0A69] block text-[11px]">Advisory to District Welfare Officers:</span>
                Verify revenue village certificates for Eklavya Model Residential School (EMRS) scholarship quota.
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#1D0A69]" />
            <span>Toll-Free National Helpline: <strong>1800-11-7788</strong> (09:30 AM to 05:30 PM, Working Days)</span>
          </div>
        </div>

        {/* Right Side: Role Selector (Only Ministry Admin and DNO) & Login Form */}
        <div className="p-6 bg-white">
          
          {/* Role Tabs: Removed Institute Nodal */}
          <div className="flex border-b border-slate-300 mb-4 text-xs font-bold">
            <button 
              type="button"
              onClick={() => handleRoleSelect('MINISTER_ADMIN')} 
              className={`flex-1 py-2 text-center border-b-2 cursor-pointer ${selectedRole === 'MINISTER_ADMIN' ? 'text-[#1D0A69] border-[#1D0A69] bg-indigo-50/50' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {t('role_admin')}
            </button>
            <button 
              type="button"
              onClick={() => handleRoleSelect('DISTRICT_NODAL_OFFICER')} 
              className={`flex-1 py-2 text-center border-b-2 cursor-pointer ${selectedRole === 'DISTRICT_NODAL_OFFICER' ? 'text-[#1D0A69] border-[#1D0A69] bg-indigo-50/50' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {t('role_dno')}
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('user_id_label')}
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:border-[#1D0A69] bg-slate-50 font-mono" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('password_label')}
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:border-[#1D0A69] bg-slate-50 font-mono" 
                required 
              />
            </div>

            {/* MANDATORY GOVERNMENT CAPTCHA */}
            <div className="bg-slate-100 p-2.5 border border-slate-300">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('captcha_label')}
              </label>
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-amber-50 border border-slate-400 px-4 py-1.5 font-mono text-base font-bold tracking-widest text-slate-800 select-none line-through italic shadow-inner">
                  {captchaCode.split('').join(' ')}
                </div>
                <button 
                  type="button" 
                  onClick={generateCaptcha}
                  className="text-xs text-[#1D0A69] hover:underline flex items-center font-bold cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  {t('refresh')}
                </button>
              </div>
              <input 
                type="text" 
                placeholder="Enter characters shown above" 
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="w-full border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:border-[#1D0A69] bg-white font-mono uppercase" 
                required 
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full bg-[#1D0A69] hover:bg-[#14064a] text-white font-bold py-2 px-4 text-xs border border-[#14064a] flex justify-center items-center cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 mr-1.5 text-amber-300" />
                <span>{t('login_btn')}</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">or</span>
              <button 
                type="button" 
                onClick={() => {
                  setActiveRole('MINISTER_ADMIN');
                  setCurrentView('MINISTER_DASHBOARD');
                  showToast('Single Sign-On Authenticated via e-Pramaan / MeriPehchaan', 'success');
                }} 
                className="mt-2 w-full bg-white border border-slate-400 hover:bg-slate-50 text-slate-800 font-semibold py-1.5 px-3 text-xs flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block"></span>
                <span>{t('sso_btn')}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

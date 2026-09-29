import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { GIGWHeader } from './components/GIGWHeader';
import { GIGWMarquee } from './components/GIGWMarquee';
import { GIGWFooter } from './components/GIGWFooter';
import { NotificationToast } from './components/NotificationToast';

import { LoginView } from './views/LoginView';
import { MinisterDashboardView } from './views/MinisterDashboardView';
import { DNODashboardView } from './views/DNODashboardView';
import { TriageWorkspaceView } from './views/TriageWorkspaceView';
import { SplitScreenReviewView } from './views/SplitScreenReviewView';
import { SchemeRuleEngineView } from './views/SchemeRuleEngineView';
import { PfmsDisbursementView } from './views/PfmsDisbursementView';
import { GrievanceHelpdeskView } from './views/GrievanceHelpdeskView';

const AppContent: React.FC = () => {
  const { currentView, fontSize } = useApp();

  const fontSizeClass = {
    sm: 'font-size-sm',
    base: 'font-size-base',
    lg: 'font-size-lg',
  }[fontSize];

  return (
    <div className={`min-h-screen flex flex-col bg-[#F3F4F6] text-[#1E293B] ${fontSizeClass}`}>
      
      {/* Global GIGW Header with Accessibility & Bhashini Selector */}
      <GIGWHeader />

      {/* Gazette News Ticker */}
      <GIGWMarquee />

      {/* Main Workspace Content Area */}
      <main id="main-content" className="flex-1 p-3 md:p-4 overflow-y-auto">
        {currentView === 'LOGIN' && <LoginView />}
        {currentView === 'MINISTER_DASHBOARD' && <MinisterDashboardView />}
        {currentView === 'DNO_DASHBOARD' && <DNODashboardView />}
        {currentView === 'TRIAGE' && <TriageWorkspaceView />}
        {currentView === 'SPLIT_REVIEW' && <SplitScreenReviewView />}
        {currentView === 'RULE_ENGINE' && <SchemeRuleEngineView />}
        {currentView === 'PFMS' && <PfmsDisbursementView />}
        {currentView === 'GRIEVANCE' && <GrievanceHelpdeskView />}
      </main>

      {/* NIC Standard GIGW Footer */}
      <GIGWFooter />

      {/* Real-time State Notification Toast */}
      <NotificationToast />

    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

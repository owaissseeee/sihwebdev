import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  AppView, 
  TriageFolder, 
  ScholarshipApplication, 
  ScholarshipScheme, 
  PfmsBatch, 
  PfmsFailure, 
  GrievanceTicket, 
  RuleCondition 
} from '../types';
import { backendApi } from '../services/mockApi';
import { SupportedLanguage } from '../config';
import { TRANSLATIONS } from '../services/translations';

interface ToastState {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface AppContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  currentView: AppView;
  setCurrentView: (view: AppView, pushHistory?: boolean) => void;
  triageFolder: TriageFolder;
  setTriageFolder: (folder: TriageFolder) => void;
  selectedAppId: string | null;
  setSelectedAppId: (id: string | null) => void;
  applications: ScholarshipApplication[];
  schemes: ScholarshipScheme[];
  pfmsBatches: PfmsBatch[];
  pfmsFailures: PfmsFailure[];
  grievances: GrievanceTicket[];
  selectedGrievanceId: number | null;
  setSelectedGrievanceId: (id: number | null) => void;
  fontSize: 'sm' | 'base' | 'lg';
  setFontSize: (size: 'sm' | 'base' | 'lg') => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  toast: ToastState | null;
  showToast: (message: string, type?: ToastState['type']) => void;
  
  // State Mutations (Connected to Mock Backend)
  approveApplication: (id: string) => Promise<void>;
  raiseDefect: (id: string, remarks: string) => Promise<void>;
  rejectApplication: (id: string, reason: string) => Promise<void>;
  batchApproveHighConfidence: () => Promise<void>;
  addSchemeRule: (schemeId: string, rule: Omit<RuleCondition, 'id'>) => Promise<void>;
  removeSchemeRule: (schemeId: string, ruleId: string) => Promise<void>;
  saveScheme: (scheme: ScholarshipScheme) => Promise<void>;
  createNewScheme: (schemeData: Omit<ScholarshipScheme, 'id'>) => Promise<void>;
  pushPfmsBatch: (batchId: string) => Promise<void>;
  notifyStudentBankUpdate: (failureId: string) => Promise<void>;
  resolveGrievance: (ticketId: number, reply: string) => Promise<void>;
  openSplitReviewForApp: (appId: string) => void;
  resetDatabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRoleState] = useState<UserRole>('MINISTER_ADMIN');
  const [currentView, setCurrentViewState] = useState<AppView>('LOGIN');
  const [triageFolder, setTriageFolder] = useState<TriageFolder>('high');
  const [selectedAppId, setSelectedAppId] = useState<string | null>('IND-ST-2026-992');
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<number | null>(1);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [toast, setToast] = useState<ToastState | null>(null);

  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [schemes, setSchemes] = useState<ScholarshipScheme[]>([]);
  const [pfmsBatches, setPfmsBatches] = useState<PfmsBatch[]>([]);
  const [pfmsFailures, setPfmsFailures] = useState<PfmsFailure[]>([]);
  const [grievances, setGrievances] = useState<GrievanceTicket[]>([]);

  // Load initial backend state on mount
  useEffect(() => {
    async function loadData() {
      const [apps, schs, batches, fails, gvs] = await Promise.all([
        backendApi.getApplications(),
        backendApi.getSchemes(),
        backendApi.getPfmsBatches(),
        backendApi.getPfmsFailures(),
        backendApi.getGrievances()
      ]);
      setApplications(apps);
      setSchemes(schs);
      setPfmsBatches(batches);
      setPfmsFailures(fails);
      setGrievances(gvs);
    }
    loadData();
  }, []);

  // Browser History & URL Hash Sync
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#/', '').toUpperCase();
      const validViews: AppView[] = [
        'LOGIN', 'MINISTER_DASHBOARD', 'DNO_DASHBOARD', 
        'TRIAGE', 'SPLIT_REVIEW', 'RULE_ENGINE', 'PFMS', 'GRIEVANCE'
      ];
      if (validViews.includes(hash as AppView)) {
        setCurrentViewState(hash as AppView);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setCurrentView = (view: AppView, pushHistory = true) => {
    setCurrentViewState(view);
    if (pushHistory) {
      window.history.pushState({ view }, '', `#/${view.toLowerCase()}`);
    }
  };

  const showToast = (message: string, type: ToastState['type'] = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Translation function using Bhashini dictionary
  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  };

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    if (currentView !== 'LOGIN') {
      if (role === 'MINISTER_ADMIN') {
        setCurrentView('MINISTER_DASHBOARD');
      } else {
        setCurrentView('DNO_DASHBOARD');
      }
    }
    showToast(`Role switched to ${role === 'MINISTER_ADMIN' ? 'Minister Admin (MoTA)' : 'District Nodal Officer (DNO)'}`, 'info');
  };

  const openSplitReviewForApp = (appId: string) => {
    setSelectedAppId(appId);
    setCurrentView('SPLIT_REVIEW');
  };

  // Backend Mutation Handlers
  const approveApplication = async (id: string) => {
    await backendApi.updateApplicationStatus(id, 'APPROVED');
    const freshApps = await backendApi.getApplications();
    setApplications(freshApps);
    showToast(`Application ${id} APPROVED. Transferred to approved sanction docket.`, 'success');
  };

  const raiseDefect = async (id: string, remarks: string) => {
    await backendApi.updateApplicationStatus(id, 'DEFECTIVE', remarks);
    const freshApps = await backendApi.getApplications();
    setApplications(freshApps);
    showToast(`Defect notice registered for ${id}. SMS & Portal alert dispatched.`, 'warning');
  };

  const rejectApplication = async (id: string, reason: string) => {
    await backendApi.updateApplicationStatus(id, 'REJECTED', undefined, reason);
    const freshApps = await backendApi.getApplications();
    setApplications(freshApps);
    showToast(`Application ${id} officially REJECTED and archived in MoTA audit trail.`, 'error');
  };

  const batchApproveHighConfidence = async () => {
    const result = await backendApi.batchApproveHighConfidence();
    const [freshApps, freshBatches] = await Promise.all([
      backendApi.getApplications(),
      backendApi.getPfmsBatches()
    ]);
    setApplications(freshApps);
    setPfmsBatches(freshBatches);
    showToast(`Batch Sanction List (${result.batch.batchCode}) generated for ${result.batch.beneficiaryCount.toLocaleString()} candidates.`, 'success');
  };

  const addSchemeRule = async (schemeId: string, rule: Omit<RuleCondition, 'id'>) => {
    await backendApi.addSchemeRule(schemeId, rule);
    const freshSchemes = await backendApi.getSchemes();
    setSchemes(freshSchemes);
    showToast('New AI Eligibility Rule added to logic builder.', 'success');
  };

  const removeSchemeRule = async (schemeId: string, ruleId: string) => {
    await backendApi.removeSchemeRule(schemeId, ruleId);
    const freshSchemes = await backendApi.getSchemes();
    setSchemes(freshSchemes);
    showToast('Eligibility rule removed.', 'warning');
  };

  const saveScheme = async (updatedScheme: ScholarshipScheme) => {
    await backendApi.updateScheme(updatedScheme);
    const freshSchemes = await backendApi.getSchemes();
    setSchemes(freshSchemes);
    showToast(`Scheme ${updatedScheme.name} configuration deployed to NIC MeghRaj Rulebase.`, 'success');
  };

  const createNewScheme = async (schemeData: Omit<ScholarshipScheme, 'id'>) => {
    const newScheme = await backendApi.createScheme(schemeData);
    const freshSchemes = await backendApi.getSchemes();
    setSchemes(freshSchemes);
    showToast(`New Scheme "${newScheme.name}" successfully registered & deployed to backend!`, 'success');
  };

  const pushPfmsBatch = async (batchId: string) => {
    await backendApi.pushPfmsBatch(batchId);
    const freshBatches = await backendApi.getPfmsBatches();
    setPfmsBatches(freshBatches);
    showToast(`Batch ${batchId} transmitted to RBI Central Clearing House & PFMS DBT Server.`, 'success');
  };

  const notifyStudentBankUpdate = async (failureId: string) => {
    await backendApi.notifyStudentBankUpdate(failureId);
    const freshFailures = await backendApi.getPfmsFailures();
    setPfmsFailures(freshFailures);
    showToast('Automated SMS & Portal notification pushed to beneficiary to update bank details.', 'info');
  };

  const resolveGrievance = async (ticketId: number, reply: string) => {
    await backendApi.resolveGrievance(ticketId, reply);
    const freshGrievances = await backendApi.getGrievances();
    setGrievances(freshGrievances);
    showToast(`Formal Disposal Order for Ticket #${ticketId} dispatched and ticket marked RESOLVED.`, 'success');
  };

  const resetDatabase = async () => {
    await backendApi.resetDatabase();
    const [apps, schs, batches, fails, gvs] = await Promise.all([
      backendApi.getApplications(),
      backendApi.getSchemes(),
      backendApi.getPfmsBatches(),
      backendApi.getPfmsFailures(),
      backendApi.getGrievances()
    ]);
    setApplications(apps);
    setSchemes(schs);
    setPfmsBatches(batches);
    setPfmsFailures(fails);
    setGrievances(gvs);
    showToast('Mock database reset to factory initial state.', 'info');
  };

  return (
    <AppContext.Provider value={{
      activeRole,
      setActiveRole,
      currentView,
      setCurrentView,
      triageFolder,
      setTriageFolder,
      selectedAppId,
      setSelectedAppId,
      applications,
      schemes,
      pfmsBatches,
      pfmsFailures,
      grievances,
      selectedGrievanceId,
      setSelectedGrievanceId,
      fontSize,
      setFontSize,
      language,
      setLanguage,
      t,
      toast,
      showToast,
      approveApplication,
      raiseDefect,
      rejectApplication,
      batchApproveHighConfidence,
      addSchemeRule,
      removeSchemeRule,
      saveScheme,
      createNewScheme,
      pushPfmsBatch,
      notifyStudentBankUpdate,
      resolveGrievance,
      openSplitReviewForApp,
      resetDatabase
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import { 
  ScholarshipApplication, 
  ScholarshipScheme, 
  PfmsBatch, 
  PfmsFailure, 
  GrievanceTicket, 
  VerificationStatus,
  RuleCondition
} from '../types';
import { 
  INITIAL_APPLICATIONS, 
  INITIAL_SCHEMES, 
  INITIAL_PFMS_BATCHES, 
  INITIAL_PFMS_FAILURES, 
  INITIAL_GRIEVANCES 
} from './mockData';
import { PORTAL_CONFIG } from '../config';

const STORAGE_KEYS = {
  APPLICATIONS: `${PORTAL_CONFIG.LOCAL_STORAGE_KEY_PREFIX}_apps`,
  SCHEMES: `${PORTAL_CONFIG.LOCAL_STORAGE_KEY_PREFIX}_schemes`,
  PFMS_BATCHES: `${PORTAL_CONFIG.LOCAL_STORAGE_KEY_PREFIX}_batches`,
  PFMS_FAILURES: `${PORTAL_CONFIG.LOCAL_STORAGE_KEY_PREFIX}_failures`,
  GRIEVANCES: `${PORTAL_CONFIG.LOCAL_STORAGE_KEY_PREFIX}_grievances`,
};

// Helper for local storage retrieval with default fallback
function loadFromStorage<T>(key: string, defaultData: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Could not load ${key} from storage, using initial mock data.`, e);
  }
  return defaultData;
}

// Helper for saving to storage
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Could not save ${key} to storage.`, e);
  }
}

/**
 * =========================================================================
 * Simulated RESTful Backend Service for Ministry of Tribal Affairs (MoTA)
 * Backend Developers can easily replace these methods with `fetch('/api/v1/...')`
 * =========================================================================
 */
export const backendApi = {
  // -------------------------------------------------------------
  // Applications Endpoints (GET /api/v1/applications, POST, PATCH)
  // -------------------------------------------------------------
  async getApplications(): Promise<ScholarshipApplication[]> {
    return loadFromStorage<ScholarshipApplication[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  },

  async getApplicationById(id: string): Promise<ScholarshipApplication | null> {
    const list = await this.getApplications();
    return list.find(a => a.id === id) || null;
  },

  async updateApplicationStatus(
    id: string, 
    status: VerificationStatus, 
    remarks?: string, 
    rejectionReason?: string
  ): Promise<ScholarshipApplication> {
    const list = await this.getApplications();
    let updatedApp: ScholarshipApplication | null = null;

    const updatedList = list.map(app => {
      if (app.id === id) {
        let triageFolder = app.triageFolder;
        let aiConfidence = app.aiConfidenceScore;

        if (status === 'APPROVED') {
          triageFolder = 'high';
          aiConfidence = Math.max(aiConfidence, 98);
        } else if (status === 'DEFECTIVE') {
          triageFolder = 'manual';
        } else if (status === 'REJECTED') {
          triageFolder = 'flagged';
        }

        updatedApp = {
          ...app,
          status,
          triageFolder,
          aiConfidenceScore: aiConfidence,
          defectRemarks: remarks || app.defectRemarks,
          rejectionReason: rejectionReason || app.rejectionReason,
        };
        return updatedApp;
      }
      return app;
    });

    saveToStorage(STORAGE_KEYS.APPLICATIONS, updatedList);
    if (!updatedApp) throw new Error(`Application with ID ${id} not found`);
    return updatedApp;
  },

  async batchApproveHighConfidence(): Promise<{ batch: PfmsBatch; approvedCount: number }> {
    const list = await this.getApplications();
    const highApps = list.filter(a => a.triageFolder === 'high' && a.status !== 'APPROVED');

    const updatedList = list.map(app => {
      if (app.triageFolder === 'high' && app.status !== 'APPROVED') {
        return { ...app, status: 'APPROVED' as VerificationStatus };
      }
      return app;
    });

    saveToStorage(STORAGE_KEYS.APPLICATIONS, updatedList);

    const batchCode = `SO-2026-OCT-${Math.floor(100 + Math.random() * 900)}`;
    const newBatch: PfmsBatch = {
      id: `b-${Date.now()}`,
      batchCode,
      schemeName: 'Batch Auto-Verified Scholars (High Confidence)',
      beneficiaryCount: highApps.length > 0 ? highApps.length : 198000,
      totalAmountInr: '81,18,00,000',
      auditVerification: '100% Aadhaar & OCR Verified',
      dscStatus: 'Signed (Joint Secretary Digital DSC)',
      status: 'READY',
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    const batches = await this.getPfmsBatches();
    const updatedBatches = [newBatch, ...batches];
    saveToStorage(STORAGE_KEYS.PFMS_BATCHES, updatedBatches);

    return { batch: newBatch, approvedCount: highApps.length };
  },

  // -------------------------------------------------------------
  // Schemes Endpoints (GET /api/v1/schemes, POST, PUT, DELETE)
  // -------------------------------------------------------------
  async getSchemes(): Promise<ScholarshipScheme[]> {
    return loadFromStorage<ScholarshipScheme[]>(STORAGE_KEYS.SCHEMES, INITIAL_SCHEMES);
  },

  async createScheme(schemeData: Omit<ScholarshipScheme, 'id'>): Promise<ScholarshipScheme> {
    const list = await this.getSchemes();
    const id = `SCH-${schemeData.code.toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
    const newScheme: ScholarshipScheme = {
      ...schemeData,
      id,
    };
    const updatedList = [newScheme, ...list];
    saveToStorage(STORAGE_KEYS.SCHEMES, updatedList);
    return newScheme;
  },

  async updateScheme(scheme: ScholarshipScheme): Promise<ScholarshipScheme> {
    const list = await this.getSchemes();
    const updatedList = list.map(s => s.id === scheme.id ? scheme : s);
    saveToStorage(STORAGE_KEYS.SCHEMES, updatedList);
    return scheme;
  },

  async addSchemeRule(schemeId: string, rule: Omit<RuleCondition, 'id'>): Promise<ScholarshipScheme> {
    const list = await this.getSchemes();
    let updatedScheme: ScholarshipScheme | null = null;
    const newRule: RuleCondition = {
      ...rule,
      id: `r-${Date.now()}`
    };

    const updatedList = list.map(s => {
      if (s.id === schemeId) {
        updatedScheme = {
          ...s,
          rules: [...s.rules, newRule]
        };
        return updatedScheme;
      }
      return s;
    });

    saveToStorage(STORAGE_KEYS.SCHEMES, updatedList);
    if (!updatedScheme) throw new Error(`Scheme ${schemeId} not found`);
    return updatedScheme;
  },

  async removeSchemeRule(schemeId: string, ruleId: string): Promise<ScholarshipScheme> {
    const list = await this.getSchemes();
    let updatedScheme: ScholarshipScheme | null = null;

    const updatedList = list.map(s => {
      if (s.id === schemeId) {
        updatedScheme = {
          ...s,
          rules: s.rules.filter(r => r.id !== ruleId)
        };
        return updatedScheme;
      }
      return s;
    });

    saveToStorage(STORAGE_KEYS.SCHEMES, updatedList);
    if (!updatedScheme) throw new Error(`Scheme ${schemeId} not found`);
    return updatedScheme;
  },

  // -------------------------------------------------------------
  // PFMS & DBT Endpoints (GET /api/v1/pfms/batches, POST)
  // -------------------------------------------------------------
  async getPfmsBatches(): Promise<PfmsBatch[]> {
    return loadFromStorage<PfmsBatch[]>(STORAGE_KEYS.PFMS_BATCHES, INITIAL_PFMS_BATCHES);
  },

  async pushPfmsBatch(batchId: string): Promise<PfmsBatch> {
    const list = await this.getPfmsBatches();
    let updatedBatch: PfmsBatch | null = null;

    const updatedList = list.map(b => {
      if (b.id === batchId) {
        updatedBatch = { ...b, status: 'TRANSMITTED' as const };
        return updatedBatch;
      }
      return b;
    });

    saveToStorage(STORAGE_KEYS.PFMS_BATCHES, updatedList);
    if (!updatedBatch) throw new Error(`Batch ${batchId} not found`);
    return updatedBatch;
  },

  async getPfmsFailures(): Promise<PfmsFailure[]> {
    return loadFromStorage<PfmsFailure[]>(STORAGE_KEYS.PFMS_FAILURES, INITIAL_PFMS_FAILURES);
  },

  async notifyStudentBankUpdate(failureId: string): Promise<PfmsFailure> {
    const list = await this.getPfmsFailures();
    let updatedFailure: PfmsFailure | null = null;

    const updatedList = list.map(f => {
      if (f.id === failureId) {
        updatedFailure = { ...f, status: 'STUDENT_NOTIFIED' as const };
        return updatedFailure;
      }
      return f;
    });

    saveToStorage(STORAGE_KEYS.PFMS_FAILURES, updatedList);
    if (!updatedFailure) throw new Error(`Failure record ${failureId} not found`);
    return updatedFailure;
  },

  // -------------------------------------------------------------
  // Grievance Helpdesk Endpoints (GET /api/v1/grievances, POST)
  // -------------------------------------------------------------
  async getGrievances(): Promise<GrievanceTicket[]> {
    return loadFromStorage<GrievanceTicket[]>(STORAGE_KEYS.GRIEVANCES, INITIAL_GRIEVANCES);
  },

  async resolveGrievance(ticketId: number, officialReply: string): Promise<GrievanceTicket> {
    const list = await this.getGrievances();
    let updatedTicket: GrievanceTicket | null = null;

    const updatedList = list.map(g => {
      if (g.id === ticketId) {
        updatedTicket = { ...g, status: 'RESOLVED' as const, officialReply };
        return updatedTicket;
      }
      return g;
    });

    saveToStorage(STORAGE_KEYS.GRIEVANCES, updatedList);
    if (!updatedTicket) throw new Error(`Ticket #${ticketId} not found`);
    return updatedTicket;
  },

  // -------------------------------------------------------------
  // Reset Mock Database to Initial Factory State (Developer Tool)
  // -------------------------------------------------------------
  async resetDatabase(): Promise<void> {
    saveToStorage(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    saveToStorage(STORAGE_KEYS.SCHEMES, INITIAL_SCHEMES);
    saveToStorage(STORAGE_KEYS.PFMS_BATCHES, INITIAL_PFMS_BATCHES);
    saveToStorage(STORAGE_KEYS.PFMS_FAILURES, INITIAL_PFMS_FAILURES);
    saveToStorage(STORAGE_KEYS.GRIEVANCES, INITIAL_GRIEVANCES);
  }
};

export type UserRole = 'MINISTER_ADMIN' | 'DISTRICT_NODAL_OFFICER';

export type AppView = 
  | 'LOGIN' 
  | 'MINISTER_DASHBOARD' 
  | 'DNO_DASHBOARD' 
  | 'TRIAGE' 
  | 'SPLIT_REVIEW' 
  | 'RULE_ENGINE' 
  | 'PFMS' 
  | 'GRIEVANCE';

export type VerificationStatus = 
  | 'AUTO_VERIFIED' 
  | 'NEEDS_REVIEW' 
  | 'FLAGGED' 
  | 'APPROVED' 
  | 'DEFECTIVE' 
  | 'REJECTED';

export type TriageFolder = 'high' | 'manual' | 'flagged' | 'processed';

export interface RuleCondition {
  id: string;
  parameter: string;
  operator: 'EQUALS' | 'LESS_THAN_OR_EQUAL' | 'GREATER_THAN_OR_EQUAL' | 'CONTAINS' | 'NOT_EQUALS';
  value: string;
  status: 'Strict Pass' | 'Warning' | 'Manual Verification Required';
}

export interface ScholarshipScheme {
  id: string;
  code: string;
  name: string;
  category: string;
  academicYear: string;
  sanctionCap: number;
  annualBudget: string;
  totalApplied: number;
  verifiedCount: number;
  pendingCount: number;
  defectiveCount: number;
  portalOpeningDate: string;
  inoDeadline: string;
  dnoDeadline: string;
  rules: RuleCondition[];
  mandatoryDocuments: {
    aadhaar: boolean;
    casteCert: boolean;
    incomeCert: boolean;
    degreeMarksheet: boolean;
    bankPassbook: boolean;
    bonafideCert: boolean;
    phdRegistration?: boolean;
  };
}

export interface DocumentDetail {
  id: string;
  name: string;
  hasDiscrepancy: boolean;
  statusBadge: string;
  type: 'INCOME' | 'CASTE' | 'AADHAAR' | 'BONAFIDE' | 'BANK';
  certNumber?: string;
  issueDate?: string;
  issuingAuthority?: string;
  qrHash?: string;
  extractedIncome?: number;
  extractedTribe?: string;
  extractedAadhaarMask?: string;
  extractedBank?: string;
  extractedIfsc?: string;
  extractedCollege?: string;
  discrepancyNote?: string;
}

export interface ScholarshipApplication {
  id: string;
  applicantName: string;
  fatherName: string;
  dob: string;
  gender: string;
  tribe: string;
  state: string;
  district: string;
  institution: string;
  schemeId: string;
  schemeName: string;
  annualIncomeDeclared: number;
  annualIncomeExtracted: number;
  incomeMismatch: boolean;
  casteCertNo: string;
  casteVerified: boolean;
  aadhaarSeeded: boolean;
  bankAccount: string;
  bankIfsc: string;
  bankName: string;
  aiConfidenceScore: number; // 0 - 100
  status: VerificationStatus;
  discrepancySignal: string;
  triageFolder: TriageFolder;
  defectRemarks?: string;
  rejectionReason?: string;
  appliedDate: string;
  ocrConflictNote?: string;
  documentList: DocumentDetail[];
}

export interface PfmsBatch {
  id: string;
  batchCode: string;
  schemeName: string;
  beneficiaryCount: number;
  totalAmountInr: string;
  auditVerification: string;
  dscStatus: string;
  status: 'READY' | 'TRANSMITTED' | 'CLEARED';
  timestamp: string;
}

export interface PfmsFailure {
  id: string;
  beneficiaryName: string;
  accountNo: string;
  ifsc: string;
  failureReason: string;
  errorCode: string;
  status: 'ACTION_REQUIRED' | 'STUDENT_NOTIFIED' | 'RESOLVED';
  applicationId: string;
}

export interface GrievanceTicket {
  id: number;
  ticketCode: string;
  applicantName: string;
  schemeName: string;
  regNo: string;
  email: string;
  mobile: string;
  district: string;
  state: string;
  subject: string;
  message: string;
  aiSuggestedDraft: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  officialReply?: string;
  timestamp: string;
}

export interface StartupFeeItem {
  id: string;
  name: string;
  amount: number;
  timing: 'oneTime' | 'perVisit' | 'asNeeded';
  estimatedOccurrences?: number;
}

export interface StudyInfo {
  protocolNumber: string;
  studyTitle: string;
  piName: string;
  studyDate: string;
  sponsor: string;
  siteName: string;
}

export interface Visit {
  id: string;
  name: string;
  paymentPerVisit: number;
}

export interface CustomRevenueItem {
  id: string;
  name: string;
  amount: number;
  type: 'flat' | 'perPatient' | 'perVisit';
  timing: 'oneTime' | 'perVisit' | 'asNeeded';
  estimatedOccurrences?: number;
}

export interface PersonnelReimbursement {
  id: string;
  role: string;
  type: 'perPatient' | 'flatMonthly';
  hourlyRate?: number;
  hours?: number;
  monthlyFee?: number;
  months?: number;
}

export interface BudgetData {
  studyInfo: StudyInfo;
  startupFees: StartupFeeItem[];
  visits: Visit[];
  overhead: number;
  customRevenueItems: CustomRevenueItem[];
  targetEnrollment: number;
  personnelReimbursements: PersonnelReimbursement[];
  notes: string;
}
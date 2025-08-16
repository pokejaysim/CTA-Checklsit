import type { BudgetData } from '@/types/budget';

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Phase I' | 'Phase II' | 'Phase III' | 'Observational' | 'Device' | 'Custom';
  data: Omit<BudgetData, 'studyInfo'>;
  createdAt: string;
  isDefault: boolean;
}

// Default templates for different study types
export const defaultTemplates: BudgetTemplate[] = [
  {
    id: 'phase-1-oncology',
    name: 'Phase I Oncology Study',
    description: 'Template for early-phase oncology studies with dose escalation',
    category: 'Phase I',
    isDefault: true,
    createdAt: new Date().toISOString(),
    data: {
      targetEnrollment: 30,
      overhead: 25,
      startupFees: [
        { id: '1', name: 'IRB Review Fee', amount: 5000, timing: 'oneTime' as const },
        { id: '2', name: 'Contract Negotiation', amount: 3000, timing: 'oneTime' as const },
        { id: '3', name: 'Site Initiation', amount: 8000, timing: 'oneTime' as const },
        { id: '4', name: 'Pharmacy Setup', amount: 4000, timing: 'oneTime' as const },
      ],
      visits: [
        { id: '1', name: 'Screening Visit', paymentPerVisit: 1200 },
        { id: '2', name: 'Cycle 1 Day 1', paymentPerVisit: 1800 },
        { id: '3', name: 'Cycle 1 Day 15', paymentPerVisit: 800 },
        { id: '4', name: 'End of Cycle Visits', paymentPerVisit: 1000 },
        { id: '5', name: 'End of Treatment', paymentPerVisit: 1500 },
      ],
      customRevenueItems: [
        { id: '1', name: 'SAE Reporting', amount: 500, type: 'perPatient' as const, timing: 'oneTime' as const },
        { id: '2', name: 'Biomarker Analysis', amount: 2000, type: 'perPatient' as const, timing: 'oneTime' as const },
      ],
      personnelReimbursements: [
        { id: '1', role: 'Study Coordinator', type: 'perPatient', hourlyRate: 65, hours: 8 },
        { id: '2', role: 'Principal Investigator', type: 'perPatient', hourlyRate: 150, hours: 2 },
        { id: '3', role: 'Pharmacist', type: 'flatMonthly', monthlyFee: 2000, months: 18 },
      ],
      notes: 'Phase I oncology template with standard dose-escalation study components.',
    },
  },
  {
    id: 'phase-2-cardiology',
    name: 'Phase II Cardiology Study',
    description: 'Template for Phase II cardiovascular intervention studies',
    category: 'Phase II',
    isDefault: true,
    createdAt: new Date().toISOString(),
    data: {
      targetEnrollment: 120,
      overhead: 30,
      startupFees: [
        { id: '1', name: 'IRB Review Fee', amount: 6000, timing: 'oneTime' as const },
        { id: '2', name: 'Site Qualification', amount: 5000, timing: 'oneTime' as const },
        { id: '3', name: 'Equipment Training', amount: 4000, timing: 'oneTime' as const },
        { id: '4', name: 'Central Lab Setup', amount: 3500, timing: 'oneTime' as const },
      ],
      visits: [
        { id: '1', name: 'Screening/Baseline', paymentPerVisit: 1500 },
        { id: '2', name: 'Randomization', paymentPerVisit: 800 },
        { id: '3', name: 'Week 4 Follow-up', paymentPerVisit: 900 },
        { id: '4', name: 'Week 12 Follow-up', paymentPerVisit: 1100 },
        { id: '5', name: 'Week 24 Follow-up', paymentPerVisit: 1100 },
        { id: '6', name: 'Week 52 Follow-up', paymentPerVisit: 1200 },
      ],
      customRevenueItems: [
        { id: '1', name: 'Echocardiogram Reading', amount: 300, type: 'perPatient' as const, timing: 'oneTime' as const },
        { id: '2', name: 'ECG Central Reading', amount: 150, type: 'perVisit' as const, timing: 'perVisit' as const },
        { id: '3', name: 'Device Training', amount: 8000, type: 'flat' as const, timing: 'oneTime' as const },
      ],
      personnelReimbursements: [
        { id: '1', role: 'Study Coordinator', type: 'perPatient', hourlyRate: 70, hours: 6 },
        { id: '2', role: 'Principal Investigator', type: 'perPatient', hourlyRate: 200, hours: 1.5 },
        { id: '3', role: 'Echo Technician', type: 'perPatient', hourlyRate: 80, hours: 2 },
        { id: '4', role: 'Data Manager', type: 'flatMonthly', monthlyFee: 3000, months: 24 },
      ],
      notes: 'Phase II cardiology template with imaging endpoints and device components.',
    },
  },
  {
    id: 'phase-3-diabetes',
    name: 'Phase III Diabetes Study',
    description: 'Template for large Phase III diabetes outcome studies',
    category: 'Phase III',
    isDefault: true,
    createdAt: new Date().toISOString(),
    data: {
      targetEnrollment: 200,
      overhead: 28,
      startupFees: [
        { id: '1', name: 'IRB Review Fee', amount: 8000, timing: 'oneTime' as const },
        { id: '2', name: 'Site Initiation Visit', amount: 12000, timing: 'oneTime' as const },
        { id: '3', name: 'Lab Certification', amount: 4000, timing: 'oneTime' as const },
        { id: '4', name: 'Staff Training', amount: 6000, timing: 'oneTime' as const },
      ],
      visits: [
        { id: '1', name: 'Screening Visit', paymentPerVisit: 800 },
        { id: '2', name: 'Randomization Visit', paymentPerVisit: 600 },
        { id: '3', name: 'Month 1 Visit', paymentPerVisit: 400 },
        { id: '4', name: 'Month 3 Visit', paymentPerVisit: 500 },
        { id: '5', name: 'Month 6 Visit', paymentPerVisit: 500 },
        { id: '6', name: 'Month 12 Visit', paymentPerVisit: 600 },
        { id: '7', name: 'Final Visit', paymentPerVisit: 700 },
      ],
      customRevenueItems: [
        { id: '1', name: 'HbA1c Testing', amount: 50, type: 'perVisit' as const, timing: 'perVisit' as const },
        { id: '2', name: 'Glucose Monitoring', amount: 200, type: 'perPatient' as const, timing: 'oneTime' as const },
        { id: '3', name: 'MACE Adjudication', amount: 300, type: 'perPatient' as const, timing: 'asNeeded' as const, estimatedOccurrences: 2 },
      ],
      personnelReimbursements: [
        { id: '1', role: 'Study Coordinator', type: 'perPatient', hourlyRate: 75, hours: 4 },
        { id: '2', role: 'Principal Investigator', type: 'perPatient', hourlyRate: 180, hours: 1 },
        { id: '3', role: 'Sub-Investigator', type: 'perPatient', hourlyRate: 120, hours: 0.5 },
        { id: '4', role: 'CRA Support', type: 'flatMonthly', monthlyFee: 4000, months: 30 },
      ],
      notes: 'Phase III diabetes template for cardiovascular outcome studies with long-term follow-up.',
    },
  },
  {
    id: 'observational',
    name: 'Observational Registry Study',
    description: 'Template for observational registry and real-world evidence studies',
    category: 'Observational',
    isDefault: true,
    createdAt: new Date().toISOString(),
    data: {
      targetEnrollment: 300,
      overhead: 20,
      startupFees: [
        { id: '1', name: 'IRB Review Fee', amount: 3000, timing: 'oneTime' as const },
        { id: '2', name: 'Site Setup', amount: 2500, timing: 'oneTime' as const },
        { id: '3', name: 'Database Access', amount: 2000, timing: 'oneTime' as const },
      ],
      visits: [
        { id: '1', name: 'Enrollment Visit', paymentPerVisit: 300 },
        { id: '2', name: '6-Month Follow-up', paymentPerVisit: 200 },
        { id: '3', name: '12-Month Follow-up', paymentPerVisit: 200 },
      ],
      customRevenueItems: [
        { id: '1', name: 'Chart Review', amount: 100, type: 'perPatient' as const, timing: 'oneTime' as const },
        { id: '2', name: 'Phone Follow-up', amount: 50, type: 'perPatient' as const, timing: 'asNeeded' as const, estimatedOccurrences: 3 },
      ],
      personnelReimbursements: [
        { id: '1', role: 'Study Coordinator', type: 'perPatient', hourlyRate: 60, hours: 2 },
        { id: '2', role: 'Principal Investigator', type: 'perPatient', hourlyRate: 150, hours: 0.5 },
        { id: '3', role: 'Data Entry', type: 'flatMonthly', monthlyFee: 1500, months: 18 },
      ],
      notes: 'Observational study template for registry and real-world evidence collection.',
    },
  },
];

const TEMPLATES_STORAGE_KEY = 'ctaBudget_templates';

export const loadTemplates = (): BudgetTemplate[] => {
  try {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (stored) {
      const userTemplates = JSON.parse(stored);
      return [...defaultTemplates, ...userTemplates];
    }
    return defaultTemplates;
  } catch (error) {
    console.error('Error loading templates:', error);
    return defaultTemplates;
  }
};

export const saveTemplate = (template: Omit<BudgetTemplate, 'id' | 'createdAt' | 'isDefault'>): void => {
  try {
    const templates = loadTemplates().filter(t => !t.isDefault);
    const newTemplate: BudgetTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isDefault: false,
    };
    
    templates.push(newTemplate);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Error saving template:', error);
  }
};

export const deleteTemplate = (templateId: string): void => {
  try {
    const templates = loadTemplates().filter(t => !t.isDefault && t.id !== templateId);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Error deleting template:', error);
  }
};

export const applyTemplate = (templateId: string, currentBudgetData: BudgetData): BudgetData => {
  const templates = loadTemplates();
  const template = templates.find(t => t.id === templateId);
  
  if (!template) {
    console.error(`Template with id ${templateId} not found`);
    return currentBudgetData;
  }

  // Keep current study info but apply template data
  return {
    ...template.data,
    studyInfo: currentBudgetData.studyInfo,
  };
};
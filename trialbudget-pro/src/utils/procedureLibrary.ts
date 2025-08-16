import { ProcedureTemplate } from '../types/budget.types';

export const PROCEDURE_LIBRARY: ProcedureTemplate[] = [
  // Screening Procedures
  {
    name: 'Informed Consent',
    category: 'Screening',
    defaultCost: 150,
    description: 'Obtain and document informed consent'
  },
  {
    name: 'Medical History',
    category: 'Screening',
    defaultCost: 100,
    description: 'Complete medical history review'
  },
  {
    name: 'Physical Examination',
    category: 'Screening',
    defaultCost: 200,
    description: 'Complete physical examination'
  },
  {
    name: 'Vital Signs',
    category: 'Screening',
    defaultCost: 50,
    description: 'Blood pressure, heart rate, temperature, respiratory rate'
  },
  {
    name: 'Height/Weight/BMI',
    category: 'Screening',
    defaultCost: 25,
    description: 'Anthropometric measurements'
  },

  // Laboratory Tests
  {
    name: 'Complete Blood Count (CBC)',
    category: 'Laboratory',
    defaultCost: 75,
    description: 'CBC with differential',
    commonVendors: ['LabCorp', 'Quest Diagnostics', 'Local Lab']
  },
  {
    name: 'Comprehensive Metabolic Panel (CMP)',
    category: 'Laboratory',
    defaultCost: 85,
    description: 'Basic metabolic panel with liver function',
    commonVendors: ['LabCorp', 'Quest Diagnostics', 'Local Lab']
  },
  {
    name: 'Lipid Panel',
    category: 'Laboratory',
    defaultCost: 65,
    description: 'Total cholesterol, HDL, LDL, triglycerides',
    commonVendors: ['LabCorp', 'Quest Diagnostics', 'Local Lab']
  },
  {
    name: 'HbA1c',
    category: 'Laboratory',
    defaultCost: 45,
    description: 'Hemoglobin A1c',
    commonVendors: ['LabCorp', 'Quest Diagnostics', 'Local Lab']
  },
  {
    name: 'Urinalysis',
    category: 'Laboratory',
    defaultCost: 35,
    description: 'Complete urinalysis with microscopy',
    commonVendors: ['LabCorp', 'Quest Diagnostics', 'Local Lab']
  },
  {
    name: 'Pregnancy Test (Serum)',
    category: 'Laboratory',
    defaultCost: 40,
    description: 'Serum beta-hCG',
    commonVendors: ['LabCorp', 'Quest Diagnostics', 'Local Lab']
  },

  // Imaging
  {
    name: 'Chest X-ray',
    category: 'Imaging',
    defaultCost: 150,
    description: 'Posterior-anterior and lateral chest radiograph'
  },
  {
    name: 'ECG (12-lead)',
    category: 'Imaging',
    defaultCost: 100,
    description: '12-lead electrocardiogram'
  },
  {
    name: 'Echocardiogram',
    category: 'Imaging',
    defaultCost: 450,
    description: 'Transthoracic echocardiogram'
  },
  {
    name: 'CT Scan (Chest)',
    category: 'Imaging',
    defaultCost: 800,
    description: 'CT chest without contrast'
  },
  {
    name: 'MRI (Brain)',
    category: 'Imaging',
    defaultCost: 1200,
    description: 'Brain MRI without contrast'
  },

  // Safety Assessments
  {
    name: 'Adverse Event Assessment',
    category: 'Safety',
    defaultCost: 75,
    description: 'Review and document adverse events'
  },
  {
    name: 'Concomitant Medication Review',
    category: 'Safety',
    defaultCost: 50,
    description: 'Review and update concomitant medications'
  },
  {
    name: 'Drug Accountability',
    category: 'Safety',
    defaultCost: 40,
    description: 'Investigational product accountability'
  },

  // Efficacy Assessments
  {
    name: 'Quality of Life Questionnaire',
    category: 'Efficacy',
    defaultCost: 60,
    description: 'Validated QOL assessment'
  },
  {
    name: 'Disease Activity Score',
    category: 'Efficacy',
    defaultCost: 80,
    description: 'Disease-specific activity assessment'
  },
  {
    name: 'Biomarker Analysis',
    category: 'Efficacy',
    defaultCost: 300,
    description: 'Specialized biomarker testing'
  },

  // Pharmacokinetics
  {
    name: 'PK Blood Draw',
    category: 'Pharmacokinetics',
    defaultCost: 125,
    description: 'Blood sample for PK analysis'
  },
  {
    name: 'PK Analysis',
    category: 'Pharmacokinetics',
    defaultCost: 450,
    description: 'Pharmacokinetic analysis of samples'
  },

  // Study Management
  {
    name: 'Study Visit Coordination',
    category: 'Study Management',
    defaultCost: 200,
    description: 'Coordination and scheduling of study visit'
  },
  {
    name: 'Source Document Review',
    category: 'Study Management',
    defaultCost: 150,
    description: 'Review and verification of source documents'
  },
  {
    name: 'Data Entry',
    category: 'Study Management',
    defaultCost: 100,
    description: 'Electronic data capture entry'
  },
  {
    name: 'Protocol Deviation Review',
    category: 'Study Management',
    defaultCost: 125,
    description: 'Review and documentation of protocol deviations'
  }
];

export const PROCEDURE_CATEGORIES = [
  { id: 'screening', name: 'Screening', color: '#3B82F6', collapsed: false, order: 1 },
  { id: 'laboratory', name: 'Laboratory', color: '#10B981', collapsed: false, order: 2 },
  { id: 'imaging', name: 'Imaging', color: '#F59E0B', collapsed: false, order: 3 },
  { id: 'safety', name: 'Safety', color: '#EF4444', collapsed: false, order: 4 },
  { id: 'efficacy', name: 'Efficacy', color: '#8B5CF6', collapsed: false, order: 5 },
  { id: 'pharmacokinetics', name: 'Pharmacokinetics', color: '#EC4899', collapsed: false, order: 6 },
  { id: 'study-management', name: 'Study Management', color: '#6B7280', collapsed: false, order: 7 }
];

// Search function for procedure library
export const searchProcedures = (searchTerm: string): ProcedureTemplate[] => {
  if (!searchTerm.trim()) return PROCEDURE_LIBRARY;
  
  const term = searchTerm.toLowerCase();
  return PROCEDURE_LIBRARY.filter(procedure =>
    procedure.name.toLowerCase().includes(term) ||
    procedure.category.toLowerCase().includes(term) ||
    procedure.description?.toLowerCase().includes(term)
  );
};

// Get procedures by category
export const getProceduresByCategory = (category: string): ProcedureTemplate[] => {
  return PROCEDURE_LIBRARY.filter(procedure => 
    procedure.category.toLowerCase() === category.toLowerCase()
  );
};
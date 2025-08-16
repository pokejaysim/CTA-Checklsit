// Core data types for TrialBudget Pro

export interface Procedure {
  id: string;
  name: string;
  category: string;
  baseCost: number;
  vendor?: string;
  notes?: string;
  customFields?: Record<string, any>;
  order: number;
}

export interface Visit {
  id: string;
  name: string;
  timepoint: string;
  windowDays?: number;
  order: number;
  color?: string;
}

export interface ProcedureVisitMapping {
  procedureId: string;
  visitId: string;
  required: boolean;
  quantity: number;
}

export interface StudyBudget {
  id: string;
  title: string;
  investigator: string;
  enrollment: number;
  duration: number;
  procedures: Procedure[];
  visits: Visit[];
  mappings: ProcedureVisitMapping[];
  costTier: CostTier;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export type CostTier = 'academic' | 'commercial' | 'government';

export interface CostConfig {
  tier: CostTier;
  multiplier: number;
  currency: string;
  escalationRate: number; // annual percentage
}

export interface ProcedureCategory {
  id: string;
  name: string;
  color: string;
  collapsed: boolean;
  order: number;
}

export interface BudgetCalculation {
  totalBudget: number;
  perSubjectCost: number;
  visitCosts: { [visitId: string]: number };
  categoryCosts: { [category: string]: number };
  procedureCosts: { [procedureId: string]: number };
}

export interface ExportOptions {
  includeNotes: boolean;
  includeBreakdown: boolean;
  currency: string;
  format: 'excel' | 'pdf' | 'csv';
}

// UI State types
export interface UIState {
  selectedProcedure: string | null;
  selectedVisit: string | null;
  searchTerm: string;
  filterCategory: string | null;
  showCostEditor: boolean;
  isDragging: boolean;
}

// Common procedure library
export interface ProcedureTemplate {
  name: string;
  category: string;
  defaultCost: number;
  description?: string;
  commonVendors?: string[];
}
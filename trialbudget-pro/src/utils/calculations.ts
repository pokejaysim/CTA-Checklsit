import { StudyBudget, BudgetCalculation, CostConfig } from '../types/budget.types';

// Calculate total budget with all costs
export const calculateBudget = (
  budget: StudyBudget,
  costConfig: CostConfig
): BudgetCalculation => {
  const { procedures, visits, mappings, enrollment } = budget;
  
  // Calculate per-procedure costs with tier multiplier
  const procedureCosts: { [procedureId: string]: number } = {};
  procedures.forEach(procedure => {
    procedureCosts[procedure.id] = procedure.baseCost * costConfig.multiplier;
  });

  // Calculate per-visit costs
  const visitCosts: { [visitId: string]: number } = {};
  visits.forEach(visit => {
    visitCosts[visit.id] = 0;
    
    // Sum all procedures for this visit
    mappings
      .filter(mapping => mapping.visitId === visit.id)
      .forEach(mapping => {
        const procedureCost = procedureCosts[mapping.procedureId] || 0;
        visitCosts[visit.id] += procedureCost * mapping.quantity;
      });
  });

  // Calculate per-category costs
  const categoryCosts: { [category: string]: number } = {};
  procedures.forEach(procedure => {
    if (!categoryCosts[procedure.category]) {
      categoryCosts[procedure.category] = 0;
    }
    
    // Sum all instances of this procedure across all visits
    const procedureTotal = mappings
      .filter(mapping => mapping.procedureId === procedure.id)
      .reduce((sum, mapping) => sum + (procedureCosts[procedure.id] * mapping.quantity), 0);
    
    categoryCosts[procedure.category] += procedureTotal;
  });

  // Calculate per-subject cost (sum of all visits)
  const perSubjectCost = Object.values(visitCosts).reduce((sum, cost) => sum + cost, 0);

  // Calculate total study budget (per-subject cost × enrollment)
  const totalBudget = perSubjectCost * enrollment;

  return {
    totalBudget,
    perSubjectCost,
    visitCosts,
    categoryCosts,
    procedureCosts
  };
};

// Calculate cost with escalation over time
export const calculateCostWithEscalation = (
  baseCost: number,
  escalationRate: number,
  years: number
): number => {
  return baseCost * Math.pow(1 + escalationRate / 100, years);
};

// Calculate enrollment projections with dropout scenarios
export const calculateEnrollmentProjections = (
  targetEnrollment: number,
  dropoutRate: number = 0.1,
  scenarios: number[] = [0.05, 0.1, 0.15, 0.2]
): { scenario: number; finalEnrollment: number; additionalNeeded: number }[] => {
  return scenarios.map(rate => {
    const finalEnrollment = Math.floor(targetEnrollment * (1 - rate));
    const additionalNeeded = Math.max(0, targetEnrollment - finalEnrollment);
    
    return {
      scenario: rate,
      finalEnrollment,
      additionalNeeded
    };
  });
};

// Format currency values
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Calculate percentage of total
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Cost tier multipliers
export const COST_MULTIPLIERS = {
  academic: 0.8,
  commercial: 1.0,
  government: 0.9
};

// Common currency configurations
export const CURRENCY_CONFIG = {
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  CAD: { symbol: 'C$', locale: 'en-CA' },
  AUD: { symbol: 'A$', locale: 'en-AU' }
};

// Validate budget data
export const validateBudget = (budget: StudyBudget): string[] => {
  const errors: string[] = [];

  if (!budget.title.trim()) {
    errors.push('Study title is required');
  }

  if (!budget.investigator.trim()) {
    errors.push('Principal investigator is required');
  }

  if (budget.enrollment <= 0) {
    errors.push('Enrollment must be greater than 0');
  }

  if (budget.duration <= 0) {
    errors.push('Study duration must be greater than 0');
  }

  if (budget.procedures.length === 0) {
    errors.push('At least one procedure is required');
  }

  if (budget.visits.length === 0) {
    errors.push('At least one visit is required');
  }

  // Check for orphaned mappings
  const validProcedureIds = new Set(budget.procedures.map(p => p.id));
  const validVisitIds = new Set(budget.visits.map(v => v.id));
  
  budget.mappings.forEach(mapping => {
    if (!validProcedureIds.has(mapping.procedureId)) {
      errors.push(`Invalid procedure reference in mapping: ${mapping.procedureId}`);
    }
    if (!validVisitIds.has(mapping.visitId)) {
      errors.push(`Invalid visit reference in mapping: ${mapping.visitId}`);
    }
  });

  return errors;
};
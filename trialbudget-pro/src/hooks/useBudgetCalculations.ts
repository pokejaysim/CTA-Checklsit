import { useMemo } from 'react';
import { StudyBudget, BudgetCalculation, CostConfig } from '../types/budget.types';
import { calculateBudget, COST_MULTIPLIERS } from '../utils/calculations';

export const useBudgetCalculations = (
  budget: StudyBudget | null,
  costTier: string = 'commercial',
  currency: string = 'USD'
): BudgetCalculation | null => {
  return useMemo(() => {
    if (!budget) return null;

    const costConfig: CostConfig = {
      tier: costTier as any,
      multiplier: COST_MULTIPLIERS[costTier as keyof typeof COST_MULTIPLIERS] || 1.0,
      currency,
      escalationRate: 0
    };

    return calculateBudget(budget, costConfig);
  }, [budget, costTier, currency]);
};
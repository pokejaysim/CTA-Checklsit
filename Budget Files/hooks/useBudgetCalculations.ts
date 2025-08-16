import { useMemo } from 'react';
import type { BudgetData } from '@/types/budget';

export interface BudgetCalculations {
  totalStartupFees: number;
  totalVisitRevenue: number;
  totalCustomRevenue: number;
  totalPersonnelReimbursements: number;
  subtotal: number;
  overheadAmount: number;
  totalRevenue: number;
}

export const useBudgetCalculations = (budgetData: BudgetData): BudgetCalculations => {
  return useMemo(() => {
    const totalStartupFees = budgetData.startupFees.reduce((sum, fee) => {
      let amount = fee.amount;
      
      if (fee.timing === 'oneTime') {
        // One-time fee: amount as is
        return sum + amount;
      } else if (fee.timing === 'perVisit') {
        // Per-visit fee: amount × total visits × target enrollment
        return sum + (amount * budgetData.visits.length * budgetData.targetEnrollment);
      } else if (fee.timing === 'asNeeded') {
        // As-needed fee: amount × estimated occurrences
        return sum + (amount * (fee.estimatedOccurrences || 1));
      }
      return sum + amount;
    }, 0);
    
    const totalVisitRevenue = budgetData.visits.reduce(
      (sum, visit) => sum + (visit.paymentPerVisit * budgetData.targetEnrollment), 
      0
    );
    
    const totalCustomRevenue = budgetData.customRevenueItems.reduce((sum, item) => {
      let baseAmount = 0;
      
      // Calculate base amount based on type
      if (item.type === 'flat') {
        baseAmount = item.amount;
      } else if (item.type === 'perPatient') {
        baseAmount = item.amount * budgetData.targetEnrollment;
      } else if (item.type === 'perVisit') {
        baseAmount = item.amount * budgetData.visits.length * budgetData.targetEnrollment;
      }
      
      // Apply timing multiplier
      if (item.timing === 'oneTime') {
        return sum + baseAmount;
      } else if (item.timing === 'perVisit') {
        // For custom revenue, per-visit timing means multiply by visits again
        return sum + (baseAmount * budgetData.visits.length);
      } else if (item.timing === 'asNeeded') {
        return sum + (baseAmount * (item.estimatedOccurrences || 1));
      }
      
      return sum + baseAmount;
    }, 0);
    
    const totalPersonnelReimbursements = budgetData.personnelReimbursements.reduce((sum, cost) => {
      if (cost.type === 'perPatient' && cost.hourlyRate && cost.hours) {
        return sum + (cost.hourlyRate * cost.hours * budgetData.targetEnrollment);
      }
      if (cost.type === 'flatMonthly' && cost.monthlyFee && cost.months) {
        return sum + (cost.monthlyFee * cost.months);
      }
      return sum;
    }, 0);
    
    const subtotal = totalStartupFees + totalVisitRevenue + totalCustomRevenue + totalPersonnelReimbursements;
    const overheadAmount = subtotal * (budgetData.overhead / 100);
    const totalRevenue = subtotal + overheadAmount;

    return {
      totalStartupFees,
      totalVisitRevenue,
      totalCustomRevenue,
      totalPersonnelReimbursements,
      subtotal,
      overheadAmount,
      totalRevenue,
    };
  }, [budgetData]);
};
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import type { BudgetData, Visit, CustomRevenueItem, PersonnelReimbursement, StartupFeeItem } from '@/types/budget';
import { loadBudgetData, saveBudgetData, defaultBudgetData, type StorageError } from '@/lib/storage';

export const useBudgetData = () => {
  const [budgetData, setBudgetData] = useState<BudgetData>(() => {
    // Use default data for SSR, load from localStorage on client
    if (typeof window === 'undefined') {
      return defaultBudgetData;
    }
    const { data } = loadBudgetData();
    return data;
  });
  const [isClient, setIsClient] = useState(false);
  const [storageError, setStorageError] = useState<StorageError | null>(null);

  // Debounced save function with error handling
  const debouncedSave = useCallback(
    debounce((data: BudgetData) => {
      const result = saveBudgetData(data);
      if (!result.success && result.error) {
        setStorageError(result.error);
      } else {
        setStorageError(null);
      }
    }, 500),
    []
  );

  useEffect(() => {
    setIsClient(true);
    // Load data from localStorage on client mount
    const { data, error } = loadBudgetData();
    setBudgetData(data);
    if (error) {
      setStorageError(error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      debouncedSave(budgetData);
    }
  }, [budgetData, isClient, debouncedSave]);

  const updateBudgetData = useCallback((updates: Partial<BudgetData>) => {
    setBudgetData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetBudgetData = useCallback(() => {
    setBudgetData(defaultBudgetData);
  }, []);

  // Startup Fee functions
  const addStartupFee = useCallback(() => {
    const newFee: StartupFeeItem = {
      id: Date.now().toString(),
      name: 'New Startup Fee',
      amount: 0,
      timing: 'oneTime'
    };
    updateBudgetData({ startupFees: [...budgetData.startupFees, newFee] });
  }, [budgetData.startupFees, updateBudgetData]);

  const updateStartupFee = useCallback((id: string, updates: Partial<StartupFeeItem>) => {
    updateBudgetData({
      startupFees: budgetData.startupFees.map(fee => 
        fee.id === id ? { ...fee, ...updates } : fee
      )
    });
  }, [budgetData.startupFees, updateBudgetData]);

  const deleteStartupFee = useCallback((id: string) => {
    updateBudgetData({ 
      startupFees: budgetData.startupFees.filter(fee => fee.id !== id) 
    });
  }, [budgetData.startupFees, updateBudgetData]);

  // Visit functions
  const addVisit = useCallback(() => {
    const newVisit: Visit = {
      id: Date.now().toString(),
      name: `Visit ${budgetData.visits.length + 1}`,
      paymentPerVisit: 0
    };
    updateBudgetData({ visits: [...budgetData.visits, newVisit] });
  }, [budgetData.visits, updateBudgetData]);

  const updateVisit = useCallback((id: string, updates: Partial<Visit>) => {
    updateBudgetData({
      visits: budgetData.visits.map(v => v.id === id ? { ...v, ...updates } : v)
    });
  }, [budgetData.visits, updateBudgetData]);

  const deleteVisit = useCallback((id: string) => {
    updateBudgetData({ visits: budgetData.visits.filter(v => v.id !== id) });
  }, [budgetData.visits, updateBudgetData]);

  // Custom Revenue functions
  const addCustomRevenueItem = useCallback(() => {
    const newItem: CustomRevenueItem = {
      id: Date.now().toString(),
      name: 'New Revenue Item',
      amount: 0,
      type: 'flat',
      timing: 'oneTime'
    };
    updateBudgetData({ customRevenueItems: [...budgetData.customRevenueItems, newItem] });
  }, [budgetData.customRevenueItems, updateBudgetData]);

  const updateCustomRevenueItem = useCallback((id: string, updates: Partial<CustomRevenueItem>) => {
    updateBudgetData({
      customRevenueItems: budgetData.customRevenueItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    });
  }, [budgetData.customRevenueItems, updateBudgetData]);

  const deleteCustomRevenueItem = useCallback((id: string) => {
    updateBudgetData({ 
      customRevenueItems: budgetData.customRevenueItems.filter(item => item.id !== id) 
    });
  }, [budgetData.customRevenueItems, updateBudgetData]);

  // Personnel functions
  const addPersonnelReimbursement = useCallback(() => {
    const newItem: PersonnelReimbursement = {
      id: Date.now().toString(),
      role: 'New Personnel Role',
      type: 'perPatient',
      hourlyRate: 0,
      hours: 0
    };
    updateBudgetData({ personnelReimbursements: [...budgetData.personnelReimbursements, newItem] });
  }, [budgetData.personnelReimbursements, updateBudgetData]);

  const updatePersonnelReimbursement = useCallback((id: string, updates: Partial<PersonnelReimbursement>) => {
    updateBudgetData({
      personnelReimbursements: budgetData.personnelReimbursements.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    });
  }, [budgetData.personnelReimbursements, updateBudgetData]);

  const deletePersonnelReimbursement = useCallback((id: string) => {
    updateBudgetData({ 
      personnelReimbursements: budgetData.personnelReimbursements.filter(item => item.id !== id) 
    });
  }, [budgetData.personnelReimbursements, updateBudgetData]);

  return {
    budgetData,
    updateBudgetData,
    resetBudgetData,
    isClient,
    storageError,
    // Startup fees
    addStartupFee,
    updateStartupFee,
    deleteStartupFee,
    // Visits
    addVisit,
    updateVisit,
    deleteVisit,
    // Custom revenue
    addCustomRevenueItem,
    updateCustomRevenueItem,
    deleteCustomRevenueItem,
    // Personnel
    addPersonnelReimbursement,
    updatePersonnelReimbursement,
    deletePersonnelReimbursement,
  };
};
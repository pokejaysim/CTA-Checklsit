import { BudgetData } from '@/types/budget';

const STORAGE_KEY = 'ctaBudget';
const BACKUP_KEY = 'ctaBudget_backup';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

export interface StorageError {
  type: 'QUOTA_EXCEEDED' | 'PARSE_ERROR' | 'NOT_FOUND' | 'INVALID_DATA' | 'UNKNOWN';
  message: string;
  originalError?: Error;
}

export const defaultBudgetData: BudgetData = {
  studyInfo: {
    protocolNumber: '',
    studyTitle: '',
    piName: '',
    studyDate: '',
    sponsor: '',
    siteName: '',
  },
  startupFees: [
    { id: '1', name: 'IRB Fee', amount: 0, timing: 'oneTime' as const },
    { id: '2', name: 'Ethics Committee Fee', amount: 0, timing: 'oneTime' as const },
    { id: '3', name: 'Archiving Fee', amount: 0, timing: 'oneTime' as const },
    { id: '4', name: 'Pharmacy Fee', amount: 0, timing: 'oneTime' as const },
  ],
  visits: [],
  overhead: 30,
  customRevenueItems: [],
  targetEnrollment: 0,
  personnelReimbursements: [],
  notes: '',
};

const validateBudgetData = (data: any): data is BudgetData => {
  if (!data || typeof data !== 'object') return false;
  
  // Check required properties exist
  const requiredFields = ['startupFees', 'visits', 'customRevenueItems', 'personnelReimbursements'];
  if (!requiredFields.every(field => field in data)) return false;
  
  // Validate arrays
  if (!Array.isArray(data.startupFees) || 
      !Array.isArray(data.visits) || 
      !Array.isArray(data.customRevenueItems) || 
      !Array.isArray(data.personnelReimbursements)) {
    return false;
  }
  
  // Validate overhead is a number
  if (typeof data.overhead !== 'number' || data.overhead < 0) return false;
  
  // Validate targetEnrollment is a number
  if (typeof data.targetEnrollment !== 'number' || data.targetEnrollment < 0) return false;
  
  return true;
};

const migrateAndNormalizeBudgetData = (data: any): BudgetData => {
  // Migration: Convert old object-based startupFees to array format
  if (data.startupFees && !Array.isArray(data.startupFees)) {
    const oldStartupFees = data.startupFees;
    data.startupFees = [
      { id: '1', name: 'IRB Fee', amount: oldStartupFees.irbFee || 0, timing: 'oneTime' as const },
      { id: '2', name: 'Ethics Committee Fee', amount: oldStartupFees.ethicsCommitteeFee || 0, timing: 'oneTime' as const },
      { id: '3', name: 'Archiving Fee', amount: oldStartupFees.archivingFee || 0, timing: 'oneTime' as const },
      { id: '4', name: 'Pharmacy Fee', amount: oldStartupFees.pharmacyFee || 0, timing: 'oneTime' as const },
    ];
  }
  
  // Migration: Rename personnelCosts to personnelReimbursements
  if (data.personnelCosts && !data.personnelReimbursements) {
    data.personnelReimbursements = data.personnelCosts;
    delete data.personnelCosts;
  }
  
  // Ensure studyInfo exists
  if (!data.studyInfo) {
    data.studyInfo = {
      protocolNumber: '',
      studyTitle: '',
      piName: '',
      studyDate: '',
      sponsor: '',
      siteName: '',
    };
  }
  
  // Ensure all required fields exist with defaults
  data.startupFees = Array.isArray(data.startupFees) ? data.startupFees : defaultBudgetData.startupFees;
  data.visits = Array.isArray(data.visits) ? data.visits : [];
  data.customRevenueItems = Array.isArray(data.customRevenueItems) ? data.customRevenueItems : [];
  data.personnelReimbursements = Array.isArray(data.personnelReimbursements) ? data.personnelReimbursements : [];
  data.overhead = typeof data.overhead === 'number' ? data.overhead : 30;
  data.targetEnrollment = typeof data.targetEnrollment === 'number' ? data.targetEnrollment : 0;
  data.notes = typeof data.notes === 'string' ? data.notes : '';
  
  // Migration: Add timing field to existing items
  if (data.startupFees) {
    data.startupFees = data.startupFees.map((fee: any) => ({
      ...fee,
      timing: fee.timing || 'oneTime',
      estimatedOccurrences: fee.estimatedOccurrences || undefined
    }));
  }
  
  if (data.customRevenueItems) {
    data.customRevenueItems = data.customRevenueItems.map((item: any) => ({
      ...item,
      timing: item.timing || 'oneTime',
      estimatedOccurrences: item.estimatedOccurrences || undefined
    }));
  }
  
  return data as BudgetData;
};

export const loadBudgetData = (): { data: BudgetData; error?: StorageError } => {
  if (typeof window === 'undefined') return { data: defaultBudgetData };
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { data: defaultBudgetData };
    }
    
    let parsedData;
    try {
      parsedData = JSON.parse(stored);
    } catch (parseError) {
      // Try to load from backup
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) {
        try {
          parsedData = JSON.parse(backup);
          console.warn('Loaded from backup due to corrupted main data');
        } catch {
          return { 
            data: defaultBudgetData, 
            error: { 
              type: 'PARSE_ERROR', 
              message: 'Both main and backup data are corrupted',
              originalError: parseError as Error
            }
          };
        }
      } else {
        return { 
          data: defaultBudgetData, 
          error: { 
            type: 'PARSE_ERROR', 
            message: 'Stored data is corrupted and no backup exists',
            originalError: parseError as Error
          }
        };
      }
    }
    
    const migratedData = migrateAndNormalizeBudgetData(parsedData);
    
    if (!validateBudgetData(migratedData)) {
      return { 
        data: defaultBudgetData, 
        error: { 
          type: 'INVALID_DATA', 
          message: 'Stored data failed validation checks'
        }
      };
    }
    
    return { data: migratedData };
    
  } catch (error) {
    return { 
      data: defaultBudgetData, 
      error: { 
        type: 'UNKNOWN', 
        message: 'Unexpected error loading budget data',
        originalError: error as Error
      }
    };
  }
};


export const saveBudgetData = (data: BudgetData): { success: boolean; error?: StorageError } => {
  if (typeof window === 'undefined') return { success: false, error: { type: 'UNKNOWN', message: 'Not in browser environment' } };
  
  if (!validateBudgetData(data)) {
    return { 
      success: false, 
      error: { 
        type: 'INVALID_DATA', 
        message: 'Budget data failed validation before saving' 
      } 
    };
  }
  
  try {
    const dataString = JSON.stringify(data);
    
    // Check size before saving
    if (dataString.length > MAX_STORAGE_SIZE) {
      return { 
        success: false, 
        error: { 
          type: 'QUOTA_EXCEEDED', 
          message: 'Data is too large to store' 
        } 
      };
    }
    
    // Create backup of current data before overwriting
    const currentData = localStorage.getItem(STORAGE_KEY);
    if (currentData) {
      try {
        localStorage.setItem(BACKUP_KEY, currentData);
      } catch (backupError) {
        console.warn('Failed to create backup:', backupError);
      }
    }
    
    // Save new data
    localStorage.setItem(STORAGE_KEY, dataString);
    return { success: true };
    
  } catch (error) {
    const err = error as Error;
    
    if (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      // Try to clear backup and retry
      try {
        localStorage.removeItem(BACKUP_KEY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return { success: true };
      } catch {
        return { 
          success: false, 
          error: { 
            type: 'QUOTA_EXCEEDED', 
            message: 'Storage quota exceeded. Consider exporting your data.',
            originalError: err
          } 
        };
      }
    }
    
    return { 
      success: false, 
      error: { 
        type: 'UNKNOWN', 
        message: 'Failed to save budget data',
        originalError: err
      } 
    };
  }
};

export const exportBudgetData = (data: BudgetData): void => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cta-budget-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importBudgetData = (file: File): Promise<{ data: BudgetData; error?: StorageError }> => {
  return new Promise((resolve) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.json')) {
      resolve({
        data: defaultBudgetData,
        error: {
          type: 'INVALID_DATA',
          message: 'Please select a valid JSON file'
        }
      });
      return;
    }
    
    // Validate file size
    if (file.size > MAX_STORAGE_SIZE) {
      resolve({
        data: defaultBudgetData,
        error: {
          type: 'QUOTA_EXCEEDED',
          message: 'File is too large to import'
        }
      });
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          resolve({
            data: defaultBudgetData,
            error: {
              type: 'INVALID_DATA',
              message: 'Unable to read file contents'
            }
          });
          return;
        }
        
        let parsedData;
        try {
          parsedData = JSON.parse(result);
        } catch (parseError) {
          resolve({
            data: defaultBudgetData,
            error: {
              type: 'PARSE_ERROR',
              message: 'Invalid JSON format in file',
              originalError: parseError as Error
            }
          });
          return;
        }
        
        // Sanitize and validate the data
        const sanitizedData = sanitizeImportedData(parsedData);
        const normalizedData = migrateAndNormalizeBudgetData(sanitizedData);
        
        if (!validateBudgetData(normalizedData)) {
          resolve({
            data: defaultBudgetData,
            error: {
              type: 'INVALID_DATA',
              message: 'File does not contain valid budget data'
            }
          });
          return;
        }
        
        resolve({ data: normalizedData });
        
      } catch (error) {
        resolve({
          data: defaultBudgetData,
          error: {
            type: 'UNKNOWN',
            message: 'Unexpected error reading file',
            originalError: error as Error
          }
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        data: defaultBudgetData,
        error: {
          type: 'UNKNOWN',
          message: 'Failed to read file'
        }
      });
    };
    
    reader.readAsText(file);
  });
};

const sanitizeImportedData = (data: any): any => {
  if (!data || typeof data !== 'object') return {};
  
  // Remove any potentially dangerous properties
  const sanitized = { ...data };
  delete sanitized.__proto__;
  delete sanitized.constructor;
  
  // Sanitize strings to prevent XSS
  const sanitizeString = (str: any): string => {
    if (typeof str !== 'string') return '';
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+=/gi, '');
  };
  
  // Recursively sanitize string values
  const sanitizeObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = sanitizeObject(value);
      }
      return result;
    } else if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    return obj;
  };
  
  return sanitizeObject(sanitized);
};
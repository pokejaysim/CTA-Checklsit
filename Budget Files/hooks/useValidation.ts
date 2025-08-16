import { useState, useCallback } from 'react';
import { z } from 'zod';
import { getValidationErrors } from '@/lib/validation';

export interface ValidationState {
  isValid: boolean;
  errors: Array<{ path: string; message: string }>;
  hasError: (field: string) => boolean;
  getError: (field: string) => string | undefined;
}

export const useValidation = () => {
  const [validationState, setValidationState] = useState<Record<string, ValidationState>>({});

  const validateField = useCallback((fieldName: string, value: unknown, schema: z.ZodSchema) => {
    const result = schema.safeParse(value);
    const errors = getValidationErrors(result);
    
    const state: ValidationState = {
      isValid: result.success,
      errors,
      hasError: (field: string) => errors.some((e: { path: string; message: string }) => e.path === field || e.path.startsWith(`${field}.`)),
      getError: (field: string) => errors.find((e: { path: string; message: string }) => e.path === field)?.message
    };

    setValidationState(prev => ({
      ...prev,
      [fieldName]: state
    }));

    return state;
  }, []);

  const validateMultipleFields = useCallback((validations: Array<{ fieldName: string; value: unknown; schema: z.ZodSchema }>) => {
    const newState: Record<string, ValidationState> = {};
    let allValid = true;

    validations.forEach(({ fieldName, value, schema }) => {
      const result = schema.safeParse(value);
      const errors = getValidationErrors(result);
      
      const state: ValidationState = {
        isValid: result.success,
        errors,
        hasError: (field: string) => errors.some((e: { path: string; message: string }) => e.path === field || e.path.startsWith(`${field}.`)),
        getError: (field: string) => errors.find((e: { path: string; message: string }) => e.path === field)?.message
      };

      newState[fieldName] = state;
      if (!result.success) allValid = false;
    });

    setValidationState(prev => ({
      ...prev,
      ...newState
    }));

    return { allValid, states: newState };
  }, []);

  const clearValidation = useCallback((fieldName?: string) => {
    if (fieldName) {
      setValidationState(prev => {
        const newState = { ...prev };
        delete newState[fieldName];
        return newState;
      });
    } else {
      setValidationState({});
    }
  }, []);

  const getFieldValidation = useCallback((fieldName: string): ValidationState | undefined => {
    return validationState[fieldName];
  }, [validationState]);

  const isFormValid = useCallback((fieldNames: string[]): boolean => {
    return fieldNames.every(fieldName => {
      const state = validationState[fieldName];
      return !state || state.isValid;
    });
  }, [validationState]);

  return {
    validateField,
    validateMultipleFields,
    clearValidation,
    getFieldValidation,
    isFormValid,
    validationState
  };
};
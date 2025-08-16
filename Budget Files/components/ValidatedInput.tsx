import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import { useValidation } from '@/hooks/useValidation';

interface ValidatedInputProps {
  type?: 'text' | 'number' | 'email';
  placeholder?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  schema: z.ZodSchema;
  fieldName: string;
  debounceMs?: number;
  showSuccess?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  className = '',
  schema,
  fieldName,
  debounceMs = 300,
  showSuccess = false
}) => {
  const { validateField, getFieldValidation } = useValidation();
  const [localValue, setLocalValue] = useState(value);
  const [validationTimer, setValidationTimer] = useState<NodeJS.Timeout | null>(null);
  
  const validation = getFieldValidation(fieldName);
  const hasError = validation && !validation.isValid;
  const isValid = validation && validation.isValid;

  useEffect(() => {
    // For number inputs, show empty string when value is 0, undefined, null, or NaN
    if (type === 'number' && (value === 0 || value === undefined || value === null || Number.isNaN(value))) {
      setLocalValue('');
    } else {
      setLocalValue(value);
    }
  }, [value, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value;
    
    // For number inputs, strip leading zeros except for decimal numbers
    if (type === 'number' && rawValue.length > 1 && rawValue.startsWith('0') && !rawValue.startsWith('0.')) {
      rawValue = rawValue.replace(/^0+/, '') || '0';
    }
    
    setLocalValue(rawValue);
    
    // Clear previous timer
    if (validationTimer) {
      clearTimeout(validationTimer);
    }
    
    // Set new timer for debounced validation
    const timer = setTimeout(() => {
      const valueForValidation = type === 'number' ? (rawValue === '' ? 0 : Number(rawValue)) : rawValue;
      validateField(fieldName, valueForValidation, schema);
      onChange(valueForValidation);
    }, debounceMs);
    
    setValidationTimer(timer);
  };

  const handleBlur = () => {
    // Immediate validation on blur
    if (validationTimer) {
      clearTimeout(validationTimer);
    }
    const valueForValidation = type === 'number' ? (localValue === '' ? 0 : Number(localValue)) : localValue;
    validateField(fieldName, valueForValidation, schema);
    onChange(valueForValidation);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (validationTimer) {
        clearTimeout(validationTimer);
      }
    };
  }, [validationTimer]);

  const baseClasses = "px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm transition-colors";
  const errorClasses = hasError ? "border-red-300 focus:border-red-500" : "";
  const successClasses = isValid && showSuccess ? "border-green-300 focus:border-green-500" : "border-gray-300 focus:border-blue-500";
  
  const inputClasses = `${baseClasses} ${errorClasses || successClasses} ${className}`;

  return (
    <div className="relative">
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={(e) => {
            // Auto-select all text for number inputs
            if (type === 'number') {
              e.target.select();
            }
            // Call custom onFocus if provided
            if (onFocus) {
              onFocus(e);
            }
          }}
          className={inputClasses}
        />
        
        {/* Validation icon */}
        {(hasError || (isValid && showSuccess)) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {hasError ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {hasError && validation.errors.length > 0 && (
        <div className="mt-1 text-sm text-red-600">
          {validation.errors[0].message}
        </div>
      )}
    </div>
  );
};

interface ValidatedSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
  schema: z.ZodSchema;
  fieldName: string;
}

export const ValidatedSelect: React.FC<ValidatedSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  schema,
  fieldName
}) => {
  const { validateField, getFieldValidation } = useValidation();
  
  const validation = getFieldValidation(fieldName);
  const hasError = validation && !validation.isValid;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    validateField(fieldName, newValue, schema);
    onChange(newValue);
  };

  const baseClasses = "px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm";
  const errorClasses = hasError ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-blue-500";
  
  const selectClasses = `${baseClasses} ${errorClasses} ${className}`;

  return (
    <div className="relative">
      <select
        value={value}
        onChange={handleChange}
        className={selectClasses}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Error message */}
      {hasError && validation.errors.length > 0 && (
        <div className="mt-1 text-sm text-red-600">
          {validation.errors[0].message}
        </div>
      )}
    </div>
  );
};
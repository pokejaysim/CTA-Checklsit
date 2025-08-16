import { z } from 'zod';

// Base validation for monetary amounts
const monetaryAmount = z.number()
  .min(0, 'Amount must be non-negative')
  .max(99999999, 'Amount is too large')
  .finite('Amount must be a valid number');

// String validation with reasonable limits
const nameString = z.string()
  .min(1, 'Name is required')
  .max(200, 'Name is too long')
  .trim();

const optionalString = z.string()
  .max(500, 'Text is too long')
  .trim();

// Schemas for individual types
export const StartupFeeSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: nameString,
  amount: monetaryAmount
});

export const StudyInfoSchema = z.object({
  protocolNumber: optionalString,
  studyTitle: optionalString,
  piName: optionalString,
  studyDate: optionalString,
  sponsor: optionalString,
  siteName: optionalString
});

export const VisitSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: nameString,
  paymentPerVisit: monetaryAmount
});

export const CustomRevenueItemSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: nameString,
  amount: monetaryAmount,
  type: z.enum(['flat', 'perPatient', 'perVisit'])
});

export const PersonnelReimbursementSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  role: nameString,
  type: z.enum(['perPatient', 'flatMonthly']),
  hourlyRate: z.number().min(0).max(9999).optional(),
  hours: z.number().min(0).max(9999).optional(),
  monthlyFee: z.number().min(0).max(999999).optional(),
  months: z.number().min(0).max(999).optional()
}).refine((data) => {
  // Validate that perPatient entries have hourlyRate and hours
  if (data.type === 'perPatient') {
    return typeof data.hourlyRate === 'number' && typeof data.hours === 'number';
  }
  // Validate that flatMonthly entries have monthlyFee and months
  if (data.type === 'flatMonthly') {
    return typeof data.monthlyFee === 'number' && typeof data.months === 'number';
  }
  return true;
}, {
  message: 'Per patient entries require hourly rate and hours. Monthly entries require monthly fee and months.'
});

// Main budget data schema
export const BudgetDataSchema = z.object({
  studyInfo: StudyInfoSchema,
  startupFees: z.array(StartupFeeSchema)
    .max(50, 'Too many startup fees'),
  visits: z.array(VisitSchema)
    .max(100, 'Too many visits'),
  overhead: z.number()
    .min(0, 'Overhead must be non-negative')
    .max(100, 'Overhead cannot exceed 100%'),
  customRevenueItems: z.array(CustomRevenueItemSchema)
    .max(100, 'Too many custom revenue items'),
  targetEnrollment: z.number()
    .min(0, 'Target enrollment must be non-negative')
    .max(99999, 'Target enrollment is too large')
    .int('Target enrollment must be a whole number'),
  personnelReimbursements: z.array(PersonnelReimbursementSchema)
    .max(50, 'Too many personnel reimbursements'),
  notes: z.string()
    .max(5000, 'Notes are too long')
});

// Validation functions
export const validateStartupFee = (data: unknown) => {
  return StartupFeeSchema.safeParse(data);
};

export const validateVisit = (data: unknown) => {
  return VisitSchema.safeParse(data);
};

export const validateCustomRevenueItem = (data: unknown) => {
  return CustomRevenueItemSchema.safeParse(data);
};

export const validatePersonnelReimbursement = (data: unknown) => {
  return PersonnelReimbursementSchema.safeParse(data);
};

export const validateBudgetData = (data: unknown) => {
  return BudgetDataSchema.safeParse(data);
};

// Field-specific validation for real-time validation
export const validateAmount = (amount: unknown) => {
  return monetaryAmount.safeParse(amount);
};

export const validateName = (name: unknown) => {
  return nameString.safeParse(name);
};

export const validateOverhead = (overhead: unknown) => {
  return z.number()
    .min(0, 'Overhead must be non-negative')
    .max(100, 'Overhead cannot exceed 100%')
    .safeParse(overhead);
};

export const validateTargetEnrollment = (enrollment: unknown) => {
  return z.number()
    .min(0, 'Target enrollment must be non-negative')
    .max(99999, 'Target enrollment is too large')
    .int('Target enrollment must be a whole number')
    .safeParse(enrollment);
};

// Helper to extract error messages
export const getValidationErrors = (result: z.ZodSafeParseResult<any>) => {
  if (result.success) return [];
  
  return result.error.issues.map(error => ({
    path: error.path.join('.'),
    message: error.message
  }));
};
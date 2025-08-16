import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import type { StartupFeeItem, Visit, CustomRevenueItem, PersonnelReimbursement } from '@/types/budget';
import { ValidatedInput, ValidatedSelect } from './ValidatedInput';
// Import schemas instead of validation functions
const nameSchema = z.string().min(1, 'Name is required').max(200, 'Name is too long').trim();
const amountSchema = z.number().min(0, 'Amount must be non-negative').max(99999999, 'Amount is too large').finite('Amount must be a valid number');
const timingSchema = z.enum(['oneTime', 'perVisit', 'asNeeded']);
const occurrencesSchema = z.number().min(1, 'Must be at least 1').max(999, 'Too many occurrences');

interface CostSectionProps {
  title: string;
  items: any[];
  onAdd: () => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  icon: React.ComponentType<{ className?: string }>;
  category: 'startupFees' | 'visits' | 'customRevenue' | 'personnelReimbursements';
}

export const CostSection: React.FC<CostSectionProps> = ({ 
  title, 
  items, 
  onAdd, 
  onUpdate, 
  onDelete, 
  icon: Icon, 
  category 
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Icon className="w-5 h-5 text-gray-700" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        Add Item
      </button>
    </div>

    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {category === 'startupFees' ? (
            <StartupFeeFields item={item} onUpdate={onUpdate} />
          ) : category === 'visits' ? (
            <VisitFields item={item} onUpdate={onUpdate} />
          ) : category === 'customRevenue' ? (
            <CustomRevenueFields item={item} onUpdate={onUpdate} />
          ) : category === 'personnelReimbursements' ? (
            <PersonnelFields item={item} onUpdate={onUpdate} />
          ) : null}
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      
      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-sm">No items added yet</div>
          <div className="text-xs text-gray-400 mt-1">Click &quot;Add Item&quot; to get started</div>
        </div>
      )}
    </div>
  </div>
);

const StartupFeeFields: React.FC<{ item: StartupFeeItem; onUpdate: (id: string, updates: any) => void }> = ({ item, onUpdate }) => (
  <>
    <ValidatedInput
      type="text"
      placeholder="Fee Name"
      value={item.name}
      onChange={(value) => onUpdate(item.id, { name: value })}
      className="flex-1"
      schema={nameSchema}
      fieldName={`startupFee-${item.id}-name`}
    />
    <ValidatedSelect
      value={item.timing}
      onChange={(value) => onUpdate(item.id, { timing: value, estimatedOccurrences: value === 'asNeeded' ? 1 : undefined })}
      options={[
        { value: 'oneTime', label: 'One-time' },
        { value: 'perVisit', label: 'Per Visit' },
        { value: 'asNeeded', label: 'As Needed' }
      ]}
      schema={timingSchema}
      fieldName={`startupFee-${item.id}-timing`}
    />
    {item.timing === 'asNeeded' && (
      <ValidatedInput
        type="number"
        placeholder="Occurrences"
        value={item.estimatedOccurrences || 1}
        onChange={(value) => onUpdate(item.id, { estimatedOccurrences: Number(value) })}
        onFocus={(e) => e.target.select()}
        className="w-20"
        schema={occurrencesSchema}
        fieldName={`startupFee-${item.id}-occurrences`}
        showSuccess
      />
    )}
    <ValidatedInput
      type="number"
      placeholder="Amount"
      value={item.amount}
      onChange={(value) => onUpdate(item.id, { amount: Number(value) })}
      onFocus={(e) => e.target.select()}
      className="w-24"
      schema={amountSchema}
      fieldName={`startupFee-${item.id}-amount`}
      showSuccess
    />
    <div className="flex items-center">
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        item.timing === 'oneTime' ? 'bg-blue-100 text-blue-800' :
        item.timing === 'perVisit' ? 'bg-green-100 text-green-800' :
        'bg-orange-100 text-orange-800'
      }`}>
        {item.timing === 'oneTime' ? 'One-time' :
         item.timing === 'perVisit' ? 'Per Visit' :
         `As Needed (${item.estimatedOccurrences || 1}x)`}
      </span>
    </div>
  </>
);

const VisitFields: React.FC<{ item: Visit; onUpdate: (id: string, updates: any) => void }> = ({ item, onUpdate }) => (
  <>
    <ValidatedInput
      type="text"
      placeholder="Visit Name"
      value={item.name}
      onChange={(value) => onUpdate(item.id, { name: value })}
      className="flex-1"
      schema={nameSchema}
      fieldName={`visit-${item.id}-name`}
    />
    <ValidatedInput
      type="number"
      placeholder="Payment"
      value={item.paymentPerVisit}
      onChange={(value) => onUpdate(item.id, { paymentPerVisit: Number(value) })}
      onFocus={(e) => e.target.select()}
      className="w-24"
      schema={amountSchema}
      fieldName={`visit-${item.id}-payment`}
      showSuccess
    />
  </>
);

const customRevenueTypeSchema = z.enum(['flat', 'perPatient', 'perVisit']);

const CustomRevenueFields: React.FC<{ item: CustomRevenueItem; onUpdate: (id: string, updates: any) => void }> = ({ item, onUpdate }) => (
  <>
    <ValidatedInput
      type="text"
      placeholder="Description"
      value={item.name}
      onChange={(value) => onUpdate(item.id, { name: value })}
      className="flex-1"
      schema={nameSchema}
      fieldName={`customRevenue-${item.id}-name`}
    />
    <ValidatedSelect
      value={item.type}
      onChange={(value) => onUpdate(item.id, { type: value })}
      options={[
        { value: 'flat', label: 'Flat' },
        { value: 'perPatient', label: 'Per Patient' },
        { value: 'perVisit', label: 'Per Visit' }
      ]}
      schema={customRevenueTypeSchema}
      fieldName={`customRevenue-${item.id}-type`}
    />
    <ValidatedSelect
      value={item.timing}
      onChange={(value) => onUpdate(item.id, { timing: value, estimatedOccurrences: value === 'asNeeded' ? 1 : undefined })}
      options={[
        { value: 'oneTime', label: 'One-time' },
        { value: 'perVisit', label: 'Per Visit' },
        { value: 'asNeeded', label: 'As Needed' }
      ]}
      schema={timingSchema}
      fieldName={`customRevenue-${item.id}-timing`}
    />
    {item.timing === 'asNeeded' && (
      <ValidatedInput
        type="number"
        placeholder="Occurrences"
        value={item.estimatedOccurrences || 1}
        onChange={(value) => onUpdate(item.id, { estimatedOccurrences: Number(value) })}
        onFocus={(e) => e.target.select()}
        className="w-20"
        schema={occurrencesSchema}
        fieldName={`customRevenue-${item.id}-occurrences`}
        showSuccess
      />
    )}
    <ValidatedInput
      type="number"
      placeholder="Amount"
      value={item.amount}
      onChange={(value) => onUpdate(item.id, { amount: Number(value) })}
      onFocus={(e) => e.target.select()}
      className="w-24"
      schema={amountSchema}
      fieldName={`customRevenue-${item.id}-amount`}
      showSuccess
    />
    <div className="flex items-center">
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        item.timing === 'oneTime' ? 'bg-blue-100 text-blue-800' :
        item.timing === 'perVisit' ? 'bg-green-100 text-green-800' :
        'bg-orange-100 text-orange-800'
      }`}>
        {item.timing === 'oneTime' ? 'One-time' :
         item.timing === 'perVisit' ? 'Per Visit' :
         `As Needed (${item.estimatedOccurrences || 1}x)`}
      </span>
    </div>
  </>
);

const personnelTypeSchema = z.enum(['perPatient', 'flatMonthly']);
const hourlyRateSchema = z.number().min(0).max(9999);
const hoursSchema = z.number().min(0).max(9999);
const monthlyFeeSchema = z.number().min(0).max(999999);
const monthsSchema = z.number().min(0).max(999);

const PersonnelFields: React.FC<{ item: PersonnelReimbursement; onUpdate: (id: string, updates: any) => void }> = ({ item, onUpdate }) => (
  <>
    <ValidatedInput
      type="text"
      placeholder="Role (e.g., Study Coordinator Fee)"
      value={item.role}
      onChange={(value) => onUpdate(item.id, { role: value })}
      className="flex-1"
      schema={nameSchema}
      fieldName={`personnel-${item.id}-role`}
    />
    <ValidatedSelect
      value={item.type}
      onChange={(value) => onUpdate(item.id, { 
        type: value,
        hourlyRate: value === 'perPatient' ? 0 : undefined,
        hours: value === 'perPatient' ? 0 : undefined,
        monthlyFee: value === 'flatMonthly' ? 0 : undefined,
        months: value === 'flatMonthly' ? 0 : undefined,
      })}
      options={[
        { value: 'perPatient', label: 'Per Patient' },
        { value: 'flatMonthly', label: 'Monthly' }
      ]}
      schema={personnelTypeSchema}
      fieldName={`personnel-${item.id}-type`}
    />
    {item.type === 'perPatient' ? (
      <>
        <ValidatedInput
          type="number"
          placeholder="Rate"
          value={item.hourlyRate ?? ''}
          onChange={(value) => onUpdate(item.id, { hourlyRate: Number(value) })}
          onFocus={(e) => e.target.select()}
          className="w-20"
          schema={hourlyRateSchema}
          fieldName={`personnel-${item.id}-hourlyRate`}
          showSuccess
        />
        <ValidatedInput
          type="number"
          placeholder="Hours"
          value={item.hours ?? ''}
          onChange={(value) => onUpdate(item.id, { hours: Number(value) })}
          onFocus={(e) => e.target.select()}
          className="w-20"
          schema={hoursSchema}
          fieldName={`personnel-${item.id}-hours`}
          showSuccess
        />
      </>
    ) : (
      <>
        <ValidatedInput
          type="number"
          placeholder="Monthly"
          value={item.monthlyFee ?? ''}
          onChange={(value) => onUpdate(item.id, { monthlyFee: Number(value) })}
          onFocus={(e) => e.target.select()}
          className="w-24"
          schema={monthlyFeeSchema}
          fieldName={`personnel-${item.id}-monthlyFee`}
          showSuccess
        />
        <ValidatedInput
          type="number"
          placeholder="Months"
          value={item.months ?? ''}
          onChange={(value) => onUpdate(item.id, { months: Number(value) })}
          onFocus={(e) => e.target.select()}
          className="w-20"
          schema={monthsSchema}
          fieldName={`personnel-${item.id}-months`}
          showSuccess
        />
      </>
    )}
  </>
);
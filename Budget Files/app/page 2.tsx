'use client';

import { useState, useEffect } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingUp, 
  FileText,
  Download,
  Upload,
  Plus,
  Trash2,
  Building2
} from 'lucide-react';
import type { BudgetData, Visit, CustomRevenueItem, PersonnelReimbursement, StartupFeeItem } from '@/types/budget';
import { loadBudgetData, saveBudgetData, exportBudgetData, importBudgetData } from '@/lib/storage';

export default function Home() {
  const [budgetData, setBudgetData] = useState<BudgetData>(() => {
    const { data } = loadBudgetData();
    return data;
  });

  useEffect(() => {
    const result = saveBudgetData(budgetData);
    if (!result.success && result.error) {
      console.error('Save failed:', result.error.message);
    }
  }, [budgetData]);

  const updateBudgetData = (updates: Partial<BudgetData>) => {
    setBudgetData(prev => ({ ...prev, ...updates }));
  };

  // Calculate totals
  const totalStartupFees = budgetData.startupFees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalVisitRevenue = budgetData.visits.reduce((sum, visit) => sum + (visit.paymentPerVisit * budgetData.targetEnrollment), 0);
  const totalCustomRevenue = budgetData.customRevenueItems.reduce((sum, item) => {
    if (item.type === 'flat') return sum + item.amount;
    if (item.type === 'perPatient') return sum + (item.amount * budgetData.targetEnrollment);
    if (item.type === 'perVisit') return sum + (item.amount * budgetData.visits.length * budgetData.targetEnrollment);
    return sum;
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

  // Calculate completion percentage
  const completionPercentage = Math.min(100, (
    (budgetData.targetEnrollment > 0 ? 15 : 0) +
    (budgetData.visits.length > 0 ? 15 : 0) +
    (budgetData.customRevenueItems.length > 0 ? 15 : 0) +
    (budgetData.personnelReimbursements.length > 0 ? 15 : 0) +
    (budgetData.startupFees.some(fee => fee.amount > 0) ? 15 : 0) +
    (budgetData.studyInfo.protocolNumber ? 25 : 0)
  ));

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await importBudgetData(file);
      if (result.error) {
        console.error('Import failed:', result.error.message);
      } else {
        setBudgetData(result.data);
      }
    }
  };

  // Startup Fee functions
  const addStartupFee = () => {
    const newFee: StartupFeeItem = {
      id: Date.now().toString(),
      name: 'New Startup Fee',
      amount: 0,
      timing: 'oneTime'
    };
    updateBudgetData({ startupFees: [...budgetData.startupFees, newFee] });
  };

  const updateStartupFee = (id: string, updates: Partial<StartupFeeItem>) => {
    updateBudgetData({
      startupFees: budgetData.startupFees.map(fee => 
        fee.id === id ? { ...fee, ...updates } : fee
      )
    });
  };

  const deleteStartupFee = (id: string) => {
    updateBudgetData({ 
      startupFees: budgetData.startupFees.filter(fee => fee.id !== id) 
    });
  };

  // Visit functions
  const addVisit = () => {
    const newVisit: Visit = {
      id: Date.now().toString(),
      name: `Visit ${budgetData.visits.length + 1}`,
      paymentPerVisit: 0
    };
    updateBudgetData({ visits: [...budgetData.visits, newVisit] });
  };

  const updateVisit = (id: string, updates: Partial<Visit>) => {
    updateBudgetData({
      visits: budgetData.visits.map(v => v.id === id ? { ...v, ...updates } : v)
    });
  };

  const deleteVisit = (id: string) => {
    updateBudgetData({ visits: budgetData.visits.filter(v => v.id !== id) });
  };

  // Custom Revenue functions
  const addCustomRevenueItem = () => {
    const newItem: CustomRevenueItem = {
      id: Date.now().toString(),
      name: 'New Revenue Item',
      amount: 0,
      type: 'flat',
      timing: 'oneTime'
    };
    updateBudgetData({ customRevenueItems: [...budgetData.customRevenueItems, newItem] });
  };

  const updateCustomRevenueItem = (id: string, updates: Partial<CustomRevenueItem>) => {
    updateBudgetData({
      customRevenueItems: budgetData.customRevenueItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    });
  };

  const deleteCustomRevenueItem = (id: string) => {
    updateBudgetData({ 
      customRevenueItems: budgetData.customRevenueItems.filter(item => item.id !== id) 
    });
  };

  // Personnel Reimbursement functions
  const addPersonnelReimbursement = () => {
    const newReimbursement: PersonnelReimbursement = {
      id: Date.now().toString(),
      role: 'Study Coordinator Fee',
      type: 'perPatient',
      hourlyRate: 0,
      hours: 0
    };
    updateBudgetData({ personnelReimbursements: [...budgetData.personnelReimbursements, newReimbursement] });
  };

  const updatePersonnelReimbursement = (id: string, updates: Partial<PersonnelReimbursement>) => {
    updateBudgetData({
      personnelReimbursements: budgetData.personnelReimbursements.map(cost => 
        cost.id === id ? { ...cost, ...updates } : cost
      )
    });
  };

  const deletePersonnelReimbursement = (id: string) => {
    updateBudgetData({ 
      personnelReimbursements: budgetData.personnelReimbursements.filter(cost => cost.id !== id) 
    });
  };

  const CostSection = ({ title, items, onAdd, onUpdate, onDelete, icon: Icon, category }: {
    title: string;
    items: any[];
    onAdd: () => void;
    onUpdate: (id: string, updates: any) => void;
    onDelete: (id: string) => void;
    icon: any;
    category: string;
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
              <>
                <input
                  type="text"
                  placeholder="Fee Name"
                  value={item.name}
                  onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) => onUpdate(item.id, { amount: Number(e.target.value) })}
                  className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                />
              </>
            ) : category === 'visits' ? (
              <>
                <input
                  type="text"
                  placeholder="Visit Name"
                  value={item.name}
                  onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                />
                <input
                  type="number"
                  placeholder="Payment"
                  value={item.paymentPerVisit}
                  onChange={(e) => onUpdate(item.id, { paymentPerVisit: Number(e.target.value) })}
                  className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                />
              </>
            ) : category === 'customRevenue' ? (
              <>
                <input
                  type="text"
                  placeholder="Description"
                  value={item.name}
                  onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                />
                <select
                  value={item.type}
                  onChange={(e) => onUpdate(item.id, { type: e.target.value })}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                >
                  <option value="flat">Flat</option>
                  <option value="perPatient">Per Patient</option>
                  <option value="perVisit">Per Visit</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) => onUpdate(item.id, { amount: Number(e.target.value) })}
                  className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                />
              </>
            ) : category === 'personnelReimbursements' ? (
              <>
                <input
                  type="text"
                  placeholder="Role (e.g., Study Coordinator Fee)"
                  value={item.role}
                  onChange={(e) => onUpdate(item.id, { role: e.target.value })}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                />
                <select
                  value={item.type}
                  onChange={(e) => onUpdate(item.id, { 
                    type: e.target.value,
                    hourlyRate: e.target.value === 'perPatient' ? 0 : undefined,
                    hours: e.target.value === 'perPatient' ? 0 : undefined,
                    monthlyFee: e.target.value === 'flatMonthly' ? 0 : undefined,
                    months: e.target.value === 'flatMonthly' ? 0 : undefined,
                  })}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                >
                  <option value="perPatient">Per Patient</option>
                  <option value="flatMonthly">Monthly</option>
                </select>
                {item.type === 'perPatient' ? (
                  <>
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.hourlyRate || 0}
                      onChange={(e) => onUpdate(item.id, { hourlyRate: Number(e.target.value) })}
                      className="w-20 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Hours"
                      value={item.hours || 0}
                      onChange={(e) => onUpdate(item.id, { hours: Number(e.target.value) })}
                      className="w-20 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="number"
                      placeholder="Monthly"
                      value={item.monthlyFee || 0}
                      onChange={(e) => onUpdate(item.id, { monthlyFee: Number(e.target.value) })}
                      className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Months"
                      value={item.months || 0}
                      onChange={(e) => onUpdate(item.id, { months: Number(e.target.value) })}
                      className="w-20 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                    />
                  </>
                )}
              </>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Clinical Trial Budget Forecaster</h1>
                <p className="text-sm text-gray-600">Comprehensive clinical trial budget planning</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => exportBudgetData(budgetData)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <label className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Budget Completion</div>
                <div className="text-lg font-semibold text-gray-900">{completionPercentage}%</div>
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Study Information Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-700" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Study Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Protocol Number</label>
                  <input
                    type="text"
                    value={budgetData.studyInfo.protocolNumber}
                    onChange={(e) => updateBudgetData({ 
                      studyInfo: { ...budgetData.studyInfo, protocolNumber: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., PROTO-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Study Title</label>
                  <input
                    type="text"
                    value={budgetData.studyInfo.studyTitle}
                    onChange={(e) => updateBudgetData({ 
                      studyInfo: { ...budgetData.studyInfo, studyTitle: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Study title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Principal Investigator</label>
                  <input
                    type="text"
                    value={budgetData.studyInfo.piName}
                    onChange={(e) => updateBudgetData({ 
                      studyInfo: { ...budgetData.studyInfo, piName: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="PI Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Study Date</label>
                  <input
                    type="date"
                    value={budgetData.studyInfo.studyDate}
                    onChange={(e) => updateBudgetData({ 
                      studyInfo: { ...budgetData.studyInfo, studyDate: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sponsor</label>
                  <input
                    type="text"
                    value={budgetData.studyInfo.sponsor}
                    onChange={(e) => updateBudgetData({ 
                      studyInfo: { ...budgetData.studyInfo, sponsor: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Sponsor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={budgetData.studyInfo.siteName}
                    onChange={(e) => updateBudgetData({ 
                      studyInfo: { ...budgetData.studyInfo, siteName: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Site name"
                  />
                </div>
              </div>
            </div>

            {/* Target Enrollment & Overhead */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Users className="w-5 h-5 text-gray-700" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Study Parameters</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Enrollment</label>
                  <input
                    type="number"
                    value={budgetData.targetEnrollment}
                    onChange={(e) => updateBudgetData({ targetEnrollment: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Number of patients"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overhead Percentage</label>
                  <input
                    type="number"
                    value={budgetData.overhead}
                    onChange={(e) => updateBudgetData({ overhead: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Overhead %"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Cost Sections */}
            <CostSection 
              title="Startup Fees" 
              category="startupFees"
              items={budgetData.startupFees}
              onAdd={addStartupFee}
              onUpdate={updateStartupFee}
              onDelete={deleteStartupFee}
              icon={DollarSign}
            />
            
            <CostSection 
              title="Visit Schedule" 
              category="visits"
              items={budgetData.visits}
              onAdd={addVisit}
              onUpdate={updateVisit}
              onDelete={deleteVisit}
              icon={Calendar}
            />
            
            <CostSection 
              title="Custom Revenue Items" 
              category="customRevenue"
              items={budgetData.customRevenueItems}
              onAdd={addCustomRevenueItem}
              onUpdate={updateCustomRevenueItem}
              onDelete={deleteCustomRevenueItem}
              icon={TrendingUp}
            />
            
            <CostSection 
              title="Personnel Reimbursement Requests" 
              category="personnelReimbursements"
              items={budgetData.personnelReimbursements}
              onAdd={addPersonnelReimbursement}
              onUpdate={updatePersonnelReimbursement}
              onDelete={deletePersonnelReimbursement}
              icon={Users}
            />

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
              </div>
              <textarea
                value={budgetData.notes}
                onChange={(e) => updateBudgetData({ notes: e.target.value })}
                placeholder="Add any additional notes or comments here..."
                className="w-full h-32 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none"
              />
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-6">
            {/* Budget Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Budget Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Startup Fees</span>
                  <span className="font-semibold text-gray-900">${totalStartupFees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Visit Revenue</span>
                  <span className="font-semibold text-gray-900">${totalVisitRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Custom Revenue</span>
                  <span className="font-semibold text-gray-900">${totalCustomRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Personnel Reimbursements</span>
                  <span className="font-semibold text-gray-900">${totalPersonnelReimbursements.toLocaleString()}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Overhead ({budgetData.overhead}%)</span>
                  <span className="font-semibold text-gray-900">${overheadAmount.toLocaleString()}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center text-lg bg-blue-50 p-3 rounded-lg">
                  <span className="font-semibold text-gray-900">Total Budget Request</span>
                  <span className="font-bold text-gray-900">${totalRevenue.toLocaleString()}</span>
                </div>
                
                {budgetData.targetEnrollment > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Budget Per Patient</span>
                      <span className="font-semibold text-gray-900">
                        ${(totalRevenue / budgetData.targetEnrollment).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Protocol</span>
                  <span className="font-medium text-gray-900">
                    {budgetData.studyInfo.protocolNumber || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Line Items</span>
                  <span className="font-medium text-gray-900">
                    {budgetData.visits.length + budgetData.customRevenueItems.length + budgetData.personnelReimbursements.length + budgetData.startupFees.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Visits</span>
                  <span className="font-medium text-gray-900">{budgetData.visits.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Patients</span>
                  <span className="font-medium text-gray-900">{budgetData.targetEnrollment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Personnel Items</span>
                  <span className="font-medium text-gray-900">{budgetData.personnelReimbursements.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
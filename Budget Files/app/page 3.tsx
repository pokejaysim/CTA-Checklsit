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
  Building2,
  Save,
  RotateCcw
} from 'lucide-react';
// Note: BudgetData type is used via hook return types
import { exportBudgetData, importBudgetData } from '@/lib/storage';
import { CostSection } from '@/components/CostSection';
import { useBudgetData } from '@/hooks/useBudgetData';
import { useBudgetCalculations } from '@/hooks/useBudgetCalculations';
import { BudgetBreakdownChart } from '@/components/charts/BudgetBreakdownChart';
import { RevenueForecastChart } from '@/components/charts/RevenueForecastChart';


export default function Home() {
  const {
    budgetData,
    updateBudgetData,
    resetBudgetData,
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
  } = useBudgetData();

  const {
    totalStartupFees,
    totalVisitRevenue,
    totalCustomRevenue,
    totalPersonnelReimbursements,
    subtotal,
    overheadAmount,
    totalRevenue,
  } = useBudgetCalculations(budgetData);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Handle Escape key for modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showClearConfirm) {
        setShowClearConfirm(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showClearConfirm]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await importBudgetData(file);
      if (result.error) {
        console.error('Import failed:', result.error.message);
        // TODO: Show user-friendly error message
      } else {
        updateBudgetData(result.data);
      }
    }
  };

  const handleSave = () => {
    exportBudgetData(budgetData);
  };

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = () => {
    resetBudgetData();
    setShowClearConfirm(false);
  };

  const cancelClearAll = () => {
    setShowClearConfirm(false);
  };


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
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                Save Budget
              </button>
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
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium border border-red-300"
              >
                <RotateCcw className="w-4 h-4" />
                Clear All
              </button>
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
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                      updateBudgetData({ targetEnrollment: isNaN(value) ? 0 : value });
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Number of patients"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overhead Rate (%)</label>
                  <input
                    type="number"
                    value={budgetData.overhead}
                    onChange={(e) => updateBudgetData({ overhead: Number(e.target.value) })}
                    onFocus={(e) => e.target.select()}
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

            {/* Charts */}
            <BudgetBreakdownChart 
              startupFees={totalStartupFees}
              visitRevenue={totalVisitRevenue}
              customRevenue={totalCustomRevenue}
              personnelReimbursements={totalPersonnelReimbursements}
            />

            <RevenueForecastChart 
              totalRevenue={totalRevenue}
              targetEnrollment={budgetData.targetEnrollment}
              visitRevenue={totalVisitRevenue}
              customRevenue={totalCustomRevenue}
              personnelReimbursements={totalPersonnelReimbursements}
            />

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

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <RotateCcw className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Clear All Budget Data</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to clear all budget data? This will delete all study information, 
              cost items, and reset everything to the initial state. This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelClearAll}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
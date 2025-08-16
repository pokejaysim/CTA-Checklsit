import React, { useState } from 'react';
import { StudyBudget, CostTier } from './types/budget.types';
import { useLocalStorage, useAutoSave } from './hooks/useLocalStorage';

// Placeholder components - we'll implement these next
const StudyProceduresPanel = ({ budget, onUpdateBudget }: any) => (
  <div className="panel-header">
    <h2 className="text-lg font-semibold">Study Procedures</h2>
    <p className="text-sm text-gray-600">Drag and organize procedures</p>
  </div>
);

const CostManagementPanel = ({ budget, costTier, currency, onUpdateBudget }: any) => (
  <div className="panel-header">
    <h2 className="text-lg font-semibold">Cost Management</h2>
    <p className="text-sm text-gray-600">Set pricing tiers</p>
  </div>
);

const VisitSchedulePanel = ({ budget, onUpdateBudget }: any) => (
  <div className="panel-header">
    <h2 className="text-lg font-semibold">Visit Schedule</h2>
    <p className="text-sm text-gray-600">Map procedures to visits</p>
  </div>
);

const BudgetDashboard = ({ budget, costTier, currency }: any) => (
  <div className="panel-header">
    <h2 className="text-lg font-semibold">Budget Dashboard</h2>
    <p className="text-sm text-gray-600">Real-time calculations</p>
  </div>
);

// Default budget structure
const createDefaultBudget = (): StudyBudget => ({
  id: crypto.randomUUID(),
  title: '',
  investigator: '',
  enrollment: 100,
  duration: 12,
  procedures: [],
  visits: [],
  mappings: [],
  costTier: 'commercial',
  currency: 'USD',
  createdAt: new Date(),
  updatedAt: new Date(),
  notes: ''
});

function App() {
  const [budget, setBudget] = useLocalStorage<StudyBudget>('trialbudget-current', createDefaultBudget());
  const [costTier, setCostTier] = useState<CostTier>('commercial');
  const [currency, setCurrency] = useState('USD');
  const [showDashboard, setShowDashboard] = useState(false);

  // Auto-save budget every 30 seconds
  useAutoSave('trialbudget-autosave', budget, 30000);

  const updateBudget = (updates: Partial<StudyBudget>) => {
    setBudget(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date()
    }));
  };

  const handleNewBudget = () => {
    if (window.confirm('Create a new budget? This will clear all current data.')) {
      setBudget(createDefaultBudget());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800">
      {/* Workspace Header */}
      <header className="workspace-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-600 rounded-lg">
                <span className="text-white text-xl">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TrialBudget Pro</h1>
                <p className="text-purple-100 text-sm">Clinical Trial Budget Calculator</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Study Info */}
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <input
                type="text"
                placeholder="Study Title"
                value={budget.title}
                onChange={(e) => updateBudget({ title: e.target.value })}
                className="bg-transparent text-white placeholder-purple-200 border-none focus:outline-none text-sm font-medium"
              />
            </div>
            
            {/* Cost Tier Selector */}
            <select
              value={costTier}
              onChange={(e) => setCostTier(e.target.value as CostTier)}
              className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="academic" className="text-gray-900">Academic</option>
              <option value="commercial" className="text-gray-900">Commercial</option>
              <option value="government" className="text-gray-900">Government</option>
            </select>
            
            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="USD" className="text-gray-900">USD ($)</option>
              <option value="EUR" className="text-gray-900">EUR (€)</option>
              <option value="GBP" className="text-gray-900">GBP (£)</option>
              <option value="CAD" className="text-gray-900">CAD ($)</option>
              <option value="AUD" className="text-gray-900">AUD ($)</option>
            </select>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {showDashboard ? 'Hide' : 'Show'} Dashboard
              </button>
              
              <button
                onClick={handleNewBudget}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                New Budget
              </button>
              
              <a
                href="../index.html"
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                ← Workspace
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Study Procedures Panel */}
        <div className="w-80 panel">
          <StudyProceduresPanel
            budget={budget}
            onUpdateBudget={updateBudget}
          />
        </div>

        {/* Cost Management Panel */}
        <div className="w-64 panel">
          <CostManagementPanel
            budget={budget}
            costTier={costTier}
            currency={currency}
            onUpdateBudget={updateBudget}
          />
        </div>

        {/* Visit Schedule Panel */}
        <div className="flex-1 panel border-r-0">
          <VisitSchedulePanel
            budget={budget}
            onUpdateBudget={updateBudget}
          />
        </div>

        {/* Budget Dashboard (Collapsible) */}
        {showDashboard && (
          <div className="w-80 panel border-r-0">
            <BudgetDashboard
              budget={budget}
              costTier={costTier}
              currency={currency}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

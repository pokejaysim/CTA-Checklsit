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
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}>
      {/* Workspace Header */}
      <header className="workspace-header">
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <div style={{padding: '0.5rem', background: '#8b5cf6', borderRadius: '0.5rem'}}>
                <span style={{color: 'white', fontSize: '1.25rem'}}>📊</span>
              </div>
              <div>
                <h1 style={{fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0}}>TrialBudget Pro</h1>
                <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', margin: 0}}>Clinical Trial Budget Calculator</p>
              </div>
            </div>
          </div>
          
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <input
              type="text"
              placeholder="Study Title"
              value={budget.title}
              onChange={(e) => updateBudget({ title: e.target.value })}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                color: 'white',
                fontSize: '0.875rem'
              }}
            />
            
            <a
              href="../index.html"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              ← Workspace
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{display: 'flex', height: 'calc(100vh - 80px)'}}>
        {/* Study Procedures Panel */}
        <div style={{width: '320px'}} className="panel">
          <StudyProceduresPanel
            budget={budget}
            onUpdateBudget={updateBudget}
          />
        </div>

        {/* Cost Management Panel */}
        <div style={{width: '256px'}} className="panel">
          <CostManagementPanel
            budget={budget}
            costTier={costTier}
            currency={currency}
            onUpdateBudget={updateBudget}
          />
        </div>

        {/* Visit Schedule Panel */}
        <div style={{flex: 1}} className="panel">
          <VisitSchedulePanel
            budget={budget}
            onUpdateBudget={updateBudget}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

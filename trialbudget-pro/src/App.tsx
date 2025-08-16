import React, { useState } from 'react';
import { StudyBudget, CostTier, Procedure, Visit, ProcedureVisitMapping } from './types/budget.types';
import { useLocalStorage, useAutoSave } from './hooks/useLocalStorage';
import { PROCEDURE_LIBRARY, PROCEDURE_CATEGORIES, searchProcedures } from './utils/procedureLibrary';
import { calculateBudget, formatCurrency, COST_MULTIPLIERS } from './utils/calculations';
import { exportToExcel, exportToPDF, exportToCSV } from './utils/exportUtils';

// Study Procedures Panel Component
const StudyProceduresPanel = ({ budget, onUpdateBudget }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customCost, setCustomCost] = useState('100');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['screening', 'laboratory', 'imaging', 'safety']));

  const filteredProcedures = searchProcedures(searchTerm);
  const proceduresByCategory = filteredProcedures.reduce((acc, proc) => {
    const category = proc.category.toLowerCase().replace(/\s+/g, '-');
    if (!acc[category]) acc[category] = [];
    acc[category].push(proc);
    return acc;
  }, {} as Record<string, any[]>);

  const addProcedure = (procedureTemplate: any) => {
    const newProcedure: Procedure = {
      id: crypto.randomUUID(),
      name: procedureTemplate.name,
      category: procedureTemplate.category,
      baseCost: procedureTemplate.defaultCost,
      order: budget.procedures.length
    };
    onUpdateBudget({
      procedures: [...budget.procedures, newProcedure]
    });
  };

  const addCustomProcedure = () => {
    if (!searchTerm.trim()) return;
    
    const newProcedure: Procedure = {
      id: crypto.randomUUID(),
      name: searchTerm.trim(),
      category: 'Custom',
      baseCost: Number(customCost) || 100,
      order: budget.procedures.length
    };
    onUpdateBudget({
      procedures: [...budget.procedures, newProcedure]
    });
    setSearchTerm('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      addCustomProcedure();
    }
  };

  const removeProcedure = (procedureId: string) => {
    onUpdateBudget({
      procedures: budget.procedures.filter((p: Procedure) => p.id !== procedureId),
      mappings: budget.mappings.filter((m: ProcedureVisitMapping) => m.procedureId !== procedureId)
    });
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', background: 'white' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>Study Procedures</h2>
        <input
          type="text"
          placeholder="Search procedures or type custom procedure name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            marginBottom: '0.5rem'
          }}
        />
        {searchTerm && filteredProcedures.length === 0 && (
          <div>
            <input
              type="number"
              placeholder="Cost"
              value={customCost}
              onChange={(e) => setCustomCost(e.target.value)}
              style={{
                width: '80px',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                marginRight: '0.5rem'
              }}
            />
            <button
              onClick={addCustomProcedure}
              style={{
                padding: '0.5rem 1rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Add Custom Procedure
            </button>
          </div>
        )}
      </div>
      
      <div style={{ flex: 1, overflow: 'auto', background: '#f9fafb' }}>
        {/* Added Procedures */}
        {budget.procedures.length > 0 && (
          <div>
            {PROCEDURE_CATEGORIES.map(category => {
              const categoryProcs = budget.procedures.filter((p: Procedure) => 
                p.category.toLowerCase() === category.name.toLowerCase()
              );
              if (categoryProcs.length === 0) return null;
              
              const categoryId = category.id;
              const isExpanded = expandedCategories.has(categoryId);
              
              return (
                <div key={categoryId}>
                  <div
                    onClick={() => toggleCategory(categoryId)}
                    style={{
                      padding: '0.75rem 1rem',
                      background: '#f3f4f6',
                      borderBottom: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}
                  >
                    <span>{category.name}</span>
                    <span style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                      ▶
                    </span>
                  </div>
                  {isExpanded && categoryProcs.map((procedure: Procedure) => (
                    <div
                      key={procedure.id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #e5e7eb',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span style={{ fontSize: '0.875rem' }}>{procedure.name}</span>
                      <button
                        onClick={() => removeProcedure(procedure.id)}
                        style={{
                          color: '#ef4444',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          padding: '0.25rem'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Available Procedures */}
        {searchTerm && (
          <div>
            {PROCEDURE_CATEGORIES.map(category => {
              const categoryProcs = proceduresByCategory[category.id] || [];
              if (categoryProcs.length === 0) return null;
              
              return (
                <div key={category.id}>
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: '#e5e7eb',
                    borderBottom: '1px solid #d1d5db',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}>
                    {category.name}
                  </div>
                  {categoryProcs.map((procedure, index) => (
                    <div
                      key={index}
                      onClick={() => addProcedure(procedure)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #e5e7eb',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{ fontWeight: '500' }}>{procedure.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{procedure.description}</div>
                      <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
                        ${procedure.defaultCost}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Cost Management Panel Component
const CostManagementPanel = ({ budget, costTier, currency, onUpdateBudget }: any) => {
  const updateProcedureCost = (procedureId: string, newCost: number) => {
    const updatedProcedures = budget.procedures.map((p: Procedure) =>
      p.id === procedureId ? { ...p, baseCost: newCost } : p
    );
    onUpdateBudget({ procedures: updatedProcedures });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', background: 'white' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>Cost per Event</h2>
      </div>
      
      <div style={{ flex: 1, overflow: 'auto', background: 'white' }}>
        {budget.procedures.map((procedure: Procedure) => (
          <div
            key={procedure.id}
            style={{
              padding: '1rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <input
              type="number"
              value={procedure.baseCost}
              onChange={(e) => updateProcedureCost(procedure.id, Number(e.target.value))}
              style={{
                width: '80px',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                textAlign: 'center',
                fontSize: '0.875rem'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Visit Schedule Panel Component
const VisitSchedulePanel = ({ budget, onUpdateBudget }: any) => {
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [newVisitName, setNewVisitName] = useState('');
  
  const defaultVisits: Visit[] = [
    { id: 'screen', name: 'Screen', timepoint: 'Screening', order: 0, color: '#3b82f6' },
    { id: 'day0', name: 'Day 0', timepoint: 'Baseline', order: 1, color: '#10b981' },
    { id: 'day7', name: 'Day 7', timepoint: 'Week 1', order: 2, color: '#f59e0b' },
    { id: 'month1', name: 'Month 1', timepoint: 'Month 1', order: 3, color: '#ef4444' },
    { id: 'month3', name: 'Month 3', timepoint: 'Month 3', order: 4, color: '#8b5cf6' },
    { id: 'month6', name: 'Month 6', timepoint: 'Month 6', order: 5, color: '#ec4899' },
    { id: 'month9', name: 'Month 9', timepoint: 'Month 9', order: 6, color: '#6b7280' }
  ];

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280', '#059669', '#dc2626', '#7c3aed'];

  // Initialize visits if empty
  React.useEffect(() => {
    if (budget.visits.length === 0) {
      onUpdateBudget({ visits: defaultVisits });
    }
  }, []);

  const visits = budget.visits.length > 0 ? budget.visits : defaultVisits;

  const addVisit = () => {
    if (!newVisitName.trim()) return;
    
    const newVisit: Visit = {
      id: crypto.randomUUID(),
      name: newVisitName.trim(),
      timepoint: newVisitName.trim(),
      order: visits.length,
      color: colors[visits.length % colors.length]
    };
    
    onUpdateBudget({
      visits: [...visits, newVisit]
    });
    
    setNewVisitName('');
    setShowAddVisit(false);
  };

  const removeVisit = (visitId: string) => {
    onUpdateBudget({
      visits: visits.filter((v: Visit) => v.id !== visitId),
      mappings: budget.mappings.filter((m: ProcedureVisitMapping) => m.visitId !== visitId)
    });
  };

  const toggleMapping = (procedureId: string, visitId: string) => {
    const existingMapping = budget.mappings.find(
      (m: ProcedureVisitMapping) => m.procedureId === procedureId && m.visitId === visitId
    );

    if (existingMapping) {
      onUpdateBudget({
        mappings: budget.mappings.filter(
          (m: ProcedureVisitMapping) => !(m.procedureId === procedureId && m.visitId === visitId)
        )
      });
    } else {
      onUpdateBudget({
        mappings: [...budget.mappings, {
          procedureId,
          visitId,
          required: true,
          quantity: 1
        }]
      });
    }
  };

  const isMapped = (procedureId: string, visitId: string) => {
    return budget.mappings.some(
      (m: ProcedureVisitMapping) => m.procedureId === procedureId && m.visitId === visitId
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showAddVisit ? '1rem' : '0' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Visit Schedule</h2>
          <button
            onClick={() => setShowAddVisit(!showAddVisit)}
            style={{
              padding: '0.5rem 1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            + Add Visit
          </button>
        </div>
        {showAddVisit && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Visit name (e.g., Month 12)"
              value={newVisitName}
              onChange={(e) => setNewVisitName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addVisit()}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
            <button
              onClick={addVisit}
              style={{
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
            <button
              onClick={() => setShowAddVisit(false)}
              style={{
                padding: '0.5rem 1rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', background: 'white' }}>
        <div style={{ minWidth: `${200 + visits.length * 120}px` }}>
          {/* Visit Headers */}
          <div style={{ display: 'flex', position: 'sticky', top: 0, background: 'white', zIndex: 10, borderBottom: '2px solid #e5e7eb' }}>
            <div style={{ width: '200px', padding: '0.75rem', fontWeight: '600', fontSize: '0.875rem', borderRight: '1px solid #e5e7eb' }}>
              Procedure
            </div>
            {visits.map((visit: Visit) => (
              <div
                key={visit.id}
                style={{
                  width: '120px',
                  padding: '0.75rem 0.5rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  background: visit.color || '#3b82f6',
                  color: 'white',
                  borderRight: '1px solid #e5e7eb',
                  position: 'relative'
                }}
              >
                <div>{visit.name}</div>
                <button
                  onClick={() => removeVisit(visit.id)}
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Remove visit"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Procedure Rows */}
          {budget.procedures.map((procedure: Procedure) => (
            <div key={procedure.id} style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{
                width: '200px',
                padding: '0.75rem',
                fontSize: '0.875rem',
                borderRight: '1px solid #e5e7eb',
                background: '#f9fafb'
              }}>
                {procedure.name}
              </div>
              {visits.map((visit: Visit) => (
                <div
                  key={visit.id}
                  style={{
                    width: '120px',
                    padding: '0.75rem',
                    textAlign: 'center',
                    borderRight: '1px solid #e5e7eb'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isMapped(procedure.id, visit.id)}
                    onChange={() => toggleMapping(procedure.id, visit.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Default budget structure
const createDefaultBudget = (): StudyBudget => ({
  id: crypto.randomUUID(),
  title: 'MS Treatment Study - Phase II',
  investigator: 'Dr. Smith',
  enrollment: 60,
  duration: 24,
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

  // Auto-save budget every 30 seconds
  useAutoSave('trialbudget-autosave', budget, 30000);

  const updateBudget = (updates: Partial<StudyBudget>) => {
    setBudget(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date()
    }));
  };

  // Calculate budget totals
  const costConfig = {
    tier: costTier,
    multiplier: COST_MULTIPLIERS[costTier],
    currency: currency,
    escalationRate: 0
  };
  const calculations = calculateBudget(budget, costConfig);
  const perSubjectCost = calculations.perSubjectCost;
  const totalBudget = perSubjectCost * budget.enrollment;
  const totalProcedures = budget.procedures.length;
  const visitCount = budget.visits.length;

  return (
    <div style={{minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif'}}>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '1.5rem 2rem',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: '700',
          color: '#1f2937',
          margin: '0 0 0.5rem 0'
        }}>
          Clinical Trial Budget Calculator
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '1rem',
          margin: '0 0 1.5rem 0'
        }}>
          Create detailed study budgets from your schedule of events
        </p>
        
        {/* Study Info Inputs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '1rem',
          alignItems: 'end'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Study Title
            </label>
            <input
              type="text"
              value={budget.title}
              onChange={(e) => updateBudget({ title: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Enrollment
            </label>
            <input
              type="number"
              value={budget.enrollment}
              onChange={(e) => updateBudget({ enrollment: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Principal Investigator
            </label>
            <input
              type="text"
              value={budget.investigator}
              onChange={(e) => updateBudget({ investigator: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Duration (months)
            </label>
            <input
              type="number"
              value={budget.duration}
              onChange={(e) => updateBudget({ duration: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{display: 'flex', height: 'calc(100vh - 280px)'}}>
        {/* Study Procedures Panel */}
        <div style={{width: '320px', background: 'white', borderRight: '1px solid #e5e7eb'}}>
          <StudyProceduresPanel
            budget={budget}
            onUpdateBudget={updateBudget}
          />
        </div>

        {/* Cost Management Panel */}
        <div style={{width: '256px', background: 'white', borderRight: '1px solid #e5e7eb'}}>
          <CostManagementPanel
            budget={budget}
            costTier={costTier}
            currency={currency}
            onUpdateBudget={updateBudget}
          />
        </div>

        {/* Visit Schedule Panel */}
        <div style={{flex: 1, background: 'white'}}>
          <VisitSchedulePanel
            budget={budget}
            onUpdateBudget={updateBudget}
          />
        </div>
      </div>

      {/* Bottom Dashboard */}
      <div style={{
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '1.5rem 2rem',
        boxShadow: '0 -1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '2rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#059669'
            }}>
              {formatCurrency(perSubjectCost, currency)}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              Per Subject Cost
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#dc2626'
            }}>
              {formatCurrency(totalBudget, currency)}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              Total Study Budget
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#7c3aed'
            }}>
              {totalProcedures}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              Total Procedures
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#0d9488'
            }}>
              {visitCount}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              Visit Count
            </div>
          </div>
        </div>
        
        {/* Export Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button 
            onClick={() => exportToPDF(budget, calculations)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Export as PDF
          </button>
          <button 
            onClick={() => exportToExcel(budget, calculations)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Export as Excel
          </button>
          <button 
            onClick={() => exportToCSV(budget, calculations)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Export as CSV
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

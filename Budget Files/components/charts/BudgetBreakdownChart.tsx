'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { PieChart } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface BudgetBreakdownChartProps {
  startupFees: number;
  visitRevenue: number;
  customRevenue: number;
  personnelReimbursements: number;
}

export const BudgetBreakdownChart: React.FC<BudgetBreakdownChartProps> = ({
  startupFees,
  visitRevenue,
  customRevenue,
  personnelReimbursements,
}) => {
  const total = startupFees + visitRevenue + customRevenue + personnelReimbursements;
  
  if (total === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <PieChart className="w-5 h-5 text-blue-700" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Budget Breakdown</h3>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <PieChart className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No budget data to display</p>
            <p className="text-xs text-gray-400 mt-1">Add budget items to see the breakdown</p>
          </div>
        </div>
      </div>
    );
  }

  const data = {
    labels: [
      'Startup Fees',
      'Visit Revenue', 
      'Custom Revenue',
      'Personnel Reimbursements'
    ].filter((_, index) => {
      const values = [startupFees, visitRevenue, customRevenue, personnelReimbursements];
      return values[index] > 0;
    }),
    datasets: [
      {
        data: [startupFees, visitRevenue, customRevenue, personnelReimbursements]
          .filter(value => value > 0),
        backgroundColor: [
          '#3B82F6', // Blue
          '#10B981', // Green
          '#F59E0B', // Amber
          '#8B5CF6', // Purple
        ],
        borderColor: [
          '#2563EB',
          '#059669', 
          '#D97706',
          '#7C3AED',
        ],
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <PieChart className="w-5 h-5 text-blue-700" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Budget Breakdown</h3>
      </div>
      
      <div className="relative h-64">
        <Pie data={data} options={options} />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        {data.labels.map((label, index) => {
          const values = [startupFees, visitRevenue, customRevenue, personnelReimbursements]
            .filter(value => value > 0);
          const value = values[index];
          const percentage = ((value / total) * 100).toFixed(1);
          
          return (
            <div key={label} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
                />
                <span className="text-gray-700">{label}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  ${value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {percentage}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
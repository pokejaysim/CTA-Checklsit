'use client';

import React, { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement 
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp, BarChart3 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

interface RevenueForecastChartProps {
  totalRevenue: number;
  targetEnrollment: number;
  visitRevenue: number;
  customRevenue: number;
  personnelReimbursements: number;
}

export const RevenueForecastChart: React.FC<RevenueForecastChartProps> = ({
  totalRevenue,
  targetEnrollment,
  visitRevenue,
  customRevenue,
  personnelReimbursements,
}) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  if (totalRevenue === 0 || targetEnrollment === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-700" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Forecast</h3>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No enrollment target set</p>
            <p className="text-xs text-gray-400 mt-1">Set target enrollment to see forecast</p>
          </div>
        </div>
      </div>
    );
  }

  // Generate 12-month forecast assuming gradual enrollment
  const months = [
    'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6',
    'Month 7', 'Month 8', 'Month 9', 'Month 10', 'Month 11', 'Month 12'
  ];

  // Simple enrollment curve - starts slow, peaks in middle months
  const enrollmentCurve = [0.02, 0.05, 0.08, 0.12, 0.15, 0.18, 0.15, 0.12, 0.08, 0.03, 0.01, 0.01];
  
  let cumulativeEnrollment = 0;
  const monthlyData = months.map((_, index) => {
    const monthlyEnrollment = Math.round(targetEnrollment * enrollmentCurve[index]);
    cumulativeEnrollment += monthlyEnrollment;
    
    // Calculate revenues
    const monthlyVisitRevenue = visitRevenue * (monthlyEnrollment / targetEnrollment);
    const monthlyCustomRevenue = customRevenue * (monthlyEnrollment / targetEnrollment);
    const monthlyPersonnelCosts = personnelReimbursements * (monthlyEnrollment / targetEnrollment);
    const monthlyTotal = monthlyVisitRevenue + monthlyCustomRevenue + monthlyPersonnelCosts;
    
    return {
      month: months[index],
      enrollment: monthlyEnrollment,
      cumulativeEnrollment,
      visitRevenue: monthlyVisitRevenue,
      customRevenue: monthlyCustomRevenue,
      personnelCosts: monthlyPersonnelCosts,
      totalRevenue: monthlyTotal,
    };
  });

  const data = {
    labels: months,
    datasets: [
      {
        label: 'Monthly Revenue',
        data: monthlyData.map(d => d.totalRevenue),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: chartType === 'line',
      },
      {
        label: 'Visit Revenue',
        data: monthlyData.map(d => d.visitRevenue),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Personnel Costs',
        data: monthlyData.map(d => d.personnelCosts),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        tension: 0.4,
        fill: false,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
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
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
          },
          afterBody: (tooltipItems: any[]) => {
            const index = tooltipItems[0].dataIndex;
            const data = monthlyData[index];
            return [
              `Enrollment this month: ${data.enrollment}`,
              `Cumulative enrollment: ${data.cumulativeEnrollment}`
            ];
          }
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `$${value.toLocaleString()}`,
        },
      },
    },
  };

  const ChartComponent = chartType === 'line' ? Line : Bar;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-700" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Forecast</h3>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('line')}
            className={`p-2 rounded-lg transition-colors ${
              chartType === 'line' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Line Chart"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-2 rounded-lg transition-colors ${
              chartType === 'bar' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Bar Chart"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="relative h-64 mb-4">
        <ChartComponent data={data} options={options} />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-blue-700 font-semibold">Peak Month</div>
          <div className="text-blue-900">
            Month {monthlyData.findIndex(d => d.totalRevenue === Math.max(...monthlyData.map(d => d.totalRevenue))) + 1}
          </div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-green-700 font-semibold">Avg Monthly</div>
          <div className="text-green-900">
            ${Math.round(monthlyData.reduce((sum, d) => sum + d.totalRevenue, 0) / 12).toLocaleString()}
          </div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-purple-700 font-semibold">Total Patients</div>
          <div className="text-purple-900">{targetEnrollment}</div>
        </div>
        <div className="bg-amber-50 p-3 rounded-lg">
          <div className="text-amber-700 font-semibold">Study Duration</div>
          <div className="text-amber-900">12 months</div>
        </div>
      </div>
    </div>
  );
};
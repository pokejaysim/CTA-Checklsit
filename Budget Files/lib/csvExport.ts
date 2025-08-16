import type { BudgetData } from '@/types/budget';

interface BudgetCalculations {
  totalStartupFees: number;
  totalVisitRevenue: number;
  totalCustomRevenue: number;
  totalPersonnelReimbursements: number;
  subtotal: number;
  overheadAmount: number;
  totalRevenue: number;
}

export const exportBudgetToCSV = (
  budgetData: BudgetData,
  calculations: BudgetCalculations
): void => {
  const csvData = [];

  // Header
  csvData.push(['Clinical Trial Budget Export']);
  csvData.push(['Generated on:', new Date().toLocaleDateString()]);
  csvData.push([]);

  // Study Information
  csvData.push(['STUDY INFORMATION']);
  csvData.push(['Protocol Number', budgetData.studyInfo.protocolNumber || 'Not specified']);
  csvData.push(['Study Title', budgetData.studyInfo.studyTitle || 'Not specified']);
  csvData.push(['Principal Investigator', budgetData.studyInfo.piName || 'Not specified']);
  csvData.push(['Study Date', budgetData.studyInfo.studyDate || 'Not specified']);
  csvData.push(['Sponsor', budgetData.studyInfo.sponsor || 'Not specified']);
  csvData.push(['Site Name', budgetData.studyInfo.siteName || 'Not specified']);
  csvData.push([]);

  // Study Parameters
  csvData.push(['STUDY PARAMETERS']);
  csvData.push(['Target Enrollment', budgetData.targetEnrollment]);
  csvData.push(['Overhead Rate (%)', budgetData.overhead]);
  csvData.push([]);

  // Budget Summary
  csvData.push(['BUDGET SUMMARY']);
  csvData.push(['Category', 'Amount']);
  csvData.push(['Startup Fees', calculations.totalStartupFees]);
  csvData.push(['Visit Revenue', calculations.totalVisitRevenue]);
  csvData.push(['Custom Revenue', calculations.totalCustomRevenue]);
  csvData.push(['Personnel Reimbursements', calculations.totalPersonnelReimbursements]);
  csvData.push(['Subtotal', calculations.subtotal]);
  csvData.push([`Overhead (${budgetData.overhead}%)`, calculations.overheadAmount]);
  csvData.push(['TOTAL BUDGET REQUEST', calculations.totalRevenue]);
  csvData.push([]);

  // Per-patient calculation
  if (budgetData.targetEnrollment > 0) {
    const perPatient = calculations.totalRevenue / budgetData.targetEnrollment;
    csvData.push(['Budget Per Patient', perPatient.toFixed(2)]);
    csvData.push([]);
  }

  // Startup Fees Detail
  if (budgetData.startupFees.length > 0) {
    csvData.push(['STARTUP FEES DETAIL']);
    csvData.push(['Item Name', 'Amount']);
    budgetData.startupFees.forEach(fee => {
      csvData.push([fee.name, fee.amount]);
    });
    csvData.push(['Startup Fees Subtotal', calculations.totalStartupFees]);
    csvData.push([]);
  }

  // Visit Schedule Detail
  if (budgetData.visits.length > 0) {
    csvData.push(['VISIT SCHEDULE DETAIL']);
    csvData.push(['Visit Name', 'Payment Per Visit', 'Total for Target Enrollment']);
    budgetData.visits.forEach(visit => {
      const totalForVisit = visit.paymentPerVisit * budgetData.targetEnrollment;
      csvData.push([visit.name, visit.paymentPerVisit, totalForVisit]);
    });
    csvData.push(['Visit Revenue Subtotal', '', calculations.totalVisitRevenue]);
    csvData.push([]);
  }

  // Custom Revenue Detail
  if (budgetData.customRevenueItems.length > 0) {
    csvData.push(['CUSTOM REVENUE DETAIL']);
    csvData.push(['Item Name', 'Type', 'Amount', 'Total Revenue']);
    budgetData.customRevenueItems.forEach(item => {
      let totalRevenue = item.amount;
      if (item.type === 'perPatient') {
        totalRevenue = item.amount * budgetData.targetEnrollment;
      } else if (item.type === 'perVisit') {
        totalRevenue = item.amount * budgetData.targetEnrollment * budgetData.visits.length;
      }
      csvData.push([item.name, item.type, item.amount, totalRevenue]);
    });
    csvData.push(['Custom Revenue Subtotal', '', '', calculations.totalCustomRevenue]);
    csvData.push([]);
  }

  // Personnel Reimbursements Detail
  if (budgetData.personnelReimbursements.length > 0) {
    csvData.push(['PERSONNEL REIMBURSEMENTS DETAIL']);
    csvData.push(['Role', 'Type', 'Rate/Fee', 'Hours/Months', 'Total Cost']);
    budgetData.personnelReimbursements.forEach(item => {
      let totalCost = 0;
      let rateInfo = '';
      let timeInfo = '';
      
      if (item.type === 'perPatient') {
        totalCost = (item.hourlyRate || 0) * (item.hours || 0) * budgetData.targetEnrollment;
        rateInfo = `$${item.hourlyRate || 0}/hour`;
        timeInfo = `${item.hours || 0} hours`;
      } else {
        totalCost = (item.monthlyFee || 0) * (item.months || 0);
        rateInfo = `$${item.monthlyFee || 0}/month`;
        timeInfo = `${item.months || 0} months`;
      }
      
      csvData.push([item.role, item.type, rateInfo, timeInfo, totalCost]);
    });
    csvData.push(['Personnel Reimbursements Subtotal', '', '', '', calculations.totalPersonnelReimbursements]);
    csvData.push([]);
  }

  // Notes
  if (budgetData.notes.trim()) {
    csvData.push(['NOTES']);
    csvData.push([budgetData.notes]);
    csvData.push([]);
  }

  // Convert to CSV string
  const csvContent = csvData.map(row => 
    row.map(cell => {
      // Handle cells that contain commas, quotes, or newlines
      const cellStr = String(cell || '');
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const filename = budgetData.studyInfo.protocolNumber 
    ? `budget_${budgetData.studyInfo.protocolNumber}_${new Date().toISOString().split('T')[0]}.csv`
    : `clinical_trial_budget_${new Date().toISOString().split('T')[0]}.csv`;

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const exportBudgetToExcel = async (
  budgetData: BudgetData,
  calculations: BudgetCalculations
): Promise<void> => {
  // For Excel export, we'll use a more structured approach
  // This creates an Excel-compatible CSV with better formatting
  
  const excelData: any[][] = [];
  const addRow = (data: any[], style?: string) => {
    void style; // Explicitly indicate we're not using this parameter yet
    excelData.push(data);
  };

  // Title
  addRow(['Clinical Trial Budget Report'], 'header');
  addRow([`Generated: ${new Date().toLocaleDateString()}`]);
  addRow([]);

  // Study Information Table
  addRow(['Study Information'], 'section-header');
  addRow(['Field', 'Value'], 'table-header');
  addRow(['Protocol Number', budgetData.studyInfo.protocolNumber || 'Not specified']);
  addRow(['Study Title', budgetData.studyInfo.studyTitle || 'Not specified']);
  addRow(['Principal Investigator', budgetData.studyInfo.piName || 'Not specified']);
  addRow(['Study Date', budgetData.studyInfo.studyDate || 'Not specified']);
  addRow(['Sponsor', budgetData.studyInfo.sponsor || 'Not specified']);
  addRow(['Site Name', budgetData.studyInfo.siteName || 'Not specified']);
  addRow(['Target Enrollment', budgetData.targetEnrollment]);
  addRow(['Overhead Rate', `${budgetData.overhead}%`]);
  addRow([]);

  // Budget Summary Table
  addRow(['Budget Summary'], 'section-header');
  addRow(['Category', 'Amount (USD)'], 'table-header');
  addRow(['Startup Fees', calculations.totalStartupFees]);
  addRow(['Visit Revenue', calculations.totalVisitRevenue]);
  addRow(['Custom Revenue', calculations.totalCustomRevenue]);
  addRow(['Personnel Reimbursements', calculations.totalPersonnelReimbursements]);
  addRow(['Subtotal', calculations.subtotal]);
  addRow([`Overhead (${budgetData.overhead}%)`, calculations.overheadAmount]);
  addRow(['TOTAL BUDGET REQUEST', calculations.totalRevenue], 'total');
  
  if (budgetData.targetEnrollment > 0) {
    const perPatient = calculations.totalRevenue / budgetData.targetEnrollment;
    addRow(['Budget Per Patient', perPatient]);
  }
  addRow([]);

  // Detailed breakdowns
  if (budgetData.startupFees.length > 0) {
    addRow(['Startup Fees Details'], 'section-header');
    addRow(['Item', 'Amount (USD)'], 'table-header');
    budgetData.startupFees.forEach(fee => {
      addRow([fee.name, fee.amount]);
    });
    addRow([]);
  }

  if (budgetData.visits.length > 0) {
    addRow(['Visit Schedule Details'], 'section-header');
    addRow(['Visit', 'Per Visit Payment', 'Total for Target Enrollment'], 'table-header');
    budgetData.visits.forEach(visit => {
      const total = visit.paymentPerVisit * budgetData.targetEnrollment;
      addRow([visit.name, visit.paymentPerVisit, total]);
    });
    addRow([]);
  }

  // Convert to CSV for Excel compatibility
  const csvContent = excelData.map(row => 
    row.map(cell => {
      const cellStr = String(cell || '');
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');

  // Create Excel-compatible file
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvContent], { 
    type: 'application/vnd.ms-excel;charset=utf-8;' 
  });
  
  const link = document.createElement('a');
  const filename = budgetData.studyInfo.protocolNumber 
    ? `budget_${budgetData.studyInfo.protocolNumber}_${new Date().toISOString().split('T')[0]}.csv`
    : `clinical_trial_budget_${new Date().toISOString().split('T')[0]}.csv`;

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
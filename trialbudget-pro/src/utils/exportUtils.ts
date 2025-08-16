import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { StudyBudget, Procedure, Visit, ProcedureVisitMapping } from '../types/budget.types';
import { calculateBudget, formatCurrency } from './calculations';

// Excel Export
export const exportToExcel = (budget: StudyBudget, calculations: any) => {
  const workbook = XLSX.utils.book_new();
  
  // Study Overview Sheet
  const studyData = [
    ['Study Title', budget.title],
    ['Principal Investigator', budget.investigator],
    ['Enrollment', budget.enrollment],
    ['Duration (months)', budget.duration],
    ['Per Subject Cost', calculations.perSubjectCost],
    ['Total Study Budget', calculations.perSubjectCost * budget.enrollment],
    ['Created', budget.createdAt.toLocaleDateString()],
    ['Last Updated', budget.updatedAt.toLocaleDateString()]
  ];
  
  const studySheet = XLSX.utils.aoa_to_sheet(studyData);
  XLSX.utils.book_append_sheet(workbook, studySheet, 'Study Overview');
  
  // Procedures Sheet
  const procedureHeaders = ['Procedure Name', 'Category', 'Base Cost', 'Total Visits', 'Total Cost'];
  const procedureData = budget.procedures.map((proc: Procedure) => {
    const visitCount = budget.mappings.filter((m: ProcedureVisitMapping) => m.procedureId === proc.id).length;
    return [
      proc.name,
      proc.category,
      proc.baseCost,
      visitCount,
      proc.baseCost * visitCount
    ];
  });
  
  const procedureSheet = XLSX.utils.aoa_to_sheet([procedureHeaders, ...procedureData]);
  XLSX.utils.book_append_sheet(workbook, procedureSheet, 'Procedures');
  
  // Visit Schedule Sheet
  const visitHeaders = ['Procedure', ...budget.visits.map((v: Visit) => v.name)];
  const scheduleData = budget.procedures.map((proc: Procedure) => {
    const row = [proc.name];
    budget.visits.forEach((visit: Visit) => {
      const isMapped = budget.mappings.some(
        (m: ProcedureVisitMapping) => m.procedureId === proc.id && m.visitId === visit.id
      );
      row.push(isMapped ? 'X' : '');
    });
    return row;
  });
  
  const scheduleSheet = XLSX.utils.aoa_to_sheet([visitHeaders, ...scheduleData]);
  XLSX.utils.book_append_sheet(workbook, scheduleSheet, 'Visit Schedule');
  
  // Download
  const fileName = `${budget.title.replace(/[^a-z0-9]/gi, '_')}_Budget.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// PDF Export
export const exportToPDF = (budget: StudyBudget, calculations: any) => {
  const pdf = new jsPDF();
  
  // Title
  pdf.setFontSize(20);
  pdf.text('Clinical Trial Budget Report', 20, 30);
  
  // Study Information
  pdf.setFontSize(16);
  pdf.text('Study Information', 20, 50);
  
  pdf.setFontSize(12);
  let yPos = 65;
  const studyInfo = [
    `Study Title: ${budget.title}`,
    `Principal Investigator: ${budget.investigator}`,
    `Enrollment: ${budget.enrollment} subjects`,
    `Duration: ${budget.duration} months`,
    `Per Subject Cost: ${formatCurrency(calculations.perSubjectCost, budget.currency)}`,
    `Total Study Budget: ${formatCurrency(calculations.perSubjectCost * budget.enrollment, budget.currency)}`
  ];
  
  studyInfo.forEach(info => {
    pdf.text(info, 20, yPos);
    yPos += 8;
  });
  
  // Procedures Summary
  yPos += 10;
  pdf.setFontSize(16);
  pdf.text('Procedures Summary', 20, yPos);
  yPos += 15;
  
  pdf.setFontSize(10);
  budget.procedures.forEach((proc: Procedure) => {
    const visitCount = budget.mappings.filter((m: ProcedureVisitMapping) => m.procedureId === proc.id).length;
    pdf.text(`• ${proc.name}: ${formatCurrency(proc.baseCost, budget.currency)} x ${visitCount} visits = ${formatCurrency(proc.baseCost * visitCount, budget.currency)}`, 25, yPos);
    yPos += 6;
    
    if (yPos > 270) {
      pdf.addPage();
      yPos = 20;
    }
  });
  
  // Download
  const fileName = `${budget.title.replace(/[^a-z0-9]/gi, '_')}_Budget.pdf`;
  pdf.save(fileName);
};

// CSV Export
export const exportToCSV = (budget: StudyBudget, calculations: any) => {
  const headers = ['Procedure', 'Category', 'Base Cost', ...budget.visits.map((v: Visit) => v.name), 'Total Cost'];
  
  const rows = budget.procedures.map((proc: Procedure) => {
    const row = [proc.name, proc.category, proc.baseCost];
    
    budget.visits.forEach((visit: Visit) => {
      const isMapped = budget.mappings.some(
        (m: ProcedureVisitMapping) => m.procedureId === proc.id && m.visitId === visit.id
      );
      row.push(isMapped ? proc.baseCost : 0);
    });
    
    const totalCost = budget.mappings
      .filter((m: ProcedureVisitMapping) => m.procedureId === proc.id)
      .reduce((sum) => sum + proc.baseCost, 0);
    row.push(totalCost);
    
    return row;
  });
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${budget.title.replace(/[^a-z0-9]/gi, '_')}_Budget.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
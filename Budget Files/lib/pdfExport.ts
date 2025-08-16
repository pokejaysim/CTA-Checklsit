import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

export const exportBudgetToPDF = async (
  budgetData: BudgetData,
  calculations: BudgetCalculations
): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Clinical Trial Budget Report', margin, yPosition);
  yPosition += 15;

  // Study Information
  pdf.setFontSize(14);
  pdf.text('Study Information', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const studyInfo = [
    ['Protocol Number:', budgetData.studyInfo.protocolNumber || 'Not specified'],
    ['Study Title:', budgetData.studyInfo.studyTitle || 'Not specified'],
    ['Principal Investigator:', budgetData.studyInfo.piName || 'Not specified'],
    ['Study Date:', budgetData.studyInfo.studyDate || 'Not specified'],
    ['Sponsor:', budgetData.studyInfo.sponsor || 'Not specified'],
    ['Site Name:', budgetData.studyInfo.siteName || 'Not specified'],
  ];

  studyInfo.forEach(([label, value]) => {
    pdf.text(label, margin, yPosition);
    pdf.text(value, margin + 40, yPosition);
    yPosition += 5;
  });

  yPosition += 10;

  // Study Parameters
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Study Parameters', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Target Enrollment: ${budgetData.targetEnrollment} patients`, margin, yPosition);
  yPosition += 5;
  pdf.text(`Overhead Rate: ${budgetData.overhead}%`, margin, yPosition);
  yPosition += 15;

  // Budget Summary
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Budget Summary', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  const budgetSummary = [
    ['Startup Fees', calculations.totalStartupFees],
    ['Visit Revenue', calculations.totalVisitRevenue],
    ['Custom Revenue', calculations.totalCustomRevenue],
    ['Personnel Reimbursements', calculations.totalPersonnelReimbursements],
    ['Subtotal', calculations.subtotal],
    [`Overhead (${budgetData.overhead}%)`, calculations.overheadAmount],
    ['Total Budget Request', calculations.totalRevenue],
  ];

  budgetSummary.forEach(([label, amount], index) => {
    const isTotal = index === budgetSummary.length - 1;
    const isSubtotal = label === 'Subtotal' || (typeof label === 'string' && label.includes('Overhead'));
    
    if (isSubtotal) {
      yPosition += 2;
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 3;
    }
    
    if (isTotal) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
    } else {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
    }
    
    pdf.text(String(label), margin, yPosition);
    pdf.text(`$${(amount as number).toLocaleString()}`, pageWidth - margin - 30, yPosition, { align: 'right' });
    yPosition += isTotal ? 8 : 5;
  });

  yPosition += 10;

  // Per-patient calculation
  if (budgetData.targetEnrollment > 0) {
    const perPatient = calculations.totalRevenue / budgetData.targetEnrollment;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`Budget Per Patient: $${perPatient.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin, yPosition);
    yPosition += 10;
  }

  // Detailed Breakdown - New Page
  if (yPosition > pageHeight - 50) {
    pdf.addPage();
    yPosition = margin;
  }

  // Startup Fees Detail
  if (budgetData.startupFees.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Startup Fees Detail', margin, yPosition);
    yPosition += 8;

    budgetData.startupFees.forEach(fee => {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(fee.name, margin, yPosition);
      pdf.text(`$${fee.amount.toLocaleString()}`, pageWidth - margin - 30, yPosition, { align: 'right' });
      yPosition += 5;
    });
    yPosition += 5;
  }

  // Visits Detail
  if (budgetData.visits.length > 0) {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Visit Schedule Detail', margin, yPosition);
    yPosition += 8;

    budgetData.visits.forEach(visit => {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const totalVisitRevenue = visit.paymentPerVisit * budgetData.targetEnrollment;
      pdf.text(`${visit.name} ($${visit.paymentPerVisit.toLocaleString()}/visit)`, margin, yPosition);
      pdf.text(`$${totalVisitRevenue.toLocaleString()}`, pageWidth - margin - 30, yPosition, { align: 'right' });
      yPosition += 5;
    });
    yPosition += 5;
  }

  // Notes
  if (budgetData.notes.trim()) {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Notes', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const splitNotes = pdf.splitTextToSize(budgetData.notes, pageWidth - 2 * margin);
    pdf.text(splitNotes, margin, yPosition);
  }

  // Footer
  const now = new Date();
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text(
    `Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
    margin,
    pageHeight - 10
  );

  // Save the PDF
  const filename = budgetData.studyInfo.protocolNumber 
    ? `budget_${budgetData.studyInfo.protocolNumber}_${now.toISOString().split('T')[0]}.pdf`
    : `clinical_trial_budget_${now.toISOString().split('T')[0]}.pdf`;
    
  pdf.save(filename);
};

export const exportChartsPageToPDF = async (elementId: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id '${elementId}' not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    const now = new Date();
    const filename = `budget_charts_${now.toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
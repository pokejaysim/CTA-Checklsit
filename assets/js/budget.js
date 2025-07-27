// Clinical Trial Budget Calculator JavaScript

// Budget data structure
let budgetData = {
    studyInfo: {
        protocolNumber: '',
        studyTitle: '',
        principalInvestigator: '',
        sponsor: '',
        studyDuration: 0,
        expectedEnrollment: 0
    },
    currency: 'USD',
    perPatientCosts: {
        screeningVisit: 0,
        baselineVisit: 0,
        followUpVisit: 0,
        followUpQuantity: 1,
        endOfStudyVisit: 0,
        labTests: 0,
        imagingProcedures: 0,
        patientStipend: 0,
        customItems: []
    },
    fixedCosts: {
        siteInitiation: 0,
        siteMonitoring: 0,
        regulatorySubmission: 0,
        irbFees: 0,
        siteCloseOut: 0,
        dataManagement: 0,
        statisticalAnalysis: 0,
        customItems: []
    },
    equipmentCosts: {
        studyDrugDevice: 0,
        laboratorySupplies: 0,
        equipmentRental: 0,
        storageCosts: 0,
        customItems: []
    },
    personnelCosts: {
        piTime: 0,
        coordinatorTime: 0,
        dataEntryTime: 0,
        otherStaffTime: 0,
        customItems: []
    },
    overheadPercentage: 0,
    milestones: [
        { name: 'Site Initiation', percentage: 25 },
        { name: '50% Enrollment', percentage: 50 },
        { name: 'Study Completion', percentage: 25 }
    ],
    notes: {
        perPatient: '',
        fixed: '',
        equipment: '',
        personnel: '',
        general: ''
    }
};

// Currency symbols
const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: '$',
    AUD: '$'
};

// Chart instance
let budgetChart = null;

// Initialize the calculator
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadFromLocalStorage();
    updateAllCalculations();
    initializeBudgetChart();
});

// Setup event listeners
function setupEventListeners() {
    // Study info inputs
    document.getElementById('protocolNumber').addEventListener('input', updateStudyInfo);
    document.getElementById('studyTitle').addEventListener('input', updateStudyInfo);
    document.getElementById('principalInvestigator').addEventListener('input', updateStudyInfo);
    document.getElementById('sponsor').addEventListener('input', updateStudyInfo);
    document.getElementById('studyDuration').addEventListener('input', updateStudyInfo);
    document.getElementById('expectedEnrollment').addEventListener('input', updateStudyInfo);
    
    // Currency selector
    document.getElementById('currency').addEventListener('change', updateCurrency);
    
    // Cost inputs
    const costInputs = document.querySelectorAll('.cost-input');
    costInputs.forEach(input => {
        input.addEventListener('input', updateCosts);
    });
    
    // Notes
    document.getElementById('perPatientNotes').addEventListener('input', updateNotes);
    document.getElementById('fixedNotes').addEventListener('input', updateNotes);
    document.getElementById('equipmentNotes').addEventListener('input', updateNotes);
    document.getElementById('personnelNotes').addEventListener('input', updateNotes);
    document.getElementById('generalNotes').addEventListener('input', updateNotes);
    
    // Overhead
    document.getElementById('overheadPercentage').addEventListener('input', updateOverhead);
}

// Update study information
function updateStudyInfo() {
    budgetData.studyInfo = {
        protocolNumber: document.getElementById('protocolNumber').value,
        studyTitle: document.getElementById('studyTitle').value,
        principalInvestigator: document.getElementById('principalInvestigator').value,
        sponsor: document.getElementById('sponsor').value,
        studyDuration: parseInt(document.getElementById('studyDuration').value) || 0,
        expectedEnrollment: parseInt(document.getElementById('expectedEnrollment').value) || 0
    };
    updateAllCalculations();
    saveToLocalStorage();
}

// Update currency
function updateCurrency() {
    budgetData.currency = document.getElementById('currency').value;
    updateAllCalculations();
    saveToLocalStorage();
}

// Update costs
function updateCosts() {
    // Per-patient costs
    budgetData.perPatientCosts.screeningVisit = parseFloat(document.getElementById('screeningVisit').value) || 0;
    budgetData.perPatientCosts.baselineVisit = parseFloat(document.getElementById('baselineVisit').value) || 0;
    budgetData.perPatientCosts.followUpVisit = parseFloat(document.getElementById('followUpVisit').value) || 0;
    budgetData.perPatientCosts.followUpQuantity = parseInt(document.getElementById('followUpQuantity').value) || 1;
    budgetData.perPatientCosts.endOfStudyVisit = parseFloat(document.getElementById('endOfStudyVisit').value) || 0;
    budgetData.perPatientCosts.labTests = parseFloat(document.getElementById('labTests').value) || 0;
    budgetData.perPatientCosts.imagingProcedures = parseFloat(document.getElementById('imagingProcedures').value) || 0;
    budgetData.perPatientCosts.patientStipend = parseFloat(document.getElementById('patientStipend').value) || 0;
    
    // Fixed costs
    budgetData.fixedCosts.siteInitiation = parseFloat(document.getElementById('siteInitiation').value) || 0;
    budgetData.fixedCosts.siteMonitoring = parseFloat(document.getElementById('siteMonitoring').value) || 0;
    budgetData.fixedCosts.regulatorySubmission = parseFloat(document.getElementById('regulatorySubmission').value) || 0;
    budgetData.fixedCosts.irbFees = parseFloat(document.getElementById('irbFees').value) || 0;
    budgetData.fixedCosts.siteCloseOut = parseFloat(document.getElementById('siteCloseOut').value) || 0;
    budgetData.fixedCosts.dataManagement = parseFloat(document.getElementById('dataManagement').value) || 0;
    budgetData.fixedCosts.statisticalAnalysis = parseFloat(document.getElementById('statisticalAnalysis').value) || 0;
    
    // Equipment costs
    budgetData.equipmentCosts.studyDrugDevice = parseFloat(document.getElementById('studyDrugDevice').value) || 0;
    budgetData.equipmentCosts.laboratorySupplies = parseFloat(document.getElementById('laboratorySupplies').value) || 0;
    budgetData.equipmentCosts.equipmentRental = parseFloat(document.getElementById('equipmentRental').value) || 0;
    budgetData.equipmentCosts.storageCosts = parseFloat(document.getElementById('storageCosts').value) || 0;
    
    // Personnel costs
    budgetData.personnelCosts.piTime = parseFloat(document.getElementById('piTime').value) || 0;
    budgetData.personnelCosts.coordinatorTime = parseFloat(document.getElementById('coordinatorTime').value) || 0;
    budgetData.personnelCosts.dataEntryTime = parseFloat(document.getElementById('dataEntryTime').value) || 0;
    budgetData.personnelCosts.otherStaffTime = parseFloat(document.getElementById('otherStaffTime').value) || 0;
    
    updateAllCalculations();
    saveToLocalStorage();
}

// Update notes
function updateNotes() {
    budgetData.notes = {
        perPatient: document.getElementById('perPatientNotes').value,
        fixed: document.getElementById('fixedNotes').value,
        equipment: document.getElementById('equipmentNotes').value,
        personnel: document.getElementById('personnelNotes').value,
        general: document.getElementById('generalNotes').value
    };
    saveToLocalStorage();
}

// Update overhead
function updateOverhead() {
    budgetData.overheadPercentage = parseFloat(document.getElementById('overheadPercentage').value) || 0;
    updateAllCalculations();
    saveToLocalStorage();
}

// Add custom item
function addCustomItem(category) {
    const item = {
        id: Date.now(),
        name: '',
        cost: 0,
        date: new Date().toISOString().split('T')[0]
    };
    
    switch(category) {
        case 'perPatient':
            budgetData.perPatientCosts.customItems.push(item);
            renderCustomItems('perPatient', budgetData.perPatientCosts.customItems);
            break;
        case 'fixed':
            budgetData.fixedCosts.customItems.push(item);
            renderCustomItems('fixed', budgetData.fixedCosts.customItems);
            break;
        case 'equipment':
            budgetData.equipmentCosts.customItems.push(item);
            renderCustomItems('equipment', budgetData.equipmentCosts.customItems);
            break;
        case 'personnel':
            budgetData.personnelCosts.customItems.push(item);
            renderCustomItems('personnel', budgetData.personnelCosts.customItems);
            break;
    }
    
    updateAllCalculations();
    saveToLocalStorage();
}

// Render custom items
function renderCustomItems(category, items) {
    const container = document.getElementById(`${category}CustomList`);
    container.innerHTML = '';
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'custom-item';
        div.innerHTML = `
            <input type="text" placeholder="Item name" value="${item.name}" onchange="updateCustomItem('${category}', ${item.id}, 'name', this.value)">
            <input type="number" class="cost-input" placeholder="0.00" value="${item.cost}" step="0.01" min="0" onchange="updateCustomItem('${category}', ${item.id}, 'cost', this.value)">
            <input type="date" class="date-input" value="${item.date || ''}" onchange="updateCustomItem('${category}', ${item.id}, 'date', this.value)">
            <span class="cost-display">${formatCurrency(item.cost)}</span>
            <button class="remove-item-btn" onclick="removeCustomItem('${category}', ${item.id})">Remove</button>
        `;
        container.appendChild(div);
    });
}

// Update custom item
function updateCustomItem(category, id, field, value) {
    let items;
    switch(category) {
        case 'perPatient':
            items = budgetData.perPatientCosts.customItems;
            break;
        case 'fixed':
            items = budgetData.fixedCosts.customItems;
            break;
        case 'equipment':
            items = budgetData.equipmentCosts.customItems;
            break;
        case 'personnel':
            items = budgetData.personnelCosts.customItems;
            break;
    }
    
    const item = items.find(i => i.id === id);
    if (item) {
        if (field === 'name') {
            item.name = value;
        } else if (field === 'cost') {
            item.cost = parseFloat(value) || 0;
        } else if (field === 'date') {
            item.date = value;
        }
    }
    
    renderCustomItems(category, items);
    updateAllCalculations();
    saveToLocalStorage();
}

// Remove custom item
function removeCustomItem(category, id) {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        return;
    }
    
    switch(category) {
        case 'perPatient':
            budgetData.perPatientCosts.customItems = budgetData.perPatientCosts.customItems.filter(i => i.id !== id);
            renderCustomItems('perPatient', budgetData.perPatientCosts.customItems);
            break;
        case 'fixed':
            budgetData.fixedCosts.customItems = budgetData.fixedCosts.customItems.filter(i => i.id !== id);
            renderCustomItems('fixed', budgetData.fixedCosts.customItems);
            break;
        case 'equipment':
            budgetData.equipmentCosts.customItems = budgetData.equipmentCosts.customItems.filter(i => i.id !== id);
            renderCustomItems('equipment', budgetData.equipmentCosts.customItems);
            break;
        case 'personnel':
            budgetData.personnelCosts.customItems = budgetData.personnelCosts.customItems.filter(i => i.id !== id);
            renderCustomItems('personnel', budgetData.personnelCosts.customItems);
            break;
    }
    
    updateAllCalculations();
    saveToLocalStorage();
}

// Calculate totals
function calculateTotals() {
    // Per-patient total
    const perPatientTotal = 
        budgetData.perPatientCosts.screeningVisit +
        budgetData.perPatientCosts.baselineVisit +
        (budgetData.perPatientCosts.followUpVisit * budgetData.perPatientCosts.followUpQuantity) +
        budgetData.perPatientCosts.endOfStudyVisit +
        budgetData.perPatientCosts.labTests +
        budgetData.perPatientCosts.imagingProcedures +
        budgetData.perPatientCosts.patientStipend +
        budgetData.perPatientCosts.customItems.reduce((sum, item) => sum + item.cost, 0);
    
    // Fixed total
    const fixedTotal = 
        budgetData.fixedCosts.siteInitiation +
        budgetData.fixedCosts.siteMonitoring +
        budgetData.fixedCosts.regulatorySubmission +
        budgetData.fixedCosts.irbFees +
        budgetData.fixedCosts.siteCloseOut +
        budgetData.fixedCosts.dataManagement +
        budgetData.fixedCosts.statisticalAnalysis +
        budgetData.fixedCosts.customItems.reduce((sum, item) => sum + item.cost, 0);
    
    // Equipment total
    const equipmentTotal = 
        budgetData.equipmentCosts.studyDrugDevice +
        budgetData.equipmentCosts.laboratorySupplies +
        budgetData.equipmentCosts.equipmentRental +
        budgetData.equipmentCosts.storageCosts +
        budgetData.equipmentCosts.customItems.reduce((sum, item) => sum + item.cost, 0);
    
    // Personnel total
    const personnelTotal = 
        budgetData.personnelCosts.piTime +
        budgetData.personnelCosts.coordinatorTime +
        budgetData.personnelCosts.dataEntryTime +
        budgetData.personnelCosts.otherStaffTime +
        budgetData.personnelCosts.customItems.reduce((sum, item) => sum + item.cost, 0);
    
    // Calculate subtotal and overhead
    const perPatientCostsTotal = perPatientTotal * budgetData.studyInfo.expectedEnrollment;
    const subtotal = perPatientCostsTotal + fixedTotal + equipmentTotal + personnelTotal;
    const overheadAmount = subtotal * (budgetData.overheadPercentage / 100);
    const totalStudyCost = subtotal + overheadAmount;
    
    return {
        perPatientTotal,
        fixedTotal,
        equipmentTotal,
        personnelTotal,
        perPatientCostsTotal,
        subtotal,
        overheadAmount,
        totalStudyCost,
        allInPerPatient: budgetData.studyInfo.expectedEnrollment > 0 ? totalStudyCost / budgetData.studyInfo.expectedEnrollment : 0
    };
}

// Update all calculations
function updateAllCalculations() {
    const totals = calculateTotals();
    const symbol = currencySymbols[budgetData.currency];
    
    // Update individual cost displays
    document.querySelectorAll('.cost-display').forEach(display => {
        const costType = display.getAttribute('data-cost');
        if (costType) {
            let value = 0;
            switch(costType) {
                case 'screeningVisit': value = budgetData.perPatientCosts.screeningVisit; break;
                case 'baselineVisit': value = budgetData.perPatientCosts.baselineVisit; break;
                case 'followUpTotal': value = budgetData.perPatientCosts.followUpVisit * budgetData.perPatientCosts.followUpQuantity; break;
                case 'endOfStudyVisit': value = budgetData.perPatientCosts.endOfStudyVisit; break;
                case 'labTests': value = budgetData.perPatientCosts.labTests; break;
                case 'imagingProcedures': value = budgetData.perPatientCosts.imagingProcedures; break;
                case 'patientStipend': value = budgetData.perPatientCosts.patientStipend; break;
                case 'siteInitiation': value = budgetData.fixedCosts.siteInitiation; break;
                case 'siteMonitoring': value = budgetData.fixedCosts.siteMonitoring; break;
                case 'regulatorySubmission': value = budgetData.fixedCosts.regulatorySubmission; break;
                case 'irbFees': value = budgetData.fixedCosts.irbFees; break;
                case 'siteCloseOut': value = budgetData.fixedCosts.siteCloseOut; break;
                case 'dataManagement': value = budgetData.fixedCosts.dataManagement; break;
                case 'statisticalAnalysis': value = budgetData.fixedCosts.statisticalAnalysis; break;
                case 'studyDrugDevice': value = budgetData.equipmentCosts.studyDrugDevice; break;
                case 'laboratorySupplies': value = budgetData.equipmentCosts.laboratorySupplies; break;
                case 'equipmentRental': value = budgetData.equipmentCosts.equipmentRental; break;
                case 'storageCosts': value = budgetData.equipmentCosts.storageCosts; break;
                case 'piTime': value = budgetData.personnelCosts.piTime; break;
                case 'coordinatorTime': value = budgetData.personnelCosts.coordinatorTime; break;
                case 'dataEntryTime': value = budgetData.personnelCosts.dataEntryTime; break;
                case 'otherStaffTime': value = budgetData.personnelCosts.otherStaffTime; break;
            }
            display.textContent = formatCurrency(value);
        }
    });
    
    // Update overhead
    document.getElementById('overheadAmount').textContent = formatCurrency(totals.overheadAmount);
    
    // Update summary
    document.getElementById('totalPerPatient').textContent = formatCurrency(totals.perPatientTotal, false);
    document.getElementById('totalFixed').textContent = formatCurrency(totals.fixedTotal + totals.equipmentTotal + totals.personnelTotal, false);
    document.getElementById('totalStudyCost').textContent = formatCurrency(totals.totalStudyCost, false);
    document.getElementById('allInPerPatient').textContent = formatCurrency(totals.allInPerPatient, false);
    
    // Update breakdown
    document.getElementById('breakdownPerPatient').textContent = formatCurrency(totals.perPatientCostsTotal, false);
    document.getElementById('breakdownFixed').textContent = formatCurrency(totals.fixedTotal, false);
    document.getElementById('breakdownEquipment').textContent = formatCurrency(totals.equipmentTotal, false);
    document.getElementById('breakdownPersonnel').textContent = formatCurrency(totals.personnelTotal, false);
    
    // Update percentages
    if (totals.totalStudyCost > 0) {
        document.getElementById('percentPerPatient').textContent = ((totals.perPatientCostsTotal / totals.totalStudyCost) * 100).toFixed(1) + '%';
        document.getElementById('percentFixed').textContent = ((totals.fixedTotal / totals.totalStudyCost) * 100).toFixed(1) + '%';
        document.getElementById('percentEquipment').textContent = ((totals.equipmentTotal / totals.totalStudyCost) * 100).toFixed(1) + '%';
        document.getElementById('percentPersonnel').textContent = ((totals.personnelTotal / totals.totalStudyCost) * 100).toFixed(1) + '%';
    }
    
    // Update milestones
    updateMilestones(totals.totalStudyCost);
    
    // Update progress
    updateProgress();
    
    // Update chart
    updateBudgetChart(totals);
}

// Format currency
function formatCurrency(amount, includeDecimals = true) {
    const symbol = currencySymbols[budgetData.currency];
    if (includeDecimals) {
        return symbol + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
        return symbol + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}

// Update milestones
function updateMilestones(totalCost) {
    const milestoneAmounts = document.querySelectorAll('.milestone-amount');
    const milestonePercentages = document.querySelectorAll('.milestone-item input[type="number"]');
    
    milestoneAmounts.forEach((amount, index) => {
        if (milestonePercentages[index]) {
            const percentage = parseFloat(milestonePercentages[index].value) || 0;
            const milestoneAmount = totalCost * (percentage / 100);
            amount.textContent = formatCurrency(milestoneAmount);
        }
    });
}

// Add milestone
function addMilestone() {
    const milestoneGrid = document.getElementById('milestoneGrid');
    const milestoneItem = document.createElement('div');
    milestoneItem.className = 'milestone-item';
    milestoneItem.innerHTML = `
        <input type="text" class="form-control" placeholder="Milestone name">
        <input type="number" class="form-control" placeholder="%" min="0" max="100">
        <span class="cost-display milestone-amount">$0.00</span>
        <button class="remove-item-btn" onclick="removeMilestone(this)">Remove</button>
    `;
    milestoneGrid.appendChild(milestoneItem);
    
    // Add event listener to new percentage input
    const percentInput = milestoneItem.querySelector('input[type="number"]');
    percentInput.addEventListener('input', () => updateAllCalculations());
}

// Remove milestone
function removeMilestone(button) {
    if (!confirm('Are you sure you want to delete this milestone? This action cannot be undone.')) {
        return;
    }
    
    button.parentElement.remove();
    updateAllCalculations();
}

// Update progress
function updateProgress() {
    let filledFields = 0;
    let totalFields = 0;
    
    // Check study info
    const studyFields = ['protocolNumber', 'studyTitle', 'principalInvestigator', 'sponsor', 'studyDuration', 'expectedEnrollment'];
    studyFields.forEach(field => {
        totalFields++;
        if (document.getElementById(field).value) filledFields++;
    });
    
    // Check cost fields
    const costFields = document.querySelectorAll('.cost-input');
    costFields.forEach(field => {
        if (field.classList.contains('quantity-input')) return;
        totalFields++;
        if (parseFloat(field.value) > 0) filledFields++;
    });
    
    const progress = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    document.getElementById('progressPercentage').textContent = progress + '%';
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressBar').textContent = progress + '%';
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('clinicalTrialBudget', JSON.stringify(budgetData));
}

// Load from localStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('clinicalTrialBudget');
    if (saved) {
        budgetData = JSON.parse(saved);
        populateForm();
    }
}

// Populate form with data
function populateForm() {
    // Study info
    document.getElementById('protocolNumber').value = budgetData.studyInfo.protocolNumber || '';
    document.getElementById('studyTitle').value = budgetData.studyInfo.studyTitle || '';
    document.getElementById('principalInvestigator').value = budgetData.studyInfo.principalInvestigator || '';
    document.getElementById('sponsor').value = budgetData.studyInfo.sponsor || '';
    document.getElementById('studyDuration').value = budgetData.studyInfo.studyDuration || '';
    document.getElementById('expectedEnrollment').value = budgetData.studyInfo.expectedEnrollment || '';
    
    // Currency
    document.getElementById('currency').value = budgetData.currency || 'USD';
    
    // Per-patient costs
    document.getElementById('screeningVisit').value = budgetData.perPatientCosts.screeningVisit || '';
    document.getElementById('baselineVisit').value = budgetData.perPatientCosts.baselineVisit || '';
    document.getElementById('followUpVisit').value = budgetData.perPatientCosts.followUpVisit || '';
    document.getElementById('followUpQuantity').value = budgetData.perPatientCosts.followUpQuantity || 1;
    document.getElementById('endOfStudyVisit').value = budgetData.perPatientCosts.endOfStudyVisit || '';
    document.getElementById('labTests').value = budgetData.perPatientCosts.labTests || '';
    document.getElementById('imagingProcedures').value = budgetData.perPatientCosts.imagingProcedures || '';
    document.getElementById('patientStipend').value = budgetData.perPatientCosts.patientStipend || '';
    
    // Fixed costs
    document.getElementById('siteInitiation').value = budgetData.fixedCosts.siteInitiation || '';
    document.getElementById('siteMonitoring').value = budgetData.fixedCosts.siteMonitoring || '';
    document.getElementById('regulatorySubmission').value = budgetData.fixedCosts.regulatorySubmission || '';
    document.getElementById('irbFees').value = budgetData.fixedCosts.irbFees || '';
    document.getElementById('siteCloseOut').value = budgetData.fixedCosts.siteCloseOut || '';
    document.getElementById('dataManagement').value = budgetData.fixedCosts.dataManagement || '';
    document.getElementById('statisticalAnalysis').value = budgetData.fixedCosts.statisticalAnalysis || '';
    
    // Equipment costs
    document.getElementById('studyDrugDevice').value = budgetData.equipmentCosts.studyDrugDevice || '';
    document.getElementById('laboratorySupplies').value = budgetData.equipmentCosts.laboratorySupplies || '';
    document.getElementById('equipmentRental').value = budgetData.equipmentCosts.equipmentRental || '';
    document.getElementById('storageCosts').value = budgetData.equipmentCosts.storageCosts || '';
    
    // Personnel costs
    document.getElementById('piTime').value = budgetData.personnelCosts.piTime || '';
    document.getElementById('coordinatorTime').value = budgetData.personnelCosts.coordinatorTime || '';
    document.getElementById('dataEntryTime').value = budgetData.personnelCosts.dataEntryTime || '';
    document.getElementById('otherStaffTime').value = budgetData.personnelCosts.otherStaffTime || '';
    
    // Overhead
    document.getElementById('overheadPercentage').value = budgetData.overheadPercentage || '';
    
    // Notes
    document.getElementById('perPatientNotes').value = budgetData.notes.perPatient || '';
    document.getElementById('fixedNotes').value = budgetData.notes.fixed || '';
    document.getElementById('equipmentNotes').value = budgetData.notes.equipment || '';
    document.getElementById('personnelNotes').value = budgetData.notes.personnel || '';
    document.getElementById('generalNotes').value = budgetData.notes.general || '';
    
    // Custom items
    renderCustomItems('perPatient', budgetData.perPatientCosts.customItems);
    renderCustomItems('fixed', budgetData.fixedCosts.customItems);
    renderCustomItems('equipment', budgetData.equipmentCosts.customItems);
    renderCustomItems('personnel', budgetData.personnelCosts.customItems);
}

// Save budget to file
function saveBudget() {
    const dataStr = JSON.stringify(budgetData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clinical_trial_budget_${budgetData.studyInfo.protocolNumber || 'draft'}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Load budget from file
function loadBudget() {
    document.getElementById('fileInput').click();
}

// Load from file
function loadFromFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                budgetData = JSON.parse(e.target.result);
                populateForm();
                updateAllCalculations();
                saveToLocalStorage();
                alert('Budget loaded successfully!');
            } catch (error) {
                alert('Error loading file. Please ensure it is a valid budget file.');
            }
        };
        reader.readAsText(file);
    }
}

// Export to PDF
function exportToPDF() {
    window.print();
}

// Export to Excel
function exportToExcel() {
    const totals = calculateTotals();
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Study Information Sheet
    const studyData = [
        ['Clinical Trial Budget Report'],
        ['Generated on:', new Date().toLocaleDateString()],
        [''],
        ['Study Information'],
        ['Protocol Number:', budgetData.studyInfo.protocolNumber],
        ['Study Title:', budgetData.studyInfo.studyTitle],
        ['Principal Investigator:', budgetData.studyInfo.principalInvestigator],
        ['Sponsor:', budgetData.studyInfo.sponsor],
        ['Study Duration (months):', budgetData.studyInfo.studyDuration],
        ['Expected Enrollment:', budgetData.studyInfo.expectedEnrollment],
        ['Currency:', budgetData.currency]
    ];
    const studySheet = XLSX.utils.aoa_to_sheet(studyData);
    XLSX.utils.book_append_sheet(wb, studySheet, 'Study Info');
    
    // Detailed Costs Sheet
    const costData = [
        ['Cost Category', 'Item', 'Unit Cost', 'Quantity', 'Total'],
        [''],
        ['Per-Patient Costs'],
        ['', 'Screening Visit', budgetData.perPatientCosts.screeningVisit, 1, budgetData.perPatientCosts.screeningVisit],
        ['', 'Baseline Visit', budgetData.perPatientCosts.baselineVisit, 1, budgetData.perPatientCosts.baselineVisit],
        ['', 'Follow-up Visit', budgetData.perPatientCosts.followUpVisit, budgetData.perPatientCosts.followUpQuantity, budgetData.perPatientCosts.followUpVisit * budgetData.perPatientCosts.followUpQuantity],
        ['', 'End of Study Visit', budgetData.perPatientCosts.endOfStudyVisit, 1, budgetData.perPatientCosts.endOfStudyVisit],
        ['', 'Laboratory Tests', budgetData.perPatientCosts.labTests, 1, budgetData.perPatientCosts.labTests],
        ['', 'Imaging Procedures', budgetData.perPatientCosts.imagingProcedures, 1, budgetData.perPatientCosts.imagingProcedures],
        ['', 'Patient Stipend', budgetData.perPatientCosts.patientStipend, 1, budgetData.perPatientCosts.patientStipend]
    ];
    
    // Add custom per-patient items
    budgetData.perPatientCosts.customItems.forEach(item => {
        costData.push(['', item.name, item.cost, 1, item.cost]);
    });
    
    costData.push(['', 'Subtotal Per Patient', '', '', totals.perPatientTotal]);
    costData.push(['']);
    
    // Fixed costs
    costData.push(['Fixed Study Costs']);
    costData.push(['', 'Site Initiation', budgetData.fixedCosts.siteInitiation, 1, budgetData.fixedCosts.siteInitiation]);
    costData.push(['', 'Site Monitoring', budgetData.fixedCosts.siteMonitoring, 1, budgetData.fixedCosts.siteMonitoring]);
    costData.push(['', 'Regulatory Submission', budgetData.fixedCosts.regulatorySubmission, 1, budgetData.fixedCosts.regulatorySubmission]);
    costData.push(['', 'IRB/REB Fees', budgetData.fixedCosts.irbFees, 1, budgetData.fixedCosts.irbFees]);
    costData.push(['', 'Site Close-out', budgetData.fixedCosts.siteCloseOut, 1, budgetData.fixedCosts.siteCloseOut]);
    costData.push(['', 'Data Management', budgetData.fixedCosts.dataManagement, 1, budgetData.fixedCosts.dataManagement]);
    costData.push(['', 'Statistical Analysis', budgetData.fixedCosts.statisticalAnalysis, 1, budgetData.fixedCosts.statisticalAnalysis]);
    
    // Add custom fixed items
    budgetData.fixedCosts.customItems.forEach(item => {
        costData.push(['', item.name, item.cost, 1, item.cost]);
    });
    
    costData.push(['', 'Subtotal Fixed Costs', '', '', totals.fixedTotal]);
    costData.push(['']);
    
    // Equipment costs
    costData.push(['Equipment & Supply Costs']);
    costData.push(['', 'Study Drug/Device', budgetData.equipmentCosts.studyDrugDevice, 1, budgetData.equipmentCosts.studyDrugDevice]);
    costData.push(['', 'Laboratory Supplies', budgetData.equipmentCosts.laboratorySupplies, 1, budgetData.equipmentCosts.laboratorySupplies]);
    costData.push(['', 'Equipment Rental', budgetData.equipmentCosts.equipmentRental, 1, budgetData.equipmentCosts.equipmentRental]);
    costData.push(['', 'Storage Costs', budgetData.equipmentCosts.storageCosts, 1, budgetData.equipmentCosts.storageCosts]);
    
    // Add custom equipment items
    budgetData.equipmentCosts.customItems.forEach(item => {
        costData.push(['', item.name, item.cost, 1, item.cost]);
    });
    
    costData.push(['', 'Subtotal Equipment', '', '', totals.equipmentTotal]);
    costData.push(['']);
    
    // Personnel costs
    costData.push(['Personnel Costs']);
    costData.push(['', 'Principal Investigator', budgetData.personnelCosts.piTime, 1, budgetData.personnelCosts.piTime]);
    costData.push(['', 'Research Coordinator', budgetData.personnelCosts.coordinatorTime, 1, budgetData.personnelCosts.coordinatorTime]);
    costData.push(['', 'Data Entry Personnel', budgetData.personnelCosts.dataEntryTime, 1, budgetData.personnelCosts.dataEntryTime]);
    costData.push(['', 'Other Study Staff', budgetData.personnelCosts.otherStaffTime, 1, budgetData.personnelCosts.otherStaffTime]);
    
    // Add custom personnel items
    budgetData.personnelCosts.customItems.forEach(item => {
        costData.push(['', item.name, item.cost, 1, item.cost]);
    });
    
    costData.push(['', 'Subtotal Personnel', '', '', totals.personnelTotal]);
    
    const costSheet = XLSX.utils.aoa_to_sheet(costData);
    XLSX.utils.book_append_sheet(wb, costSheet, 'Detailed Costs');
    
    // Summary Sheet
    const summaryData = [
        ['Budget Summary'],
        [''],
        ['Total Per-Patient Cost:', totals.perPatientTotal],
        ['Number of Patients:', budgetData.studyInfo.expectedEnrollment],
        ['Total Patient Costs:', totals.perPatientCostsTotal],
        [''],
        ['Total Fixed Costs:', totals.fixedTotal],
        ['Total Equipment Costs:', totals.equipmentTotal],
        ['Total Personnel Costs:', totals.personnelTotal],
        [''],
        ['Subtotal:', totals.subtotal],
        ['Overhead (' + budgetData.overheadPercentage + '%):', totals.overheadAmount],
        [''],
        ['TOTAL STUDY COST:', totals.totalStudyCost],
        ['Cost Per Patient (All-in):', totals.allInPerPatient]
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    
    // Save file
    XLSX.writeFile(wb, `clinical_trial_budget_${budgetData.studyInfo.protocolNumber || 'draft'}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Export to CSV
function exportToCSV() {
    const totals = calculateTotals();
    
    let csv = 'Clinical Trial Budget Report\n';
    csv += `Generated on,${new Date().toLocaleDateString()}\n\n`;
    
    csv += 'Study Information\n';
    csv += 'Field,Value\n';
    csv += `Protocol Number,${budgetData.studyInfo.protocolNumber}\n`;
    csv += `Study Title,${budgetData.studyInfo.studyTitle}\n`;
    csv += `Principal Investigator,${budgetData.studyInfo.principalInvestigator}\n`;
    csv += `Sponsor,${budgetData.studyInfo.sponsor}\n`;
    csv += `Study Duration (months),${budgetData.studyInfo.studyDuration}\n`;
    csv += `Expected Enrollment,${budgetData.studyInfo.expectedEnrollment}\n`;
    csv += `Currency,${budgetData.currency}\n\n`;
    
    csv += 'Cost Breakdown\n';
    csv += 'Category,Item,Unit Cost,Quantity,Date,Total\n';
    
    // Per-patient costs
    csv += `Per-Patient Costs,Screening Visit,${budgetData.perPatientCosts.screeningVisit},1,,${budgetData.perPatientCosts.screeningVisit}\n`;
    csv += `Per-Patient Costs,Baseline Visit,${budgetData.perPatientCosts.baselineVisit},1,,${budgetData.perPatientCosts.baselineVisit}\n`;
    csv += `Per-Patient Costs,Follow-up Visit,${budgetData.perPatientCosts.followUpVisit},${budgetData.perPatientCosts.followUpQuantity},,${budgetData.perPatientCosts.followUpVisit * budgetData.perPatientCosts.followUpQuantity}\n`;
    csv += `Per-Patient Costs,End of Study Visit,${budgetData.perPatientCosts.endOfStudyVisit},1,,${budgetData.perPatientCosts.endOfStudyVisit}\n`;
    csv += `Per-Patient Costs,Laboratory Tests,${budgetData.perPatientCosts.labTests},1,,${budgetData.perPatientCosts.labTests}\n`;
    csv += `Per-Patient Costs,Imaging Procedures,${budgetData.perPatientCosts.imagingProcedures},1,,${budgetData.perPatientCosts.imagingProcedures}\n`;
    csv += `Per-Patient Costs,Patient Stipend,${budgetData.perPatientCosts.patientStipend},1,,${budgetData.perPatientCosts.patientStipend}\n`;
    
    // Custom per-patient items
    budgetData.perPatientCosts.customItems.forEach(item => {
        csv += `Per-Patient Costs,"${item.name}",${item.cost},1,${item.date || ''},${item.cost}\n`;
    });
    
    // Fixed costs
    csv += `Fixed Costs,Site Initiation,${budgetData.fixedCosts.siteInitiation},1,,${budgetData.fixedCosts.siteInitiation}\n`;
    csv += `Fixed Costs,Site Monitoring,${budgetData.fixedCosts.siteMonitoring},1,,${budgetData.fixedCosts.siteMonitoring}\n`;
    csv += `Fixed Costs,Regulatory Submission,${budgetData.fixedCosts.regulatorySubmission},1,,${budgetData.fixedCosts.regulatorySubmission}\n`;
    csv += `Fixed Costs,IRB/REB Fees,${budgetData.fixedCosts.irbFees},1,,${budgetData.fixedCosts.irbFees}\n`;
    csv += `Fixed Costs,Site Close-out,${budgetData.fixedCosts.siteCloseOut},1,,${budgetData.fixedCosts.siteCloseOut}\n`;
    csv += `Fixed Costs,Data Management,${budgetData.fixedCosts.dataManagement},1,,${budgetData.fixedCosts.dataManagement}\n`;
    csv += `Fixed Costs,Statistical Analysis,${budgetData.fixedCosts.statisticalAnalysis},1,,${budgetData.fixedCosts.statisticalAnalysis}\n`;
    
    // Custom fixed items
    budgetData.fixedCosts.customItems.forEach(item => {
        csv += `Fixed Costs,"${item.name}",${item.cost},1,${item.date || ''},${item.cost}\n`;
    });
    
    // Equipment costs
    csv += `Equipment & Supplies,Study Drug/Device,${budgetData.equipmentCosts.studyDrugDevice},1,,${budgetData.equipmentCosts.studyDrugDevice}\n`;
    csv += `Equipment & Supplies,Laboratory Supplies,${budgetData.equipmentCosts.laboratorySupplies},1,,${budgetData.equipmentCosts.laboratorySupplies}\n`;
    csv += `Equipment & Supplies,Equipment Rental,${budgetData.equipmentCosts.equipmentRental},1,,${budgetData.equipmentCosts.equipmentRental}\n`;
    csv += `Equipment & Supplies,Storage Costs,${budgetData.equipmentCosts.storageCosts},1,,${budgetData.equipmentCosts.storageCosts}\n`;
    
    // Custom equipment items
    budgetData.equipmentCosts.customItems.forEach(item => {
        csv += `Equipment & Supplies,"${item.name}",${item.cost},1,${item.date || ''},${item.cost}\n`;
    });
    
    // Personnel costs
    csv += `Personnel,Principal Investigator,${budgetData.personnelCosts.piTime},1,,${budgetData.personnelCosts.piTime}\n`;
    csv += `Personnel,Research Coordinator,${budgetData.personnelCosts.coordinatorTime},1,,${budgetData.personnelCosts.coordinatorTime}\n`;
    csv += `Personnel,Data Entry Personnel,${budgetData.personnelCosts.dataEntryTime},1,,${budgetData.personnelCosts.dataEntryTime}\n`;
    csv += `Personnel,Other Study Staff,${budgetData.personnelCosts.otherStaffTime},1,,${budgetData.personnelCosts.otherStaffTime}\n`;
    
    // Custom personnel items
    budgetData.personnelCosts.customItems.forEach(item => {
        csv += `Personnel,"${item.name}",${item.cost},1,${item.date || ''},${item.cost}\n`;
    });
    
    csv += '\nSummary\n';
    csv += 'Category,Amount\n';
    csv += `Total Per-Patient Cost,${totals.perPatientTotal}\n`;
    csv += `Number of Patients,${budgetData.studyInfo.expectedEnrollment}\n`;
    csv += `Total Patient Costs,${totals.perPatientCostsTotal}\n`;
    csv += `Total Fixed Costs,${totals.fixedTotal}\n`;
    csv += `Total Equipment Costs,${totals.equipmentTotal}\n`;
    csv += `Total Personnel Costs,${totals.personnelTotal}\n`;
    csv += `Subtotal,${totals.subtotal}\n`;
    csv += `Overhead (${budgetData.overheadPercentage}%),${totals.overheadAmount}\n`;
    csv += `TOTAL STUDY COST,${totals.totalStudyCost}\n`;
    csv += `Cost Per Patient (All-in),${totals.allInPerPatient}\n`;
    
    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clinical_trial_budget_${budgetData.studyInfo.protocolNumber || 'draft'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

// Export to Text
function exportToText() {
    const totals = calculateTotals();
    const symbol = currencySymbols[budgetData.currency];
    
    let text = 'CLINICAL TRIAL BUDGET REPORT\n';
    text += '============================\n\n';
    text += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    
    text += 'STUDY INFORMATION\n';
    text += '-----------------\n';
    text += `Protocol Number: ${budgetData.studyInfo.protocolNumber}\n`;
    text += `Study Title: ${budgetData.studyInfo.studyTitle}\n`;
    text += `Principal Investigator: ${budgetData.studyInfo.principalInvestigator}\n`;
    text += `Sponsor: ${budgetData.studyInfo.sponsor}\n`;
    text += `Study Duration: ${budgetData.studyInfo.studyDuration} months\n`;
    text += `Expected Enrollment: ${budgetData.studyInfo.expectedEnrollment} patients\n`;
    text += `Currency: ${budgetData.currency}\n\n`;
    
    text += 'COST SUMMARY\n';
    text += '------------\n';
    text += `Total Per-Patient Cost: ${formatCurrency(totals.perPatientTotal)}\n`;
    text += `Total Patient Costs (${budgetData.studyInfo.expectedEnrollment} patients): ${formatCurrency(totals.perPatientCostsTotal)}\n`;
    text += `Total Fixed Costs: ${formatCurrency(totals.fixedTotal)}\n`;
    text += `Total Equipment Costs: ${formatCurrency(totals.equipmentTotal)}\n`;
    text += `Total Personnel Costs: ${formatCurrency(totals.personnelTotal)}\n`;
    text += `Subtotal: ${formatCurrency(totals.subtotal)}\n`;
    text += `Overhead (${budgetData.overheadPercentage}%): ${formatCurrency(totals.overheadAmount)}\n`;
    text += `TOTAL STUDY COST: ${formatCurrency(totals.totalStudyCost)}\n`;
    text += `Cost Per Patient (All-in): ${formatCurrency(totals.allInPerPatient)}\n\n`;
    
    if (budgetData.notes.general) {
        text += 'GENERAL NOTES\n';
        text += '-------------\n';
        text += budgetData.notes.general + '\n';
    }
    
    // Create and download file
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clinical_trial_budget_${budgetData.studyInfo.protocolNumber || 'draft'}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
}

// Print budget
function printBudget() {
    window.print();
}

// Clear all data
function clearAll() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        // Reset budget data
        budgetData = {
            studyInfo: {
                protocolNumber: '',
                studyTitle: '',
                principalInvestigator: '',
                sponsor: '',
                studyDuration: 0,
                expectedEnrollment: 0
            },
            currency: 'USD',
            perPatientCosts: {
                screeningVisit: 0,
                baselineVisit: 0,
                followUpVisit: 0,
                followUpQuantity: 1,
                endOfStudyVisit: 0,
                labTests: 0,
                imagingProcedures: 0,
                patientStipend: 0,
                customItems: []
            },
            fixedCosts: {
                siteInitiation: 0,
                siteMonitoring: 0,
                regulatorySubmission: 0,
                irbFees: 0,
                siteCloseOut: 0,
                dataManagement: 0,
                statisticalAnalysis: 0,
                customItems: []
            },
            equipmentCosts: {
                studyDrugDevice: 0,
                laboratorySupplies: 0,
                equipmentRental: 0,
                storageCosts: 0,
                customItems: []
            },
            personnelCosts: {
                piTime: 0,
                coordinatorTime: 0,
                dataEntryTime: 0,
                otherStaffTime: 0,
                customItems: []
            },
            overheadPercentage: 0,
            milestones: [
                { name: 'Site Initiation', percentage: 25 },
                { name: '50% Enrollment', percentage: 50 },
                { name: 'Study Completion', percentage: 25 }
            ],
            notes: {
                perPatient: '',
                fixed: '',
                equipment: '',
                personnel: '',
                general: ''
            }
        };
        
        // Clear form
        document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(input => {
            if (input.id !== 'followUpQuantity') {
                input.value = '';
            }
        });
        document.getElementById('followUpQuantity').value = 1;
        document.getElementById('currency').value = 'USD';
        
        // Clear custom items
        document.getElementById('perPatientCustomList').innerHTML = '';
        document.getElementById('fixedCustomList').innerHTML = '';
        document.getElementById('equipmentCustomList').innerHTML = '';
        document.getElementById('personnelCustomList').innerHTML = '';
        
        // Reset milestones
        const milestoneGrid = document.getElementById('milestoneGrid');
        milestoneGrid.innerHTML = `
            <div class="milestone-item">
                <input type="text" class="form-control" placeholder="Site Initiation" value="Site Initiation">
                <input type="number" class="form-control" placeholder="%" value="25" min="0" max="100">
                <span class="cost-display milestone-amount">$0.00</span>
                <button class="remove-item-btn" onclick="removeMilestone(this)">Remove</button>
            </div>
            <div class="milestone-item">
                <input type="text" class="form-control" placeholder="50% Enrollment" value="50% Enrollment">
                <input type="number" class="form-control" placeholder="%" value="50" min="0" max="100">
                <span class="cost-display milestone-amount">$0.00</span>
                <button class="remove-item-btn" onclick="removeMilestone(this)">Remove</button>
            </div>
            <div class="milestone-item">
                <input type="text" class="form-control" placeholder="Study Completion" value="Study Completion">
                <input type="number" class="form-control" placeholder="%" value="25" min="0" max="100">
                <span class="cost-display milestone-amount">$0.00</span>
                <button class="remove-item-btn" onclick="removeMilestone(this)">Remove</button>
            </div>
        `;
        
        // Update calculations and save
        updateAllCalculations();
        localStorage.removeItem('clinicalTrialBudget');
    }
}

// Filter budget items by category
function filterBudgetItems() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const budgetSections = document.querySelectorAll('.budget-section');
    
    budgetSections.forEach(section => {
        const sectionTitle = section.querySelector('h2').textContent.toLowerCase();
        let shouldShow = selectedCategory === 'all';
        
        if (!shouldShow) {
            switch (selectedCategory) {
                case 'perPatient':
                    shouldShow = sectionTitle.includes('per-patient');
                    break;
                case 'fixed':
                    shouldShow = sectionTitle.includes('fixed');
                    break;
                case 'equipment':
                    shouldShow = sectionTitle.includes('equipment');
                    break;
                case 'personnel':
                    shouldShow = sectionTitle.includes('personnel');
                    break;
            }
        }
        
        section.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Always show study information, summary, and breakdown sections
    const alwaysShowSections = ['study information', 'budget summary', 'cost breakdown', 'invoice schedule', 'tax & overhead', 'general notes'];
    budgetSections.forEach(section => {
        const sectionTitle = section.querySelector('h2').textContent.toLowerCase();
        if (alwaysShowSections.some(title => sectionTitle.includes(title))) {
            section.style.display = 'block';
        }
    });
}

// Sort budget items
function sortBudgetItems() {
    const sortBy = document.getElementById('sortBy').value;
    const customLists = document.querySelectorAll('[id$="CustomList"]');
    
    customLists.forEach(list => {
        const items = Array.from(list.children);
        const category = list.id.replace('CustomList', '');
        let itemsData;
        
        switch (category) {
            case 'perPatient':
                itemsData = budgetData.perPatientCosts.customItems;
                break;
            case 'fixed':
                itemsData = budgetData.fixedCosts.customItems;
                break;
            case 'equipment':
                itemsData = budgetData.equipmentCosts.customItems;
                break;
            case 'personnel':
                itemsData = budgetData.personnelCosts.customItems;
                break;
            default:
                return;
        }
        
        // Sort the data
        itemsData.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'amount-desc':
                    return b.cost - a.cost;
                case 'amount-asc':
                    return a.cost - b.cost;
                case 'date-desc':
                    return new Date(b.date || 0) - new Date(a.date || 0);
                case 'date-asc':
                    return new Date(a.date || 0) - new Date(b.date || 0);
                default:
                    return 0;
            }
        });
        
        // Re-render the sorted items
        renderCustomItems(category, itemsData);
    });
}

// Initialize budget chart
function initializeBudgetChart() {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    budgetChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Per-Patient Costs', 'Fixed Study Costs', 'Equipment & Supplies', 'Personnel'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: [
                    '#2563eb', // Blue
                    '#dc2626', // Red
                    '#16a34a', // Green
                    '#ea580c'  // Orange
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label;
                            const value = formatCurrency(context.raw, false);
                            const percentage = ((context.raw / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Update budget chart
function updateBudgetChart(totals) {
    if (budgetChart && totals.totalStudyCost > 0) {
        const data = [
            totals.perPatientCostsTotal,
            totals.fixedTotal,
            totals.equipmentTotal,
            totals.personnelTotal
        ];
        
        budgetChart.data.datasets[0].data = data;
        budgetChart.update();
    }
}

// Modal functions
function closeModal() {
    document.getElementById('exportModal').style.display = 'none';
}
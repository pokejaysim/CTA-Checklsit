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
        defaultItems: [
            { id: 'screeningVisit', name: 'Screening Visit', cost: 0, quantity: 1 },
            { id: 'baselineVisit', name: 'Baseline Visit', cost: 0, quantity: 1 },
            { id: 'followUpVisit', name: 'Follow-up Visit', cost: 0, quantity: 1 },
            { id: 'endOfStudyVisit', name: 'End of Study Visit', cost: 0, quantity: 1 },
            { id: 'labTests', name: 'Laboratory Tests', cost: 0, quantity: 1 },
            { id: 'imagingProcedures', name: 'Imaging Procedures', cost: 0, quantity: 1 },
            { id: 'patientStipend', name: 'Patient Stipend/Compensation', cost: 0, quantity: 1 }
        ],
        customItems: []
    },
    fixedCosts: {
        defaultItems: [
            { id: 'siteInitiation', name: 'Site Initiation Fee', cost: 0, quantity: 1 },
            { id: 'siteMonitoring', name: 'Site Monitoring Fees', cost: 0, quantity: 1 },
            { id: 'regulatorySubmission', name: 'Regulatory Submission Fees', cost: 0, quantity: 1 },
            { id: 'irbFees', name: 'IRB/REB Fees', cost: 0, quantity: 1 },
            { id: 'siteCloseOut', name: 'Site Close-out Fee', cost: 0, quantity: 1 },
            { id: 'dataManagement', name: 'Data Management Fees', cost: 0, quantity: 1 },
            { id: 'statisticalAnalysis', name: 'Statistical Analysis Fees', cost: 0, quantity: 1 }
        ],
        customItems: []
    },
    equipmentCosts: {
        defaultItems: [
            { id: 'studyDrugDevice', name: 'Study Drug/Device Costs', cost: 0, quantity: 1 },
            { id: 'laboratorySupplies', name: 'Laboratory Supplies', cost: 0, quantity: 1 },
            { id: 'equipmentRental', name: 'Medical Equipment Rental', cost: 0, quantity: 1 },
            { id: 'storageCosts', name: 'Storage Costs', cost: 0, quantity: 1 }
        ],
        customItems: []
    },
    personnelCosts: {
        defaultItems: [
            { id: 'piTime', name: 'Principal Investigator Time', cost: 0, quantity: 1 },
            { id: 'coordinatorTime', name: 'Research Coordinator Time', cost: 0, quantity: 1 },
            { id: 'dataEntryTime', name: 'Data Entry Personnel', cost: 0, quantity: 1 },
            { id: 'otherStaffTime', name: 'Other Study Staff', cost: 0, quantity: 1 }
        ],
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
    renderAllDefaultItems();
    updateAllCalculations();
    initializeBudgetChart();
    initializeTOC();
    initializeCollapsibleSections();
    setupRealTimeCalculations();
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
    
    // Cost inputs are now handled dynamically in renderDefaultItems
    
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

// This function is no longer needed as we handle updates in updateDefaultItem

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

// Render all default items
function renderAllDefaultItems() {
    renderDefaultItems('perPatient', budgetData.perPatientCosts.defaultItems);
    renderDefaultItems('fixed', budgetData.fixedCosts.defaultItems);
    renderDefaultItems('equipment', budgetData.equipmentCosts.defaultItems);
    renderDefaultItems('personnel', budgetData.personnelCosts.defaultItems);
}

// Render default items
function renderDefaultItems(category, items) {
    const container = document.getElementById(`${category}DefaultItems`);
    container.innerHTML = '';
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cost-item';
        
        let quantityInput = '';
        if (item.id === 'followUpVisit') {
            quantityInput = `<input type="number" id="${item.id}Quantity" class="cost-input quantity-input" placeholder="Qty" min="0" value="${item.quantity}" onchange="updateDefaultItem('${category}', '${item.id}', 'quantity', this.value)">`;
        }
        
        div.innerHTML = `
            <label>${item.name}</label>
            <input type="number" id="${item.id}" class="cost-input" placeholder="0.00" value="${item.cost || ''}" step="0.01" min="0" onchange="updateDefaultItem('${category}', '${item.id}', 'cost', this.value)">
            ${quantityInput}
            <span class="cost-display">${formatCurrency(item.cost * item.quantity)}</span>
            <button class="remove-item-btn" onclick="removeDefaultItem('${category}', '${item.id}')">Remove</button>
        `;
        container.appendChild(div);
    });
}

// Update default item
function updateDefaultItem(category, id, field, value) {
    let items;
    switch(category) {
        case 'perPatient':
            items = budgetData.perPatientCosts.defaultItems;
            break;
        case 'fixed':
            items = budgetData.fixedCosts.defaultItems;
            break;
        case 'equipment':
            items = budgetData.equipmentCosts.defaultItems;
            break;
        case 'personnel':
            items = budgetData.personnelCosts.defaultItems;
            break;
    }
    
    const item = items.find(i => i.id === id);
    if (item) {
        if (field === 'cost') {
            item.cost = parseFloat(value) || 0;
        } else if (field === 'quantity') {
            item.quantity = parseInt(value) || 1;
        }
    }
    
    renderDefaultItems(category, items);
    updateAllCalculations();
    saveToLocalStorage();
}

// Remove default item
function removeDefaultItem(category, id) {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        return;
    }
    
    switch(category) {
        case 'perPatient':
            budgetData.perPatientCosts.defaultItems = budgetData.perPatientCosts.defaultItems.filter(i => i.id !== id);
            renderDefaultItems('perPatient', budgetData.perPatientCosts.defaultItems);
            break;
        case 'fixed':
            budgetData.fixedCosts.defaultItems = budgetData.fixedCosts.defaultItems.filter(i => i.id !== id);
            renderDefaultItems('fixed', budgetData.fixedCosts.defaultItems);
            break;
        case 'equipment':
            budgetData.equipmentCosts.defaultItems = budgetData.equipmentCosts.defaultItems.filter(i => i.id !== id);
            renderDefaultItems('equipment', budgetData.equipmentCosts.defaultItems);
            break;
        case 'personnel':
            budgetData.personnelCosts.defaultItems = budgetData.personnelCosts.defaultItems.filter(i => i.id !== id);
            renderDefaultItems('personnel', budgetData.personnelCosts.defaultItems);
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
        budgetData.perPatientCosts.defaultItems.reduce((sum, item) => sum + (item.cost * item.quantity), 0) +
        budgetData.perPatientCosts.customItems.reduce((sum, item) => sum + item.cost, 0);
    
    // Fixed total
    const fixedTotal = 
        budgetData.fixedCosts.defaultItems.reduce((sum, item) => sum + (item.cost * item.quantity), 0) +
        budgetData.fixedCosts.customItems.reduce((sum, item) => sum + item.cost, 0);
    
    // Equipment total
    const equipmentTotal = 
        budgetData.equipmentCosts.defaultItems.reduce((sum, item) => sum + (item.cost * item.quantity), 0) +
        budgetData.equipmentCosts.customItems.reduce((sum, item) => sum + item.cost, 0);
    
    // Personnel total
    const personnelTotal = 
        budgetData.personnelCosts.defaultItems.reduce((sum, item) => sum + (item.cost * item.quantity), 0) +
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
    
    // Cost displays are now updated in renderDefaultItems
    
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
        migrateOldDataStructure();
        populateForm();
    }
}

// Migrate old data structure to new format
function migrateOldDataStructure() {
    // Check if we have old structure and migrate to new
    if (budgetData.perPatientCosts && !budgetData.perPatientCosts.defaultItems) {
        const oldData = { ...budgetData };
        
        // Migrate per-patient costs
        budgetData.perPatientCosts = {
            defaultItems: [
                { id: 'screeningVisit', name: 'Screening Visit', cost: oldData.perPatientCosts.screeningVisit || 0, quantity: 1 },
                { id: 'baselineVisit', name: 'Baseline Visit', cost: oldData.perPatientCosts.baselineVisit || 0, quantity: 1 },
                { id: 'followUpVisit', name: 'Follow-up Visit', cost: oldData.perPatientCosts.followUpVisit || 0, quantity: oldData.perPatientCosts.followUpQuantity || 1 },
                { id: 'endOfStudyVisit', name: 'End of Study Visit', cost: oldData.perPatientCosts.endOfStudyVisit || 0, quantity: 1 },
                { id: 'labTests', name: 'Laboratory Tests', cost: oldData.perPatientCosts.labTests || 0, quantity: 1 },
                { id: 'imagingProcedures', name: 'Imaging Procedures', cost: oldData.perPatientCosts.imagingProcedures || 0, quantity: 1 },
                { id: 'patientStipend', name: 'Patient Stipend/Compensation', cost: oldData.perPatientCosts.patientStipend || 0, quantity: 1 }
            ],
            customItems: oldData.perPatientCosts.customItems || []
        };
        
        // Migrate fixed costs
        budgetData.fixedCosts = {
            defaultItems: [
                { id: 'siteInitiation', name: 'Site Initiation Fee', cost: oldData.fixedCosts.siteInitiation || 0, quantity: 1 },
                { id: 'siteMonitoring', name: 'Site Monitoring Fees', cost: oldData.fixedCosts.siteMonitoring || 0, quantity: 1 },
                { id: 'regulatorySubmission', name: 'Regulatory Submission Fees', cost: oldData.fixedCosts.regulatorySubmission || 0, quantity: 1 },
                { id: 'irbFees', name: 'IRB/REB Fees', cost: oldData.fixedCosts.irbFees || 0, quantity: 1 },
                { id: 'siteCloseOut', name: 'Site Close-out Fee', cost: oldData.fixedCosts.siteCloseOut || 0, quantity: 1 },
                { id: 'dataManagement', name: 'Data Management Fees', cost: oldData.fixedCosts.dataManagement || 0, quantity: 1 },
                { id: 'statisticalAnalysis', name: 'Statistical Analysis Fees', cost: oldData.fixedCosts.statisticalAnalysis || 0, quantity: 1 }
            ],
            customItems: oldData.fixedCosts.customItems || []
        };
        
        // Migrate equipment costs
        budgetData.equipmentCosts = {
            defaultItems: [
                { id: 'studyDrugDevice', name: 'Study Drug/Device Costs', cost: oldData.equipmentCosts.studyDrugDevice || 0, quantity: 1 },
                { id: 'laboratorySupplies', name: 'Laboratory Supplies', cost: oldData.equipmentCosts.laboratorySupplies || 0, quantity: 1 },
                { id: 'equipmentRental', name: 'Medical Equipment Rental', cost: oldData.equipmentCosts.equipmentRental || 0, quantity: 1 },
                { id: 'storageCosts', name: 'Storage Costs', cost: oldData.equipmentCosts.storageCosts || 0, quantity: 1 }
            ],
            customItems: oldData.equipmentCosts.customItems || []
        };
        
        // Migrate personnel costs
        budgetData.personnelCosts = {
            defaultItems: [
                { id: 'piTime', name: 'Principal Investigator Time', cost: oldData.personnelCosts.piTime || 0, quantity: 1 },
                { id: 'coordinatorTime', name: 'Research Coordinator Time', cost: oldData.personnelCosts.coordinatorTime || 0, quantity: 1 },
                { id: 'dataEntryTime', name: 'Data Entry Personnel', cost: oldData.personnelCosts.dataEntryTime || 0, quantity: 1 },
                { id: 'otherStaffTime', name: 'Other Study Staff', cost: oldData.personnelCosts.otherStaffTime || 0, quantity: 1 }
            ],
            customItems: oldData.personnelCosts.customItems || []
        };
        
        // Save the migrated data
        saveToLocalStorage();
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
    
    // Overhead
    document.getElementById('overheadPercentage').value = budgetData.overheadPercentage || '';
    
    // Notes
    document.getElementById('perPatientNotes').value = budgetData.notes.perPatient || '';
    document.getElementById('fixedNotes').value = budgetData.notes.fixed || '';
    document.getElementById('equipmentNotes').value = budgetData.notes.equipment || '';
    document.getElementById('personnelNotes').value = budgetData.notes.personnel || '';
    document.getElementById('generalNotes').value = budgetData.notes.general || '';
    
    // Render all items
    renderAllDefaultItems();
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
    budgetData.perPatientCosts.defaultItems.forEach(item => {
        csv += `Per-Patient Costs,"${item.name}",${item.cost},${item.quantity},,${item.cost * item.quantity}\n`;
    });
    
    // Custom per-patient items
    budgetData.perPatientCosts.customItems.forEach(item => {
        csv += `Per-Patient Costs,"${item.name}",${item.cost},1,${item.date || ''},${item.cost}\n`;
    });
    
    // Fixed costs
    budgetData.fixedCosts.defaultItems.forEach(item => {
        csv += `Fixed Costs,"${item.name}",${item.cost},${item.quantity},,${item.cost * item.quantity}\n`;
    });
    
    // Custom fixed items
    budgetData.fixedCosts.customItems.forEach(item => {
        csv += `Fixed Costs,"${item.name}",${item.cost},1,${item.date || ''},${item.cost}\n`;
    });
    
    // Equipment costs
    budgetData.equipmentCosts.defaultItems.forEach(item => {
        csv += `Equipment & Supplies,"${item.name}",${item.cost},${item.quantity},,${item.cost * item.quantity}\n`;
    });
    
    // Custom equipment items
    budgetData.equipmentCosts.customItems.forEach(item => {
        csv += `Equipment & Supplies,"${item.name}",${item.cost},1,${item.date || ''},${item.cost}\n`;
    });
    
    // Personnel costs
    budgetData.personnelCosts.defaultItems.forEach(item => {
        csv += `Personnel,"${item.name}",${item.cost},${item.quantity},,${item.cost * item.quantity}\n`;
    });
    
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
                defaultItems: [
                    { id: 'screeningVisit', name: 'Screening Visit', cost: 0, quantity: 1 },
                    { id: 'baselineVisit', name: 'Baseline Visit', cost: 0, quantity: 1 },
                    { id: 'followUpVisit', name: 'Follow-up Visit', cost: 0, quantity: 1 },
                    { id: 'endOfStudyVisit', name: 'End of Study Visit', cost: 0, quantity: 1 },
                    { id: 'labTests', name: 'Laboratory Tests', cost: 0, quantity: 1 },
                    { id: 'imagingProcedures', name: 'Imaging Procedures', cost: 0, quantity: 1 },
                    { id: 'patientStipend', name: 'Patient Stipend/Compensation', cost: 0, quantity: 1 }
                ],
                customItems: []
            },
            fixedCosts: {
                defaultItems: [
                    { id: 'siteInitiation', name: 'Site Initiation Fee', cost: 0, quantity: 1 },
                    { id: 'siteMonitoring', name: 'Site Monitoring Fees', cost: 0, quantity: 1 },
                    { id: 'regulatorySubmission', name: 'Regulatory Submission Fees', cost: 0, quantity: 1 },
                    { id: 'irbFees', name: 'IRB/REB Fees', cost: 0, quantity: 1 },
                    { id: 'siteCloseOut', name: 'Site Close-out Fee', cost: 0, quantity: 1 },
                    { id: 'dataManagement', name: 'Data Management Fees', cost: 0, quantity: 1 },
                    { id: 'statisticalAnalysis', name: 'Statistical Analysis Fees', cost: 0, quantity: 1 }
                ],
                customItems: []
            },
            equipmentCosts: {
                defaultItems: [
                    { id: 'studyDrugDevice', name: 'Study Drug/Device Costs', cost: 0, quantity: 1 },
                    { id: 'laboratorySupplies', name: 'Laboratory Supplies', cost: 0, quantity: 1 },
                    { id: 'equipmentRental', name: 'Medical Equipment Rental', cost: 0, quantity: 1 },
                    { id: 'storageCosts', name: 'Storage Costs', cost: 0, quantity: 1 }
                ],
                customItems: []
            },
            personnelCosts: {
                defaultItems: [
                    { id: 'piTime', name: 'Principal Investigator Time', cost: 0, quantity: 1 },
                    { id: 'coordinatorTime', name: 'Research Coordinator Time', cost: 0, quantity: 1 },
                    { id: 'dataEntryTime', name: 'Data Entry Personnel', cost: 0, quantity: 1 },
                    { id: 'otherStaffTime', name: 'Other Study Staff', cost: 0, quantity: 1 }
                ],
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
            input.value = '';
        });
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
        
        // Re-render all items
        renderAllDefaultItems();
        
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

// Table of Contents functionality
function initializeTOC() {
    const tocToggle = document.getElementById('tocToggle');
    const toc = document.getElementById('tableOfContents');
    
    // Set up scroll spy for active links
    window.addEventListener('scroll', updateActiveSection);
    
    // Initially hide TOC
    toc.classList.remove('visible');
}

function toggleTOC() {
    const tocToggle = document.getElementById('tocToggle');
    const toc = document.getElementById('tableOfContents');
    
    toc.classList.toggle('visible');
    tocToggle.classList.toggle('active');
}

function updateActiveSection() {
    const sections = document.querySelectorAll('.collapsible-section');
    const tocLinks = document.querySelectorAll('.table-of-contents a');
    
    let currentSection = '';
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
            currentSection = section.id;
        }
    });
    
    tocLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Collapsible sections functionality
function initializeCollapsibleSections() {
    // Wrap existing content in section-content divs for sections that don't have them
    const sections = ['per-patient-costs', 'fixed-costs', 'equipment-costs', 'personnel-costs', 
                     'tax-overhead', 'summary', 'breakdown', 'invoice-schedule', 'general-notes'];
    
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const header = section.querySelector('.section-header');
            if (header && !header.nextElementSibling?.classList.contains('section-content')) {
                const content = document.createElement('div');
                content.className = 'section-content';
                content.id = `${sectionId}-content`;
                
                // Move all content after header into the content div
                let nextSibling = header.nextElementSibling;
                while (nextSibling) {
                    const next = nextSibling.nextElementSibling;
                    content.appendChild(nextSibling);
                    nextSibling = next;
                }
                
                section.appendChild(content);
            }
        }
    });
}

function toggleSection(sectionId) {
    const header = document.querySelector(`#${sectionId} .section-header`);
    const content = document.querySelector(`#${sectionId}-content`);
    
    if (header && content) {
        header.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
    }
}

// Success message functionality
function showSuccess(message = 'Operation completed successfully!') {
    const successMsg = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    
    successText.textContent = message;
    successMsg.classList.add('show');
    
    setTimeout(() => {
        successMsg.classList.remove('show');
    }, 3000);
}

// Enhanced save function with visual feedback
function saveBudgetWithFeedback() {
    try {
        saveBudget();
        showSuccess('Budget saved successfully!');
    } catch (error) {
        showSuccess('Error saving budget. Please try again.');
        console.error('Save error:', error);
    }
}

// Enhanced clear function with confirmation
function showClearConfirmation() {
    const dialog = document.getElementById('confirmationDialog');
    dialog.style.display = 'flex';
}

function hideConfirmation() {
    const dialog = document.getElementById('confirmationDialog');
    dialog.style.display = 'none';
}

function confirmClearAll() {
    hideConfirmation();
    clearAll();
    showSuccess('All data cleared successfully.');
}

// Real-time calculations setup
function setupRealTimeCalculations() {
    // Add event listeners to all input fields for real-time updates
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('cost-input') || 
            e.target.classList.contains('form-control') ||
            e.target.id === 'overheadPercentage') {
            
            // Debounce the calculation updates
            clearTimeout(window.calcTimeout);
            window.calcTimeout = setTimeout(() => {
                updateAllCalculations();
                saveToLocalStorage(); // Auto-save on changes
            }, 300);
        }
    });
    
    // Also listen for changes on select elements
    document.addEventListener('change', function(e) {
        if (e.target.type === 'select-one' || e.target.type === 'number') {
            updateAllCalculations();
            saveToLocalStorage();
        }
    });
}

// Enhanced localStorage with auto-save
let autoSaveTimeout;
function autoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        saveToLocalStorage();
    }, 1000); // Save after 1 second of inactivity
}

// Update all save references to use the new feedback version
window.saveBudget = saveBudgetWithFeedback;
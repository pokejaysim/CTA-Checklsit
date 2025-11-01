// Contract Tracker JavaScript - Enhanced for 90-day deadline tracking
let contracts = [];
let editingContractId = null;
let timerInterval;

// Default settings
const DEFAULT_TYPES = ['Clinical Trial Agreement', 'CTA', 'DTA', 'Budget', 'Other'];
const DEFAULT_STATUSES = ['Drafting', 'Internal Review', 'Sent to Sponsor', 'Final QC', 'Signed'];

// Deadline constants
const DEADLINE_DAYS = 90;
const URGENT_THRESHOLD = 14;
const WARNING_THRESHOLD = 30;

// Custom settings
let customTypes = [];
let customStatuses = [];

// DOM Elements - will be initialized after DOM loads
let contractsList, modal, modalTitle, contractForm, addContractBtn, cancelBtn, closeBtn, typeFilter, statusFilter;
let settingsBtn, settingsModal, settingsCloseBtn, typesList, statusesList, newTypeInput, newStatusInput;
let addTypeBtn, addStatusBtn, resetDefaultsBtn, saveSettingsBtn;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    contractsList = document.getElementById('contractsList');
    modal = document.getElementById('contractModal');
    modalTitle = document.getElementById('modalTitle');
    contractForm = document.getElementById('contractForm');
    addContractBtn = document.getElementById('addContractBtn');
    cancelBtn = document.getElementById('cancelBtn');
    closeBtn = document.querySelector('.close');
    typeFilter = document.getElementById('typeFilter');
    statusFilter = document.getElementById('statusFilter');
    
    // Settings DOM Elements
    settingsBtn = document.getElementById('settingsBtn');
    settingsModal = document.getElementById('settingsModal');
    settingsCloseBtn = document.getElementById('settingsClose');
    typesList = document.getElementById('typesList');
    statusesList = document.getElementById('statusesList');
    newTypeInput = document.getElementById('newType');
    newStatusInput = document.getElementById('newStatus');
    addTypeBtn = document.getElementById('addTypeBtn');
    addStatusBtn = document.getElementById('addStatusBtn');
    resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
    saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    // Set up event listeners
    addContractBtn.addEventListener('click', () => openModal());
    cancelBtn.addEventListener('click', () => closeModal());
    closeBtn.addEventListener('click', () => closeModal());
    contractForm.addEventListener('submit', handleSubmit);
    typeFilter.addEventListener('change', renderContracts);
    statusFilter.addEventListener('change', renderContracts);
    
    // Settings Event Listeners
    settingsBtn.addEventListener('click', openSettings);
    settingsCloseBtn.addEventListener('click', closeSettings);
    addTypeBtn.addEventListener('click', addType);
    addStatusBtn.addEventListener('click', addStatus);
    resetDefaultsBtn.addEventListener('click', resetToDefaults);
    saveSettingsBtn.addEventListener('click', saveSettings);
    newTypeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addType();
    });
    newStatusInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addStatus();
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
        if (e.target === settingsModal) {
            closeSettings();
        }
    });
    
    // Load data and render
    loadSettings();
    loadContracts();
    renderContracts();
    updateFilters();
    updateDashboard();
    
    // Start live timer updates
    startTimerUpdates();
});

// Load contracts from localStorage
function loadContracts() {
    const stored = localStorage.getItem('contracts');
    if (stored) {
        contracts = JSON.parse(stored);
    }
}

// Save contracts to localStorage
function saveContracts() {
    localStorage.setItem('contracts', JSON.stringify(contracts));
}

// Load settings from localStorage
function loadSettings() {
    const storedTypes = localStorage.getItem('contractTypes');
    const storedStatuses = localStorage.getItem('contractStatuses');
    
    if (storedTypes) {
        customTypes = JSON.parse(storedTypes);
    } else {
        customTypes = [...DEFAULT_TYPES];
    }
    
    if (storedStatuses) {
        customStatuses = JSON.parse(storedStatuses);
    } else {
        customStatuses = [...DEFAULT_STATUSES];
    }
}

// Save settings to localStorage
function saveSettingsToStorage() {
    localStorage.setItem('contractTypes', JSON.stringify(customTypes));
    localStorage.setItem('contractStatuses', JSON.stringify(customStatuses));
}

// Open modal for adding/editing
function openModal(contractId = null) {
    editingContractId = contractId;
    updateModalSelects();
    
    if (contractId) {
        const contract = contracts.find(c => c.id === contractId);
        if (contract) {
            modalTitle.textContent = 'Edit Contract';
            document.getElementById('contractTitle').value = contract.title;
            document.getElementById('sponsorName').value = contract.sponsor || '';
            document.getElementById('principalInvestigator').value = contract.principalInvestigator || '';
            document.getElementById('contractType').value = contract.type;
            document.getElementById('contractStatus').value = contract.status || '';
            document.getElementById('dateReceived').value = contract.dateReceived || '';
            document.getElementById('notes').value = contract.notes || '';
        }
    } else {
        modalTitle.textContent = 'Add Contract';
        contractForm.reset();
    }
    
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
    editingContractId = null;
    contractForm.reset();
}

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    
    const contractData = {
        title: document.getElementById('contractTitle').value,
        sponsor: document.getElementById('sponsorName').value,
        principalInvestigator: document.getElementById('principalInvestigator').value,
        type: document.getElementById('contractType').value,
        status: document.getElementById('contractStatus').value,
        dateReceived: document.getElementById('dateReceived').value,
        notes: document.getElementById('notes').value,
        updatedAt: new Date().toISOString()
    };
    
    if (editingContractId) {
        // Update existing contract
        const index = contracts.findIndex(c => c.id === editingContractId);
        if (index !== -1) {
            contracts[index] = { ...contracts[index], ...contractData };
        }
    } else {
        // Add new contract
        contractData.id = generateId();
        contractData.createdAt = new Date().toISOString();
        contracts.push(contractData);
    }
    
    saveContracts();
    renderContracts();
    updateDashboard();
    closeModal();
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Delete contract
function deleteContract(contractId) {
    if (confirm('Are you sure you want to delete this contract?')) {
        contracts = contracts.filter(c => c.id !== contractId);
        saveContracts();
        renderContracts();
        updateDashboard();
    }
}

// Toggle notes visibility
function toggleNotes(contractId) {
    const notesContent = document.getElementById(`notes-${contractId}`);
    const toggleBtn = document.getElementById(`toggle-${contractId}`);
    
    if (notesContent.style.display === 'none') {
        notesContent.style.display = 'block';
        toggleBtn.textContent = '▼ Hide Notes';
    } else {
        notesContent.style.display = 'none';
        toggleBtn.textContent = '▶ Show Notes';
    }
}

// Render contracts list
function renderContracts() {
    const typeValue = typeFilter.value;
    const statusValue = statusFilter.value;
    
    // Filter contracts
    let filteredContracts = contracts.filter(contract => {
        const matchType = !typeValue || contract.type === typeValue;
        const matchStatus = !statusValue || contract.status === statusValue;
        return matchType && matchStatus;
    });
    
    // Sort by urgency (most urgent first), then by updated date
    filteredContracts.sort((a, b) => {
        const urgencyA = getUrgencyLevel(a);
        const urgencyB = getUrgencyLevel(b);
        
        if (urgencyA !== urgencyB) {
            return urgencyA - urgencyB; // Lower numbers = higher urgency
        }
        
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    
    // Clear list
    contractsList.innerHTML = '';
    
    if (filteredContracts.length === 0) {
        contractsList.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 40px;">No contracts found. Click "Add Contract" to create one.</p>';
        return;
    }
    
    // Render each contract
    filteredContracts.forEach(contract => {
        const card = createContractCard(contract);
        contractsList.appendChild(card);
    });
}

// Create contract card HTML
function createContractCard(contract) {
    const card = document.createElement('div');
    card.className = 'contract-card';
    
    if (!contract.dateReceived) {
        // Legacy contracts without dateReceived
        card.innerHTML = createLegacyContractCard(contract);
        return card;
    }
    
    const deadlineInfo = calculateDeadlineInfo(contract.dateReceived);
    const urgencyLevel = getUrgencyLevel(contract);
    const statusClass = getStatusClass(urgencyLevel);
    
    // Render markdown notes
    const renderedNotes = contract.notes ? marked.parse(contract.notes) : '';
    
    card.innerHTML = `
        <div class="contract-header">
            <div>
                <div class="contract-title">${escapeHtml(contract.title)}</div>
                ${contract.sponsor ? `<div class="contract-sponsor">${escapeHtml(contract.sponsor)}</div>` : ''}
                ${contract.principalInvestigator ? `<div class="contract-pi">PI: ${escapeHtml(contract.principalInvestigator)}</div>` : ''}
            </div>
            <div class="contract-actions">
                <button class="edit-btn" onclick="openModal('${contract.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteContract('${contract.id}')">Delete</button>
            </div>
        </div>
        <div class="contract-meta">
            <div class="meta-item">
                <span class="badge" data-type="${contract.type}">${contract.type}</span>
            </div>
            ${contract.status ? `
                <div class="meta-item">
                    <span class="badge" data-status="${contract.status}">${contract.status}</span>
                </div>
            ` : ''}
        </div>
        <div class="countdown-container">
            <div class="countdown-timer ${statusClass}" id="countdown-${contract.id}">
                ${deadlineInfo.countdownText}
            </div>
            <div class="progress-container">
                <div class="progress-bar-deadline ${statusClass}" style="width: ${deadlineInfo.progressPercent}%"></div>
            </div>
            <div class="elapsed-days">
                ${deadlineInfo.elapsedText} • Deadline: ${formatDate(deadlineInfo.deadline)}
            </div>
        </div>
        ${contract.notes ? `
            <div class="contract-notes">
                <button class="notes-toggle" id="toggle-${contract.id}" onclick="toggleNotes('${contract.id}')">
                    ▶ Show Notes
                </button>
                <div class="notes-content" id="notes-${contract.id}" style="display: none;">
                    ${renderedNotes}
                </div>
            </div>
        ` : ''}
    `;
    
    return card;
}

// Create legacy contract card for contracts without dateReceived
function createLegacyContractCard(contract) {
    const isOverdue = contract.dueDate && new Date(contract.dueDate) < new Date();
    const dueDateClass = isOverdue ? 'due-date overdue' : 'due-date';
    const dueDateText = contract.dueDate ? formatDate(contract.dueDate) : 'No due date';
    const renderedNotes = contract.notes ? marked.parse(contract.notes) : '';
    
    return `
        <div class="contract-header">
            <div>
                <div class="contract-title">${escapeHtml(contract.title)}</div>
                <div class="contract-sponsor">${escapeHtml(contract.sponsor)}</div>
                ${contract.principalInvestigator ? `<div class="contract-pi">PI: ${escapeHtml(contract.principalInvestigator)}</div>` : ''}
            </div>
            <div class="contract-actions">
                <button class="edit-btn" onclick="openModal('${contract.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteContract('${contract.id}')">Delete</button>
            </div>
        </div>
        <div class="contract-meta">
            <div class="meta-item">
                <span class="badge" data-type="${contract.type}">${contract.type}</span>
            </div>
            <div class="meta-item">
                <span class="badge" data-status="${contract.status}">${contract.status}</span>
            </div>
            <div class="meta-item">
                <span class="${dueDateClass}">📅 ${dueDateText}</span>
            </div>
        </div>
        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 10px; margin-top: 10px; font-size: 0.9rem;">
            ⚠️ Legacy contract - please edit to add received date for deadline tracking
        </div>
        ${contract.notes ? `
            <div class="contract-notes">
                <button class="notes-toggle" id="toggle-${contract.id}" onclick="toggleNotes('${contract.id}')">
                    ▶ Show Notes
                </button>
                <div class="notes-content" id="notes-${contract.id}" style="display: none;">
                    ${renderedNotes}
                </div>
            </div>
        ` : ''}
    `;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Settings Functions
function openSettings() {
    if (!settingsModal) {
        console.error('Settings modal not found');
        return;
    }
    renderSettings();
    settingsModal.style.display = 'block';
}

function closeSettings() {
    settingsModal.style.display = 'none';
}

function renderSettings() {
    // Render types
    typesList.innerHTML = '';
    customTypes.forEach((type, index) => {
        const item = document.createElement('div');
        item.className = 'custom-item';
        item.innerHTML = `
            <span>${type}</span>
            <button onclick="removeType(${index})">&times;</button>
        `;
        typesList.appendChild(item);
    });
    
    // Render statuses
    statusesList.innerHTML = '';
    customStatuses.forEach((status, index) => {
        const item = document.createElement('div');
        item.className = 'custom-item';
        item.innerHTML = `
            <span>${status}</span>
            <button onclick="removeStatus(${index})">&times;</button>
        `;
        statusesList.appendChild(item);
    });
}

function addType() {
    const newType = newTypeInput.value.trim();
    if (newType && !customTypes.includes(newType)) {
        customTypes.push(newType);
        newTypeInput.value = '';
        renderSettings();
    }
}

function addStatus() {
    const newStatus = newStatusInput.value.trim();
    if (newStatus && !customStatuses.includes(newStatus)) {
        customStatuses.push(newStatus);
        newStatusInput.value = '';
        renderSettings();
    }
}

function removeType(index) {
    customTypes.splice(index, 1);
    renderSettings();
}

function removeStatus(index) {
    customStatuses.splice(index, 1);
    renderSettings();
}

function resetToDefaults() {
    if (confirm('Reset to default types and statuses? This will not affect existing contracts.')) {
        customTypes = [...DEFAULT_TYPES];
        customStatuses = [...DEFAULT_STATUSES];
        renderSettings();
    }
}

function saveSettings() {
    saveSettingsToStorage();
    updateFilters();
    updateModalSelects();
    renderContracts();
    closeSettings();
}

// Update filters with custom options
function updateFilters() {
    // Update type filter
    typeFilter.innerHTML = '<option value="">All Types</option>';
    customTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
    });
    
    // Update status filter
    statusFilter.innerHTML = '<option value="">All Statuses</option>';
    customStatuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        statusFilter.appendChild(option);
    });
}

// Update modal selects with custom options
function updateModalSelects() {
    const typeSelect = document.getElementById('contractType');
    const statusSelect = document.getElementById('contractStatus');
    
    // Update type select
    typeSelect.innerHTML = '<option value="">Select Type</option>';
    customTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        if (type === 'Clinical Trial Agreement') {
            option.selected = true;
        }
        typeSelect.appendChild(option);
    });
    
    // Update status select
    statusSelect.innerHTML = '<option value="">Select Status</option>';
    customStatuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        statusSelect.appendChild(option);
    });
}

// Deadline calculation functions
function calculateDeadlineInfo(dateReceived) {
    const receivedDate = new Date(dateReceived);
    const deadline = new Date(receivedDate);
    deadline.setDate(receivedDate.getDate() + DEADLINE_DAYS);
    
    const now = new Date();
    const timeRemaining = deadline - now;
    const timeElapsed = now - receivedDate;
    
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.floor(timeElapsed / (1000 * 60 * 60 * 24));
    const progressPercent = Math.min(100, Math.max(0, (daysElapsed / DEADLINE_DAYS) * 100));
    
    let countdownText, elapsedText;
    
    if (daysRemaining < 0) {
        const overdueDays = Math.abs(daysRemaining);
        countdownText = `OVERDUE by ${overdueDays} day${overdueDays !== 1 ? 's' : ''}`;
        elapsedText = `${daysElapsed} days elapsed`;
    } else if (daysRemaining === 0) {
        // Calculate hours and minutes remaining for today
        const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        countdownText = `${hoursRemaining}h ${minutesRemaining}m remaining TODAY`;
        elapsedText = `${daysElapsed} days elapsed`;
    } else if (daysRemaining === 1) {
        const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        countdownText = `${daysRemaining} day ${hoursRemaining}h ${minutesRemaining}m remaining`;
        elapsedText = `${daysElapsed} days elapsed`;
    } else {
        countdownText = `${daysRemaining} days remaining`;
        elapsedText = `${daysElapsed} days elapsed`;
    }
    
    return {
        deadline,
        daysRemaining,
        daysElapsed,
        progressPercent,
        countdownText,
        elapsedText,
        timeRemaining
    };
}

function getUrgencyLevel(contract) {
    if (!contract.dateReceived) return 4; // Legacy contracts go to bottom
    
    const deadlineInfo = calculateDeadlineInfo(contract.dateReceived);
    
    if (deadlineInfo.daysRemaining < 0) return 0; // Overdue - highest priority
    if (deadlineInfo.daysRemaining <= URGENT_THRESHOLD) return 1; // Urgent
    if (deadlineInfo.daysRemaining <= WARNING_THRESHOLD) return 2; // Warning
    return 3; // On track
}

function getStatusClass(urgencyLevel) {
    switch (urgencyLevel) {
        case 0: return 'overdue';
        case 1: return 'urgent';
        case 2: return 'warning';
        case 3: return 'on-track';
        default: return 'on-track';
    }
}

// Dashboard statistics
function updateDashboard() {
    let urgentCount = 0;
    let warningCount = 0;
    let onTrackCount = 0;
    let overdueCount = 0;
    
    contracts.forEach(contract => {
        if (!contract.dateReceived) return; // Skip legacy contracts
        
        const urgencyLevel = getUrgencyLevel(contract);
        switch (urgencyLevel) {
            case 0: overdueCount++; break;
            case 1: urgentCount++; break;
            case 2: warningCount++; break;
            case 3: onTrackCount++; break;
        }
    });
    
    document.getElementById('urgentCount').textContent = urgentCount;
    document.getElementById('warningCount').textContent = warningCount;
    document.getElementById('onTrackCount').textContent = onTrackCount;
    document.getElementById('overdueCount').textContent = overdueCount;
}

// Live timer updates
function startTimerUpdates() {
    // Update every minute
    timerInterval = setInterval(() => {
        updateCountdownTimers();
    }, 60000);
    
    // Initial update
    updateCountdownTimers();
}

function updateCountdownTimers() {
    contracts.forEach(contract => {
        if (!contract.dateReceived) return;
        
        const countdownElement = document.getElementById(`countdown-${contract.id}`);
        if (countdownElement) {
            const deadlineInfo = calculateDeadlineInfo(contract.dateReceived);
            const urgencyLevel = getUrgencyLevel(contract);
            const statusClass = getStatusClass(urgencyLevel);
            
            countdownElement.textContent = deadlineInfo.countdownText;
            countdownElement.className = `countdown-timer ${statusClass}`;
        }
    });
    
    // Update dashboard stats
    updateDashboard();
}

// Cleanup timer on page unload
window.addEventListener('beforeunload', () => {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
});

// Make functions available globally for onclick handlers
window.openModal = openModal;
window.deleteContract = deleteContract;
window.toggleNotes = toggleNotes;
window.removeType = removeType;
window.removeStatus = removeStatus;
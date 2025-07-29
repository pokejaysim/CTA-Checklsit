// Contract Tracker JavaScript
let contracts = [];
let editingContractId = null;

// Default settings
const DEFAULT_TYPES = ['CTA', 'DTA', 'Budget', 'Other'];
const DEFAULT_STATUSES = ['Drafting', 'Internal Review', 'Sent to Sponsor', 'Final QC', 'Signed'];

// Custom settings
let customTypes = [];
let customStatuses = [];

// DOM Elements
const contractsList = document.getElementById('contractsList');
const modal = document.getElementById('contractModal');
const modalTitle = document.getElementById('modalTitle');
const contractForm = document.getElementById('contractForm');
const addContractBtn = document.getElementById('addContractBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeBtn = document.querySelector('.close');
const typeFilter = document.getElementById('typeFilter');
const statusFilter = document.getElementById('statusFilter');

// Settings DOM Elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const settingsCloseBtn = document.getElementById('settingsClose');
const typesList = document.getElementById('typesList');
const statusesList = document.getElementById('statusesList');
const newTypeInput = document.getElementById('newType');
const newStatusInput = document.getElementById('newStatus');
const addTypeBtn = document.getElementById('addTypeBtn');
const addStatusBtn = document.getElementById('addStatusBtn');
const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadContracts();
    renderContracts();
    updateFilters();
});

// Event Listeners
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
            document.getElementById('sponsorName').value = contract.sponsor;
            document.getElementById('principalInvestigator').value = contract.principalInvestigator || '';
            document.getElementById('contractType').value = contract.type;
            document.getElementById('contractStatus').value = contract.status;
            document.getElementById('dueDate').value = contract.dueDate || '';
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
        dueDate: document.getElementById('dueDate').value,
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
    
    // Sort by updated date (newest first)
    filteredContracts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
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
    
    // Check if due date is overdue
    const isOverdue = contract.dueDate && new Date(contract.dueDate) < new Date();
    const dueDateClass = isOverdue ? 'due-date overdue' : 'due-date';
    
    // Format due date
    const dueDateText = contract.dueDate ? formatDate(contract.dueDate) : 'No due date';
    
    // Render markdown notes
    const renderedNotes = contract.notes ? marked.parse(contract.notes) : '';
    
    card.innerHTML = `
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

// Make functions available globally for onclick handlers
window.openModal = openModal;
window.deleteContract = deleteContract;
window.toggleNotes = toggleNotes;
window.removeType = removeType;
window.removeStatus = removeStatus;
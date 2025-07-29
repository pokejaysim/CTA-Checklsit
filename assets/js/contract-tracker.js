// Contract Tracker JavaScript
let contracts = [];
let editingContractId = null;

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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadContracts();
    renderContracts();
});

// Event Listeners
addContractBtn.addEventListener('click', () => openModal());
cancelBtn.addEventListener('click', () => closeModal());
closeBtn.addEventListener('click', () => closeModal());
contractForm.addEventListener('submit', handleSubmit);
typeFilter.addEventListener('change', renderContracts);
statusFilter.addEventListener('change', renderContracts);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
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

// Open modal for adding/editing
function openModal(contractId = null) {
    editingContractId = contractId;
    
    if (contractId) {
        const contract = contracts.find(c => c.id === contractId);
        if (contract) {
            modalTitle.textContent = 'Edit Contract';
            document.getElementById('contractTitle').value = contract.title;
            document.getElementById('sponsorName').value = contract.sponsor;
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
            </div>
            <div class="contract-actions">
                <button class="edit-btn" onclick="openModal('${contract.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteContract('${contract.id}')">Delete</button>
            </div>
        </div>
        <div class="contract-meta">
            <div class="meta-item">
                <span class="badge type-${contract.type}">${contract.type}</span>
            </div>
            <div class="meta-item">
                <span class="badge status-${contract.status.replace(/\s+/g, '-')}">${contract.status}</span>
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
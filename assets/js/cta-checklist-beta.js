// CTA Checklist Beta - Enhanced JavaScript
class CTAChecklistBeta {
    constructor() {
        this.data = {
            version: "2.0",
            created: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            study: {},
            checkboxes: {},
            notes: {},
            sectionRefs: {},
            settings: {
                darkMode: false,
                autoSave: true,
                autoSaveInterval: 10,
                autoExpandSections: false,
                showSectionStats: true,
                enableAnimations: true
            }
        };
        
        this.versionHistory = [];
        this.autoSaveTimer = null;
        this.searchDebounceTimer = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        this.loadSettings();
        this.loadData();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.initializeSections();
        this.updateProgress();
        this.startAutoSave();
        
        this.isInitialized = true;
        this.showToast('Checklist loaded successfully', 'success');
    }

    // Settings Management
    loadSettings() {
        const savedSettings = localStorage.getItem('cta-checklist-beta-settings');
        if (savedSettings) {
            try {
                this.data.settings = { ...this.data.settings, ...JSON.parse(savedSettings) };
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('cta-checklist-beta-settings', JSON.stringify(this.data.settings));
        this.applySettings();
    }

    applySettings() {
        // Apply dark mode
        if (this.data.settings.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            const darkModeToggle = document.getElementById('darkModeToggle');
            if (darkModeToggle) {
                darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        } else {
            document.documentElement.removeAttribute('data-theme');
            const darkModeToggle = document.getElementById('darkModeToggle');
            if (darkModeToggle) {
                darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        }

        // Apply other settings
        const settingsInputs = {
            'autoExpandSections': this.data.settings.autoExpandSections,
            'showSectionStats': this.data.settings.showSectionStats,
            'enableAnimations': this.data.settings.enableAnimations,
            'autoSaveEnabled': this.data.settings.autoSave
        };

        Object.entries(settingsInputs).forEach(([id, value]) => {
            const input = document.getElementById(id);
            if (input) input.checked = value;
        });

        const autoSaveInterval = document.getElementById('autoSaveInterval');
        if (autoSaveInterval) {
            autoSaveInterval.value = this.data.settings.autoSaveInterval;
        }

        // Toggle animations
        if (!this.data.settings.enableAnimations) {
            document.body.style.setProperty('--transition', 'none');
        }
    }

    // Data Management
    loadData() {
        const savedData = localStorage.getItem('cta-checklist-beta-data');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                this.data = { ...this.data, ...parsedData };
                this.restoreFormData();
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }
        this.loadVersionHistory();
    }

    saveData() {
        this.data.lastModified = new Date().toISOString();
        this.collectFormData();
        localStorage.setItem('cta-checklist-beta-data', JSON.stringify(this.data));
        this.updateLastSavedTime();
        this.createVersionSnapshot();
    }

    collectFormData() {
        // Study information
        this.data.study = {
            protocol: this.getValueById('protocol-number'),
            date: this.getValueById('study-date'),
            pi: this.getValueById('pi-name'),
            sponsor: this.getValueById('sponsor-name'),
            cro: this.getValueById('cro-name')
        };

        // Checkboxes
        this.data.checkboxes = {};
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            this.data.checkboxes[cb.id] = cb.checked;
        });

        // Notes
        this.data.notes = {};
        document.querySelectorAll('.notes-input').forEach(textarea => {
            const section = textarea.getAttribute('data-section');
            if (section) {
                this.data.notes[section] = textarea.value;
            }
        });

        // Section references
        this.data.sectionRefs = {};
        document.querySelectorAll('.section-ref').forEach(input => {
            const refFor = input.getAttribute('data-ref-for');
            if (refFor) {
                this.data.sectionRefs[refFor] = input.value;
            }
        });
    }

    restoreFormData() {
        // Study information
        if (this.data.study) {
            this.setValueById('protocol-number', this.data.study.protocol);
            this.setValueById('study-date', this.data.study.date);
            this.setValueById('pi-name', this.data.study.pi);
            this.setValueById('sponsor-name', this.data.study.sponsor);
            this.setValueById('cro-name', this.data.study.cro);
        }

        // Checkboxes
        if (this.data.checkboxes) {
            Object.entries(this.data.checkboxes).forEach(([id, checked]) => {
                const checkbox = document.getElementById(id);
                if (checkbox) checkbox.checked = checked;
            });
        }

        // Notes
        if (this.data.notes) {
            Object.entries(this.data.notes).forEach(([section, value]) => {
                const textarea = document.querySelector(`textarea[data-section="${section}"]`);
                if (textarea) textarea.value = value;
            });
        }

        // Section references
        if (this.data.sectionRefs) {
            Object.entries(this.data.sectionRefs).forEach(([refFor, value]) => {
                const input = document.querySelector(`input[data-ref-for="${refFor}"]`);
                if (input) input.value = value;
            });
        }
    }

    // Version History
    loadVersionHistory() {
        const saved = localStorage.getItem('cta-checklist-beta-versions');
        if (saved) {
            try {
                this.versionHistory = JSON.parse(saved);
            } catch (error) {
                console.error('Error loading version history:', error);
                this.versionHistory = [];
            }
        }
        this.updateVersionHistoryDisplay();
    }

    createVersionSnapshot() {
        const snapshot = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            data: JSON.parse(JSON.stringify(this.data)),
            summary: this.generateVersionSummary()
        };

        this.versionHistory.unshift(snapshot);
        
        // Keep only last 10 versions
        if (this.versionHistory.length > 10) {
            this.versionHistory = this.versionHistory.slice(0, 10);
        }

        localStorage.setItem('cta-checklist-beta-versions', JSON.stringify(this.versionHistory));
        this.updateVersionHistoryDisplay();
    }

    generateVersionSummary() {
        const total = Object.keys(this.data.checkboxes).length;
        const completed = Object.values(this.data.checkboxes).filter(Boolean).length;
        return `${completed}/${total} items completed`;
    }

    updateVersionHistoryDisplay() {
        const container = document.getElementById('versionHistoryList');
        if (!container) return;

        if (this.versionHistory.length === 0) {
            container.innerHTML = '<p class="no-versions">No saved versions yet. Save your checklist to create the first version.</p>';
            return;
        }

        container.innerHTML = this.versionHistory.map(version => `
            <div class="version-item">
                <div class="version-header">
                    <span class="version-date">${new Date(version.timestamp).toLocaleString()}</span>
                    <div class="version-actions">
                        <button class="btn btn-sm btn-secondary" onclick="ctaChecklist.restoreVersion('${version.id}')">
                            <i class="fas fa-undo"></i> Restore
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="ctaChecklist.deleteVersion('${version.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="version-summary">${version.summary}</div>
            </div>
        `).join('');
    }

    restoreVersion(versionId) {
        const version = this.versionHistory.find(v => v.id === versionId);
        if (!version) return;

        if (confirm('Are you sure you want to restore this version? Current changes will be lost.')) {
            this.data = { ...version.data };
            this.restoreFormData();
            this.updateProgress();
            this.showToast('Version restored successfully', 'success');
        }
    }

    deleteVersion(versionId) {
        if (confirm('Are you sure you want to delete this version?')) {
            this.versionHistory = this.versionHistory.filter(v => v.id !== versionId);
            localStorage.setItem('cta-checklist-beta-versions', JSON.stringify(this.versionHistory));
            this.updateVersionHistoryDisplay();
            this.showToast('Version deleted', 'warning');
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Auto-save on input changes
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.triggerAutoSave();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                this.updateProgress();
                this.triggerAutoSave();
            }
        });

        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Filter functionality
        const filterSelect = document.getElementById('filterSelect');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => this.applyFilter(e.target.value));
        }

        // View options
        document.getElementById('compactViewBtn')?.addEventListener('click', () => this.setView('compact'));
        document.getElementById('detailedViewBtn')?.addEventListener('click', () => this.setView('detailed'));

        // Expand/Collapse all
        document.getElementById('expandAllBtn')?.addEventListener('click', () => this.toggleAllSections());

        // Modal controls
        this.setupModalControls();

        // Action buttons
        this.setupActionButtons();

        // Settings
        this.setupSettingsControls();
    }

    setupModalControls() {
        // Help modal
        document.getElementById('helpToggle')?.addEventListener('click', () => this.showModal('helpModal'));
        document.getElementById('closeHelp')?.addEventListener('click', () => this.hideModal('helpModal'));

        // Settings modal
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.showModal('settingsModal'));
        document.getElementById('closeSettings')?.addEventListener('click', () => this.hideModal('settingsModal'));

        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });
    }

    setupActionButtons() {
        document.getElementById('saveBtn')?.addEventListener('click', () => this.manualSave());
        document.getElementById('loadBtn')?.addEventListener('click', () => this.loadFromFile());
        document.getElementById('exportPdfBtn')?.addEventListener('click', () => this.exportToPDF());
        document.getElementById('exportExcelBtn')?.addEventListener('click', () => this.exportToExcel());
        document.getElementById('exportTextBtn')?.addEventListener('click', () => this.exportToText());
        document.getElementById('printBtn')?.addEventListener('click', () => window.print());
        document.getElementById('clearAllBtn')?.addEventListener('click', () => this.clearAll());
    }

    setupSettingsControls() {
        // Settings inputs
        const settingsInputs = ['autoExpandSections', 'showSectionStats', 'enableAnimations', 'autoSaveEnabled'];
        settingsInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => {
                    this.data.settings[id === 'autoSaveEnabled' ? 'autoSave' : id] = input.checked;
                    this.saveSettings();
                    if (id === 'autoSave') {
                        this.startAutoSave();
                    }
                });
            }
        });

        const autoSaveInterval = document.getElementById('autoSaveInterval');
        if (autoSaveInterval) {
            autoSaveInterval.addEventListener('change', () => {
                this.data.settings.autoSaveInterval = parseInt(autoSaveInterval.value);
                this.saveSettings();
                this.startAutoSave();
            });
        }
    }

    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S to save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.manualSave();
                return;
            }

            // Ctrl+F to focus search
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                }
                return;
            }

            // Ctrl+E to toggle all sections
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                this.toggleAllSections();
                return;
            }

            // Space to toggle checkbox when focused
            if (e.key === ' ' && e.target.type === 'checkbox') {
                // Let the default behavior handle this
                return;
            }

            // Escape to close modals
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    this.hideModal(openModal.id);
                }
            }
        });
    }

    // Section Management
    initializeSections() {
        // Initialize all sections as collapsed except study info
        document.querySelectorAll('.section').forEach(section => {
            const sectionId = section.getAttribute('data-section');
            if (sectionId !== 'study-info') {
                this.collapseSection(sectionId);
            }
        });
    }

    toggleSection(sectionId) {
        const section = document.querySelector(`[data-section="${sectionId}"]`);
        const content = document.getElementById(`content-${sectionId}`);
        const icon = section?.querySelector('.section-icon');

        if (!section || !content) return;

        const isExpanded = content.classList.contains('expanded');

        if (isExpanded) {
            this.collapseSection(sectionId);
        } else {
            this.expandSection(sectionId);
        }
    }

    expandSection(sectionId) {
        const section = document.querySelector(`[data-section="${sectionId}"]`);
        const content = document.getElementById(`content-${sectionId}`);
        const icon = section?.querySelector('.section-icon');

        if (!section || !content) return;

        content.classList.add('expanded');
        section.classList.remove('collapsed');
        if (icon) icon.style.transform = 'rotate(0deg)';

        // Animate the expansion
        content.style.maxHeight = content.scrollHeight + 'px';
        setTimeout(() => {
            content.style.maxHeight = 'none';
        }, 300);
    }

    collapseSection(sectionId) {
        const section = document.querySelector(`[data-section="${sectionId}"]`);
        const content = document.getElementById(`content-${sectionId}`);
        const icon = section?.querySelector('.section-icon');

        if (!section || !content) return;

        content.style.maxHeight = content.scrollHeight + 'px';
        content.offsetHeight; // Force reflow
        content.style.maxHeight = '0';

        setTimeout(() => {
            content.classList.remove('expanded');
            section.classList.add('collapsed');
            if (icon) icon.style.transform = 'rotate(-90deg)';
        }, 300);
    }

    toggleAllSections() {
        const allCollapsed = document.querySelectorAll('.section.collapsed').length === document.querySelectorAll('.section').length - 1; // -1 for study-info
        const sections = document.querySelectorAll('.section[data-section]:not([data-section="study-info"])');

        sections.forEach(section => {
            const sectionId = section.getAttribute('data-section');
            if (allCollapsed) {
                this.expandSection(sectionId);
            } else {
                this.collapseSection(sectionId);
            }
        });

        const expandBtn = document.getElementById('expandAllBtn');
        if (expandBtn) {
            expandBtn.innerHTML = allCollapsed 
                ? '<i class="fas fa-compress-arrows-alt"></i> Collapse All'
                : '<i class="fas fa-expand-arrows-alt"></i> Expand All';
        }
    }

    // Search and Filter
    handleSearch(query) {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }

    performSearch(query) {
        const searchTerms = query.toLowerCase().trim().split(/\s+/);
        const items = document.querySelectorAll('.checkbox-item[data-searchable]');

        let hasResults = false;

        items.forEach(item => {
            const searchableText = item.getAttribute('data-searchable').toLowerCase();
            const matches = searchTerms.every(term => searchableText.includes(term));

            if (query === '' || matches) {
                item.style.display = '';
                if (matches && query !== '') {
                    item.classList.add('highlighted');
                    hasResults = true;
                    
                    // Auto-expand section if setting is enabled
                    if (this.data.settings.autoExpandSections) {
                        const section = item.closest('.section');
                        if (section) {
                            const sectionId = section.getAttribute('data-section');
                            this.expandSection(sectionId);
                        }
                    }
                } else {
                    item.classList.remove('highlighted');
                }
            } else {
                item.style.display = 'none';
                item.classList.remove('highlighted');
            }
        });

        // Show/hide sections based on visible items
        document.querySelectorAll('.section').forEach(section => {
            const visibleItems = section.querySelectorAll('.checkbox-item[data-searchable]:not([style*="display: none"])');
            const sectionContent = section.querySelector('.section-content');
            
            if (query === '' || visibleItems.length > 0) {
                section.style.display = '';
            } else {
                section.style.display = 'none';
            }
        });

        if (query !== '' && !hasResults) {
            this.showToast('No items found matching your search', 'warning');
        }
    }

    applyFilter(filterType) {
        const items = document.querySelectorAll('.checkbox-item');

        items.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const notes = item.closest('.section')?.querySelector('.notes-input');
            const sectionRef = item.querySelector('.section-ref');

            let show = true;

            switch (filterType) {
                case 'incomplete':
                    show = checkbox && !checkbox.checked;
                    break;
                case 'complete':
                    show = checkbox && checkbox.checked;
                    break;
                case 'with-notes':
                    show = notes && notes.value.trim() !== '';
                    break;
                case 'with-refs':
                    show = sectionRef && sectionRef.value.trim() !== '';
                    break;
                case 'all':
                default:
                    show = true;
            }

            item.style.display = show ? '' : 'none';
        });

        // Show/hide sections based on visible items
        document.querySelectorAll('.section').forEach(section => {
            const visibleItems = section.querySelectorAll('.checkbox-item:not([style*="display: none"])');
            section.style.display = visibleItems.length > 0 ? '' : 'none';
        });
    }

    // Progress Tracking
    updateProgress() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"][data-section]');
        const total = checkboxes.length;
        const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Update main progress
        document.getElementById('progressPercentage').textContent = `${percentage}%`;
        document.getElementById('completedItems').textContent = completed;
        document.getElementById('totalItems').textContent = total;

        // Update progress circle
        const progressCircle = document.getElementById('progressCircle');
        if (progressCircle) {
            const angle = (percentage / 100) * 360;
            progressCircle.style.background = `conic-gradient(var(--primary-blue) ${angle}deg, var(--light-gray) ${angle}deg)`;
        }

        // Update section-wise progress
        this.updateSectionProgress();

        // Update sections complete count
        const sectionsComplete = this.getSectionsCompleteCount();
        document.getElementById('sectionsComplete').textContent = sectionsComplete;
    }

    updateSectionProgress() {
        const sections = document.querySelectorAll('.section[data-section]');
        
        sections.forEach(section => {
            const sectionId = section.getAttribute('data-section');
            if (sectionId === 'study-info') {
                this.updateStudyInfoProgress(section);
            } else {
                this.updateCheckboxSectionProgress(section, sectionId);
            }
        });
    }

    updateStudyInfoProgress(section) {
        const inputs = section.querySelectorAll('input[data-required="true"]');
        const filled = Array.from(inputs).filter(input => input.value.trim() !== '').length;
        const total = inputs.length;
        const percentage = total > 0 ? (filled / total) * 100 : 0;

        const progressBar = section.querySelector('.section-progress-bar');
        const countSpan = section.querySelector('.section-count');
        
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (countSpan) countSpan.textContent = `${filled}/${total}`;
    }

    updateCheckboxSectionProgress(section, sectionId) {
        const checkboxes = section.querySelectorAll(`input[type="checkbox"][data-section="${sectionId}"]`);
        const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
        const total = checkboxes.length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;

        const progressBar = section.querySelector('.section-progress-bar');
        const countSpan = section.querySelector('.section-count');
        
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (countSpan) countSpan.textContent = `${completed}/${total}`;
    }

    getSectionsCompleteCount() {
        const sections = document.querySelectorAll('.section[data-section]');
        let completeCount = 0;

        sections.forEach(section => {
            const sectionId = section.getAttribute('data-section');
            let isComplete = false;

            if (sectionId === 'study-info') {
                const inputs = section.querySelectorAll('input[data-required="true"]');
                isComplete = Array.from(inputs).every(input => input.value.trim() !== '');
            } else {
                const checkboxes = section.querySelectorAll(`input[type="checkbox"][data-section="${sectionId}"]`);
                isComplete = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
            }

            if (isComplete) completeCount++;
        });

        return completeCount;
    }

    // Auto-save functionality
    startAutoSave() {
        clearInterval(this.autoSaveTimer);
        
        if (this.data.settings.autoSave) {
            this.autoSaveTimer = setInterval(() => {
                this.saveData();
                this.updateAutoSaveStatus();
            }, this.data.settings.autoSaveInterval * 1000);
        }
    }

    triggerAutoSave() {
        if (this.data.settings.autoSave) {
            clearTimeout(this.manualSaveTimer);
            this.manualSaveTimer = setTimeout(() => {
                this.saveData();
                this.updateAutoSaveStatus();
            }, 1000);
        }
    }

    updateAutoSaveStatus() {
        const statusBtn = document.getElementById('autoSaveStatus');
        if (statusBtn) {
            statusBtn.innerHTML = '<i class="fas fa-check-circle"></i> Auto-saved';
            statusBtn.classList.remove('btn-warning');
            statusBtn.classList.add('btn-success');
        }
        this.updateLastSavedTime();
    }

    updateLastSavedTime() {
        const timeSpan = document.getElementById('lastSavedTime');
        if (timeSpan) {
            timeSpan.textContent = new Date().toLocaleTimeString();
        }
    }

    manualSave() {
        this.saveData();
        this.showToast('Checklist saved successfully', 'success');
        this.updateAutoSaveStatus();
    }

    // UI Helpers
    toggleDarkMode() {
        this.data.settings.darkMode = !this.data.settings.darkMode;
        this.saveSettings();
    }

    setView(viewType) {
        const compactBtn = document.getElementById('compactViewBtn');
        const detailedBtn = document.getElementById('detailedViewBtn');

        if (viewType === 'compact') {
            document.body.classList.add('compact-view');
            compactBtn?.classList.add('active');
            detailedBtn?.classList.remove('active');
        } else {
            document.body.classList.remove('compact-view');
            detailedBtn?.classList.add('active');
            compactBtn?.classList.remove('active');
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    // Export Functions
    async exportToPDF() {
        this.showToast('Preparing PDF export...', 'info');
        
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            
            // Add title
            pdf.setFontSize(16);
            pdf.text('Clinical Trial Agreement Checklist (Beta)', 20, 20);
            
            // Add study info
            let y = 40;
            pdf.setFontSize(12);
            pdf.text('Study Information:', 20, y);
            y += 10;
            
            if (this.data.study) {
                Object.entries(this.data.study).forEach(([key, value]) => {
                    if (value) {
                        pdf.text(`${key}: ${value}`, 25, y);
                        y += 7;
                    }
                });
            }
            
            // Add completion summary
            y += 10;
            const checkboxes = document.querySelectorAll('input[type="checkbox"][data-section]');
            const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
            const total = checkboxes.length;
            
            pdf.text(`Completion: ${completed}/${total} items (${Math.round((completed/total)*100)}%)`, 20, y);
            
            // Note about detailed content
            y += 20;
            pdf.text('Note: This is a summary export. For detailed content, use the print function.', 20, y);
            
            pdf.save(`CTA_Checklist_Beta_${this.data.study.protocol || 'Export'}_${new Date().toISOString().split('T')[0]}.pdf`);
            this.showToast('PDF exported successfully', 'success');
        } catch (error) {
            console.error('PDF export error:', error);
            this.showToast('Error exporting PDF. Please try using the print function instead.', 'error');
        }
    }

    exportToExcel() {
        this.showToast('Preparing Excel export...', 'info');
        
        try {
            const wb = XLSX.utils.book_new();
            
            // Study Info Sheet
            const studyData = [
                ['Field', 'Value'],
                ['Protocol Number', this.data.study.protocol || ''],
                ['Date', this.data.study.date || ''],
                ['Principal Investigator', this.data.study.pi || ''],
                ['Sponsor', this.data.study.sponsor || ''],
                ['CRO', this.data.study.cro || '']
            ];
            
            const studyWs = XLSX.utils.aoa_to_sheet(studyData);
            XLSX.utils.book_append_sheet(wb, studyWs, 'Study Info');
            
            // Checklist Items Sheet
            const checklistData = [['Section', 'Item', 'Completed', 'Section Reference', 'Notes']];
            
            document.querySelectorAll('.section[data-section]').forEach(section => {
                const sectionId = section.getAttribute('data-section');
                const sectionTitle = section.querySelector('.section-title span')?.textContent || sectionId;
                
                section.querySelectorAll('.checkbox-item').forEach(item => {
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    const label = item.querySelector('.checkbox-label');
                    const sectionRef = item.querySelector('.section-ref');
                    
                    if (checkbox && label) {
                        checklistData.push([
                            sectionTitle,
                            label.textContent.trim(),
                            checkbox.checked ? 'Yes' : 'No',
                            sectionRef?.value || '',
                            ''
                        ]);
                    }
                });
                
                // Add section notes
                const notes = section.querySelector('.notes-input');
                if (notes && notes.value.trim()) {
                    checklistData.push([
                        sectionTitle,
                        'Section Notes',
                        '',
                        '',
                        notes.value
                    ]);
                }
            });
            
            const checklistWs = XLSX.utils.aoa_to_sheet(checklistData);
            XLSX.utils.book_append_sheet(wb, checklistWs, 'Checklist');
            
            // Summary Sheet
            const summaryData = [
                ['Metric', 'Value'],
                ['Total Items', document.querySelectorAll('input[type="checkbox"][data-section]').length],
                ['Completed Items', Array.from(document.querySelectorAll('input[type="checkbox"][data-section]')).filter(cb => cb.checked).length],
                ['Completion Percentage', Math.round((Array.from(document.querySelectorAll('input[type="checkbox"][data-section]')).filter(cb => cb.checked).length / document.querySelectorAll('input[type="checkbox"][data-section]').length) * 100) + '%'],
                ['Export Date', new Date().toLocaleString()],
                ['Version', this.data.version]
            ];
            
            const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
            
            XLSX.writeFile(wb, `CTA_Checklist_Beta_${this.data.study.protocol || 'Export'}_${new Date().toISOString().split('T')[0]}.xlsx`);
            this.showToast('Excel file exported successfully', 'success');
        } catch (error) {
            console.error('Excel export error:', error);
            this.showToast('Error exporting to Excel', 'error');
        }
    }

    exportToText() {
        let text = 'Clinical Trial Agreement Checklist (Beta)\n';
        text += '==========================================\n\n';
        
        // Study Information
        text += 'STUDY INFORMATION\n';
        text += '-----------------\n';
        if (this.data.study) {
            Object.entries(this.data.study).forEach(([key, value]) => {
                text += `${key}: ${value || 'N/A'}\n`;
            });
        }
        text += '\n';
        
        // Progress Summary
        const checkboxes = document.querySelectorAll('input[type="checkbox"][data-section]');
        const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
        const total = checkboxes.length;
        text += `PROGRESS SUMMARY\n`;
        text += `----------------\n`;
        text += `Completed: ${completed}/${total} items (${Math.round((completed/total)*100)}%)\n\n`;
        
        // Sections
        document.querySelectorAll('.section[data-section]:not([data-section="study-info"])').forEach(section => {
            const sectionTitle = section.querySelector('.section-title span')?.textContent;
            if (!sectionTitle) return;
            
            text += `${sectionTitle.toUpperCase()}\n`;
            text += '-'.repeat(sectionTitle.length) + '\n';
            
            section.querySelectorAll('.checkbox-item').forEach(item => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                const label = item.querySelector('.checkbox-label');
                const sectionRef = item.querySelector('.section-ref');
                
                if (checkbox && label) {
                    const mark = checkbox.checked ? '✓' : '☐';
                    const ref = sectionRef?.value ? ` [${sectionRef.value}]` : '';
                    text += `${mark} ${label.textContent.trim()}${ref}\n`;
                }
            });
            
            const notes = section.querySelector('.notes-input');
            if (notes && notes.value.trim()) {
                text += `\nNotes: ${notes.value}\n`;
            }
            text += '\n';
        });
        
        text += `\nExported: ${new Date().toLocaleString()}\n`;
        text += `Version: ${this.data.version}\n`;
        
        const blob = new Blob([text], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CTA_Checklist_Beta_${this.data.study.protocol || 'Export'}_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Text file exported successfully', 'success');
    }

    // File Operations
    loadFromFile() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    clearAll() {
        if (confirm('This will clear ALL data including checkboxes, text fields, notes, and version history.\n\nThis action cannot be undone. Are you sure?')) {
            // Clear form data
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            document.querySelectorAll('input[type="text"], input[type="date"]').forEach(input => input.value = '');
            document.querySelectorAll('textarea').forEach(textarea => textarea.value = '');
            
            // Clear stored data
            localStorage.removeItem('cta-checklist-beta-data');
            localStorage.removeItem('cta-checklist-beta-versions');
            
            // Reset data object
            this.data = {
                version: "2.0",
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                study: {},
                checkboxes: {},
                notes: {},
                sectionRefs: {},
                settings: this.data.settings // Keep settings
            };
            
            this.versionHistory = [];
            this.updateProgress();
            this.updateVersionHistoryDisplay();
            this.showToast('All data cleared successfully', 'warning');
        }
    }

    // Utility functions
    getValueById(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    }

    setValueById(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value || '';
        }
    }
}

// File input handler
function loadFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('Loading this file will replace all current data. Continue?')) {
                ctaChecklist.data = { ...ctaChecklist.data, ...data };
                ctaChecklist.restoreFormData();
                ctaChecklist.updateProgress();
                ctaChecklist.showToast('Checklist loaded successfully from file', 'success');
            }
        } catch (error) {
            ctaChecklist.showToast('Error loading file. Please make sure it\'s a valid checklist file.', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

// Global toggle function for sections
function toggleSection(sectionId) {
    if (window.ctaChecklist) {
        ctaChecklist.toggleSection(sectionId);
    }
}

// Initialize the application
let ctaChecklist;
document.addEventListener('DOMContentLoaded', function() {
    ctaChecklist = new CTAChecklistBeta();
});
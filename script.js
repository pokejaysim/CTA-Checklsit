// Update progress
function updateProgress() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const total = checkboxes.length;
    const checked = document.querySelectorAll('input[type="checkbox"]:checked').length;
    const percentage = Math.round((checked / total) * 100);
    document.getElementById('progressText').textContent = `${percentage}% (${checked}/${total} items)`;
    document.getElementById('progressBar').style.width = `${percentage}%`;
    saveChecklist(); // Save state on progress update
}

// Save checklist state to local storage
function saveChecklist() {
    const data = {
        version: "1.1", // Increment version for local storage
        savedDate: new Date().toISOString(),
        study: {
            protocol: document.getElementById('protocol-number').value,
            date: document.getElementById('study-date').value,
            pi: document.getElementById('pi-name').value,
            sponsor: document.getElementById('sponsor-name').value,
            cro: document.getElementById('cro-name').value
        },
        checkboxes: {},
        notes: [],
        generalNotes: document.getElementById('general-notes').value,
        sectionRefs: []
    };
    
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        data.checkboxes[cb.id] = cb.checked;
    });
    
    document.querySelectorAll('.notes-input').forEach(textarea => {
        data.notes.push(textarea.value);
    });
    
    document.querySelectorAll('.section-ref').forEach(input => {
        data.sectionRefs.push(input.value);
    });
    
    localStorage.setItem('ctaChecklistData', JSON.stringify(data));
}

// Load checklist state from local storage
function loadChecklist() {
    const savedData = localStorage.getItem('ctaChecklistData');
    if (!savedData) return;

    try {
        const data = JSON.parse(savedData);
        
        if (data.study) {
            document.getElementById('protocol-number').value = data.study.protocol || '';
            document.getElementById('study-date').value = data.study.date || '';
            document.getElementById('pi-name').value = data.study.pi || '';
            document.getElementById('sponsor-name').value = data.study.sponsor || '';
            document.getElementById('cro-name').value = data.study.cro || '';
        }
        
        if (data.checkboxes) {
            Object.keys(data.checkboxes).forEach(id => {
                const cb = document.getElementById(id);
                if (cb) cb.checked = data.checkboxes[id];
            });
        }
        
        if (data.notes) {
            const textareas = document.querySelectorAll('.notes-input');
            data.notes.forEach((note, i) => {
                if (textareas[i]) textareas[i].value = note;
            });
        }
        
        if (data.generalNotes !== undefined) {
            document.getElementById('general-notes').value = data.generalNotes;
        }
        
        if (data.sectionRefs) {
            const sectionRefs = document.querySelectorAll('.section-ref');
            data.sectionRefs.forEach((ref, i) => {
                if (sectionRefs[i]) sectionRefs[i].value = ref;
            });
        }
        updateProgress(); // Update progress after loading
    } catch (error) {
        console.error("Error loading checklist from local storage:", error);
        // Optionally clear corrupted data
        // localStorage.removeItem('ctaChecklistData');
    }
}

// Clear all function
function clearAll() {
    if (confirm('This will clear ALL checkboxes, text fields, and notes.\n\nAre you sure?')) {
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        document.getElementById('protocol-number').value = '';
        document.getElementById('study-date').value = '';
        document.getElementById('pi-name').value = '';
        document.getElementById('sponsor-name').value = '';
        document.getElementById('cro-name').value = '';
        
        document.querySelectorAll('.notes-input').forEach(textarea => {
            textarea.value = '';
        });
        
        document.getElementById('general-notes').value = '';
        
        document.querySelectorAll('.section-ref').forEach(input => {
            input.value = '';
        });
        
        updateProgress();
        localStorage.removeItem('ctaChecklistData'); // Clear local storage
        alert('Checklist cleared!');
    }
}

// Download saved checklist as JSON file
function downloadSavedFile() {
    const data = {
        version: "1.0",
        savedDate: new Date().toISOString(),
        study: {
            protocol: document.getElementById('protocol-number').value,
            date: document.getElementById('study-date').value,
            pi: document.getElementById('pi-name').value,
            sponsor: document.getElementById('sponsor-name').value,
            cro: document.getElementById('cro-name').value
        },
        checkboxes: {},
        notes: [],
        generalNotes: document.getElementById('general-notes').value,
        sectionRefs: []
    };
    
    // Save checkbox states
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        data.checkboxes[cb.id] = cb.checked;
    });
    
    // Save notes
    document.querySelectorAll('.notes-input').forEach(textarea => {
        data.notes.push(textarea.value);
    });
    
    // Save section references
    document.querySelectorAll('.section-ref').forEach(input => {
        data.sectionRefs.push(input.value);
    });
    
    // Create and download JSON file
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const protocol = document.getElementById('protocol-number').value || 'Checklist';
    a.download = `CTA_Checklist_${protocol}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Load checklist from file
function loadFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Load study info
            if (data.study) {
                document.getElementById('protocol-number').value = data.study.protocol || '';
                document.getElementById('study-date').value = data.study.date || '';
                document.getElementById('pi-name').value = data.study.pi || '';
                document.getElementById('sponsor-name').value = data.study.sponsor || '';
                document.getElementById('cro-name').value = data.study.cro || '';
            }
            
            // Load checkboxes
            if (data.checkboxes) {
                Object.keys(data.checkboxes).forEach(id => {
                    const cb = document.getElementById(id);
                    if (cb) cb.checked = data.checkboxes[id];
                });
            }
            
            // Load notes
            if (data.notes) {
                const textareas = document.querySelectorAll('.notes-input');
                data.notes.forEach((note, i) => {
                    if (textareas[i]) textareas[i].value = note;
                });
            }
            
            // Load general notes
            if (data.generalNotes !== undefined) {
                document.getElementById('general-notes').value = data.generalNotes;
            }
            
            // Load section references
            if (data.sectionRefs) {
                const sectionRefs = document.querySelectorAll('.section-ref');
                data.sectionRefs.forEach((ref, i) => {
                    if (sectionRefs[i]) sectionRefs[i].value = ref;
                });
            }
            
            updateProgress();
            alert('Checklist loaded successfully!');
        } catch (error) {
            alert('Error loading file. Please make sure it\'s a valid checklist file.');
        }
    };
    reader.readAsText(file);
    
    // Reset the file input so the same file can be loaded again
    event.target.value = '';
}

// Export to text
function exportToText() {
    let text = 'Clinical Trial Agreement Checklist\n';
    text += '==================================\n\n';
    
    text += 'STUDY INFORMATION\n';
    text += '-----------------\n';
    text += `Protocol: ${document.getElementById('protocol-number').value || 'N/A'}\n`;
    text += `Date: ${document.getElementById('study-date').value || 'N/A'}\n`;
    text += `PI: ${document.getElementById('pi-name').value || 'N/A'}\n`;
    text += `Sponsor: ${document.getElementById('sponsor-name').value || 'N/A'}\n`;
    text += `CRO: ${document.getElementById('cro-name').value || 'N/A'}\n\n`;
    
    document.querySelectorAll('.section').forEach(section => {
        const title = section.querySelector('.section-title');
        if (!title || title.textContent === 'Study Information') return;
        
        text += `\n${title.textContent}\n`;
        text += '-'.repeat(title.textContent.length) + '\n';
        
        section.querySelectorAll('.checkbox-item').forEach(item => {
            const cb = item.querySelector('input[type="checkbox"]');
            const label = item.querySelector('.checkbox-label');
            const sectionRef = item.querySelector('.section-ref');
            if (cb && label) {
                const indent = item.parentElement.classList.contains('sub-item') ? '  ' : '';
                const mark = cb.checked ? '✓' : ' ';
                const ref = sectionRef && sectionRef.value ? ` [${sectionRef.value}]` : '';
                text += `${indent}[${mark}] ${label.textContent}${ref}\n`;
            }
        });
        
        const notes = section.querySelector('.notes-input');
        if (notes && notes.value.trim()) {
            text += `\nNotes: ${notes.value}\n`;
        }
    });
    
    const generalNotes = document.getElementById('general-notes').value;
    if (generalNotes.trim()) {
        text += '\n\nGENERAL NOTES / ADDITIONAL COMMENTS\n';
        text += '===================================\n';
        text += generalNotes + '\n';
    }
    
    const blob = new Blob([text], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Checklist_${document.getElementById('protocol-number').value || 'Export'}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', function() {
    loadChecklist(); // Load on page load

    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateProgress); // updateProgress calls saveChecklist
    });

    document.querySelectorAll('input[type="text"], input[type="date"], textarea').forEach(input => {
        input.addEventListener('input', saveChecklist); // Save on text input change
    });

    document.getElementById('downloadButton').addEventListener('click', downloadSavedFile);
    document.getElementById('loadButton').addEventListener('click', () => document.getElementById('fileInput').click());
    document.getElementById('fileInput').addEventListener('change', loadFromFile);
    document.getElementById('exportTextButton').addEventListener('click', exportToText);
    document.getElementById('clearAllButton').addEventListener('click', clearAll);
    document.getElementById('printButton').addEventListener('click', printChecklist);
});

// Print checklist
function printChecklist() {
    window.print();
}
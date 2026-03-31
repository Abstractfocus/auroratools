// Auto-Proposal: Bridge CRM Client Tracker and Proposal Generator
// Allows generating pre-filled proposals from CRM client data

var industryMap = [
    { keywords: ['tech', 'software', 'it', 'saas', 'cloud', 'digital'], value: 'Technology' },
    { keywords: ['health', 'medical', 'pharma', 'hospital', 'clinic'], value: 'Healthcare' },
    { keywords: ['bank', 'financial', 'insurance', 'fintech', 'finance'], value: 'Finance' },
    { keywords: ['retail', 'ecommerce', 'shop', 'store', 'commerce'], value: 'Retail' },
    { keywords: ['manufacturing', 'factory', 'industrial', 'production'], value: 'Manufacturing' }
];

function mapIndustry(rawIndustry) {
    if (!rawIndustry) return 'Other';
    var lower = rawIndustry.toLowerCase().trim();

    // Check for exact match with select options first
    var exactOptions = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Other'];
    for (var i = 0; i < exactOptions.length; i++) {
        if (exactOptions[i].toLowerCase() === lower) return exactOptions[i];
    }

    // Keyword matching
    for (var j = 0; j < industryMap.length; j++) {
        var entry = industryMap[j];
        for (var k = 0; k < entry.keywords.length; k++) {
            if (lower.indexOf(entry.keywords[k]) !== -1) {
                return entry.value;
            }
        }
    }

    return 'Other';
}

function showToast(message) {
    // Remove any existing toast
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger slide-up animation on next frame
    requestAnimationFrame(function () {
        toast.classList.add('toast-show');
    });

    // Auto-dismiss after 3 seconds
    setTimeout(function () {
        toast.classList.remove('toast-show');
        setTimeout(function () {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3000);
}

function pulseHighlight(elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;
    el.classList.add('pulse-highlight');
    el.addEventListener('animationend', function handler() {
        el.classList.remove('pulse-highlight');
        el.removeEventListener('animationend', handler);
    });
}

function autoFillProposal(clientId) {
    var clients = getCRMClients();
    var client = null;
    for (var i = 0; i < clients.length; i++) {
        if (clients[i].id === clientId) {
            client = clients[i];
            break;
        }
    }
    if (!client) {
        showToast('Client not found.');
        return;
    }

    // Pre-fill Client Name
    var nameField = document.getElementById('proposalClientName');
    if (nameField) nameField.value = client.name || '';

    // Pre-fill Company
    var companyField = document.getElementById('proposalClientCompany');
    if (companyField) companyField.value = client.company || '';

    // Pre-fill Industry (mapped)
    var industryField = document.getElementById('proposalIndustry');
    if (industryField) industryField.value = mapIndustry(client.industry);

    // Pre-fill challenges from client notes
    var challengesField = document.getElementById('proposalChallenges');
    if (challengesField && client.notes) {
        challengesField.value = client.notes;
    }

    // Switch to the Proposal Generator tab
    var proposalTabBtn = document.querySelector('.tab-btn[data-target="proposalGenerator"]');
    if (proposalTabBtn) {
        proposalTabBtn.click();
    }

    // Show toast notification
    showToast('Pre-filled proposal for ' + client.name + '. Complete the remaining fields.');

    // Highlight unfilled required fields with pulse animation
    setTimeout(function () {
        var engagementField = document.getElementById('proposalEngagement');
        if (engagementField && !engagementField.value) pulseHighlight('proposalEngagement');

        var scopeField = document.getElementById('proposalScope');
        if (scopeField && !scopeField.value) pulseHighlight('proposalScope');

        var budgetField = document.getElementById('proposalBudget');
        if (budgetField && !budgetField.value) pulseHighlight('proposalBudget');
    }, 200);
}

// Quick Proposal dropdown population and handler
function populateQuickProposal() {
    var dropdown = document.getElementById('quickProposalSelect');
    if (!dropdown) return;

    var clients = getCRMClients();
    var eligible = clients.filter(function (c) {
        return c.stage === 'Contacted' || c.stage === 'Proposal Sent';
    });

    // Clear existing options except the placeholder
    dropdown.innerHTML = '<option value="">-- Quick Proposal --</option>';

    eligible.forEach(function (c) {
        var option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.name + ' (' + c.company + ') - ' + c.stage;
        dropdown.appendChild(option);
    });
}

function onQuickProposalChange() {
    var dropdown = document.getElementById('quickProposalSelect');
    if (!dropdown || !dropdown.value) return;
    var clientId = parseInt(dropdown.value, 10);
    autoFillProposal(clientId);
    // Reset dropdown to placeholder
    dropdown.value = '';
}

// Initialize: populate Quick Proposal dropdown and refresh it when CRM renders
(function () {
    // Populate on load
    populateQuickProposal();

    // Patch renderClients to also refresh the Quick Proposal dropdown
    var originalRenderClients = window.renderClients;
    window.renderClients = function () {
        originalRenderClients.apply(this, arguments);
        populateQuickProposal();
    };
})();

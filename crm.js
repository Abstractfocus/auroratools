// CRM-lite Client Tracker
// localStorage key: 'aurora-crm-clients'

function getCRMClients() {
    try {
        return JSON.parse(localStorage.getItem('aurora-crm-clients')) || [];
    } catch (e) {
        return [];
    }
}

function saveCRMClients(clients) {
    localStorage.setItem('aurora-crm-clients', JSON.stringify(clients));
}

function addClient() {
    var name = document.getElementById('crmClientName').value.trim();
    var company = document.getElementById('crmClientCompany').value.trim();
    var email = document.getElementById('crmClientEmail').value.trim();
    var phone = document.getElementById('crmClientPhone').value.trim();
    var industry = document.getElementById('crmClientIndustry').value.trim();
    var stage = document.getElementById('crmClientStage').value;
    var notes = document.getElementById('crmClientNotes').value.trim();
    var followUp = document.getElementById('crmClientFollowUp').value;

    if (!name) {
        alert('Client name is required.');
        return;
    }
    if (!company) {
        alert('Company is required.');
        return;
    }

    var client = {
        id: Date.now(),
        name: name,
        company: company,
        email: email,
        phone: phone,
        industry: industry,
        stage: stage,
        notes: notes,
        followUp: followUp
    };

    var clients = getCRMClients();
    clients.push(client);
    saveCRMClients(clients);

    // Clear form
    document.getElementById('crmClientName').value = '';
    document.getElementById('crmClientCompany').value = '';
    document.getElementById('crmClientEmail').value = '';
    document.getElementById('crmClientPhone').value = '';
    document.getElementById('crmClientIndustry').value = '';
    document.getElementById('crmClientStage').value = 'Lead';
    document.getElementById('crmClientNotes').value = '';
    document.getElementById('crmClientFollowUp').value = '';

    renderClients();
}

function getStageClass(stage) {
    var map = {
        'Lead': 'crm-stage-lead',
        'Contacted': 'crm-stage-contacted',
        'Proposal Sent': 'crm-stage-proposal',
        'Negotiation': 'crm-stage-negotiation',
        'Won': 'crm-stage-won',
        'Lost': 'crm-stage-lost'
    };
    return map[stage] || 'crm-stage-lead';
}

function renderSummaryStats(clients) {
    var total = clients.length;
    var stageCounts = { 'Lead': 0, 'Contacted': 0, 'Proposal Sent': 0, 'Negotiation': 0, 'Won': 0, 'Lost': 0 };
    var now = new Date();
    var sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    var todayStr = now.toISOString().split('T')[0];
    var futureStr = sevenDaysLater.toISOString().split('T')[0];
    var upcomingFollowUps = 0;

    clients.forEach(function (c) {
        if (stageCounts.hasOwnProperty(c.stage)) {
            stageCounts[c.stage]++;
        }
        if (c.followUp && c.followUp >= todayStr && c.followUp <= futureStr) {
            upcomingFollowUps++;
        }
    });

    var html = '<div class="crm-stats">';
    html += '<div class="crm-stat-card"><span class="crm-stat-number">' + total + '</span><span class="crm-stat-label">Total Clients</span></div>';
    Object.keys(stageCounts).forEach(function (stage) {
        html += '<div class="crm-stat-card"><span class="crm-stat-number">' + stageCounts[stage] + '</span><span class="crm-stat-label ' + getStageClass(stage) + '">' + stage + '</span></div>';
    });
    html += '<div class="crm-stat-card"><span class="crm-stat-number">' + upcomingFollowUps + '</span><span class="crm-stat-label">Follow-ups (7 days)</span></div>';
    html += '</div>';

    return html;
}

function renderOverdueAlerts(clients) {
    var todayStr = new Date().toISOString().split('T')[0];
    var overdue = clients.filter(function (c) {
        return c.followUp && c.followUp < todayStr;
    });

    if (overdue.length === 0) return '';

    var html = '<div class="crm-overdue-section">';
    html += '<h3 class="crm-overdue-title">Overdue Follow-ups</h3>';
    overdue.forEach(function (c) {
        html += '<div class="crm-overdue-item">';
        html += '<strong>' + escCRM(c.name) + '</strong> (' + escCRM(c.company) + ') &mdash; Follow-up was due: ' + c.followUp;
        html += '</div>';
    });
    html += '</div>';
    return html;
}

function escCRM(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

var crmSortField = null;
var crmSortAsc = true;

function setCRMSort(field) {
    if (crmSortField === field) {
        crmSortAsc = !crmSortAsc;
    } else {
        crmSortField = field;
        crmSortAsc = true;
    }
    renderClients();
}

function renderClients() {
    var clients = getCRMClients();
    var stageFilter = document.getElementById('crmFilterStage').value;
    var searchTerm = document.getElementById('crmSearch').value.trim().toLowerCase();

    // Filter
    var filtered = clients.filter(function (c) {
        if (stageFilter && c.stage !== stageFilter) return false;
        if (searchTerm) {
            var match = (c.name || '').toLowerCase().indexOf(searchTerm) !== -1 ||
                        (c.company || '').toLowerCase().indexOf(searchTerm) !== -1;
            if (!match) return false;
        }
        return true;
    });

    // Sort
    if (crmSortField) {
        filtered.sort(function (a, b) {
            var valA = (a[crmSortField] || '').toString().toLowerCase();
            var valB = (b[crmSortField] || '').toString().toLowerCase();
            if (valA < valB) return crmSortAsc ? -1 : 1;
            if (valA > valB) return crmSortAsc ? 1 : -1;
            return 0;
        });
    }

    var container = document.getElementById('crmResult');

    // Summary stats (always based on all clients, not filtered)
    var html = renderSummaryStats(clients);

    // Overdue alerts (all clients)
    html += renderOverdueAlerts(clients);

    if (filtered.length === 0) {
        html += '<p>No clients found.</p>';
        container.innerHTML = html;
        return;
    }

    var fields = [
        { key: 'name', label: 'Name' },
        { key: 'company', label: 'Company' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'industry', label: 'Industry' },
        { key: 'stage', label: 'Stage' },
        { key: 'notes', label: 'Notes' },
        { key: 'followUp', label: 'Follow-Up' }
    ];

    html += '<div class="crm-table-wrapper"><table class="crm-table">';
    html += '<thead><tr>';
    fields.forEach(function (f) {
        var arrow = '';
        if (crmSortField === f.key) {
            arrow = crmSortAsc ? ' &#9650;' : ' &#9660;';
        }
        html += '<th onclick="setCRMSort(\'' + f.key + '\')" style="cursor:pointer;">' + f.label + arrow + '</th>';
    });
    html += '<th>Actions</th></tr></thead>';
    html += '<tbody>';

    filtered.forEach(function (c) {
        var rowId = 'crm-row-' + c.id;
        html += '<tr id="' + rowId + '">';
        fields.forEach(function (f) {
            var val = c[f.key] || '';
            if (f.key === 'stage') {
                html += '<td><span class="crm-stage-badge ' + getStageClass(val) + '">' + escCRM(val) + '</span></td>';
            } else {
                html += '<td class="crm-editable" data-id="' + c.id + '" data-field="' + f.key + '">' + escCRM(val) + '</td>';
            }
        });
        html += '<td>';
        html += '<button class="crm-action-btn crm-edit-btn" onclick="editClient(' + c.id + ')">Edit</button> ';
        html += '<button class="crm-action-btn crm-delete-btn" onclick="deleteClient(' + c.id + ')">Delete</button>';
        html += '</td>';
        html += '</tr>';
    });

    html += '</tbody></table></div>';

    html += '<div style="margin-top:12px;">';
    html += '<button class="export-btn" onclick="exportClientsCSV()">Export CSV</button>';
    html += '</div>';

    container.innerHTML = html;
}

function editClient(id) {
    var clients = getCRMClients();
    var client = null;
    for (var i = 0; i < clients.length; i++) {
        if (clients[i].id === id) { client = clients[i]; break; }
    }
    if (!client) return;

    var row = document.getElementById('crm-row-' + id);
    if (!row) return;

    var stages = ['Lead', 'Contacted', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

    var fields = [
        { key: 'name', type: 'text' },
        { key: 'company', type: 'text' },
        { key: 'email', type: 'email' },
        { key: 'phone', type: 'text' },
        { key: 'industry', type: 'text' },
        { key: 'stage', type: 'select', options: stages },
        { key: 'notes', type: 'text' },
        { key: 'followUp', type: 'date' }
    ];

    var cells = row.querySelectorAll('td');
    for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        var cell = cells[i];
        var val = client[f.key] || '';

        if (f.type === 'select') {
            var selectHtml = '<select class="crm-inline-input" data-field="' + f.key + '">';
            f.options.forEach(function (opt) {
                selectHtml += '<option value="' + opt + '"' + (opt === val ? ' selected' : '') + '>' + opt + '</option>';
            });
            selectHtml += '</select>';
            cell.innerHTML = selectHtml;
        } else {
            cell.innerHTML = '<input type="' + f.type + '" class="crm-inline-input" data-field="' + f.key + '" value="' + escCRM(val) + '">';
        }
    }

    // Replace action buttons
    var actionCell = cells[cells.length - 1];
    actionCell.innerHTML = '<button class="crm-action-btn crm-save-btn" onclick="saveClient(' + id + ')">Save</button> ' +
                           '<button class="crm-action-btn crm-cancel-btn" onclick="renderClients()">Cancel</button>';
}

function saveClient(id) {
    var clients = getCRMClients();
    var idx = -1;
    for (var i = 0; i < clients.length; i++) {
        if (clients[i].id === id) { idx = i; break; }
    }
    if (idx === -1) return;

    var row = document.getElementById('crm-row-' + id);
    if (!row) return;

    var inputs = row.querySelectorAll('.crm-inline-input');
    inputs.forEach(function (input) {
        var field = input.getAttribute('data-field');
        clients[idx][field] = input.value.trim();
    });

    saveCRMClients(clients);
    renderClients();
}

function deleteClient(id) {
    if (!confirm('Are you sure you want to delete this client?')) return;
    var clients = getCRMClients();
    clients = clients.filter(function (c) { return c.id !== id; });
    saveCRMClients(clients);
    renderClients();
}

function filterClients() {
    renderClients();
}

function exportClientsCSV() {
    var clients = getCRMClients();
    if (clients.length === 0) {
        alert('No clients to export.');
        return;
    }

    var headers = ['Name', 'Company', 'Email', 'Phone', 'Industry', 'Deal Stage', 'Notes', 'Follow-Up Date'];
    var keys = ['name', 'company', 'email', 'phone', 'industry', 'stage', 'notes', 'followUp'];

    var csvRows = [headers.join(',')];

    clients.forEach(function (c) {
        var row = keys.map(function (k) {
            var val = (c[k] || '').toString().replace(/"/g, '""');
            return '"' + val + '"';
        });
        csvRows.push(row.join(','));
    });

    var csvString = csvRows.join('\n');
    var blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'aurora-crm-clients.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Initialize on load
(function () {
    var filterStage = document.getElementById('crmFilterStage');
    var searchInput = document.getElementById('crmSearch');
    if (filterStage) filterStage.addEventListener('change', filterClients);
    if (searchInput) searchInput.addEventListener('input', filterClients);
    renderClients();
})();

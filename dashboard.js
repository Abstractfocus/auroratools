/**
 * dashboard.js - Client Progress Tracking Dashboard
 * Tracks assessment snapshots over time for multiple clients.
 */

const DASHBOARD_STORAGE_KEY = 'aurora-dashboard-clients';

const dashboardCategories = [
    'Business Operations',
    'Business Development',
    'Technology',
    'Cloud Adoption',
    'Data & Analytics',
    'Automation',
    'Security',
    'Culture'
];

function getDashboardClients() {
    const data = localStorage.getItem(DASHBOARD_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveDashboardClients(clients) {
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(clients));
}

function addDashboardClient() {
    const nameInput = document.getElementById('dashClientName');
    const name = nameInput.value.trim();
    if (!name) {
        alert('Please enter a client name.');
        return;
    }

    const clients = getDashboardClients();
    const id = 'client-' + Date.now();
    clients.push({ id: id, name: name, snapshots: [] });
    saveDashboardClients(clients);
    nameInput.value = '';
    renderDashboard();
}

function addSnapshot() {
    const clientSelect = document.getElementById('dashClientSelect');
    const clientId = clientSelect.value;
    if (!clientId) {
        alert('Please select a client.');
        return;
    }

    const dateInput = document.getElementById('dashSnapshotDate');
    const date = dateInput.value;
    if (!date) {
        alert('Please enter a date.');
        return;
    }

    const scores = {};
    const errors = [];
    dashboardCategories.forEach(cat => {
        const inputId = 'dashScore-' + cat.replace(/[^a-zA-Z]/g, '');
        const val = parseInt(document.getElementById(inputId).value);
        if (isNaN(val) || val < 1 || val > 5) {
            errors.push(cat + ' must be between 1 and 5.');
        }
        scores[cat] = val;
    });

    if (errors.length > 0) {
        document.getElementById('dashboardResult').innerHTML = errors.map(e => '<p class="error">' + e + '</p>').join('');
        return;
    }

    const clients = getDashboardClients();
    const client = clients.find(c => c.id === clientId);
    if (!client) {
        alert('Client not found.');
        return;
    }

    client.snapshots.push({ date: date, scores: scores });
    client.snapshots.sort((a, b) => a.date.localeCompare(b.date));
    saveDashboardClients(clients);

    // Clear score inputs
    dashboardCategories.forEach(cat => {
        const inputId = 'dashScore-' + cat.replace(/[^a-zA-Z]/g, '');
        document.getElementById(inputId).value = '';
    });
    dateInput.value = '';

    renderDashboard();
    renderTrends(clientId);
}

function renderDashboard() {
    const clients = getDashboardClients();
    const selectEl = document.getElementById('dashClientSelect');
    const currentVal = selectEl.value;

    // Rebuild client dropdown
    selectEl.innerHTML = '<option value="">-- Select Client --</option>';
    clients.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        selectEl.appendChild(opt);
    });

    // Restore selection if still valid
    if (currentVal && clients.find(c => c.id === currentVal)) {
        selectEl.value = currentVal;
    }

    // Show client list summary
    const listEl = document.getElementById('dashClientList');
    if (clients.length === 0) {
        listEl.innerHTML = '<p>No clients added yet.</p>';
    } else {
        listEl.innerHTML = clients.map(c =>
            '<div class="result-item"><span class="result-label">' + c.name + '</span>' +
            '<span class="result-value">' + c.snapshots.length + ' snapshot(s)</span></div>'
        ).join('');
    }
}

function renderTrends(clientId) {
    if (!clientId) {
        const selectEl = document.getElementById('dashClientSelect');
        clientId = selectEl.value;
    }
    if (!clientId) {
        document.getElementById('dashboardResult').innerHTML = '<p class="error">Please select a client.</p>';
        return;
    }

    const clients = getDashboardClients();
    const client = clients.find(c => c.id === clientId);
    if (!client || client.snapshots.length === 0) {
        document.getElementById('dashboardResult').innerHTML = '<p>No snapshots recorded for this client yet.</p>';
        return;
    }

    const snapshots = client.snapshots;
    const first = snapshots[0];
    const latest = snapshots[snapshots.length - 1];

    // Build trend table
    let tableHtml = '<h3>Trend View: ' + client.name + '</h3>';
    tableHtml += '<table class="comparison-table"><thead><tr><th>Date</th>';
    dashboardCategories.forEach(cat => {
        tableHtml += '<th>' + cat + '</th>';
    });
    tableHtml += '</tr></thead><tbody>';

    snapshots.forEach(snap => {
        tableHtml += '<tr><td>' + snap.date + '</td>';
        dashboardCategories.forEach(cat => {
            tableHtml += '<td>' + snap.scores[cat] + '</td>';
        });
        tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';

    // Improvement bar chart (latest vs first)
    let chartHtml = '';
    if (snapshots.length >= 2) {
        const chartData = dashboardCategories.map(cat => {
            const firstVal = first.scores[cat] || 0;
            const latestVal = latest.scores[cat] || 0;
            return { label: cat, value: latestVal, maxValue: 5, displayValue: firstVal + ' → ' + latestVal };
        });

        chartHtml += '<h4>Latest vs First Snapshot</h4>';
        chartHtml += createBarChart(chartData, { title: 'Current Scores (First → Latest)', width: 500 });

        // Overall progress percentage
        let totalImprovement = 0;
        let totalPossible = 0;
        dashboardCategories.forEach(cat => {
            const firstVal = first.scores[cat] || 0;
            const latestVal = latest.scores[cat] || 0;
            const maxGain = 5 - firstVal;
            if (maxGain > 0) {
                totalImprovement += (latestVal - firstVal);
                totalPossible += maxGain;
            }
        });

        const progressPct = totalPossible > 0 ? Math.round((totalImprovement / totalPossible) * 100) : 0;
        chartHtml += '<div style="margin-top:15px;">';
        chartHtml += '<p class="overall-score">Overall Progress: ' + progressPct + '%</p>';
        chartHtml += '<div class="bar-track" style="height:16px;"><div class="bar-fill" style="width:' + Math.max(0, Math.min(100, progressPct)) + '%;height:100%;"></div></div>';
        chartHtml += '</div>';
    } else {
        chartHtml += '<p>Add more snapshots to see improvement tracking.</p>';
    }

    document.getElementById('dashboardResult').innerHTML = tableHtml + chartHtml;
}

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', renderDashboard);

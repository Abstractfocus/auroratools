/**
 * utilization.js - Utilization Tracker for Aurora Technologies Tools
 */

var UTIL_STORAGE_KEY = 'aurora-utilization';

function getUtilizationData() {
    try {
        var data = JSON.parse(localStorage.getItem(UTIL_STORAGE_KEY));
        if (data && Array.isArray(data.members)) return data;
    } catch (e) {}
    return { members: [], targetUtilization: 75 };
}

function saveUtilizationData(data) {
    localStorage.setItem(UTIL_STORAGE_KEY, JSON.stringify(data));
}

function addTeamMember() {
    var name = document.getElementById('utilMemberName').value.trim();
    var role = document.getElementById('utilMemberRole').value.trim();
    var rate = parseFloat(document.getElementById('utilMemberRate').value);
    var capacity = parseFloat(document.getElementById('utilMemberCapacity').value) || 160;

    if (!name) {
        alert('Please enter a team member name.');
        return;
    }
    if (!rate || rate <= 0) {
        alert('Please enter a valid hourly rate.');
        return;
    }

    var data = getUtilizationData();
    data.members.push({
        id: Date.now().toString(),
        name: name,
        role: role,
        hourlyRate: rate,
        capacity: capacity,
        billableHours: 0,
        nonBillableHours: 0
    });
    saveUtilizationData(data);

    // Clear inputs
    document.getElementById('utilMemberName').value = '';
    document.getElementById('utilMemberRole').value = '';
    document.getElementById('utilMemberRate').value = '';
    document.getElementById('utilMemberCapacity').value = '160';

    renderUtilizationDashboard();
}

function removeTeamMember(id) {
    var data = getUtilizationData();
    data.members = data.members.filter(function(m) { return m.id !== id; });
    saveUtilizationData(data);
    renderUtilizationDashboard();
}

function updateMemberHours(id, field, value) {
    var data = getUtilizationData();
    for (var i = 0; i < data.members.length; i++) {
        if (data.members[i].id === id) {
            data.members[i][field] = parseFloat(value) || 0;
            break;
        }
    }
    saveUtilizationData(data);
}

function updateTargetUtilization() {
    var val = parseFloat(document.getElementById('utilTargetRate').value) || 75;
    var data = getUtilizationData();
    data.targetUtilization = val;
    saveUtilizationData(data);
    renderUtilizationDashboard();
}

function calculateUtilization() {
    var data = getUtilizationData();

    // Update hours from inputs before calculating
    for (var i = 0; i < data.members.length; i++) {
        var m = data.members[i];
        var billEl = document.getElementById('utilBillable_' + m.id);
        var nonBillEl = document.getElementById('utilNonBillable_' + m.id);
        if (billEl) m.billableHours = parseFloat(billEl.value) || 0;
        if (nonBillEl) m.nonBillableHours = parseFloat(nonBillEl.value) || 0;
    }
    saveUtilizationData(data);
    renderUtilizationDashboard();
}

function getStatusColor(rate, target) {
    if (rate >= target) return '#28a745';       // green
    if (rate >= target * 0.8) return '#ffc107'; // yellow (60-74% default)
    return '#dc3545';                           // red
}

function getStatusClass(rate, target) {
    if (rate >= target) return 'status-green';
    if (rate >= target * 0.8) return 'status-yellow';
    return 'status-red';
}

function renderUtilizationDashboard() {
    var data = getUtilizationData();
    var members = data.members;
    var target = data.targetUtilization || 75;

    // Set target input
    var targetInput = document.getElementById('utilTargetRate');
    if (targetInput) targetInput.value = target;

    var container = document.getElementById('utilizationResult');
    if (!members.length) {
        container.innerHTML = '<p style="color:#888;">No team members added yet. Add a member above to get started.</p>';
        return;
    }

    var totalBillable = 0;
    var totalCapacity = 0;
    var totalBillableRevenue = 0;
    var totalNonBillable = 0;

    // Calculate per-member metrics
    for (var i = 0; i < members.length; i++) {
        var m = members[i];
        m.utilizationRate = m.capacity > 0 ? (m.billableHours / m.capacity) * 100 : 0;
        m.effectiveRate = m.capacity > 0 ? (m.billableHours * m.hourlyRate) / m.capacity : 0;
        m.billableRevenue = m.billableHours * m.hourlyRate;

        totalBillable += m.billableHours;
        totalCapacity += m.capacity;
        totalBillableRevenue += m.billableRevenue;
        totalNonBillable += m.nonBillableHours;
    }

    var teamUtilization = totalCapacity > 0 ? (totalBillable / totalCapacity) * 100 : 0;
    var avgRate = members.length > 0 ? totalBillableRevenue / totalBillable : 0;
    if (!isFinite(avgRate)) avgRate = 0;

    var html = '<h3>Team Summary</h3>';
    html += '<div class="result-grid" style="grid-template-columns:1fr 1fr 1fr;">';
    html += '<div class="result-item"><strong>Team Utilization</strong><br><span style="color:' + getStatusColor(teamUtilization, target) + ';font-size:1.3em;font-weight:bold;">' + teamUtilization.toFixed(1) + '%</span></div>';
    html += '<div class="result-item"><strong>Total Billable Revenue</strong><br>$' + totalBillableRevenue.toLocaleString() + '</div>';
    html += '<div class="result-item"><strong>Average Effective Rate</strong><br>$' + avgRate.toFixed(2) + '/hr</div>';
    html += '</div>';

    html += '<div class="result-grid" style="grid-template-columns:1fr 1fr 1fr;">';
    html += '<div class="result-item"><strong>Total Billable Hours</strong><br>' + totalBillable.toLocaleString() + '</div>';
    html += '<div class="result-item"><strong>Total Capacity</strong><br>' + totalCapacity.toLocaleString() + ' hrs</div>';
    html += '<div class="result-item"><strong>Non-Billable Hours</strong><br>' + totalNonBillable.toLocaleString() + '</div>';
    html += '</div>';

    // Bar chart for utilization
    var barData = [];
    for (var b = 0; b < members.length; b++) {
        barData.push({
            label: members[b].name,
            value: members[b].utilizationRate,
            maxValue: 100,
            displayValue: members[b].utilizationRate.toFixed(1) + '%',
            color: getStatusColor(members[b].utilizationRate, target)
        });
    }
    html += '<div style="margin:20px 0;">';
    html += createBarChart(barData, { title: 'Utilization by Team Member', width: 500 });
    html += '</div>';

    // Member detail rows
    html += '<h3>Team Members</h3>';
    html += '<p style="font-size:0.85em;color:#888;">Target utilization: ' + target + '% | <span class="status-green" style="font-weight:bold;">Green &ge;' + target + '%</span> | <span class="status-yellow" style="font-weight:bold;">Yellow ' + Math.round(target * 0.8) + '-' + (target - 1) + '%</span> | <span class="status-red" style="font-weight:bold;">Red &lt;' + Math.round(target * 0.8) + '%</span></p>';

    for (var r = 0; r < members.length; r++) {
        var mb = members[r];
        var statusCls = getStatusClass(mb.utilizationRate, target);
        var barWidth = Math.min(mb.utilizationRate, 100);

        html += '<div class="utilization-row">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
        html += '<div><strong>' + mb.name + '</strong> <span style="color:#888;font-size:0.9em;">(' + mb.role + ')</span></div>';
        html += '<button onclick="removeTeamMember(\'' + mb.id + '\')" style="background:#dc3545;padding:4px 10px;font-size:0.8em;">Remove</button>';
        html += '</div>';

        html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:8px;">';
        html += '<div><label style="font-size:0.8em;">Billable Hrs</label><input type="number" id="utilBillable_' + mb.id + '" value="' + mb.billableHours + '" min="0" onchange="updateMemberHours(\'' + mb.id + '\',\'billableHours\',this.value)" style="width:100%;"></div>';
        html += '<div><label style="font-size:0.8em;">Non-Billable Hrs</label><input type="number" id="utilNonBillable_' + mb.id + '" value="' + mb.nonBillableHours + '" min="0" onchange="updateMemberHours(\'' + mb.id + '\',\'nonBillableHours\',this.value)" style="width:100%;"></div>';
        html += '<div><label style="font-size:0.8em;">Rate</label><div style="padding:8px 0;font-size:0.9em;">$' + mb.hourlyRate.toFixed(2) + '/hr</div></div>';
        html += '<div><label style="font-size:0.8em;">Capacity</label><div style="padding:8px 0;font-size:0.9em;">' + mb.capacity + ' hrs</div></div>';
        html += '</div>';

        // Utilization bar
        html += '<div class="utilization-bar-container">';
        html += '<div class="utilization-bar ' + statusCls + '" style="width:' + barWidth + '%;"></div>';
        html += '<div class="utilization-bar-target" style="left:' + Math.min(target, 100) + '%;"></div>';
        html += '</div>';

        html += '<div style="display:flex;justify-content:space-between;font-size:0.85em;margin-top:4px;">';
        html += '<span class="' + statusCls + '" style="font-weight:bold;">Utilization: ' + mb.utilizationRate.toFixed(1) + '%</span>';
        html += '<span>Effective Rate: $' + mb.effectiveRate.toFixed(2) + '/hr</span>';
        html += '<span>Revenue: $' + mb.billableRevenue.toLocaleString() + '</span>';
        html += '</div>';
        html += '</div>';
    }

    // Monthly revenue summary
    html += '<h3>Monthly Revenue Summary</h3>';
    html += '<div class="result-grid" style="grid-template-columns:1fr 1fr;">';
    html += '<div class="result-item"><strong>Billable Revenue</strong><br>$' + totalBillableRevenue.toLocaleString() + '</div>';
    html += '<div class="result-item"><strong>Revenue at Full Capacity</strong><br>$' + (function() {
        var full = 0;
        for (var f = 0; f < members.length; f++) full += members[f].capacity * members[f].hourlyRate;
        return full.toLocaleString();
    })() + '</div>';
    html += '</div>';
    html += '<div class="result-item"><strong>Revenue Gap (Lost to Under-Utilization)</strong><br>$' + (function() {
        var full = 0;
        for (var f = 0; f < members.length; f++) full += members[f].capacity * members[f].hourlyRate;
        return (full - totalBillableRevenue).toLocaleString();
    })() + '</div>';

    // Export button
    html += '<button onclick="exportUtilizationCSV()" style="margin-top:15px;">Export CSV</button>';

    container.innerHTML = html;
}

function exportUtilizationCSV() {
    var data = getUtilizationData();
    var members = data.members;
    var headers = ['Name', 'Role', 'Hourly Rate', 'Capacity', 'Billable Hours', 'Non-Billable Hours', 'Utilization %', 'Effective Rate', 'Billable Revenue'];
    var rows = [];
    var totalBillable = 0, totalCapacity = 0, totalRevenue = 0;
    for (var i = 0; i < members.length; i++) {
        var m = members[i];
        var utilRate = m.capacity > 0 ? (m.billableHours / m.capacity) * 100 : 0;
        var effRate = m.capacity > 0 ? (m.billableHours * m.hourlyRate) / m.capacity : 0;
        var rev = m.billableHours * m.hourlyRate;
        totalBillable += m.billableHours;
        totalCapacity += m.capacity;
        totalRevenue += rev;
        rows.push([m.name, m.role, m.hourlyRate, m.capacity, m.billableHours, m.nonBillableHours, utilRate.toFixed(1), effRate.toFixed(2), rev]);
    }
    rows.push([]);
    rows.push(['Team Totals', '', '', totalCapacity, totalBillable, '', totalCapacity > 0 ? ((totalBillable / totalCapacity) * 100).toFixed(1) : 0, '', totalRevenue]);
    exportToCSV('utilization-report.csv', headers, rows);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('utilizationResult');
    if (container) {
        renderUtilizationDashboard();
    }
});

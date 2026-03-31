// KPI Dashboard Builder
// localStorage key: 'aurora-kpis'

function getKPIs() {
    try {
        return JSON.parse(localStorage.getItem('aurora-kpis')) || [];
    } catch (e) {
        return [];
    }
}

function saveKPIs(kpis) {
    localStorage.setItem('aurora-kpis', JSON.stringify(kpis));
}

function addKPI() {
    var nameEl = document.getElementById('kpiName');
    var targetEl = document.getElementById('kpiTarget');
    var unitEl = document.getElementById('kpiUnit');

    var name = nameEl.value.trim();
    var target = parseFloat(targetEl.value);
    var unit = unitEl.value.trim();

    if (!name) {
        alert('Please enter a KPI name.');
        return;
    }
    if (isNaN(target) || target <= 0) {
        alert('Please enter a valid target value greater than 0.');
        return;
    }
    if (!unit) {
        alert('Please enter a unit (e.g. $, %, count).');
        return;
    }

    var kpi = {
        id: Date.now(),
        name: name,
        target: target,
        unit: unit,
        data: []
    };

    var kpis = getKPIs();
    kpis.push(kpi);
    saveKPIs(kpis);

    nameEl.value = '';
    targetEl.value = '';
    unitEl.value = '';

    renderKPIDashboard();
}

function addKPIData(kpiId) {
    var monthEl = document.getElementById('kpiMonth_' + kpiId);
    var yearEl = document.getElementById('kpiYear_' + kpiId);
    var valueEl = document.getElementById('kpiValue_' + kpiId);

    var month = monthEl.value;
    var year = yearEl.value;
    var value = parseFloat(valueEl.value);

    if (!month || !year) {
        alert('Please select a month and year.');
        return;
    }
    if (isNaN(value)) {
        alert('Please enter a valid actual value.');
        return;
    }

    var kpis = getKPIs();
    var kpi = kpis.find(function (k) { return k.id === kpiId; });
    if (!kpi) return;

    // Check for duplicate month/year
    var key = year + '-' + month;
    var existing = kpi.data.findIndex(function (d) { return d.key === key; });
    if (existing >= 0) {
        kpi.data[existing].value = value;
    } else {
        kpi.data.push({ key: key, month: month, year: year, value: value });
    }

    // Sort data chronologically
    kpi.data.sort(function (a, b) {
        if (a.year !== b.year) return parseInt(a.year) - parseInt(b.year);
        return parseInt(a.month) - parseInt(b.month);
    });

    saveKPIs(kpis);
    valueEl.value = '';
    renderKPIDashboard();
}

function deleteKPI(kpiId) {
    if (!confirm('Delete this KPI and all its data?')) return;
    var kpis = getKPIs().filter(function (k) { return k.id !== kpiId; });
    saveKPIs(kpis);
    renderKPIDashboard();
}

function getStatusInfo(actual, target) {
    if (target <= 0) return { color: '#888', label: 'N/A' };
    var pct = (actual / target) * 100;
    if (pct >= 100) return { color: '#28a745', label: 'On Target' };
    if (pct >= 80) return { color: '#ffc107', label: 'Near Target' };
    return { color: '#dc3545', label: 'Below Target' };
}

function getTrend(data) {
    if (data.length < 2) return { arrow: '&#8212;', label: 'Flat', direction: 'flat' };
    var last = data[data.length - 1].value;
    var prev = data[data.length - 2].value;
    if (last > prev) return { arrow: '&#9650;', label: 'Up', direction: 'up' };
    if (last < prev) return { arrow: '&#9660;', label: 'Down', direction: 'down' };
    return { arrow: '&#8212;', label: 'Flat', direction: 'flat' };
}

function createSparkline(dataPoints) {
    if (!dataPoints || dataPoints.length === 0) return '';

    var points = dataPoints.slice(-6);
    var width = 120;
    var height = 32;
    var padding = 4;

    var values = points.map(function (d) { return d.value; });
    var minVal = Math.min.apply(null, values);
    var maxVal = Math.max.apply(null, values);
    var range = maxVal - minVal || 1;

    var coords = values.map(function (v, i) {
        var x = padding + (i / Math.max(values.length - 1, 1)) * (width - 2 * padding);
        var y = height - padding - ((v - minVal) / range) * (height - 2 * padding);
        return x.toFixed(1) + ',' + y.toFixed(1);
    });

    var svg = '<svg width="' + width + '" height="' + height + '" style="vertical-align:middle;">';
    svg += '<polyline points="' + coords.join(' ') + '" fill="none" stroke="#40E0D0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';

    // Draw last point dot
    if (coords.length > 0) {
        var last = coords[coords.length - 1].split(',');
        svg += '<circle cx="' + last[0] + '" cy="' + last[1] + '" r="3" fill="#40E0D0"/>';
    }

    svg += '</svg>';
    return svg;
}

function formatKPIValue(value, unit) {
    if (unit === '$') return '$' + value.toLocaleString();
    if (unit === '%') return value.toLocaleString() + '%';
    return value.toLocaleString() + ' ' + kpiEscapeHTML(unit);
}

function kpiEscapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function renderKPIDashboard() {
    var kpis = getKPIs();

    // Summary
    var summaryEl = document.getElementById('kpiSummary');
    if (kpis.length === 0) {
        summaryEl.innerHTML = '';
    } else {
        var totalKPIs = kpis.length;
        var onTarget = 0;
        var trendingUp = 0;
        kpis.forEach(function (kpi) {
            if (kpi.data.length > 0) {
                var latest = kpi.data[kpi.data.length - 1].value;
                var pct = (latest / kpi.target) * 100;
                if (pct >= 100) onTarget++;
                var trend = getTrend(kpi.data);
                if (trend.direction === 'up') trendingUp++;
            }
        });
        var kpisWithData = kpis.filter(function (k) { return k.data.length > 0; }).length;
        var pctOnTarget = kpisWithData > 0 ? ((onTarget / kpisWithData) * 100).toFixed(0) : 0;
        var pctTrendUp = kpisWithData > 0 ? ((trendingUp / kpisWithData) * 100).toFixed(0) : 0;

        summaryEl.innerHTML =
            '<div style="display:flex; gap:16px; flex-wrap:wrap;">' +
            '<div style="flex:1; min-width:120px; padding:12px 16px; background:#e9ecef; border-radius:4px; text-align:center;">' +
            '<div style="font-size:1.5em; font-weight:bold; color:#0A0A2A;">' + totalKPIs + '</div>' +
            '<div style="font-size:0.85em; color:#555;">Total KPIs</div></div>' +
            '<div style="flex:1; min-width:120px; padding:12px 16px; background:#d4edda; border-radius:4px; text-align:center;">' +
            '<div style="font-size:1.5em; font-weight:bold; color:#28a745;">' + pctOnTarget + '%</div>' +
            '<div style="font-size:0.85em; color:#555;">On Target</div></div>' +
            '<div style="flex:1; min-width:120px; padding:12px 16px; background:#d1ecf1; border-radius:4px; text-align:center;">' +
            '<div style="font-size:1.5em; font-weight:bold; color:#0A0A2A;">' + pctTrendUp + '%</div>' +
            '<div style="font-size:0.85em; color:#555;">Trending Up</div></div>' +
            '</div>';
    }

    // KPI Cards
    var cardsEl = document.getElementById('kpiCards');
    if (kpis.length === 0) {
        cardsEl.innerHTML = '<p style="color:#888;">No KPIs added yet. Use the form above to create one.</p>';
        return;
    }

    var currentYear = new Date().getFullYear();
    var html = '';
    kpis.forEach(function (kpi) {
        var latestValue = kpi.data.length > 0 ? kpi.data[kpi.data.length - 1].value : null;
        var status = latestValue !== null ? getStatusInfo(latestValue, kpi.target) : { color: '#888', label: 'No Data' };
        var trend = getTrend(kpi.data);
        var trendColor = trend.direction === 'up' ? '#28a745' : (trend.direction === 'down' ? '#dc3545' : '#888');

        html += '<div style="padding:16px; background:white; border-radius:8px; box-shadow:0 2px 4px rgba(10,10,42,0.1); border-left:4px solid ' + status.color + ';">';

        // Header row
        html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">';
        html += '<div>';
        html += '<strong style="font-size:1.1em; color:#0A0A2A;">' + kpiEscapeHTML(kpi.name) + '</strong>';
        html += '<div style="font-size:0.85em; color:#888;">Target: ' + formatKPIValue(kpi.target, kpi.unit) + '</div>';
        html += '</div>';
        html += '<button onclick="deleteKPI(' + kpi.id + ')" style="background:#dc3545; padding:4px 10px; font-size:0.85em;">Delete</button>';
        html += '</div>';

        // Metrics row
        html += '<div style="display:flex; gap:16px; flex-wrap:wrap; align-items:center; margin-bottom:12px;">';
        // Latest value
        html += '<div>';
        html += '<div style="font-size:0.8em; color:#888;">Latest</div>';
        html += '<div style="font-size:1.3em; font-weight:bold; color:#0A0A2A;">';
        html += latestValue !== null ? formatKPIValue(latestValue, kpi.unit) : 'N/A';
        html += '</div>';
        html += '</div>';
        // Status
        html += '<div>';
        html += '<div style="font-size:0.8em; color:#888;">Status</div>';
        html += '<div style="font-size:1em; font-weight:bold; color:' + status.color + ';">' + status.label + '</div>';
        html += '</div>';
        // Trend
        html += '<div>';
        html += '<div style="font-size:0.8em; color:#888;">Trend</div>';
        html += '<div style="font-size:1em; color:' + trendColor + ';">' + trend.arrow + ' ' + trend.label + '</div>';
        html += '</div>';
        // Sparkline
        if (kpi.data.length > 0) {
            html += '<div style="margin-left:auto;">' + createSparkline(kpi.data) + '</div>';
        }
        html += '</div>';

        // Add Monthly Data form
        html += '<div style="padding:10px; background:#f8f9fa; border-radius:4px; margin-bottom:8px;">';
        html += '<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:flex-end;">';
        html += '<div class="input-group" style="margin-bottom:0; flex:1; min-width:80px;">';
        html += '<label style="font-size:0.85em;">Month</label>';
        html += '<select id="kpiMonth_' + kpi.id + '" style="font-size:0.9em;">';
        for (var m = 1; m <= 12; m++) {
            html += '<option value="' + m + '">' + monthNames[m - 1] + '</option>';
        }
        html += '</select></div>';
        html += '<div class="input-group" style="margin-bottom:0; flex:1; min-width:80px;">';
        html += '<label style="font-size:0.85em;">Year</label>';
        html += '<select id="kpiYear_' + kpi.id + '" style="font-size:0.9em;">';
        for (var y = currentYear - 2; y <= currentYear + 1; y++) {
            var sel = y === currentYear ? ' selected' : '';
            html += '<option value="' + y + '"' + sel + '>' + y + '</option>';
        }
        html += '</select></div>';
        html += '<div class="input-group" style="margin-bottom:0; flex:1; min-width:100px;">';
        html += '<label style="font-size:0.85em;">Actual Value</label>';
        html += '<input type="number" id="kpiValue_' + kpi.id + '" placeholder="Value" style="font-size:0.9em;">';
        html += '</div>';
        html += '<button onclick="addKPIData(' + kpi.id + ')" style="height:34px; padding:6px 14px; font-size:0.85em;">Add Data</button>';
        html += '</div></div>';

        // Data history (compact table)
        if (kpi.data.length > 0) {
            html += '<details style="margin-top:6px;"><summary style="cursor:pointer; font-size:0.85em; color:#555;">View Data (' + kpi.data.length + ' entries)</summary>';
            html += '<table style="width:100%; border-collapse:collapse; font-size:0.85em; margin-top:6px;">';
            html += '<tr style="border-bottom:1px solid #ddd;"><th style="text-align:left; padding:4px;">Period</th><th style="text-align:right; padding:4px;">Actual</th><th style="text-align:right; padding:4px;">% of Target</th></tr>';
            kpi.data.forEach(function (d) {
                var pct = ((d.value / kpi.target) * 100).toFixed(1);
                var pctColor = pct >= 100 ? '#28a745' : (pct >= 80 ? '#ffc107' : '#dc3545');
                html += '<tr style="border-bottom:1px solid #eee;">';
                html += '<td style="padding:4px;">' + monthNames[parseInt(d.month) - 1] + ' ' + d.year + '</td>';
                html += '<td style="text-align:right; padding:4px;">' + formatKPIValue(d.value, kpi.unit) + '</td>';
                html += '<td style="text-align:right; padding:4px; color:' + pctColor + ';">' + pct + '%</td>';
                html += '</tr>';
            });
            html += '</table></details>';
        }

        html += '</div>';
    });

    cardsEl.innerHTML = html;
}

function exportKPIs() {
    var kpis = getKPIs();
    if (kpis.length === 0) {
        alert('No KPIs to export.');
        return;
    }

    var rows = ['KPI Name,Target,Unit,Period,Actual Value,% of Target'];
    kpis.forEach(function (kpi) {
        if (kpi.data.length === 0) {
            rows.push('"' + kpi.name.replace(/"/g, '""') + '",' + kpi.target + ',' + kpi.unit + ',,,');
        } else {
            kpi.data.forEach(function (d) {
                var pct = ((d.value / kpi.target) * 100).toFixed(1);
                var period = monthNames[parseInt(d.month) - 1] + ' ' + d.year;
                rows.push('"' + kpi.name.replace(/"/g, '""') + '",' + kpi.target + ',' + kpi.unit + ',' + period + ',' + d.value + ',' + pct + '%');
            });
        }
    });

    var csv = rows.join('\n');
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'kpi_dashboard_export.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// Initialize dashboard on load
(function () {
    renderKPIDashboard();
})();

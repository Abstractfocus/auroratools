// Data Pipeline / Export Hub
// Manages export/import of all aurora-* localStorage data

var DP_SOURCES = [
    { key: 'aurora-crm-clients', label: 'CRM Clients', checkboxId: 'dpSrc-crm' },
    { key: 'aurora-kpis', label: 'KPI Data', checkboxId: 'dpSrc-kpi' },
    { key: 'aurora-dashboard-clients', label: 'Dashboard Snapshots', checkboxId: 'dpSrc-dashboard' },
    { key: 'aurora-reminders', label: 'Assessment Reminders', checkboxId: 'dpSrc-reminders' }
];

function dpSelectAll(checked) {
    DP_SOURCES.forEach(function (src) {
        var cb = document.getElementById(src.checkboxId);
        if (cb) cb.checked = checked;
    });
}

function getSelectedSources() {
    var selected = [];
    DP_SOURCES.forEach(function (src) {
        var cb = document.getElementById(src.checkboxId);
        if (cb && cb.checked) {
            selected.push(src);
        }
    });
    return selected;
}

function readSource(key) {
    try {
        var raw = localStorage.getItem(key);
        if (!raw) return [];
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
        return [];
    }
}

function getSourceSize(key) {
    var raw = localStorage.getItem(key);
    if (!raw) return 0;
    return new Blob([raw]).size;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    var units = ['B', 'KB', 'MB'];
    var i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return bytes.toFixed(1) + ' ' + units[i];
}

// --- Data Summary ---

function renderDataSummary() {
    var container = document.getElementById('dpSummaryCards');
    if (!container) return;
    var html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">';

    DP_SOURCES.forEach(function (src) {
        var data = readSource(src.key);
        var size = getSourceSize(src.key);
        var count = data.length;
        var lastUpdated = 'N/A';
        if (count > 0) {
            // Try to find latest timestamp from id or date fields
            var latest = 0;
            data.forEach(function (item) {
                var ts = item.id || item.timestamp || item.date || item.createdAt || 0;
                if (typeof ts === 'number' && ts > latest) latest = ts;
                if (typeof ts === 'string') {
                    var d = new Date(ts).getTime();
                    if (!isNaN(d) && d > latest) latest = d;
                }
            });
            if (latest > 0) {
                lastUpdated = new Date(latest).toLocaleDateString();
            }
        }

        html += '<div style="background: white; border: 1px solid #dee2e6; border-radius: 6px; padding: 14px;">';
        html += '<strong style="color: #0A0A2A;">' + src.label + '</strong><br>';
        html += '<span style="font-size: 0.9em; color: #555;">Records: ' + count + '</span><br>';
        html += '<span style="font-size: 0.9em; color: #555;">Size: ' + formatBytes(size) + '</span><br>';
        html += '<span style="font-size: 0.9em; color: #555;">Last updated: ' + lastUpdated + '</span><br>';
        html += '<div style="margin-top: 8px; display: flex; gap: 6px;">';
        html += '<button onclick="previewData(\'' + src.key + '\')" style="font-size: 0.8em; padding: 4px 10px;">Preview</button>';
        html += '<button onclick="clearSource(\'' + src.key + '\')" style="font-size: 0.8em; padding: 4px 10px; background-color: #dc3545;">Clear</button>';
        html += '</div>';
        html += '</div>';
    });

    html += '</div>';
    container.innerHTML = html;
}

// --- Preview ---

function previewData(source) {
    var data = readSource(source);
    var resultDiv = document.getElementById('dpResult');
    if (data.length === 0) {
        resultDiv.innerHTML = '<p style="color: #888;">No data found for this source.</p>';
        return;
    }

    var label = '';
    DP_SOURCES.forEach(function (s) { if (s.key === source) label = s.label; });

    var preview = data.slice(0, 5);
    var html = '<h3 style="color: #0A0A2A;">Preview: ' + label + ' (first ' + Math.min(5, data.length) + ' of ' + data.length + ')</h3>';
    html += '<div style="overflow-x: auto;">';
    html += '<table style="width: 100%; border-collapse: collapse; font-size: 0.85em;">';

    // Header
    var keys = Object.keys(preview[0]);
    html += '<tr>';
    keys.forEach(function (k) {
        html += '<th style="border: 1px solid #dee2e6; padding: 6px 8px; background: #f8f9fa; text-align: left;">' + k + '</th>';
    });
    html += '</tr>';

    // Rows
    preview.forEach(function (row) {
        html += '<tr>';
        keys.forEach(function (k) {
            var val = row[k];
            if (val === null || val === undefined) val = '';
            if (typeof val === 'object') val = JSON.stringify(val);
            html += '<td style="border: 1px solid #dee2e6; padding: 6px 8px;">' + String(val) + '</td>';
        });
        html += '</tr>';
    });

    html += '</table></div>';
    resultDiv.innerHTML = html;
}

// --- Conversion Functions ---

function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    var keys = Object.keys(data[0]);
    var lines = [];
    lines.push(keys.map(function (k) { return '"' + String(k).replace(/"/g, '""') + '"'; }).join(','));
    data.forEach(function (row) {
        var vals = keys.map(function (k) {
            var v = row[k];
            if (v === null || v === undefined) v = '';
            if (typeof v === 'object') v = JSON.stringify(v);
            return '"' + String(v).replace(/"/g, '""') + '"';
        });
        lines.push(vals.join(','));
    });
    return lines.join('\n');
}

function convertToTSV(data) {
    if (!data || data.length === 0) return '';
    var keys = Object.keys(data[0]);
    var lines = [];
    lines.push(keys.join('\t'));
    data.forEach(function (row) {
        var vals = keys.map(function (k) {
            var v = row[k];
            if (v === null || v === undefined) v = '';
            if (typeof v === 'object') v = JSON.stringify(v);
            return String(v).replace(/\t/g, ' ').replace(/\n/g, ' ');
        });
        lines.push(vals.join('\t'));
    });
    return lines.join('\n');
}

function convertToMarkdown(data) {
    if (!data || data.length === 0) return '';
    var keys = Object.keys(data[0]);
    var lines = [];
    lines.push('| ' + keys.join(' | ') + ' |');
    lines.push('| ' + keys.map(function () { return '---'; }).join(' | ') + ' |');
    data.forEach(function (row) {
        var vals = keys.map(function (k) {
            var v = row[k];
            if (v === null || v === undefined) v = '';
            if (typeof v === 'object') v = JSON.stringify(v);
            return String(v).replace(/\|/g, '\\|');
        });
        lines.push('| ' + vals.join(' | ') + ' |');
    });
    return lines.join('\n');
}

// --- Export ---

function exportData() {
    var selected = getSelectedSources();
    if (selected.length === 0) {
        alert('Please select at least one data source.');
        return;
    }

    var format = 'csv';
    var radios = document.querySelectorAll('input[name="dpFormat"]');
    radios.forEach(function (r) { if (r.checked) format = r.value; });

    var allData = {};
    var counts = {};
    selected.forEach(function (src) {
        var data = readSource(src.key);
        allData[src.key] = data;
        counts[src.label] = data.length;
    });

    var totalRecords = 0;
    Object.keys(counts).forEach(function (k) { totalRecords += counts[k]; });

    if (totalRecords === 0) {
        alert('No data found in the selected sources.');
        return;
    }

    if (format === 'json') {
        var jsonStr = JSON.stringify(allData, null, 2);
        downloadFile(jsonStr, 'aurora-export.json', 'application/json');
    } else if (format === 'csv') {
        if (selected.length === 1) {
            var key = selected[0].key;
            var csv = convertToCSV(allData[key]);
            downloadFile(csv, key + '.csv', 'text/csv');
        } else {
            // Combined: each source separated by a header line
            var combined = '';
            selected.forEach(function (src) {
                if (allData[src.key].length > 0) {
                    combined += '# ' + src.label + '\n';
                    combined += convertToCSV(allData[src.key]) + '\n\n';
                }
            });
            downloadFile(combined, 'aurora-export-combined.csv', 'text/csv');
        }
    } else if (format === 'tsv') {
        var tsvContent = '# Google Sheets Import Instructions:\n';
        tsvContent += '# 1. Open Google Sheets\n';
        tsvContent += '# 2. Go to File > Import > Upload this file\n';
        tsvContent += '# 3. Select "Tab" as the separator type\n';
        tsvContent += '# Or copy-paste the content directly into a sheet.\n\n';
        selected.forEach(function (src) {
            if (allData[src.key].length > 0) {
                tsvContent += '# ' + src.label + '\n';
                tsvContent += convertToTSV(allData[src.key]) + '\n\n';
            }
        });
        downloadFile(tsvContent, 'aurora-export.tsv', 'text/tab-separated-values');
    } else if (format === 'markdown') {
        var md = '';
        selected.forEach(function (src) {
            if (allData[src.key].length > 0) {
                md += '## ' + src.label + '\n\n';
                md += convertToMarkdown(allData[src.key]) + '\n\n';
            }
        });
        downloadFile(md, 'aurora-export.md', 'text/markdown');
    }

    // Show summary
    var summaryParts = [];
    selected.forEach(function (src) {
        var c = counts[src.label];
        if (c > 0) summaryParts.push(c + ' ' + src.label.toLowerCase());
    });

    var resultDiv = document.getElementById('dpResult');
    resultDiv.innerHTML = '<div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 12px; color: #155724;">' +
        '<strong>Export complete!</strong> Exported ' + summaryParts.join(', ') + '.' +
        '</div>';
}

function downloadFile(content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// --- Import ---

function importData(fileInput) {
    var file = fileInput.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            var imported = JSON.parse(e.target.result);
            var totalNew = 0;
            var totalSkipped = 0;

            Object.keys(imported).forEach(function (key) {
                // Only allow known aurora keys
                var isKnown = false;
                DP_SOURCES.forEach(function (src) { if (src.key === key) isKnown = true; });
                if (!isKnown) return;

                var importedRecords = imported[key];
                if (!Array.isArray(importedRecords)) return;

                var existing = readSource(key);
                var existingIds = {};
                existing.forEach(function (item) {
                    if (item.id !== undefined) existingIds[item.id] = true;
                });

                var newRecords = 0;
                var skipped = 0;
                importedRecords.forEach(function (item) {
                    if (item.id !== undefined && existingIds[item.id]) {
                        skipped++;
                    } else {
                        existing.push(item);
                        if (item.id !== undefined) existingIds[item.id] = true;
                        newRecords++;
                    }
                });

                localStorage.setItem(key, JSON.stringify(existing));
                totalNew += newRecords;
                totalSkipped += skipped;
            });

            var resultDiv = document.getElementById('dpResult');
            resultDiv.innerHTML = '<div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 12px; color: #155724;">' +
                '<strong>Import complete!</strong> Imported ' + totalNew + ' new record' + (totalNew !== 1 ? 's' : '') +
                ', skipped ' + totalSkipped + ' duplicate' + (totalSkipped !== 1 ? 's' : '') + '.' +
                '</div>';

            renderDataSummary();
        } catch (err) {
            var resultDiv = document.getElementById('dpResult');
            resultDiv.innerHTML = '<div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 12px; color: #721c24;">' +
                '<strong>Import failed:</strong> Invalid JSON file. ' + err.message +
                '</div>';
        }

        // Reset file input so the same file can be re-imported
        fileInput.value = '';
    };
    reader.readAsText(file);
}

// --- Clear Data ---

function clearAllData() {
    if (!confirm('Are you sure you want to clear ALL Aurora data? This cannot be undone.')) return;

    var keysToRemove = [];
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf('aurora-') === 0) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(function (key) {
        localStorage.removeItem(key);
    });

    var resultDiv = document.getElementById('dpResult');
    resultDiv.innerHTML = '<div style="background: #fff3cd; border: 1px solid #ffeeba; border-radius: 4px; padding: 12px; color: #856404;">' +
        '<strong>All data cleared.</strong> Removed ' + keysToRemove.length + ' data source' + (keysToRemove.length !== 1 ? 's' : '') + '.' +
        '</div>';

    renderDataSummary();
}

function clearSource(key) {
    var label = key;
    DP_SOURCES.forEach(function (s) { if (s.key === key) label = s.label; });
    if (!confirm('Clear all data for "' + label + '"? This cannot be undone.')) return;

    localStorage.removeItem(key);

    var resultDiv = document.getElementById('dpResult');
    resultDiv.innerHTML = '<div style="background: #fff3cd; border: 1px solid #ffeeba; border-radius: 4px; padding: 12px; color: #856404;">' +
        '<strong>Cleared:</strong> ' + label + ' data has been removed.' +
        '</div>';

    renderDataSummary();
}

// --- Init ---

(function () {
    // Render summary on load if the section exists
    if (document.getElementById('dpSummaryCards')) {
        renderDataSummary();
    }
})();

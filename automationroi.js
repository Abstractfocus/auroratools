/**
 * automationroi.js - Automation ROI Calculator for Aurora Technologies Tools
 */

var automationProcesses = [];
var automationResults = null;

function renderProcessForm() {
    var container = document.getElementById('automationProcessList');
    if (!container) return;
    var html = '';
    automationProcesses.forEach(function (proc, idx) {
        html += '<div class="process-entry" style="border:1px solid #ddd;border-radius:6px;padding:15px;margin-bottom:12px;position:relative;">';
        html += '<button onclick="removeAutomationProcess(' + idx + ')" style="position:absolute;top:8px;right:8px;background:#dc3545;padding:4px 10px;font-size:0.85em;">Remove</button>';
        html += '<div class="input-group"><label>Process Name</label>';
        html += '<input type="text" value="' + (proc.name || '') + '" onchange="automationProcesses[' + idx + '].name=this.value" placeholder="e.g. Invoice Processing"></div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">';
        html += '<div class="input-group"><label>Frequency</label><select onchange="automationProcesses[' + idx + '].frequency=this.value">';
        ['Daily', 'Weekly', 'Monthly'].forEach(function (f) {
            html += '<option value="' + f + '"' + (proc.frequency === f ? ' selected' : '') + '>' + f + '</option>';
        });
        html += '</select></div>';
        html += '<div class="input-group"><label>Occurrences per Period</label>';
        html += '<input type="number" value="' + (proc.occurrences || '') + '" onchange="automationProcesses[' + idx + '].occurrences=parseFloat(this.value)||0" placeholder="e.g. 20" min="0"></div>';
        html += '<div class="input-group"><label>Time per Occurrence (min)</label>';
        html += '<input type="number" value="' + (proc.timeMinutes || '') + '" onchange="automationProcesses[' + idx + '].timeMinutes=parseFloat(this.value)||0" placeholder="e.g. 15" min="0"></div>';
        html += '<div class="input-group"><label>People Involved</label>';
        html += '<input type="number" value="' + (proc.people || '') + '" onchange="automationProcesses[' + idx + '].people=parseFloat(this.value)||0" placeholder="e.g. 2" min="1"></div>';
        html += '<div class="input-group"><label>Avg Hourly Cost ($)</label>';
        html += '<input type="number" value="' + (proc.hourlyCost != null ? proc.hourlyCost : 50) + '" onchange="automationProcesses[' + idx + '].hourlyCost=parseFloat(this.value)||0" placeholder="50" min="0"></div>';
        html += '<div class="input-group"><label>Error Rate Before (%)</label>';
        html += '<input type="number" value="' + (proc.errorBefore != null ? proc.errorBefore : 5) + '" onchange="automationProcesses[' + idx + '].errorBefore=parseFloat(this.value)||0" placeholder="5" min="0" max="100"></div>';
        html += '<div class="input-group"><label>Expected Error Rate After (%)</label>';
        html += '<input type="number" value="' + (proc.errorAfter != null ? proc.errorAfter : 1) + '" onchange="automationProcesses[' + idx + '].errorAfter=parseFloat(this.value)||0" placeholder="1" min="0" max="100"></div>';
        html += '</div></div>';
    });
    container.innerHTML = html;
}

function addAutomationProcess() {
    automationProcesses.push({
        name: '',
        frequency: 'Daily',
        occurrences: 0,
        timeMinutes: 0,
        people: 1,
        hourlyCost: 50,
        errorBefore: 5,
        errorAfter: 1
    });
    renderProcessForm();
}

function removeAutomationProcess(idx) {
    automationProcesses.splice(idx, 1);
    renderProcessForm();
}

function getFrequencyMultiplier(freq) {
    if (freq === 'Daily') return 365;
    if (freq === 'Weekly') return 52;
    if (freq === 'Monthly') return 12;
    return 52;
}

function createTimelineChart(savingsData, costsData, options) {
    var width = options.width || 500;
    var height = options.height || 260;
    var padL = 70, padR = 20, padT = options.title ? 36 : 10, padB = 40;
    var chartW = width - padL - padR;
    var chartH = height - padT - padB;
    var months = savingsData.length;
    var allVals = savingsData.concat(costsData);
    var maxVal = Math.max.apply(null, allVals) || 1;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '" style="width:100%;max-width:' + width + 'px;font-family:Arial,sans-serif;">';
    if (options.title) {
        svg += '<text x="' + (width / 2) + '" y="22" text-anchor="middle" font-size="14" font-weight="bold" fill="#ccc">' + options.title + '</text>';
    }
    // axes
    svg += '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (padT + chartH) + '" stroke="#555" stroke-width="1"/>';
    svg += '<line x1="' + padL + '" y1="' + (padT + chartH) + '" x2="' + (padL + chartW) + '" y2="' + (padT + chartH) + '" stroke="#555" stroke-width="1"/>';

    // Y-axis labels (5 ticks)
    for (var t = 0; t <= 4; t++) {
        var yVal = (maxVal / 4) * t;
        var yPos = padT + chartH - (t / 4) * chartH;
        svg += '<text x="' + (padL - 8) + '" y="' + (yPos + 4) + '" text-anchor="end" font-size="10" fill="#999">$' + Math.round(yVal).toLocaleString() + '</text>';
        svg += '<line x1="' + padL + '" y1="' + yPos + '" x2="' + (padL + chartW) + '" y2="' + yPos + '" stroke="#333" stroke-width="0.5" stroke-dasharray="4,3"/>';
    }

    // X-axis labels
    var labelStep = months <= 12 ? 3 : 6;
    for (var m = 0; m < months; m += labelStep) {
        var xPos = padL + (m / (months - 1)) * chartW;
        svg += '<text x="' + xPos + '" y="' + (padT + chartH + 18) + '" text-anchor="middle" font-size="10" fill="#999">Mo ' + (m + 1) + '</text>';
    }

    // Plot savings line
    var savingsPath = '';
    for (var i = 0; i < months; i++) {
        var x = padL + (i / (months - 1)) * chartW;
        var y = padT + chartH - (savingsData[i] / maxVal) * chartH;
        savingsPath += (i === 0 ? 'M' : 'L') + x + ' ' + y;
    }
    svg += '<path d="' + savingsPath + '" fill="none" stroke="#28a745" stroke-width="2.5"/>';

    // Plot costs line
    var costsPath = '';
    for (var j = 0; j < months; j++) {
        var cx = padL + (j / (months - 1)) * chartW;
        var cy = padT + chartH - (costsData[j] / maxVal) * chartH;
        costsPath += (j === 0 ? 'M' : 'L') + cx + ' ' + cy;
    }
    svg += '<path d="' + costsPath + '" fill="none" stroke="#dc3545" stroke-width="2.5" stroke-dasharray="6,3"/>';

    // Find break-even point
    for (var k = 0; k < months; k++) {
        if (savingsData[k] >= costsData[k]) {
            var bx = padL + (k / (months - 1)) * chartW;
            var by = padT + chartH - (savingsData[k] / maxVal) * chartH;
            svg += '<circle cx="' + bx + '" cy="' + by + '" r="5" fill="#40E0D0" stroke="#fff" stroke-width="1.5"/>';
            svg += '<text x="' + bx + '" y="' + (by - 10) + '" text-anchor="middle" font-size="10" fill="#40E0D0" font-weight="bold">Break-even</text>';
            break;
        }
    }

    // Legend
    var legY = padT + chartH + 30;
    svg += '<rect x="' + padL + '" y="' + (legY - 4) + '" width="16" height="3" fill="#28a745"/>';
    svg += '<text x="' + (padL + 20) + '" y="' + legY + '" font-size="10" fill="#ccc">Cumulative Savings</text>';
    svg += '<rect x="' + (padL + 140) + '" y="' + (legY - 4) + '" width="16" height="3" fill="#dc3545"/>';
    svg += '<text x="' + (padL + 160) + '" y="' + legY + '" font-size="10" fill="#ccc">Cumulative Costs</text>';

    svg += '</svg>';
    return svg;
}

function calculateAutomationROI() {
    if (automationProcesses.length === 0) {
        document.getElementById('automationROIResult').innerHTML = '<p style="color:#dc3545;">Please add at least one process to analyze.</p>';
        return;
    }

    var implCost = parseFloat(document.getElementById('autoImplCost').value) || 0;
    var ongoingCost = parseFloat(document.getElementById('autoOngoingCost').value) || 0;
    var savingsRate = 0.8; // 80% time savings from automation

    var processResults = [];
    var totalAnnualHoursSaved = 0;
    var totalAnnualCostSavings = 0;
    var totalErrorSavings = 0;

    automationProcesses.forEach(function (proc) {
        var freqMult = getFrequencyMultiplier(proc.frequency);
        var annualOccurrences = (proc.occurrences || 0) * freqMult;
        var annualHours = annualOccurrences * ((proc.timeMinutes || 0) / 60) * (proc.people || 1);
        var annualCost = annualHours * (proc.hourlyCost || 50);
        var hoursSaved = annualHours * savingsRate;
        var costSaved = annualCost * savingsRate;
        var errorReduction = ((proc.errorBefore || 0) - (proc.errorAfter || 0)) / 100;
        var errorCostSavings = annualCost * errorReduction * 0.15; // error costs ~15% of labor cost

        processResults.push({
            name: proc.name || 'Unnamed Process',
            annualHours: annualHours,
            annualCost: annualCost,
            hoursSaved: hoursSaved,
            costSaved: costSaved,
            errorCostSavings: errorCostSavings,
            totalSavings: costSaved + errorCostSavings
        });

        totalAnnualHoursSaved += hoursSaved;
        totalAnnualCostSavings += costSaved + errorCostSavings;
        totalErrorSavings += errorCostSavings;
    });

    var annualOngoing = ongoingCost * 12;
    var netAnnualSavings = totalAnnualCostSavings - annualOngoing;
    var paybackMonths = netAnnualSavings > 0 ? (implCost / netAnnualSavings) * 12 : Infinity;
    var threeYearROI = implCost + annualOngoing * 3 > 0
        ? ((totalAnnualCostSavings * 3 - implCost - annualOngoing * 3) / (implCost + annualOngoing * 3)) * 100
        : 0;

    // Build results HTML
    var html = '<h3>Automation ROI Results</h3>';

    // Metric cards
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:16px 0;">';
    var metrics = [
        { label: 'Annual Hours Saved', value: Math.round(totalAnnualHoursSaved).toLocaleString() + ' hrs', color: '#40E0D0' },
        { label: 'Annual Cost Savings', value: '$' + Math.round(totalAnnualCostSavings).toLocaleString(), color: '#28a745' },
        { label: 'Error Cost Savings', value: '$' + Math.round(totalErrorSavings).toLocaleString(), color: '#6f42c1' },
        { label: 'Net Annual Savings', value: '$' + Math.round(netAnnualSavings).toLocaleString(), color: netAnnualSavings >= 0 ? '#28a745' : '#dc3545' },
        { label: 'Payback Period', value: paybackMonths === Infinity ? 'N/A' : (paybackMonths < 1 ? '< 1 month' : Math.round(paybackMonths) + ' months'), color: '#ffc107' },
        { label: '3-Year ROI', value: (threeYearROI >= 0 ? '+' : '') + Math.round(threeYearROI) + '%', color: threeYearROI >= 0 ? '#28a745' : '#dc3545' }
    ];
    metrics.forEach(function (m) {
        html += '<div class="automation-metric" style="border-top:3px solid ' + m.color + ';">';
        html += '<div style="font-size:0.85em;color:#888;margin-bottom:4px;">' + m.label + '</div>';
        html += '<div style="font-size:1.4em;font-weight:700;color:' + m.color + ';">' + m.value + '</div>';
        html += '</div>';
    });
    html += '</div>';

    // Bar chart: savings per process
    var barData = processResults.map(function (r, i) {
        var colors = ['#40E0D0', '#28a745', '#ffc107', '#6f42c1', '#fd7e14', '#dc3545', '#0dcaf0'];
        return { label: r.name.substring(0, 18), value: r.totalSavings, displayValue: '$' + Math.round(r.totalSavings).toLocaleString(), color: colors[i % colors.length] };
    });
    if (barData.length > 0) {
        html += '<div style="margin:20px 0;">' + createBarChart(barData, { title: 'Annual Savings per Process', width: 500 }) + '</div>';
    }

    // Timeline chart: cumulative savings vs costs (36 months)
    var timelineMonths = 36;
    var savingsTimeline = [];
    var costsTimeline = [];
    var monthlySavings = totalAnnualCostSavings / 12;
    for (var m = 0; m < timelineMonths; m++) {
        savingsTimeline.push(monthlySavings * (m + 1));
        costsTimeline.push(implCost + ongoingCost * (m + 1));
    }
    html += '<div style="margin:20px 0;">' + createTimelineChart(savingsTimeline, costsTimeline, { title: 'Break-Even Analysis (36 Months)', width: 520, height: 280 }) + '</div>';

    // Process details table
    html += '<h4 style="margin-top:20px;">Process Breakdown</h4>';
    html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.9em;">';
    html += '<tr style="border-bottom:2px solid #40E0D0;"><th style="text-align:left;padding:8px;">Process</th><th style="text-align:right;padding:8px;">Annual Hours</th><th style="text-align:right;padding:8px;">Hours Saved</th><th style="text-align:right;padding:8px;">Cost Saved</th><th style="text-align:right;padding:8px;">Error Savings</th><th style="text-align:right;padding:8px;">Total Savings</th></tr>';
    processResults.forEach(function (r) {
        html += '<tr style="border-bottom:1px solid #333;">';
        html += '<td style="padding:8px;">' + r.name + '</td>';
        html += '<td style="text-align:right;padding:8px;">' + Math.round(r.annualHours).toLocaleString() + '</td>';
        html += '<td style="text-align:right;padding:8px;">' + Math.round(r.hoursSaved).toLocaleString() + '</td>';
        html += '<td style="text-align:right;padding:8px;">$' + Math.round(r.costSaved).toLocaleString() + '</td>';
        html += '<td style="text-align:right;padding:8px;">$' + Math.round(r.errorCostSavings).toLocaleString() + '</td>';
        html += '<td style="text-align:right;padding:8px;font-weight:600;">$' + Math.round(r.totalSavings).toLocaleString() + '</td>';
        html += '</tr>';
    });
    html += '</table></div>';

    // Export button
    html += '<div style="margin-top:16px;"><button onclick="exportAutomationCSV()">Export CSV</button></div>';

    document.getElementById('automationROIResult').innerHTML = html;
    automationResults = { processResults: processResults, implCost: implCost, ongoingCost: ongoingCost, totalAnnualCostSavings: totalAnnualCostSavings, netAnnualSavings: netAnnualSavings, paybackMonths: paybackMonths, threeYearROI: threeYearROI };
}

function exportAutomationCSV() {
    if (!automationResults) return;
    var headers = ['Process', 'Annual Hours', 'Hours Saved', 'Cost Saved', 'Error Savings', 'Total Savings'];
    var rows = automationResults.processResults.map(function (r) {
        return [r.name, Math.round(r.annualHours), Math.round(r.hoursSaved), Math.round(r.costSaved), Math.round(r.errorCostSavings), Math.round(r.totalSavings)];
    });
    rows.push(['---', '---', '---', '---', '---', '---']);
    rows.push(['Implementation Cost', '', '', '', '', automationResults.implCost]);
    rows.push(['Monthly Ongoing Cost', '', '', '', '', automationResults.ongoingCost]);
    rows.push(['Total Annual Savings', '', '', '', '', Math.round(automationResults.totalAnnualCostSavings)]);
    rows.push(['Net Annual Savings', '', '', '', '', Math.round(automationResults.netAnnualSavings)]);
    rows.push(['Payback (months)', '', '', '', '', automationResults.paybackMonths === Infinity ? 'N/A' : Math.round(automationResults.paybackMonths)]);
    rows.push(['3-Year ROI', '', '', '', '', Math.round(automationResults.threeYearROI) + '%']);
    exportToCSV('automation-roi.csv', headers, rows);
}

// Initialize with one empty process
document.addEventListener('DOMContentLoaded', function () {
    if (automationProcesses.length === 0) {
        addAutomationProcess();
    }
});

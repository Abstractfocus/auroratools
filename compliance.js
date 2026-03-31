var complianceFrameworks = {
    'PCI-DSS': [
        'Encrypt cardholder data',
        'Restrict access to cardholder data',
        'Maintain firewall configuration',
        'Regular security testing',
        'Information security policy',
        'Access logging and monitoring'
    ],
    'SOC 2': [
        'Access controls',
        'Encryption at rest and in transit',
        'Incident response plan',
        'Change management process',
        'Monitoring and alerting',
        'Vendor risk management'
    ],
    'GDPR': [
        'Data processing agreement',
        'Consent management',
        'Right to erasure process',
        'Data breach notification procedure',
        'Data Protection Officer appointed',
        'Privacy impact assessment'
    ],
    'General Security': [
        'Multi-factor authentication enabled',
        'Password policy enforced',
        'Employee security training',
        'Backup and recovery plan',
        'Vulnerability scanning',
        'Penetration testing'
    ]
};

function buildComplianceChecklist() {
    var container = document.getElementById('complianceChecklist');
    if (!container) return;
    var html = '';
    var frameworkKeys = Object.keys(complianceFrameworks);
    for (var f = 0; f < frameworkKeys.length; f++) {
        var framework = frameworkKeys[f];
        var items = complianceFrameworks[framework];
        var fId = framework.replace(/[^a-zA-Z0-9]/g, '');
        html += '<div class="compliance-framework">';
        html += '<h3>' + framework + '</h3>';
        for (var i = 0; i < items.length; i++) {
            var name = 'comp_' + fId + '_' + i;
            html += '<div class="compliance-item">';
            html += '<span class="compliance-item-label">' + items[i] + '</span>';
            html += '<div class="compliance-item-options">';
            html += '<label><input type="radio" name="' + name + '" value="yes"> Yes</label>';
            html += '<label><input type="radio" name="' + name + '" value="partial"> Partial</label>';
            html += '<label><input type="radio" name="' + name + '" value="no" checked> No</label>';
            html += '</div>';
            html += '</div>';
        }
        html += '</div>';
    }
    container.innerHTML = html;
}

function assessCompliance() {
    var frameworkKeys = Object.keys(complianceFrameworks);
    var results = {};
    var totalScore = 0;
    var totalMax = 0;
    var criticalGaps = [];
    var partialItems = [];

    for (var f = 0; f < frameworkKeys.length; f++) {
        var framework = frameworkKeys[f];
        var items = complianceFrameworks[framework];
        var fId = framework.replace(/[^a-zA-Z0-9]/g, '');
        var score = 0;

        for (var i = 0; i < items.length; i++) {
            var name = 'comp_' + fId + '_' + i;
            var radios = document.getElementsByName(name);
            var val = 'no';
            for (var r = 0; r < radios.length; r++) {
                if (radios[r].checked) {
                    val = radios[r].value;
                    break;
                }
            }
            if (val === 'yes') {
                score += 2;
            } else if (val === 'partial') {
                score += 1;
                partialItems.push({ framework: framework, item: items[i] });
            } else {
                criticalGaps.push({ framework: framework, item: items[i] });
            }
        }

        var grade;
        if (score >= 10) grade = 'A';
        else if (score >= 8) grade = 'B';
        else if (score >= 6) grade = 'C';
        else if (score >= 4) grade = 'D';
        else grade = 'F';

        results[framework] = { score: score, max: 12, grade: grade };
        totalScore += score;
        totalMax += 12;
    }

    var overallPct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

    // Build output
    var html = '<h3>Compliance Assessment Results</h3>';

    // Overall readiness
    html += '<div class="metric-cards">';
    var overallHealth = overallPct >= 75 ? 'healthy' : (overallPct >= 50 ? 'watch' : 'critical');
    html += '<div class="metric-card ' + overallHealth + '">';
    html += '<div class="metric-card-value">' + overallPct + '%</div>';
    html += '<div class="metric-card-label">Overall Readiness</div>';
    html += '<div class="metric-card-indicator">' + totalScore + ' / ' + totalMax + '</div>';
    html += '</div>';

    // Per-framework grade cards
    for (var f = 0; f < frameworkKeys.length; f++) {
        var fw = frameworkKeys[f];
        var r = results[fw];
        var gradeClass = 'grade-' + r.grade.toLowerCase();
        var cardHealth = r.grade === 'A' ? 'healthy' : (r.grade === 'B' || r.grade === 'C' ? 'watch' : 'critical');
        html += '<div class="metric-card ' + cardHealth + '">';
        html += '<div class="metric-card-value ' + gradeClass + '">' + r.grade + '</div>';
        html += '<div class="metric-card-label">' + fw + '</div>';
        html += '<div class="metric-card-indicator">' + r.score + ' / ' + r.max + '</div>';
        html += '</div>';
    }
    html += '</div>';

    // Bar chart
    var chartData = frameworkKeys.map(function(fw) {
        return {
            label: fw,
            value: results[fw].score,
            maxValue: 12,
            displayValue: results[fw].score + '/12'
        };
    });
    html += '<div style="margin-top:20px;">';
    html += createBarChart(chartData, { title: 'Score by Framework', width: 450 });
    html += '</div>';

    // Critical gaps
    if (criticalGaps.length > 0) {
        html += '<div style="margin-top:20px;">';
        html += '<h4 style="color:#dc3545;">Critical Gaps (' + criticalGaps.length + ')</h4>';
        html += '<ul>';
        for (var g = 0; g < criticalGaps.length; g++) {
            html += '<li><strong>' + criticalGaps[g].framework + ':</strong> ' + criticalGaps[g].item + '</li>';
        }
        html += '</ul>';
        html += '</div>';
    }

    // Partial items
    if (partialItems.length > 0) {
        html += '<div style="margin-top:15px;">';
        html += '<h4 style="color:#ffc107;">Needs Attention (' + partialItems.length + ')</h4>';
        html += '<ul>';
        for (var p = 0; p < partialItems.length; p++) {
            html += '<li><strong>' + partialItems[p].framework + ':</strong> ' + partialItems[p].item + '</li>';
        }
        html += '</ul>';
        html += '</div>';
    }

    // Priority recommendations
    html += '<div style="margin-top:15px;">';
    html += '<h4>Priority Recommendations</h4>';
    html += '<ol>';
    var sortedFrameworks = frameworkKeys.slice().sort(function(a, b) {
        return results[a].score - results[b].score;
    });
    for (var s = 0; s < sortedFrameworks.length; s++) {
        var sf = sortedFrameworks[s];
        var sr = results[sf];
        if (sr.grade === 'F') {
            html += '<li><strong>' + sf + '</strong> requires immediate attention (Grade F). Focus on implementing foundational controls.</li>';
        } else if (sr.grade === 'D') {
            html += '<li><strong>' + sf + '</strong> is below standard (Grade D). Address critical gaps before next audit cycle.</li>';
        } else if (sr.grade === 'C') {
            html += '<li><strong>' + sf + '</strong> is developing (Grade C). Complete partial implementations to reach compliance.</li>';
        } else if (sr.grade === 'B') {
            html += '<li><strong>' + sf + '</strong> is good (Grade B). Close remaining gaps for full compliance.</li>';
        }
    }
    if (sortedFrameworks.every(function(fw) { return results[fw].grade === 'A'; })) {
        html += '<li>All frameworks at Grade A. Maintain current controls and schedule periodic reviews.</li>';
    }
    html += '</ol>';
    html += '</div>';

    // Export button
    html += '<button class="export-btn" onclick="exportComplianceCSV()" style="margin-top:15px;">Export CSV</button>';

    document.getElementById('complianceResult').innerHTML = html;

    // Store for CSV
    window._complianceResults = results;
    window._complianceCriticalGaps = criticalGaps;
    window._compliancePartialItems = partialItems;
    window._complianceOverall = { score: totalScore, max: totalMax, pct: overallPct };
}

function exportComplianceCSV() {
    if (!window._complianceResults) return;
    var headers = ['Framework', 'Score', 'Max', 'Grade'];
    var rows = [];
    var frameworkKeys = Object.keys(window._complianceResults);
    for (var f = 0; f < frameworkKeys.length; f++) {
        var fw = frameworkKeys[f];
        var r = window._complianceResults[fw];
        rows.push([fw, r.score, r.max, r.grade]);
    }
    rows.push([]);
    rows.push(['Overall', window._complianceOverall.score, window._complianceOverall.max, window._complianceOverall.pct + '%']);
    rows.push([]);
    rows.push(['Critical Gaps']);
    for (var g = 0; g < window._complianceCriticalGaps.length; g++) {
        rows.push([window._complianceCriticalGaps[g].framework, window._complianceCriticalGaps[g].item]);
    }
    rows.push([]);
    rows.push(['Partial Items']);
    for (var p = 0; p < window._compliancePartialItems.length; p++) {
        rows.push([window._compliancePartialItems[p].framework, window._compliancePartialItems[p].item]);
    }
    window.exportToCSV('compliance-assessment.csv', headers, rows);
}

// Build checklist on page load
document.addEventListener('DOMContentLoaded', buildComplianceChecklist);

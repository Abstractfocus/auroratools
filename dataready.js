/**
 * dataready.js - Data Readiness Assessment
 * Evaluate if a client's data infrastructure is ready for AI/ML.
 */

var dataReadinessCategories = [
    {
        name: 'Data Quality',
        items: [
            'Data accuracy and completeness',
            'Standardized formats across systems',
            'Deduplication practices in place'
        ]
    },
    {
        name: 'Data Infrastructure',
        items: [
            'Centralized data warehouse',
            'API access to data sources',
            'Real-time data pipelines'
        ]
    },
    {
        name: 'Data Governance',
        items: [
            'Data ownership clearly defined',
            'Access controls and security',
            'Data documentation and catalog'
        ]
    },
    {
        name: 'Analytics Maturity',
        items: [
            'BI/reporting tools in use',
            'Team with analytics skills',
            'Data-driven decision culture'
        ]
    },
    {
        name: 'ML Readiness',
        items: [
            'Labeled training data available',
            'Feature engineering capability',
            'Model deployment infrastructure'
        ]
    },
    {
        name: 'Organizational Readiness',
        items: [
            'Executive sponsorship for AI',
            'AI/ML budget allocated',
            'Change management plan'
        ]
    }
];

function createDataReadinessForm() {
    var container = document.getElementById('dataReadinessForm');
    if (!container) return;
    var html = '';
    dataReadinessCategories.forEach(function(cat, ci) {
        html += '<div style="margin-bottom:20px;padding:16px;border:1px solid #ddd;border-radius:8px;">';
        html += '<h4 style="margin-top:0;">' + cat.name + '</h4>';
        cat.items.forEach(function(item, ii) {
            var id = 'dr_' + ci + '_' + ii;
            html += '<div class="input-group" style="margin-bottom:12px;">';
            html += '<label for="' + id + '">' + item + ' <span class="slider-value" id="' + id + '_val">(3/5)</span></label>';
            html += '<input type="range" min="1" max="5" value="3" id="' + id + '" oninput="document.getElementById(\'' + id + '_val\').textContent=\'(\'+this.value+\'/5)\'">';
            html += '<div style="display:flex;justify-content:space-between;font-size:0.75em;color:#888;"><span>1 - Not at all</span><span>5 - Fully mature</span></div>';
            html += '</div>';
        });
        html += '</div>';
    });
    container.innerHTML = html;
}

function assessDataReadiness() {
    var resultDiv = document.getElementById('dataReadinessResult');
    if (!resultDiv) return;

    var categoryScores = [];
    var allScores = [];

    dataReadinessCategories.forEach(function(cat, ci) {
        var scores = [];
        cat.items.forEach(function(item, ii) {
            var el = document.getElementById('dr_' + ci + '_' + ii);
            var val = el ? parseInt(el.value) : 3;
            scores.push(val);
            allScores.push(val);
        });
        var avg = scores.reduce(function(s, v) { return s + v; }, 0) / scores.length;
        categoryScores.push({ name: cat.name, score: Math.round(avg * 100) / 100, items: scores });
    });

    var overallScore = allScores.reduce(function(s, v) { return s + v; }, 0) / allScores.length;
    overallScore = Math.round(overallScore * 100) / 100;

    var readinessLevel, levelColor;
    if (overallScore >= 4) { readinessLevel = 'AI-Ready'; levelColor = '#28a745'; }
    else if (overallScore >= 3) { readinessLevel = 'Developing'; levelColor = '#ffc107'; }
    else if (overallScore >= 2) { readinessLevel = 'Foundation Building'; levelColor = '#fd7e14'; }
    else { readinessLevel = 'Getting Started'; levelColor = '#dc3545'; }

    var html = '<h3>Data Readiness Assessment Results</h3>';

    // Overall score
    html += '<div style="text-align:center;margin-bottom:20px;">';
    html += '<div style="font-size:2.5em;font-weight:bold;color:' + levelColor + ';">' + overallScore.toFixed(1) + ' / 5.0</div>';
    html += '<div class="ai-category-badge" style="background:' + levelColor + ';color:#fff;font-size:1.1em;padding:6px 18px;">' + readinessLevel + '</div>';
    html += '</div>';

    // Category bar chart
    var chartData = categoryScores.map(function(c) {
        var color = c.score >= 4 ? '#28a745' : c.score >= 3 ? '#ffc107' : c.score >= 2 ? '#fd7e14' : '#dc3545';
        return { label: c.name, value: c.score, maxValue: 5, displayValue: c.score.toFixed(1), color: color };
    });
    html += '<h4>Category Scores</h4>';
    html += createBarChart(chartData, { title: '', width: 480, barHeight: 30 });

    // Gap Analysis
    var gaps = categoryScores.filter(function(c) { return c.score < 3.0; });
    if (gaps.length > 0) {
        html += '<h4>Gap Analysis</h4>';
        var recommendations = {
            'Data Quality': 'Implement data validation rules, establish data quality metrics, and create automated data cleansing pipelines.',
            'Data Infrastructure': 'Invest in a centralized data warehouse or data lake, establish API-first architecture, and build ETL/ELT pipelines.',
            'Data Governance': 'Define data ownership roles, implement access control policies, and create a comprehensive data catalog.',
            'Analytics Maturity': 'Deploy BI tools (e.g., Tableau, Power BI), hire or train analytics talent, and foster data literacy across the organization.',
            'ML Readiness': 'Start labeling datasets, build feature stores, and establish MLOps infrastructure for model deployment.',
            'Organizational Readiness': 'Secure executive buy-in with AI business cases, allocate dedicated AI/ML budget, and develop change management frameworks.'
        };
        gaps.forEach(function(g) {
            html += '<div style="margin-bottom:12px;padding:12px;border-left:3px solid #dc3545;background:#fff5f5;border-radius:4px;">';
            html += '<strong>' + g.name + '</strong> <span style="color:#dc3545;">(' + g.score.toFixed(1) + '/5.0)</span>';
            html += '<p style="margin:6px 0 0;font-size:0.9em;color:#555;">' + (recommendations[g.name] || 'Focus on improving this area before advancing AI initiatives.') + '</p>';
            html += '</div>';
        });
    } else {
        html += '<p style="color:#28a745;font-weight:600;">No significant gaps detected. All categories score 3.0 or above.</p>';
    }

    // Roadmap
    html += '<h4>Recommended Roadmap</h4>';
    var phases = [
        { name: 'Phase 1: Foundations', desc: 'Data quality, governance basics, centralized storage', minLevel: 0, color: '#dc3545' },
        { name: 'Phase 2: Analytics', desc: 'BI tools, reporting dashboards, analytics team building', minLevel: 2, color: '#fd7e14' },
        { name: 'Phase 3: Machine Learning', desc: 'ML models, feature engineering, MLOps pipeline', minLevel: 3, color: '#ffc107' },
        { name: 'Phase 4: Advanced AI', desc: 'Deep learning, real-time AI, autonomous decision systems', minLevel: 4, color: '#28a745' }
    ];
    html += '<div class="readiness-roadmap">';
    phases.forEach(function(phase) {
        var isCurrent = overallScore >= phase.minLevel && overallScore < phase.minLevel + 1;
        var isComplete = overallScore >= phase.minLevel + 1;
        var cls = isCurrent ? 'roadmap-phase current' : isComplete ? 'roadmap-phase complete' : 'roadmap-phase upcoming';
        html += '<div class="' + cls + '" style="border-left-color:' + phase.color + ';">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
        html += '<strong>' + phase.name + '</strong>';
        if (isCurrent) html += '<span class="ai-category-badge" style="background:' + phase.color + ';color:#fff;font-size:0.8em;">Current Phase</span>';
        else if (isComplete) html += '<span style="color:#28a745;font-size:0.85em;">&#10003; Complete</span>';
        else html += '<span style="color:#888;font-size:0.85em;">Upcoming</span>';
        html += '</div>';
        html += '<p style="margin:6px 0 0;font-size:0.9em;color:#666;">' + phase.desc + '</p>';
        html += '</div>';
    });
    html += '</div>';

    // Export buttons
    html += '<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">';
    html += '<button onclick="exportDataReadinessCSV()">Export CSV</button>';
    html += '<button onclick="copyDataReadinessResults()" style="background-color:#0A0A2A;">Copy Results</button>';
    html += '</div>';

    resultDiv.innerHTML = html;
}

function exportDataReadinessCSV() {
    var rows = [['Category', 'Item', 'Score']];
    dataReadinessCategories.forEach(function(cat, ci) {
        cat.items.forEach(function(item, ii) {
            var el = document.getElementById('dr_' + ci + '_' + ii);
            var val = el ? el.value : '3';
            rows.push([cat.name, item, val]);
        });
    });
    var csv = rows.map(function(r) { return r.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'data_readiness_assessment.csv';
    a.click();
}

function copyDataReadinessResults() {
    var resultDiv = document.getElementById('dataReadinessResult');
    if (!resultDiv) return;
    var text = resultDiv.innerText;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
            alert('Results copied to clipboard!');
        });
    } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('Results copied to clipboard!');
    }
}

// Initialize form on load
document.addEventListener('DOMContentLoaded', function() {
    createDataReadinessForm();
});

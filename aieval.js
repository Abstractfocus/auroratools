/**
 * aieval.js - AI Use Case Evaluator
 * Assess which business processes are best suited for AI automation.
 */

var aiUseCases = [];

function renderUseCaseForm() {
    var container = document.getElementById('aiUseCaseList');
    if (!container) return;
    var html = '';
    aiUseCases.forEach(function(uc, idx) {
        html += '<div class="ai-use-case-card" style="margin-bottom:18px;padding:16px;border:1px solid #ddd;border-radius:8px;position:relative;">';
        html += '<button onclick="removeAIUseCase(' + idx + ')" style="position:absolute;top:8px;right:8px;background:#dc3545;padding:4px 10px;font-size:0.85em;">Remove</button>';
        html += '<div class="input-group"><label>Process Name</label>';
        html += '<input type="text" value="' + (uc.name || '') + '" onchange="aiUseCases[' + idx + '].name=this.value" placeholder="e.g. Invoice Processing"></div>';
        html += '<div class="input-group"><label>Department</label>';
        html += '<select onchange="aiUseCases[' + idx + '].department=this.value">';
        var depts = ['Sales','Marketing','Operations','Finance','HR','Customer Service','IT','Product'];
        depts.forEach(function(d) {
            html += '<option value="' + d + '"' + (uc.department === d ? ' selected' : '') + '>' + d + '</option>';
        });
        html += '</select></div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
        html += '<div class="input-group"><label>Current Time Spent (hrs/week)</label>';
        html += '<input type="number" min="0" value="' + (uc.currentTime || '') + '" onchange="aiUseCases[' + idx + '].currentTime=parseFloat(this.value)||0" placeholder="e.g. 20"></div>';
        html += '<div class="input-group"><label>Current Error Rate (%)</label>';
        html += '<input type="number" min="0" max="100" value="' + (uc.errorRate || '') + '" onchange="aiUseCases[' + idx + '].errorRate=parseFloat(this.value)||0" placeholder="e.g. 5"></div>';
        html += '</div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
        html += buildSlider('Data Availability', 'dataAvailability', idx, uc.dataAvailability || 3, '1=No data, 5=Rich structured data');
        html += buildSlider('Repetitiveness', 'repetitiveness', idx, uc.repetitiveness || 3, '1=Unique each time, 5=Highly repetitive');
        html += '</div>';
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
        html += buildSlider('Decision Complexity', 'decisionComplexity', idx, uc.decisionComplexity || 3, '1=Simple rules, 5=Complex judgment');
        html += buildSlider('Strategic Importance', 'strategicImportance', idx, uc.strategicImportance || 3, '1=Low, 5=Critical');
        html += '</div>';
        html += '</div>';
    });
    container.innerHTML = html;
}

function buildSlider(label, field, idx, val, hint) {
    return '<div class="input-group"><label>' + label + ' <span class="slider-value">(' + val + '/5)</span></label>' +
        '<input type="range" min="1" max="5" value="' + val + '" oninput="aiUseCases[' + idx + '].' + field + '=parseInt(this.value);this.previousElementSibling.querySelector(\'.slider-value\').textContent=\'(\'+this.value+\'/5)\'">' +
        '<div style="display:flex;justify-content:space-between;font-size:0.75em;color:#888;"><span>1</span><span>5</span></div>' +
        '<div style="font-size:0.75em;color:#999;">' + hint + '</div></div>';
}

function addAIUseCase() {
    aiUseCases.push({
        name: '',
        department: 'Sales',
        currentTime: 0,
        errorRate: 0,
        dataAvailability: 3,
        repetitiveness: 3,
        decisionComplexity: 3,
        strategicImportance: 3
    });
    renderUseCaseForm();
}

function removeAIUseCase(idx) {
    aiUseCases.splice(idx, 1);
    renderUseCaseForm();
}

function evaluateAIUseCases() {
    var resultDiv = document.getElementById('aiEvalResult');
    if (!resultDiv) return;

    var valid = aiUseCases.filter(function(uc) { return uc.name && uc.name.trim() !== ''; });
    if (valid.length === 0) {
        resultDiv.innerHTML = '<p style="color:#dc3545;">Please add at least one use case with a process name.</p>';
        return;
    }

    var estimatedHourlyCost = 50;
    var evaluated = valid.map(function(uc) {
        var rawScore = (uc.dataAvailability * 0.3) + (uc.repetitiveness * 0.25) + ((6 - uc.decisionComplexity) * 0.25) + (uc.strategicImportance * 0.2);
        var score = (rawScore / 5) * 100;
        var timeSaved = uc.currentTime * (score / 100) * 0.7;
        var annualSavings = timeSaved * 52 * estimatedHourlyCost;
        var category;
        if (score >= 70 && uc.decisionComplexity <= 2) {
            category = 'Quick Win';
        } else if (score >= 70 && uc.decisionComplexity >= 3) {
            category = 'Strategic Investment';
        } else if (score >= 40) {
            category = 'Future Consideration';
        } else {
            category = 'Not Recommended';
        }
        return {
            name: uc.name,
            department: uc.department,
            currentTime: uc.currentTime,
            errorRate: uc.errorRate,
            dataAvailability: uc.dataAvailability,
            repetitiveness: uc.repetitiveness,
            decisionComplexity: uc.decisionComplexity,
            strategicImportance: uc.strategicImportance,
            score: Math.round(score * 10) / 10,
            timeSaved: Math.round(timeSaved * 10) / 10,
            annualSavings: Math.round(annualSavings),
            category: category
        };
    });

    evaluated.sort(function(a, b) { return b.score - a.score; });

    var totalTimeSaved = evaluated.reduce(function(s, e) { return s + e.timeSaved; }, 0);
    var totalAnnualSavings = evaluated.reduce(function(s, e) { return s + e.annualSavings; }, 0);

    var html = '<h3>AI Use Case Evaluation Results</h3>';

    // Summary
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">';
    html += '<div class="result-item result-highlight"><span class="result-label">Total Potential Hours Saved/Week</span><span class="result-value">' + (Math.round(totalTimeSaved * 10) / 10) + ' hrs</span></div>';
    html += '<div class="result-item result-highlight"><span class="result-label">Total Est. Annual Savings</span><span class="result-value">$' + totalAnnualSavings.toLocaleString() + '</span></div>';
    html += '</div>';

    // Use case cards
    html += '<h4>Ranked Use Cases</h4>';
    evaluated.forEach(function(e) {
        var badgeColor = e.category === 'Quick Win' ? '#28a745' : e.category === 'Strategic Investment' ? '#6f42c1' : e.category === 'Future Consideration' ? '#ffc107' : '#dc3545';
        var badgeText = e.category === 'Future Consideration' ? '#333' : '#fff';
        html += '<div class="ai-use-case-card" style="margin-bottom:14px;padding:16px;border:1px solid #ddd;border-radius:8px;">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
        html += '<strong style="font-size:1.1em;">' + e.name + '</strong>';
        html += '<span class="ai-category-badge" style="background:' + badgeColor + ';color:' + badgeText + ';">' + e.category + '</span>';
        html += '</div>';
        html += '<div style="font-size:0.85em;color:#888;margin-bottom:8px;">' + e.department + '</div>';
        // Score meter
        var meterColor = e.score >= 70 ? '#28a745' : e.score >= 40 ? '#ffc107' : '#dc3545';
        html += '<div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;font-size:0.85em;"><span>AI Readiness Score</span><span style="font-weight:600;">' + e.score + '/100</span></div>';
        html += '<div style="background:#e9ecef;border-radius:4px;height:8px;overflow:hidden;"><div style="width:' + e.score + '%;height:100%;background:' + meterColor + ';border-radius:4px;transition:width 0.4s ease;"></div></div></div>';
        html += '<div class="result-grid" style="grid-template-columns:1fr 1fr 1fr;font-size:0.9em;">';
        html += '<div class="result-item"><span class="result-label">Time Saved/Week</span><span class="result-value">' + e.timeSaved + ' hrs</span></div>';
        html += '<div class="result-item"><span class="result-label">Annual Savings</span><span class="result-value">$' + e.annualSavings.toLocaleString() + '</span></div>';
        html += '<div class="result-item"><span class="result-label">Error Rate</span><span class="result-value">' + e.errorRate + '%</span></div>';
        html += '</div></div>';
    });

    // Priority Matrix (2x2)
    html += '<h4>Priority Matrix</h4>';
    html += '<div class="priority-matrix">';
    html += '<div class="priority-matrix-ylabel">Business Impact &rarr;</div>';
    html += '<div class="priority-matrix-grid">';
    // Quadrants: TL=Strategic Investment, TR=Quick Win, BL=Not Recommended, BR=Future Consideration
    var quadrants = [
        { label: 'Strategic Investment', items: [], cls: 'q-strategic' },
        { label: 'Quick Win', items: [], cls: 'q-quickwin' },
        { label: 'Not Recommended', items: [], cls: 'q-notrec' },
        { label: 'Future Consideration', items: [], cls: 'q-future' }
    ];
    evaluated.forEach(function(e) {
        var ease = (6 - e.decisionComplexity); // higher = easier
        var impact = e.score;
        if (ease >= 3 && impact >= 50) quadrants[1].items.push(e.name);
        else if (ease < 3 && impact >= 50) quadrants[0].items.push(e.name);
        else if (ease >= 3 && impact < 50) quadrants[3].items.push(e.name);
        else quadrants[2].items.push(e.name);
    });
    html += '<div class="priority-matrix-header"></div><div class="priority-matrix-header">Hard to Implement</div><div class="priority-matrix-header">Easy to Implement</div>';
    html += '<div class="priority-matrix-rowlabel">High Impact</div>';
    html += '<div class="priority-matrix-cell ' + quadrants[0].cls + '"><strong>' + quadrants[0].label + '</strong><br>' + (quadrants[0].items.length > 0 ? quadrants[0].items.join(', ') : '<em>None</em>') + '</div>';
    html += '<div class="priority-matrix-cell ' + quadrants[1].cls + '"><strong>' + quadrants[1].label + '</strong><br>' + (quadrants[1].items.length > 0 ? quadrants[1].items.join(', ') : '<em>None</em>') + '</div>';
    html += '<div class="priority-matrix-rowlabel">Low Impact</div>';
    html += '<div class="priority-matrix-cell ' + quadrants[2].cls + '"><strong>' + quadrants[2].label + '</strong><br>' + (quadrants[2].items.length > 0 ? quadrants[2].items.join(', ') : '<em>None</em>') + '</div>';
    html += '<div class="priority-matrix-cell ' + quadrants[3].cls + '"><strong>' + quadrants[3].label + '</strong><br>' + (quadrants[3].items.length > 0 ? quadrants[3].items.join(', ') : '<em>None</em>') + '</div>';
    html += '</div></div>';

    // Bar chart
    var chartData = evaluated.slice(0, 10).map(function(e) {
        return { label: e.name.length > 18 ? e.name.substring(0, 16) + '..' : e.name, value: e.score, maxValue: 100, displayValue: e.score };
    });
    if (chartData.length > 0) {
        html += '<h4>Top Use Cases by AI Readiness Score</h4>';
        html += createBarChart(chartData, { title: '', width: 500 });
    }

    // Export CSV
    html += '<div style="margin-top:16px;"><button onclick="exportAIEvalCSV()">Export CSV</button></div>';

    resultDiv.innerHTML = html;
}

function exportAIEvalCSV() {
    var valid = aiUseCases.filter(function(uc) { return uc.name && uc.name.trim() !== ''; });
    if (valid.length === 0) return;
    var estimatedHourlyCost = 50;
    var rows = [['Process Name','Department','Current Time (hrs/wk)','Error Rate (%)','Data Availability','Repetitiveness','Decision Complexity','Strategic Importance','AI Readiness Score','Category','Time Saved (hrs/wk)','Annual Savings ($)']];
    valid.forEach(function(uc) {
        var rawScore = (uc.dataAvailability * 0.3) + (uc.repetitiveness * 0.25) + ((6 - uc.decisionComplexity) * 0.25) + (uc.strategicImportance * 0.2);
        var score = Math.round(((rawScore / 5) * 100) * 10) / 10;
        var timeSaved = Math.round((uc.currentTime * (score / 100) * 0.7) * 10) / 10;
        var annualSavings = Math.round(timeSaved * 52 * estimatedHourlyCost);
        var category;
        if (score >= 70 && uc.decisionComplexity <= 2) category = 'Quick Win';
        else if (score >= 70) category = 'Strategic Investment';
        else if (score >= 40) category = 'Future Consideration';
        else category = 'Not Recommended';
        rows.push([uc.name, uc.department, uc.currentTime, uc.errorRate, uc.dataAvailability, uc.repetitiveness, uc.decisionComplexity, uc.strategicImportance, score, category, timeSaved, annualSavings]);
    });
    var csv = rows.map(function(r) { return r.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ai_use_case_evaluation.csv';
    a.click();
}

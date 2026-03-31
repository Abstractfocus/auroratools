var savedTCOScenario = null;

function clearTCOComparison() {
    savedTCOScenario = null;
    calculateTCO();
}

function saveTCOForComparison(scenario, btn) {
    savedTCOScenario = scenario;
    if (btn) {
        var orig = btn.textContent;
        btn.textContent = 'Scenario 1 saved';
        btn.disabled = true;
        setTimeout(function () {
            btn.textContent = orig;
            btn.disabled = false;
        }, 1500);
    }
}

function buildTCOComparisonTable(saved, current) {
    var fmt = function (val) {
        return '$' + val.toLocaleString(undefined, { maximumFractionDigits: 2 });
    };
    var diffCell = function (v1, v2) {
        var diff = v2 - v1;
        var sign = diff > 0 ? '+' : '';
        var pct = v1 !== 0 ? (sign + ((diff / v1) * 100).toFixed(1) + '%') : 'N/A';
        return sign + '$' + Math.abs(diff).toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' (' + pct + ')';
    };

    var rows = [
        { label: 'Upfront Costs', k: 'upfront' },
        { label: 'Ongoing Costs', k: 'ongoing' },
        { label: 'Total TCO', k: 'total', highlight: true },
        { label: 'Annualized Cost', k: 'annualized' },
        { label: 'Monthly Cost', k: 'monthly' }
    ];

    var tableRows = rows.map(function (r) {
        var style = r.highlight ? ' style="font-weight:bold;"' : '';
        return '<tr' + style + '>' +
            '<td style="padding:6px 12px;border:1px solid #ddd;">' + r.label + '</td>' +
            '<td style="padding:6px 12px;border:1px solid #ddd;text-align:right;">' + fmt(saved[r.k]) + '</td>' +
            '<td style="padding:6px 12px;border:1px solid #ddd;text-align:right;">' + fmt(current[r.k]) + '</td>' +
            '<td style="padding:6px 12px;border:1px solid #ddd;text-align:right;">' + diffCell(saved[r.k], current[r.k]) + '</td>' +
            '</tr>';
    }).join('');

    return '<h3 style="margin-top:24px;">Scenario Comparison</h3>' +
        '<table style="width:100%;border-collapse:collapse;margin:12px 0;">' +
        '<thead><tr style="background-color:#0A0A2A;color:white;">' +
        '<th style="padding:8px 12px;border:1px solid #ddd;text-align:left;">Metric</th>' +
        '<th style="padding:8px 12px;border:1px solid #ddd;text-align:right;">Scenario 1</th>' +
        '<th style="padding:8px 12px;border:1px solid #ddd;text-align:right;">Scenario 2 (Current)</th>' +
        '<th style="padding:8px 12px;border:1px solid #ddd;text-align:right;">Difference</th>' +
        '</tr></thead><tbody>' + tableRows + '</tbody></table>';
}

function calculateTCO() {
    const softwareCost = parseFloat(document.getElementById('softwareCost').value) || 0;
    const hardwareCost = parseFloat(document.getElementById('hardwareCost').value) || 0;
    const implementationCost = parseFloat(document.getElementById('implementationCost').value) || 0;
    const annualMaintenance = parseFloat(document.getElementById('annualMaintenance').value) || 0;
    const trainingCost = parseFloat(document.getElementById('trainingCost').value) || 0;
    const yearsOwned = parseInt(document.getElementById('yearsOwned').value) || 0;

    const errors = [];
    if (isNaN(yearsOwned) || yearsOwned < 1) {
        errors.push('Ownership period must be at least 1 year.');
    }
    if (softwareCost + hardwareCost + implementationCost + annualMaintenance + trainingCost <= 0) {
        errors.push('At least one cost field must be greater than 0.');
    }
    if (errors.length > 0) {
        document.getElementById('tcoResult').innerHTML = errors.map(e => `<p class="error">${e}</p>`).join('');
        return;
    }

    const upfrontCosts = softwareCost + hardwareCost + implementationCost + trainingCost;
    const ongoingCosts = annualMaintenance * yearsOwned;
    const totalTCO = upfrontCosts + ongoingCosts;
    const annualizedCost = totalTCO / yearsOwned;
    const monthlyCost = annualizedCost / 12;

    const currentScenario = {
        upfront: upfrontCosts,
        ongoing: ongoingCosts,
        total: totalTCO,
        annualized: annualizedCost,
        monthly: monthlyCost
    };

    const resultDiv = document.getElementById('tcoResult');
    let html = `
        <h3>Total Cost of Ownership</h3>
        <div class="result-grid">
            <div class="result-item">
                <span class="result-label">Upfront Costs</span>
                <span class="result-value">$${upfrontCosts.toLocaleString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Ongoing Costs (${yearsOwned} yr)</span>
                <span class="result-value">$${ongoingCosts.toLocaleString()}</span>
            </div>
            <div class="result-item result-highlight">
                <span class="result-label">Total TCO</span>
                <span class="result-value">$${totalTCO.toLocaleString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Annualized Cost</span>
                <span class="result-value">$${annualizedCost.toLocaleString(undefined, {maximumFractionDigits: 2})}/yr</span>
            </div>
            <div class="result-item">
                <span class="result-label">Monthly Cost</span>
                <span class="result-value">$${monthlyCost.toLocaleString(undefined, {maximumFractionDigits: 2})}/mo</span>
            </div>
        </div>
        <div style="margin:16px 0;">${(() => {
            const chartData = [
                { label: 'Software/Licensing', value: softwareCost, maxValue: totalTCO, color: '#40E0D0', displayValue: '$' + softwareCost.toLocaleString() },
                { label: 'Hardware', value: hardwareCost, maxValue: totalTCO, color: '#28a745', displayValue: '$' + hardwareCost.toLocaleString() },
                { label: 'Implementation', value: implementationCost, maxValue: totalTCO, color: '#ffc107', displayValue: '$' + implementationCost.toLocaleString() },
                { label: 'Training', value: trainingCost, maxValue: totalTCO, color: '#6f42c1', displayValue: '$' + trainingCost.toLocaleString() },
                { label: 'Ongoing (' + yearsOwned + ' yr)', value: ongoingCosts, maxValue: totalTCO, color: '#dc3545', displayValue: '$' + ongoingCosts.toLocaleString() }
            ];
            return createBarChart(chartData, { width: 460, barHeight: 28, title: 'Upfront vs Ongoing Costs' });
        })()}</div>`;

    if (savedTCOScenario) {
        html += buildTCOComparisonTable(savedTCOScenario, currentScenario);
    }

    html += `
        <p>Contact Aurora Technologies for a detailed TCO analysis and cost optimization strategies.</p>
        <button class="export-btn" onclick="exportToCSV('tco-results.csv', ['Metric', 'Value'], [['Upfront Costs', '${upfrontCosts.toFixed(2)}'], ['Ongoing Costs', '${ongoingCosts.toFixed(2)}'], ['Total TCO', '${totalTCO.toFixed(2)}'], ['Annualized Cost', '${annualizedCost.toFixed(2)}'], ['Monthly Cost', '${monthlyCost.toFixed(2)}']])">Export CSV</button>
    `;

    resultDiv.innerHTML = html;

    // Add Save for Comparison button
    var saveBtn = document.createElement('button');
    saveBtn.className = 'export-btn';
    saveBtn.style.marginLeft = '8px';
    saveBtn.textContent = 'Save for Comparison';
    saveBtn.addEventListener('click', function () {
        saveTCOForComparison(currentScenario, saveBtn);
    });
    resultDiv.appendChild(saveBtn);

    // Add Clear Comparison button if a saved scenario exists
    if (savedTCOScenario) {
        var clearBtn = document.createElement('button');
        clearBtn.className = 'export-btn';
        clearBtn.style.marginLeft = '8px';
        clearBtn.style.backgroundColor = '#dc3545';
        clearBtn.textContent = 'Clear Comparison';
        clearBtn.addEventListener('click', function () {
            clearTCOComparison();
        });
        resultDiv.appendChild(clearBtn);
    }

    if (typeof addShareButton === 'function') addShareButton('tco');
}

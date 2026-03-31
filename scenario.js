function compareScenarios() {
    // Parse baseline inputs
    const revenue = parseFloat(document.getElementById('scenarioRevenue').value);
    const employees = parseInt(document.getElementById('scenarioEmployees').value);
    const costs = parseFloat(document.getElementById('scenarioCosts').value);
    const customers = parseInt(document.getElementById('scenarioCustomers').value);
    const satisfaction = parseFloat(document.getElementById('scenarioSatisfaction').value);

    const errors = [];
    if (isNaN(revenue) || revenue <= 0) errors.push('Annual revenue must be a positive number.');
    if (isNaN(employees) || employees <= 0) errors.push('Employee count must be a positive whole number.');
    if (isNaN(costs) || costs <= 0) errors.push('Operating costs must be a positive number.');
    if (isNaN(customers) || customers <= 0) errors.push('Customer count must be a positive whole number.');
    if (isNaN(satisfaction) || satisfaction < 1 || satisfaction > 10) errors.push('Customer satisfaction must be between 1 and 10.');

    if (errors.length > 0) {
        document.getElementById('scenarioResult').innerHTML = errors.map(e => `<p class="error">${e}</p>`).join('');
        return;
    }

    // Parse scenario adjustments
    const scenarios = ['A', 'B', 'C'].map(letter => {
        const prefix = 'scenario' + letter;
        return {
            name: document.getElementById(prefix + 'Name').value || ('Scenario ' + letter),
            revenueGrowth: parseFloat(document.getElementById(prefix + 'Revenue').value) || 0,
            employeeChange: parseFloat(document.getElementById(prefix + 'Employees').value) || 0,
            costChange: parseFloat(document.getElementById(prefix + 'Costs').value) || 0,
            customerGrowth: parseFloat(document.getElementById(prefix + 'Customers').value) || 0,
            satisfactionChange: parseFloat(document.getElementById(prefix + 'Satisfaction').value) || 0
        };
    });

    // Calculate baseline derived metrics
    const baselineProfit = revenue - costs;
    const baselineMargin = revenue > 0 ? (baselineProfit / revenue) * 100 : 0;
    const baselineRevPerEmp = employees > 0 ? revenue / employees : 0;
    const baselineCostPerCust = customers > 0 ? costs / customers : 0;

    // Calculate projected values for each scenario
    const projections = scenarios.map(s => {
        const projRevenue = revenue * (1 + s.revenueGrowth / 100);
        const projEmployees = Math.round(employees * (1 + s.employeeChange / 100));
        const projCosts = costs * (1 + s.costChange / 100);
        const projCustomers = Math.round(customers * (1 + s.customerGrowth / 100));
        const projSatisfaction = Math.min(10, Math.max(1, satisfaction + s.satisfactionChange));
        const projProfit = projRevenue - projCosts;
        const projMargin = projRevenue > 0 ? (projProfit / projRevenue) * 100 : 0;
        const projRevPerEmp = projEmployees > 0 ? projRevenue / projEmployees : 0;
        const projCostPerCust = projCustomers > 0 ? projCosts / projCustomers : 0;

        return {
            name: s.name,
            revenue: projRevenue,
            employees: projEmployees,
            costs: projCosts,
            customers: projCustomers,
            satisfaction: projSatisfaction,
            profit: projProfit,
            margin: projMargin,
            revPerEmp: projRevPerEmp,
            costPerCust: projCostPerCust
        };
    });

    // Find best scenario (highest profit margin)
    let bestIdx = 0;
    projections.forEach((p, i) => {
        if (p.margin > projections[bestIdx].margin) bestIdx = i;
    });

    // Format currency
    const fmt = v => '$' + v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const fmtDec = v => '$' + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const pct = v => v.toFixed(1) + '%';

    // Build comparison table
    const rows = [
        { label: 'Revenue', base: fmt(revenue), vals: projections.map(p => fmt(p.revenue)) },
        { label: 'Employees', base: employees.toLocaleString(), vals: projections.map(p => p.employees.toLocaleString()) },
        { label: 'Operating Costs', base: fmt(costs), vals: projections.map(p => fmt(p.costs)) },
        { label: 'Customers', base: customers.toLocaleString(), vals: projections.map(p => p.customers.toLocaleString()) },
        { label: 'Satisfaction', base: satisfaction.toFixed(1), vals: projections.map(p => p.satisfaction.toFixed(1)) },
        { label: 'Revenue per Employee', base: fmtDec(baselineRevPerEmp), vals: projections.map(p => fmtDec(p.revPerEmp)) },
        { label: 'Cost per Customer', base: fmtDec(baselineCostPerCust), vals: projections.map(p => fmtDec(p.costPerCust)) },
        { label: 'Profit Margin', base: pct(baselineMargin), vals: projections.map(p => pct(p.margin)) }
    ];

    const highlightStyle = 'style="color:#28a745;font-weight:bold;"';
    let tableHTML = '<table class="scenario-table"><thead><tr>';
    tableHTML += '<th>Metric</th><th>Baseline</th>';
    projections.forEach((p, i) => {
        const attr = i === bestIdx ? highlightStyle : '';
        tableHTML += `<th ${attr}>${p.name}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    rows.forEach(row => {
        tableHTML += `<tr><td>${row.label}</td><td>${row.base}</td>`;
        row.vals.forEach((v, i) => {
            const attr = i === bestIdx ? highlightStyle : '';
            tableHTML += `<td ${attr}>${v}</td>`;
        });
        tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';

    // Build bar chart comparing key metrics across scenarios
    const colors = ['#40E0D0', '#ffc107', '#6f42c1'];
    const maxMargin = Math.max(baselineMargin, ...projections.map(p => p.margin));
    const marginChartData = [
        { label: 'Baseline', value: Math.max(baselineMargin, 0), maxValue: Math.max(maxMargin, 1), displayValue: pct(baselineMargin), color: '#888' },
        ...projections.map((p, i) => ({
            label: p.name,
            value: Math.max(p.margin, 0),
            maxValue: Math.max(maxMargin, 1),
            displayValue: pct(p.margin),
            color: i === bestIdx ? '#28a745' : colors[i]
        }))
    ];

    const maxRev = Math.max(revenue, ...projections.map(p => p.revenue));
    const revenueChartData = [
        { label: 'Baseline', value: revenue, maxValue: maxRev, displayValue: fmt(revenue), color: '#888' },
        ...projections.map((p, i) => ({
            label: p.name,
            value: Math.max(p.revenue, 0),
            maxValue: maxRev,
            displayValue: fmt(p.revenue),
            color: i === bestIdx ? '#28a745' : colors[i]
        }))
    ];

    const marginChart = createBarChart(marginChartData, { title: 'Profit Margin Comparison', width: 500 });
    const revenueChart = createBarChart(revenueChartData, { title: 'Revenue Comparison', width: 500 });

    // Recommendation summary
    const best = projections[bestIdx];
    const marginDiff = best.margin - baselineMargin;
    const revDiff = best.revenue - revenue;
    let recommendation = `<div class="scenario-recommendation">`;
    recommendation += `<h3>Recommendation</h3>`;
    recommendation += `<p><strong>${best.name}</strong> yields the highest profit margin at <strong>${pct(best.margin)}</strong>`;
    if (marginDiff > 0) {
        recommendation += `, an improvement of <strong>${pct(marginDiff)}</strong> over the baseline.`;
    } else if (marginDiff === 0) {
        recommendation += `, matching the baseline margin.`;
    } else {
        recommendation += `. Note: all scenarios reduce the profit margin compared to the baseline.`;
    }
    recommendation += `</p>`;
    recommendation += `<p>Projected revenue: <strong>${fmt(best.revenue)}</strong> (${revDiff >= 0 ? '+' : ''}${fmt(revDiff)} vs baseline).</p>`;
    recommendation += `<p>Revenue per employee: <strong>${fmtDec(best.revPerEmp)}</strong> | Cost per customer: <strong>${fmtDec(best.costPerCust)}</strong> | Satisfaction: <strong>${best.satisfaction.toFixed(1)}/10</strong></p>`;
    recommendation += `</div>`;

    // Render
    const resultDiv = document.getElementById('scenarioResult');
    resultDiv.innerHTML = `
        <h3>Scenario Comparison Results</h3>
        ${tableHTML}
        <div class="scenario-charts">
            ${marginChart}
            ${revenueChart}
        </div>
        ${recommendation}
    `;
}

function resetScenarios() {
    // Clear baseline inputs
    ['scenarioRevenue', 'scenarioEmployees', 'scenarioCosts', 'scenarioCustomers', 'scenarioSatisfaction'].forEach(id => {
        document.getElementById(id).value = '';
    });

    // Clear scenario inputs
    ['A', 'B', 'C'].forEach(letter => {
        const prefix = 'scenario' + letter;
        document.getElementById(prefix + 'Name').value = '';
        document.getElementById(prefix + 'Revenue').value = '';
        document.getElementById(prefix + 'Employees').value = '';
        document.getElementById(prefix + 'Costs').value = '';
        document.getElementById(prefix + 'Customers').value = '';
        document.getElementById(prefix + 'Satisfaction').value = '';
    });

    document.getElementById('scenarioResult').innerHTML = '';
}

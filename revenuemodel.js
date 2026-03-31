function calculateRevenueModel() {
    var newCustomers = parseFloat(document.getElementById('rmNewCustomers').value);
    var arpu = parseFloat(document.getElementById('rmARPU').value);
    var churnRate = parseFloat(document.getElementById('rmChurnRate').value) / 100;
    var cac = parseFloat(document.getElementById('rmCAC').value);
    var grossMargin = parseFloat(document.getElementById('rmGrossMargin').value) / 100;
    var opCosts = parseFloat(document.getElementById('rmOpCosts').value);
    var period = parseInt(document.getElementById('rmPeriod').value) || 24;

    if (isNaN(newCustomers) || isNaN(arpu) || isNaN(churnRate) || isNaN(cac)) {
        document.getElementById('revenueModelResult').innerHTML = '<p class="error">Please fill in all required fields.</p>';
        return;
    }
    if (churnRate <= 0) {
        document.getElementById('revenueModelResult').innerHTML = '<p class="error">Churn rate must be greater than 0%.</p>';
        return;
    }
    if (isNaN(grossMargin)) grossMargin = 0.7;
    if (isNaN(opCosts)) opCosts = 0;

    // Month-by-month projection
    var months = [];
    var customers = 0;
    var cumulativeRevenue = 0;
    var cumulativeCosts = 0;
    var breakEvenMonth = null;

    for (var m = 1; m <= period; m++) {
        var lost = customers * churnRate;
        var ending = customers + newCustomers - lost;
        if (ending < 0) ending = 0;
        var mrr = ending * arpu;
        var arr = mrr * 12;
        var monthRevenue = mrr;
        var monthCosts = (newCustomers * cac) + opCosts;

        cumulativeRevenue += monthRevenue;
        cumulativeCosts += monthCosts;

        if (breakEvenMonth === null && cumulativeRevenue - cumulativeCosts > 0) {
            breakEvenMonth = m;
        }

        months.push({
            month: m,
            newCust: newCustomers,
            lost: Math.round(lost),
            ending: Math.round(ending),
            mrr: mrr,
            arr: arr,
            cumRevenue: cumulativeRevenue,
            cumCosts: cumulativeCosts
        });

        customers = ending;
    }

    // Key metrics
    var ltv = arpu / churnRate;
    var ltvCacRatio = ltv / cac;
    var paybackMonths = cac / (arpu * grossMargin);
    var endData = months[months.length - 1];
    var projectedMRR = endData.mrr;
    var projectedARR = endData.arr;
    var totalCustomers = endData.ending;

    // Health indicators
    var ltvColor, ltvLabel;
    if (ltvCacRatio >= 3) {
        ltvColor = 'healthy';
        ltvLabel = 'Healthy';
    } else if (ltvCacRatio >= 1) {
        ltvColor = 'watch';
        ltvLabel = 'Watch';
    } else {
        ltvColor = 'critical';
        ltvLabel = 'Critical';
    }

    var paybackHealth, paybackLabel;
    if (paybackMonths <= 12) {
        paybackHealth = 'healthy';
        paybackLabel = 'Healthy';
    } else if (paybackMonths <= 18) {
        paybackHealth = 'watch';
        paybackLabel = 'Watch';
    } else {
        paybackHealth = 'critical';
        paybackLabel = 'Critical';
    }

    var churnHealth, churnLabel;
    if (churnRate * 100 <= 3) {
        churnHealth = 'healthy';
        churnLabel = 'Healthy';
    } else if (churnRate * 100 <= 7) {
        churnHealth = 'watch';
        churnLabel = 'Watch';
    } else {
        churnHealth = 'critical';
        churnLabel = 'Critical';
    }

    // Build chart data for MRR at months 3, 6, 12, 18, 24
    var chartMonths = [3, 6, 12, 18, 24].filter(function(m) { return m <= period; });
    var chartData = chartMonths.map(function(m) {
        var d = months[m - 1];
        return {
            label: 'Month ' + m,
            value: d.mrr,
            displayValue: '$' + formatNum(d.mrr)
        };
    });
    var maxMRR = Math.max.apply(null, chartData.map(function(d) { return d.value; }));
    chartData.forEach(function(d) { d.maxValue = maxMRR; });

    var html = '<h3>Revenue Model Results</h3>';

    // Metric cards dashboard
    html += '<div class="metric-cards">';
    html += '<div class="metric-card ' + ltvColor + '">';
    html += '<div class="metric-card-value">$' + formatNum(ltv) + '</div>';
    html += '<div class="metric-card-label">Customer LTV</div>';
    html += '<div class="metric-card-indicator">' + ltvLabel + '</div>';
    html += '</div>';

    html += '<div class="metric-card ' + ltvColor + '">';
    html += '<div class="metric-card-value">' + ltvCacRatio.toFixed(1) + 'x</div>';
    html += '<div class="metric-card-label">LTV:CAC Ratio</div>';
    html += '<div class="metric-card-indicator">' + ltvLabel + '</div>';
    html += '</div>';

    html += '<div class="metric-card ' + paybackHealth + '">';
    html += '<div class="metric-card-value">' + paybackMonths.toFixed(1) + '</div>';
    html += '<div class="metric-card-label">Months to Payback</div>';
    html += '<div class="metric-card-indicator">' + paybackLabel + '</div>';
    html += '</div>';

    html += '<div class="metric-card ' + churnHealth + '">';
    html += '<div class="metric-card-value">' + (churnRate * 100).toFixed(1) + '%</div>';
    html += '<div class="metric-card-label">Monthly Churn</div>';
    html += '<div class="metric-card-indicator">' + churnLabel + '</div>';
    html += '</div>';

    html += '<div class="metric-card">';
    html += '<div class="metric-card-value">$' + formatNum(projectedMRR) + '</div>';
    html += '<div class="metric-card-label">Projected MRR (Month ' + period + ')</div>';
    html += '</div>';

    html += '<div class="metric-card">';
    html += '<div class="metric-card-value">$' + formatNum(projectedARR) + '</div>';
    html += '<div class="metric-card-label">Projected ARR (Month ' + period + ')</div>';
    html += '</div>';

    html += '<div class="metric-card">';
    html += '<div class="metric-card-value">' + formatNum(totalCustomers) + '</div>';
    html += '<div class="metric-card-label">Total Customers (Month ' + period + ')</div>';
    html += '</div>';

    html += '<div class="metric-card">';
    html += '<div class="metric-card-value">' + (breakEvenMonth !== null ? 'Month ' + breakEvenMonth : 'N/A') + '</div>';
    html += '<div class="metric-card-label">Break-even Month</div>';
    html += '</div>';
    html += '</div>';

    // MRR Growth Chart
    html += '<div style="margin-top:20px;">';
    html += createBarChart(chartData, { title: 'MRR Growth Over Time', width: 450 });
    html += '</div>';

    // Export button
    html += '<button class="export-btn" onclick="exportRevenueModelCSV()" style="margin-top:15px;">Export CSV</button>';

    document.getElementById('revenueModelResult').innerHTML = html;

    // Store data for CSV export
    window._revenueModelData = months;
    window._revenueModelMetrics = {
        ltv: ltv,
        ltvCacRatio: ltvCacRatio,
        paybackMonths: paybackMonths,
        projectedMRR: projectedMRR,
        projectedARR: projectedARR,
        totalCustomers: totalCustomers,
        breakEvenMonth: breakEvenMonth
    };
}

function exportRevenueModelCSV() {
    if (!window._revenueModelData) return;
    var headers = ['Month', 'New Customers', 'Lost Customers', 'Ending Customers', 'MRR', 'ARR', 'Cumulative Revenue', 'Cumulative Costs'];
    var rows = window._revenueModelData.map(function(d) {
        return [d.month, d.newCust, d.lost, d.ending, d.mrr.toFixed(2), d.arr.toFixed(2), d.cumRevenue.toFixed(2), d.cumCosts.toFixed(2)];
    });
    var m = window._revenueModelMetrics;
    rows.push([]);
    rows.push(['Key Metrics']);
    rows.push(['LTV', '$' + m.ltv.toFixed(2)]);
    rows.push(['LTV:CAC Ratio', m.ltvCacRatio.toFixed(2)]);
    rows.push(['Months to Payback', m.paybackMonths.toFixed(1)]);
    rows.push(['Projected MRR', '$' + m.projectedMRR.toFixed(2)]);
    rows.push(['Projected ARR', '$' + m.projectedARR.toFixed(2)]);
    rows.push(['Total Customers', m.totalCustomers]);
    rows.push(['Break-even Month', m.breakEvenMonth !== null ? m.breakEvenMonth : 'N/A']);
    window.exportToCSV('revenue-model.csv', headers, rows);
}

function formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return Math.round(n).toLocaleString();
}

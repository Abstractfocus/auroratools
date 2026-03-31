/**
 * pricing.js - Pricing Strategy Modeler for Aurora Technologies Tools
 */

function updateTierInputs() {
    var count = parseInt(document.getElementById('tierCount').value) || 3;
    if (count < 1) count = 1;
    if (count > 4) count = 4;
    var container = document.getElementById('tierInputsContainer');
    container.innerHTML = '';
    for (var i = 1; i <= count; i++) {
        var defaults = ['Basic', 'Standard', 'Premium', 'Enterprise'];
        var group = document.createElement('div');
        group.className = 'tier-input-group';
        group.innerHTML =
            '<h4>Tier ' + i + '</h4>' +
            '<div class="input-group">' +
                '<label for="tierName' + i + '">Tier Name</label>' +
                '<input type="text" id="tierName' + i + '" placeholder="e.g. ' + defaults[i - 1] + '" value="' + defaults[i - 1] + '">' +
            '</div>' +
            '<div class="input-group">' +
                '<label for="tierPrice' + i + '">Monthly Price ($)</label>' +
                '<input type="number" id="tierPrice' + i + '" placeholder="e.g. 29" min="0">' +
            '</div>' +
            '<div class="input-group">' +
                '<label for="tierConversion' + i + '">Expected Conversion % of Total Visitors</label>' +
                '<input type="number" id="tierConversion' + i + '" placeholder="e.g. 5" min="0" max="100" step="0.1">' +
            '</div>' +
            '<div class="input-group">' +
                '<label for="tierFeatures' + i + '">Features Included (comma-separated)</label>' +
                '<textarea id="tierFeatures' + i + '" rows="2" placeholder="e.g. Feature A, Feature B, Feature C" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;resize:vertical;"></textarea>' +
            '</div>';
        container.appendChild(group);
    }
}

function modelPricing() {
    var count = parseInt(document.getElementById('tierCount').value) || 3;
    if (count < 1) count = 1;
    if (count > 4) count = 4;

    var visitors = parseFloat(document.getElementById('pricingVisitors').value);
    var currentAvgPrice = parseFloat(document.getElementById('pricingCurrentAvg').value);

    if (!visitors || visitors <= 0) {
        document.getElementById('pricingResult').innerHTML = '<p style="color:#dc3545;">Please enter total monthly visitors/leads.</p>';
        return;
    }

    var tiers = [];
    var totalMRR = 0;
    var totalCustomers = 0;
    var totalConversion = 0;

    for (var i = 1; i <= count; i++) {
        var name = document.getElementById('tierName' + i).value || ('Tier ' + i);
        var price = parseFloat(document.getElementById('tierPrice' + i).value) || 0;
        var conversion = parseFloat(document.getElementById('tierConversion' + i).value) || 0;
        var features = document.getElementById('tierFeatures' + i).value || '';

        var customers = Math.round(visitors * (conversion / 100));
        var revenue = customers * price;

        tiers.push({
            name: name,
            price: price,
            conversion: conversion,
            features: features,
            customers: customers,
            revenue: revenue
        });

        totalMRR += revenue;
        totalCustomers += customers;
        totalConversion += conversion;
    }

    var weightedAvg = totalCustomers > 0 ? totalMRR / totalCustomers : 0;

    // Find best tier
    var bestRevenueTier = tiers[0];
    var bestMarginTier = tiers[0];
    for (var j = 0; j < tiers.length; j++) {
        if (tiers[j].revenue > bestRevenueTier.revenue) bestRevenueTier = tiers[j];
        if (tiers[j].price > bestMarginTier.price) bestMarginTier = tiers[j];
    }

    // Build result HTML
    var html = '<h3>Pricing Model Results</h3>';

    // Tier breakdown table
    html += '<table style="width:100%;border-collapse:collapse;margin:15px 0;">';
    html += '<tr style="border-bottom:2px solid #40E0D0;">' +
            '<th style="text-align:left;padding:8px;">Tier</th>' +
            '<th style="text-align:right;padding:8px;">Price</th>' +
            '<th style="text-align:right;padding:8px;">Conv. %</th>' +
            '<th style="text-align:right;padding:8px;">Customers</th>' +
            '<th style="text-align:right;padding:8px;">Monthly Revenue</th>' +
            '</tr>';

    for (var k = 0; k < tiers.length; k++) {
        var t = tiers[k];
        html += '<tr style="border-bottom:1px solid #eee;">' +
                '<td style="padding:8px;font-weight:bold;">' + t.name + '</td>' +
                '<td style="text-align:right;padding:8px;">$' + t.price.toLocaleString() + '</td>' +
                '<td style="text-align:right;padding:8px;">' + t.conversion + '%</td>' +
                '<td style="text-align:right;padding:8px;">' + t.customers.toLocaleString() + '</td>' +
                '<td style="text-align:right;padding:8px;">$' + t.revenue.toLocaleString() + '</td>' +
                '</tr>';
    }
    html += '</table>';

    // Summary metrics
    html += '<div class="result-grid" style="grid-template-columns:1fr 1fr 1fr;">';
    html += '<div class="result-item"><strong>Total MRR</strong><br>$' + totalMRR.toLocaleString() + '</div>';
    html += '<div class="result-item"><strong>Total ARR</strong><br>$' + (totalMRR * 12).toLocaleString() + '</div>';
    html += '<div class="result-item"><strong>Weighted Avg Price</strong><br>$' + weightedAvg.toFixed(2) + '</div>';
    html += '</div>';

    html += '<div class="result-grid" style="grid-template-columns:1fr 1fr;">';
    html += '<div class="result-item"><strong>Total Customers</strong><br>' + totalCustomers.toLocaleString() + '</div>';
    html += '<div class="result-item"><strong>Total Conversion</strong><br>' + totalConversion.toFixed(1) + '%</div>';
    html += '</div>';

    // Current avg price comparison
    if (currentAvgPrice && currentAvgPrice > 0) {
        var currentRevenue = totalCustomers * currentAvgPrice;
        var revenueChange = totalMRR - currentRevenue;
        var revenueChangePct = currentRevenue > 0 ? ((revenueChange / currentRevenue) * 100) : 0;
        var changeColor = revenueChange >= 0 ? '#28a745' : '#dc3545';
        var changeIcon = revenueChange >= 0 ? '+' : '';

        html += '<div class="result-item" style="border-left:4px solid ' + changeColor + ';margin:15px 0;">';
        html += '<strong>vs. Current Avg Price ($' + currentAvgPrice.toFixed(2) + ')</strong><br>';
        html += 'Revenue Change: <span style="color:' + changeColor + ';font-weight:bold;">' + changeIcon + '$' + revenueChange.toLocaleString() + ' (' + changeIcon + revenueChangePct.toFixed(1) + '%)</span>';
        html += '</div>';
    }

    // Donut chart
    var donutData = [];
    for (var d = 0; d < tiers.length; d++) {
        donutData.push({ label: tiers[d].name, value: tiers[d].revenue });
    }
    html += '<div style="margin:20px 0;">';
    html += createDonutChart(donutData, { title: 'Revenue Distribution by Tier', size: 200 });
    html += '</div>';

    // Sensitivity analysis
    html += '<h3>Sensitivity Analysis</h3>';

    // Scenario 1: 25% conversion improvement
    var improvedMRR = 0;
    for (var s1 = 0; s1 < tiers.length; s1++) {
        var improvedCustomers = Math.round(visitors * (tiers[s1].conversion * 1.25 / 100));
        improvedMRR += improvedCustomers * tiers[s1].price;
    }
    var improvementDelta = improvedMRR - totalMRR;

    html += '<div class="result-item" style="border-left:4px solid #28a745;margin:10px 0;">';
    html += '<strong>What if conversion improves 25%?</strong><br>';
    html += 'Projected MRR: $' + improvedMRR.toLocaleString() + ' (+$' + improvementDelta.toLocaleString() + ', +' + (totalMRR > 0 ? ((improvementDelta / totalMRR) * 100).toFixed(1) : 0) + '%)';
    html += '</div>';

    // Scenario 2: 10% price increase
    var pricedUpMRR = 0;
    for (var s2 = 0; s2 < tiers.length; s2++) {
        pricedUpMRR += tiers[s2].customers * (tiers[s2].price * 1.1);
    }
    var priceDelta = pricedUpMRR - totalMRR;

    html += '<div class="result-item" style="border-left:4px solid #ffc107;margin:10px 0;">';
    html += '<strong>What if you raise prices 10%?</strong><br>';
    html += 'Projected MRR: $' + Math.round(pricedUpMRR).toLocaleString() + ' (+$' + Math.round(priceDelta).toLocaleString() + ', +' + (totalMRR > 0 ? ((priceDelta / totalMRR) * 100).toFixed(1) : 0) + '%)';
    html += '</div>';

    // Recommendations
    html += '<h3>Recommendations</h3>';
    html += '<div class="result-item" style="border-left:4px solid #40E0D0;margin:10px 0;">';
    html += '<p><strong>Top Revenue Driver:</strong> "' + bestRevenueTier.name + '" generates the most revenue at $' + bestRevenueTier.revenue.toLocaleString() + '/mo (' + (totalMRR > 0 ? ((bestRevenueTier.revenue / totalMRR) * 100).toFixed(1) : 0) + '% of total MRR).</p>';
    html += '<p><strong>Best Margin Potential:</strong> "' + bestMarginTier.name + '" at $' + bestMarginTier.price.toLocaleString() + '/mo has the highest price point and best margin potential per customer.</p>';
    if (totalConversion > 100) {
        html += '<p style="color:#dc3545;"><strong>Warning:</strong> Total conversion rates exceed 100%. Please review your tier conversion percentages.</p>';
    }
    html += '</div>';

    // Export button
    html += '<button onclick="exportPricingCSV()" style="margin-top:15px;">Export CSV</button>';

    document.getElementById('pricingResult').innerHTML = html;

    // Store data for CSV export
    window._pricingTiers = tiers;
    window._pricingMeta = { totalMRR: totalMRR, weightedAvg: weightedAvg, visitors: visitors, totalCustomers: totalCustomers };
}

function exportPricingCSV() {
    var tiers = window._pricingTiers || [];
    var meta = window._pricingMeta || {};
    var headers = ['Tier', 'Price', 'Conversion %', 'Expected Customers', 'Monthly Revenue', 'Features'];
    var rows = [];
    for (var i = 0; i < tiers.length; i++) {
        rows.push([
            tiers[i].name,
            tiers[i].price,
            tiers[i].conversion,
            tiers[i].customers,
            tiers[i].revenue,
            tiers[i].features
        ]);
    }
    rows.push([]);
    rows.push(['Total MRR', meta.totalMRR || 0]);
    rows.push(['Total ARR', (meta.totalMRR || 0) * 12]);
    rows.push(['Weighted Avg Price', (meta.weightedAvg || 0).toFixed(2)]);
    rows.push(['Total Customers', meta.totalCustomers || 0]);
    rows.push(['Monthly Visitors', meta.visitors || 0]);
    exportToCSV('pricing-model.csv', headers, rows);
}

// Initialize tier inputs on load
document.addEventListener('DOMContentLoaded', function() {
    var tierCount = document.getElementById('tierCount');
    if (tierCount) {
        updateTierInputs();
    }
});

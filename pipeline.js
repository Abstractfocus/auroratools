// Pipeline Analytics Dashboard
// Analyzes CRM data for conversion rates, deal velocity, revenue forecasting, and pipeline health.

var PIPELINE_STAGE_VALUES = {
    'Lead': 0,
    'Contacted': 5000,
    'Proposal Sent': 25000,
    'Negotiation': 50000,
    'Won': 75000,
    'Lost': 0
};

var PIPELINE_STAGE_PROBABILITIES = {
    'Lead': 0.10,
    'Contacted': 0.25,
    'Proposal Sent': 0.50,
    'Negotiation': 0.75,
    'Won': 1.00,
    'Lost': 0.00
};

var PIPELINE_STAGE_COLORS = {
    'Lead': '#e0e0e0',
    'Contacted': '#5b9bd5',
    'Proposal Sent': '#ffc107',
    'Negotiation': '#fd7e14',
    'Won': '#28a745',
    'Lost': '#dc3545'
};

var PIPELINE_FUNNEL_ORDER = ['Lead', 'Contacted', 'Proposal Sent', 'Negotiation', 'Won'];

function getPipelineClients() {
    try {
        return JSON.parse(localStorage.getItem('aurora-crm-clients')) || [];
    } catch (e) {
        return [];
    }
}

function getPipelineStageCounts(clients) {
    var counts = { 'Lead': 0, 'Contacted': 0, 'Proposal Sent': 0, 'Negotiation': 0, 'Won': 0, 'Lost': 0 };
    clients.forEach(function (c) {
        if (counts.hasOwnProperty(c.stage)) {
            counts[c.stage]++;
        }
    });
    return counts;
}

function formatPipelineCurrency(value) {
    if (value >= 1000000) {
        return '$' + (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
        return '$' + (value / 1000).toFixed(1) + 'K';
    }
    return '$' + value.toFixed(0);
}

function renderPipelineSummaryCards(clients, stageCounts) {
    // Total pipeline value
    var totalPipeline = 0;
    clients.forEach(function (c) {
        totalPipeline += PIPELINE_STAGE_VALUES[c.stage] || 0;
    });

    // Weighted pipeline
    var weightedPipeline = 0;
    clients.forEach(function (c) {
        var val = PIPELINE_STAGE_VALUES[c.stage] || 0;
        var prob = PIPELINE_STAGE_PROBABILITIES[c.stage] || 0;
        weightedPipeline += val * prob;
    });

    // Average deal size
    var wonCount = stageCounts['Won'] || 0;
    var avgDealSize = 0;
    if (wonCount > 0) {
        avgDealSize = (wonCount * PIPELINE_STAGE_VALUES['Won']) / wonCount;
    } else {
        var totalDeals = clients.length;
        avgDealSize = totalDeals > 0 ? totalPipeline / totalDeals : 0;
    }

    // Win rate
    var lostCount = stageCounts['Lost'] || 0;
    var closedTotal = wonCount + lostCount;
    var winRate = closedTotal > 0 ? ((wonCount / closedTotal) * 100).toFixed(1) : '0.0';

    // Active deals
    var activeDeals = clients.length - wonCount - lostCount;

    var html = '<div class="pipeline-cards">';
    html += '<div class="pipeline-card"><span class="pipeline-card-value">' + formatPipelineCurrency(totalPipeline) + '</span><span class="pipeline-card-label">Total Pipeline Value</span></div>';
    html += '<div class="pipeline-card"><span class="pipeline-card-value">' + formatPipelineCurrency(weightedPipeline) + '</span><span class="pipeline-card-label">Weighted Pipeline</span></div>';
    html += '<div class="pipeline-card"><span class="pipeline-card-value">' + formatPipelineCurrency(avgDealSize) + '</span><span class="pipeline-card-label">Avg Deal Size</span></div>';
    html += '<div class="pipeline-card"><span class="pipeline-card-value">' + winRate + '%</span><span class="pipeline-card-label">Win Rate</span></div>';
    html += '<div class="pipeline-card"><span class="pipeline-card-value">' + activeDeals + '</span><span class="pipeline-card-label">Active Deals</span></div>';
    html += '</div>';
    return html;
}

function renderConversionFunnel(stageCounts) {
    var html = '<div class="pipeline-section"><h3>Conversion Funnel</h3>';
    var maxCount = 0;
    PIPELINE_FUNNEL_ORDER.forEach(function (stage) {
        if (stageCounts[stage] > maxCount) maxCount = stageCounts[stage];
    });
    if (maxCount === 0) maxCount = 1;

    html += '<div class="funnel-container">';
    for (var i = 0; i < PIPELINE_FUNNEL_ORDER.length; i++) {
        var stage = PIPELINE_FUNNEL_ORDER[i];
        var count = stageCounts[stage];
        var widthPct = Math.max((count / maxCount) * 100, 8);
        var color = PIPELINE_STAGE_COLORS[stage];

        // Conversion rate from previous stage
        var conversionRate = '';
        if (i > 0) {
            var prevStage = PIPELINE_FUNNEL_ORDER[i - 1];
            var prevCount = stageCounts[prevStage];
            if (prevCount > 0) {
                conversionRate = ((count / prevCount) * 100).toFixed(0) + '%';
            } else {
                conversionRate = '0%';
            }
        }

        html += '<div class="funnel-stage">';
        if (conversionRate) {
            html += '<div class="funnel-conversion-arrow"><span class="funnel-conversion-rate">' + conversionRate + '</span></div>';
        }
        html += '<div class="funnel-row">';
        html += '<span class="funnel-label">' + stage + '</span>';
        html += '<div class="funnel-bar-track"><div class="funnel-bar" style="width:' + widthPct + '%;background-color:' + color + ';"></div></div>';
        html += '<span class="funnel-count">' + count + '</span>';
        html += '</div>';
        html += '</div>';
    }
    html += '</div></div>';
    return html;
}

function renderStageDistribution(stageCounts) {
    var data = [];
    var stages = ['Lead', 'Contacted', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
    stages.forEach(function (stage) {
        if (stageCounts[stage] > 0) {
            data.push({
                label: stage,
                value: stageCounts[stage],
                color: PIPELINE_STAGE_COLORS[stage]
            });
        }
    });

    var html = '<div class="pipeline-section"><h3>Stage Distribution</h3>';
    if (data.length === 0) {
        html += '<p>No client data available.</p>';
    } else {
        html += '<div class="pipeline-chart-container">' + createDonutChart(data, { title: 'Clients by Stage', size: 200 }) + '</div>';
    }
    html += '</div>';
    return html;
}

function renderDealVelocity(clients) {
    var now = Date.now();
    var stageOrder = ['Lead', 'Contacted', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
    var stageIndex = {};
    stageOrder.forEach(function (s, i) { stageIndex[s] = i; });

    // Estimate average age of deals (days since creation)
    var totalDays = 0;
    var dealCount = 0;
    var stageDays = {};
    stageOrder.forEach(function (s) { stageDays[s] = { total: 0, count: 0 }; });

    clients.forEach(function (c) {
        var createdAt = c.id; // id is Date.now() timestamp
        if (typeof createdAt !== 'number' || createdAt < 1000000000000) return;
        var ageDays = Math.max(Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)), 0);
        totalDays += ageDays;
        dealCount++;
        if (stageDays[c.stage]) {
            stageDays[c.stage].total += ageDays;
            stageDays[c.stage].count++;
        }
    });

    var avgCycleTime = dealCount > 0 ? Math.round(totalDays / dealCount) : 0;

    // Estimate per-stage velocity
    var html = '<div class="pipeline-section"><h3>Deal Velocity</h3>';
    html += '<table class="velocity-table"><thead><tr><th>Stage</th><th>Deals</th><th>Avg Days in Stage</th></tr></thead><tbody>';

    stageOrder.forEach(function (stage) {
        var info = stageDays[stage];
        var avgDays = info.count > 0 ? Math.round(info.total / info.count) : '-';
        html += '<tr><td><span class="crm-stage-badge ' + getStageClass(stage) + '">' + stage + '</span></td>';
        html += '<td>' + info.count + '</td>';
        html += '<td>' + avgDays + '</td></tr>';
    });

    html += '</tbody></table>';
    html += '<div class="velocity-summary">Average Total Cycle Time: <strong>' + avgCycleTime + ' days</strong></div>';
    html += '</div>';
    return html;
}

function renderRevenueForecast(clients, stageCounts) {
    var now = new Date();

    // Won deals in last 30 days
    var thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    var recentWonRevenue = 0;
    clients.forEach(function (c) {
        if (c.stage === 'Won' && typeof c.id === 'number' && c.id >= thirtyDaysAgo) {
            recentWonRevenue += PIPELINE_STAGE_VALUES['Won'];
        }
    });

    // Projected from Negotiation and Proposal Sent
    var negotiationRevenue = (stageCounts['Negotiation'] || 0) * PIPELINE_STAGE_VALUES['Negotiation'] * 0.75;
    var proposalRevenue = (stageCounts['Proposal Sent'] || 0) * PIPELINE_STAGE_VALUES['Proposal Sent'] * 0.50;

    var monthNames = [];
    for (var m = 0; m < 3; m++) {
        var d = new Date(now.getFullYear(), now.getMonth() + m + 1, 1);
        monthNames.push(d.toLocaleString('default', { month: 'short', year: 'numeric' }));
    }

    // Distribute projected revenue across 3 months with decay
    var month1 = recentWonRevenue + negotiationRevenue * 0.5;
    var month2 = recentWonRevenue * 0.8 + negotiationRevenue * 0.3 + proposalRevenue * 0.4;
    var month3 = recentWonRevenue * 0.6 + negotiationRevenue * 0.2 + proposalRevenue * 0.6;

    var forecastData = [
        { label: monthNames[0], value: Math.round(month1), color: '#40E0D0', displayValue: formatPipelineCurrency(month1) },
        { label: monthNames[1], value: Math.round(month2), color: '#28a745', displayValue: formatPipelineCurrency(month2) },
        { label: monthNames[2], value: Math.round(month3), color: '#6f42c1', displayValue: formatPipelineCurrency(month3) }
    ];

    // Normalize for bar chart
    var maxVal = Math.max(month1, month2, month3, 1);
    forecastData.forEach(function (d) { d.maxValue = maxVal; });

    var html = '<div class="pipeline-section"><h3>Revenue Forecast (Next 3 Months)</h3>';
    if (maxVal <= 1) {
        html += '<p>No revenue data to project. Add deals to see forecasts.</p>';
    } else {
        html += '<div class="pipeline-chart-container">' + createBarChart(forecastData, { title: 'Projected Revenue', width: 420 }) + '</div>';
    }
    html += '</div>';
    return html;
}

function renderActivityTimeline(clients) {
    var html = '<div class="pipeline-section"><h3>Activity Timeline</h3>';

    // Try to get notifications
    var notifications = [];
    try {
        var stored = JSON.parse(localStorage.getItem('aurora-notifications')) || [];
        notifications = stored.slice(-10).reverse();
    } catch (e) {
        notifications = [];
    }

    if (notifications.length > 0) {
        html += '<div class="pipeline-timeline">';
        notifications.forEach(function (n) {
            var msg = typeof n === 'string' ? n : (n.message || n.text || JSON.stringify(n));
            var time = n.time || n.date || '';
            html += '<div class="pipeline-timeline-item">';
            if (time) html += '<span class="pipeline-timeline-time">' + time + '</span>';
            html += '<span class="pipeline-timeline-msg">' + msg + '</span>';
            html += '</div>';
        });
        html += '</div>';
    } else {
        // Fallback: show clients sorted by most recently added
        var sorted = clients.slice().sort(function (a, b) { return (b.id || 0) - (a.id || 0); });
        var recent = sorted.slice(0, 10);

        if (recent.length === 0) {
            html += '<p>No activity to show.</p>';
        } else {
            html += '<div class="pipeline-timeline">';
            recent.forEach(function (c) {
                var dateStr = '';
                if (typeof c.id === 'number' && c.id > 1000000000000) {
                    dateStr = new Date(c.id).toLocaleDateString();
                }
                html += '<div class="pipeline-timeline-item">';
                html += '<span class="pipeline-timeline-time">' + dateStr + '</span>';
                html += '<span class="pipeline-timeline-msg"><strong>' + escCRM(c.name) + '</strong> (' + escCRM(c.company) + ') &mdash; ' + c.stage + '</span>';
                html += '</div>';
            });
            html += '</div>';
        }
    }

    html += '</div>';
    return html;
}

function renderActionItems(clients) {
    var now = new Date();
    var todayStr = now.toISOString().split('T')[0];
    var thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    var html = '<div class="pipeline-section"><h3>Action Items</h3>';

    // Overdue follow-ups
    var overdue = clients.filter(function (c) {
        return c.followUp && c.followUp < todayStr && c.stage !== 'Won' && c.stage !== 'Lost';
    });

    if (overdue.length > 0) {
        html += '<h4>Overdue Follow-ups</h4>';
        overdue.forEach(function (c) {
            html += '<div class="action-item overdue">';
            html += '<span class="action-item-icon">!</span>';
            html += '<div class="action-item-content"><strong>' + escCRM(c.name) + '</strong> (' + escCRM(c.company) + ')<br>';
            html += '<span class="action-item-detail">Follow-up was due: ' + c.followUp + ' &mdash; Stage: ' + c.stage + '</span></div>';
            html += '</div>';
        });
    } else {
        html += '<h4>Overdue Follow-ups</h4><p class="action-item-none">No overdue follow-ups.</p>';
    }

    // Stale deals (in same stage for >30 days, estimated from creation timestamp)
    var stale = clients.filter(function (c) {
        if (c.stage === 'Won' || c.stage === 'Lost') return false;
        if (typeof c.id !== 'number') return false;
        return c.id < thirtyDaysAgo;
    });

    if (stale.length > 0) {
        html += '<h4>Stale Deals (&gt;30 days in stage)</h4>';
        stale.forEach(function (c) {
            var ageDays = Math.floor((now.getTime() - c.id) / (1000 * 60 * 60 * 24));
            html += '<div class="action-item stale">';
            html += '<span class="action-item-icon">&#9202;</span>';
            html += '<div class="action-item-content"><strong>' + escCRM(c.name) + '</strong> (' + escCRM(c.company) + ')<br>';
            html += '<span class="action-item-detail">' + ageDays + ' days in ' + c.stage + '</span></div>';
            html += '</div>';
        });
    } else {
        html += '<h4>Stale Deals (&gt;30 days in stage)</h4><p class="action-item-none">No stale deals.</p>';
    }

    // Top opportunities (Negotiation stage)
    var topOpps = clients.filter(function (c) { return c.stage === 'Negotiation'; });

    if (topOpps.length > 0) {
        html += '<h4>Top Opportunities (Negotiation)</h4>';
        topOpps.forEach(function (c) {
            html += '<div class="action-item opportunity">';
            html += '<span class="action-item-icon">&#9733;</span>';
            html += '<div class="action-item-content"><strong>' + escCRM(c.name) + '</strong> (' + escCRM(c.company) + ')<br>';
            html += '<span class="action-item-detail">Est. value: ' + formatPipelineCurrency(PIPELINE_STAGE_VALUES['Negotiation']) + ' &mdash; 75% probability</span></div>';
            html += '</div>';
        });
    } else {
        html += '<h4>Top Opportunities (Negotiation)</h4><p class="action-item-none">No deals in negotiation.</p>';
    }

    html += '</div>';
    return html;
}

function renderPipelineAnalytics() {
    var container = document.getElementById('pipelineAnalyticsResult');
    if (!container) return;

    var clients = getPipelineClients();
    var stageCounts = getPipelineStageCounts(clients);

    var html = '';

    // Summary cards
    html += renderPipelineSummaryCards(clients, stageCounts);

    // Two-column layout for funnel and donut
    html += '<div class="pipeline-grid">';
    html += renderConversionFunnel(stageCounts);
    html += renderStageDistribution(stageCounts);
    html += '</div>';

    // Two-column layout for velocity and forecast
    html += '<div class="pipeline-grid">';
    html += renderDealVelocity(clients);
    html += renderRevenueForecast(clients, stageCounts);
    html += '</div>';

    // Timeline and action items
    html += '<div class="pipeline-grid">';
    html += renderActivityTimeline(clients);
    html += renderActionItems(clients);
    html += '</div>';

    container.innerHTML = html;
}

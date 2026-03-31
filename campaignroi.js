/**
 * campaignroi.js - Campaign ROI Tracker for Aurora Technologies Tools
 */

(function () {
    var STORAGE_KEY = 'aurora-campaigns';
    var sortField = 'name';
    var sortAsc = true;
    var filterChannel = '';
    var filterStatus = '';
    var editingId = null;

    function getCampaigns() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveCampaigns(campaigns) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    }

    function genId() {
        return 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    function fmt(n) {
        if (typeof n !== 'number' || isNaN(n)) return '$0';
        return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    function fmtPct(n) {
        if (typeof n !== 'number' || isNaN(n) || !isFinite(n)) return '0.0%';
        return n.toFixed(1) + '%';
    }

    function fmtNum(n) {
        if (typeof n !== 'number' || isNaN(n)) return '0';
        return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }

    function calcROI(revenue, spend) {
        if (!spend || spend === 0) return 0;
        return ((revenue - spend) / spend) * 100;
    }

    function calcCPL(spend, leads) {
        if (!leads || leads === 0) return 0;
        return spend / leads;
    }

    function calcCPC(spend, conversions) {
        if (!conversions || conversions === 0) return 0;
        return spend / conversions;
    }

    function calcConvRate(conversions, leads) {
        if (!leads || leads === 0) return 0;
        return (conversions / leads) * 100;
    }

    window.addCampaign = function () {
        var name = document.getElementById('campName').value.trim();
        var channel = document.getElementById('campChannel').value;
        var startDate = document.getElementById('campStartDate').value;
        var endDate = document.getElementById('campEndDate').value;
        var budget = parseFloat(document.getElementById('campBudget').value) || 0;
        var leads = parseInt(document.getElementById('campLeads').value) || 0;
        var conversions = parseInt(document.getElementById('campConversions').value) || 0;
        var revenue = parseFloat(document.getElementById('campRevenue').value) || 0;
        var status = document.getElementById('campStatus').value;

        if (!name || !channel) {
            alert('Please enter a campaign name and select a channel.');
            return;
        }

        var campaigns = getCampaigns();

        var campaign = {
            id: editingId || genId(),
            name: name,
            channel: channel,
            startDate: startDate,
            endDate: endDate,
            budget: budget,
            leads: leads,
            conversions: conversions,
            revenue: revenue,
            status: status
        };

        if (editingId) {
            var idx = campaigns.findIndex(function (c) { return c.id === editingId; });
            if (idx !== -1) campaigns[idx] = campaign;
            editingId = null;
            document.getElementById('campSubmitBtn').textContent = 'Add Campaign';
        } else {
            campaigns.push(campaign);
        }

        saveCampaigns(campaigns);
        clearCampaignForm();
        renderCampaignDashboard();
    };

    window.editCampaign = function (id) {
        var campaigns = getCampaigns();
        var c = campaigns.find(function (camp) { return camp.id === id; });
        if (!c) return;

        editingId = id;
        document.getElementById('campName').value = c.name;
        document.getElementById('campChannel').value = c.channel;
        document.getElementById('campStartDate').value = c.startDate || '';
        document.getElementById('campEndDate').value = c.endDate || '';
        document.getElementById('campBudget').value = c.budget || '';
        document.getElementById('campLeads').value = c.leads || '';
        document.getElementById('campConversions').value = c.conversions || '';
        document.getElementById('campRevenue').value = c.revenue || '';
        document.getElementById('campStatus').value = c.status || 'Active';
        document.getElementById('campSubmitBtn').textContent = 'Update Campaign';
    };

    window.deleteCampaign = function (id) {
        if (!confirm('Delete this campaign?')) return;
        var campaigns = getCampaigns().filter(function (c) { return c.id !== id; });
        saveCampaigns(campaigns);
        renderCampaignDashboard();
    };

    function clearCampaignForm() {
        document.getElementById('campName').value = '';
        document.getElementById('campChannel').value = '';
        document.getElementById('campStartDate').value = '';
        document.getElementById('campEndDate').value = '';
        document.getElementById('campBudget').value = '';
        document.getElementById('campLeads').value = '';
        document.getElementById('campConversions').value = '';
        document.getElementById('campRevenue').value = '';
        document.getElementById('campStatus').value = 'Active';
    }

    window.filterCampaigns = function () {
        filterChannel = document.getElementById('campFilterChannel').value;
        filterStatus = document.getElementById('campFilterStatus').value;
        renderCampaignDashboard();
    };

    function getFilteredCampaigns() {
        var campaigns = getCampaigns();
        if (filterChannel) {
            campaigns = campaigns.filter(function (c) { return c.channel === filterChannel; });
        }
        if (filterStatus) {
            campaigns = campaigns.filter(function (c) { return c.status === filterStatus; });
        }
        return campaigns;
    }

    function sortCampaigns(campaigns, field) {
        return campaigns.slice().sort(function (a, b) {
            var va = a[field], vb = b[field];
            if (typeof va === 'string') va = va.toLowerCase();
            if (typeof vb === 'string') vb = vb.toLowerCase();
            if (va < vb) return sortAsc ? -1 : 1;
            if (va > vb) return sortAsc ? 1 : -1;
            return 0;
        });
    }

    window.sortCampaignTable = function (field) {
        if (sortField === field) {
            sortAsc = !sortAsc;
        } else {
            sortField = field;
            sortAsc = true;
        }
        renderCampaignDashboard();
    };

    window.renderCampaignDashboard = function () {
        var campaigns = getFilteredCampaigns();
        var resultDiv = document.getElementById('campaignDashResult');
        if (!resultDiv) return;

        if (campaigns.length === 0) {
            resultDiv.innerHTML = '<p style="color:#888;">No campaigns yet. Add one above to get started.</p>';
            return;
        }

        var totalSpend = 0, totalLeads = 0, totalConversions = 0, totalRevenue = 0;
        campaigns.forEach(function (c) {
            totalSpend += c.budget || 0;
            totalLeads += c.leads || 0;
            totalConversions += c.conversions || 0;
            totalRevenue += c.revenue || 0;
        });

        var overallROI = calcROI(totalRevenue, totalSpend);
        var overallCPL = calcCPL(totalSpend, totalLeads);
        var overallCPC = calcCPC(totalSpend, totalConversions);
        var overallConvRate = calcConvRate(totalConversions, totalLeads);

        var html = '';

        // Summary cards
        html += '<div class="campaign-metrics">';
        html += '<div class="campaign-card"><div class="campaign-card-label">Total Spend</div><div class="campaign-card-value">' + fmt(totalSpend) + '</div></div>';
        html += '<div class="campaign-card"><div class="campaign-card-label">Total Leads</div><div class="campaign-card-value">' + fmtNum(totalLeads) + '</div></div>';
        html += '<div class="campaign-card"><div class="campaign-card-label">Total Conversions</div><div class="campaign-card-value">' + fmtNum(totalConversions) + '</div></div>';
        html += '<div class="campaign-card"><div class="campaign-card-label">Total Revenue</div><div class="campaign-card-value">' + fmt(totalRevenue) + '</div></div>';
        html += '<div class="campaign-card"><div class="campaign-card-label">Overall ROI</div><div class="campaign-card-value" style="color:' + (overallROI >= 0 ? '#28a745' : '#dc3545') + ';">' + fmtPct(overallROI) + '</div></div>';
        html += '<div class="campaign-card"><div class="campaign-card-label">Cost per Lead</div><div class="campaign-card-value">' + fmt(Math.round(overallCPL)) + '</div></div>';
        html += '<div class="campaign-card"><div class="campaign-card-label">Cost per Conversion</div><div class="campaign-card-value">' + fmt(Math.round(overallCPC)) + '</div></div>';
        html += '<div class="campaign-card"><div class="campaign-card-label">Conversion Rate</div><div class="campaign-card-value">' + fmtPct(overallConvRate) + '</div></div>';
        html += '</div>';

        // Best / Worst performing
        var withROI = campaigns.map(function (c) {
            return { name: c.name, roi: calcROI(c.revenue, c.budget), budget: c.budget };
        }).filter(function (c) { return c.budget > 0; });

        if (withROI.length > 0) {
            withROI.sort(function (a, b) { return b.roi - a.roi; });
            var best = withROI[0];
            var worst = withROI[withROI.length - 1];
            html += '<div style="display:flex;gap:16px;margin:16px 0;flex-wrap:wrap;">';
            html += '<div style="flex:1;min-width:200px;padding:12px;background:#d4edda;border-radius:6px;"><strong>Best Performing:</strong> ' + best.name + ' (' + fmtPct(best.roi) + ' ROI)</div>';
            html += '<div style="flex:1;min-width:200px;padding:12px;background:#f8d7da;border-radius:6px;"><strong>Worst Performing:</strong> ' + worst.name + ' (' + fmtPct(worst.roi) + ' ROI)</div>';
            html += '</div>';
        }

        // Channel performance
        var channels = {};
        campaigns.forEach(function (c) {
            if (!channels[c.channel]) {
                channels[c.channel] = { spend: 0, leads: 0, conversions: 0, revenue: 0, count: 0 };
            }
            channels[c.channel].spend += c.budget || 0;
            channels[c.channel].leads += c.leads || 0;
            channels[c.channel].conversions += c.conversions || 0;
            channels[c.channel].revenue += c.revenue || 0;
            channels[c.channel].count++;
        });

        html += '<h3 style="margin-top:20px;">Channel Performance</h3>';
        html += '<div class="channel-performance">';
        html += '<table style="width:100%;border-collapse:collapse;">';
        html += '<tr><th style="text-align:left;padding:8px;border-bottom:2px solid #40E0D0;">Channel</th><th style="text-align:right;padding:8px;border-bottom:2px solid #40E0D0;">Spend</th><th style="text-align:right;padding:8px;border-bottom:2px solid #40E0D0;">Revenue</th><th style="text-align:right;padding:8px;border-bottom:2px solid #40E0D0;">ROI</th><th style="text-align:right;padding:8px;border-bottom:2px solid #40E0D0;">Campaigns</th></tr>';
        var channelNames = Object.keys(channels).sort(function (a, b) {
            return calcROI(channels[b].revenue, channels[b].spend) - calcROI(channels[a].revenue, channels[a].spend);
        });
        channelNames.forEach(function (ch) {
            var d = channels[ch];
            var roi = calcROI(d.revenue, d.spend);
            html += '<tr><td style="padding:8px;border-bottom:1px solid #eee;">' + ch + '</td>';
            html += '<td style="text-align:right;padding:8px;border-bottom:1px solid #eee;">' + fmt(d.spend) + '</td>';
            html += '<td style="text-align:right;padding:8px;border-bottom:1px solid #eee;">' + fmt(d.revenue) + '</td>';
            html += '<td style="text-align:right;padding:8px;border-bottom:1px solid #eee;color:' + (roi >= 0 ? '#28a745' : '#dc3545') + ';">' + fmtPct(roi) + '</td>';
            html += '<td style="text-align:right;padding:8px;border-bottom:1px solid #eee;">' + d.count + '</td></tr>';
        });
        html += '</table></div>';

        // Charts
        html += '<div style="display:flex;gap:20px;margin:20px 0;flex-wrap:wrap;">';

        // Donut chart - spend by channel
        if (typeof createDonutChart === 'function' && totalSpend > 0) {
            var donutColors = ['#40E0D0', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#0A0A2A', '#17a2b8', '#e83e8c'];
            var donutData = channelNames.map(function (ch, i) {
                return { label: ch, value: channels[ch].spend, color: donutColors[i % donutColors.length] };
            });
            html += '<div style="flex:1;min-width:250px;">';
            html += '<h4 style="text-align:center;">Spend Distribution by Channel</h4>';
            html += createDonutChart(donutData, { title: '' });
            html += '</div>';
        }

        // Bar chart - ROI by campaign
        if (typeof createBarChart === 'function') {
            var barData = campaigns.filter(function (c) { return c.budget > 0; }).map(function (c) {
                var roi = calcROI(c.revenue, c.budget);
                return { label: c.name.substring(0, 18), value: Math.max(roi, 0), displayValue: fmtPct(roi), color: roi >= 0 ? '#40E0D0' : '#dc3545' };
            });
            if (barData.length > 0) {
                var maxROI = Math.max.apply(null, barData.map(function (d) { return d.value; }));
                barData.forEach(function (d) { d.maxValue = maxROI || 1; });
                html += '<div style="flex:1;min-width:250px;">';
                html += '<h4 style="text-align:center;">ROI by Campaign</h4>';
                html += createBarChart(barData, { title: '' });
                html += '</div>';
            }
        }

        html += '</div>';

        // Campaign table
        var sorted = sortCampaigns(campaigns, sortField);
        var arrow = sortAsc ? ' &#9650;' : ' &#9660;';
        html += '<h3 style="margin-top:20px;">All Campaigns</h3>';
        html += '<div style="overflow-x:auto;">';
        html += '<table style="width:100%;border-collapse:collapse;font-size:0.9em;">';
        html += '<tr>';
        var headers = [
            { key: 'name', label: 'Name' },
            { key: 'channel', label: 'Channel' },
            { key: 'status', label: 'Status' },
            { key: 'budget', label: 'Spend' },
            { key: 'leads', label: 'Leads' },
            { key: 'conversions', label: 'Conv.' },
            { key: 'revenue', label: 'Revenue' }
        ];
        headers.forEach(function (h) {
            html += '<th style="text-align:left;padding:8px;border-bottom:2px solid #40E0D0;cursor:pointer;white-space:nowrap;" onclick="sortCampaignTable(\'' + h.key + '\')">' + h.label + (sortField === h.key ? arrow : '') + '</th>';
        });
        html += '<th style="padding:8px;border-bottom:2px solid #40E0D0;">ROI</th>';
        html += '<th style="padding:8px;border-bottom:2px solid #40E0D0;">CPL</th>';
        html += '<th style="padding:8px;border-bottom:2px solid #40E0D0;">Actions</th>';
        html += '</tr>';

        sorted.forEach(function (c) {
            var roi = calcROI(c.revenue, c.budget);
            var cpl = calcCPL(c.budget, c.leads);
            var statusColor = c.status === 'Active' ? '#28a745' : c.status === 'Paused' ? '#ffc107' : '#6c757d';
            html += '<tr>';
            html += '<td style="padding:8px;border-bottom:1px solid #eee;">' + c.name + '</td>';
            html += '<td style="padding:8px;border-bottom:1px solid #eee;">' + c.channel + '</td>';
            html += '<td style="padding:8px;border-bottom:1px solid #eee;"><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:0.85em;color:white;background:' + statusColor + ';">' + c.status + '</span></td>';
            html += '<td style="padding:8px;border-bottom:1px solid #eee;">' + fmt(c.budget) + '</td>';
            html += '<td style="padding:8px;border-bottom:1px solid #eee;">' + fmtNum(c.leads) + '</td>';
            html += '<td style="padding:8px;border-bottom:1px solid #eee;">' + fmtNum(c.conversions) + '</td>';
            html += '<td style="padding:8px;border-bottom:1px solid #eee;">' + fmt(c.revenue) + '</td>';
            html += '<td style="padding:8px;border-bottom:1px solid #eee;color:' + (roi >= 0 ? '#28a745' : '#dc3545') + ';">' + fmtPct(roi) + '</td>';
            html += '<td style="padding:8px;border-bottom:1px solid #eee;">' + fmt(Math.round(cpl)) + '</td>';
            html += '<td style="padding:8px;border-bottom:1px solid #eee;white-space:nowrap;">' +
                '<button onclick="editCampaign(\'' + c.id + '\')" style="padding:4px 10px;font-size:0.85em;margin-right:4px;">Edit</button>' +
                '<button onclick="deleteCampaign(\'' + c.id + '\')" style="padding:4px 10px;font-size:0.85em;background:#dc3545;">Del</button></td>';
            html += '</tr>';
        });

        html += '</table></div>';

        // Export button
        html += '<div style="margin-top:16px;"><button onclick="exportCampaignsCSV()">Export CSV</button></div>';

        resultDiv.innerHTML = html;
    };

    window.exportCampaignsCSV = function () {
        var campaigns = getFilteredCampaigns();
        var headers = ['Name', 'Channel', 'Start Date', 'End Date', 'Budget Spent', 'Leads', 'Conversions', 'Revenue', 'Status', 'ROI %', 'Cost per Lead', 'Cost per Conversion', 'Conversion Rate %'];
        var rows = campaigns.map(function (c) {
            return [
                c.name, c.channel, c.startDate || '', c.endDate || '',
                c.budget, c.leads, c.conversions, c.revenue, c.status,
                calcROI(c.revenue, c.budget).toFixed(1),
                calcCPL(c.budget, c.leads).toFixed(2),
                calcCPC(c.budget, c.conversions).toFixed(2),
                calcConvRate(c.conversions, c.leads).toFixed(1)
            ];
        });
        if (typeof exportToCSV === 'function') {
            exportToCSV('campaign-roi-export.csv', headers, rows);
        }
    };

    // Initial render on load
    setTimeout(function () {
        renderCampaignDashboard();
    }, 100);
})();

// Engagement Health Monitor
// localStorage key: 'aurora-engagements'

function getEngagements() {
    try {
        return JSON.parse(localStorage.getItem('aurora-engagements')) || [];
    } catch (e) {
        return [];
    }
}

function saveEngagements(engagements) {
    localStorage.setItem('aurora-engagements', JSON.stringify(engagements));
}

function escEng(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function addEngagement() {
    var clientName = document.getElementById('ehClientName').value.trim();
    var projectName = document.getElementById('ehProjectName').value.trim();
    var startDate = document.getElementById('ehStartDate').value;
    var endDate = document.getElementById('ehEndDate').value;
    var budget = parseFloat(document.getElementById('ehBudget').value) || 0;
    var engType = document.getElementById('ehType').value;

    if (!clientName || !projectName) {
        alert('Client name and project name are required.');
        return;
    }
    if (!startDate || !endDate) {
        alert('Start and end dates are required.');
        return;
    }
    if (budget <= 0) {
        alert('Budget must be greater than zero.');
        return;
    }

    var engagement = {
        id: Date.now(),
        clientName: clientName,
        projectName: projectName,
        startDate: startDate,
        endDate: endDate,
        budget: budget,
        engType: engType,
        hoursSpent: 0,
        amountInvoiced: 0,
        scopeChanges: 0,
        satisfaction: 3,
        lastCheckIn: new Date().toISOString().split('T')[0]
    };

    var engagements = getEngagements();
    engagements.push(engagement);
    saveEngagements(engagements);

    // Clear form
    document.getElementById('ehClientName').value = '';
    document.getElementById('ehProjectName').value = '';
    document.getElementById('ehStartDate').value = '';
    document.getElementById('ehEndDate').value = '';
    document.getElementById('ehBudget').value = '';
    document.getElementById('ehType').value = 'Fixed';

    renderEngagementHealth();
}

function updateEngagement(id) {
    var engagements = getEngagements();
    var eng = null;
    for (var i = 0; i < engagements.length; i++) {
        if (engagements[i].id === id) { eng = engagements[i]; break; }
    }
    if (!eng) return;

    var hoursInput = document.getElementById('ehHours-' + id);
    var invoicedInput = document.getElementById('ehInvoiced-' + id);
    var scopeInput = document.getElementById('ehScope-' + id);
    var satInput = document.getElementById('ehSat-' + id);
    var checkinInput = document.getElementById('ehCheckin-' + id);

    if (hoursInput) eng.hoursSpent = parseFloat(hoursInput.value) || 0;
    if (invoicedInput) eng.amountInvoiced = parseFloat(invoicedInput.value) || 0;
    if (scopeInput) eng.scopeChanges = parseInt(scopeInput.value, 10) || 0;
    if (satInput) eng.satisfaction = parseInt(satInput.value, 10) || 3;
    if (checkinInput) eng.lastCheckIn = checkinInput.value;

    saveEngagements(engagements);
    renderEngagementHealth();
}

function deleteEngagement(id) {
    if (!confirm('Delete this engagement?')) return;
    var engagements = getEngagements();
    engagements = engagements.filter(function (e) { return e.id !== id; });
    saveEngagements(engagements);
    renderEngagementHealth();
}

function calcHealthColor(budgetBurn, timelineProgress) {
    var diff = Math.abs(budgetBurn - timelineProgress);
    if (diff <= 15) return 'green';
    if (diff <= 30) return 'yellow';
    return 'red';
}

function calcScopeColor(scopeChanges) {
    if (scopeChanges === 0) return 'green';
    if (scopeChanges <= 2) return 'yellow';
    return 'red';
}

function calcSatisfactionColor(sat) {
    if (sat >= 4) return 'green';
    if (sat >= 3) return 'yellow';
    return 'red';
}

function calcCheckInColor(daysSince) {
    if (daysSince < 7) return 'green';
    if (daysSince <= 14) return 'yellow';
    return 'red';
}

function renderEngagementHealth() {
    var engagements = getEngagements();
    var container = document.getElementById('ehDashboard');
    if (!container) return;

    if (engagements.length === 0) {
        container.innerHTML = '<p>No engagements added yet.</p>';
        return;
    }

    var now = new Date();
    var todayMs = now.getTime();
    var greenCount = 0;
    var alerts = [];
    var html = '';

    // Portfolio summary
    html += '<div class="eh-portfolio-summary" id="ehPortfolioSummary"></div>';

    // Alerts section
    html += '<div class="eh-alerts-section" id="ehAlerts"></div>';

    // Cards
    html += '<div class="eh-cards">';

    engagements.forEach(function (eng) {
        var startMs = new Date(eng.startDate).getTime();
        var endMs = new Date(eng.endDate).getTime();
        var totalDays = Math.max((endMs - startMs) / (1000 * 60 * 60 * 24), 1);
        var elapsed = Math.max((todayMs - startMs) / (1000 * 60 * 60 * 24), 0);
        var timelineProgress = Math.min((elapsed / totalDays) * 100, 100);
        var budgetBurn = eng.budget > 0 ? (eng.amountInvoiced / eng.budget) * 100 : 0;

        var daysSinceCheckIn = eng.lastCheckIn ? Math.floor((todayMs - new Date(eng.lastCheckIn).getTime()) / (1000 * 60 * 60 * 24)) : 999;

        var healthColor = calcHealthColor(budgetBurn, timelineProgress);
        var scopeColor = calcScopeColor(eng.scopeChanges);
        var satColor = calcSatisfactionColor(eng.satisfaction);
        var commColor = calcCheckInColor(daysSinceCheckIn);

        // Determine overall engagement health
        var colors = [healthColor, scopeColor, satColor, commColor];
        var hasRed = colors.indexOf('red') !== -1;
        var hasYellow = colors.indexOf('yellow') !== -1;
        var overallColor = hasRed ? 'red' : (hasYellow ? 'yellow' : 'green');

        if (overallColor === 'green') greenCount++;
        if (overallColor === 'red') {
            alerts.push(eng.clientName + ' - ' + eng.projectName);
        }

        html += '<div class="health-card health-card-' + overallColor + '">';
        html += '<div class="health-card-header">';
        html += '<h4>' + escEng(eng.projectName) + '</h4>';
        html += '<span class="health-card-client">' + escEng(eng.clientName) + ' | ' + escEng(eng.engType) + '</span>';
        html += '<button class="eh-delete-btn" onclick="deleteEngagement(' + eng.id + ')">Delete</button>';
        html += '</div>';

        // Indicators
        html += '<div class="health-indicators">';

        html += '<div class="health-indicator-row">';
        html += '<span class="health-indicator-label">Timeline</span>';
        html += '<div class="health-indicator health-' + (timelineProgress > 100 ? 'red' : 'green') + '">' + Math.round(timelineProgress) + '%</div>';
        html += '</div>';

        html += '<div class="health-indicator-row">';
        html += '<span class="health-indicator-label">Budget Burn</span>';
        html += '<div class="health-indicator health-' + healthColor + '">' + Math.round(budgetBurn) + '%</div>';
        html += '</div>';

        html += '<div class="health-indicator-row">';
        html += '<span class="health-indicator-label">Scope Creep</span>';
        html += '<div class="health-indicator health-' + scopeColor + '">' + eng.scopeChanges + ' changes</div>';
        html += '</div>';

        html += '<div class="health-indicator-row">';
        html += '<span class="health-indicator-label">Satisfaction</span>';
        html += '<div class="health-indicator health-' + satColor + '">' + eng.satisfaction + '/5</div>';
        html += '</div>';

        html += '<div class="health-indicator-row">';
        html += '<span class="health-indicator-label">Communication</span>';
        html += '<div class="health-indicator health-' + commColor + '">' + daysSinceCheckIn + ' days ago</div>';
        html += '</div>';

        html += '</div>';

        // Update form
        html += '<div class="eh-update-form">';
        html += '<h5>Update Engagement</h5>';
        html += '<div class="eh-update-fields">';
        html += '<div class="input-group"><label>Hours Spent</label><input type="number" id="ehHours-' + eng.id + '" value="' + eng.hoursSpent + '" min="0" step="any"></div>';
        html += '<div class="input-group"><label>Amount Invoiced</label><input type="number" id="ehInvoiced-' + eng.id + '" value="' + eng.amountInvoiced + '" min="0" step="any"></div>';
        html += '<div class="input-group"><label>Scope Changes</label><input type="number" id="ehScope-' + eng.id + '" value="' + eng.scopeChanges + '" min="0"></div>';
        html += '<div class="input-group"><label>Satisfaction (1-5)</label><input type="range" id="ehSat-' + eng.id + '" value="' + eng.satisfaction + '" min="1" max="5" step="1"><span class="slider-value">' + eng.satisfaction + '</span></div>';
        html += '<div class="input-group"><label>Last Check-in</label><input type="date" id="ehCheckin-' + eng.id + '" value="' + (eng.lastCheckIn || '') + '"></div>';
        html += '</div>';
        html += '<button onclick="updateEngagement(' + eng.id + ')">Save Update</button>';
        html += '</div>';

        html += '</div>';
    });

    html += '</div>';

    container.innerHTML = html;

    // Portfolio summary
    var pctGreen = engagements.length > 0 ? Math.round((greenCount / engagements.length) * 100) : 0;
    var summaryEl = document.getElementById('ehPortfolioSummary');
    if (summaryEl) {
        var sColor = pctGreen >= 70 ? 'green' : (pctGreen >= 40 ? 'yellow' : 'red');
        summaryEl.innerHTML = '<div class="eh-summary-card">' +
            '<h3>Portfolio Health</h3>' +
            '<div class="health-indicator health-' + sColor + '" style="font-size:1.5em;">' + pctGreen + '% Green</div>' +
            '<p>' + engagements.length + ' active engagement' + (engagements.length !== 1 ? 's' : '') + '</p>' +
            '</div>';
    }

    // Alerts
    var alertsEl = document.getElementById('ehAlerts');
    if (alertsEl && alerts.length > 0) {
        var alertHtml = '<div class="eh-alerts-card"><h3>At-Risk Engagements</h3><ul>';
        alerts.forEach(function (a) {
            alertHtml += '<li class="health-red">' + escEng(a) + '</li>';
        });
        alertHtml += '</ul></div>';
        alertsEl.innerHTML = alertHtml;
    }

    // Bind slider display updates
    engagements.forEach(function (eng) {
        var slider = document.getElementById('ehSat-' + eng.id);
        if (slider) {
            slider.addEventListener('input', function () {
                var span = this.parentNode.querySelector('.slider-value');
                if (span) span.textContent = this.value;
            });
        }
    });
}

function exportEngagementsCSV() {
    var engagements = getEngagements();
    if (engagements.length === 0) {
        alert('No engagements to export.');
        return;
    }
    var headers = ['Client', 'Project', 'Start Date', 'End Date', 'Budget', 'Type', 'Hours Spent', 'Amount Invoiced', 'Scope Changes', 'Satisfaction', 'Last Check-in'];
    var keys = ['clientName', 'projectName', 'startDate', 'endDate', 'budget', 'engType', 'hoursSpent', 'amountInvoiced', 'scopeChanges', 'satisfaction', 'lastCheckIn'];

    var csvRows = [headers.join(',')];
    engagements.forEach(function (e) {
        var row = keys.map(function (k) {
            var val = (e[k] === undefined || e[k] === null ? '' : e[k]).toString().replace(/"/g, '""');
            return '"' + val + '"';
        });
        csvRows.push(row.join(','));
    });

    var csvString = csvRows.join('\n');
    var blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'aurora-engagements.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Initialize
(function () {
    renderEngagementHealth();
})();

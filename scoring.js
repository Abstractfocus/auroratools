// Weighted Scoring Model
// In-memory storage (not localStorage)

var scoringCriteria = [];
var scoringOptions = [];

function addCriterion() {
    var nameEl = document.getElementById('scoringCriterionName');
    var weightEl = document.getElementById('scoringCriterionWeight');
    var name = nameEl.value.trim();
    var weight = parseInt(weightEl.value, 10);

    if (!name) {
        alert('Please enter a criterion name.');
        return;
    }
    if (isNaN(weight) || weight < 1 || weight > 10) {
        alert('Weight must be between 1 and 10.');
        return;
    }

    scoringCriteria.push({ id: Date.now(), name: name, weight: weight });
    nameEl.value = '';
    weightEl.value = '5';

    renderCriteriaList();
    renderScoringForm();
}

function addOption() {
    var nameEl = document.getElementById('scoringOptionName');
    var name = nameEl.value.trim();

    if (!name) {
        alert('Please enter an option name.');
        return;
    }
    if (scoringCriteria.length === 0) {
        alert('Please add at least one criterion first.');
        return;
    }

    var scores = {};
    scoringCriteria.forEach(function (c) {
        scores[c.id] = 5;
    });

    scoringOptions.push({ id: Date.now(), name: name, scores: scores });
    nameEl.value = '';

    renderOptionsList();
    renderScoringForm();
}

function renderCriteriaList() {
    var container = document.getElementById('scoringCriteriaList');
    if (scoringCriteria.length === 0) {
        container.innerHTML = '<p style="color:#888; font-size:0.9em;">No criteria added yet.</p>';
        return;
    }
    var html = '<table style="width:100%; border-collapse:collapse; font-size:0.9em;">';
    html += '<tr style="border-bottom:1px solid #ddd;"><th style="text-align:left; padding:4px 8px;">Criterion</th><th style="text-align:center; padding:4px 8px;">Weight</th><th style="text-align:center; padding:4px 8px;">Remove</th></tr>';
    scoringCriteria.forEach(function (c) {
        html += '<tr style="border-bottom:1px solid #eee;">';
        html += '<td style="padding:4px 8px;">' + escapeHTML(c.name) + '</td>';
        html += '<td style="text-align:center; padding:4px 8px;">' + c.weight + '</td>';
        html += '<td style="text-align:center; padding:4px 8px;"><button onclick="removeCriterion(' + c.id + ')" style="background:#dc3545; padding:4px 10px; font-size:0.85em;">X</button></td>';
        html += '</tr>';
    });
    html += '</table>';
    container.innerHTML = html;
}

function removeCriterion(id) {
    scoringCriteria = scoringCriteria.filter(function (c) { return c.id !== id; });
    scoringOptions.forEach(function (opt) {
        delete opt.scores[id];
    });
    renderCriteriaList();
    renderScoringForm();
}

function renderOptionsList() {
    var container = document.getElementById('scoringOptionsList');
    if (scoringOptions.length === 0) {
        container.innerHTML = '<p style="color:#888; font-size:0.9em;">No options added yet.</p>';
        return;
    }
    var html = '';
    scoringOptions.forEach(function (opt) {
        html += '<span style="display:inline-block; background:#e9ecef; border-radius:4px; padding:4px 10px; margin:2px 4px; font-size:0.9em;">';
        html += escapeHTML(opt.name);
        html += ' <button onclick="removeOption(' + opt.id + ')" style="background:#dc3545; padding:2px 6px; font-size:0.8em; margin-left:4px;">X</button>';
        html += '</span>';
    });
    container.innerHTML = html;
}

function removeOption(id) {
    scoringOptions = scoringOptions.filter(function (o) { return o.id !== id; });
    renderOptionsList();
    renderScoringForm();
}

function renderScoringForm() {
    var container = document.getElementById('scoringFormArea');
    if (scoringCriteria.length === 0 || scoringOptions.length === 0) {
        container.innerHTML = '';
        return;
    }

    var html = '<div style="padding:15px; background-color:#f8f9fa; border-radius:4px;">';
    html += '<h3 style="margin-top:0; color:#0A0A2A;">Score Each Option (1-10)</h3>';
    html += '<div style="overflow-x:auto;">';
    html += '<table style="width:100%; border-collapse:collapse; font-size:0.9em;">';
    html += '<tr style="border-bottom:2px solid #0A0A2A;"><th style="text-align:left; padding:6px 8px;">Option</th>';
    scoringCriteria.forEach(function (c) {
        html += '<th style="text-align:center; padding:6px 8px;">' + escapeHTML(c.name) + '<br><span style="font-weight:normal; font-size:0.85em; color:#888;">wt: ' + c.weight + '</span></th>';
    });
    html += '</tr>';

    scoringOptions.forEach(function (opt) {
        html += '<tr style="border-bottom:1px solid #ddd;">';
        html += '<td style="padding:6px 8px; font-weight:bold;">' + escapeHTML(opt.name) + '</td>';
        scoringCriteria.forEach(function (c) {
            var val = opt.scores[c.id] !== undefined ? opt.scores[c.id] : 5;
            html += '<td style="text-align:center; padding:6px 8px;">';
            html += '<input type="number" min="1" max="10" value="' + val + '" ';
            html += 'id="score_' + opt.id + '_' + c.id + '" ';
            html += 'onchange="updateScore(' + opt.id + ',' + c.id + ',this.value)" ';
            html += 'style="width:60px; text-align:center;">';
            html += '</td>';
        });
        html += '</tr>';
    });

    html += '</table></div></div>';
    container.innerHTML = html;
}

function updateScore(optionId, criterionId, value) {
    var val = parseInt(value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 10) val = 10;
    scoringOptions.forEach(function (opt) {
        if (opt.id === optionId) {
            opt.scores[criterionId] = val;
        }
    });
}

function calculateWeightedScores() {
    if (scoringCriteria.length === 0 || scoringOptions.length === 0) {
        alert('Please add at least one criterion and one option.');
        return;
    }

    // Read latest values from form inputs
    scoringOptions.forEach(function (opt) {
        scoringCriteria.forEach(function (c) {
            var el = document.getElementById('score_' + opt.id + '_' + c.id);
            if (el) {
                var val = parseInt(el.value, 10);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 10) val = 10;
                opt.scores[c.id] = val;
            }
        });
    });

    var totalWeight = scoringCriteria.reduce(function (sum, c) { return sum + c.weight; }, 0);

    var results = scoringOptions.map(function (opt) {
        var weightedSum = 0;
        scoringCriteria.forEach(function (c) {
            var score = opt.scores[c.id] || 0;
            weightedSum += score * c.weight;
        });
        var weightedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
        return { name: opt.name, weightedScore: weightedScore, scores: opt.scores, id: opt.id };
    });

    results.sort(function (a, b) { return b.weightedScore - a.weightedScore; });

    // Build results table
    var html = '<h3 style="color:#0A0A2A;">Results</h3>';
    html += '<div style="overflow-x:auto;">';
    html += '<table style="width:100%; border-collapse:collapse; font-size:0.9em;">';
    html += '<tr style="border-bottom:2px solid #0A0A2A; background:#e9ecef;">';
    html += '<th style="padding:8px; text-align:center;">Rank</th>';
    html += '<th style="padding:8px; text-align:left;">Option</th>';
    html += '<th style="padding:8px; text-align:center;">Weighted Score</th>';
    scoringCriteria.forEach(function (c) {
        html += '<th style="padding:8px; text-align:center;">' + escapeHTML(c.name) + '</th>';
    });
    html += '</tr>';

    results.forEach(function (r, i) {
        var isWinner = i === 0;
        var bgColor = isWinner ? '#d4edda' : (i % 2 === 0 ? '#fff' : '#f8f9fa');
        var borderLeft = isWinner ? '4px solid #28a745' : 'none';
        html += '<tr style="border-bottom:1px solid #ddd; background:' + bgColor + '; border-left:' + borderLeft + ';">';
        html += '<td style="padding:8px; text-align:center; font-weight:bold;">' + (i + 1) + '</td>';
        html += '<td style="padding:8px;">';
        if (isWinner) html += '<strong>';
        html += escapeHTML(r.name);
        if (isWinner) html += ' &#9733;</strong>';
        html += '</td>';
        html += '<td style="padding:8px; text-align:center; font-weight:bold;">' + r.weightedScore.toFixed(2) + '</td>';
        scoringCriteria.forEach(function (c) {
            html += '<td style="padding:8px; text-align:center;">' + (r.scores[c.id] || 0) + '</td>';
        });
        html += '</tr>';
    });
    html += '</table></div>';

    // Bar chart
    var chartData = results.map(function (r) {
        return { label: r.name, value: parseFloat(r.weightedScore.toFixed(2)) };
    });
    html += '<div style="margin-top:20px;">';
    html += createBarChart(chartData, { title: 'Weighted Score Comparison', width: 500 });
    html += '</div>';

    document.getElementById('scoringResult').innerHTML = html;
}

function clearScoring() {
    scoringCriteria = [];
    scoringOptions = [];
    renderCriteriaList();
    renderOptionsList();
    renderScoringForm();
    document.getElementById('scoringResult').innerHTML = '';
}

function exportScoringCSV() {
    if (scoringCriteria.length === 0 || scoringOptions.length === 0) {
        alert('Nothing to export.');
        return;
    }

    var totalWeight = scoringCriteria.reduce(function (sum, c) { return sum + c.weight; }, 0);

    var headers = ['Option', 'Weighted Score'];
    scoringCriteria.forEach(function (c) {
        headers.push(c.name + ' (wt:' + c.weight + ')');
    });

    var rows = [headers.join(',')];
    scoringOptions.forEach(function (opt) {
        var weightedSum = 0;
        scoringCriteria.forEach(function (c) {
            weightedSum += (opt.scores[c.id] || 0) * c.weight;
        });
        var ws = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : '0.00';
        var row = ['"' + opt.name.replace(/"/g, '""') + '"', ws];
        scoringCriteria.forEach(function (c) {
            row.push(opt.scores[c.id] || 0);
        });
        rows.push(row.join(','));
    });

    var csv = rows.join('\n');
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'weighted_scoring_results.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Initialize lists on load
(function () {
    renderCriteriaList();
    renderOptionsList();
})();

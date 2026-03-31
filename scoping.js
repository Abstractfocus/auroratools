// Engagement Scoping Template

var scopePackages = {
    digitalFoundation: {
        name: 'Digital Foundation',
        description: 'Build a solid technology base with modern infrastructure, cloud migration, and essential security measures.',
        triggers: function(scores) { return scores.tech < 3 && scores.readiness < 3; },
        deliverables: [
            'Infrastructure assessment and modernization plan',
            'Cloud migration strategy and execution',
            'Basic cybersecurity framework implementation',
            'IT governance documentation',
            'Staff technology training program'
        ],
        timeline: '8-12 weeks',
        priceRange: '$25,000 - $50,000',
        priceLow: 25000,
        priceHigh: 50000
    },
    growthAccelerator: {
        name: 'Growth Accelerator',
        description: 'Supercharge your business development with data-driven market strategy, sales optimization, and CRM implementation.',
        triggers: function(scores) { return scores.bizDev < 3; },
        deliverables: [
            'Market analysis and go-to-market strategy',
            'Sales process optimization and playbook',
            'CRM platform selection and implementation',
            'Lead generation framework',
            'Sales team training and enablement'
        ],
        timeline: '10-16 weeks',
        priceRange: '$30,000 - $60,000',
        priceLow: 30000,
        priceHigh: 60000
    },
    operationalExcellence: {
        name: 'Operational Excellence',
        description: 'Streamline operations through process automation, risk management improvements, and financial optimization.',
        triggers: function(scores) { return scores.bizOps < 3; },
        deliverables: [
            'End-to-end process mapping and optimization',
            'Workflow automation implementation',
            'Risk management framework development',
            'Financial process optimization',
            'Operational KPI dashboard setup'
        ],
        timeline: '6-10 weeks',
        priceRange: '$20,000 - $40,000',
        priceLow: 20000,
        priceHigh: 40000
    },
    fullTransformation: {
        name: 'Full Transformation',
        description: 'A comprehensive overhaul spanning technology, operations, and growth strategy for organizations needing broad improvement.',
        triggers: function(scores) {
            var weakCount = 0;
            if (scores.bizOps < 3) weakCount++;
            if (scores.bizDev < 3) weakCount++;
            if (scores.tech < 3) weakCount++;
            if (scores.readiness < 3) weakCount++;
            return weakCount >= 3;
        },
        deliverables: [
            'Full organizational assessment and transformation roadmap',
            'Technology infrastructure overhaul',
            'Business process re-engineering',
            'Growth strategy and market repositioning',
            'Change management and staff upskilling program'
        ],
        timeline: '16-24 weeks',
        priceRange: '$75,000 - $150,000',
        priceLow: 75000,
        priceHigh: 150000
    },
    strategicAdvisory: {
        name: 'Strategic Advisory',
        description: 'Ongoing strategic guidance with quarterly sessions, KPI tracking, and executive advisory for organizations in good standing.',
        triggers: function(scores) {
            return scores.bizOps >= 3 && scores.bizDev >= 3 && scores.tech >= 3 && scores.readiness >= 3;
        },
        deliverables: [
            'Quarterly strategic review sessions',
            'KPI framework and performance tracking',
            'Industry trend briefings and competitive analysis',
            'Executive advisory and board-ready reporting'
        ],
        timeline: 'Ongoing (12-month engagement)',
        priceRange: '$15,000 - $30,000',
        priceLow: 15000,
        priceHigh: 30000
    }
};

function createSliderInputs() {
    var sliderIds = ['scopeBizOps', 'scopeBizDev', 'scopeTech', 'scopeReadiness'];
    sliderIds.forEach(function(id) {
        var slider = document.getElementById(id);
        var valueDisplay = document.getElementById(id + '-value');
        if (slider && valueDisplay) {
            valueDisplay.textContent = slider.value;
            slider.addEventListener('input', function() {
                valueDisplay.textContent = this.value;
            });
        }
    });
}

function calculateFitScore(pkg, scores) {
    var score = 0;
    var maxScore = 0;

    if (pkg === scopePackages.digitalFoundation) {
        maxScore = 2;
        if (scores.tech < 3) score += (3 - scores.tech) / 2;
        if (scores.readiness < 3) score += (3 - scores.readiness) / 2;
    } else if (pkg === scopePackages.growthAccelerator) {
        maxScore = 1;
        if (scores.bizDev < 3) score += (3 - scores.bizDev) / 2;
    } else if (pkg === scopePackages.operationalExcellence) {
        maxScore = 1;
        if (scores.bizOps < 3) score += (3 - scores.bizOps) / 2;
    } else if (pkg === scopePackages.fullTransformation) {
        maxScore = 4;
        if (scores.bizOps < 3) score += (3 - scores.bizOps) / 2;
        if (scores.bizDev < 3) score += (3 - scores.bizDev) / 2;
        if (scores.tech < 3) score += (3 - scores.tech) / 2;
        if (scores.readiness < 3) score += (3 - scores.readiness) / 2;
    } else if (pkg === scopePackages.strategicAdvisory) {
        maxScore = 4;
        if (scores.bizOps >= 3) score += (scores.bizOps - 2) / 3;
        if (scores.bizDev >= 3) score += (scores.bizDev - 2) / 3;
        if (scores.tech >= 3) score += (scores.tech - 2) / 3;
        if (scores.readiness >= 3) score += (scores.readiness - 2) / 3;
    }

    if (maxScore === 0) return 0;
    return Math.min(Math.round((score / maxScore) * 100), 100);
}

function generateScope() {
    var clientName = document.getElementById('scopeClientName').value.trim();
    var bizOps = parseFloat(document.getElementById('scopeBizOps').value);
    var bizDev = parseFloat(document.getElementById('scopeBizDev').value);
    var tech = parseFloat(document.getElementById('scopeTech').value);
    var readiness = parseFloat(document.getElementById('scopeReadiness').value);
    var revenue = document.getElementById('scopeRevenue').value;
    var employees = document.getElementById('scopeEmployees').value;
    var goal = document.getElementById('scopeGoal').value;

    if (!clientName) {
        document.getElementById('scopingResult').innerHTML = '<p class="error">Please enter a client name.</p>';
        return;
    }
    if (!goal) {
        document.getElementById('scopingResult').innerHTML = '<p class="error">Please select a primary goal.</p>';
        return;
    }

    var scores = { bizOps: bizOps, bizDev: bizDev, tech: tech, readiness: readiness };

    // Identify weak areas
    var weakAreas = [];
    if (bizOps < 3) weakAreas.push('Business Operations (' + bizOps + '/5)');
    if (bizDev < 3) weakAreas.push('Business Development (' + bizDev + '/5)');
    if (tech < 3) weakAreas.push('Technology (' + tech + '/5)');
    if (readiness < 3) weakAreas.push('Digital Readiness (' + readiness + '/5)');

    // Find matching packages
    var recommended = [];
    var keys = Object.keys(scopePackages);
    for (var i = 0; i < keys.length; i++) {
        var pkg = scopePackages[keys[i]];
        if (pkg.triggers(scores)) {
            recommended.push({ key: keys[i], pkg: pkg, fitScore: calculateFitScore(pkg, scores) });
        }
    }

    // If Full Transformation is recommended and there are more than 3 packages, prefer Full Transformation
    var hasFullTransformation = recommended.some(function(r) { return r.key === 'fullTransformation'; });
    if (hasFullTransformation && recommended.length > 3) {
        recommended = recommended.filter(function(r) {
            return r.key === 'fullTransformation' || r.key === 'strategicAdvisory';
        });
    }

    // Limit to 3 packages max
    recommended.sort(function(a, b) { return b.fitScore - a.fitScore; });
    if (recommended.length > 3) {
        recommended = recommended.slice(0, 3);
    }

    // Build output
    var html = '<h3>Engagement Scope for ' + clientName + '</h3>';

    html += '<div class="result-grid">';
    html += '<div class="result-item"><span class="result-label">Annual Revenue</span><span class="result-value">' + (revenue ? '$' + parseInt(revenue).toLocaleString() : 'Not provided') + '</span></div>';
    html += '<div class="result-item"><span class="result-label">Employees</span><span class="result-value">' + (employees || 'Not provided') + '</span></div>';
    html += '<div class="result-item"><span class="result-label">Primary Goal</span><span class="result-value">' + goal + '</span></div>';
    html += '</div>';

    if (weakAreas.length > 0) {
        html += '<p style="margin-top:12px;"><strong>Identified Weak Areas:</strong> ' + weakAreas.join(', ') + '</p>';
    } else {
        html += '<p style="margin-top:12px;"><strong>No critical weak areas identified.</strong> All scores are at or above threshold.</p>';
    }

    html += '<h3 style="margin-top:20px;">Recommended Packages</h3>';

    for (var j = 0; j < recommended.length; j++) {
        var rec = recommended[j];
        var pkg = rec.pkg;
        var fitColor = rec.fitScore >= 75 ? '#28a745' : rec.fitScore >= 50 ? '#ffc107' : '#dc3545';

        html += '<div style="border:1px solid #ddd;border-radius:8px;padding:16px;margin-bottom:16px;border-left:4px solid ' + fitColor + ';">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;">';
        html += '<h4 style="margin:0 0 4px 0;">' + pkg.name + '</h4>';
        html += '<span style="font-weight:700;color:' + fitColor + ';">Fit Score: ' + rec.fitScore + '%</span>';
        html += '</div>';
        html += '<p style="margin:8px 0;color:#555;">' + pkg.description + '</p>';
        html += '<p style="margin:6px 0;"><strong>Key Deliverables:</strong></p>';
        html += '<ul style="margin:4px 0 8px 20px;padding:0;">';
        for (var k = 0; k < pkg.deliverables.length; k++) {
            html += '<li>' + pkg.deliverables[k] + '</li>';
        }
        html += '</ul>';
        html += '<div class="result-grid" style="margin-top:8px;">';
        html += '<div class="result-item"><span class="result-label">Timeline</span><span class="result-value">' + pkg.timeline + '</span></div>';
        html += '<div class="result-item"><span class="result-label">Price Range</span><span class="result-value">' + pkg.priceRange + '</span></div>';
        html += '</div>';
        html += '</div>';
    }

    // Total estimated investment
    var totalLow = 0;
    var totalHigh = 0;
    for (var m = 0; m < recommended.length; m++) {
        totalLow += recommended[m].pkg.priceLow;
        totalHigh += recommended[m].pkg.priceHigh;
    }
    html += '<div class="result-grid">';
    html += '<div class="result-item result-highlight"><span class="result-label">Total Estimated Investment</span><span class="result-value">$' + totalLow.toLocaleString() + ' - $' + totalHigh.toLocaleString() + '</span></div>';
    html += '</div>';

    html += '<button class="share-btn" onclick="copyScopeResult()">Copy Scope</button>';

    document.getElementById('scopingResult').innerHTML = html;
}

function copyScopeResult() {
    var resultDiv = document.getElementById('scopingResult');
    var text = resultDiv.innerText || resultDiv.textContent;
    navigator.clipboard.writeText(text).then(function() {
        var btn = resultDiv.querySelector('.share-btn');
        if (btn) {
            var orig = btn.textContent;
            btn.textContent = 'Copied!';
            btn.disabled = true;
            setTimeout(function() {
                btn.textContent = orig;
                btn.disabled = false;
            }, 1500);
        }
    }).catch(function() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
    });
}

// Initialize sliders when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createSliderInputs);
} else {
    createSliderInputs();
}

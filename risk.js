var risks = [];

function addRisk() {
    const name = document.getElementById('riskName').value.trim();
    const likelihood = parseInt(document.getElementById('riskLikelihood').value);
    const impact = parseInt(document.getElementById('riskImpact').value);

    const errors = [];
    if (!name) {
        errors.push('Please enter a risk name.');
    } else if (name.length > 100) {
        errors.push('Risk name must be 100 characters or fewer.');
    }
    if (errors.length > 0) {
        document.getElementById('riskResult').innerHTML = errors.map(e => `<p class="error">${e}</p>`).join('');
        return;
    }

    risks.push({ name, likelihood, impact });

    document.getElementById('riskName').value = '';
    document.getElementById('riskLikelihood').value = '1';
    document.getElementById('riskImpact').value = '1';

    document.getElementById('riskResult').innerHTML = `<p>${risks.length} risk(s) added. Click "Generate Assessment" to view results.</p>`;
}

function calculateRiskAssessment() {
    if (risks.length === 0) {
        document.getElementById('riskResult').innerHTML = '<p class="error">Please add at least one risk before generating the assessment.</p>';
        return;
    }

    const assessed = risks.map(r => {
        const score = r.likelihood * r.impact;
        let category, categoryClass;
        if (score >= 20) {
            category = "Critical";
            categoryClass = "risk-critical";
        } else if (score >= 12) {
            category = "High";
            categoryClass = "risk-high";
        } else if (score >= 6) {
            category = "Medium";
            categoryClass = "risk-medium";
        } else {
            category = "Low";
            categoryClass = "risk-low";
        }
        return { ...r, score, category, categoryClass };
    });

    assessed.sort((a, b) => b.score - a.score);

    const resultDiv = document.getElementById('riskResult');
    resultDiv.innerHTML = `
        <h3>Risk Assessment Results</h3>
        <div class="result-grid">
            ${assessed.map(r => `
                <div class="result-item">
                    <span class="result-label">${r.name}</span>
                    <span class="result-value">Score: ${r.score} (L:${r.likelihood} x I:${r.impact})</span>
                    <span class="${r.categoryClass}">${r.category}</span>
                </div>
            `).join('')}
        </div>
        <p>Contact Aurora Technologies for comprehensive risk mitigation strategies and business continuity planning.</p>
        <button class="export-btn" onclick="exportToCSV('risk-results.csv', ['Risk Name', 'Likelihood', 'Impact', 'Score', 'Category'], [${assessed.map(r => "['" + r.name.replace(/'/g, "\\'") + "', '" + r.likelihood + "', '" + r.impact + "', '" + r.score + "', '" + r.category + "']").join(', ')}])">Export CSV</button>
    `;
}

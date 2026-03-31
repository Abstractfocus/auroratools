function createBudgetDefaults() {
    document.getElementById('budgetPersonnel').value = 40;
    document.getElementById('budgetTechnology').value = 25;
    document.getElementById('budgetMarketing').value = 15;
    document.getElementById('budgetOperations').value = 10;
    document.getElementById('budgetTraining').value = 5;
    document.getElementById('budgetContingency').value = 5;
}

function calculateBudget() {
    const totalBudget = parseFloat(document.getElementById('totalBudget').value);

    const errors = [];
    if (isNaN(totalBudget) || totalBudget <= 0) {
        errors.push('Total budget must be greater than 0.');
    }

    const categories = [
        { name: "Personnel", id: "budgetPersonnel" },
        { name: "Technology", id: "budgetTechnology" },
        { name: "Marketing", id: "budgetMarketing" },
        { name: "Operations", id: "budgetOperations" },
        { name: "Training", id: "budgetTraining" },
        { name: "Contingency", id: "budgetContingency" }
    ];

    const allocations = categories.map(c => {
        const pct = parseFloat(document.getElementById(c.id).value) || 0;
        if (pct < 0 || pct > 100) {
            errors.push(`${c.name} percentage must be between 0 and 100.`);
        }
        const amount = totalBudget * (pct / 100);
        return { name: c.name, pct, amount };
    });

    if (errors.length > 0) {
        document.getElementById('budgetResult').innerHTML = errors.map(e => `<p class="error">${e}</p>`).join('');
        return;
    }

    const totalPct = allocations.reduce((sum, a) => sum + a.pct, 0);

    let warning = '';
    if (Math.abs(totalPct - 100) > 0.01) {
        warning = `<p class="error">Warning: Allocations sum to ${totalPct.toFixed(1)}%, not 100%.</p>`;
    }

    const resultDiv = document.getElementById('budgetResult');
    resultDiv.innerHTML = `
        <h3>Budget Allocation Breakdown</h3>
        ${warning}
        <div class="result-grid">
            ${allocations.map(a => `
                <div class="result-item">
                    <span class="result-label">${a.name} (${a.pct}%)</span>
                    <span class="result-value">$${a.amount.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                </div>
            `).join('')}
            <div class="result-item result-highlight">
                <span class="result-label">Total Budget</span>
                <span class="result-value">$${totalBudget.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
            </div>
        </div>
        <div style="margin:16px 0;">${(() => {
            const donutColors = ['#40E0D0', '#0A0A2A', '#28a745', '#ffc107', '#dc3545', '#6f42c1'];
            const donutData = allocations.map((a, i) => ({
                label: a.name,
                value: a.amount,
                color: donutColors[i % donutColors.length]
            }));
            return createDonutChart(donutData, { size: 200, title: 'Budget Allocation' });
        })()}</div>
        <p>Contact Aurora Technologies for expert budget optimization and strategic planning services.</p>
        <button class="export-btn" onclick="exportToCSV('budget-results.csv', ['Category', 'Percentage', 'Amount'], [${allocations.map(a => "['" + a.name + "', '" + a.pct + "%', '$" + a.amount.toLocaleString(undefined, {maximumFractionDigits: 2}) + "']").join(', ')}])">Export CSV</button>
    `;
    if (typeof addShareButton === 'function') addShareButton('budget');
}

createBudgetDefaults();

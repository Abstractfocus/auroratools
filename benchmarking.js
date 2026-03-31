const industryAverages = {
    Technology: { revenue: 5000000, employees: 150, satisfaction: 7.2, marketShare: 8.5 },
    Healthcare: { revenue: 8000000, employees: 300, satisfaction: 7.0, marketShare: 6.0 },
    Finance: { revenue: 12000000, employees: 250, satisfaction: 6.8, marketShare: 7.0 },
    Retail: { revenue: 3000000, employees: 200, satisfaction: 7.5, marketShare: 5.5 },
    Manufacturing: { revenue: 10000000, employees: 400, satisfaction: 6.5, marketShare: 9.0 },
    Other: { revenue: 5000000, employees: 200, satisfaction: 7.0, marketShare: 6.5 }
};

function calculateBenchmark() {
    const industry = document.getElementById('benchIndustry').value;
    const revenue = parseFloat(document.getElementById('benchRevenue').value);
    const employees = parseInt(document.getElementById('benchEmployees').value);
    const satisfaction = parseFloat(document.getElementById('benchSatisfaction').value);
    const marketShare = parseFloat(document.getElementById('benchMarketShare').value);

    const errors = [];
    if (!industry) {
        errors.push('Please select an industry.');
    }
    if (isNaN(revenue) || revenue <= 0) {
        errors.push('Annual revenue must be greater than 0.');
    }
    if (isNaN(employees) || employees <= 0) {
        errors.push('Number of employees must be greater than 0.');
    }
    if (isNaN(satisfaction) || satisfaction < 1 || satisfaction > 10) {
        errors.push('Customer satisfaction must be between 1 and 10.');
    }
    if (isNaN(marketShare) || marketShare < 0 || marketShare > 100) {
        errors.push('Market share must be between 0 and 100.');
    }
    if (errors.length > 0) {
        document.getElementById('benchmarkResult').innerHTML = errors.map(e => `<p class="error">${e}</p>`).join('');
        return;
    }

    const averages = industryAverages[industry];

    const metrics = [
        { name: "Annual Revenue", userVal: revenue, avgVal: averages.revenue, format: "currency" },
        { name: "Number of Employees", userVal: employees, avgVal: averages.employees, format: "number" },
        { name: "Customer Satisfaction", userVal: satisfaction, avgVal: averages.satisfaction, format: "decimal" },
        { name: "Market Share", userVal: marketShare, avgVal: averages.marketShare, format: "percent" }
    ];

    const comparisons = metrics.map(m => {
        const ratio = m.userVal / m.avgVal;
        let label, labelClass;
        if (ratio >= 1.1) {
            label = "Above Average";
            labelClass = "bench-above";
        } else if (ratio >= 0.9) {
            label = "Average";
            labelClass = "bench-average";
        } else {
            label = "Below Average";
            labelClass = "bench-below";
        }

        let userDisplay, avgDisplay;
        if (m.format === "currency") {
            userDisplay = '$' + m.userVal.toLocaleString();
            avgDisplay = '$' + m.avgVal.toLocaleString();
        } else if (m.format === "percent") {
            userDisplay = m.userVal.toFixed(1) + '%';
            avgDisplay = m.avgVal.toFixed(1) + '%';
        } else if (m.format === "decimal") {
            userDisplay = m.userVal.toFixed(1);
            avgDisplay = m.avgVal.toFixed(1);
        } else {
            userDisplay = m.userVal.toLocaleString();
            avgDisplay = m.avgVal.toLocaleString();
        }

        return { name: m.name, userDisplay, avgDisplay, label, labelClass };
    });

    const resultDiv = document.getElementById('benchmarkResult');
    resultDiv.innerHTML = `
        <h3>Competitive Benchmark: ${industry}</h3>
        <div class="result-grid">
            ${comparisons.map(c => `
                <div class="result-item">
                    <span class="result-label">${c.name}</span>
                    <span class="result-value">You: ${c.userDisplay} | Avg: ${c.avgDisplay}</span>
                    <span class="${c.labelClass}">${c.label}</span>
                </div>
            `).join('')}
        </div>
        <p>Contact Aurora Technologies for a comprehensive competitive analysis tailored to your industry.</p>
        <button class="export-btn" onclick="exportToCSV('benchmark-results.csv', ['Metric', 'Your Value', 'Industry Average', 'Comparison'], [${comparisons.map(c => "['" + c.name + "', '" + c.userDisplay + "', '" + c.avgDisplay + "', '" + c.label + "']").join(', ')}])">Export CSV</button>
    `;
    if (typeof addShareButton === 'function') addShareButton('bench');
}

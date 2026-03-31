function calculateROI() {
    const annualRevenue = parseFloat(document.getElementById('annualRevenue').value);
    const employeeCount = parseInt(document.getElementById('employeeCount').value);
    const projectDuration = parseInt(document.getElementById('projectDuration').value);

    const errors = [];
    if (isNaN(annualRevenue) || annualRevenue <= 0) {
        errors.push('Annual revenue must be a positive number.');
    }
    if (isNaN(employeeCount) || employeeCount <= 0) {
        errors.push('Employee count must be a positive whole number.');
    }
    if (isNaN(projectDuration) || projectDuration <= 0) {
        errors.push('Project duration must be a positive number of months.');
    }
    if (errors.length > 0) {
        document.getElementById('roiResult').innerHTML = errors.map(e => `<p class="error">${e}</p>`).join('');
        return;
    }

    const revenueIncrease = 0.15;
    const costReduction = 0.10;
    const productivityIncrease = 0.20;

    const additionalRevenue = annualRevenue * revenueIncrease;
    const costSavings = annualRevenue * 0.7 * costReduction;
    const productivityGain = (employeeCount * 50000 * productivityIncrease) / 2;

    const totalBenefit = (additionalRevenue + costSavings + productivityGain) * (projectDuration / 12);
    const estimatedFees = 50000 + (annualRevenue * 0.01) + (employeeCount * 1000);
    const roi = ((totalBenefit - estimatedFees) / estimatedFees) * 100;

    const resultDiv = document.getElementById('roiResult');
    resultDiv.innerHTML = `
        <h3>Estimated ROI: ${roi.toFixed(2)}%</h3>
        <p>This is an estimated ROI based on industry averages and Aurora's expertise.</p>
        <p>Contact us for a more detailed analysis tailored to your specific business needs.</p>
        <button class="export-btn" onclick="exportToCSV('roi-results.csv', ['Metric', 'Value'], [['Revenue Increase', '${additionalRevenue.toFixed(2)}'], ['Cost Savings', '${costSavings.toFixed(2)}'], ['Productivity Gain', '${productivityGain.toFixed(2)}'], ['Total Benefit', '${totalBenefit.toFixed(2)}'], ['Estimated Fees', '${estimatedFees.toFixed(2)}'], ['ROI %', '${roi.toFixed(2)}']])">Export CSV</button>
    `;
    if (typeof addShareButton === 'function') addShareButton('roi');
}

function calculateROI() {
    const annualRevenue = parseFloat(document.getElementById('annualRevenue').value);
    const employeeCount = parseInt(document.getElementById('employeeCount').value);
    const projectDuration = parseInt(document.getElementById('projectDuration').value);

    if (!annualRevenue || !employeeCount || !projectDuration) {
        document.getElementById('roiResult').innerHTML = '<p class="error">Please fill in all fields with valid numbers.</p>';
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
    `;
}

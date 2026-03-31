function calculateTCO() {
    const softwareCost = parseFloat(document.getElementById('softwareCost').value) || 0;
    const hardwareCost = parseFloat(document.getElementById('hardwareCost').value) || 0;
    const implementationCost = parseFloat(document.getElementById('implementationCost').value) || 0;
    const annualMaintenance = parseFloat(document.getElementById('annualMaintenance').value) || 0;
    const trainingCost = parseFloat(document.getElementById('trainingCost').value) || 0;
    const yearsOwned = parseInt(document.getElementById('yearsOwned').value) || 0;

    if (!yearsOwned || yearsOwned < 1) {
        document.getElementById('tcoResult').innerHTML = '<p class="error">Please enter a valid ownership period (at least 1 year).</p>';
        return;
    }

    const upfrontCosts = softwareCost + hardwareCost + implementationCost + trainingCost;
    const ongoingCosts = annualMaintenance * yearsOwned;
    const totalTCO = upfrontCosts + ongoingCosts;
    const annualizedCost = totalTCO / yearsOwned;
    const monthlyCost = annualizedCost / 12;

    const resultDiv = document.getElementById('tcoResult');
    resultDiv.innerHTML = `
        <h3>Total Cost of Ownership</h3>
        <div class="result-grid">
            <div class="result-item">
                <span class="result-label">Upfront Costs</span>
                <span class="result-value">$${upfrontCosts.toLocaleString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Ongoing Costs (${yearsOwned} yr)</span>
                <span class="result-value">$${ongoingCosts.toLocaleString()}</span>
            </div>
            <div class="result-item result-highlight">
                <span class="result-label">Total TCO</span>
                <span class="result-value">$${totalTCO.toLocaleString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Annualized Cost</span>
                <span class="result-value">$${annualizedCost.toLocaleString(undefined, {maximumFractionDigits: 2})}/yr</span>
            </div>
            <div class="result-item">
                <span class="result-label">Monthly Cost</span>
                <span class="result-value">$${monthlyCost.toLocaleString(undefined, {maximumFractionDigits: 2})}/mo</span>
            </div>
        </div>
        <p>Contact Aurora Technologies for a detailed TCO analysis and cost optimization strategies.</p>
    `;
}

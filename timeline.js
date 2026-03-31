function calculateTimeline() {
    const projectScope = document.getElementById('projectScope').value;
    const teamSize = parseInt(document.getElementById('teamSize').value);
    const complexity = document.getElementById('complexity').value;

    const errors = [];
    if (!projectScope) {
        errors.push('Please select a project scope.');
    }
    if (!complexity) {
        errors.push('Please select a complexity level.');
    }
    if (isNaN(teamSize) || teamSize < 1) {
        errors.push('Team size must be at least 1.');
    }
    if (errors.length > 0) {
        document.getElementById('timelineResult').innerHTML = errors.map(e => `<p class="error">${e}</p>`).join('');
        return;
    }

    const scopeWeeks = { small: 4, medium: 12, large: 24, enterprise: 48 };
    const complexityMultiplier = { low: 0.8, medium: 1.0, high: 1.4, very_high: 1.8 };
    const teamFactor = Math.max(0.5, 1 - (teamSize - 1) * 0.08);

    const baseWeeks = scopeWeeks[projectScope];
    const adjustedWeeks = Math.ceil(baseWeeks * complexityMultiplier[complexity] * teamFactor);

    const phases = [
        { name: "Discovery & Planning", pct: 0.15 },
        { name: "Design & Architecture", pct: 0.15 },
        { name: "Development", pct: 0.40 },
        { name: "Testing & QA", pct: 0.15 },
        { name: "Deployment & Launch", pct: 0.10 },
        { name: "Post-Launch Support", pct: 0.05 }
    ];

    let cumulativeWeeks = 0;
    const phaseDetails = phases.map(phase => {
        const weeks = Math.max(1, Math.round(adjustedWeeks * phase.pct));
        cumulativeWeeks += weeks;
        return { ...phase, weeks };
    });

    const resultDiv = document.getElementById('timelineResult');
    resultDiv.innerHTML = `
        <h3>Estimated Timeline: ${adjustedWeeks} weeks</h3>
        <div class="timeline-phases">
            ${phaseDetails.map(p => `
                <div class="timeline-phase">
                    <div class="phase-bar" style="width: ${p.pct * 100}%"></div>
                    <div class="phase-info">
                        <span class="phase-name">${p.name}</span>
                        <span class="phase-duration">${p.weeks} week${p.weeks > 1 ? 's' : ''}</span>
                    </div>
                </div>
            `).join('')}
        </div>
        <p>This is an estimate based on industry benchmarks. Contact Aurora Technologies for a detailed project plan.</p>
        <button class="export-btn" onclick="exportToCSV('timeline-results.csv', ['Phase', 'Duration (weeks)'], [${phaseDetails.map(p => "['" + p.name + "', '" + p.weeks + "']").join(', ')}])">Export CSV</button>
    `;
    if (typeof addShareButton === 'function') addShareButton('timeline');
}

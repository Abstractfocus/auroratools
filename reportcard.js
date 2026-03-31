/**
 * reportcard.js - Industry Report Card Generator
 * Compares a client to industry averages and generates a graded report.
 */

const reportCardIndustryAverages = {
    Technology: { revenue: 5000000, employees: 150, satisfaction: 7.2, marketShare: 8.5, digitalReadiness: 3.5, operationalEfficiency: 3.2 },
    Healthcare: { revenue: 8000000, employees: 300, satisfaction: 7.0, marketShare: 6.0, digitalReadiness: 2.8, operationalEfficiency: 3.0 },
    Finance: { revenue: 12000000, employees: 250, satisfaction: 6.8, marketShare: 7.0, digitalReadiness: 3.3, operationalEfficiency: 3.4 },
    Retail: { revenue: 3000000, employees: 200, satisfaction: 7.5, marketShare: 5.5, digitalReadiness: 2.5, operationalEfficiency: 2.8 },
    Manufacturing: { revenue: 10000000, employees: 400, satisfaction: 6.5, marketShare: 9.0, digitalReadiness: 2.3, operationalEfficiency: 3.1 },
    Other: { revenue: 5000000, employees: 200, satisfaction: 7.0, marketShare: 6.5, digitalReadiness: 2.8, operationalEfficiency: 3.0 }
};

function getLetterGrade(ratio) {
    if (ratio > 1.2) return 'A';
    if (ratio >= 1.0) return 'B';
    if (ratio >= 0.8) return 'C';
    if (ratio >= 0.6) return 'D';
    return 'F';
}

function gradeToPoints(grade) {
    switch (grade) {
        case 'A': return 4;
        case 'B': return 3;
        case 'C': return 2;
        case 'D': return 1;
        case 'F': return 0;
        default: return 0;
    }
}

function pointsToGrade(points) {
    if (points >= 3.5) return 'A';
    if (points >= 2.5) return 'B';
    if (points >= 1.5) return 'C';
    if (points >= 0.5) return 'D';
    return 'F';
}

function getGradeClass(grade) {
    return 'grade-' + grade.toLowerCase();
}

const recommendedActions = {
    revenue: 'Explore new revenue streams, optimize pricing strategy, and invest in sales enablement.',
    employees: 'Review workforce planning and consider strategic hiring or operational restructuring.',
    satisfaction: 'Implement customer feedback loops, improve support response times, and enhance product quality.',
    marketShare: 'Increase marketing spend, differentiate your offerings, and explore underserved market segments.',
    digitalReadiness: 'Accelerate digital transformation initiatives, invest in cloud infrastructure and modern tools.',
    operationalEfficiency: 'Streamline workflows, adopt automation, and eliminate redundant processes.'
};

function generateReportCard() {
    const industry = document.getElementById('rcIndustry').value;
    const companyName = document.getElementById('rcCompanyName').value.trim();
    const revenue = parseFloat(document.getElementById('rcRevenue').value);
    const employees = parseInt(document.getElementById('rcEmployees').value);
    const satisfaction = parseFloat(document.getElementById('rcSatisfaction').value);
    const marketShare = parseFloat(document.getElementById('rcMarketShare').value);
    const digitalReadiness = parseFloat(document.getElementById('rcDigitalReadiness').value);
    const operationalEfficiency = parseFloat(document.getElementById('rcOperationalEfficiency').value);

    const errors = [];
    if (!industry) errors.push('Please select an industry.');
    if (!companyName) errors.push('Please enter a company name.');
    if (isNaN(revenue) || revenue <= 0) errors.push('Revenue must be greater than 0.');
    if (isNaN(employees) || employees <= 0) errors.push('Employees must be greater than 0.');
    if (isNaN(satisfaction) || satisfaction < 1 || satisfaction > 10) errors.push('Satisfaction must be between 1 and 10.');
    if (isNaN(marketShare) || marketShare < 0 || marketShare > 100) errors.push('Market share must be between 0 and 100.');
    if (isNaN(digitalReadiness) || digitalReadiness < 1 || digitalReadiness > 5) errors.push('Digital readiness must be between 1 and 5.');
    if (isNaN(operationalEfficiency) || operationalEfficiency < 1 || operationalEfficiency > 5) errors.push('Operational efficiency must be between 1 and 5.');

    if (errors.length > 0) {
        document.getElementById('reportCardResult').innerHTML = errors.map(e => '<p class="error">' + e + '</p>').join('');
        return;
    }

    const averages = reportCardIndustryAverages[industry];

    const metrics = [
        { key: 'revenue', name: 'Annual Revenue', userVal: revenue, avgVal: averages.revenue, format: 'currency' },
        { key: 'employees', name: 'Employees', userVal: employees, avgVal: averages.employees, format: 'number' },
        { key: 'satisfaction', name: 'Customer Satisfaction', userVal: satisfaction, avgVal: averages.satisfaction, format: 'decimal' },
        { key: 'marketShare', name: 'Market Share', userVal: marketShare, avgVal: averages.marketShare, format: 'percent' },
        { key: 'digitalReadiness', name: 'Digital Readiness', userVal: digitalReadiness, avgVal: averages.digitalReadiness, format: 'decimal' },
        { key: 'operationalEfficiency', name: 'Operational Efficiency', userVal: operationalEfficiency, avgVal: averages.operationalEfficiency, format: 'decimal' }
    ];

    const graded = metrics.map(m => {
        const ratio = m.userVal / m.avgVal;
        const grade = getLetterGrade(ratio);
        let userDisplay, avgDisplay;
        if (m.format === 'currency') {
            userDisplay = '$' + m.userVal.toLocaleString();
            avgDisplay = '$' + m.avgVal.toLocaleString();
        } else if (m.format === 'percent') {
            userDisplay = m.userVal.toFixed(1) + '%';
            avgDisplay = m.avgVal.toFixed(1) + '%';
        } else if (m.format === 'number') {
            userDisplay = m.userVal.toLocaleString();
            avgDisplay = m.avgVal.toLocaleString();
        } else {
            userDisplay = m.userVal.toFixed(1);
            avgDisplay = m.avgVal.toFixed(1);
        }
        return {
            key: m.key,
            name: m.name,
            userVal: m.userVal,
            avgVal: m.avgVal,
            ratio: ratio,
            grade: grade,
            userDisplay: userDisplay,
            avgDisplay: avgDisplay
        };
    });

    // Overall grade
    const totalPoints = graded.reduce((sum, g) => sum + gradeToPoints(g.grade), 0);
    const overallGrade = pointsToGrade(totalPoints / graded.length);

    // Strengths and improvements
    const strengths = graded.filter(g => g.grade === 'A' || g.grade === 'B');
    const improvements = graded.filter(g => g.grade === 'D' || g.grade === 'F');

    // Build report HTML
    let html = '<div id="reportCardContent">';
    html += '<h3>Industry Report Card: ' + companyName + '</h3>';
    html += '<p><strong>Industry:</strong> ' + industry + '</p>';
    html += '<p style="font-size:1.3em;"><strong>Overall Grade: </strong><span class="' + getGradeClass(overallGrade) + '" style="font-size:1.5em;font-weight:bold;">' + overallGrade + '</span></p>';

    // Metrics table with grades
    html += '<table class="comparison-table"><thead><tr><th>Metric</th><th>Your Value</th><th>Industry Avg</th><th>Grade</th></tr></thead><tbody>';
    graded.forEach(g => {
        html += '<tr><td>' + g.name + '</td><td>' + g.userDisplay + '</td><td>' + g.avgDisplay + '</td>';
        html += '<td class="' + getGradeClass(g.grade) + '" style="font-weight:bold;font-size:1.1em;">' + g.grade + '</td></tr>';
    });
    html += '</tbody></table>';

    // Bar chart: metrics vs industry average
    const chartData = graded.map(g => ({
        label: g.name,
        value: g.ratio * 100,
        maxValue: 200,
        displayValue: Math.round(g.ratio * 100) + '%'
    }));
    html += '<h4>Performance vs Industry Average</h4>';
    html += createBarChart(chartData, { title: 'Your Performance (% of Industry Average)', width: 500 });

    // Strengths
    if (strengths.length > 0) {
        html += '<h4>Strengths</h4><ul>';
        strengths.forEach(s => {
            html += '<li><strong>' + s.name + '</strong> - Grade <span class="' + getGradeClass(s.grade) + '">' + s.grade + '</span> (' + s.userDisplay + ' vs avg ' + s.avgDisplay + ')</li>';
        });
        html += '</ul>';
    }

    // Improvement areas
    if (improvements.length > 0) {
        html += '<h4>Areas for Improvement</h4><ul>';
        improvements.forEach(s => {
            html += '<li><strong>' + s.name + '</strong> - Grade <span class="' + getGradeClass(s.grade) + '">' + s.grade + '</span> (' + s.userDisplay + ' vs avg ' + s.avgDisplay + ')</li>';
        });
        html += '</ul>';
    }

    // Recommended actions
    if (improvements.length > 0) {
        html += '<h4>Recommended Actions</h4><ul>';
        improvements.forEach(s => {
            const action = recommendedActions[s.key] || 'Review and improve this area.';
            html += '<li><strong>' + s.name + ':</strong> ' + action + '</li>';
        });
        html += '</ul>';
    } else {
        html += '<h4>Recommended Actions</h4><p>Great job! All metrics are at or above industry benchmarks. Continue investing in your strongest areas to maintain your competitive edge.</p>';
    }

    html += '</div>';

    // Buttons
    html += '<button class="export-btn" onclick="window.print()">Export PDF</button> ';
    html += '<button class="export-btn" onclick="copyReportCard()">Copy Report</button>';

    document.getElementById('reportCardResult').innerHTML = html;
}

function copyReportCard() {
    const content = document.getElementById('reportCardContent');
    if (!content) {
        alert('Generate a report card first.');
        return;
    }
    const text = content.innerText;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
            alert('Report copied to clipboard!');
        }).catch(function () {
            fallbackCopyReport(text);
        });
    } else {
        fallbackCopyReport(text);
    }
}

function fallbackCopyReport(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        alert('Report copied to clipboard!');
    } catch (e) {
        alert('Unable to copy. Please select and copy manually.');
    }
    document.body.removeChild(ta);
}

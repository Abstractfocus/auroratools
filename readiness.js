const readinessQuestions = [
    { category: "Cloud Adoption", question: "Our core business applications run in the cloud." },
    { category: "Cloud Adoption", question: "We have a cloud migration strategy or roadmap." },
    { category: "Data & Analytics", question: "We collect and analyze data to drive business decisions." },
    { category: "Data & Analytics", question: "We have dashboards or reporting tools for key metrics." },
    { category: "Automation", question: "We use automation for repetitive tasks (invoicing, reporting, etc.)." },
    { category: "Automation", question: "Our workflows are integrated across departments." },
    { category: "Security & Compliance", question: "We have a cybersecurity policy and incident response plan." },
    { category: "Security & Compliance", question: "Our data handling practices comply with relevant regulations." },
    { category: "Culture & Skills", question: "Our team is comfortable adopting new technologies." },
    { category: "Culture & Skills", question: "We invest in ongoing technical training for employees." }
];

function createReadinessQuestions() {
    const container = document.getElementById('readinessQuestions');
    readinessQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.innerHTML = `
            <p>${q.question}</p>
            <input type="range" min="1" max="5" value="3" class="slider" id="rq${index}">
            <div class="slider-labels">
                <span>Not at All</span>
                <span class="slider-value" id="rq${index}-value">3</span>
                <span>Fully Implemented</span>
            </div>
        `;
        container.appendChild(questionDiv);
        document.getElementById(`rq${index}`).addEventListener('input', function() {
            document.getElementById(`rq${index}-value`).textContent = this.value;
        });
    });
}

function calculateReadiness() {
    const categories = ["Cloud Adoption", "Data & Analytics", "Automation", "Security & Compliance", "Culture & Skills"];
    const results = categories.map(category => {
        const catQuestions = readinessQuestions.filter(q => q.category === category);
        const scores = catQuestions.map((_, i) => {
            const index = readinessQuestions.findIndex(q => q === catQuestions[i]);
            return parseInt(document.getElementById(`rq${index}`).value);
        });
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;
        return { category, score: average };
    });

    const overallScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    let level, levelClass;
    if (overallScore >= 4) {
        level = "Advanced";
        levelClass = "level-advanced";
    } else if (overallScore >= 3) {
        level = "Intermediate";
        levelClass = "level-intermediate";
    } else if (overallScore >= 2) {
        level = "Developing";
        levelClass = "level-developing";
    } else {
        level = "Beginning";
        levelClass = "level-beginning";
    }

    const resultDiv = document.getElementById('readinessResult');
    resultDiv.innerHTML = `
        <h3>Digital Readiness: <span class="${levelClass}">${level}</span></h3>
        <p class="overall-score">Overall Score: ${overallScore.toFixed(1)} / 5.0</p>
        <div class="readiness-bars">
            ${results.map(r => `
                <div class="readiness-bar-row">
                    <span class="bar-label">${r.category}</span>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${(r.score / 5) * 100}%"></div>
                    </div>
                    <span class="bar-score">${r.score.toFixed(1)}</span>
                </div>
            `).join('')}
        </div>
        <div style="margin:16px 0;">${(() => {
            const donutColors = ['#40E0D0', '#28a745', '#ffc107', '#dc3545', '#6f42c1'];
            const donutData = results.map((r, i) => ({
                label: r.category,
                value: parseFloat(r.score.toFixed(1)),
                color: donutColors[i % donutColors.length]
            }));
            return createDonutChart(donutData, { size: 200, title: 'Readiness Breakdown' });
        })()}</div>
        <p>Contact Aurora Technologies for a comprehensive digital transformation roadmap tailored to your organization.</p>
    `;
}

createReadinessQuestions();

const questions = [
    { category: "Business Operations", question: "Our business processes are well-documented and efficient." },
    { category: "Business Operations", question: "We have effective risk management strategies in place." },
    { category: "Business Operations", question: "Our financial management practices are robust and up-to-date." },
    { category: "Business Development", question: "We have a clear market strategy and understand our target audience." },
    { category: "Business Development", question: "Our sales strategies are effective and data-driven." },
    { category: "Business Development", question: "We regularly innovate our products/services based on market needs." },
    { category: "Technology", question: "Our technology infrastructure supports our business needs effectively." },
    { category: "Technology", question: "We have strong cybersecurity measures in place." },
    { category: "Technology", question: "We effectively use data analytics to inform business decisions." }
];

function createQuestions() {
    const questionsDiv = document.getElementById('questions');
    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.innerHTML = `
            <p>${q.question}</p>
            <input type="range" min="1" max="5" value="3" class="slider" id="q${index}">
            <div class="slider-labels">
                <span>Strongly Disagree</span>
                <span>Strongly Agree</span>
            </div>
        `;
        questionsDiv.appendChild(questionDiv);
    });
}

function calculateAssessment() {
    const categories = ["Business Operations", "Business Development", "Technology"];
    const results = categories.map(category => {
        const categoryQuestions = questions.filter(q => q.category === category);
        const categoryScores = categoryQuestions.map((_, i) => {
            const index = questions.findIndex(q => q === categoryQuestions[i]);
            return parseInt(document.getElementById(`q${index}`).value);
        });
        const average = categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length;
        return { category, score: average.toFixed(1) };
    });

    const resultDiv = document.getElementById('assessmentResult');
    resultDiv.innerHTML = '<h3>Results:</h3>' + 
        results.map(r => `<p>${r.category}: ${r.score}/5</p>`).join('') +
        '<p>Contact Aurora Technologies for a detailed analysis and tailored solutions to improve your business performance.</p>';
}

createQuestions();

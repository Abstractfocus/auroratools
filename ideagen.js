// Business Idea Generator
// Combines market frameworks, trend analysis, and structured ideation

var ideaHistory = [];

var marketTrends = {
    Technology: ['AI/ML automation', 'Edge computing', 'Cybersecurity-as-a-service', 'Low-code/no-code platforms', 'API-first products', 'Developer tools', 'Vertical SaaS', 'Data privacy solutions'],
    Healthcare: ['Telehealth platforms', 'Mental health tech', 'Remote patient monitoring', 'Health data analytics', 'Clinical workflow automation', 'Personalized medicine', 'Health marketplace', 'Compliance automation'],
    Finance: ['Embedded finance', 'RegTech solutions', 'Neobanking for niches', 'Payment infrastructure', 'Fraud detection AI', 'Wealth management tools', 'Invoice financing platforms', 'Crypto/blockchain services'],
    Retail: ['Social commerce', 'Subscription models', 'Sustainable/ethical products', 'Hyper-personalization', 'Inventory optimization', 'Last-mile delivery solutions', 'AR/VR shopping', 'Recommerce platforms'],
    Manufacturing: ['Predictive maintenance', 'Digital twin solutions', 'Supply chain visibility', 'Quality control AI', 'Energy optimization', 'Robotics-as-a-service', 'Additive manufacturing', 'Smart factory consulting'],
    'Professional Services': ['Fractional executive services', 'Productized consulting', 'Knowledge management', 'Client portals', 'Automated reporting', 'Talent marketplace', 'Niche advisory firms', 'Outcome-based pricing models'],
    Education: ['Corporate training platforms', 'Micro-credentialing', 'Skill gap analysis tools', 'Cohort-based learning', 'EdTech for SMBs', 'Assessment automation', 'Learning analytics', 'Career pathing tools'],
    'Real Estate': ['PropTech platforms', 'Virtual staging', 'Tenant experience apps', 'Property management automation', 'Real estate analytics', 'Smart building solutions', 'Lease management SaaS', 'Construction tech']
};

var businessModels = [
    { name: 'SaaS (Subscription)', description: 'Recurring revenue from software subscriptions', fit: ['Technology', 'Finance', 'Healthcare'] },
    { name: 'Marketplace', description: 'Connect buyers and sellers, take a commission', fit: ['Retail', 'Professional Services', 'Real Estate'] },
    { name: 'Productized Service', description: 'Package expertise into fixed-scope offerings', fit: ['Professional Services', 'Technology', 'Education'] },
    { name: 'Platform/API', description: 'Infrastructure others build on top of', fit: ['Technology', 'Finance'] },
    { name: 'Agency/Consultancy', description: 'High-touch expert services', fit: ['Professional Services', 'Technology', 'Manufacturing'] },
    { name: 'Franchise/License', description: 'License your model for others to operate', fit: ['Retail', 'Education', 'Real Estate'] },
    { name: 'Freemium', description: 'Free basic tier, paid premium features', fit: ['Technology', 'Education'] },
    { name: 'Data/Analytics', description: 'Monetize data collection and insights', fit: ['Healthcare', 'Finance', 'Manufacturing'] }
];

var customerSegments = {
    B2B: ['Startups (1-10 employees)', 'SMBs (11-200 employees)', 'Mid-market (201-1000)', 'Enterprise (1000+)', 'Solopreneurs/Freelancers'],
    B2C: ['Gen Z consumers', 'Working professionals', 'Parents/families', 'Seniors', 'Students'],
    B2B2C: ['Platforms serving businesses who serve consumers', 'White-label solutions', 'Channel partnerships']
};

var problemFrameworks = [
    { category: 'Efficiency', problems: ['Manual processes taking too long', 'Data silos causing errors', 'Lack of visibility into operations', 'Wasted resources or redundant work'] },
    { category: 'Growth', problems: ['Difficulty acquiring customers', 'Low conversion rates', 'Poor customer retention', 'Limited market reach'] },
    { category: 'Compliance', problems: ['Regulatory burden', 'Data privacy requirements', 'Industry-specific mandates', 'Audit and reporting overhead'] },
    { category: 'Cost', problems: ['High operational costs', 'Expensive vendor lock-in', 'Underutilized technology', 'Hiring and talent costs'] },
    { category: 'Experience', problems: ['Poor customer experience', 'Outdated user interfaces', 'Lack of self-service options', 'Fragmented tools/workflows'] }
];

var competitiveAdvantages = [
    'Domain expertise in a specific niche',
    'Proprietary data or algorithms',
    'Network effects (more users = more value)',
    'Switching costs / deep integration',
    'Cost leadership through automation',
    'Superior user experience / design',
    'First-mover in underserved market',
    'Strong distribution channel / partnerships',
    'Regulatory advantage / certifications',
    'Community-driven development'
];

function generateBusinessIdeas() {
    var industry = document.getElementById('ideaIndustry').value;
    var targetType = document.getElementById('ideaTargetType').value;
    var targetSegment = document.getElementById('ideaTargetSegment').value;
    var painPoint = document.getElementById('ideaPainPoint').value;
    var skills = document.getElementById('ideaSkills').value.trim();
    var budget = document.getElementById('ideaBudget').value;
    var passion = document.getElementById('ideaPassion').value.trim();

    var errors = [];
    if (!industry) errors.push('Please select an industry.');
    if (!targetType) errors.push('Please select a target market type.');
    if (!painPoint) errors.push('Please select a problem area.');
    if (errors.length > 0) {
        document.getElementById('ideaGenResult').innerHTML = errors.map(function(e) { return '<p class="error">' + e + '</p>'; }).join('');
        return;
    }

    // Get relevant trends
    var trends = marketTrends[industry] || marketTrends['Technology'];

    // Match business models to industry
    var fitModels = businessModels.filter(function(m) {
        return m.fit.indexOf(industry) !== -1;
    });
    if (fitModels.length < 3) fitModels = businessModels.slice(0, 4);

    // Get problem details
    var problemSet = problemFrameworks.find(function(p) { return p.category === painPoint; });
    var problems = problemSet ? problemSet.problems : problemFrameworks[0].problems;

    // Generate 5 ideas by combining trends + models + problems
    var ideas = [];
    var usedTrends = [];
    for (var i = 0; i < 5; i++) {
        var trend = trends[i % trends.length];
        if (usedTrends.indexOf(trend) !== -1) trend = trends[(i + 3) % trends.length];
        usedTrends.push(trend);

        var model = fitModels[i % fitModels.length];
        var problem = problems[i % problems.length];
        var advantage = competitiveAdvantages[Math.floor(Math.random() * competitiveAdvantages.length)];
        var segment = targetSegment || (customerSegments[targetType] ? customerSegments[targetType][i % customerSegments[targetType].length] : 'General');

        var ideaName = generateIdeaName(trend, model.name, industry);
        var elevator = generateElevator(ideaName, trend, model, problem, segment, industry);
        var revenueEstimate = estimateRevenue(model.name, budget);
        var difficultyScore = estimateDifficulty(model.name, budget);
        var marketSize = estimateMarketSize(industry, segment);

        ideas.push({
            name: ideaName,
            trend: trend,
            model: model.name,
            modelDesc: model.description,
            problem: problem,
            segment: segment,
            advantage: advantage,
            elevator: elevator,
            revenue: revenueEstimate,
            difficulty: difficultyScore,
            marketSize: marketSize
        });
    }

    // Score and rank ideas
    ideas.sort(function(a, b) { return b.revenue.score - a.revenue.score || a.difficulty.score - b.difficulty.score; });

    // Save to history
    ideaHistory.push({
        timestamp: new Date().toISOString(),
        industry: industry,
        targetType: targetType,
        painPoint: painPoint,
        ideas: ideas
    });

    // Render
    var html = '<h3>Generated Business Ideas</h3>';
    html += '<p style="color:#666;margin-bottom:20px;">Based on ' + industry + ' industry trends, targeting ' + targetType + ' ' + (targetSegment || '') + ' with focus on ' + painPoint.toLowerCase() + ' problems.</p>';

    ideas.forEach(function(idea, idx) {
        var diffColor = idea.difficulty.score <= 3 ? '#28a745' : idea.difficulty.score <= 6 ? '#ffc107' : '#dc3545';
        var revColor = idea.revenue.score >= 7 ? '#28a745' : idea.revenue.score >= 4 ? '#ffc107' : '#dc3545';

        html += '<div class="idea-card">';
        html += '<div class="idea-header">';
        html += '<span class="idea-rank">#' + (idx + 1) + '</span>';
        html += '<h4 class="idea-name">' + escapeIdeaHTML(idea.name) + '</h4>';
        html += '</div>';

        html += '<p class="idea-elevator">' + escapeIdeaHTML(idea.elevator) + '</p>';

        html += '<div class="idea-meta">';
        html += '<div class="idea-tag">Trend: ' + escapeIdeaHTML(idea.trend) + '</div>';
        html += '<div class="idea-tag">Model: ' + escapeIdeaHTML(idea.model) + '</div>';
        html += '<div class="idea-tag">Segment: ' + escapeIdeaHTML(idea.segment) + '</div>';
        html += '</div>';

        html += '<div class="idea-metrics">';
        html += '<div class="idea-metric">';
        html += '<span class="idea-metric-label">Revenue Potential</span>';
        html += '<div class="idea-meter"><div class="idea-meter-fill" style="width:' + (idea.revenue.score * 10) + '%;background-color:' + revColor + ';"></div></div>';
        html += '<span class="idea-metric-value">' + idea.revenue.label + '</span>';
        html += '</div>';

        html += '<div class="idea-metric">';
        html += '<span class="idea-metric-label">Difficulty</span>';
        html += '<div class="idea-meter"><div class="idea-meter-fill" style="width:' + (idea.difficulty.score * 10) + '%;background-color:' + diffColor + ';"></div></div>';
        html += '<span class="idea-metric-value">' + idea.difficulty.label + '</span>';
        html += '</div>';

        html += '<div class="idea-metric">';
        html += '<span class="idea-metric-label">Market Size</span>';
        html += '<span class="idea-metric-value" style="font-weight:600;">' + idea.marketSize + '</span>';
        html += '</div>';
        html += '</div>';

        html += '<div class="idea-details">';
        html += '<p><strong>Problem Solved:</strong> ' + escapeIdeaHTML(idea.problem) + '</p>';
        html += '<p><strong>Competitive Advantage:</strong> ' + escapeIdeaHTML(idea.advantage) + '</p>';
        html += '<p><strong>Next Steps:</strong> Validate with 10 potential customers, build an MVP landing page, test pricing.</p>';
        html += '</div>';
        html += '</div>';
    });

    // Action buttons
    html += '<div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">';
    html += '<button class="export-btn" onclick="copyIdeas()">Copy All Ideas</button>';
    html += '<button class="export-btn" onclick="exportIdeasCSV()">Export CSV</button>';
    html += '<button class="share-btn" onclick="generateBusinessIdeas()">Regenerate</button>';
    html += '</div>';

    document.getElementById('ideaGenResult').innerHTML = html;
}

function generateIdeaName(trend, model, industry) {
    var prefixes = ['Smart', 'Auto', 'Pro', 'Next', 'Clear', 'Flow', 'Peak', 'Pulse', 'Core', 'Arc'];
    var suffixes = ['Hub', 'Lab', 'Forge', 'Bridge', 'Stack', 'Dock', 'Base', 'Lens', 'Path', 'Sync'];
    var prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    var suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return prefix + suffix + ' — ' + trend + ' (' + model + ')';
}

function generateElevator(name, trend, model, problem, segment, industry) {
    return 'A ' + model.name.toLowerCase() + ' solution that leverages ' + trend.toLowerCase() +
        ' to solve "' + problem.toLowerCase() + '" for ' + segment.toLowerCase() +
        ' in the ' + industry.toLowerCase() + ' sector. ' + model.description + '.';
}

function estimateRevenue(modelName, budget) {
    var scores = {
        'SaaS (Subscription)': 8, 'Marketplace': 7, 'Platform/API': 9,
        'Productized Service': 6, 'Agency/Consultancy': 5, 'Franchise/License': 7,
        'Freemium': 6, 'Data/Analytics': 8
    };
    var labels = { 1: 'Very Low', 2: 'Low', 3: 'Low-Medium', 4: 'Medium', 5: 'Medium', 6: 'Medium-High', 7: 'High', 8: 'High', 9: 'Very High', 10: 'Exceptional' };
    var score = scores[modelName] || 5;
    if (budget === 'bootstrap') score = Math.max(1, score - 2);
    if (budget === 'funded') score = Math.min(10, score + 1);
    return { score: score, label: labels[score] || 'Medium' };
}

function estimateDifficulty(modelName, budget) {
    var scores = {
        'SaaS (Subscription)': 6, 'Marketplace': 8, 'Platform/API': 9,
        'Productized Service': 3, 'Agency/Consultancy': 2, 'Franchise/License': 7,
        'Freemium': 5, 'Data/Analytics': 7
    };
    var labels = { 1: 'Very Easy', 2: 'Easy', 3: 'Moderate', 4: 'Moderate', 5: 'Medium', 6: 'Challenging', 7: 'Hard', 8: 'Very Hard', 9: 'Expert-Level', 10: 'Extreme' };
    var score = scores[modelName] || 5;
    if (budget === 'bootstrap') score = Math.min(10, score + 1);
    if (budget === 'funded') score = Math.max(1, score - 2);
    return { score: score, label: labels[score] || 'Medium' };
}

function estimateMarketSize(industry, segment) {
    var sizes = {
        'Technology': '$500B+', 'Healthcare': '$400B+', 'Finance': '$350B+',
        'Retail': '$300B+', 'Manufacturing': '$250B+', 'Professional Services': '$200B+',
        'Education': '$150B+', 'Real Estate': '$200B+'
    };
    var base = sizes[industry] || '$100B+';
    if (segment && (segment.indexOf('Startup') !== -1 || segment.indexOf('Solo') !== -1 || segment.indexOf('Student') !== -1)) {
        base = '$10B-$50B (niche)';
    } else if (segment && segment.indexOf('Enterprise') !== -1) {
        base = '$100B+ (enterprise segment)';
    }
    return base;
}

function escapeIdeaHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function copyIdeas() {
    if (ideaHistory.length === 0) return;
    var latest = ideaHistory[ideaHistory.length - 1];
    var text = 'BUSINESS IDEAS — ' + latest.industry + ' Industry\n';
    text += 'Generated: ' + new Date(latest.timestamp).toLocaleDateString() + '\n';
    text += '='.repeat(50) + '\n\n';
    latest.ideas.forEach(function(idea, idx) {
        text += '#' + (idx + 1) + ': ' + idea.name + '\n';
        text += idea.elevator + '\n';
        text += 'Revenue Potential: ' + idea.revenue.label + ' | Difficulty: ' + idea.difficulty.label + ' | Market: ' + idea.marketSize + '\n';
        text += 'Problem: ' + idea.problem + '\n';
        text += 'Advantage: ' + idea.advantage + '\n\n';
    });
    navigator.clipboard.writeText(text).then(function() {
        if (typeof showToast === 'function') showToast('Ideas copied to clipboard!');
    });
}

function exportIdeasCSV() {
    if (ideaHistory.length === 0) return;
    var latest = ideaHistory[ideaHistory.length - 1];
    var headers = ['Rank', 'Name', 'Trend', 'Business Model', 'Segment', 'Problem', 'Advantage', 'Revenue Potential', 'Difficulty', 'Market Size'];
    var rows = latest.ideas.map(function(idea, idx) {
        return [idx + 1, idea.name, idea.trend, idea.model, idea.segment, idea.problem, idea.advantage, idea.revenue.label, idea.difficulty.label, idea.marketSize];
    });
    if (typeof exportToCSV === 'function') {
        exportToCSV('business-ideas.csv', headers, rows);
    }
}

function updateTargetSegments() {
    var type = document.getElementById('ideaTargetType').value;
    var segSelect = document.getElementById('ideaTargetSegment');
    segSelect.innerHTML = '<option value="">-- Any Segment --</option>';
    if (type && customerSegments[type]) {
        customerSegments[type].forEach(function(seg) {
            segSelect.innerHTML += '<option value="' + seg + '">' + seg + '</option>';
        });
    }
}

// Initialize segment dropdown listener
(function() {
    var typeSelect = document.getElementById('ideaTargetType');
    if (typeSelect) typeSelect.addEventListener('change', updateTargetSegments);
})();

// ============================================================
// Profile-Based Idea Generation
// ============================================================

var founderProfiles = {
    default: {
        name: 'Custom',
        skills: [],
        passions: [],
        strengths: [],
        industries: [],
        models: [],
        segments: []
    }
};

// Personalized ideas that go beyond the generic generator —
// these are hand-crafted combinations tailored to specific founder archetypes.

var personalizedIdeas = {
    'strategy-consulting-tech': [
        {
            name: 'SMB Command Center',
            elevator: 'An all-in-one SaaS dashboard that gives small business owners the same strategic visibility that enterprise companies get from McKinsey — automated KPI tracking, competitive benchmarking, and AI-generated action plans, all for $299/month.',
            trend: 'Vertical SaaS',
            model: 'SaaS (Subscription)',
            problem: 'SMBs lack strategic visibility into their own business performance',
            segment: 'SMBs (11-200 employees)',
            advantage: 'Domain expertise from hundreds of consulting engagements baked into the product',
            revenue: { score: 9, label: 'Very High' },
            difficulty: { score: 6, label: 'Challenging' },
            marketSize: '$50B+ (SMB software market)',
            nextSteps: 'You already built the prototype — Aurora Tools IS this product. Package it as a hosted SaaS with client logins, persistent data, and white-label options.'
        },
        {
            name: 'Fractional CTO Marketplace',
            elevator: 'A marketplace connecting SMBs with vetted fractional CTOs for part-time technology leadership. Businesses get enterprise-grade tech strategy at 20% of the cost of a full-time hire. Platform handles matching, scheduling, and deliverable tracking.',
            trend: 'Fractional executive services',
            model: 'Marketplace',
            problem: 'SMBs need technology leadership but cannot afford a full-time CTO',
            segment: 'SMBs (11-200 employees)',
            advantage: 'Network effects — more CTOs attract more businesses, more businesses attract more CTOs',
            revenue: { score: 8, label: 'High' },
            difficulty: { score: 7, label: 'Hard' },
            marketSize: '$15B (fractional executive market)',
            nextSteps: 'Start as a curated service (you do the matching manually), validate demand with 10 placements, then build the platform.'
        },
        {
            name: 'Digital Transformation Scorecard (Productized)',
            elevator: 'Turn your SMB Assessment + Digital Readiness tools into a paid productized service. Clients pay $2,500 for an automated assessment, a 30-page branded report, and a 1-hour strategy call. Scale to 20+ per month with minimal effort.',
            trend: 'Productized consulting',
            model: 'Productized Service',
            problem: 'Businesses want strategic advice but full consulting engagements are too expensive',
            segment: 'SMBs (11-200 employees)',
            advantage: 'You already built the tools — just add a payment layer and premium report generation',
            revenue: { score: 7, label: 'High' },
            difficulty: { score: 2, label: 'Easy' },
            marketSize: '$8B (SMB consulting market)',
            nextSteps: 'Add Stripe checkout, auto-generate PDF reports from existing tool outputs, book strategy calls via Calendly. Launch in 2 weeks.'
        },
        {
            name: 'Pipeline Intelligence Platform',
            elevator: 'Analytics SaaS that connects to CRMs (HubSpot, Salesforce, Pipedrive) and provides the kind of pipeline analytics, deal velocity tracking, and revenue forecasting you built — but as a plug-and-play product for sales teams.',
            trend: 'Data privacy solutions',
            model: 'SaaS (Subscription)',
            problem: 'Sales teams lack actionable pipeline analytics beyond basic CRM reports',
            segment: 'Mid-market (201-1000)',
            advantage: 'First-mover in SMB-focused pipeline intelligence (competitors target enterprise)',
            revenue: { score: 8, label: 'High' },
            difficulty: { score: 7, label: 'Hard' },
            marketSize: '$25B (sales intelligence market)',
            nextSteps: 'Build a HubSpot integration as an MVP. Your pipeline.js already has the analytics logic — adapt it to pull from real CRM APIs.'
        },
        {
            name: 'Aurora Accelerator (Licensing)',
            elevator: 'License the entire Aurora Tools platform to other consulting firms, agencies, and MSPs as a white-label solution. They rebrand it and use it with their own clients. You charge $500/month per licensee.',
            trend: 'Low-code/no-code platforms',
            model: 'Franchise/License',
            problem: 'Other consultancies want professional tools but do not have the resources to build them',
            segment: 'Solopreneurs/Freelancers',
            advantage: 'Already built — just add multi-tenancy, branding customization, and a billing layer',
            revenue: { score: 8, label: 'High' },
            difficulty: { score: 4, label: 'Moderate' },
            marketSize: '$12B (consulting tools market)',
            nextSteps: 'Add a settings page for logo/colors/company name. Deploy as a hosted multi-tenant app. Recruit 5 beta licensees from your network.'
        }
    ]
};

function generateProfileIdeas() {
    var resultDiv = document.getElementById('ideaGenResult');

    var ideas = personalizedIdeas['strategy-consulting-tech'];

    var html = '<div style="background:#0A0A2A;color:white;padding:20px;border-radius:8px;margin-bottom:20px;">';
    html += '<h3 style="color:#40E0D0;margin-top:0;">Personalized Ideas for Your Profile</h3>';
    html += '<p style="color:#ccc;margin:0;">Based on your skills (business strategy, sales pipeline, technology leadership, product thinking, decision frameworks) and passions (helping SMBs, efficiency, automation, comprehensive tooling, strategic accuracy, new business creation).</p>';
    html += '</div>';

    ideas.forEach(function(idea, idx) {
        var diffColor = idea.difficulty.score <= 3 ? '#28a745' : idea.difficulty.score <= 6 ? '#ffc107' : '#dc3545';
        var revColor = idea.revenue.score >= 7 ? '#28a745' : idea.revenue.score >= 4 ? '#ffc107' : '#dc3545';

        html += '<div class="idea-card" style="border-left:4px solid #40E0D0;">';
        html += '<div class="idea-header">';
        html += '<span class="idea-rank">#' + (idx + 1) + '</span>';
        html += '<h4 class="idea-name">' + escapeIdeaHTML(idea.name) + '</h4>';
        html += '</div>';

        html += '<p class="idea-elevator">' + escapeIdeaHTML(idea.elevator) + '</p>';

        html += '<div class="idea-meta">';
        html += '<div class="idea-tag">Trend: ' + escapeIdeaHTML(idea.trend) + '</div>';
        html += '<div class="idea-tag">Model: ' + escapeIdeaHTML(idea.model) + '</div>';
        html += '<div class="idea-tag">Segment: ' + escapeIdeaHTML(idea.segment) + '</div>';
        html += '</div>';

        html += '<div class="idea-metrics">';
        html += '<div class="idea-metric">';
        html += '<span class="idea-metric-label">Revenue Potential</span>';
        html += '<div class="idea-meter"><div class="idea-meter-fill" style="width:' + (idea.revenue.score * 10) + '%;background-color:' + revColor + ';"></div></div>';
        html += '<span class="idea-metric-value">' + idea.revenue.label + '</span>';
        html += '</div>';

        html += '<div class="idea-metric">';
        html += '<span class="idea-metric-label">Difficulty</span>';
        html += '<div class="idea-meter"><div class="idea-meter-fill" style="width:' + (idea.difficulty.score * 10) + '%;background-color:' + diffColor + ';"></div></div>';
        html += '<span class="idea-metric-value">' + idea.difficulty.label + '</span>';
        html += '</div>';

        html += '<div class="idea-metric">';
        html += '<span class="idea-metric-label">Market Size</span>';
        html += '<span class="idea-metric-value" style="font-weight:600;">' + idea.marketSize + '</span>';
        html += '</div>';
        html += '</div>';

        html += '<div class="idea-details">';
        html += '<p><strong>Problem Solved:</strong> ' + escapeIdeaHTML(idea.problem) + '</p>';
        html += '<p><strong>Competitive Advantage:</strong> ' + escapeIdeaHTML(idea.advantage) + '</p>';
        html += '<p style="color:#0A0A2A;font-weight:600;"><strong>Your Next Step:</strong> ' + escapeIdeaHTML(idea.nextSteps) + '</p>';
        html += '</div>';
        html += '</div>';
    });

    html += '<div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">';
    html += '<button class="export-btn" onclick="copyProfileIdeas()">Copy All Ideas</button>';
    html += '<button class="export-btn" onclick="exportProfileIdeasCSV()">Export CSV</button>';
    html += '</div>';

    resultDiv.innerHTML = html;

    // Save to history
    ideaHistory.push({
        timestamp: new Date().toISOString(),
        industry: 'Personalized (Multi-industry)',
        targetType: 'B2B',
        painPoint: 'Efficiency + Growth',
        ideas: ideas
    });
}

function copyProfileIdeas() {
    var ideas = personalizedIdeas['strategy-consulting-tech'];
    var text = 'PERSONALIZED BUSINESS IDEAS\n';
    text += 'Generated for: Aurora Technologies Founder Profile\n';
    text += '='.repeat(50) + '\n\n';
    ideas.forEach(function(idea, idx) {
        text += '#' + (idx + 1) + ': ' + idea.name + '\n';
        text += idea.elevator + '\n';
        text += 'Revenue: ' + idea.revenue.label + ' | Difficulty: ' + idea.difficulty.label + ' | Market: ' + idea.marketSize + '\n';
        text += 'Problem: ' + idea.problem + '\n';
        text += 'Advantage: ' + idea.advantage + '\n';
        text += 'Next Step: ' + idea.nextSteps + '\n\n';
    });
    navigator.clipboard.writeText(text).then(function() {
        if (typeof showToast === 'function') showToast('Ideas copied to clipboard!');
    });
}

function exportProfileIdeasCSV() {
    var ideas = personalizedIdeas['strategy-consulting-tech'];
    var headers = ['Rank', 'Name', 'Model', 'Segment', 'Problem', 'Advantage', 'Revenue', 'Difficulty', 'Market Size', 'Next Step'];
    var rows = ideas.map(function(idea, idx) {
        return [idx + 1, idea.name, idea.model, idea.segment, idea.problem, idea.advantage, idea.revenue.label, idea.difficulty.label, idea.marketSize, idea.nextSteps];
    });
    if (typeof exportToCSV === 'function') {
        exportToCSV('personalized-business-ideas.csv', headers, rows);
    }
}

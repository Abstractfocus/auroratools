function generateProposal() {
    var clientName = document.getElementById('proposalClientName').value.trim();
    var clientCompany = document.getElementById('proposalClientCompany').value.trim();
    var industry = document.getElementById('proposalIndustry').value;
    var engagementType = document.getElementById('proposalEngagement').value;
    var scope = document.getElementById('proposalScope').value;
    var challenges = document.getElementById('proposalChallenges').value.trim();
    var budgetRange = document.getElementById('proposalBudget').value;

    var errors = [];
    if (!clientName) errors.push('Please enter the client name.');
    if (!clientCompany) errors.push('Please enter the client company.');
    if (!industry) errors.push('Please select an industry.');
    if (!engagementType) errors.push('Please select an engagement type.');
    if (!scope) errors.push('Please select a scope.');
    if (!challenges) errors.push('Please describe the key challenges.');
    if (!budgetRange) errors.push('Please select a budget range.');

    var resultDiv = document.getElementById('proposalResult');
    if (errors.length > 0) {
        resultDiv.innerHTML = errors.map(function (e) { return '<p class="error">' + e + '</p>'; }).join('');
        return;
    }

    // Approach templates per engagement type
    var approachTemplates = {
        'Digital Transformation': [
            'Current state assessment and digital maturity evaluation',
            'Technology roadmap development aligned with business objectives',
            'Implementation planning with phased rollout strategy',
            'Change management strategy and stakeholder alignment'
        ],
        'Technology Audit': [
            'Comprehensive infrastructure review and documentation',
            'Security assessment and vulnerability analysis',
            'Performance benchmarking against industry standards',
            'Detailed recommendations report with prioritized action items'
        ],
        'Process Optimization': [
            'End-to-end process mapping and bottleneck identification',
            'Workflow automation opportunity analysis',
            'Lean methodology implementation and waste reduction',
            'Continuous improvement framework design'
        ],
        'Cybersecurity Assessment': [
            'Threat landscape analysis and risk profiling',
            'Penetration testing and vulnerability scanning',
            'Compliance gap analysis against industry frameworks',
            'Security roadmap and incident response planning'
        ],
        'Custom': [
            'Discovery workshops to define project requirements',
            'Custom solution architecture and design',
            'Iterative development with milestone-based delivery',
            'Knowledge transfer and post-delivery support planning'
        ]
    };

    // Deliverables based on scope and engagement type
    var deliverablesByScope = {
        'Small': 3,
        'Medium': 5,
        'Large': 7,
        'Enterprise': 9
    };

    var deliverableTemplates = {
        'Digital Transformation': [
            'Digital Maturity Assessment Report',
            'Technology Roadmap Document',
            'Implementation Plan with Timeline',
            'Change Management Playbook',
            'Vendor Evaluation Matrix',
            'Training and Adoption Program',
            'KPI Dashboard Design',
            'Post-Implementation Review Framework',
            'Executive Steering Committee Charter'
        ],
        'Technology Audit': [
            'Infrastructure Inventory Report',
            'Security Posture Assessment',
            'Performance Benchmark Report',
            'Prioritized Recommendations Document',
            'Risk Register with Mitigation Strategies',
            'Technology Debt Analysis',
            'Compliance Status Report',
            'Architecture Improvement Blueprint',
            'Cost Optimization Recommendations'
        ],
        'Process Optimization': [
            'Current State Process Maps',
            'Bottleneck Analysis Report',
            'Optimized Process Designs',
            'Automation Feasibility Study',
            'Implementation Roadmap',
            'ROI Projections for Each Optimization',
            'Standard Operating Procedures',
            'Performance Monitoring Dashboard',
            'Continuous Improvement Playbook'
        ],
        'Cybersecurity Assessment': [
            'Threat Assessment Report',
            'Vulnerability Scan Results',
            'Penetration Test Report',
            'Compliance Gap Analysis',
            'Security Roadmap',
            'Incident Response Plan',
            'Security Awareness Training Program',
            'Data Protection Strategy',
            'Third-Party Risk Assessment'
        ],
        'Custom': [
            'Requirements Specification Document',
            'Solution Architecture Diagram',
            'Development Progress Reports',
            'Testing and QA Report',
            'User Documentation',
            'Deployment Runbook',
            'Training Materials',
            'Post-Launch Support Plan',
            'Project Retrospective Summary'
        ]
    };

    // Timeline estimation (scope-based weeks, matching timeline.js logic)
    var scopeWeeks = { 'Small': 4, 'Medium': 12, 'Large': 24, 'Enterprise': 48 };
    var totalWeeks = scopeWeeks[scope];

    var timelinePhases = [
        { name: 'Discovery & Planning', pct: 0.15 },
        { name: 'Design & Architecture', pct: 0.15 },
        { name: 'Execution', pct: 0.40 },
        { name: 'Testing & Validation', pct: 0.15 },
        { name: 'Delivery & Handoff', pct: 0.10 },
        { name: 'Post-Engagement Support', pct: 0.05 }
    ];

    var phaseDetails = timelinePhases.map(function (phase) {
        var weeks = Math.max(1, Math.round(totalWeeks * phase.pct));
        return { name: phase.name, weeks: weeks };
    });

    // Budget breakdown by phase
    var budgetValues = {
        '$10K-$25K': { min: 10000, max: 25000 },
        '$25K-$50K': { min: 25000, max: 50000 },
        '$50K-$100K': { min: 50000, max: 100000 },
        '$100K-$250K': { min: 100000, max: 250000 },
        '$250K+': { min: 250000, max: 500000 }
    };

    var budget = budgetValues[budgetRange];
    var midBudget = Math.round((budget.min + budget.max) / 2);

    var investmentPhases = [
        { name: 'Phase 1: Discovery & Planning', pct: 0.20 },
        { name: 'Phase 2: Core Execution', pct: 0.45 },
        { name: 'Phase 3: Testing & Refinement', pct: 0.20 },
        { name: 'Phase 4: Delivery & Support', pct: 0.15 }
    ];

    var investmentBreakdown = investmentPhases.map(function (phase) {
        return { name: phase.name, amount: Math.round(midBudget * phase.pct) };
    });

    // Build approach list
    var approach = approachTemplates[engagementType];

    // Build deliverables list
    var numDeliverables = deliverablesByScope[scope];
    var deliverables = deliverableTemplates[engagementType].slice(0, numDeliverables);

    // Generate today's date
    var today = new Date();
    var dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Format currency
    function formatCurrency(val) {
        return '$' + val.toLocaleString('en-US');
    }

    // Build the proposal HTML
    var proposalHTML = '' +
        '<div class="proposal-output" id="proposalOutput">' +
            '<div class="proposal-header">' +
                '<div class="proposal-logo">AURORA TECHNOLOGIES</div>' +
                '<div class="proposal-meta">' +
                    '<p>Prepared for: <strong>' + escapeHTML(clientName) + '</strong>, ' + escapeHTML(clientCompany) + '</p>' +
                    '<p>Date: ' + dateStr + '</p>' +
                    '<p>Engagement: ' + engagementType + ' | Scope: ' + scope + '</p>' +
                '</div>' +
            '</div>' +

            '<div class="proposal-section">' +
                '<h3>1. Executive Summary</h3>' +
                '<p>Aurora Technologies is pleased to present this proposal for a <strong>' + engagementType + '</strong> engagement with <strong>' + escapeHTML(clientCompany) + '</strong>. ' +
                'Based on our understanding of the ' + industry.toLowerCase() + ' industry and the challenges faced by your organization, we have developed a tailored ' + scope.toLowerCase() + '-scale approach ' +
                'designed to deliver measurable results within an estimated <strong>' + totalWeeks + '-week</strong> timeline.</p>' +
                '<p>Our team brings deep expertise in ' + industry.toLowerCase() + ' sector engagements and a proven track record of helping organizations navigate ' +
                engagementType.toLowerCase() + ' initiatives. This proposal outlines our recommended approach, key deliverables, timeline, and investment.</p>' +
            '</div>' +

            '<div class="proposal-section">' +
                '<h3>2. Understanding of Challenges</h3>' +
                '<p>' + escapeHTML(challenges).replace(/\n/g, '<br>') + '</p>' +
            '</div>' +

            '<div class="proposal-section">' +
                '<h3>3. Proposed Approach</h3>' +
                '<p>Our approach to this ' + engagementType.toLowerCase() + ' engagement is structured around the following pillars:</p>' +
                '<ul>' +
                    approach.map(function (item) { return '<li>' + item + '</li>'; }).join('') +
                '</ul>' +
            '</div>' +

            '<div class="proposal-section">' +
                '<h3>4. Deliverables</h3>' +
                '<p>The following deliverables will be produced as part of this engagement:</p>' +
                '<ul>' +
                    deliverables.map(function (item) { return '<li>' + item + '</li>'; }).join('') +
                '</ul>' +
            '</div>' +

            '<div class="proposal-section">' +
                '<h3>5. Timeline</h3>' +
                '<p>Estimated total duration: <strong>' + totalWeeks + ' weeks</strong></p>' +
                '<div class="proposal-timeline">' +
                    phaseDetails.map(function (p) {
                        return '<div class="proposal-phase">' +
                            '<div class="proposal-phase-bar" style="width: ' + (p.weeks / totalWeeks * 100) + '%"></div>' +
                            '<div class="phase-info">' +
                                '<span class="phase-name">' + p.name + '</span>' +
                                '<span class="phase-duration">' + p.weeks + ' week' + (p.weeks > 1 ? 's' : '') + '</span>' +
                            '</div>' +
                        '</div>';
                    }).join('') +
                '</div>' +
            '</div>' +

            '<div class="proposal-section">' +
                '<h3>6. Investment</h3>' +
                '<p>Budget range: <strong>' + budgetRange + '</strong></p>' +
                '<p>Estimated investment breakdown (based on midpoint of ' + formatCurrency(midBudget) + '):</p>' +
                '<div class="result-grid">' +
                    investmentBreakdown.map(function (item) {
                        return '<div class="result-item">' +
                            '<span class="result-label">' + item.name + '</span>' +
                            '<span class="result-value">' + formatCurrency(item.amount) + '</span>' +
                        '</div>';
                    }).join('') +
                    '<div class="result-item result-highlight">' +
                        '<span class="result-label">Total Estimated Investment</span>' +
                        '<span class="result-value">' + formatCurrency(midBudget) + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div class="proposal-section">' +
                '<h3>7. Why Aurora Technologies</h3>' +
                '<ul>' +
                    '<li><strong>Industry Expertise:</strong> Deep experience across technology, healthcare, finance, retail, and manufacturing sectors with a proven methodology refined over hundreds of engagements.</li>' +
                    '<li><strong>Tailored Solutions:</strong> We do not believe in one-size-fits-all. Every engagement is customized to your unique business context, culture, and objectives.</li>' +
                    '<li><strong>Measurable Results:</strong> Our work is anchored in KPIs and measurable outcomes. We define success criteria upfront and track progress transparently.</li>' +
                    '<li><strong>End-to-End Support:</strong> From initial discovery through post-launch support, our team is with you at every step to ensure sustained impact.</li>' +
                    '<li><strong>Trusted Partner:</strong> Our client retention rate exceeds 90%, reflecting our commitment to long-term partnerships and continuous value delivery.</li>' +
                '</ul>' +
            '</div>' +

            '<div class="proposal-actions">' +
                '<button class="share-btn" onclick="exportProposalPDF()">Export PDF</button>' +
                '<button class="share-btn" onclick="copyProposalText()">Copy as Text</button>' +
            '</div>' +
        '</div>';

    resultDiv.innerHTML = proposalHTML;
}

function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function exportProposalPDF() {
    var proposalOutput = document.getElementById('proposalOutput');
    if (!proposalOutput) return;
    proposalOutput.classList.add('proposal-print-mode');
    window.print();
    setTimeout(function () {
        proposalOutput.classList.remove('proposal-print-mode');
    }, 500);
}

function copyProposalText() {
    var clientName = document.getElementById('proposalClientName').value.trim();
    var clientCompany = document.getElementById('proposalClientCompany').value.trim();
    var industry = document.getElementById('proposalIndustry').value;
    var engagementType = document.getElementById('proposalEngagement').value;
    var scope = document.getElementById('proposalScope').value;
    var challenges = document.getElementById('proposalChallenges').value.trim();
    var budgetRange = document.getElementById('proposalBudget').value;

    var scopeWeeks = { 'Small': 4, 'Medium': 12, 'Large': 24, 'Enterprise': 48 };
    var totalWeeks = scopeWeeks[scope];

    var budgetValues = {
        '$10K-$25K': { min: 10000, max: 25000 },
        '$25K-$50K': { min: 25000, max: 50000 },
        '$50K-$100K': { min: 50000, max: 100000 },
        '$100K-$250K': { min: 100000, max: 250000 },
        '$250K+': { min: 250000, max: 500000 }
    };
    var budget = budgetValues[budgetRange];
    var midBudget = Math.round((budget.min + budget.max) / 2);

    function formatCurrency(val) {
        return '$' + val.toLocaleString('en-US');
    }

    var approachTemplates = {
        'Digital Transformation': [
            'Current state assessment and digital maturity evaluation',
            'Technology roadmap development aligned with business objectives',
            'Implementation planning with phased rollout strategy',
            'Change management strategy and stakeholder alignment'
        ],
        'Technology Audit': [
            'Comprehensive infrastructure review and documentation',
            'Security assessment and vulnerability analysis',
            'Performance benchmarking against industry standards',
            'Detailed recommendations report with prioritized action items'
        ],
        'Process Optimization': [
            'End-to-end process mapping and bottleneck identification',
            'Workflow automation opportunity analysis',
            'Lean methodology implementation and waste reduction',
            'Continuous improvement framework design'
        ],
        'Cybersecurity Assessment': [
            'Threat landscape analysis and risk profiling',
            'Penetration testing and vulnerability scanning',
            'Compliance gap analysis against industry frameworks',
            'Security roadmap and incident response planning'
        ],
        'Custom': [
            'Discovery workshops to define project requirements',
            'Custom solution architecture and design',
            'Iterative development with milestone-based delivery',
            'Knowledge transfer and post-delivery support planning'
        ]
    };

    var deliverableTemplates = {
        'Digital Transformation': [
            'Digital Maturity Assessment Report', 'Technology Roadmap Document', 'Implementation Plan with Timeline',
            'Change Management Playbook', 'Vendor Evaluation Matrix', 'Training and Adoption Program',
            'KPI Dashboard Design', 'Post-Implementation Review Framework', 'Executive Steering Committee Charter'
        ],
        'Technology Audit': [
            'Infrastructure Inventory Report', 'Security Posture Assessment', 'Performance Benchmark Report',
            'Prioritized Recommendations Document', 'Risk Register with Mitigation Strategies', 'Technology Debt Analysis',
            'Compliance Status Report', 'Architecture Improvement Blueprint', 'Cost Optimization Recommendations'
        ],
        'Process Optimization': [
            'Current State Process Maps', 'Bottleneck Analysis Report', 'Optimized Process Designs',
            'Automation Feasibility Study', 'Implementation Roadmap', 'ROI Projections for Each Optimization',
            'Standard Operating Procedures', 'Performance Monitoring Dashboard', 'Continuous Improvement Playbook'
        ],
        'Cybersecurity Assessment': [
            'Threat Assessment Report', 'Vulnerability Scan Results', 'Penetration Test Report',
            'Compliance Gap Analysis', 'Security Roadmap', 'Incident Response Plan',
            'Security Awareness Training Program', 'Data Protection Strategy', 'Third-Party Risk Assessment'
        ],
        'Custom': [
            'Requirements Specification Document', 'Solution Architecture Diagram', 'Development Progress Reports',
            'Testing and QA Report', 'User Documentation', 'Deployment Runbook',
            'Training Materials', 'Post-Launch Support Plan', 'Project Retrospective Summary'
        ]
    };

    var deliverablesByScope = { 'Small': 3, 'Medium': 5, 'Large': 7, 'Enterprise': 9 };
    var numDeliverables = deliverablesByScope[scope];
    var deliverables = deliverableTemplates[engagementType].slice(0, numDeliverables);
    var approach = approachTemplates[engagementType];

    var investmentPhases = [
        { name: 'Phase 1: Discovery & Planning', pct: 0.20 },
        { name: 'Phase 2: Core Execution', pct: 0.45 },
        { name: 'Phase 3: Testing & Refinement', pct: 0.20 },
        { name: 'Phase 4: Delivery & Support', pct: 0.15 }
    ];

    var today = new Date();
    var dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    var text = 'AURORA TECHNOLOGIES - PROPOSAL\n' +
        '================================\n\n' +
        'Prepared for: ' + clientName + ', ' + clientCompany + '\n' +
        'Date: ' + dateStr + '\n' +
        'Engagement: ' + engagementType + ' | Scope: ' + scope + '\n\n' +
        '1. EXECUTIVE SUMMARY\n' +
        '--------------------\n' +
        'Aurora Technologies is pleased to present this proposal for a ' + engagementType + ' engagement with ' + clientCompany + '. ' +
        'Based on our understanding of the ' + industry.toLowerCase() + ' industry and the challenges faced by your organization, we have developed a tailored ' + scope.toLowerCase() + '-scale approach ' +
        'designed to deliver measurable results within an estimated ' + totalWeeks + '-week timeline.\n\n' +
        '2. UNDERSTANDING OF CHALLENGES\n' +
        '------------------------------\n' +
        challenges + '\n\n' +
        '3. PROPOSED APPROACH\n' +
        '--------------------\n' +
        approach.map(function (item) { return '  - ' + item; }).join('\n') + '\n\n' +
        '4. DELIVERABLES\n' +
        '---------------\n' +
        deliverables.map(function (item) { return '  - ' + item; }).join('\n') + '\n\n' +
        '5. TIMELINE\n' +
        '-----------\n' +
        'Total duration: ' + totalWeeks + ' weeks\n' +
        [
            { name: 'Discovery & Planning', pct: 0.15 },
            { name: 'Design & Architecture', pct: 0.15 },
            { name: 'Execution', pct: 0.40 },
            { name: 'Testing & Validation', pct: 0.15 },
            { name: 'Delivery & Handoff', pct: 0.10 },
            { name: 'Post-Engagement Support', pct: 0.05 }
        ].map(function (p) {
            return '  - ' + p.name + ': ' + Math.max(1, Math.round(totalWeeks * p.pct)) + ' weeks';
        }).join('\n') + '\n\n' +
        '6. INVESTMENT\n' +
        '-------------\n' +
        'Budget range: ' + budgetRange + '\n' +
        'Estimated breakdown (midpoint ' + formatCurrency(midBudget) + '):\n' +
        investmentPhases.map(function (p) {
            return '  - ' + p.name + ': ' + formatCurrency(Math.round(midBudget * p.pct));
        }).join('\n') + '\n' +
        '  - Total: ' + formatCurrency(midBudget) + '\n\n' +
        '7. WHY AURORA TECHNOLOGIES\n' +
        '--------------------------\n' +
        '  - Industry Expertise: Deep experience across multiple sectors with a proven methodology.\n' +
        '  - Tailored Solutions: Every engagement is customized to your unique business context.\n' +
        '  - Measurable Results: Work anchored in KPIs and measurable outcomes.\n' +
        '  - End-to-End Support: From discovery through post-launch support.\n' +
        '  - Trusted Partner: Client retention rate exceeding 90%.\n';

    navigator.clipboard.writeText(text).then(function () {
        var btn = document.querySelector('.proposal-actions .share-btn:last-child');
        if (btn) {
            var original = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(function () { btn.textContent = original; }, 2000);
        }
    });
}

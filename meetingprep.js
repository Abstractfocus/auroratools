// Meeting Prep Generator

var meetingTemplates = {
    'Discovery Call': {
        objective: 'Understand the client\'s current state, pain points, and goals to determine if Aurora Technologies is a good fit.',
        agenda: [
            { item: 'Introductions and rapport building', time: '5 min' },
            { item: 'Client background and current challenges', time: '15 min' },
            { item: 'Aurora capabilities overview', time: '10 min' },
            { item: 'Q&A and pain point deep-dive', time: '15 min' },
            { item: 'Next steps and timeline discussion', time: '5 min' }
        ],
        questions: {
            general: [
                'What prompted you to explore external consulting support at this time?',
                'What does success look like for your organization in the next 12 months?',
                'What have you tried in the past to address these challenges?',
                'Who are the key stakeholders and decision-makers for this initiative?',
                'What is your timeline for making a decision on a partner?'
            ],
            Technology: [
                'What technology stack are you currently running?',
                'How do you handle data security and compliance today?'
            ],
            Healthcare: [
                'How are you handling HIPAA compliance and patient data management?',
                'What EHR or clinical systems are you currently using?'
            ],
            Finance: [
                'What regulatory requirements are driving your technology decisions?',
                'How are you currently managing risk and compliance reporting?'
            ],
            Retail: [
                'How are you managing your omnichannel customer experience?',
                'What does your current supply chain technology look like?'
            ],
            Manufacturing: [
                'What level of automation do you currently have in your operations?',
                'How are you tracking production efficiency and quality metrics?'
            ],
            'Professional Services': [
                'How do you currently manage project delivery and resource allocation?',
                'What tools do you use for client relationship management?'
            ],
            Education: [
                'How are you adapting to digital learning demands?',
                'What systems do you use for student and faculty management?'
            ],
            'Real Estate': [
                'How are you leveraging technology for property management?',
                'What tools do you use for market analysis and client outreach?'
            ],
            Other: [
                'What are the unique challenges in your industry that technology could address?',
                'How do competitors in your space leverage technology?'
            ]
        },
        nextSteps: [
            'Send meeting summary and key findings within 24 hours',
            'Prepare initial assessment based on discovery insights',
            'Schedule follow-up meeting to present preliminary recommendations',
            'Share relevant case studies from similar engagements'
        ]
    },
    'Proposal Review': {
        objective: 'Walk the client through our proposed engagement, address concerns, and secure buy-in for moving forward.',
        agenda: [
            { item: 'Recap of discovery findings', time: '5 min' },
            { item: 'Proposal walkthrough — scope and approach', time: '15 min' },
            { item: 'Timeline and milestones review', time: '10 min' },
            { item: 'Investment and ROI discussion', time: '10 min' },
            { item: 'Questions, concerns, and next steps', time: '10 min' }
        ],
        questions: {
            general: [
                'Does the proposed scope align with your expectations?',
                'Are there any areas of the proposal you would like us to adjust?',
                'What is your internal approval process and timeline?',
                'Who else needs to review this proposal before a decision?',
                'Are there budget constraints we should be aware of?',
                'What is your preferred start date?'
            ]
        },
        nextSteps: [
            'Send revised proposal incorporating client feedback (if any)',
            'Provide additional references or case studies as requested',
            'Schedule kick-off meeting pending approval',
            'Send SOW and contract for review'
        ]
    },
    'Progress Update': {
        objective: 'Review engagement progress, address blockers, and ensure alignment on upcoming milestones.',
        agenda: [
            { item: 'Progress summary since last check-in', time: '10 min' },
            { item: 'Key accomplishments and deliverables', time: '10 min' },
            { item: 'Blockers, risks, and mitigation', time: '10 min' },
            { item: 'Upcoming milestones and priorities', time: '10 min' },
            { item: 'Action items and owner assignments', time: '5 min' }
        ],
        questions: {
            general: [
                'Are you satisfied with the progress and communication so far?',
                'Have any internal priorities shifted that we should account for?',
                'Are there any upcoming events or deadlines that could affect our timeline?',
                'Is there anything from our team you need more or less of?',
                'Are the right stakeholders engaged on your side?'
            ]
        },
        nextSteps: [
            'Distribute updated project status report',
            'Address any open blockers within 48 hours',
            'Update project plan with revised timelines if needed',
            'Schedule next progress check-in'
        ]
    },
    'Quarterly Review': {
        objective: 'Evaluate overall engagement performance, measure KPIs, and align on strategic direction for the next quarter.',
        agenda: [
            { item: 'Quarter performance overview and KPI review', time: '15 min' },
            { item: 'ROI analysis and value delivered', time: '10 min' },
            { item: 'Challenges and lessons learned', time: '10 min' },
            { item: 'Strategic priorities for next quarter', time: '10 min' },
            { item: 'Expansion opportunities and roadmap', time: '10 min' }
        ],
        questions: {
            general: [
                'How would you rate the overall engagement performance this quarter?',
                'Which delivered outcomes have had the most business impact?',
                'What areas need more focus or a different approach going forward?',
                'Have your strategic priorities changed for the coming quarter?',
                'Are there additional teams or departments that could benefit from our services?',
                'What would make this partnership even more valuable to you?'
            ]
        },
        nextSteps: [
            'Deliver comprehensive quarterly report with KPI dashboard',
            'Submit updated strategic plan for next quarter',
            'Propose scope adjustments based on quarterly learnings',
            'Schedule next quarterly review'
        ]
    },
    'Upsell Conversation': {
        objective: 'Identify and propose additional services that address unmet needs or new opportunities surfaced during the engagement.',
        agenda: [
            { item: 'Engagement wins and value recap', time: '10 min' },
            { item: 'Newly identified gaps and opportunities', time: '10 min' },
            { item: 'Additional service recommendations', time: '15 min' },
            { item: 'Investment and expected outcomes', time: '10 min' },
            { item: 'Discussion and next steps', time: '5 min' }
        ],
        questions: {
            general: [
                'What new challenges have emerged since we started working together?',
                'Are there areas of the business that feel under-supported right now?',
                'How has your team responded to the changes we have implemented so far?',
                'What would the ideal next phase of this engagement look like to you?',
                'Are there upcoming initiatives where you could use additional support?',
                'What budget flexibility exists for expanding our engagement?'
            ]
        },
        nextSteps: [
            'Prepare detailed proposal for recommended additional services',
            'Provide ROI projections for expanded engagement',
            'Set up meeting with additional stakeholders if needed',
            'Draft expanded SOW for review'
        ]
    }
};

function generateMeetingPrep() {
    var clientName = document.getElementById('meetClientName').value.trim();
    var meetingType = document.getElementById('meetType').value;
    var industry = document.getElementById('meetIndustry').value;
    var painPoints = document.getElementById('meetPainPoints').value.trim();
    var prevNotes = document.getElementById('meetPrevNotes').value.trim();
    var bizOps = parseFloat(document.getElementById('meetBizOps').value);
    var tech = parseFloat(document.getElementById('meetTech').value);
    var readiness = parseFloat(document.getElementById('meetReadiness').value);

    if (!clientName) {
        document.getElementById('meetingPrepResult').innerHTML = '<p class="error">Please enter a client name.</p>';
        return;
    }
    if (!meetingType) {
        document.getElementById('meetingPrepResult').innerHTML = '<p class="error">Please select a meeting type.</p>';
        return;
    }
    if (!industry) {
        document.getElementById('meetingPrepResult').innerHTML = '<p class="error">Please select an industry.</p>';
        return;
    }
    if (isNaN(bizOps) || isNaN(tech) || isNaN(readiness)) {
        document.getElementById('meetingPrepResult').innerHTML = '<p class="error">Please enter all three client scores.</p>';
        return;
    }

    var template = meetingTemplates[meetingType];
    if (!template) {
        document.getElementById('meetingPrepResult').innerHTML = '<p class="error">Invalid meeting type.</p>';
        return;
    }

    var html = '<h3>Meeting Prep: ' + meetingType + ' with ' + clientName + '</h3>';
    html += '<p style="color:#555;">Industry: ' + industry + '</p>';

    // 1. Meeting Objective
    html += '<h4 style="margin-top:16px;border-bottom:2px solid #40E0D0;padding-bottom:4px;">1. Meeting Objective</h4>';
    html += '<p>' + template.objective + '</p>';

    // 2. Agenda
    html += '<h4 style="margin-top:16px;border-bottom:2px solid #40E0D0;padding-bottom:4px;">2. Agenda</h4>';
    html += '<div class="result-grid">';
    for (var i = 0; i < template.agenda.length; i++) {
        var agendaItem = template.agenda[i];
        html += '<div class="result-item"><span class="result-label">' + agendaItem.item + '</span><span class="result-value">' + agendaItem.time + '</span></div>';
    }
    html += '</div>';

    // 3. Key Talking Points
    html += '<h4 style="margin-top:16px;border-bottom:2px solid #40E0D0;padding-bottom:4px;">3. Key Talking Points</h4>';
    html += '<ul style="margin:4px 0 8px 20px;padding:0;">';

    if (painPoints) {
        var points = painPoints.split(/[\n,;]+/).filter(function(p) { return p.trim(); });
        for (var p = 0; p < points.length; p++) {
            html += '<li>Address pain point: <strong>' + points[p].trim() + '</strong></li>';
        }
    }

    if (bizOps < 3) {
        html += '<li style="color:#dc3545;">Business Operations score is low (' + bizOps + '/5) — emphasize process improvement, risk management, and operational efficiency capabilities</li>';
    }
    if (tech < 3) {
        html += '<li style="color:#dc3545;">Technology score is low (' + tech + '/5) — highlight infrastructure modernization, cloud solutions, and cybersecurity offerings</li>';
    }
    if (readiness < 3) {
        html += '<li style="color:#dc3545;">Digital Readiness is low (' + readiness + '/5) — discuss digital transformation roadmap and change management support</li>';
    }
    if (bizOps >= 3 && tech >= 3 && readiness >= 3) {
        html += '<li style="color:#28a745;">Client scores are generally strong — focus on optimization and strategic growth opportunities</li>';
    }

    if (prevNotes) {
        html += '<li>Reference previous engagement: ' + prevNotes.substring(0, 200) + (prevNotes.length > 200 ? '...' : '') + '</li>';
    }
    html += '</ul>';

    // 4. Questions to Ask
    html += '<h4 style="margin-top:16px;border-bottom:2px solid #40E0D0;padding-bottom:4px;">4. Questions to Ask</h4>';
    var questions = template.questions.general.slice();
    var industryQuestions = template.questions[industry];
    if (industryQuestions) {
        questions = questions.concat(industryQuestions);
    }
    // Limit to 7
    if (questions.length > 7) questions = questions.slice(0, 7);
    html += '<ol style="margin:4px 0 8px 20px;padding:0;">';
    for (var q = 0; q < questions.length; q++) {
        html += '<li>' + questions[q] + '</li>';
    }
    html += '</ol>';

    // 5. Risk Areas to Highlight
    html += '<h4 style="margin-top:16px;border-bottom:2px solid #40E0D0;padding-bottom:4px;">5. Risk Areas to Highlight</h4>';
    var risks = [];
    if (bizOps < 2) {
        risks.push({ area: 'Business Operations', level: 'Critical', detail: 'Score of ' + bizOps + '/5 indicates significant operational gaps that could impact business continuity.' });
    } else if (bizOps < 3) {
        risks.push({ area: 'Business Operations', level: 'Moderate', detail: 'Score of ' + bizOps + '/5 suggests room for improvement in processes and risk management.' });
    }
    if (tech < 2) {
        risks.push({ area: 'Technology', level: 'Critical', detail: 'Score of ' + tech + '/5 indicates serious technology deficiencies that pose security and efficiency risks.' });
    } else if (tech < 3) {
        risks.push({ area: 'Technology', level: 'Moderate', detail: 'Score of ' + tech + '/5 suggests technology infrastructure needs upgrading.' });
    }
    if (readiness < 2) {
        risks.push({ area: 'Digital Readiness', level: 'Critical', detail: 'Score of ' + readiness + '/5 indicates the organization is unprepared for digital demands.' });
    } else if (readiness < 3) {
        risks.push({ area: 'Digital Readiness', level: 'Moderate', detail: 'Score of ' + readiness + '/5 suggests the organization needs a structured digital adoption plan.' });
    }

    if (risks.length === 0) {
        html += '<p style="color:#28a745;">No critical risk areas identified based on current scores. Focus discussion on maintaining and optimizing current strengths.</p>';
    } else {
        html += '<div class="result-grid">';
        for (var r = 0; r < risks.length; r++) {
            var riskColor = risks[r].level === 'Critical' ? '#dc3545' : '#ffc107';
            html += '<div class="result-item" style="border-left-color:' + riskColor + ';"><span class="result-label"><strong>' + risks[r].area + '</strong> (' + risks[r].level + ')</span><span class="result-value" style="font-weight:normal;font-size:0.9em;max-width:60%;">' + risks[r].detail + '</span></div>';
        }
        html += '</div>';
    }

    // 6. Upsell Opportunities
    html += '<h4 style="margin-top:16px;border-bottom:2px solid #40E0D0;padding-bottom:4px;">6. Upsell Opportunities</h4>';
    var upsells = [];
    if (tech < 3) {
        upsells.push({ service: 'Digital Foundation Package', reason: 'Low technology score (' + tech + '/5) presents an opportunity for infrastructure modernization and cloud migration services.' });
    }
    if (bizOps < 3) {
        upsells.push({ service: 'Operational Excellence Package', reason: 'Below-threshold operations score (' + bizOps + '/5) opens the door for process automation and financial optimization.' });
    }
    if (readiness < 3) {
        upsells.push({ service: 'Digital Transformation Roadmap', reason: 'Low readiness score (' + readiness + '/5) indicates need for a structured digital adoption initiative.' });
    }
    if (bizOps >= 3 && tech >= 3 && readiness >= 3) {
        upsells.push({ service: 'Strategic Advisory Retainer', reason: 'Strong scores across the board make this client a great fit for ongoing strategic guidance and KPI optimization.' });
    }

    if (upsells.length === 0) {
        html += '<p>No immediate upsell opportunities identified. Focus on delivering current engagement value.</p>';
    } else {
        html += '<ul style="margin:4px 0 8px 20px;padding:0;">';
        for (var u = 0; u < upsells.length; u++) {
            html += '<li><strong>' + upsells[u].service + ':</strong> ' + upsells[u].reason + '</li>';
        }
        html += '</ul>';
    }

    // 7. Next Steps Template
    html += '<h4 style="margin-top:16px;border-bottom:2px solid #40E0D0;padding-bottom:4px;">7. Next Steps</h4>';
    html += '<ol style="margin:4px 0 8px 20px;padding:0;">';
    for (var n = 0; n < template.nextSteps.length; n++) {
        html += '<li>' + template.nextSteps[n] + '</li>';
    }
    html += '</ol>';

    // Action buttons
    html += '<div style="margin-top:16px;">';
    html += '<button class="share-btn" onclick="copyMeetingPrep()">Copy Prep</button>';
    html += '<button class="export-btn" onclick="window.print()">Export PDF</button>';
    html += '</div>';

    document.getElementById('meetingPrepResult').innerHTML = html;
}

function copyMeetingPrep() {
    var resultDiv = document.getElementById('meetingPrepResult');
    var text = resultDiv.innerText || resultDiv.textContent;
    navigator.clipboard.writeText(text).then(function() {
        var btn = resultDiv.querySelector('.share-btn');
        if (btn) {
            var orig = btn.textContent;
            btn.textContent = 'Copied!';
            btn.disabled = true;
            setTimeout(function() {
                btn.textContent = orig;
                btn.disabled = false;
            }, 1500);
        }
    }).catch(function() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
    });
}

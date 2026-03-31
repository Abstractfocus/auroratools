// Email Template Engine
// localStorage key: 'aurora-email-templates'

var emailTemplates = {
    initial_outreach: {
        subject: 'Introducing Aurora Technologies - Empowering {{company}}',
        body: 'Dear {{name}},\n\nI hope this message finds you well. My name is {{sender}}, and I am reaching out to introduce Aurora Technologies and the services we offer to organizations like {{company}}.\n\n{{industry_line}}At Aurora, we specialize in helping businesses streamline their operations, modernize their technology stack, and accelerate digital transformation. We have worked with companies across a range of sectors and would love to explore how we can support {{company}} in achieving its strategic goals.\n\nSome of our core offerings include:\n- Comprehensive technology assessments\n- Digital readiness evaluations\n- Custom transformation roadmaps\n- Ongoing advisory and implementation support\n\n{{notes_line}}I would welcome the opportunity to schedule a brief introductory call at your convenience to learn more about your priorities and discuss how Aurora can add value.\n\nLooking forward to connecting.\n\nBest regards,\n{{sender}}'
    },
    post_assessment: {
        subject: 'Your Assessment Results Are Ready - {{company}}',
        body: 'Dear {{name}},\n\nThank you for completing the assessment with Aurora Technologies. We have analyzed the results for {{company}} and are pleased to share our findings.\n\n{{scores_section}}{{strengths_section}}{{weaknesses_section}}{{industry_line}}Based on these results, we recommend scheduling a follow-up consultation to discuss targeted strategies for improvement and outline a clear path forward.\n\n{{notes_line}}Please let me know a time that works for you, and we will be happy to walk through the details.\n\nBest regards,\n{{sender}}'
    },
    proposal_followup: {
        subject: 'Following Up on Our Proposal - {{company}}',
        body: 'Dear {{name}},\n\nI wanted to follow up on the proposal we recently submitted for {{company}}.{{proposal_line}}\n\n{{industry_line}}We are confident that the solutions outlined in our proposal will deliver meaningful results for your organization, and we are happy to answer any questions or make adjustments to better align with your needs.\n\nIf it would be helpful, we can arrange a call to review the proposal in detail and address any concerns your team may have.\n\n{{notes_line}}We look forward to hearing from you.\n\nBest regards,\n{{sender}}'
    },
    quarterly_checkin: {
        subject: 'Quarterly Check-in - {{company}} & Aurora Technologies',
        body: 'Dear {{name}},\n\nI hope this quarter has been productive for {{company}}. As part of our ongoing partnership, I wanted to schedule our quarterly review to discuss progress, evaluate results, and align on priorities for the upcoming quarter.\n\n{{scores_section}}{{strengths_section}}{{weaknesses_section}}{{industry_line}}Key items for our review:\n- Progress against established objectives\n- Assessment of current metrics and KPIs\n- Identification of new opportunities or emerging challenges\n- Planning and goal-setting for the next quarter\n\n{{notes_line}}Please let me know your availability, and I will send a calendar invitation.\n\nBest regards,\n{{sender}}'
    },
    upsell: {
        subject: 'New Opportunities for {{company}} with Aurora Technologies',
        body: 'Dear {{name}},\n\nGiven the progress {{company}} has made, I wanted to share some additional services that could further accelerate your growth and strengthen your competitive position.\n\n{{scores_section}}{{weaknesses_section}}{{industry_line}}Based on our work together, we believe the following services would be particularly valuable:\n- Advanced analytics and data-driven decision-making\n- Cybersecurity assessment and hardening\n- Process automation and optimization\n- Custom training programs for your team\n\n{{notes_line}}I would be happy to prepare a tailored proposal outlining how these services can benefit {{company}}. Shall we schedule a call to discuss?\n\nBest regards,\n{{sender}}'
    },
    thank_you: {
        subject: 'Thank You for Choosing Aurora Technologies, {{name}}!',
        body: 'Dear {{name}},\n\nOn behalf of the entire Aurora Technologies team, I want to extend our sincere thanks for choosing us as your partner. We are thrilled to be working with {{company}} and are committed to delivering exceptional results.\n\n{{proposal_line}}{{industry_line}}Here is what you can expect in the coming weeks:\n- A dedicated project manager will be assigned to your account\n- We will schedule a kickoff meeting to align on timelines and deliverables\n- You will receive access to our client portal for real-time project tracking\n\n{{notes_line}}If you have any questions or need anything in the meantime, please do not hesitate to reach out.\n\nWelcome aboard!\n\nWarm regards,\n{{sender}}'
    }
};

var emailIndustryLanguage = {
    'Technology': 'As a technology-focused organization, we understand the fast-paced nature of your industry and the importance of staying ahead of the curve with scalable, future-proof solutions.\n\n',
    'Healthcare': 'In the healthcare sector, we recognize the critical importance of compliance, patient data security, and operational efficiency. Our solutions are designed with these priorities in mind.\n\n',
    'Finance': 'In the financial services industry, regulatory compliance, data security, and operational resilience are paramount. Aurora brings deep expertise in addressing these challenges.\n\n',
    'Retail': 'In today\'s competitive retail landscape, customer experience and operational agility are key differentiators. We tailor our approach to help retailers thrive in an omnichannel world.\n\n',
    'Manufacturing': 'In the manufacturing sector, process optimization, supply chain visibility, and technology integration are essential for maintaining a competitive edge. Aurora is well positioned to help.\n\n',
    'Professional Services': 'For professional services firms, efficiency, client satisfaction, and talent enablement are critical priorities. Our solutions are designed to help you deliver more value to your clients.\n\n',
    'Education': 'In the education sector, technology plays an increasingly vital role in student outcomes and institutional efficiency. We are passionate about supporting educational organizations in their digital journey.\n\n',
    'Real Estate': 'In real estate, technology adoption can streamline operations, improve tenant experiences, and provide better market insights. Aurora helps organizations in your space modernize effectively.\n\n'
};

var lastGeneratedEmail = null;

function getIndustryLine(industry) {
    if (industry && emailIndustryLanguage[industry]) {
        return emailIndustryLanguage[industry];
    }
    return '';
}

function getScoresSection(bizOps, tech, readiness) {
    if (!bizOps && !tech && !readiness) return '';
    var lines = 'Assessment Summary:\n';
    if (bizOps) lines += '  - Business Operations: ' + bizOps + '/5\n';
    if (tech) lines += '  - Technology: ' + tech + '/5\n';
    if (readiness) lines += '  - Readiness: ' + readiness + '/5\n';
    lines += '\n';
    return lines;
}

function getStrengthsSection(bizOps, tech, readiness) {
    var scores = [];
    if (bizOps) scores.push({ name: 'Business Operations', val: parseFloat(bizOps) });
    if (tech) scores.push({ name: 'Technology', val: parseFloat(tech) });
    if (readiness) scores.push({ name: 'Readiness', val: parseFloat(readiness) });
    var strengths = scores.filter(function (s) { return s.val >= 4; });
    if (strengths.length === 0) return '';
    var names = strengths.map(function (s) { return s.name + ' (' + s.val + '/5)'; });
    return 'Strengths: Your ' + names.join(' and ') + ' score' + (strengths.length === 1 ? ' reflects' : ' reflect') + ' a strong foundation in ' + (strengths.length === 1 ? 'this area' : 'these areas') + '. This is a great asset as you move forward.\n\n';
}

function getWeaknessesSection(bizOps, tech, readiness) {
    var scores = [];
    if (bizOps) scores.push({ name: 'Business Operations', val: parseFloat(bizOps) });
    if (tech) scores.push({ name: 'Technology', val: parseFloat(tech) });
    if (readiness) scores.push({ name: 'Readiness', val: parseFloat(readiness) });
    var weaknesses = scores.filter(function (s) { return s.val <= 2; });
    if (weaknesses.length === 0) return '';
    var names = weaknesses.map(function (s) { return s.name + ' (' + s.val + '/5)'; });
    return 'Areas for Improvement: Your ' + names.join(' and ') + ' score' + (weaknesses.length === 1 ? ' indicates' : ' indicate') + ' an opportunity for targeted improvement. We have specific strategies to help strengthen ' + (weaknesses.length === 1 ? 'this area' : 'these areas') + ' quickly.\n\n';
}

function getProposalLine(amount) {
    if (!amount) return '';
    var formatted = '$' + Number(amount).toLocaleString();
    return ' The proposal is valued at ' + formatted + ', and we believe it represents strong value for the scope of work outlined.';
}

function getNotesLine(notes) {
    if (!notes || !notes.trim()) return '';
    return 'Additional Notes: ' + notes.trim() + '\n\n';
}

function fillTemplate(templateObj, data) {
    var subject = templateObj.subject;
    var body = templateObj.body;

    subject = subject.replace(/\{\{name\}\}/g, data.name);
    subject = subject.replace(/\{\{company\}\}/g, data.company);
    subject = subject.replace(/\{\{sender\}\}/g, data.sender);

    body = body.replace(/\{\{name\}\}/g, data.name);
    body = body.replace(/\{\{company\}\}/g, data.company);
    body = body.replace(/\{\{sender\}\}/g, data.sender);
    body = body.replace(/\{\{industry_line\}\}/g, getIndustryLine(data.industry));
    body = body.replace(/\{\{scores_section\}\}/g, getScoresSection(data.bizOps, data.tech, data.readiness));
    body = body.replace(/\{\{strengths_section\}\}/g, getStrengthsSection(data.bizOps, data.tech, data.readiness));
    body = body.replace(/\{\{weaknesses_section\}\}/g, getWeaknessesSection(data.bizOps, data.tech, data.readiness));
    body = body.replace(/\{\{proposal_line\}\}/g, getProposalLine(data.proposalAmount));
    body = body.replace(/\{\{notes_line\}\}/g, getNotesLine(data.notes));

    return { subject: subject, body: body };
}

function generateEmail() {
    var name = document.getElementById('emailRecipientName').value.trim();
    var company = document.getElementById('emailCompany').value.trim();
    var industry = document.getElementById('emailIndustry').value;
    var sender = document.getElementById('emailSenderName').value.trim() || 'Aurora Technologies Team';
    var bizOps = document.getElementById('emailScoreBizOps').value;
    var tech = document.getElementById('emailScoreTech').value;
    var readiness = document.getElementById('emailScoreReadiness').value;
    var proposalAmount = document.getElementById('emailProposalAmount').value;
    var notes = document.getElementById('emailCustomNotes').value;

    if (!name) {
        alert('Recipient name is required.');
        return;
    }
    if (!company) {
        alert('Company is required.');
        return;
    }

    var templateKey = document.getElementById('emailTemplate').value;
    var customKey = document.getElementById('emailCustomTemplate').value;

    var templateObj;
    if (customKey) {
        var customs = getCustomTemplates();
        templateObj = customs[customKey];
        if (!templateObj) {
            alert('Selected custom template not found.');
            return;
        }
    } else {
        templateObj = emailTemplates[templateKey];
    }

    var data = {
        name: name,
        company: company,
        industry: industry,
        sender: sender,
        bizOps: bizOps,
        tech: tech,
        readiness: readiness,
        proposalAmount: proposalAmount,
        notes: notes
    };

    var result = fillTemplate(templateObj, data);
    lastGeneratedEmail = result;

    var html = '<div style="background:white;border:1px solid #ddd;border-radius:8px;padding:20px;margin-top:20px;">';
    html += '<div style="border-bottom:1px solid #eee;padding-bottom:12px;margin-bottom:12px;">';
    html += '<p style="margin:4px 0;"><strong>Subject:</strong> ' + escapeHtml(result.subject) + '</p>';
    html += '<p style="margin:4px 0;"><strong>To:</strong> ' + escapeHtml(name) + ' (' + escapeHtml(company) + ')</p>';
    html += '<p style="margin:4px 0;"><strong>From:</strong> ' + escapeHtml(sender) + '</p>';
    html += '</div>';
    html += '<div style="white-space:pre-wrap;font-family:inherit;line-height:1.6;">' + escapeHtml(result.body) + '</div>';
    html += '</div>';

    document.getElementById('emailResult').innerHTML = html;
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

function copyEmail() {
    if (!lastGeneratedEmail) {
        alert('Please generate an email first.');
        return;
    }
    var text = 'Subject: ' + lastGeneratedEmail.subject + '\n\n' + lastGeneratedEmail.body;
    navigator.clipboard.writeText(text).then(function () {
        alert('Email copied to clipboard.');
    }).catch(function () {
        fallbackCopy(text);
    });
}

function copySubject() {
    if (!lastGeneratedEmail) {
        alert('Please generate an email first.');
        return;
    }
    navigator.clipboard.writeText(lastGeneratedEmail.subject).then(function () {
        alert('Subject line copied to clipboard.');
    }).catch(function () {
        fallbackCopy(lastGeneratedEmail.subject);
    });
}

function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        alert('Copied to clipboard.');
    } catch (e) {
        alert('Failed to copy. Please copy manually.');
    }
    document.body.removeChild(ta);
}

function getCustomTemplates() {
    try {
        return JSON.parse(localStorage.getItem('aurora-email-templates')) || {};
    } catch (e) {
        return {};
    }
}

function saveCustomTemplates(templates) {
    localStorage.setItem('aurora-email-templates', JSON.stringify(templates));
}

function saveCustomTemplate() {
    if (!lastGeneratedEmail) {
        alert('Please generate an email first, then save it as a template.');
        return;
    }
    var templateName = prompt('Enter a name for this custom template:');
    if (!templateName || !templateName.trim()) return;
    templateName = templateName.trim();

    var customs = getCustomTemplates();
    customs[templateName] = {
        subject: lastGeneratedEmail.subject,
        body: lastGeneratedEmail.body
    };
    saveCustomTemplates(customs);
    loadTemplates();
    alert('Template "' + templateName + '" saved.');
}

function loadTemplates() {
    var select = document.getElementById('emailCustomTemplate');
    if (!select) return;
    var customs = getCustomTemplates();
    var keys = Object.keys(customs);

    // Clear existing options except the first
    select.innerHTML = '<option value="">-- None --</option>';
    keys.forEach(function (key) {
        var opt = document.createElement('option');
        opt.value = key;
        opt.textContent = key;
        select.appendChild(opt);
    });
}

// Load custom templates on startup
if (document.getElementById('emailCustomTemplate')) {
    loadTemplates();
}

/**
 * prpitch.js - PR Pitch Generator for Aurora Technologies Tools
 */

(function () {
    var PITCH_TEMPLATES = {
        'Product Launch': {
            opening: function (c) {
                return c.company + ' today announced the launch of ' + c.headline + ', a groundbreaking solution designed to transform the way organizations approach their most critical challenges. The announcement was made at ' + c.company + ' headquarters.';
            },
            body: function (c) {
                return '<p>' + c.details + '</p>' +
                    '<p>The new offering represents a significant advancement in the industry, combining cutting-edge technology with intuitive design to deliver measurable results for customers. Early adopters have already reported significant improvements in efficiency and performance.</p>' +
                    '<p>' + c.company + ' developed this solution in response to growing market demand for innovative tools that address evolving business needs. The product is available immediately and includes comprehensive onboarding and support.</p>';
            },
            emailHook: 'I\'m reaching out because we just launched something that could be a great fit for your coverage area.'
        },
        'Funding Announcement': {
            opening: function (c) {
                return c.company + ' today announced a major funding milestone, signaling strong investor confidence in the company\'s vision and growth trajectory. ' + c.headline + '.';
            },
            body: function (c) {
                return '<p>' + c.details + '</p>' +
                    '<p>The funding will be used to accelerate product development, expand the team, and scale operations to meet growing customer demand. This investment round underscores the market opportunity and the strength of ' + c.company + '\'s business model.</p>' +
                    '<p>With this new capital, ' + c.company + ' is well-positioned to solidify its leadership position and deliver even greater value to its customers and partners.</p>';
            },
            emailHook: 'I wanted to share some exciting funding news that highlights the momentum in our space.'
        },
        'Partnership': {
            opening: function (c) {
                return c.company + ' today announced a strategic partnership that will expand capabilities and create new opportunities for customers. ' + c.headline + '.';
            },
            body: function (c) {
                return '<p>' + c.details + '</p>' +
                    '<p>This collaboration brings together complementary strengths, enabling both organizations to deliver more comprehensive solutions to their respective markets. The partnership is expected to drive innovation and accelerate growth for both parties.</p>' +
                    '<p>Customers and partners can expect to see the first results of this collaboration in the coming months as integrated offerings and joint initiatives are rolled out.</p>';
            },
            emailHook: 'We just announced a partnership that I think would resonate with your readers.'
        },
        'Award/Recognition': {
            opening: function (c) {
                return c.company + ' has been recognized for excellence with a prestigious industry distinction. ' + c.headline + '.';
            },
            body: function (c) {
                return '<p>' + c.details + '</p>' +
                    '<p>This recognition reflects ' + c.company + '\'s ongoing commitment to innovation, quality, and customer success. The award highlights the team\'s dedication to pushing boundaries and delivering exceptional results.</p>' +
                    '<p>The recognition comes at a time of significant growth and momentum for ' + c.company + ', which continues to expand its impact across the industry.</p>';
            },
            emailHook: 'I\'m excited to share that we\'ve received some notable recognition I think your audience would appreciate.'
        },
        'Industry Report': {
            opening: function (c) {
                return c.company + ' today released a comprehensive industry report revealing key trends and insights shaping the market. ' + c.headline + '.';
            },
            body: function (c) {
                return '<p>' + c.details + '</p>' +
                    '<p>The report draws on extensive research and data analysis to provide actionable intelligence for business leaders and decision-makers. Key findings highlight emerging opportunities and challenges that will define the industry in the coming years.</p>' +
                    '<p>The full report is available for download and includes detailed methodology, data visualizations, and expert commentary from ' + c.company + '\'s leadership team.</p>';
            },
            emailHook: 'We\'ve just published an industry report with findings I think would make compelling content for your audience.'
        },
        'Executive Hire': {
            opening: function (c) {
                return c.company + ' today announced a key executive appointment to drive the next phase of the company\'s growth strategy. ' + c.headline + '.';
            },
            body: function (c) {
                return '<p>' + c.details + '</p>' +
                    '<p>The appointment underscores ' + c.company + '\'s commitment to attracting top-tier talent as the organization scales to meet increasing market demand. The new executive brings deep domain expertise and a proven track record of success.</p>' +
                    '<p>This strategic hire is expected to strengthen the leadership team and accelerate execution on key growth initiatives in the months ahead.</p>';
            },
            emailHook: 'We have an exciting leadership announcement that I believe would interest your readers.'
        },
        'Company Milestone': {
            opening: function (c) {
                return c.company + ' today celebrated a significant company milestone, marking a new chapter in the organization\'s growth story. ' + c.headline + '.';
            },
            body: function (c) {
                return '<p>' + c.details + '</p>' +
                    '<p>This milestone reflects the dedication of ' + c.company + '\'s team and the trust placed in the company by its customers and partners. It represents tangible progress toward the company\'s long-term vision and mission.</p>' +
                    '<p>Looking ahead, ' + c.company + ' plans to build on this momentum with continued investment in innovation, talent, and customer success.</p>';
            },
            emailHook: 'We\'ve hit a major milestone that I think tells a compelling story for your coverage.'
        },
        'Event': {
            opening: function (c) {
                return c.company + ' today announced an upcoming event bringing together industry leaders, innovators, and practitioners. ' + c.headline + '.';
            },
            body: function (c) {
                return '<p>' + c.details + '</p>' +
                    '<p>The event will feature keynote presentations, panel discussions, and networking opportunities designed to foster collaboration and knowledge sharing. Attendees will gain valuable insights into the latest trends and best practices.</p>' +
                    '<p>Registration is now open, and ' + c.company + ' invites media representatives to attend for coverage opportunities, interviews, and exclusive access to event highlights.</p>';
            },
            emailHook: 'We\'re hosting an event that I think would be of interest to your audience and offer great coverage opportunities.'
        }
    };

    var AUDIENCE_STYLES = {
        'Tech Media': { tone: 'technical and innovation-focused', cta: 'Would you be interested in a demo or technical deep-dive with our engineering team?' },
        'Business Press': { tone: 'business impact and market opportunity-focused', cta: 'I\'d love to set up an interview with our CEO to discuss the business implications.' },
        'Industry Trade': { tone: 'industry-specific and practitioner-focused', cta: 'Would you like to schedule a conversation with our domain experts for an in-depth perspective?' },
        'Local News': { tone: 'community impact and human interest-focused', cta: 'I\'d be happy to arrange a visit to our offices or connect you with local team members for a story.' },
        'General Consumer': { tone: 'accessible and benefit-focused', cta: 'Would you be interested in a product review or consumer-focused interview?' }
    };

    function getDateline() {
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var d = new Date();
        return 'SAN FRANCISCO, ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    }

    window.generatePitch = function () {
        var company = document.getElementById('prCompany').value.trim() || 'Aurora Technologies';
        var pitchType = document.getElementById('prPitchType').value;
        var headline = document.getElementById('prHeadline').value.trim();
        var details = document.getElementById('prDetails').value.trim();
        var audience = document.getElementById('prAudience').value;
        var spokesName = document.getElementById('prSpokesName').value.trim();
        var spokesTitle = document.getElementById('prSpokesTitle').value.trim();
        var quote = document.getElementById('prQuote').value.trim();
        var boilerplate = document.getElementById('prBoilerplate').value.trim();
        var contactName = document.getElementById('prContactName').value.trim();
        var contactEmail = document.getElementById('prContactEmail').value.trim();
        var contactPhone = document.getElementById('prContactPhone').value.trim();

        if (!headline || !details || !pitchType || !audience) {
            alert('Please fill in the headline, key details, pitch type, and target audience.');
            return;
        }

        var template = PITCH_TEMPLATES[pitchType];
        var audienceStyle = AUDIENCE_STYLES[audience];
        var ctx = { company: company, headline: headline, details: details };

        // Build press release
        var pr = '';
        pr += '<div class="press-header">';
        pr += '<p style="text-align:center;font-weight:bold;letter-spacing:2px;margin-bottom:8px;">FOR IMMEDIATE RELEASE</p>';
        pr += '</div>';
        pr += '<h2 style="text-align:center;margin:16px 0 8px;">' + escapeHtml(headline) + '</h2>';
        pr += '<p style="text-align:center;color:#666;margin-bottom:20px;font-style:italic;">' + getDateline() + '</p>';
        pr += '<p>' + template.opening(ctx) + '</p>';
        pr += template.body(ctx);

        if (quote && spokesName) {
            pr += '<blockquote style="border-left:3px solid #40E0D0;margin:20px 0;padding:12px 20px;font-style:italic;background:#f8f9fa;border-radius:4px;">';
            pr += '<p>"' + escapeHtml(quote) + '"</p>';
            pr += '<p style="font-style:normal;font-weight:bold;margin-top:8px;">-- ' + escapeHtml(spokesName);
            if (spokesTitle) pr += ', ' + escapeHtml(spokesTitle);
            pr += ', ' + escapeHtml(company) + '</p>';
            pr += '</blockquote>';
        }

        if (boilerplate) {
            pr += '<h3 style="margin-top:24px;">About ' + escapeHtml(company) + '</h3>';
            pr += '<p>' + escapeHtml(boilerplate) + '</p>';
        }

        if (contactName || contactEmail || contactPhone) {
            pr += '<div style="margin-top:24px;padding-top:16px;border-top:1px solid #ddd;">';
            pr += '<h4 style="margin-bottom:8px;">Media Contact</h4>';
            if (contactName) pr += '<p>' + escapeHtml(contactName) + '</p>';
            if (contactEmail) pr += '<p>Email: ' + escapeHtml(contactEmail) + '</p>';
            if (contactPhone) pr += '<p>Phone: ' + escapeHtml(contactPhone) + '</p>';
            pr += '</div>';
        }

        pr += '<p style="text-align:center;margin-top:24px;font-weight:bold;">###</p>';

        // Build email pitch
        var email = '';
        var subjectLine = '[Pitch] ' + headline + ' - ' + company;
        email += '<p><strong>Subject:</strong> ' + escapeHtml(subjectLine) + '</p>';
        email += '<hr style="margin:12px 0;">';
        email += '<p>Hi [Editor Name],</p>';
        email += '<p>' + template.emailHook + ' ' + escapeHtml(company) + ' has just announced: <strong>' + escapeHtml(headline) + '</strong>. Given your ' + audienceStyle.tone + ' coverage, I thought this would be especially relevant to your audience.</p>';
        email += '<p>Here\'s the key news: ' + escapeHtml(details.substring(0, 300)) + (details.length > 300 ? '...' : '') + '</p>';
        email += '<p>' + audienceStyle.cta + ' I can also provide the full press release, high-resolution images, and any additional materials you might need.</p>';
        email += '<p>Best regards,<br>';
        if (contactName) email += escapeHtml(contactName) + '<br>';
        if (contactEmail) email += escapeHtml(contactEmail) + '<br>';
        if (contactPhone) email += escapeHtml(contactPhone);
        email += '</p>';

        // Store for copy functions
        window._prPressRelease = pr;
        window._prEmailPitch = email;
        window._prSubjectLine = subjectLine;

        // Render
        var resultDiv = document.getElementById('prPitchResult');
        resultDiv.innerHTML = '<div class="pitch-tabs">' +
            '<button class="pitch-tab active" onclick="togglePitchView(\'release\')">Press Release</button>' +
            '<button class="pitch-tab" onclick="togglePitchView(\'email\')">Email Pitch</button>' +
            '</div>' +
            '<div id="prReleaseView" class="press-release">' + pr + '</div>' +
            '<div id="prEmailView" class="press-release" style="display:none;">' + email + '</div>' +
            '<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button onclick="copyPressRelease()">Copy Press Release</button>' +
            '<button onclick="copyEmailPitch()">Copy Email Pitch</button>' +
            '<button onclick="window.print()" style="background-color:#0A0A2A;">Export PDF</button>' +
            '</div>';
    };

    window.togglePitchView = function (view) {
        var releaseView = document.getElementById('prReleaseView');
        var emailView = document.getElementById('prEmailView');
        var tabs = document.querySelectorAll('#prPitchResult .pitch-tab');

        if (view === 'release') {
            releaseView.style.display = 'block';
            emailView.style.display = 'none';
            tabs[0].classList.add('active');
            tabs[1].classList.remove('active');
        } else {
            releaseView.style.display = 'none';
            emailView.style.display = 'block';
            tabs[0].classList.remove('active');
            tabs[1].classList.add('active');
        }
    };

    window.copyPressRelease = function () {
        if (!window._prPressRelease) return;
        var temp = document.createElement('div');
        temp.innerHTML = window._prPressRelease;
        var text = temp.textContent || temp.innerText || '';
        navigator.clipboard.writeText(text).then(function () {
            alert('Press release copied to clipboard!');
        });
    };

    window.copyEmailPitch = function () {
        if (!window._prEmailPitch) return;
        var temp = document.createElement('div');
        temp.innerHTML = window._prEmailPitch;
        var text = temp.textContent || temp.innerText || '';
        navigator.clipboard.writeText(text).then(function () {
            alert('Email pitch copied to clipboard!');
        });
    };

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
})();

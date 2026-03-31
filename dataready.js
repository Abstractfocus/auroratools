/**
 * dataready.js - Data Readiness Assessment
 * Evaluate if a client's data infrastructure is ready for AI/ML.
 */

var dataReadinessCategories = [
    {
        name: 'Data Quality',
        items: [
            'Data accuracy and completeness',
            'Standardized formats across systems',
            'Deduplication practices in place'
        ]
    },
    {
        name: 'Data Infrastructure',
        items: [
            'Centralized data warehouse',
            'API access to data sources',
            'Real-time data pipelines'
        ]
    },
    {
        name: 'Data Governance',
        items: [
            'Data ownership clearly defined',
            'Access controls and security',
            'Data documentation and catalog'
        ]
    },
    {
        name: 'Analytics Maturity',
        items: [
            'BI/reporting tools in use',
            'Team with analytics skills',
            'Data-driven decision culture'
        ]
    },
    {
        name: 'ML Readiness',
        items: [
            'Labeled training data available',
            'Feature engineering capability',
            'Model deployment infrastructure'
        ]
    },
    {
        name: 'Organizational Readiness',
        items: [
            'Executive sponsorship for AI',
            'AI/ML budget allocated',
            'Change management plan'
        ]
    }
];

function createDataReadinessForm() {
    var container = document.getElementById('dataReadinessForm');
    if (!container) return;
    var html = '';
    dataReadinessCategories.forEach(function(cat, ci) {
        html += '<div style="margin-bottom:20px;padding:16px;border:1px solid #ddd;border-radius:8px;">';
        html += '<h4 style="margin-top:0;">' + cat.name + '</h4>';
        cat.items.forEach(function(item, ii) {
            var id = 'dr_' + ci + '_' + ii;
            html += '<div class="input-group" style="margin-bottom:12px;">';
            html += '<label for="' + id + '">' + item + ' <span class="slider-value" id="' + id + '_val">(3/5)</span></label>';
            html += '<input type="range" min="1" max="5" value="3" id="' + id + '" oninput="document.getElementById(\'' + id + '_val\').textContent=\'(\'+this.value+\'/5)\'">';
            html += '<div style="display:flex;justify-content:space-between;font-size:0.75em;color:#888;"><span>1 - Not at all</span><span>5 - Fully mature</span></div>';
            html += '</div>';
        });
        html += '</div>';
    });
    container.innerHTML = html;
}

function assessDataReadiness() {
    var resultDiv = document.getElementById('dataReadinessResult');
    if (!resultDiv) return;

    var categoryScores = [];
    var allScores = [];

    dataReadinessCategories.forEach(function(cat, ci) {
        var scores = [];
        cat.items.forEach(function(item, ii) {
            var el = document.getElementById('dr_' + ci + '_' + ii);
            var val = el ? parseInt(el.value) : 3;
            scores.push(val);
            allScores.push(val);
        });
        var avg = scores.reduce(function(s, v) { return s + v; }, 0) / scores.length;
        categoryScores.push({ name: cat.name, score: Math.round(avg * 100) / 100, items: scores });
    });

    var overallScore = allScores.reduce(function(s, v) { return s + v; }, 0) / allScores.length;
    overallScore = Math.round(overallScore * 100) / 100;

    var readinessLevel, levelColor;
    if (overallScore >= 4) { readinessLevel = 'AI-Ready'; levelColor = '#28a745'; }
    else if (overallScore >= 3) { readinessLevel = 'Developing'; levelColor = '#ffc107'; }
    else if (overallScore >= 2) { readinessLevel = 'Foundation Building'; levelColor = '#fd7e14'; }
    else { readinessLevel = 'Getting Started'; levelColor = '#dc3545'; }

    var html = '<h3>Data Readiness Assessment Results</h3>';

    // Overall score
    html += '<div style="text-align:center;margin-bottom:20px;">';
    html += '<div style="font-size:2.5em;font-weight:bold;color:' + levelColor + ';">' + overallScore.toFixed(1) + ' / 5.0</div>';
    html += '<div class="ai-category-badge" style="background:' + levelColor + ';color:#fff;font-size:1.1em;padding:6px 18px;">' + readinessLevel + '</div>';
    html += '</div>';

    // Category bar chart
    var chartData = categoryScores.map(function(c) {
        var color = c.score >= 4 ? '#28a745' : c.score >= 3 ? '#ffc107' : c.score >= 2 ? '#fd7e14' : '#dc3545';
        return { label: c.name, value: c.score, maxValue: 5, displayValue: c.score.toFixed(1), color: color };
    });
    html += '<h4>Category Scores</h4>';
    html += createBarChart(chartData, { title: '', width: 480, barHeight: 30 });

    // Gap Analysis
    var gaps = categoryScores.filter(function(c) { return c.score < 3.0; });
    if (gaps.length > 0) {
        html += '<h4>Gap Analysis</h4>';
        var recommendations = {
            'Data Quality': 'Implement data validation rules, establish data quality metrics, and create automated data cleansing pipelines.',
            'Data Infrastructure': 'Invest in a centralized data warehouse or data lake, establish API-first architecture, and build ETL/ELT pipelines.',
            'Data Governance': 'Define data ownership roles, implement access control policies, and create a comprehensive data catalog.',
            'Analytics Maturity': 'Deploy BI tools (e.g., Tableau, Power BI), hire or train analytics talent, and foster data literacy across the organization.',
            'ML Readiness': 'Start labeling datasets, build feature stores, and establish MLOps infrastructure for model deployment.',
            'Organizational Readiness': 'Secure executive buy-in with AI business cases, allocate dedicated AI/ML budget, and develop change management frameworks.'
        };
        gaps.forEach(function(g) {
            html += '<div style="margin-bottom:12px;padding:12px;border-left:3px solid #dc3545;background:#fff5f5;border-radius:4px;">';
            html += '<strong>' + g.name + '</strong> <span style="color:#dc3545;">(' + g.score.toFixed(1) + '/5.0)</span>';
            html += '<p style="margin:6px 0 0;font-size:0.9em;color:#555;">' + (recommendations[g.name] || 'Focus on improving this area before advancing AI initiatives.') + '</p>';
            html += '</div>';
        });
    } else {
        html += '<p style="color:#28a745;font-weight:600;">No significant gaps detected. All categories score 3.0 or above.</p>';
    }

    // Roadmap
    html += '<h4>Recommended Roadmap</h4>';
    var phases = [
        { name: 'Phase 1: Foundations', desc: 'Data quality, governance basics, centralized storage', minLevel: 0, color: '#dc3545' },
        { name: 'Phase 2: Analytics', desc: 'BI tools, reporting dashboards, analytics team building', minLevel: 2, color: '#fd7e14' },
        { name: 'Phase 3: Machine Learning', desc: 'ML models, feature engineering, MLOps pipeline', minLevel: 3, color: '#ffc107' },
        { name: 'Phase 4: Advanced AI', desc: 'Deep learning, real-time AI, autonomous decision systems', minLevel: 4, color: '#28a745' }
    ];
    html += '<div class="readiness-roadmap">';
    phases.forEach(function(phase) {
        var isCurrent = overallScore >= phase.minLevel && overallScore < phase.minLevel + 1;
        var isComplete = overallScore >= phase.minLevel + 1;
        var cls = isCurrent ? 'roadmap-phase current' : isComplete ? 'roadmap-phase complete' : 'roadmap-phase upcoming';
        html += '<div class="' + cls + '" style="border-left-color:' + phase.color + ';">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
        html += '<strong>' + phase.name + '</strong>';
        if (isCurrent) html += '<span class="ai-category-badge" style="background:' + phase.color + ';color:#fff;font-size:0.8em;">Current Phase</span>';
        else if (isComplete) html += '<span style="color:#28a745;font-size:0.85em;">&#10003; Complete</span>';
        else html += '<span style="color:#888;font-size:0.85em;">Upcoming</span>';
        html += '</div>';
        html += '<p style="margin:6px 0 0;font-size:0.9em;color:#666;">' + phase.desc + '</p>';
        html += '</div>';
    });
    html += '</div>';

    // ============================================================
    // DETAILED ANALYSIS REPORT
    // ============================================================
    html += '<hr style="margin:30px 0;border:none;border-top:2px solid #0A0A2A;">';
    html += '<h3 style="color:#0A0A2A;">Detailed Analysis Report</h3>';
    html += '<p style="color:#666;">Comprehensive breakdown with findings, remedies, next steps, KPIs, and timelines for each category.</p>';

    var analysisData = {
        'Data Quality': {
            findings: {
                low: 'Data quality is critically low. Errors, duplicates, and inconsistencies are widespread. This blocks any meaningful analytics or AI initiative.',
                mid: 'Data quality is developing. Some standards exist but enforcement is inconsistent. Manual data cleaning is still common.',
                high: 'Data quality is strong. Automated validation, consistent formats, and proactive deduplication are in place.'
            },
            remedies: [
                { score: 1, text: 'Conduct a full data audit across all systems to identify accuracy gaps, missing fields, and duplicate records.' },
                { score: 2, text: 'Implement automated data validation rules at point of entry (forms, APIs, imports).' },
                { score: 3, text: 'Deploy a data quality monitoring dashboard with automated alerts for anomalies.' },
                { score: 4, text: 'Establish data quality SLAs with measurable targets (>99% accuracy, <1% duplicates).' },
                { score: 5, text: 'Maintain excellence — run quarterly data quality reviews and continuously refine validation rules.' }
            ],
            nextSteps: [
                'Map all data sources and document current quality levels',
                'Prioritize the top 5 data quality issues by business impact',
                'Implement automated deduplication for customer/client records',
                'Create a data quality scorecard reviewed monthly',
                'Train team members on data entry standards and best practices'
            ],
            kpis: ['Data accuracy rate (target: >98%)', 'Duplicate record rate (target: <2%)', 'Missing field rate (target: <5%)', 'Data quality issue resolution time (target: <48 hrs)'],
            timeline: '4-8 weeks for initial audit and quick wins, 3-6 months for full implementation'
        },
        'Data Infrastructure': {
            findings: {
                low: 'Data infrastructure is fragmented or non-existent. Data lives in silos (spreadsheets, local databases). No centralized access.',
                mid: 'Some infrastructure exists (basic database, cloud storage) but lacks real-time capabilities and unified access.',
                high: 'Robust infrastructure with centralized warehouse, API access, and real-time pipelines supporting analytics and AI workloads.'
            },
            remedies: [
                { score: 1, text: 'Start with a cloud data warehouse (BigQuery, Snowflake, or Redshift) to centralize data from all sources.' },
                { score: 2, text: 'Build ETL pipelines to automate data ingestion from key systems (CRM, ERP, marketing tools).' },
                { score: 3, text: 'Implement API-first architecture so all systems can programmatically access and push data.' },
                { score: 4, text: 'Add real-time streaming capabilities (Kafka, Pub/Sub) for time-sensitive use cases.' },
                { score: 5, text: 'Optimize for scale — implement data lakehouse architecture, cost monitoring, and auto-scaling.' }
            ],
            nextSteps: [
                'Inventory all current data storage locations and formats',
                'Select and provision a cloud data warehouse',
                'Build automated pipelines for your top 3 data sources',
                'Create API endpoints for internal data access',
                'Establish infrastructure monitoring and alerting'
            ],
            kpis: ['Data pipeline uptime (target: >99.5%)', 'Data freshness/latency (target: <1 hr for key sources)', 'Number of integrated data sources', 'Query response time (target: <5 seconds)'],
            timeline: '2-4 weeks for cloud setup, 2-3 months for pipeline buildout, 6 months for full API architecture'
        },
        'Data Governance': {
            findings: {
                low: 'No formal data governance. Unclear ownership, inconsistent access controls, and no documentation of data assets.',
                mid: 'Basic governance exists — some access controls and ownership defined, but documentation is sparse and policies are informal.',
                high: 'Mature governance framework with clear ownership, role-based access, comprehensive catalog, and compliance tracking.'
            },
            remedies: [
                { score: 1, text: 'Assign data owners for each major data domain (customer, financial, product, operational).' },
                { score: 2, text: 'Implement role-based access controls (RBAC) across all data systems with audit logging.' },
                { score: 3, text: 'Build a data catalog documenting all datasets, their owners, update frequency, and quality levels.' },
                { score: 4, text: 'Establish a data governance committee that reviews policies quarterly and handles escalations.' },
                { score: 5, text: 'Automate compliance monitoring and integrate governance into CI/CD pipelines for data products.' }
            ],
            nextSteps: [
                'Document who currently owns/manages each data source',
                'Audit current access permissions and revoke unnecessary access',
                'Create a data dictionary for your top 10 datasets',
                'Draft a data governance policy covering access, retention, and privacy',
                'Schedule quarterly governance reviews with stakeholders'
            ],
            kpis: ['% of datasets with assigned owners (target: 100%)', '% of systems with RBAC implemented (target: 100%)', 'Data catalog coverage (target: >90% of datasets)', 'Policy compliance rate (target: >95%)'],
            timeline: '2-4 weeks for ownership mapping, 1-2 months for RBAC, 3-4 months for full catalog'
        },
        'Analytics Maturity': {
            findings: {
                low: 'Analytics is ad-hoc — mostly manual spreadsheet analysis. No BI tools, limited analytical skills on the team.',
                mid: 'Some BI tools in use, basic dashboards exist. Analytics is reactive (reporting what happened) rather than predictive.',
                high: 'Advanced analytics capability with self-service BI, skilled team, and a data-driven culture where decisions are backed by data.'
            },
            remedies: [
                { score: 1, text: 'Deploy a BI tool (Tableau, Power BI, Looker, or Metabase) and connect it to your key data sources.' },
                { score: 2, text: 'Build executive dashboards for the top 5 KPIs each department cares about most.' },
                { score: 3, text: 'Hire or train at least one analytics specialist. Invest in SQL/Python training for the broader team.' },
                { score: 4, text: 'Move from descriptive to predictive analytics — implement forecasting models for revenue, churn, and demand.' },
                { score: 5, text: 'Embed analytics into workflows — automated alerts, decision support systems, and self-service exploration for all teams.' }
            ],
            nextSteps: [
                'Identify the top 5 business questions that data should answer',
                'Select and deploy a BI platform with executive dashboards',
                'Train 3-5 key team members on data analysis fundamentals',
                'Establish a weekly data review meeting with leadership',
                'Create a self-service analytics portal for common queries'
            ],
            kpis: ['# of active dashboard users (target: 80% of managers)', 'Decision-to-data ratio (% of decisions backed by data)', '# of self-service queries per week', 'Report generation time (target: <1 day)'],
            timeline: '2-4 weeks for BI setup, 1-2 months for dashboard buildout, 3-6 months for culture shift'
        },
        'ML Readiness': {
            findings: {
                low: 'No ML capabilities. No labeled data, no feature engineering process, no model deployment infrastructure.',
                mid: 'Some exploration of ML. Labeled data exists for a few use cases. Manual model training but no production deployment pipeline.',
                high: 'Production ML capability with labeled datasets, feature stores, automated training pipelines, and model monitoring in production.'
            },
            remedies: [
                { score: 1, text: 'Identify your highest-value ML use case and begin labeling data for it (start with 1,000+ examples).' },
                { score: 2, text: 'Build a feature engineering pipeline — transform raw data into ML-ready features for your priority use case.' },
                { score: 3, text: 'Set up MLOps infrastructure — experiment tracking (MLflow), model registry, and basic CI/CD for models.' },
                { score: 4, text: 'Deploy your first production ML model with monitoring for data drift, model performance, and latency.' },
                { score: 5, text: 'Scale ML across the organization — automate retraining, A/B testing, and champion/challenger model patterns.' }
            ],
            nextSteps: [
                'Run the AI Use Case Evaluator to identify your best ML opportunities',
                'Assess data availability for the top 3 use cases',
                'Start a labeling project for your highest-priority use case',
                'Set up a ML experimentation environment (Jupyter, cloud ML services)',
                'Define success metrics for your first ML model before building it'
            ],
            kpis: ['# of labeled datasets available', 'Model accuracy/F1 score for production models', 'Model inference latency (target: <200ms)', 'Time from experiment to production (target: <2 weeks)'],
            timeline: '1-2 months for data labeling, 2-3 months for first model, 6-12 months for full MLOps'
        },
        'Organizational Readiness': {
            findings: {
                low: 'No organizational alignment on AI. No executive sponsorship, no budget, and significant resistance to change.',
                mid: 'Some interest from leadership. Budget discussions happening but not finalized. Limited change management planning.',
                high: 'Strong executive sponsorship, dedicated AI budget, clear roadmap, and a change management plan ensuring smooth adoption.'
            },
            remedies: [
                { score: 1, text: 'Build a business case for AI with 3 concrete use cases showing ROI. Present to executive leadership.' },
                { score: 2, text: 'Secure executive sponsorship — identify a C-level champion who will advocate for AI initiatives.' },
                { score: 3, text: 'Allocate a dedicated AI/ML budget (recommended: 5-10% of IT budget as a starting point).' },
                { score: 4, text: 'Develop a formal change management plan — communication strategy, training programs, and success milestones.' },
                { score: 5, text: 'Establish an AI Center of Excellence (CoE) that drives best practices, governance, and innovation across the org.' }
            ],
            nextSteps: [
                'Present an AI opportunity brief to leadership with ROI estimates',
                'Identify and recruit an executive sponsor for AI initiatives',
                'Draft a 12-month AI roadmap with milestones and budget requirements',
                'Plan an AI literacy workshop for leadership and key stakeholders',
                'Establish a cross-functional AI steering committee'
            ],
            kpis: ['Executive engagement (# of AI-related decisions per quarter)', 'AI budget utilization rate', 'Employee AI literacy score (post-training)', 'Change adoption rate (% of team using new AI tools)'],
            timeline: '2-4 weeks for business case, 1-2 months for sponsorship/budget, 3-6 months for full org alignment'
        }
    };

    categoryScores.forEach(function(cat) {
        var data = analysisData[cat.name];
        if (!data) return;

        var finding = cat.score < 2.5 ? data.findings.low : cat.score < 3.5 ? data.findings.mid : data.findings.high;
        var scoreColor = cat.score >= 4 ? '#28a745' : cat.score >= 3 ? '#ffc107' : cat.score >= 2 ? '#fd7e14' : '#dc3545';
        var statusLabel = cat.score >= 4 ? 'Strong' : cat.score >= 3 ? 'Developing' : cat.score >= 2 ? 'Needs Work' : 'Critical';

        // Find the applicable remedy (based on rounded score)
        var roundedScore = Math.round(cat.score);
        var remedy = data.remedies.find(function(r) { return r.score === roundedScore; }) || data.remedies[0];

        html += '<div style="margin-bottom:24px;border:1px solid #ddd;border-radius:8px;overflow:hidden;">';

        // Category header
        html += '<div style="background:#0A0A2A;color:white;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;">';
        html += '<h4 style="margin:0;color:#40E0D0;">' + cat.name + '</h4>';
        html += '<div style="display:flex;align-items:center;gap:10px;">';
        html += '<span style="font-size:1.3em;font-weight:700;">' + cat.score.toFixed(1) + '/5.0</span>';
        html += '<span style="background:' + scoreColor + ';color:#fff;padding:3px 10px;border-radius:10px;font-size:0.8em;">' + statusLabel + '</span>';
        html += '</div></div>';

        // Finding
        html += '<div style="padding:16px 18px;">';
        html += '<div style="margin-bottom:16px;">';
        html += '<h5 style="margin:0 0 6px;color:#0A0A2A;">Finding</h5>';
        html += '<p style="margin:0;color:#555;line-height:1.6;">' + finding + '</p>';
        html += '</div>';

        // Priority Remedy
        html += '<div style="margin-bottom:16px;padding:12px;background:#f0faf0;border-left:4px solid #40E0D0;border-radius:4px;">';
        html += '<h5 style="margin:0 0 6px;color:#0A0A2A;">Priority Remedy</h5>';
        html += '<p style="margin:0;color:#333;line-height:1.5;">' + remedy.text + '</p>';
        html += '</div>';

        // Next Steps
        html += '<div style="margin-bottom:16px;">';
        html += '<h5 style="margin:0 0 8px;color:#0A0A2A;">Next Steps</h5>';
        html += '<ol style="margin:0;padding-left:20px;color:#555;">';
        data.nextSteps.forEach(function(step) {
            html += '<li style="margin-bottom:6px;line-height:1.5;">' + step + '</li>';
        });
        html += '</ol></div>';

        // KPIs to Track
        html += '<div style="margin-bottom:16px;">';
        html += '<h5 style="margin:0 0 8px;color:#0A0A2A;">KPIs to Track</h5>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
        data.kpis.forEach(function(kpi) {
            html += '<span style="background:#f8f9fa;border:1px solid #ddd;border-radius:6px;padding:6px 12px;font-size:0.85em;color:#333;">' + kpi + '</span>';
        });
        html += '</div></div>';

        // Timeline
        html += '<div style="padding:10px 14px;background:#f8f9fa;border-radius:4px;">';
        html += '<h5 style="margin:0 0 4px;color:#0A0A2A;">Estimated Timeline</h5>';
        html += '<p style="margin:0;color:#666;font-size:0.9em;">' + data.timeline + '</p>';
        html += '</div>';

        html += '</div></div>';
    });

    // Overall Summary and Recommendation
    html += '<div style="margin-top:24px;padding:20px;background:#0A0A2A;color:white;border-radius:8px;">';
    html += '<h4 style="margin-top:0;color:#40E0D0;">Overall Recommendation</h4>';

    if (overallScore < 2) {
        html += '<p>Your organization is in the <strong>Getting Started</strong> phase. Focus exclusively on Foundations: data quality, basic infrastructure, and governance. Do not attempt ML or AI projects until these are in place — they will fail without clean, accessible data.</p>';
        html += '<p><strong>Priority order:</strong> Data Quality → Data Infrastructure → Data Governance → Analytics → ML → Org Readiness</p>';
        html += '<p><strong>Estimated time to AI-ready:</strong> 12-18 months</p>';
    } else if (overallScore < 3) {
        html += '<p>Your organization is <strong>Foundation Building</strong>. The basics are partially in place but significant gaps remain. Focus on closing gaps in your weakest categories before advancing to ML.</p>';
        html += '<p><strong>Priority order:</strong> Shore up any category below 3.0, then advance Analytics maturity and begin ML preparation.</p>';
        html += '<p><strong>Estimated time to AI-ready:</strong> 6-12 months</p>';
    } else if (overallScore < 4) {
        html += '<p>Your organization is in the <strong>Developing</strong> phase with solid foundations. You are ready to begin ML pilots. Focus on strengthening ML Readiness and Organizational alignment while maintaining your current capabilities.</p>';
        html += '<p><strong>Priority order:</strong> ML Readiness → Organizational Readiness → Advance any category below 4.0</p>';
        html += '<p><strong>Estimated time to AI-ready:</strong> 3-6 months</p>';
    } else {
        html += '<p>Your organization is <strong>AI-Ready</strong>. You have strong foundations across all categories. Focus on scaling ML across the organization, establishing an AI Center of Excellence, and pursuing advanced AI capabilities.</p>';
        html += '<p><strong>Priority order:</strong> Scale production ML → Advanced AI (deep learning, real-time) → AI Center of Excellence</p>';
        html += '<p><strong>Estimated time to advanced AI:</strong> 3-6 months</p>';
    }

    html += '<p style="margin-top:16px;color:#40E0D0;">Contact Aurora Technologies for a hands-on engagement to accelerate your AI readiness journey.</p>';
    html += '</div>';

    // Export buttons
    html += '<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">';
    html += '<button onclick="exportDataReadinessCSV()">Export CSV</button>';
    html += '<button onclick="copyDataReadinessResults()" style="background-color:#0A0A2A;">Copy Full Report</button>';
    html += '</div>';

    resultDiv.innerHTML = html;
}

function exportDataReadinessCSV() {
    var rows = [['Category', 'Item', 'Score']];
    dataReadinessCategories.forEach(function(cat, ci) {
        cat.items.forEach(function(item, ii) {
            var el = document.getElementById('dr_' + ci + '_' + ii);
            var val = el ? el.value : '3';
            rows.push([cat.name, item, val]);
        });
    });
    var csv = rows.map(function(r) { return r.map(function(c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'data_readiness_assessment.csv';
    a.click();
}

function copyDataReadinessResults() {
    var resultDiv = document.getElementById('dataReadinessResult');
    if (!resultDiv) return;
    var text = resultDiv.innerText;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
            alert('Results copied to clipboard!');
        });
    } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('Results copied to clipboard!');
    }
}

// Initialize form on load
document.addEventListener('DOMContentLoaded', function() {
    createDataReadinessForm();
});

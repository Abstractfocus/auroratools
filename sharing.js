// Sharing: encode tool inputs as URL params, copy link, and restore on page load

(function () {
    // Tool definitions: tool key -> { tabId, params: { paramName: inputId } }
    var toolDefs = {
        roi: {
            tabId: 'roiCalculator',
            resultId: 'roiResult',
            params: {
                revenue: 'annualRevenue',
                employees: 'employeeCount',
                duration: 'projectDuration'
            }
        },
        tco: {
            tabId: 'tcoCalculator',
            resultId: 'tcoResult',
            params: {
                software: 'softwareCost',
                hardware: 'hardwareCost',
                implementation: 'implementationCost',
                training: 'trainingCost',
                maintenance: 'annualMaintenance',
                years: 'yearsOwned'
            }
        },
        timeline: {
            tabId: 'timelineEstimator',
            resultId: 'timelineResult',
            params: {
                scope: 'projectScope',
                team: 'teamSize',
                complexity: 'complexity'
            }
        },
        bench: {
            tabId: 'benchmarking',
            resultId: 'benchmarkResult',
            params: {
                industry: 'benchIndustry',
                revenue: 'benchRevenue',
                employees: 'benchEmployees',
                satisfaction: 'benchSatisfaction',
                marketShare: 'benchMarketShare'
            }
        },
        budget: {
            tabId: 'budgetPlanner',
            resultId: 'budgetResult',
            params: {
                total: 'totalBudget',
                personnel: 'budgetPersonnel',
                technology: 'budgetTechnology',
                marketing: 'budgetMarketing',
                operations: 'budgetOperations',
                training: 'budgetTraining',
                contingency: 'budgetContingency'
            }
        }
    };

    // Build a share URL from the current input values for a given tool key
    function buildShareURL(toolKey) {
        var def = toolDefs[toolKey];
        if (!def) return null;
        var url = new URL(window.location.href.split('?')[0]);
        url.searchParams.set('tool', toolKey);
        var params = def.params;
        for (var paramName in params) {
            var el = document.getElementById(params[paramName]);
            if (el && el.value) {
                url.searchParams.set(paramName, el.value);
            }
        }
        return url.toString();
    }

    // Copy text to clipboard and show a brief message near the button
    function copyAndNotify(text, btn) {
        navigator.clipboard.writeText(text).then(function () {
            var orig = btn.textContent;
            btn.textContent = 'Link copied!';
            btn.disabled = true;
            setTimeout(function () {
                btn.textContent = orig;
                btn.disabled = false;
            }, 1500);
        }).catch(function () {
            // Fallback for older browsers
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            var orig = btn.textContent;
            btn.textContent = 'Link copied!';
            btn.disabled = true;
            setTimeout(function () {
                btn.textContent = orig;
                btn.disabled = false;
            }, 1500);
        });
    }

    // Inject a Share button into a result div for a given tool key
    window.addShareButton = function (toolKey) {
        var def = toolDefs[toolKey];
        if (!def) return;
        var resultDiv = document.getElementById(def.resultId);
        if (!resultDiv) return;
        // Remove any existing share button first
        var existing = resultDiv.querySelector('.share-btn');
        if (existing) existing.remove();
        var btn = document.createElement('button');
        btn.className = 'share-btn';
        btn.textContent = 'Share';
        btn.addEventListener('click', function () {
            var url = buildShareURL(toolKey);
            if (url) {
                copyAndNotify(url, btn);
            }
        });
        resultDiv.appendChild(btn);
    };

    // On page load, check URL params and populate inputs
    function restoreFromURL() {
        var params = new URLSearchParams(window.location.search);
        var toolKey = params.get('tool');
        if (!toolKey || !toolDefs[toolKey]) return;
        var def = toolDefs[toolKey];

        // Populate inputs
        for (var paramName in def.params) {
            var val = params.get(paramName);
            if (val !== null) {
                var el = document.getElementById(def.params[paramName]);
                if (el) el.value = val;
            }
        }

        // Switch to the correct tab
        var nav = document.getElementById('toolNav');
        if (nav) {
            var tabs = nav.querySelectorAll('.tab-btn');
            var tools = document.querySelectorAll('.container > .tool');
            tools.forEach(function (tool) {
                if (tool.id === def.tabId) {
                    tool.classList.remove('tool-hidden');
                } else {
                    tool.classList.add('tool-hidden');
                }
            });
            tabs.forEach(function (btn) {
                if (btn.getAttribute('data-target') === def.tabId) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }

    // Run restore after DOM is ready (this script loads before nav.js)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', restoreFromURL);
    } else {
        restoreFromURL();
    }
})();

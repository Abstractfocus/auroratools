// Webhook / Notification System for CRM Events
// localStorage keys: 'aurora-notifications', 'aurora-slack-webhook', 'aurora-slack-events'

(function () {
    'use strict';

    var NOTIF_KEY = 'aurora-notifications';
    var SLACK_KEY = 'aurora-slack-webhook';
    var SLACK_EVENTS_KEY = 'aurora-slack-events';
    var MAX_NOTIFICATIONS = 100;
    var PANEL_DISPLAY_COUNT = 20;

    // ========== Notification Storage ==========

    function getNotifications() {
        try {
            return JSON.parse(localStorage.getItem(NOTIF_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveNotifications(notifications) {
        localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
    }

    function addNotification(type, message, clientId) {
        var notifications = getNotifications();
        var notification = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            type: type,
            message: message,
            timestamp: new Date().toISOString(),
            read: false,
            clientId: clientId || null
        };
        notifications.unshift(notification);
        if (notifications.length > MAX_NOTIFICATIONS) {
            notifications = notifications.slice(0, MAX_NOTIFICATIONS);
        }
        saveNotifications(notifications);
        updateBadge();
        return notification;
    }

    function markAsRead(id) {
        var notifications = getNotifications();
        for (var i = 0; i < notifications.length; i++) {
            if (notifications[i].id === id) {
                notifications[i].read = true;
                break;
            }
        }
        saveNotifications(notifications);
        updateBadge();
        renderNotificationPanel();
    }

    function markAllRead() {
        var notifications = getNotifications();
        notifications.forEach(function (n) { n.read = true; });
        saveNotifications(notifications);
        updateBadge();
        renderNotificationPanel();
    }

    function clearAllNotifications() {
        saveNotifications([]);
        updateBadge();
        renderNotificationPanel();
    }

    // ========== Bell Icon & Badge ==========

    function createBellIcon() {
        if (document.getElementById('notificationBell')) return;

        var bell = document.createElement('button');
        bell.id = 'notificationBell';
        bell.className = 'notification-bell';
        bell.setAttribute('aria-label', 'Notifications');
        bell.innerHTML = '<span class="notification-bell-icon">&#128276;</span><span id="notificationBadge" class="notification-badge" style="display:none;">0</span>';
        bell.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleNotificationPanel();
        });
        document.body.appendChild(bell);

        // Close panel on outside click
        document.addEventListener('click', function (e) {
            var panel = document.getElementById('notificationPanel');
            if (panel && !panel.contains(e.target) && e.target.id !== 'notificationBell' && !bell.contains(e.target)) {
                panel.style.display = 'none';
            }
        });

        updateBadge();
    }

    function updateBadge() {
        var badge = document.getElementById('notificationBadge');
        if (!badge) return;
        var notifications = getNotifications();
        var unread = notifications.filter(function (n) { return !n.read; }).length;
        badge.textContent = unread > 99 ? '99+' : unread;
        badge.style.display = unread > 0 ? 'flex' : 'none';
    }

    function animateBell() {
        var bell = document.getElementById('notificationBell');
        if (!bell) return;
        bell.classList.remove('notification-bell-ring');
        // Force reflow to restart animation
        void bell.offsetWidth;
        bell.classList.add('notification-bell-ring');
        setTimeout(function () {
            bell.classList.remove('notification-bell-ring');
        }, 600);
    }

    // ========== Notification Panel ==========

    function toggleNotificationPanel() {
        var panel = document.getElementById('notificationPanel');
        if (!panel) {
            createNotificationPanel();
            panel = document.getElementById('notificationPanel');
        }
        if (panel.style.display === 'block') {
            panel.style.display = 'none';
        } else {
            renderNotificationPanel();
            panel.style.display = 'block';
        }
    }

    function createNotificationPanel() {
        if (document.getElementById('notificationPanel')) return;
        var panel = document.createElement('div');
        panel.id = 'notificationPanel';
        panel.className = 'notification-panel';
        panel.style.display = 'none';
        panel.addEventListener('click', function (e) { e.stopPropagation(); });
        document.body.appendChild(panel);
    }

    function renderNotificationPanel() {
        var panel = document.getElementById('notificationPanel');
        if (!panel) return;

        var notifications = getNotifications().slice(0, PANEL_DISPLAY_COUNT);
        var html = '<div class="notification-panel-header">';
        html += '<strong>Notifications</strong>';
        html += '<span class="notification-panel-actions">';
        html += '<button class="notification-panel-btn" onclick="window._auroraNotifications.markAllRead()">Mark All Read</button>';
        html += '<button class="notification-panel-btn notification-panel-btn-clear" onclick="window._auroraNotifications.clearAll()">Clear All</button>';
        html += '</span>';
        html += '</div>';

        // Settings toggle
        html += '<div class="notification-panel-settings-toggle">';
        html += '<button class="notification-panel-btn" onclick="window._auroraNotifications.toggleSettings()">&#9881; Webhook Settings</button>';
        html += '<button class="notification-panel-btn" onclick="window._auroraNotifications.showDigest()">&#128203; Daily Digest</button>';
        html += '</div>';

        // Settings section (hidden by default)
        html += '<div id="notificationSettingsSection" class="notification-settings" style="display:none;">';
        html += renderSettingsHTML();
        html += '</div>';

        // Digest section (hidden by default)
        html += '<div id="notificationDigestSection" class="notification-settings" style="display:none;"></div>';

        if (notifications.length === 0) {
            html += '<div class="notification-empty">No notifications yet.</div>';
        } else {
            html += '<div class="notification-list">';
            notifications.forEach(function (n) {
                var readClass = n.read ? '' : ' unread';
                var typeIcon = getTypeIcon(n.type);
                var timeAgo = formatTimeAgo(n.timestamp);
                html += '<div class="notification-item' + readClass + '" data-id="' + n.id + '">';
                html += '<div class="notification-item-main" onclick="window._auroraNotifications.markAsRead(\'' + n.id + '\')">';
                html += '<span class="notification-type-icon">' + typeIcon + '</span>';
                html += '<div class="notification-item-content">';
                html += '<div class="notification-item-message">' + escapeHTML(n.message) + '</div>';
                html += '<div class="notification-item-time">' + timeAgo + '</div>';
                html += '</div>';
                html += '</div>';
                html += '<button class="notification-email-btn" onclick="window._auroraNotifications.sendEmail(\'' + n.id + '\')" title="Send as email">&#9993;</button>';
                html += '</div>';
            });
            html += '</div>';
        }

        panel.innerHTML = html;
    }

    function getTypeIcon(type) {
        var icons = {
            'stage_change': '&#128260;',
            'follow_up_due': '&#9200;',
            'client_added': '&#128100;',
            'deal_won': '&#127942;',
            'deal_lost': '&#10060;'
        };
        return icons[type] || '&#128276;';
    }

    function formatTimeAgo(timestamp) {
        var now = new Date();
        var then = new Date(timestamp);
        var diffMs = now - then;
        var diffMins = Math.floor(diffMs / 60000);
        var diffHours = Math.floor(diffMs / 3600000);
        var diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return diffMins + 'm ago';
        if (diffHours < 24) return diffHours + 'h ago';
        if (diffDays < 7) return diffDays + 'd ago';
        return then.toLocaleDateString();
    }

    function escapeHTML(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ========== Slack Integration ==========

    function getSlackWebhookURL() {
        return localStorage.getItem(SLACK_KEY) || '';
    }

    function setSlackWebhookURL(url) {
        localStorage.setItem(SLACK_KEY, url);
    }

    function getSlackEventPrefs() {
        try {
            return JSON.parse(localStorage.getItem(SLACK_EVENTS_KEY)) || {
                stage_change: true,
                client_added: true,
                follow_up_due: true,
                deal_won: true,
                deal_lost: true
            };
        } catch (e) {
            return { stage_change: true, client_added: true, follow_up_due: true, deal_won: true, deal_lost: true };
        }
    }

    function saveSlackEventPrefs(prefs) {
        localStorage.setItem(SLACK_EVENTS_KEY, JSON.stringify(prefs));
    }

    function sendSlackNotification(message) {
        var url = getSlackWebhookURL();
        if (!url) return;

        var payload = {
            text: message
        };

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            mode: 'no-cors'
        }).catch(function (err) {
            console.warn('Slack webhook failed:', err);
        });
    }

    function formatSlackMessage(type, data) {
        var emoji = {
            'stage_change': ':arrows_counterclockwise:',
            'follow_up_due': ':alarm_clock:',
            'client_added': ':bust_in_silhouette:',
            'deal_won': ':trophy:',
            'deal_lost': ':x:'
        };
        var prefix = emoji[type] || ':bell:';
        var message = prefix + ' ';

        switch (type) {
            case 'client_added':
                message += '*New Client Added*\nName: ' + data.name + '\nCompany: ' + (data.company || 'N/A') + '\nStage: ' + (data.stage || 'Lead');
                break;
            case 'stage_change':
                message += '*Deal Stage Changed*\nClient: ' + data.name + ' (' + (data.company || '') + ')\n' + (data.oldStage || '?') + ' :arrow_right: ' + (data.newStage || '?');
                break;
            case 'deal_won':
                message += '*Deal Won!* :tada:\nClient: ' + data.name + ' (' + (data.company || '') + ')';
                break;
            case 'deal_lost':
                message += '*Deal Lost*\nClient: ' + data.name + ' (' + (data.company || '') + ')';
                break;
            case 'follow_up_due':
                message += '*Follow-up Reminder*\nClient: ' + data.name + ' (' + (data.company || '') + ')\nDue: ' + (data.followUpDate || 'Today');
                break;
            default:
                message += data.message || 'CRM Notification';
        }
        return message;
    }

    function renderSettingsHTML() {
        var webhookURL = getSlackWebhookURL();
        var prefs = getSlackEventPrefs();

        var html = '<h4 style="margin:0 0 8px;">Slack Webhook</h4>';
        html += '<input type="text" id="slackWebhookInput" class="notification-settings-input" placeholder="https://hooks.slack.com/services/..." value="' + escapeHTML(webhookURL) + '">';
        html += '<button class="notification-panel-btn" onclick="window._auroraNotifications.saveSlackURL()" style="margin-top:6px;">Save Webhook URL</button>';

        html += '<h4 style="margin:12px 0 8px;">Send to Slack:</h4>';
        var eventLabels = {
            stage_change: 'Stage Changes',
            client_added: 'New Clients',
            follow_up_due: 'Follow-up Reminders',
            deal_won: 'Deals Won',
            deal_lost: 'Deals Lost'
        };
        Object.keys(eventLabels).forEach(function (key) {
            var checked = prefs[key] ? ' checked' : '';
            html += '<label class="notification-settings-toggle"><input type="checkbox" id="slackPref_' + key + '"' + checked + ' onchange="window._auroraNotifications.saveSlackPrefs()"> ' + eventLabels[key] + '</label>';
        });

        return html;
    }

    function saveSlackURL() {
        var input = document.getElementById('slackWebhookInput');
        if (input) {
            setSlackWebhookURL(input.value.trim());
        }
    }

    function saveSlackPrefs() {
        var prefs = {};
        var keys = ['stage_change', 'client_added', 'follow_up_due', 'deal_won', 'deal_lost'];
        keys.forEach(function (key) {
            var cb = document.getElementById('slackPref_' + key);
            prefs[key] = cb ? cb.checked : true;
        });
        saveSlackEventPrefs(prefs);
    }

    function toggleSettings() {
        var section = document.getElementById('notificationSettingsSection');
        if (section) {
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
        }
        var digest = document.getElementById('notificationDigestSection');
        if (digest) digest.style.display = 'none';
    }

    // ========== Email Draft Generation ==========

    function sendEmailForNotification(id) {
        var notifications = getNotifications();
        var notif = null;
        for (var i = 0; i < notifications.length; i++) {
            if (notifications[i].id === id) { notif = notifications[i]; break; }
        }
        if (!notif) return;

        var subject = '';
        var body = '';

        switch (notif.type) {
            case 'stage_change':
                subject = 'Deal Stage Update: ' + notif.message;
                body = 'Hi,\n\nThis is a notification that a deal stage has changed.\n\n' + notif.message + '\n\nTimestamp: ' + new Date(notif.timestamp).toLocaleString() + '\n\nBest regards,\nAurora CRM';
                break;
            case 'client_added':
                subject = 'New Client Added: ' + notif.message;
                body = 'Hi,\n\nA new client has been added to the CRM.\n\n' + notif.message + '\n\nTimestamp: ' + new Date(notif.timestamp).toLocaleString() + '\n\nBest regards,\nAurora CRM';
                break;
            case 'deal_won':
                subject = 'Deal Won! ' + notif.message;
                body = 'Hi,\n\nGreat news! A deal has been won.\n\n' + notif.message + '\n\nTimestamp: ' + new Date(notif.timestamp).toLocaleString() + '\n\nBest regards,\nAurora CRM';
                break;
            case 'deal_lost':
                subject = 'Deal Lost: ' + notif.message;
                body = 'Hi,\n\nUnfortunately, a deal has been lost.\n\n' + notif.message + '\n\nTimestamp: ' + new Date(notif.timestamp).toLocaleString() + '\n\nBest regards,\nAurora CRM';
                break;
            case 'follow_up_due':
                subject = 'Follow-up Reminder: ' + notif.message;
                body = 'Hi,\n\nThis is a reminder about an upcoming follow-up.\n\n' + notif.message + '\n\nTimestamp: ' + new Date(notif.timestamp).toLocaleString() + '\n\nBest regards,\nAurora CRM';
                break;
            default:
                subject = 'CRM Notification: ' + notif.message;
                body = 'Hi,\n\n' + notif.message + '\n\nTimestamp: ' + new Date(notif.timestamp).toLocaleString() + '\n\nBest regards,\nAurora CRM';
        }

        var mailto = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        window.open(mailto, '_blank');
    }

    // ========== Daily Digest ==========

    function generateDailyDigest() {
        var clients = [];
        try {
            clients = JSON.parse(localStorage.getItem('aurora-crm-clients')) || [];
        } catch (e) {
            clients = [];
        }

        var todayStr = new Date().toISOString().split('T')[0];
        var followUpsDueToday = [];
        var followUpsOverdue = [];
        var staleNegotiations = [];

        clients.forEach(function (c) {
            if (c.followUp) {
                if (c.followUp === todayStr) {
                    followUpsDueToday.push(c);
                } else if (c.followUp < todayStr) {
                    followUpsOverdue.push(c);
                }
            }
        });

        // Check for deals in Negotiation for >7 days
        var notifications = getNotifications();
        var sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        var sevenDaysAgoISO = sevenDaysAgo.toISOString();

        var negotiationClients = clients.filter(function (c) { return c.stage === 'Negotiation'; });
        negotiationClients.forEach(function (c) {
            // Find if there's a stage_change notification about entering Negotiation older than 7 days
            var enteredNegotiation = false;
            for (var i = 0; i < notifications.length; i++) {
                var n = notifications[i];
                if (n.type === 'stage_change' && n.clientId === c.id && n.message.indexOf('Negotiation') !== -1 && n.timestamp < sevenDaysAgoISO) {
                    enteredNegotiation = true;
                    break;
                }
            }
            if (enteredNegotiation) {
                staleNegotiations.push(c);
            }
        });

        var lines = [];
        lines.push('===== Daily CRM Digest =====');
        lines.push('Date: ' + todayStr);
        lines.push('');

        if (followUpsDueToday.length > 0) {
            lines.push('FOLLOW-UPS DUE TODAY (' + followUpsDueToday.length + '):');
            followUpsDueToday.forEach(function (c) {
                lines.push('  - ' + c.name + ' (' + c.company + ')');
            });
            lines.push('');
        }

        if (followUpsOverdue.length > 0) {
            lines.push('OVERDUE FOLLOW-UPS (' + followUpsOverdue.length + '):');
            followUpsOverdue.forEach(function (c) {
                lines.push('  - ' + c.name + ' (' + c.company + ') - due: ' + c.followUp);
            });
            lines.push('');
        }

        if (staleNegotiations.length > 0) {
            lines.push('STALE NEGOTIATIONS (>7 days) (' + staleNegotiations.length + '):');
            staleNegotiations.forEach(function (c) {
                lines.push('  - ' + c.name + ' (' + c.company + ')');
            });
            lines.push('');
        }

        if (followUpsDueToday.length === 0 && followUpsOverdue.length === 0 && staleNegotiations.length === 0) {
            lines.push('All clear! No urgent items today.');
        }

        return lines.join('\n');
    }

    function showDigest() {
        var section = document.getElementById('notificationDigestSection');
        if (!section) return;

        var settings = document.getElementById('notificationSettingsSection');
        if (settings) settings.style.display = 'none';

        if (section.style.display === 'block') {
            section.style.display = 'none';
            return;
        }

        var digest = generateDailyDigest();
        var html = '<h4 style="margin:0 0 8px;">Daily Digest</h4>';
        html += '<pre class="notification-digest-text">' + escapeHTML(digest) + '</pre>';
        html += '<div style="display:flex;gap:6px;margin-top:8px;">';
        html += '<button class="notification-panel-btn" onclick="window._auroraNotifications.copyDigest()">Copy to Clipboard</button>';
        html += '<button class="notification-panel-btn" onclick="window._auroraNotifications.sendDigestToSlack()">Send to Slack</button>';
        html += '</div>';

        section.innerHTML = html;
        section.style.display = 'block';
    }

    function copyDigest() {
        var digest = generateDailyDigest();
        if (navigator.clipboard) {
            navigator.clipboard.writeText(digest).then(function () {
                alert('Digest copied to clipboard!');
            });
        } else {
            // Fallback
            var textarea = document.createElement('textarea');
            textarea.value = digest;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('Digest copied to clipboard!');
        }
    }

    function sendDigestToSlack() {
        var digest = generateDailyDigest();
        var url = getSlackWebhookURL();
        if (!url) {
            alert('No Slack webhook URL configured. Please add one in Webhook Settings.');
            return;
        }
        sendSlackNotification(digest);
        alert('Digest sent to Slack!');
    }

    // ========== Main Trigger Function ==========

    function triggerNotification(type, data) {
        var message = '';

        switch (type) {
            case 'client_added':
                message = 'New client added: ' + data.name + ' (' + (data.company || 'N/A') + ') - Stage: ' + (data.stage || 'Lead');
                break;
            case 'stage_change':
                message = data.name + ' (' + (data.company || '') + ') moved from ' + (data.oldStage || '?') + ' to ' + (data.newStage || '?');
                break;
            case 'deal_won':
                message = 'Deal won! ' + data.name + ' (' + (data.company || '') + ')';
                break;
            case 'deal_lost':
                message = 'Deal lost: ' + data.name + ' (' + (data.company || '') + ')';
                break;
            case 'follow_up_due':
                message = 'Follow-up due for ' + data.name + ' (' + (data.company || '') + ') - ' + (data.followUpDate || 'Today');
                break;
            default:
                message = data.message || 'CRM event: ' + type;
        }

        // Add to notification center
        addNotification(type, message, data.clientId || null);

        // Send to Slack if configured
        var slackPrefs = getSlackEventPrefs();
        if (getSlackWebhookURL() && slackPrefs[type]) {
            var slackMsg = formatSlackMessage(type, data);
            sendSlackNotification(slackMsg);
        }

        // Animate bell
        animateBell();
    }

    // ========== Initialization ==========

    // Create bell when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createBellIcon);
    } else {
        createBellIcon();
    }

    // Expose public API
    window.triggerNotification = triggerNotification;
    window.generateDailyDigest = generateDailyDigest;
    window.sendSlackNotification = sendSlackNotification;

    window._auroraNotifications = {
        markAsRead: markAsRead,
        markAllRead: markAllRead,
        clearAll: clearAllNotifications,
        toggleSettings: toggleSettings,
        showDigest: showDigest,
        copyDigest: copyDigest,
        sendDigestToSlack: sendDigestToSlack,
        saveSlackURL: saveSlackURL,
        saveSlackPrefs: saveSlackPrefs,
        sendEmail: sendEmailForNotification
    };

})();

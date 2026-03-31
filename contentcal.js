/**
 * contentcal.js - Content Calendar Planner for Aurora Technologies Tools
 */

var contentCalendarData = [];
var contentCurrentView = 'pipeline';
var contentEditId = null;
var contentFilters = { type: '', status: '', channel: '' };

var CONTENT_TYPES = ['Blog Post', 'Social Media', 'Email Campaign', 'Webinar', 'Case Study', 'Press Release', 'Video', 'Podcast'];
var CONTENT_CHANNELS = ['LinkedIn', 'Twitter', 'Facebook', 'Instagram', 'Website', 'Email', 'YouTube'];
var CONTENT_STATUSES = ['Idea', 'Planned', 'In Progress', 'Review', 'Published'];
var CONTENT_TYPE_COLORS = {
    'Blog Post': '#40E0D0',
    'Social Media': '#6f42c1',
    'Email Campaign': '#fd7e14',
    'Webinar': '#0dcaf0',
    'Case Study': '#28a745',
    'Press Release': '#ffc107',
    'Video': '#dc3545',
    'Podcast': '#e83e8c'
};

function loadContentCalendar() {
    try {
        var stored = localStorage.getItem('aurora-content-calendar');
        if (stored) contentCalendarData = JSON.parse(stored);
    } catch (e) {
        contentCalendarData = [];
    }
}

function saveContentCalendar() {
    localStorage.setItem('aurora-content-calendar', JSON.stringify(contentCalendarData));
}

function generateContentId() {
    return 'cc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
}

function addContentItem() {
    var title = document.getElementById('ccTitle').value.trim();
    if (!title) { alert('Please enter a title.'); return; }

    var item = {
        id: contentEditId || generateContentId(),
        title: title,
        type: document.getElementById('ccType').value,
        channel: document.getElementById('ccChannel').value,
        status: document.getElementById('ccStatus').value,
        publishDate: document.getElementById('ccDate').value,
        author: document.getElementById('ccAuthor').value.trim(),
        notes: document.getElementById('ccNotes').value.trim(),
        tags: document.getElementById('ccTags').value.split(',').map(function (t) { return t.trim(); }).filter(Boolean),
        createdAt: contentEditId ? (contentCalendarData.find(function (c) { return c.id === contentEditId; }) || {}).createdAt || new Date().toISOString() : new Date().toISOString()
    };

    if (contentEditId) {
        var idx = contentCalendarData.findIndex(function (c) { return c.id === contentEditId; });
        if (idx >= 0) contentCalendarData[idx] = item;
        contentEditId = null;
        document.getElementById('ccSubmitBtn').textContent = 'Add Content Item';
    } else {
        contentCalendarData.push(item);
    }

    saveContentCalendar();
    clearContentForm();
    renderContentView();
}

function clearContentForm() {
    document.getElementById('ccTitle').value = '';
    document.getElementById('ccType').value = 'Blog Post';
    document.getElementById('ccChannel').value = 'LinkedIn';
    document.getElementById('ccStatus').value = 'Idea';
    document.getElementById('ccDate').value = '';
    document.getElementById('ccAuthor').value = '';
    document.getElementById('ccNotes').value = '';
    document.getElementById('ccTags').value = '';
    contentEditId = null;
    var btn = document.getElementById('ccSubmitBtn');
    if (btn) btn.textContent = 'Add Content Item';
}

function editContentItem(id) {
    var item = contentCalendarData.find(function (c) { return c.id === id; });
    if (!item) return;
    document.getElementById('ccTitle').value = item.title;
    document.getElementById('ccType').value = item.type;
    document.getElementById('ccChannel').value = item.channel;
    document.getElementById('ccStatus').value = item.status;
    document.getElementById('ccDate').value = item.publishDate || '';
    document.getElementById('ccAuthor').value = item.author || '';
    document.getElementById('ccNotes').value = item.notes || '';
    document.getElementById('ccTags').value = (item.tags || []).join(', ');
    contentEditId = id;
    document.getElementById('ccSubmitBtn').textContent = 'Update Content Item';
    document.getElementById('contentCalendar').scrollIntoView({ behavior: 'smooth' });
}

function deleteContentItem(id) {
    if (!confirm('Delete this content item?')) return;
    contentCalendarData = contentCalendarData.filter(function (c) { return c.id !== id; });
    saveContentCalendar();
    renderContentView();
}

function filterContent() {
    contentFilters.type = document.getElementById('ccFilterType').value;
    contentFilters.status = document.getElementById('ccFilterStatus').value;
    contentFilters.channel = document.getElementById('ccFilterChannel').value;
    renderContentView();
}

function getFilteredContent() {
    return contentCalendarData.filter(function (item) {
        if (contentFilters.type && item.type !== contentFilters.type) return false;
        if (contentFilters.status && item.status !== contentFilters.status) return false;
        if (contentFilters.channel && item.channel !== contentFilters.channel) return false;
        return true;
    });
}

function switchContentView(view) {
    contentCurrentView = view;
    document.querySelectorAll('.cc-view-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-view') === view);
    });
    renderContentView();
}

function renderContentView() {
    var container = document.getElementById('ccViewContainer');
    renderContentStats();
    if (contentCurrentView === 'pipeline') {
        renderPipelineView();
    } else if (contentCurrentView === 'calendar') {
        renderCalendarView();
    } else {
        renderListView();
    }
}

function renderContentStats() {
    var statsEl = document.getElementById('ccStats');
    var total = contentCalendarData.length;
    var today = new Date().toISOString().split('T')[0];
    var weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    var statusCounts = {};
    var upcoming = 0;
    var overdue = 0;
    CONTENT_STATUSES.forEach(function (s) { statusCounts[s] = 0; });
    contentCalendarData.forEach(function (item) {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
        if (item.publishDate && item.publishDate >= today && item.publishDate <= weekFromNow) upcoming++;
        if (item.publishDate && item.publishDate < today && item.status !== 'Published') overdue++;
    });

    var html = '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px;">';
    html += '<span class="content-badge" style="background:#40E0D0;color:#0A0A2A;font-weight:600;">Total: ' + total + '</span>';
    CONTENT_STATUSES.forEach(function (s) {
        html += '<span class="content-badge" style="background:#1a1a3e;border:1px solid #444;">' + s + ': ' + statusCounts[s] + '</span>';
    });
    html += '<span class="content-badge" style="background:#28a745;">Upcoming (7d): ' + upcoming + '</span>';
    if (overdue > 0) html += '<span class="content-badge" style="background:#dc3545;">Overdue: ' + overdue + '</span>';
    html += '</div>';
    statsEl.innerHTML = html;
}

function renderPipelineView() {
    var container = document.getElementById('ccViewContainer');
    var items = getFilteredContent();
    var html = '<div class="content-pipeline">';
    CONTENT_STATUSES.forEach(function (status) {
        var colItems = items.filter(function (i) { return i.status === status; });
        html += '<div class="content-column">';
        html += '<div style="font-weight:600;margin-bottom:10px;color:#40E0D0;font-size:0.95em;">' + status + ' <span style="color:#888;">(' + colItems.length + ')</span></div>';
        colItems.forEach(function (item) {
            html += renderContentCard(item);
        });
        html += '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderContentCard(item) {
    var color = CONTENT_TYPE_COLORS[item.type] || '#888';
    var today = new Date().toISOString().split('T')[0];
    var isOverdue = item.publishDate && item.publishDate < today && item.status !== 'Published';
    var html = '<div class="content-card' + (isOverdue ? ' overdue' : '') + '">';
    html += '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px;">';
    html += '<span class="content-badge" style="background:' + color + ';font-size:0.75em;">' + item.type + '</span>';
    html += '<div style="display:flex;gap:4px;">';
    html += '<button onclick="editContentItem(\'' + item.id + '\')" style="padding:2px 6px;font-size:0.75em;background:#ffc107;color:#000;">Edit</button>';
    html += '<button onclick="deleteContentItem(\'' + item.id + '\')" style="padding:2px 6px;font-size:0.75em;background:#dc3545;">Del</button>';
    html += '</div></div>';
    html += '<div style="font-weight:600;margin-bottom:4px;">' + item.title + '</div>';
    if (item.channel) html += '<div style="font-size:0.8em;color:#888;">' + item.channel + '</div>';
    if (item.publishDate) {
        html += '<div style="font-size:0.8em;color:' + (isOverdue ? '#dc3545' : '#888') + ';">' + item.publishDate + (isOverdue ? ' (Overdue)' : '') + '</div>';
    }
    if (item.author) html += '<div style="font-size:0.8em;color:#888;">By: ' + item.author + '</div>';
    if (item.tags && item.tags.length > 0) {
        html += '<div style="margin-top:4px;">';
        item.tags.forEach(function (tag) {
            html += '<span style="display:inline-block;font-size:0.7em;background:#1a1a3e;border:1px solid #444;border-radius:3px;padding:1px 5px;margin:1px 2px;color:#aaa;">' + tag + '</span>';
        });
        html += '</div>';
    }
    html += '</div>';
    return html;
}

function renderCalendarView() {
    var container = document.getElementById('ccViewContainer');
    var items = getFilteredContent().filter(function (i) { return i.publishDate; });
    items.sort(function (a, b) { return a.publishDate.localeCompare(b.publishDate); });

    // Group by week
    var weeks = {};
    items.forEach(function (item) {
        var d = new Date(item.publishDate + 'T00:00:00');
        var dayOfWeek = d.getDay();
        var weekStart = new Date(d);
        weekStart.setDate(weekStart.getDate() - dayOfWeek);
        var key = weekStart.toISOString().split('T')[0];
        if (!weeks[key]) weeks[key] = [];
        weeks[key].push(item);
    });

    var weekKeys = Object.keys(weeks).sort();
    if (weekKeys.length === 0) {
        container.innerHTML = '<p style="color:#888;">No content items with publish dates. Add dates to see the calendar view.</p>';
        return;
    }

    var html = '';
    weekKeys.forEach(function (weekKey) {
        var weekEnd = new Date(weekKey + 'T00:00:00');
        weekEnd.setDate(weekEnd.getDate() + 6);
        html += '<div class="calendar-week">';
        html += '<div style="font-weight:600;margin-bottom:8px;color:#40E0D0;font-size:0.9em;">Week of ' + weekKey + ' to ' + weekEnd.toISOString().split('T')[0] + '</div>';
        weeks[weekKey].forEach(function (item) {
            var color = CONTENT_TYPE_COLORS[item.type] || '#888';
            html += '<div class="calendar-item">';
            html += '<span class="content-badge" style="background:' + color + ';font-size:0.75em;">' + item.type + '</span> ';
            html += '<strong>' + item.title + '</strong>';
            html += '<span style="color:#888;font-size:0.85em;margin-left:8px;">' + item.publishDate + '</span>';
            html += '<span style="color:#888;font-size:0.85em;margin-left:8px;">' + item.channel + '</span>';
            html += ' <button onclick="editContentItem(\'' + item.id + '\')" style="padding:1px 5px;font-size:0.7em;background:#ffc107;color:#000;margin-left:4px;">Edit</button>';
            html += ' <button onclick="deleteContentItem(\'' + item.id + '\')" style="padding:1px 5px;font-size:0.7em;background:#dc3545;margin-left:2px;">Del</button>';
            html += '</div>';
        });
        html += '</div>';
    });
    container.innerHTML = html;
}

function renderListView() {
    var container = document.getElementById('ccViewContainer');
    var items = getFilteredContent();
    items.sort(function (a, b) { return (a.publishDate || '9999').localeCompare(b.publishDate || '9999'); });

    if (items.length === 0) {
        container.innerHTML = '<p style="color:#888;">No content items match the current filters.</p>';
        return;
    }

    var html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.9em;">';
    html += '<tr style="border-bottom:2px solid #40E0D0;"><th style="text-align:left;padding:8px;">Title</th><th style="padding:8px;">Type</th><th style="padding:8px;">Channel</th><th style="padding:8px;">Status</th><th style="padding:8px;">Date</th><th style="padding:8px;">Author</th><th style="padding:8px;">Actions</th></tr>';
    items.forEach(function (item) {
        var color = CONTENT_TYPE_COLORS[item.type] || '#888';
        var today = new Date().toISOString().split('T')[0];
        var isOverdue = item.publishDate && item.publishDate < today && item.status !== 'Published';
        html += '<tr style="border-bottom:1px solid #333;">';
        html += '<td style="padding:8px;font-weight:600;">' + item.title + '</td>';
        html += '<td style="padding:8px;text-align:center;"><span class="content-badge" style="background:' + color + ';font-size:0.8em;">' + item.type + '</span></td>';
        html += '<td style="padding:8px;text-align:center;">' + item.channel + '</td>';
        html += '<td style="padding:8px;text-align:center;">' + item.status + '</td>';
        html += '<td style="padding:8px;text-align:center;color:' + (isOverdue ? '#dc3545' : 'inherit') + ';">' + (item.publishDate || '-') + (isOverdue ? ' (Overdue)' : '') + '</td>';
        html += '<td style="padding:8px;text-align:center;">' + (item.author || '-') + '</td>';
        html += '<td style="padding:8px;text-align:center;">';
        html += '<button onclick="editContentItem(\'' + item.id + '\')" style="padding:2px 6px;font-size:0.8em;background:#ffc107;color:#000;margin-right:4px;">Edit</button>';
        html += '<button onclick="deleteContentItem(\'' + item.id + '\')" style="padding:2px 6px;font-size:0.8em;background:#dc3545;">Del</button>';
        html += '</td></tr>';
    });
    html += '</table></div>';
    container.innerHTML = html;
}

function exportContentCSV() {
    var headers = ['Title', 'Type', 'Channel', 'Status', 'Publish Date', 'Author', 'Notes', 'Tags'];
    var rows = contentCalendarData.map(function (item) {
        return [item.title, item.type, item.channel, item.status, item.publishDate || '', item.author || '', item.notes || '', (item.tags || []).join('; ')];
    });
    exportToCSV('content-calendar.csv', headers, rows);
}

document.addEventListener('DOMContentLoaded', function () {
    loadContentCalendar();
    renderContentView();
});

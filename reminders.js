// Recurring Assessment Reminders
// localStorage key: 'aurora-reminders'

function getReminders() {
    try {
        return JSON.parse(localStorage.getItem('aurora-reminders')) || [];
    } catch (e) {
        return [];
    }
}

function saveReminders(reminders) {
    localStorage.setItem('aurora-reminders', JSON.stringify(reminders));
}

function calculateNextDue(startDate, frequency, completions) {
    var start = new Date(startDate);
    if (isNaN(start.getTime())) return null;

    var completionCount = (completions && completions.length) ? completions.length : 0;
    var months = 0;

    switch (frequency) {
        case 'Monthly': months = 1; break;
        case 'Quarterly': months = 3; break;
        case 'Semi-Annual': months = 6; break;
        case 'Annual': months = 12; break;
        default: months = 3;
    }

    // If there are completions, calculate from the last completion date
    var baseDate;
    if (completionCount > 0) {
        baseDate = new Date(completions[completions.length - 1]);
    } else {
        baseDate = new Date(startDate);
    }

    var nextDue = new Date(baseDate);
    if (completionCount > 0) {
        // From last completion, add one frequency period
        nextDue.setMonth(nextDue.getMonth() + months);
    } else {
        // From start date, if start date is in the past, advance until future
        var now = new Date();
        now.setHours(0, 0, 0, 0);
        while (nextDue < now) {
            nextDue.setMonth(nextDue.getMonth() + months);
        }
        // Actually, for first reminder, the first due date is the start date itself
        // Reset and just use start date
        nextDue = new Date(startDate);
    }

    return nextDue;
}

function getReminderStatus(nextDue) {
    if (!nextDue) return { label: 'Unknown', color: '#6c757d' };
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var due = new Date(nextDue);
    due.setHours(0, 0, 0, 0);
    var diff = due.getTime() - now.getTime();
    var days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) {
        return { label: 'Overdue', color: '#dc3545' };
    } else if (days <= 7) {
        return { label: 'Due Soon', color: '#ffc107' };
    } else {
        return { label: 'Upcoming', color: '#28a745' };
    }
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function addReminder() {
    var clientName = document.getElementById('reminderClientName').value.trim();
    var company = document.getElementById('reminderCompany').value.trim();
    var email = document.getElementById('reminderEmail').value.trim();
    var type = document.getElementById('reminderType').value;
    var frequency = document.getElementById('reminderFrequency').value;
    var startDate = document.getElementById('reminderStartDate').value;
    var notes = document.getElementById('reminderNotes').value.trim();

    if (!clientName) {
        alert('Client name is required.');
        return;
    }
    if (!company) {
        alert('Company is required.');
        return;
    }
    if (!startDate) {
        alert('Start date is required.');
        return;
    }

    var reminder = {
        id: Date.now(),
        clientName: clientName,
        company: company,
        email: email,
        type: type,
        frequency: frequency,
        startDate: startDate,
        notes: notes,
        completions: []
    };

    var reminders = getReminders();
    reminders.push(reminder);
    saveReminders(reminders);

    // Clear form
    document.getElementById('reminderClientName').value = '';
    document.getElementById('reminderCompany').value = '';
    document.getElementById('reminderEmail').value = '';
    document.getElementById('reminderType').value = 'SMB Assessment';
    document.getElementById('reminderFrequency').value = 'Quarterly';
    document.getElementById('reminderStartDate').value = '';
    document.getElementById('reminderNotes').value = '';

    renderReminders();
}

function markComplete(id) {
    var reminders = getReminders();
    for (var i = 0; i < reminders.length; i++) {
        if (reminders[i].id === id) {
            if (!reminders[i].completions) {
                reminders[i].completions = [];
            }
            reminders[i].completions.push(new Date().toISOString().split('T')[0]);
            break;
        }
    }
    saveReminders(reminders);
    renderReminders();
}

function deleteReminder(id) {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    var reminders = getReminders();
    reminders = reminders.filter(function (r) { return r.id !== id; });
    saveReminders(reminders);
    renderReminders();
}

function sendReminder(id) {
    var reminders = getReminders();
    var reminder = null;
    for (var i = 0; i < reminders.length; i++) {
        if (reminders[i].id === id) {
            reminder = reminders[i];
            break;
        }
    }
    if (!reminder) {
        alert('Reminder not found.');
        return;
    }

    var nextDue = calculateNextDue(reminder.startDate, reminder.frequency, reminder.completions);
    var emailText = 'Subject: Upcoming ' + reminder.type + ' - ' + reminder.company + '\n\n';
    emailText += 'Dear ' + reminder.clientName + ',\n\n';
    emailText += 'This is a friendly reminder that your ' + reminder.type + ' with Aurora Technologies is scheduled for ' + formatDate(nextDue) + '.\n\n';
    emailText += 'As part of our ' + reminder.frequency.toLowerCase() + ' review cycle, this assessment will help us evaluate progress and identify new opportunities for ' + reminder.company + '.\n\n';
    if (reminder.notes) {
        emailText += 'Notes: ' + reminder.notes + '\n\n';
    }
    emailText += 'Please let us know if this date works for you, or if you would like to reschedule.\n\n';
    emailText += 'Best regards,\nAurora Technologies Team';

    navigator.clipboard.writeText(emailText).then(function () {
        alert('Reminder email text copied to clipboard.');
    }).catch(function () {
        // Fallback
        var ta = document.createElement('textarea');
        ta.value = emailText;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            alert('Reminder email text copied to clipboard.');
        } catch (e) {
            alert('Failed to copy. Please copy manually:\n\n' + emailText);
        }
        document.body.removeChild(ta);
    });
}

function renderReminders() {
    var reminders = getReminders();
    var summaryEl = document.getElementById('remindersSummary');
    var resultEl = document.getElementById('remindersResult');

    if (!resultEl) return;

    // Calculate summary
    var totalActive = 0;
    var overdueCount = 0;
    var dueSoonCount = 0;
    var now = new Date();
    now.setHours(0, 0, 0, 0);

    var rows = [];
    reminders.forEach(function (r) {
        var nextDue = calculateNextDue(r.startDate, r.frequency, r.completions);
        var status = getReminderStatus(nextDue);
        totalActive++;
        if (status.label === 'Overdue') overdueCount++;
        if (status.label === 'Due Soon') dueSoonCount++;
        rows.push({ reminder: r, nextDue: nextDue, status: status });
    });

    // Render summary
    if (summaryEl) {
        summaryEl.innerHTML =
            '<div style="flex:1;min-width:140px;background:#f8f9fa;border-radius:8px;padding:12px;text-align:center;">' +
                '<div style="font-size:24px;font-weight:bold;color:#0A0A2A;">' + totalActive + '</div>' +
                '<div style="font-size:13px;color:#666;">Active Reminders</div>' +
            '</div>' +
            '<div style="flex:1;min-width:140px;background:#fff3f3;border-radius:8px;padding:12px;text-align:center;">' +
                '<div style="font-size:24px;font-weight:bold;color:#dc3545;">' + overdueCount + '</div>' +
                '<div style="font-size:13px;color:#666;">Overdue</div>' +
            '</div>' +
            '<div style="flex:1;min-width:140px;background:#fff8e1;border-radius:8px;padding:12px;text-align:center;">' +
                '<div style="font-size:24px;font-weight:bold;color:#ffc107;">' + dueSoonCount + '</div>' +
                '<div style="font-size:13px;color:#666;">Due This Week</div>' +
            '</div>';
    }

    if (reminders.length === 0) {
        resultEl.innerHTML = '<p style="color:#666;font-style:italic;">No reminders yet. Add one above to get started.</p>';
        return;
    }

    // Sort: overdue first, then due soon, then upcoming
    var statusOrder = { 'Overdue': 0, 'Due Soon': 1, 'Upcoming': 2, 'Unknown': 3 };
    rows.sort(function (a, b) {
        return (statusOrder[a.status.label] || 3) - (statusOrder[b.status.label] || 3);
    });

    var html = '<div style="overflow-x:auto;">';
    html += '<table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:14px;">';
    html += '<thead><tr style="background:#0A0A2A;color:white;">';
    html += '<th style="padding:10px;text-align:left;">Client</th>';
    html += '<th style="padding:10px;text-align:left;">Company</th>';
    html += '<th style="padding:10px;text-align:left;">Type</th>';
    html += '<th style="padding:10px;text-align:left;">Frequency</th>';
    html += '<th style="padding:10px;text-align:left;">Next Due</th>';
    html += '<th style="padding:10px;text-align:left;">Status</th>';
    html += '<th style="padding:10px;text-align:center;">Actions</th>';
    html += '</tr></thead><tbody>';

    rows.forEach(function (row) {
        var r = row.reminder;
        var statusBadge = '<span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:bold;color:white;background:' + row.status.color + ';">' + row.status.label + '</span>';

        html += '<tr style="border-bottom:1px solid #eee;">';
        html += '<td style="padding:10px;">' + escapeHtmlReminder(r.clientName) + '</td>';
        html += '<td style="padding:10px;">' + escapeHtmlReminder(r.company) + '</td>';
        html += '<td style="padding:10px;">' + escapeHtmlReminder(r.type) + '</td>';
        html += '<td style="padding:10px;">' + escapeHtmlReminder(r.frequency) + '</td>';
        html += '<td style="padding:10px;">' + formatDate(row.nextDue) + '</td>';
        html += '<td style="padding:10px;">' + statusBadge + '</td>';
        html += '<td style="padding:10px;text-align:center;">';
        html += '<button onclick="markComplete(' + r.id + ')" style="padding:4px 8px;font-size:12px;margin:2px;background:#28a745;">Complete</button> ';
        html += '<button onclick="sendReminder(' + r.id + ')" style="padding:4px 8px;font-size:12px;margin:2px;background:#40E0D0;">Send</button> ';
        html += '<button onclick="deleteReminder(' + r.id + ')" style="padding:4px 8px;font-size:12px;margin:2px;background:#dc3545;">Delete</button>';
        html += '</td>';
        html += '</tr>';
    });

    html += '</tbody></table></div>';
    resultEl.innerHTML = html;
}

function escapeHtmlReminder(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text || ''));
    return div.innerHTML;
}

function exportReminders() {
    var reminders = getReminders();
    if (reminders.length === 0) {
        alert('No reminders to export.');
        return;
    }

    var csv = 'Client Name,Company,Email,Assessment Type,Frequency,Start Date,Next Due,Status,Completions,Notes\n';
    reminders.forEach(function (r) {
        var nextDue = calculateNextDue(r.startDate, r.frequency, r.completions);
        var status = getReminderStatus(nextDue);
        var completionDates = (r.completions || []).join('; ');
        csv += '"' + (r.clientName || '').replace(/"/g, '""') + '",';
        csv += '"' + (r.company || '').replace(/"/g, '""') + '",';
        csv += '"' + (r.email || '').replace(/"/g, '""') + '",';
        csv += '"' + (r.type || '').replace(/"/g, '""') + '",';
        csv += '"' + (r.frequency || '').replace(/"/g, '""') + '",';
        csv += '"' + (r.startDate || '') + '",';
        csv += '"' + formatDate(nextDue) + '",';
        csv += '"' + status.label + '",';
        csv += '"' + completionDates + '",';
        csv += '"' + (r.notes || '').replace(/"/g, '""') + '"\n';
    });

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'aurora-reminders.csv';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Render on load
if (document.getElementById('remindersResult')) {
    renderReminders();
}

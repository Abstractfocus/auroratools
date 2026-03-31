// Invoice Generator
// localStorage keys: 'aurora-invoices', 'aurora-invoice-counter'

var invoiceLineItems = [];

function getInvoiceCounter() {
    return parseInt(localStorage.getItem('aurora-invoice-counter') || '0', 10);
}

function setInvoiceCounter(val) {
    localStorage.setItem('aurora-invoice-counter', String(val));
}

function generateInvoiceNumber() {
    var counter = getInvoiceCounter() + 1;
    setInvoiceCounter(counter);
    var year = new Date().getFullYear();
    var padded = String(counter).padStart(3, '0');
    return 'INV-' + year + '-' + padded;
}

function getInvoices() {
    try {
        return JSON.parse(localStorage.getItem('aurora-invoices')) || [];
    } catch (e) {
        return [];
    }
}

function saveInvoices(invoices) {
    localStorage.setItem('aurora-invoices', JSON.stringify(invoices));
}

function escInv(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function populateClientDropdown() {
    var select = document.getElementById('invClientSelect');
    if (!select) return;
    var clients = [];
    try {
        clients = JSON.parse(localStorage.getItem('aurora-crm-clients')) || [];
    } catch (e) {
        clients = [];
    }
    var html = '<option value="">-- Select Client or Enter Manually --</option>';
    clients.forEach(function (c) {
        html += '<option value="' + c.id + '">' + escInv(c.name) + ' (' + escInv(c.company) + ')</option>';
    });
    select.innerHTML = html;
}

function onClientSelectChange() {
    var select = document.getElementById('invClientSelect');
    var manual = document.getElementById('invManualFields');
    var val = select.value;
    if (!val) {
        manual.style.display = 'block';
        document.getElementById('invClientName').value = '';
        document.getElementById('invClientCompany').value = '';
        document.getElementById('invClientEmail').value = '';
        document.getElementById('invClientAddress').value = '';
        return;
    }
    manual.style.display = 'none';
    var clients = [];
    try {
        clients = JSON.parse(localStorage.getItem('aurora-crm-clients')) || [];
    } catch (e) { clients = []; }
    var client = null;
    for (var i = 0; i < clients.length; i++) {
        if (String(clients[i].id) === String(val)) { client = clients[i]; break; }
    }
    if (client) {
        document.getElementById('invClientName').value = client.name || '';
        document.getElementById('invClientCompany').value = client.company || '';
        document.getElementById('invClientEmail').value = client.email || '';
        document.getElementById('invClientAddress').value = '';
    }
}

function addLineItem() {
    invoiceLineItems.push({ description: '', quantity: 1, rate: 0 });
    renderLineItems();
}

function removeLineItem(idx) {
    invoiceLineItems.splice(idx, 1);
    renderLineItems();
}

function renderLineItems() {
    var container = document.getElementById('invLineItems');
    if (!container) return;
    var html = '';
    invoiceLineItems.forEach(function (item, idx) {
        var amount = (item.quantity * item.rate).toFixed(2);
        html += '<div class="inv-line-item" data-idx="' + idx + '">';
        html += '<input type="text" class="inv-li-desc" placeholder="Description" value="' + escInv(item.description) + '" onchange="updateLineItem(' + idx + ', \'description\', this.value)">';
        html += '<input type="number" class="inv-li-qty" placeholder="Qty/Hours" value="' + item.quantity + '" min="0" step="any" onchange="updateLineItem(' + idx + ', \'quantity\', this.value)">';
        html += '<input type="number" class="inv-li-rate" placeholder="Rate" value="' + item.rate + '" min="0" step="any" onchange="updateLineItem(' + idx + ', \'rate\', this.value)">';
        html += '<span class="inv-li-amount">$' + amount + '</span>';
        html += '<button type="button" class="inv-li-remove" onclick="removeLineItem(' + idx + ')">X</button>';
        html += '</div>';
    });
    container.innerHTML = html;
}

function updateLineItem(idx, field, value) {
    if (!invoiceLineItems[idx]) return;
    if (field === 'description') {
        invoiceLineItems[idx].description = value;
    } else {
        invoiceLineItems[idx][field] = parseFloat(value) || 0;
    }
    renderLineItems();
}

function generateInvoice() {
    var clientName = document.getElementById('invClientName').value.trim();
    var clientCompany = document.getElementById('invClientCompany').value.trim();
    var clientEmail = document.getElementById('invClientEmail').value.trim();
    var clientAddress = document.getElementById('invClientAddress').value.trim();
    var invoiceNumber = document.getElementById('invNumber').value.trim();
    var invoiceDate = document.getElementById('invDate').value;
    var dueDate = document.getElementById('invDueDate').value;
    var billingType = document.getElementById('invBillingType').value;
    var taxRate = parseFloat(document.getElementById('invTaxRate').value) || 0;
    var notes = document.getElementById('invNotes').value.trim();
    var paymentTerms = document.getElementById('invPaymentTerms').value.trim();

    if (!clientName) {
        alert('Client name is required.');
        return;
    }
    if (invoiceLineItems.length === 0) {
        alert('Add at least one line item.');
        return;
    }

    var subtotal = 0;
    invoiceLineItems.forEach(function (item) {
        subtotal += item.quantity * item.rate;
    });
    var taxAmount = subtotal * (taxRate / 100);
    var total = subtotal + taxAmount;

    var qtyLabel = billingType === 'Hourly' ? 'Hours' : 'Qty';

    var preview = document.getElementById('invPreview');
    var html = '<div class="invoice-preview">';
    html += '<div class="invoice-header">';
    html += '<div class="invoice-brand"><h2>Aurora Technologies</h2><p>Consulting Services</p></div>';
    html += '<div class="invoice-meta">';
    html += '<h3>INVOICE</h3>';
    html += '<p><strong>' + escInv(invoiceNumber) + '</strong></p>';
    html += '<p>Date: ' + escInv(invoiceDate) + '</p>';
    html += '<p>Due: ' + escInv(dueDate) + '</p>';
    html += '<p>Type: ' + escInv(billingType) + '</p>';
    html += '</div></div>';

    html += '<div class="invoice-client-info">';
    html += '<p><strong>Bill To:</strong></p>';
    html += '<p>' + escInv(clientName) + '</p>';
    if (clientCompany) html += '<p>' + escInv(clientCompany) + '</p>';
    if (clientEmail) html += '<p>' + escInv(clientEmail) + '</p>';
    if (clientAddress) html += '<p>' + escInv(clientAddress).replace(/\n/g, '<br>') + '</p>';
    html += '</div>';

    html += '<table class="invoice-table">';
    html += '<thead><tr><th>Description</th><th>' + qtyLabel + '</th><th>Rate</th><th>Amount</th></tr></thead>';
    html += '<tbody>';
    invoiceLineItems.forEach(function (item) {
        var amt = (item.quantity * item.rate).toFixed(2);
        html += '<tr><td>' + escInv(item.description) + '</td><td>' + item.quantity + '</td><td>$' + item.rate.toFixed(2) + '</td><td>$' + amt + '</td></tr>';
    });
    html += '</tbody></table>';

    html += '<div class="invoice-total">';
    html += '<div class="invoice-total-row"><span>Subtotal:</span><span>$' + subtotal.toFixed(2) + '</span></div>';
    html += '<div class="invoice-total-row"><span>Tax (' + taxRate + '%):</span><span>$' + taxAmount.toFixed(2) + '</span></div>';
    html += '<div class="invoice-total-row invoice-grand-total"><span>Total:</span><span>$' + total.toFixed(2) + '</span></div>';
    html += '</div>';

    if (paymentTerms) {
        html += '<div class="invoice-terms"><p><strong>Payment Terms:</strong> ' + escInv(paymentTerms) + '</p></div>';
    }
    if (notes) {
        html += '<div class="invoice-notes"><p><strong>Notes:</strong> ' + escInv(notes) + '</p></div>';
    }

    html += '<div class="invoice-actions">';
    html += '<button onclick="printInvoice()">Print Invoice</button> ';
    html += '<button onclick="copyInvoiceText()">Copy as Text</button> ';
    html += '<button onclick="saveInvoice()">Save Invoice</button>';
    html += '</div>';
    html += '</div>';

    preview.innerHTML = html;

    // Store current invoice data for saving
    window._currentInvoice = {
        id: Date.now(),
        invoiceNumber: invoiceNumber,
        invoiceDate: invoiceDate,
        dueDate: dueDate,
        billingType: billingType,
        clientName: clientName,
        clientCompany: clientCompany,
        clientEmail: clientEmail,
        clientAddress: clientAddress,
        lineItems: JSON.parse(JSON.stringify(invoiceLineItems)),
        taxRate: taxRate,
        subtotal: subtotal,
        taxAmount: taxAmount,
        total: total,
        notes: notes,
        paymentTerms: paymentTerms,
        status: 'Draft'
    };
}

function printInvoice() {
    window.print();
}

function copyInvoiceText() {
    var inv = window._currentInvoice;
    if (!inv) { alert('Generate an invoice first.'); return; }
    var qtyLabel = inv.billingType === 'Hourly' ? 'Hours' : 'Qty';
    var text = 'INVOICE\n';
    text += 'Aurora Technologies - Consulting Services\n\n';
    text += 'Invoice #: ' + inv.invoiceNumber + '\n';
    text += 'Date: ' + inv.invoiceDate + '\n';
    text += 'Due: ' + inv.dueDate + '\n';
    text += 'Type: ' + inv.billingType + '\n\n';
    text += 'Bill To:\n';
    text += inv.clientName + '\n';
    if (inv.clientCompany) text += inv.clientCompany + '\n';
    if (inv.clientEmail) text += inv.clientEmail + '\n';
    if (inv.clientAddress) text += inv.clientAddress + '\n';
    text += '\n';
    text += 'Description | ' + qtyLabel + ' | Rate | Amount\n';
    text += '--------------------------------------------\n';
    inv.lineItems.forEach(function (item) {
        text += item.description + ' | ' + item.quantity + ' | $' + item.rate.toFixed(2) + ' | $' + (item.quantity * item.rate).toFixed(2) + '\n';
    });
    text += '\nSubtotal: $' + inv.subtotal.toFixed(2) + '\n';
    text += 'Tax (' + inv.taxRate + '%): $' + inv.taxAmount.toFixed(2) + '\n';
    text += 'Total: $' + inv.total.toFixed(2) + '\n';
    if (inv.paymentTerms) text += '\nPayment Terms: ' + inv.paymentTerms + '\n';
    if (inv.notes) text += 'Notes: ' + inv.notes + '\n';

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
            alert('Invoice copied to clipboard.');
        });
    } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        alert('Invoice copied to clipboard.');
    }
}

function saveInvoice() {
    var inv = window._currentInvoice;
    if (!inv) { alert('Generate an invoice first.'); return; }
    var invoices = getInvoices();
    // Check for duplicate by invoice number
    var exists = false;
    for (var i = 0; i < invoices.length; i++) {
        if (invoices[i].invoiceNumber === inv.invoiceNumber) {
            invoices[i] = inv;
            exists = true;
            break;
        }
    }
    if (!exists) {
        invoices.push(inv);
    }
    saveInvoices(invoices);
    loadInvoices();
    alert('Invoice saved.');
}

function loadInvoices() {
    var invoices = getInvoices();
    var container = document.getElementById('invSavedList');
    if (!container) return;
    if (invoices.length === 0) {
        container.innerHTML = '<p>No saved invoices.</p>';
        return;
    }
    var html = '<h3>Saved Invoices</h3>';
    html += '<table class="invoice-table invoice-list-table">';
    html += '<thead><tr><th>Invoice #</th><th>Client</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>';
    html += '<tbody>';
    invoices.forEach(function (inv) {
        var statusClass = 'inv-status-' + (inv.status || 'Draft').toLowerCase();
        html += '<tr>';
        html += '<td>' + escInv(inv.invoiceNumber) + '</td>';
        html += '<td>' + escInv(inv.clientName) + '</td>';
        html += '<td>' + escInv(inv.invoiceDate) + '</td>';
        html += '<td>$' + (inv.total || 0).toFixed(2) + '</td>';
        html += '<td><span class="inv-status-badge ' + statusClass + '">' + escInv(inv.status || 'Draft') + '</span></td>';
        html += '<td>';
        html += '<button class="inv-action-btn" onclick="markInvoiceStatus(\'' + escInv(inv.invoiceNumber) + '\', \'Sent\')">Sent</button> ';
        html += '<button class="inv-action-btn" onclick="markInvoiceStatus(\'' + escInv(inv.invoiceNumber) + '\', \'Paid\')">Paid</button> ';
        html += '<button class="inv-action-btn" onclick="markInvoiceStatus(\'' + escInv(inv.invoiceNumber) + '\', \'Overdue\')">Overdue</button>';
        html += '</td>';
        html += '</tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

function markInvoiceStatus(invoiceNumber, status) {
    var invoices = getInvoices();
    for (var i = 0; i < invoices.length; i++) {
        if (invoices[i].invoiceNumber === invoiceNumber) {
            invoices[i].status = status;
            break;
        }
    }
    saveInvoices(invoices);
    loadInvoices();
}

// Initialize
(function () {
    // Set default dates
    var today = new Date();
    var todayStr = today.toISOString().split('T')[0];
    var due = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    var dueStr = due.toISOString().split('T')[0];

    var dateInput = document.getElementById('invDate');
    var dueDateInput = document.getElementById('invDueDate');
    var numberInput = document.getElementById('invNumber');

    if (dateInput) dateInput.value = todayStr;
    if (dueDateInput) dueDateInput.value = dueStr;

    // Auto-generate invoice number
    if (numberInput) {
        var counter = getInvoiceCounter() + 1;
        var year = today.getFullYear();
        numberInput.value = 'INV-' + year + '-' + String(counter).padStart(3, '0');
    }

    // Add one default line item
    invoiceLineItems = [{ description: '', quantity: 1, rate: 0 }];
    renderLineItems();

    populateClientDropdown();
    loadInvoices();

    var clientSelect = document.getElementById('invClientSelect');
    if (clientSelect) clientSelect.addEventListener('change', onClientSelectChange);
})();

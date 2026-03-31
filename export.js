window.exportToCSV = function(filename, headers, rows) {
    var csvContent = headers.join(',') + '\n';
    rows.forEach(function(row) {
        var escaped = row.map(function(cell) {
            var str = String(cell);
            if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        });
        csvContent += escaped.join(',') + '\n';
    });
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.exportToPrint = function() {
    window.print();
};

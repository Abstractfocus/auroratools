/**
 * charts.js - Pure CSS/SVG chart helpers for Aurora Technologies Tools
 * No external dependencies. Returns inline SVG strings.
 */

function createBarChart(data, options = {}) {
    const width = options.width || 400;
    const barHeight = options.barHeight || 28;
    const barGap = 8;
    const labelWidth = 140;
    const valueWidth = 50;
    const chartLeft = labelWidth + 8;
    const chartRight = width - valueWidth;
    const barAreaWidth = chartRight - chartLeft;
    const titleHeight = options.title ? 32 : 0;
    const height = options.height || (titleHeight + data.length * (barHeight + barGap) + barGap);

    const defaultColors = ['#40E0D0', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#0A0A2A'];

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="width:100%;max-width:${width}px;font-family:Arial,sans-serif;">`;

    if (options.title) {
        svg += `<text x="${width / 2}" y="22" text-anchor="middle" font-size="14" font-weight="bold" fill="#ccc">${options.title}</text>`;
    }

    data.forEach((item, i) => {
        const y = titleHeight + barGap + i * (barHeight + barGap);
        const maxVal = item.maxValue || Math.max(...data.map(d => d.value));
        const barWidth = maxVal > 0 ? (item.value / maxVal) * barAreaWidth : 0;
        const color = item.color || defaultColors[i % defaultColors.length];

        // Label
        svg += `<text x="${labelWidth}" y="${y + barHeight / 2 + 5}" text-anchor="end" font-size="12" fill="#ccc">${item.label}</text>`;

        // Background track
        svg += `<rect x="${chartLeft}" y="${y}" width="${barAreaWidth}" height="${barHeight}" rx="4" fill="#1a1a3e" opacity="0.5"/>`;

        // Filled bar
        svg += `<rect x="${chartLeft}" y="${y}" width="${Math.max(barWidth, 0)}" height="${barHeight}" rx="4" fill="${color}" opacity="0.85">`;
        svg += `<animate attributeName="width" from="0" to="${Math.max(barWidth, 0)}" dur="0.6s" fill="freeze"/></rect>`;

        // Value text
        const displayValue = typeof item.displayValue !== 'undefined' ? item.displayValue : item.value;
        svg += `<text x="${chartRight + 8}" y="${y + barHeight / 2 + 5}" font-size="12" fill="#ccc">${displayValue}</text>`;
    });

    svg += '</svg>';
    return svg;
}

function createDonutChart(data, options = {}) {
    const size = options.size || 200;
    const cx = size / 2;
    const cy = size / 2;
    const outerRadius = size / 2 - 8;
    const innerRadius = outerRadius * 0.6;
    const total = data.reduce((sum, d) => sum + d.value, 0);

    const defaultColors = ['#40E0D0', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#0A0A2A'];

    const legendItemHeight = 22;
    const legendWidth = 180;
    const titleHeight = options.title ? 30 : 0;
    const legendHeight = data.length * legendItemHeight + 8;
    const totalWidth = size + legendWidth + 20;
    const totalHeight = Math.max(size, legendHeight) + titleHeight;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" style="width:100%;max-width:${totalWidth}px;font-family:Arial,sans-serif;">`;

    if (options.title) {
        svg += `<text x="${totalWidth / 2}" y="22" text-anchor="middle" font-size="14" font-weight="bold" fill="#ccc">${options.title}</text>`;
    }

    // Draw donut segments
    let currentAngle = -Math.PI / 2; // start at top

    if (total === 0) {
        svg += `<circle cx="${cx}" cy="${cy + titleHeight}" r="${outerRadius}" fill="#1a1a3e" opacity="0.5"/>`;
        svg += `<circle cx="${cx}" cy="${cy + titleHeight}" r="${innerRadius}" fill="#0d0d2b"/>`;
    } else {
        data.forEach((item, i) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            const color = item.color || defaultColors[i % defaultColors.length];

            if (sliceAngle <= 0) return;

            const startX = cx + outerRadius * Math.cos(currentAngle);
            const startY = cy + titleHeight + outerRadius * Math.sin(currentAngle);
            const endAngle = currentAngle + sliceAngle;
            const endX = cx + outerRadius * Math.cos(endAngle);
            const endY = cy + titleHeight + outerRadius * Math.sin(endAngle);

            const innerStartX = cx + innerRadius * Math.cos(endAngle);
            const innerStartY = cy + titleHeight + innerRadius * Math.sin(endAngle);
            const innerEndX = cx + innerRadius * Math.cos(currentAngle);
            const innerEndY = cy + titleHeight + innerRadius * Math.sin(currentAngle);

            const largeArc = sliceAngle > Math.PI ? 1 : 0;

            // Handle full circle case (single item = 100%)
            if (data.length === 1 || Math.abs(sliceAngle - 2 * Math.PI) < 0.001) {
                svg += `<circle cx="${cx}" cy="${cy + titleHeight}" r="${outerRadius}" fill="${color}" opacity="0.85"/>`;
                svg += `<circle cx="${cx}" cy="${cy + titleHeight}" r="${innerRadius}" fill="#0d0d2b"/>`;
            } else {
                const path = [
                    `M ${startX} ${startY}`,
                    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${endX} ${endY}`,
                    `L ${innerStartX} ${innerStartY}`,
                    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEndX} ${innerEndY}`,
                    'Z'
                ].join(' ');

                svg += `<path d="${path}" fill="${color}" opacity="0.85" stroke="#0d0d2b" stroke-width="1.5"/>`;
            }

            currentAngle = endAngle;
        });

        // Inner circle (fill center for non-single-item)
        if (data.length > 1) {
            svg += `<circle cx="${cx}" cy="${cy + titleHeight}" r="${innerRadius}" fill="#0d0d2b"/>`;
        }
    }

    // Center total text
    svg += `<text x="${cx}" y="${cy + titleHeight - 4}" text-anchor="middle" font-size="11" fill="#888">Total</text>`;
    const totalDisplay = total >= 1000 ? '$' + total.toLocaleString() : total;
    svg += `<text x="${cx}" y="${cy + titleHeight + 14}" text-anchor="middle" font-size="13" font-weight="bold" fill="#ccc">${totalDisplay}</text>`;

    // Legend
    const legendX = size + 20;
    const legendTop = titleHeight + (Math.max(size, legendHeight) - legendHeight) / 2;

    data.forEach((item, i) => {
        const ly = legendTop + i * legendItemHeight + legendItemHeight / 2;
        const color = item.color || defaultColors[i % defaultColors.length];
        const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';

        svg += `<rect x="${legendX}" y="${ly - 6}" width="12" height="12" rx="2" fill="${color}" opacity="0.85"/>`;
        svg += `<text x="${legendX + 18}" y="${ly + 4}" font-size="11" fill="#ccc">${item.label} (${pct}%)</text>`;
    });

    svg += '</svg>';
    return svg;
}

const industryAverages = {
  Technology: { revenue: 5000000, employees: 150, satisfaction: 7.2, marketShare: 8.5 },
  Healthcare: { revenue: 8000000, employees: 300, satisfaction: 7.0, marketShare: 6.0 },
  Finance: { revenue: 12000000, employees: 250, satisfaction: 6.8, marketShare: 7.0 },
  Retail: { revenue: 3000000, employees: 200, satisfaction: 7.5, marketShare: 5.5 },
  Manufacturing: { revenue: 10000000, employees: 400, satisfaction: 6.5, marketShare: 9.0 },
  Other: { revenue: 5000000, employees: 200, satisfaction: 7.0, marketShare: 6.5 }
};

export function compareBenchmarks(industry, revenue, employees, satisfaction, marketShare) {
  const averages = industryAverages[industry];

  const metrics = [
    { name: "Annual Revenue", userVal: revenue, avgVal: averages.revenue, format: "currency" },
    { name: "Number of Employees", userVal: employees, avgVal: averages.employees, format: "number" },
    { name: "Customer Satisfaction", userVal: satisfaction, avgVal: averages.satisfaction, format: "decimal" },
    { name: "Market Share", userVal: marketShare, avgVal: averages.marketShare, format: "percent" }
  ];

  const comparisons = metrics.map(m => {
    const ratio = m.userVal / m.avgVal;
    let label, labelClass;
    if (ratio >= 1.1) {
      label = "Above Average";
      labelClass = "bench-above";
    } else if (ratio >= 0.9) {
      label = "Average";
      labelClass = "bench-average";
    } else {
      label = "Below Average";
      labelClass = "bench-below";
    }

    let userDisplay, avgDisplay;
    if (m.format === "currency") {
      userDisplay = '$' + m.userVal.toLocaleString();
      avgDisplay = '$' + m.avgVal.toLocaleString();
    } else if (m.format === "percent") {
      userDisplay = m.userVal.toFixed(1) + '%';
      avgDisplay = m.avgVal.toFixed(1) + '%';
    } else if (m.format === "decimal") {
      userDisplay = m.userVal.toFixed(1);
      avgDisplay = m.avgVal.toFixed(1);
    } else {
      userDisplay = m.userVal.toLocaleString();
      avgDisplay = m.avgVal.toLocaleString();
    }

    return { name: m.name, userDisplay, avgDisplay, label, labelClass };
  });

  return comparisons;
}

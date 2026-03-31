export function assessRisks(risks) {
  const assessed = risks.map(r => {
    const score = r.likelihood * r.impact;
    let category, categoryClass;
    if (score >= 20) {
      category = "Critical";
      categoryClass = "risk-critical";
    } else if (score >= 12) {
      category = "High";
      categoryClass = "risk-high";
    } else if (score >= 6) {
      category = "Medium";
      categoryClass = "risk-medium";
    } else {
      category = "Low";
      categoryClass = "risk-low";
    }
    return { ...r, score, category, categoryClass };
  });

  assessed.sort((a, b) => b.score - a.score);

  return assessed;
}

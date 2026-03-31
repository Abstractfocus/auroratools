export function calculateBudgetValues(totalBudget, allocations) {
  const categories = allocations.map(a => ({
    name: a.name,
    pct: a.pct,
    amount: totalBudget * (a.pct / 100)
  }));

  const totalPct = categories.reduce((sum, c) => sum + c.pct, 0);

  let warning = '';
  if (Math.abs(totalPct - 100) > 0.01) {
    warning = `Allocations sum to ${totalPct.toFixed(1)}%, not 100%.`;
  }

  return { categories, totalPct, warning };
}

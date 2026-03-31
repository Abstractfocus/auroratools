export function calculateROI(revenue, employees, duration) {
  const revenueIncrease = 0.15;
  const costReduction = 0.10;
  const productivityIncrease = 0.20;

  const additionalRevenue = revenue * revenueIncrease;
  const costSavings = revenue * 0.7 * costReduction;
  const productivityGain = (employees * 50000 * productivityIncrease) / 2;

  const totalBenefit = (additionalRevenue + costSavings + productivityGain) * (duration / 12);
  const estimatedFees = 50000 + (revenue * 0.01) + (employees * 1000);
  const roi = ((totalBenefit - estimatedFees) / estimatedFees) * 100;

  return { additionalRevenue, costSavings, productivityGain, totalBenefit, estimatedFees, roi };
}

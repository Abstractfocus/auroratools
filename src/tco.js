export function calculateTCOValues(software, hardware, implementation, training, maintenance, years) {
  const upfrontCosts = software + hardware + implementation + training;
  const ongoingCosts = maintenance * years;
  const totalTCO = upfrontCosts + ongoingCosts;
  const annualizedCost = totalTCO / years;
  const monthlyCost = annualizedCost / 12;

  return { upfrontCosts, ongoingCosts, totalTCO, annualizedCost, monthlyCost };
}

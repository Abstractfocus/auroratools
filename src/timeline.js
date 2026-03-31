export function estimateTimeline(scope, teamSize, complexity) {
  const scopeWeeks = { small: 4, medium: 12, large: 24, enterprise: 48 };
  const complexityMultiplier = { low: 0.8, medium: 1.0, high: 1.4, very_high: 1.8 };
  const teamFactor = Math.max(0.5, 1 - (teamSize - 1) * 0.08);

  const baseWeeks = scopeWeeks[scope];
  const adjustedWeeks = Math.ceil(baseWeeks * complexityMultiplier[complexity] * teamFactor);

  const phaseDefs = [
    { name: "Discovery & Planning", pct: 0.15 },
    { name: "Design & Architecture", pct: 0.15 },
    { name: "Development", pct: 0.40 },
    { name: "Testing & QA", pct: 0.15 },
    { name: "Deployment & Launch", pct: 0.10 },
    { name: "Post-Launch Support", pct: 0.05 }
  ];

  const phases = phaseDefs.map(phase => ({
    name: phase.name,
    weeks: Math.max(1, Math.round(adjustedWeeks * phase.pct))
  }));

  return { adjustedWeeks, phases };
}

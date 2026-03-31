import { calculateROI } from './roi.js';
import { calculateTCOValues } from './tco.js';
import { estimateTimeline } from './timeline.js';
import { calculateBudgetValues } from './budget.js';
import { compareBenchmarks } from './benchmarking.js';
import { assessRisks } from './risk.js';

window.auroraModules = {
  calculateROI,
  calculateTCOValues,
  estimateTimeline,
  calculateBudgetValues,
  compareBenchmarks,
  assessRisks
};

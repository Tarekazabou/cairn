/**
 * Precision matters more than recall for this product (docs/roadmap.md Phase 4):
 * a tool that invents tasks gets uninstalled; a tool that misses one gets forgiven.
 */
export function precision(
  truePositives: number,
  falsePositives: number,
): number {
  const total = truePositives + falsePositives;
  return total === 0 ? 0 : truePositives / total;
}

export function recall(truePositives: number, falseNegatives: number): number {
  const total = truePositives + falseNegatives;
  return total === 0 ? 0 : truePositives / total;
}

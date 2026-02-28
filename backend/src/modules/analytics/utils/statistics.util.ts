// Statistical utility functions

export class StatisticsUtils {
  /**
   * Calculate mean (average) of an array
   */
  static mean(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * Calculate median of an array
   */
  static median(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Calculate standard deviation
   */
  static stdDeviation(numbers: number[]): number {
    const avg = this.mean(numbers);
    const squareDiffs = numbers.map(x => Math.pow(x - avg, 2));
    const avgSquareDiff = this.mean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  }

  /**
   * Calculate variance
   */
  static variance(numbers: number[]): number {
    const avg = this.mean(numbers);
    const squareDiffs = numbers.map(x => Math.pow(x - avg, 2));
    return this.mean(squareDiffs);
  }

  /**
   * Pearson Correlation Coefficient (-1 to 1)
   */
  static pearsonCorrelation(x: number[], y: number[]): number {
    if (x.length === 0 || x.length !== y.length) return 0;
    
    const n = x.length;
    const mean_x = this.mean(x);
    const mean_y = this.mean(y);
    
    const numerator = x.reduce((sum, xi, i) => sum + (xi - mean_x) * (y[i] - mean_y), 0);
    const denom_x = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - mean_x, 2), 0));
    const denom_y = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - mean_y, 2), 0));
    
    if (denom_x === 0 || denom_y === 0) return 0;
    return numerator / (denom_x * denom_y);
  }

  /**
   * Linear Regression Slope
   */
  static regressionSlope(x: number[], y: number[]): number {
    if (x.length === 0 || x.length !== y.length) return 0;
    
    const n = x.length;
    const mean_x = this.mean(x);
    const mean_y = this.mean(y);
    
    const numerator = x.reduce((sum, xi, i) => sum + (xi - mean_x) * (y[i] - mean_y), 0);
    const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - mean_x, 2), 0);
    
    if (denominator === 0) return 0;
    return numerator / denominator;
  }

  /**
   * Calculate percentile rank (0-100) of a score within a distribution
   */
  static percentileRank(score: number, scores: number[]): number {
    if (scores.length === 0) return 0;
    const count = scores.filter(s => s <= score).length;
    return (count / scores.length) * 100;
  }

  /**
   * Get correlation strength description
   */
  static getCorrelationStrength(correlation: number): 'strong' | 'moderate' | 'weak' {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return 'strong';
    if (abs >= 0.4) return 'moderate';
    return 'weak';
  }
}

/**
 * Convert percentage to letter grade
 */
export function getLetterGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  if (percentage >= 40) return 'E';
  return 'F';
}

/**
 * Get performance tier
 */
export function getPerformanceTier(average: number): 'excellent' | 'good' | 'average' | 'atRisk' {
  if (average >= 90) return 'excellent';
  if (average >= 80) return 'good';
  if (average >= 60) return 'average';
  return 'atRisk';
}

/**
 * Get trend direction
 */
export function getTrendDirection(values: number[]): 'improving' | 'stable' | 'declining' {
  if (values.length < 2) return 'stable';
  
  const change = values[values.length - 1] - values[0];
  if (change > 5) return 'improving';
  if (change < -5) return 'declining';
  return 'stable';
}

/**
 * Calculate percentage change
 */
export function percentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

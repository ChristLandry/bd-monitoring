import { ThresholdOperator } from '../model/threshold-operator.enum';

export class ThresholdEvaluator {
  static isThresholdExceeded(
    value: number,
    threshold: number,
    operator: ThresholdOperator,
  ): boolean {
    switch (operator) {
      case ThresholdOperator.GT:
        return value > threshold;
      case ThresholdOperator.LT:
        return value < threshold;
      case ThresholdOperator.EQ:
        return value === threshold;
      case ThresholdOperator.GTE:
        return value >= threshold;
      case ThresholdOperator.LTE:
        return value <= threshold;
      case ThresholdOperator.NEQ:
        return value !== threshold;
      default:
        return false;
    }
  }
}

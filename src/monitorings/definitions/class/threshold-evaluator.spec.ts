import { ThresholdEvaluator } from './threshold-evaluator.class';
import { ThresholdOperator } from '../model/threshold-operator.enum';

describe('ThresholdEvaluator', () => {
  it('détecte un dépassement avec >', () => {
    expect(
      ThresholdEvaluator.isThresholdExceeded(101, 100, ThresholdOperator.GT),
    ).toBe(true);
    expect(
      ThresholdEvaluator.isThresholdExceeded(100, 100, ThresholdOperator.GT),
    ).toBe(false);
  });

  it('détecte un dépassement avec <=', () => {
    expect(
      ThresholdEvaluator.isThresholdExceeded(5, 10, ThresholdOperator.LTE),
    ).toBe(true);
  });

  it('détecte une égalité stricte', () => {
    expect(
      ThresholdEvaluator.isThresholdExceeded(42, 42, ThresholdOperator.EQ),
    ).toBe(true);
  });
});

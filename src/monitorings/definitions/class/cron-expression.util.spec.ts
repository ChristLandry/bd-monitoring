import {
  buildCronFromIntervalSeconds,
  normalizeCronExpression,
  resolveMonitoringCronExpression,
  DEFAULT_CRON_EXPRESSION,
} from './cron-expression.util';

describe('cron-expression.util', () => {
  it('génère un cron toutes les N secondes', () => {
    expect(buildCronFromIntervalSeconds(30)).toBe('*/30 * * * * *');
  });

  it('défaut = 30 secondes', () => {
    expect(DEFAULT_CRON_EXPRESSION).toBe('*/30 * * * * *');
  });

  it('accepte un nombre seul comme secondes', () => {
    expect(normalizeCronExpression('15')).toBe('*/15 * * * * *');
  });

  it('convertit 5 champs en 6 champs', () => {
    expect(normalizeCronExpression('*/5 * * * *')).toBe('0 */5 * * * *');
  });

  it('utilise intervalSeconds par défaut', () => {
    expect(resolveMonitoringCronExpression({})).toBe('*/30 * * * * *');
  });
});

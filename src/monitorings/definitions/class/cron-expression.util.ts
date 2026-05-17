/** Expression cron 6 champs : seconde | minute | heure | jour | mois | jour-semaine */
export const DEFAULT_INTERVAL_SECONDS = 30;

export const DEFAULT_CRON_EXPRESSION = buildCronFromIntervalSeconds(
  DEFAULT_INTERVAL_SECONDS,
);

/** Construit une expression cron 6 champs à partir d'un intervalle en secondes. */
export function buildCronFromIntervalSeconds(seconds: number): string {
  if (!Number.isInteger(seconds) || seconds < 1) {
    throw new Error('intervalSeconds doit être un entier >= 1');
  }
  if (seconds <= 59) {
    return `*/${seconds} * * * * *`;
  }
  if (seconds % 60 === 0) {
    const minutes = seconds / 60;
    if (minutes <= 59) {
      return `0 */${minutes} * * * *`;
    }
    if (minutes % 60 === 0) {
      const hours = minutes / 60;
      if (hours <= 23) {
        return `0 0 */${hours} * * *`;
      }
    }
  }
  throw new Error(
    `intervalSeconds ${seconds} : intervalle non convertible en expression cron`,
  );
}

/**
 * Normalise vers 6 champs (unité la plus fine = seconde).
 */
export function normalizeCronExpression(expression: string): string {
  const trimmed = expression.trim();

  if (/^\d+$/.test(trimmed)) {
    return buildCronFromIntervalSeconds(Number(trimmed));
  }

  const parts = trimmed.split(/\s+/);

  if (parts.length === 6) {
    return parts.join(' ');
  }

  if (parts.length === 5) {
    return `0 ${parts.join(' ')}`;
  }

  throw new Error(
    `Expression cron invalide : 6 champs (sec min h j m jsem), 5 champs, ou nombre de secondes. Reçu : "${expression}"`,
  );
}

export function resolveMonitoringCronExpression(input: {
  frequenceCron?: string;
  intervalSeconds?: number;
}): string {
  if (input.frequenceCron?.trim()) {
    return normalizeCronExpression(input.frequenceCron);
  }
  return buildCronFromIntervalSeconds(
    input.intervalSeconds ?? DEFAULT_INTERVAL_SECONDS,
  );
}

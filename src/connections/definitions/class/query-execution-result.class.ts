export interface QueryExecutionResult {
  value: number | null;
  durationMs: number;
  rawRows?: unknown[];
  rowCount?: number;
}

export interface QueryExecutionError {
  code:
    | 'TIMEOUT'
    | 'ERREUR_SQL'
    | 'ERREUR_CONNEXION'
    | 'ERREUR_DRIVER'
    | 'RESULTAT_INVALIDE';
  message: string;
  durationMs: number;
}

export type QueryExecutionOutcome =
  | { success: true; result: QueryExecutionResult }
  | { success: false; error: QueryExecutionError };

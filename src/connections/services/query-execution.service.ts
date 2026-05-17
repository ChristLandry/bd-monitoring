import { Injectable, Logger } from '@nestjs/common';
import { Client as PgClient } from 'pg';
import * as mysql from 'mysql2/promise';
import * as mssql from 'mssql';
import { MongoClient } from 'mongodb';
import { ConnectionEntity } from '../definitions/model/connection.entity';
import { DbType } from '../definitions/model/db-type.enum';
import { EncryptionService } from '../../common/services/encryption.service';
import {
  QueryExecutionOutcome,
  QueryExecutionResult,
} from '../definitions/class/query-execution-result.class';

export interface ExecuteQueryParams {
  connection: ConnectionEntity;
  sql: string;
  parameters?: Record<string, unknown>;
  timeoutSeconds: number;
}

@Injectable()
export class QueryExecutionService {
  private readonly logger = new Logger(QueryExecutionService.name);
  private readonly runningJobs = new Set<string>();

  constructor(private readonly encryption: EncryptionService) {}

  async execute(params: ExecuteQueryParams): Promise<QueryExecutionOutcome> {
    const lockKey = `${params.connection.id}:${this.hashSql(params.sql)}`;
    if (this.runningJobs.has(lockKey)) {
      return {
        success: false,
        error: {
          code: 'ERREUR_CONNEXION',
          message: 'Exécution concurrente refusée pour cette requête',
          durationMs: 0,
        },
      };
    }
    this.runningJobs.add(lockKey);
    const started = Date.now();
    try {
      const password = this.encryption.decrypt(
        params.connection.passwordEncrypted,
      );
      const { sql, values } = this.bindParameters(
        params.sql,
        params.parameters ?? {},
      );
      const result = await this.runWithTimeout(
        () =>
          this.dispatchDriver(params.connection, sql, values, password),
        params.timeoutSeconds * 1000,
      );
      const durationMs = Date.now() - started;
      const numericValue = this.extractNumericValue(result);
      if (numericValue === null) {
        return {
          success: false,
          error: {
            code: 'RESULTAT_INVALIDE',
            message:
              'La requête doit retourner une valeur numérique (première colonne, première ligne)',
            durationMs,
          },
        };
      }
      return {
        success: true,
        result: {
          value: numericValue,
          durationMs,
          rawRows: result.rows,
          rowCount: result.rowCount,
        },
      };
    } catch (err) {
      const durationMs = Date.now() - started;
      return { success: false, error: this.mapError(err, durationMs) };
    } finally {
      this.runningJobs.delete(lockKey);
    }
  }

  async testConnection(
    connection: ConnectionEntity,
  ): Promise<{ success: boolean; responseTimeMs: number; serverVersion?: string; message?: string }> {
    const started = Date.now();
    try {
      const password = this.encryption.decrypt(connection.passwordEncrypted);
      const probeSql = this.getProbeSql(connection.type);
      await this.runWithTimeout(
        () => this.dispatchDriver(connection, probeSql, [], password),
        10000,
      );
      return {
        success: true,
        responseTimeMs: Date.now() - started,
        serverVersion: connection.type,
      };
    } catch (err) {
      return {
        success: false,
        responseTimeMs: Date.now() - started,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private getProbeSql(type: DbType): string {
    switch (type) {
      case DbType.ORACLE:
        return 'SELECT 1 FROM DUAL';
      case DbType.MSSQL:
        return 'SELECT 1 AS val';
      case DbType.MONGODB:
        return '{"ping":1}';
      default:
        return 'SELECT 1 AS val';
    }
  }

  private bindParameters(
    sql: string,
    params: Record<string, unknown>,
  ): { sql: string; values: unknown[] } {
    const values: unknown[] = [];
    let index = 0;

    let bound = sql.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      values.push(params[key] ?? null);
      index++;
      return this.placeholder(index);
    });

    bound = bound.replace(/:(\w+)/g, (_, key: string) => {
      if (!(key in params)) {
        return `:${key}`;
      }
      values.push(params[key]);
      index++;
      return this.placeholder(index);
    });

    return { sql: bound, values };
  }

  private placeholder(index: number): string {
    return `$${index}`;
  }

  private async dispatchDriver(
    connection: ConnectionEntity,
    sql: string,
    values: unknown[],
    password: string,
  ): Promise<{ rows: unknown[]; rowCount: number }> {
    switch (connection.type) {
      case DbType.POSTGRESQL:
        return this.executePostgres(connection, sql, values, password);
      case DbType.MYSQL:
      case DbType.MARIADB:
        return this.executeMysql(connection, sql, values, password);
      case DbType.MSSQL:
        return this.executeMssql(connection, sql, values, password);
      case DbType.MONGODB:
        return this.executeMongo(connection, sql, password);
      case DbType.ORACLE:
        return this.executeOracle(connection, sql, values, password);
      default:
        throw new Error(`Type de base non supporté: ${connection.type}`);
    }
  }

  private async executePostgres(
    conn: ConnectionEntity,
    sql: string,
    values: unknown[],
    password: string,
  ): Promise<{ rows: unknown[]; rowCount: number }> {
    const client = new PgClient({
      host: conn.host,
      port: conn.port,
      database: conn.database,
      user: conn.username,
      password,
      ssl: conn.sslEnabled ? { rejectUnauthorized: false } : undefined,
      ...(conn.options as object),
    });
    await client.connect();
    try {
      const res = await client.query(sql, values);
      return { rows: res.rows, rowCount: res.rowCount ?? res.rows.length };
    } finally {
      await client.end();
    }
  }

  private async executeMysql(
    conn: ConnectionEntity,
    sql: string,
    values: unknown[],
    password: string,
  ): Promise<{ rows: unknown[]; rowCount: number }> {
    const mysqlSql = sql.replace(/\$(\d+)/g, '?');
    const pool = await mysql.createConnection({
      host: conn.host,
      port: conn.port,
      database: conn.database,
      user: conn.username,
      password,
      ssl: conn.sslEnabled ? {} : undefined,
      ...(conn.options as mysql.ConnectionOptions),
    });
    try {
      const [rows] = await pool.execute(
        mysqlSql,
        values as (string | number | null)[],
      );
      const arr = Array.isArray(rows) ? rows : [rows];
      return { rows: arr as unknown[], rowCount: arr.length };
    } finally {
      await pool.end();
    }
  }

  private async executeMssql(
    conn: ConnectionEntity,
    sql: string,
    values: unknown[],
    password: string,
  ): Promise<{ rows: unknown[]; rowCount: number }> {
    const pool = await mssql.connect({
      server: conn.host,
      port: conn.port,
      database: conn.database,
      user: conn.username,
      password,
      options: {
        encrypt: conn.sslEnabled,
        trustServerCertificate: true,
        ...(conn.options as mssql.IOptions),
      },
    });
    try {
      const request = pool.request();
      values.forEach((v, i) => request.input(`p${i + 1}`, v));
      const mssqlSql = sql.replace(/\$(\d+)/g, (_, n) => `@p${n}`);
      const result = await request.query(mssqlSql);
      const rows = result.recordset ?? [];
      return { rows, rowCount: rows.length };
    } finally {
      await pool.close();
    }
  }

  private async executeMongo(
    conn: ConnectionEntity,
    sql: string,
    password: string,
  ): Promise<{ rows: unknown[]; rowCount: number }> {
    const uri =
      (conn.options?.uri as string) ??
      `mongodb://${encodeURIComponent(conn.username)}:${encodeURIComponent(password)}@${conn.host}:${conn.port}/${conn.database}`;
    const client = new MongoClient(uri, {
      tls: conn.sslEnabled,
    });
    await client.connect();
    try {
      const parsed = JSON.parse(sql) as {
        collection: string;
        pipeline?: object[];
        aggregate?: string;
      };
      const db = client.db(conn.database);
      if (parsed.collection && parsed.pipeline) {
        const cursor = db
          .collection(parsed.collection)
          .aggregate(parsed.pipeline);
        const rows = await cursor.toArray();
        return { rows, rowCount: rows.length };
      }
      await db.command({ ping: 1 });
      return { rows: [{ val: 1 }], rowCount: 1 };
    } finally {
      await client.close();
    }
  }

  private async executeOracle(
    conn: ConnectionEntity,
    sql: string,
    values: unknown[],
    password: string,
  ): Promise<{ rows: unknown[]; rowCount: number }> {
    let oracledb: typeof import('oracledb');
    try {
      oracledb = await import('oracledb');
    } catch {
      throw new Error(
        'Driver oracledb non installé. Exécutez: npm install oracledb',
      );
    }
    const connection = await oracledb.getConnection({
      user: conn.username,
      password,
      connectString: `${conn.host}:${conn.port}/${conn.database}`,
      ...(conn.options as object),
    });
    try {
      const oracleSql = sql.replace(/\$(\d+)/g, (_, n) => `:${n}`);
      const result = await connection.execute(oracleSql, values, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      const rows = (result.rows ?? []) as unknown[];
      return { rows, rowCount: rows.length };
    } finally {
      await connection.close();
    }
  }

  private extractNumericValue(result: {
    rows: unknown[];
  }): number | null {
    if (!result.rows?.length) {
      return null;
    }
    const first = result.rows[0];
    if (typeof first === 'number') {
      return first;
    }
    if (typeof first === 'object' && first !== null) {
      const values = Object.values(first as Record<string, unknown>);
      const num = values.find((v) => typeof v === 'number');
      if (typeof num === 'number') {
        return num;
      }
      const parsed = Number(values[0]);
      return Number.isFinite(parsed) ? parsed : null;
    }
    const parsed = Number(first);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private async runWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('TIMEOUT'));
      }, timeoutMs);
      fn()
        .then((r) => {
          clearTimeout(timer);
          resolve(r);
        })
        .catch((e) => {
          clearTimeout(timer);
          reject(e);
        });
    });
  }

  private mapError(
    err: unknown,
    durationMs: number,
  ): Extract<QueryExecutionOutcome, { success: false }>['error'] {
    const message = err instanceof Error ? err.message : String(err);
    if (message === 'TIMEOUT') {
      return { code: 'TIMEOUT', message: 'Délai d\'exécution dépassé', durationMs };
    }
    if (
      message.includes('connect') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ENOTFOUND')
    ) {
      return {
        code: 'ERREUR_CONNEXION',
        message,
        durationMs,
      };
    }
    if (message.includes('Driver') || message.includes('non supporté')) {
      return { code: 'ERREUR_DRIVER', message, durationMs };
    }
    return { code: 'ERREUR_SQL', message, durationMs };
  }

  private hashSql(sql: string): string {
    let hash = 0;
    for (let i = 0; i < sql.length; i++) {
      hash = (hash << 5) - hash + sql.charCodeAt(i);
      hash |= 0;
    }
    return String(hash);
  }
}

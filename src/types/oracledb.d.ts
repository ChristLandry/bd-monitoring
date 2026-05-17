declare module 'oracledb' {
  const oracledb: {
    getConnection(config: object): Promise<{
      execute(
        sql: string,
        binds?: unknown[],
        options?: object,
      ): Promise<{ rows?: unknown[] }>;
      close(): Promise<void>;
    }>;
    OUT_FORMAT_OBJECT: number;
  };
  export = oracledb;
}

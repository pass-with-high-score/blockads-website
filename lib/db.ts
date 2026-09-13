import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL environment variable is not defined.");
}

declare global {
  // eslint-disable-next-line no-var
  var sql: ReturnType<typeof postgres> | undefined;
}

export const sql =
  globalThis.sql ||
  postgres(connectionString || "", {
    ssl: "require",
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.sql = sql;
}

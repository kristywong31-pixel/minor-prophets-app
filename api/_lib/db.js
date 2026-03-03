const { Pool } = require("pg");

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL environment variable.");
  }

  // Reuse across invocations in serverless.
  if (!global.__PCMP_PG_POOL__) {
    global.__PCMP_PG_POOL__ = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return global.__PCMP_PG_POOL__;
}

module.exports = { getPool };


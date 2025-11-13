import mysql from "mysql2/promise";
import "dotenv/config";
import log from "./log.js";

let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_SCHEMA,
      charset: "utf8mb4_general_ci",
      waitForConnections: true,
      connectionLimit: 100,
      queueLimit: 0,
    });
  }
  return pool;
}

async function SQL(
  sqlString: string,
  parameters: Array<any> = [],
  transaction: boolean = true,
  timeout: number = 10000
): Promise<any> {
  log("SQL", global.shardId, sqlString, parameters);
  const connection = await getPool().getConnection();
  try {
    if (transaction) await connection.beginTransaction();
    const [result] = await connection.query({
      sql: sqlString,
      values: parameters,
      timeout: timeout,
    });
    if (transaction) await connection.commit();
    connection.release();
    return result as any;
  } catch (err) {
    if (transaction) await connection.rollback();
    connection.release();
    throw err;
  }
}

export default SQL;

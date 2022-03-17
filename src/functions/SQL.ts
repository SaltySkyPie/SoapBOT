import * as mysql from 'promise-mysql'
import 'dotenv/config'
import log from './log.js'

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA,
    charset: 'utf8mb4_general_ci',
    reconnect: true,
    debug: false,
    multipleStatements: true,
    connectionLimit: 100,
    timeout: 1000
});

async function SQL(sqlString: string, parameters: Array<any> = [], transation: boolean = true, timeout: number = 10000) {
    log("SQL", global.shardId, sqlString, parameters);
    const connection = await (await pool).getConnection();
    try {
    transation ? await connection.beginTransaction() : null;
    const result = await connection.query({
        sql: sqlString,
        values: parameters,
        timeout: timeout
    });
    transation ? await connection.commit() : null;
    return result;
    } catch (err) {
        await connection.rollback();
        throw err;
    }
}

export default SQL

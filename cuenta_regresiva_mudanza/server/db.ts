import {
    readFile
} from 'node:fs/promises'
import pg from 'pg'
import { config } from './config.js'

const { Pool } = pg

export const db = new Pool({
    connectionString: config.databaseUrl
    ,ssl: config.databaseUrl.includes('localhost')
        ? false
        : {
            rejectUnauthorized: false
        }
})

export async function migrate() {
    const schema = await readFile(new URL('../db/schema.sql', import.meta.url), 'utf8')
    await db.query(schema)
}

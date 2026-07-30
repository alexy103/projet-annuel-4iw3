import { Pool, types } from 'pg';
import { config } from 'dotenv';

config({
	quiet: true,
});

const PG_DATE_OID = 1082;

// Keep DATE columns as YYYY-MM-DD strings to avoid timezone day shifts.
types.setTypeParser(PG_DATE_OID, (value: string) => value);

export const db = new Pool({
	connectionString: process.env.DATABASE_URL,
	options: '-c TimeZone=Europe/Paris',
});

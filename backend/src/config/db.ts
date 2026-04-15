import { Pool } from "pg";
import { config } from "dotenv";

config({
  quiet: true,
});

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  options: "-c TimeZone=Europe/Paris",
});

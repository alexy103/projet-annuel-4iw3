const bcrypt = require("bcrypt");
const { config } = require("dotenv");

config({ quiet: true });

const SALT_ROUNDS = 12;
const PEPPER = process.env.PEPPER_SECRET;

if (!PEPPER) {
  throw new Error("PEPPER_SECRET manquant dans .env");
}

async function hashPassword(password) {
  return bcrypt.hash(password + PEPPER, SALT_ROUNDS);
}

module.exports = { hashPassword };

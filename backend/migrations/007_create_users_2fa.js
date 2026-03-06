exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS users_2fa (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      totp_secret TEXT,
      is_enabled BOOLEAN NOT NULL DEFAULT false,
      recovery_codes JSON,
      created_at TIMESTAMP DEFAULT now()
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE users_2fa`);
};

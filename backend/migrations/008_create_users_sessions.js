exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS users_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      refresh_token_hash TEXT NOT NULL,
      user_agent TEXT,
      ip_address VARCHAR(50),
      expired_at TIMESTAMP NOT NULL DEFAULT now(),
      created_at TIMESTAMP DEFAULT now()
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE users_sessions`);
};

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS users_permissions (
      user_id INTEGER NOT NULL REFERENCES users(id),
      permission_id INTEGER NOT NULL REFERENCES permissions(id),
      created_at TIMESTAMP DEFAULT now(),
      PRIMARY KEY (user_id, permission_id)
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE users_permissions`);
};

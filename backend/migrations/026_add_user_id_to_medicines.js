exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE medicines
    ADD COLUMN user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE medicines DROP COLUMN user_id`);
};

exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE treatment_types
    ADD COLUMN user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE treatment_types DROP COLUMN user_id`);
};

exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE microships
    ADD COLUMN user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE microships DROP COLUMN user_id`);
};

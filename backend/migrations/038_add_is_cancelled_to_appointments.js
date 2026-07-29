exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN NOT NULL DEFAULT FALSE
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE appointments DROP COLUMN is_cancelled`);
};

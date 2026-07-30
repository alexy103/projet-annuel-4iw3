exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_refused BOOLEAN NOT NULL DEFAULT FALSE
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE appointments
    DROP COLUMN is_accepted,
    DROP COLUMN is_refused
  `);
};

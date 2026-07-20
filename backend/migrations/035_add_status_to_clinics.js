exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE clinics
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'approved'
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE clinics DROP COLUMN status`);
};

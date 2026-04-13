exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE availabilities
    ADD COLUMN clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE
  `);

  pgm.sql(`
    ALTER TABLE clinics
    DROP COLUMN availability_id
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE clinics
    ADD COLUMN availability_id INTEGER REFERENCES availabilities(id) ON DELETE RESTRICT
  `);

  pgm.sql(`
    ALTER TABLE availabilities
    DROP COLUMN clinic_id
  `);
};

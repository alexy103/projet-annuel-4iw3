exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE animals
    ADD COLUMN profile_picture VARCHAR(500) DEFAULT NULL
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE animals DROP COLUMN profile_picture`);
};

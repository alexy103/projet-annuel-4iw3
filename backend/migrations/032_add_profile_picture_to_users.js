exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE users
    ADD COLUMN profile_picture VARCHAR(500) DEFAULT NULL
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE users DROP COLUMN profile_picture`);
};

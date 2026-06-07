exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE users
    ADD COLUMN oauth_provider VARCHAR(50) DEFAULT NULL,
    ADD COLUMN oauth_id VARCHAR(255) DEFAULT NULL
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE users
    DROP COLUMN oauth_provider,
    DROP COLUMN oauth_id
  `);
};

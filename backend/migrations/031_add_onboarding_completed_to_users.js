exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE users
    ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE
  `);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE users DROP COLUMN onboarding_completed`);
};

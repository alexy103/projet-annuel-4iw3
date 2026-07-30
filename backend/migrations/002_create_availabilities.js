exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS availabilities (
      id SERIAL PRIMARY KEY,
      day VARCHAR(25) NOT NULL,
      opening SMALLINT NOT NULL,
      closing SMALLINT NOT NULL,
      slot_rules JSON NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE availabilities`);
};

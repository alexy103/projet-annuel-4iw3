exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS treatment_types (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE treatment_types`);
};

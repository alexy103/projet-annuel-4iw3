exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS height_records (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      height DECIMAL(2,2) NOT NULL,
      animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE RESTRICT,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE height_records`);
};

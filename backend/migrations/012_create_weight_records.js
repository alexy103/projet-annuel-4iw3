exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS weight_records (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      weight DECIMAL(3,2) NOT NULL,
      animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE RESTRICT,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE weight_records`);
};

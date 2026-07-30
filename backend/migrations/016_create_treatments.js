exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS treatments (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      note TEXT,
      quantity SMALLINT,
      treatment_type_id INTEGER NOT NULL REFERENCES treatment_types(id) ON DELETE RESTRICT,
      medicine_id INTEGER REFERENCES medicines(id) ON DELETE RESTRICT,
      animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE RESTRICT,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE treatments`);
};

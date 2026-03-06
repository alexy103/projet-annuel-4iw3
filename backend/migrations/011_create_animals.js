exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS animals (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      breed VARCHAR(255) NOT NULL,
      birth_date DATE NOT NULL,
      adoption_date DATE NOT NULL,
      sex BOOLEAN NOT NULL,
      color VARCHAR(100),
      is_sterilized BOOLEAN DEFAULT FALSE,
      allergies TEXT,
      is_shared BOOLEAN DEFAULT FALSE,
      is_deceased BOOLEAN DEFAULT FALSE,
      microchip_id INTEGER REFERENCES microships(id) ON DELETE RESTRICT,
      species_id INTEGER NOT NULL REFERENCES species(id) ON DELETE RESTRICT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE animals`);
};

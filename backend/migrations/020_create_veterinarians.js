exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS veterinarians (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(150) NOT NULL,
      last_name VARCHAR(150) NOT NULL,
      is_present BOOLEAN DEFAULT TRUE,
      clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE veterinarians`);
};

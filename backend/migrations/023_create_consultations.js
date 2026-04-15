exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS consultations (
      id SERIAL PRIMARY KEY,
      veterinarian_id INTEGER NOT NULL REFERENCES veterinarians(id) ON DELETE RESTRICT,
      summary TEXT NOT NULL,
      prescription TEXT NOT NULL,
      appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE RESTRICT,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE consultations`);
};

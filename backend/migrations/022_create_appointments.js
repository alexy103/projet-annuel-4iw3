exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      time TIME NOT NULL,
      reason_id INTEGER NOT NULL REFERENCES appointment_reasons(id) ON DELETE RESTRICT,
      is_completed BOOLEAN DEFAULT FALSE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE RESTRICT,
      clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE appointments`);
};

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS clinics (
      id SERIAL PRIMARY KEY,
      address VARCHAR(255) NOT NULL,
      city VARCHAR(255) NOT NULL,
      postcode VARCHAR(6) NOT NULL,
      phone_number VARCHAR(12) NOT NULL,
      availability_id INTEGER REFERENCES availabilities(id) ON DELETE RESTRICT,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE clinics`);
};

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS appointment_reasons (
      id SERIAL PRIMARY KEY,
      label VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE appointment_reasons`);
};

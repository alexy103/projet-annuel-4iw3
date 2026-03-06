exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS microships (
      id SERIAL PRIMARY KEY,
      number VARCHAR(150) NOT NULL,
      position VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE microships`);
};

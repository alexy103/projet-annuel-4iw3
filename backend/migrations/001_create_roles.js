exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      label VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);

  pgm.sql(`
    INSERT INTO roles(label) VALUES
        ('admin'),
        ('user')
    ON CONFLICT(label) DO NOTHING
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE roles`);
};

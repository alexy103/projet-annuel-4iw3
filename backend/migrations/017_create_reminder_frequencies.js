exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS reminder_frequencies (
      id SERIAL PRIMARY KEY,
      frequency VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);

  pgm.sql(`
    INSERT INTO reminder_frequencies(frequency) VALUES
        ('Jour(s)'),
        ('Semaine(s)'),
        ('Mois'),
        ('An(s)')
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE reminder_frequencies`);
};

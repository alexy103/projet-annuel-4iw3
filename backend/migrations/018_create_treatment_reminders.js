exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS treatment_reminders (
      treatment_id INTEGER NOT NULL REFERENCES treatments(id) ON DELETE RESTRICT,
      reminder_frequency_id INTEGER NOT NULL REFERENCES reminder_frequencies(id) ON DELETE RESTRICT,
      amount SMALLINT NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now(),
      PRIMARY KEY(treatment_id, reminder_frequency_id)
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE treatment_reminders`);
};

const { hashPassword } = require("../src/utils/migration-helpers/helpers");

exports.up = async (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      last_name VARCHAR(150) NOT NULL,
      first_name VARCHAR(150) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      must_change_password BOOLEAN NOT NULL DEFAULT true,
      password_temp_expires_at TIMESTAMP NULL DEFAULT NULL,
      email_verified BOOLEAN NOT NULL DEFAULT false,
      email_verification_code VARCHAR(6),
      email_verification_expires_at TIMESTAMP,
      is_activated BOOLEAN NOT NULL DEFAULT true,
      role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
      clinic_id INTEGER REFERENCES clinics(id) ON DELETE RESTRICT,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `);

  const passwordHashed = await hashPassword("Developpeur@12345");

  pgm.sql(`
    INSERT INTO users(last_name, first_name, email, password_hash, must_change_password, email_verified,is_activated, role_id ) VALUES
        ('Admin', 'admin', 'admin@example.com', '${passwordHashed}', false , true, true, 1)
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE users`);
};

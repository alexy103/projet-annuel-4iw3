const { hashPassword } = require("../src/utils/migration-helpers/helpers");

exports.up = async (pgm) => {
  pgm.sql(`
    INSERT INTO clinics (name, address, city, postcode, phone_number, status) VALUES
      ('Clinique Vétérinaire du Centre', '12 rue de la Paix', 'Paris', '75002', '0142000001', 'approved'),
      ('Clinique Vétérinaire du Parc', '8 avenue des Tilleuls', 'Lyon', '69003', '0472000002', 'approved')
  `);

  const passwordHashed = await hashPassword("Clinique@12345");

  pgm.sql(`
    INSERT INTO users (last_name, first_name, email, password_hash, must_change_password, email_verified, is_activated, role_id, clinic_id)
    SELECT 'Centre', 'Clinique', 'clinic1@example.com', '${passwordHashed}', false, true, true, 3, id
    FROM clinics WHERE name = 'Clinique Vétérinaire du Centre'
  `);

  pgm.sql(`
    INSERT INTO users (last_name, first_name, email, password_hash, must_change_password, email_verified, is_activated, role_id, clinic_id)
    SELECT 'Parc', 'Clinique', 'clinic2@example.com', '${passwordHashed}', false, true, true, 3, id
    FROM clinics WHERE name = 'Clinique Vétérinaire du Parc'
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM users WHERE email IN ('clinic1@example.com', 'clinic2@example.com')`);
  pgm.sql(`DELETE FROM clinics WHERE name IN ('Clinique Vétérinaire du Centre', 'Clinique Vétérinaire du Parc')`);
};

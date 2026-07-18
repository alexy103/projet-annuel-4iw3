exports.up = (pgm) => {
	pgm.sql(`
    WITH default_types(name) AS (
      VALUES
        ('Vaccination'),
        ('Rappel vaccinal'),
        ('Vermifugation'),
        ('Antiparasitaire'),
        ('Antibiotique'),
        ('Anti-inflammatoire'),
        ('Antalgique'),
        ('Soin local'),
        ('Insuline'),
        ('Complément alimentaire')
    )
    INSERT INTO treatment_types (name, user_id)
    SELECT dt.name, u.id
    FROM users u
    CROSS JOIN default_types dt
    WHERE NOT EXISTS (
      SELECT 1
      FROM treatment_types tt
      WHERE tt.user_id = u.id
        AND LOWER(tt.name) = LOWER(dt.name)
    )
  `);
};

exports.down = (pgm) => {
	pgm.sql(`
    DELETE FROM treatment_types tt
    WHERE tt.name IN (
      'Vaccination',
      'Rappel vaccinal',
      'Vermifugation',
      'Antiparasitaire',
      'Antibiotique',
      'Anti-inflammatoire',
      'Antalgique',
      'Soin local',
      'Insuline',
      'Complément alimentaire'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM treatments t
      WHERE t.treatment_type_id = tt.id
    )
  `);
};

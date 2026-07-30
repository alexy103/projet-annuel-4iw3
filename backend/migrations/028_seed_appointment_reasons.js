exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO appointment_reasons (label) VALUES
      ('Consultation annuelle'),
      ('Vaccination'),
      ('Rappel vaccinal'),
      ('Vermifugation'),
      ('Antiparasitaire'),
      ('Urgence'),
      ('Suivi post-opératoire'),
      ('Stérilisation'),
      ('Détartrage'),
      ('Problème digestif'),
      ('Problème cutané'),
      ('Problème oculaire'),
      ('Problème respiratoire'),
      ('Problème locomoteur'),
      ('Problème urinaire'),
      ('Contrôle de poids'),
      ('Pose de microship'),
      ('Bilan de santé'),
      ('Soins dentaires'),
      ('Autre')
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM appointment_reasons`);
};

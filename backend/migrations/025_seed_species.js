exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO species (name) VALUES
      ('Chien'),
      ('Chat'),
      ('Lapin'),
      ('Hamster'),
      ('Cochon d''Inde'),
      ('Furet'),
      ('Rat'),
      ('Souris'),
      ('Gerbille'),
      ('Chinchilla'),
      ('Perroquet'),
      ('Perruche'),
      ('Canari'),
      ('Tourterelle'),
      ('Pigeon'),
      ('Tortue'),
      ('Lézard'),
      ('Serpent'),
      ('Gecko'),
      ('Iguane'),
      ('Poisson rouge'),
      ('Poisson tropical'),
      ('Cheval'),
      ('Poney'),
      ('Âne'),
      ('Cochon'),
      ('Mouton'),
      ('Chèvre'),
      ('Vache'),
      ('Poule')
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM species`);
};

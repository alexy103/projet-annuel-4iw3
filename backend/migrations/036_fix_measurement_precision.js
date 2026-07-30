exports.up = (pgm) => {
	pgm.sql(`
    ALTER TABLE height_records
    ALTER COLUMN height TYPE DECIMAL(5,2)
    USING height::DECIMAL(5,2)
  `);

	pgm.sql(`
    ALTER TABLE weight_records
    ALTER COLUMN weight TYPE DECIMAL(5,2)
    USING weight::DECIMAL(5,2)
  `);
};

exports.down = (pgm) => {
	pgm.sql(`
    ALTER TABLE height_records
    ALTER COLUMN height TYPE DECIMAL(2,2)
    USING height::DECIMAL(2,2)
  `);

	pgm.sql(`
    ALTER TABLE weight_records
    ALTER COLUMN weight TYPE DECIMAL(3,2)
    USING weight::DECIMAL(3,2)
  `);
};

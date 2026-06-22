/**
 * Migration: 006 - Create Favourites Table
 */
exports.up = (pgm) => {
  pgm.createTable('favourites', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    service_id: {
      type: 'uuid',
      notNull: true,
      references: '"services"',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  // Constraints
  pgm.addConstraint('favourites', 'unique_user_service_favourite', 'UNIQUE (user_id, service_id)');

  // Indexes
  pgm.createIndex('favourites', 'user_id');
  pgm.createIndex('favourites', 'service_id');
};

exports.down = (pgm) => {
  pgm.dropTable('favourites');
};

/**
 * Migration: 004 - Create Reviews Table
 */
exports.up = (pgm) => {
  pgm.createTable('reviews', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
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
    rating: {
      type: 'integer',
      notNull: true,
    },
    comment: {
      type: 'text',
      notNull: false,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  // Constraints
  pgm.addConstraint('reviews', 'chk_rating_range', 'CHECK (rating >= 1 AND rating <= 5)');
  pgm.addConstraint('reviews', 'unique_user_service_review', 'UNIQUE (user_id, service_id)');

  // Indexes
  pgm.createIndex('reviews', 'user_id');
  pgm.createIndex('reviews', 'service_id');
  pgm.createIndex('reviews', ['service_id', 'rating']); // composite index for aggregating averages
};

exports.down = (pgm) => {
  pgm.dropTable('reviews');
};

/**
 * Migration: 005 - Create Feedbacks Table
 */
exports.up = (pgm) => {
  pgm.createTable('feedbacks', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'), // Dùng hàm gen_random_uuid() tiêu chuẩn
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
    },
    email: {
      type: 'varchar(150)',
      notNull: true,
    },
    subject: {
      type: 'varchar(200)',
      notNull: true,
    },
    message: {
      type: 'text',
      notNull: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  // Indexes for fast searching
  pgm.createIndex('feedbacks', 'email');
  pgm.createIndex('feedbacks', 'created_at');
};

exports.down = (pgm) => {
  pgm.dropTable('feedbacks');
};

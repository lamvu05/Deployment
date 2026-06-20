/**
 * Migration: 003 - Create Bookings Table
 */
exports.up = (pgm) => {
  pgm.createTable('bookings', {
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
    booking_date: { type: 'date', notNull: true },
    start_time: { type: 'time', notNull: true },
    end_time: { type: 'time', notNull: true },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'pending',
    },
    notes: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  // Constraints
  pgm.addConstraint('bookings', 'chk_time_order', 'CHECK (end_time > start_time)');
  pgm.addConstraint('bookings', 'chk_status', "CHECK (status IN ('pending','confirmed','cancelled'))");

  // Indexes
  pgm.createIndex('bookings', 'user_id');
  pgm.createIndex('bookings', 'service_id');
  pgm.createIndex('bookings', 'booking_date');
  pgm.createIndex('bookings', 'status');
  // Composite: find all active bookings for a service on a date quickly
  pgm.createIndex('bookings', ['service_id', 'booking_date', 'status']);

  pgm.sql(`
    CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TRIGGER IF EXISTS trg_bookings_updated_at ON bookings');
  pgm.dropTable('bookings');
};

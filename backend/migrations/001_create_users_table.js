/**
 * Migration: 001 - Create Users Table
 */
exports.up = (pgm) => {
  // Enable UUID extension
  pgm.createExtension('uuid-ossp', { ifNotExists: true });

  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    name: { type: 'varchar(100)', notNull: true },
    email: { type: 'varchar(150)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
    role: { type: 'varchar(20)', notNull: true, default: 'user' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createIndex('users', 'email');

  // Auto-update updated_at trigger
  pgm.sql(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TRIGGER IF EXISTS trg_users_updated_at ON users');
  pgm.dropTable('users');
};

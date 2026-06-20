/**
 * Migration: 002 - Create Services Table
 */
exports.up = (pgm) => {
  pgm.createTable('services', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    name: { type: 'varchar(100)', notNull: true },
    description: { type: 'text' },
    duration_minutes: { type: 'integer', notNull: true, default: 60 },
    price: { type: 'numeric(12,2)', notNull: true, default: 0 },
    capacity: { type: 'integer', notNull: true, default: 1 },
    location: { type: 'varchar(200)' },
    image_url: { type: 'varchar(500)' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.sql(`
    CREATE TRIGGER trg_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);

  // Seed demo services
  pgm.sql(`
    INSERT INTO services (name, description, duration_minutes, price, capacity, location) VALUES
      ('Phòng họp A',   'Phòng họp nhỏ, tối đa 8 người, có máy chiếu',        60,  150000,  8, 'Tầng 2'),
      ('Phòng họp B',   'Phòng họp lớn, tối đa 20 người, có màn hình TV',     60,  300000, 20, 'Tầng 3'),
      ('Phòng đào tạo', 'Phòng đào tạo với bảng trắng và máy chiếu kép',     120,  500000, 30, 'Tầng 4'),
      ('Tư vấn 1-1',    'Buổi tư vấn cá nhân với chuyên gia',                 30,  200000,  1, 'Văn phòng 101'),
      ('Workshop',      'Không gian workshop sáng tạo, thoải mái',           180,  800000, 15, 'Khu A');
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TRIGGER IF EXISTS trg_services_updated_at ON services');
  pgm.dropTable('services');
};

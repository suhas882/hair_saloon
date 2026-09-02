import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import bcrypt from 'bcryptjs';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const DB_PATH = path.join(DATA_DIR, 'salon.db');
const TMP_DB_PATH = '/tmp/salon.db';

let db = null;
let SQL = null;
let initPromise = null;

// Ensure data directory exists if possible
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Read-only filesystem in serverless
}

export async function initDB() {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Find wasm file buffer
      let wasmBinary = null;
      try {
        const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm');
        if (fs.existsSync(wasmPath)) {
          wasmBinary = fs.readFileSync(wasmPath);
        }
      } catch (e) {
        console.warn('WASM path resolution warning:', e.message);
      }

      if (wasmBinary) {
        SQL = await initSqlJs({ wasmBinary });
      } else {
        SQL = await initSqlJs({
          locateFile: (file) => path.join(__dirname, '../../node_modules/sql.js/dist', file)
        });
      }

      // Try loading existing DB
      if (fs.existsSync(TMP_DB_PATH)) {
        try {
          const filebuffer = fs.readFileSync(TMP_DB_PATH);
          db = new SQL.Database(filebuffer);
          console.log('📦 Loaded existing SQLite database from /tmp.');
        } catch (e) {
          console.warn('Could not read from /tmp/salon.db:', e.message);
        }
      } else if (fs.existsSync(DB_PATH)) {
        try {
          const filebuffer = fs.readFileSync(DB_PATH);
          db = new SQL.Database(filebuffer);
          console.log('📦 Loaded existing SQLite database from data/salon.db.');
        } catch (e) {
          console.warn('Could not read from data/salon.db:', e.message);
        }
      }

      if (!db) {
        db = new SQL.Database();
        console.log('✨ Initialized new SQLite database in memory.');
      }

      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON;');

      // Create tables
      createSchema();
      // Seed sample data if empty
      await seedInitialData();

      // Save to disk if writable
      saveDB();

      return db;
    } catch (err) {
      console.error('CRITICAL: initDB failed:', err);
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

export function saveDB() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    try {
      fs.writeFileSync(DB_PATH, buffer);
    } catch (e) {
      // Read-only, try /tmp
      fs.writeFileSync(TMP_DB_PATH, buffer);
    }
  } catch (err) {
    console.error('Error saving database to disk:', err);
  }
}

// Database helper functions
export function query(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function get(sql, params = []) {
  const rows = query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function run(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  db.run(sql, params);
  
  // Get last insert ID and changes
  const lastIdRes = query('SELECT last_insert_rowid() as id');
  const changesRes = query('SELECT changes() as changes');
  
  saveDB(); // Automatically persist to disk
  
  return {
    lastInsertRowid: lastIdRes[0]?.id || 0,
    changes: changesRes[0]?.changes || 0,
  };
}

export function exec(sql) {
  if (!db) throw new Error('Database not initialized');
  db.exec(sql);
  saveDB();
}

function createSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'customer')) DEFAULT 'customer',
      approval_status TEXT NOT NULL CHECK(approval_status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      duration_minutes INTEGER NOT NULL,
      category TEXT DEFAULT 'Styling',
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chairs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chair_number INTEGER UNIQUE NOT NULL CHECK(chair_number BETWEEN 1 AND 4),
      name TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('available', 'booked', 'occupied', 'blocked', 'no_show')) DEFAULT 'available',
      is_blocked INTEGER DEFAULT 0,
      block_reason TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
      chair_id INTEGER NOT NULL REFERENCES chairs(id) ON DELETE RESTRICT,
      booking_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('confirmed', 'customer_arrived', 'in_service', 'completed', 'cancelled', 'no_show')) DEFAULT 'confirmed',
      no_show_resolution TEXT CHECK(no_show_resolution IN ('keep_blocked', 'released', NULL)),
      notes TEXT,
      total_price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS salon_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      salon_name TEXT NOT NULL DEFAULT 'LUXE',
      tagline TEXT NOT NULL DEFAULT 'Salon & Lounge',
      description TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      hours_mon_fri TEXT DEFAULT '09:00 AM - 08:00 PM',
      hours_sat TEXT DEFAULT '09:00 AM - 08:00 PM',
      hours_sun TEXT DEFAULT '10:00 AM - 06:00 PM',
      badge_text TEXT DEFAULT 'Sanitized & Private 4-Station Layout',
      guarantee_text TEXT DEFAULT 'Zero Wait Time Guarantee',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure default salon settings exist
  const existingSettings = get('SELECT id FROM salon_settings WHERE id = 1');
  if (!existingSettings) {
    run(`
      INSERT INTO salon_settings (id, salon_name, tagline, description, address, phone, email, hours_mon_fri, hours_sat, hours_sun, badge_text, guarantee_text)
      VALUES (
        1,
        'LUXE',
        'Salon & Lounge',
        'A premier 4-chair luxury salon offering personalized executive grooming, bespoke hair styling, balayage coloring, and restorative head spa treatments in an ambiance of refined sophistication.',
        '450 Prestige Avenue, Grand Boulevard, Suite 101',
        '+91 98765 43210',
        'concierge@luxesalon.com',
        '09:00 AM - 08:00 PM',
        '09:00 AM - 08:00 PM',
        '10:00 AM - 06:00 PM',
        'Sanitized & Private 4-Station Layout',
        'Zero Wait Time Guarantee'
      )
    `);
  }
}

async function seedInitialData() {
  const userCount = get('SELECT COUNT(*) as count FROM users');
  if (userCount && userCount.count > 0) {
    return; // Already seeded
  }

  console.log('🌱 Seeding initial salon database records...');

  const adminPass = await bcrypt.hash('Admin@123', 10);
  const custPass = await bcrypt.hash('Customer@123', 10);

  // 1. Seed Users
  run(`
    INSERT INTO users (name, email, phone, password_hash, role, approval_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `, ['Salon Director (Admin)', 'admin@salon.com', '+1 (555) 019-2834', adminPass, 'admin', 'approved']);

  run(`
    INSERT INTO users (name, email, phone, password_hash, role, approval_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `, ['Rahul Sharma', 'rahul@example.com', '+1 (555) 432-8765', custPass, 'customer', 'approved']);

  run(`
    INSERT INTO users (name, email, phone, password_hash, role, approval_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `, ['Priya Patel', 'priya@example.com', '+1 (555) 789-1234', custPass, 'customer', 'approved']);

  run(`
    INSERT INTO users (name, email, phone, password_hash, role, approval_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `, ['Ananya Roy', 'ananya@example.com', '+1 (555) 321-6547', custPass, 'customer', 'pending']);

  run(`
    INSERT INTO users (name, email, phone, password_hash, role, approval_status)
    VALUES (?, ?, ?, ?, ?, ?)
  `, ['Dev Mehta', 'dev@example.com', '+1 (555) 654-9870', custPass, 'customer', 'rejected']);

  // 2. Seed 4 Chairs
  run(`
    INSERT INTO chairs (chair_number, name, status, is_blocked, block_reason)
    VALUES 
    (1, 'Chair 1 - Master Styling Bay', 'booked', 0, NULL),
    (2, 'Chair 2 - Precision Cut Station', 'available', 0, NULL),
    (3, 'Chair 3 - Color & Spa Suite', 'occupied', 0, NULL),
    (4, 'Chair 4 - VIP Lounge Station', 'available', 0, NULL)
  `);

  // 3. Seed Services (Prices in INR ₹)
  const services = [
    {
      name: 'Signature Executive Haircut & Styling',
      description: 'Precision haircut customized to face shape, accompanied by scalp massage, hot towel treatment, and luxury pomade styling.',
      price: 499.00,
      duration_minutes: 45,
      category: 'Haircut',
      image_url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80',
      is_active: 1
    },
    {
      name: 'Luxury Beard Sculpting & Hot Towel',
      description: 'Detailed beard sculpting with straight razor line-up, essential oil conditioning, and soothing sandalwood hot towel wrap.',
      price: 349.00,
      duration_minutes: 30,
      category: 'Grooming',
      image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80',
      is_active: 1
    },
    {
      name: 'Balayage & Hair Gloss Treatment',
      description: 'Custom hand-painted French balayage highlight with root-melt toner, moisture sealing glaze, and blowout finish.',
      price: 2499.00,
      duration_minutes: 90,
      category: 'Coloring',
      image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
      is_active: 1
    },
    {
      name: 'Brazilian Keratin Smoothing Therapy',
      description: 'Intense anti-frizz keratin protein treatment that revitalizes damaged hair strands and produces sleek, mirror-like shine for months.',
      price: 3999.00,
      duration_minutes: 120,
      category: 'Treatment',
      image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      is_active: 1
    },
    {
      name: 'Deep Detox Charcoal & Gold Facial',
      description: 'Pore-purifying activated bamboo charcoal treatment combined with 24k gold essence serum and lymphatic face massage.',
      price: 899.00,
      duration_minutes: 45,
      category: 'Facial',
      image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
      is_active: 1
    },
    {
      name: 'Traditional Royal Straight Razor Shave',
      description: 'Ultra-close traditional barber shave with pre-shave badger brush lather, dual hot towels, and chilled botanical toner.',
      price: 299.00,
      duration_minutes: 30,
      category: 'Grooming',
      image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      is_active: 1
    },
    {
      name: 'Japanese Head Spa & Scalp Therapy',
      description: 'Holistic waterfall scalp rinse, micro-exfoliation, pressure-point neck massage, and restorative hair moisture mask.',
      price: 1199.00,
      duration_minutes: 60,
      category: 'Treatment',
      image_url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80',
      is_active: 1
    },
    {
      name: 'Bridal & Gala Couture Hair Updo',
      description: 'Intricate red-carpet and bridal styling session featuring pins, curls, botanical mist, and structural hold.',
      price: 1999.00,
      duration_minutes: 60,
      category: 'Styling',
      image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80',
      is_active: 1
    }
  ];

  for (const s of services) {
    run(`
      INSERT INTO services (name, description, price, duration_minutes, category, image_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [s.name, s.description, s.price, s.duration_minutes, s.category, s.image_url, s.is_active]);
  }

  // 4. Seed sample bookings for today (in INR)
  const today = new Date().toISOString().split('T')[0];

  // Booking on Chair 1
  run(`
    INSERT INTO bookings (customer_id, service_id, chair_id, booking_date, start_time, end_time, status, total_price, notes)
    VALUES (?, 1, 1, ?, '10:00', '10:45', 'confirmed', 499.00, 'Preferred scissor cut on sides.')
  `, [2, today]);

  // Booking on Chair 3 (In Service)
  run(`
    INSERT INTO bookings (customer_id, service_id, chair_id, booking_date, start_time, end_time, status, total_price, notes)
    VALUES (?, 3, 3, ?, '11:00', '12:30', 'in_service', 2499.00, 'Honey blonde balayage highlight.')
  `, [3, today]);

  // 5. Seed Notifications
  run(`
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES 
    (NULL, 'customer_registered', 'New Customer Registration', 'Ananya Roy has registered and is pending approval.', '/admin/customers'),
    (NULL, 'booking_created', 'New Appointment Booked', 'Rahul Sharma booked Signature Executive Haircut for today at 10:00 AM on Chair 1.', '/admin/bookings'),
    (NULL, 'booking_created', 'New Appointment Booked', 'Priya Patel booked Balayage & Hair Gloss for today at 11:00 AM on Chair 3.', '/admin/bookings'),
    (2, 'status_update', 'Account Approved', 'Welcome to Luxe Salon! Your account has been approved by the management. You can now book appointments.', '/customer/book')
  `);

  console.log('✅ Initial database seed completed successfully.');
}

export default {
  initDB,
  saveDB,
  query,
  get,
  run,
  exec,
};

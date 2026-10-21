// @ts-ignore
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

function findProjectRoot(): string {
  let curr = process.cwd();
  for (let i = 0; i < 6; i++) {
    const pkgPath = path.join(curr, "package.json");
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        if (pkg.name === "factoryos-monorepo" || Array.isArray(pkg.workspaces)) {
          return curr;
        }
      } catch {
        // ignore
      }
    }
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }
  return process.cwd();
}

function getDbPath(): string {
  if (process.env.DATABASE_PATH) {
    const customPath = process.env.DATABASE_PATH;
    const dir = path.dirname(customPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return customPath;
  }
  const root = findProjectRoot();
  const dir = path.join(root, "data", "db");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, "factoryos.sqlite");
}

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    const dbPath = getDbPath();
    dbInstance = new DatabaseSync(dbPath);
    // Enable WAL mode and foreign keys for durability and data integrity
    dbInstance.exec("PRAGMA journal_mode = WAL;");
    dbInstance.exec("PRAGMA foreign_keys = ON;");
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT DEFAULT 'OWNER',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS factories (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      registration_id TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      country TEXT DEFAULT 'India',
      postal_code TEXT,
      locations_count INTEGER DEFAULT 1,
      establishment_year INTEGER,
      floor_area_sqft REAL,
      employees_count INTEGER,
      timezone TEXT DEFAULT 'Asia/Kolkata',
      primary_contact_name TEXT,
      primary_contact_email TEXT,
      primary_contact_phone TEXT,
      industry TEXT,
      industry_custom TEXT,
      product_categories TEXT,
      manufacturing_process TEXT,
      production_model TEXT,
      production_lines_count INTEGER DEFAULT 1,
      is_setup_complete INTEGER DEFAULT 0,
      current_setup_step INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS machines (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      asset_tag TEXT,
      type TEXT NOT NULL,
      manufacturer TEXT,
      model TEXT,
      serial_number TEXT,
      quantity INTEGER DEFAULT 1,
      department TEXT,
      installation_date TEXT,
      rated_capacity REAL,
      capacity_unit TEXT,
      operating_shift TEXT,
      status TEXT DEFAULT 'OPERATIONAL',
      maintenance_notes TEXT,
      speed_units_per_hr REAL DEFAULT 0,
      hourly_rate_inr REAL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS raw_materials (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      sku TEXT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL,
      physical_stock REAL DEFAULT 0,
      reserved_stock REAL DEFAULT 0,
      reorder_threshold REAL DEFAULT 0,
      supplier_name TEXT,
      storage_location TEXT,
      batch_number TEXT,
      expiry_date TEXT,
      unit_cost_inr REAL DEFAULT 0,
      estimated_consumption_rate REAL DEFAULT 0,
      is_hazardous INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS machine_material_mappings (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      machine_id TEXT NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
      material_id TEXT NOT NULL REFERENCES raw_materials(id) ON DELETE CASCADE,
      process_stage TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workers (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      employee_id TEXT,
      full_name TEXT NOT NULL,
      department TEXT NOT NULL,
      job_role TEXT NOT NULL,
      contact_number TEXT,
      skills TEXT,
      employment_status TEXT DEFAULT 'ACTIVE',
      assigned_shift TEXT DEFAULT 'MORNING',
      date_joined TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS worker_machine_assignments (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      worker_id TEXT NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
      machine_id TEXT NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      shift TEXT,
      start_date TEXT,
      end_date TEXT,
      status TEXT DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS import_jobs (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      filename TEXT NOT NULL,
      total_rows INTEGER NOT NULL,
      created_count INTEGER NOT NULL,
      skipped_count INTEGER NOT NULL,
      failed_count INTEGER NOT NULL,
      status TEXT NOT NULL,
      summary TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS setup_progress (
      id TEXT PRIMARY KEY,
      factory_id TEXT UNIQUE NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      current_step INTEGER DEFAULT 1,
      completed_steps TEXT,
      step_data TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      email TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      order_number TEXT NOT NULL,
      customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      product_type TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT DEFAULT 'PIECES',
      agreed_price_inr REAL NOT NULL,
      status TEXT DEFAULT 'SCHEDULED',
      priority TEXT DEFAULT 'NORMAL',
      deadline TEXT NOT NULL,
      risk_rating TEXT DEFAULT 'SAFE',
      risk_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price_inr REAL NOT NULL,
      total_price_inr REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production_jobs (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
      machine_id TEXT REFERENCES machines(id) ON DELETE SET NULL,
      job_number TEXT NOT NULL,
      title TEXT NOT NULL,
      product_type TEXT NOT NULL,
      substrate_sku TEXT,
      planned_quantity REAL NOT NULL,
      completed_quantity REAL DEFAULT 0,
      waste_quantity REAL DEFAULT 0,
      status TEXT DEFAULT 'QUEUED',
      start_time TEXT,
      end_time TEXT,
      duration_mins INTEGER DEFAULT 60,
      changeover_saved TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS production_events (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      job_id TEXT REFERENCES production_jobs(id) ON DELETE CASCADE,
      worker_id TEXT,
      actor_name TEXT,
      event_type TEXT NOT NULL,
      quantity_delta REAL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS maintenance_work_orders (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      machine_id TEXT NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      reason TEXT NOT NULL,
      priority TEXT DEFAULT 'MEDIUM',
      duration_mins INTEGER DEFAULT 30,
      technician TEXT NOT NULL,
      status TEXT DEFAULT 'IN_PROGRESS',
      spare_parts_used TEXT,
      cost_inr REAL DEFAULT 0,
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      material_id TEXT NOT NULL REFERENCES raw_materials(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      quantity REAL NOT NULL,
      reference_type TEXT,
      reference_id TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stock_reservations (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      material_id TEXT NOT NULL REFERENCES raw_materials(id) ON DELETE CASCADE,
      order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
      job_id TEXT REFERENCES production_jobs(id) ON DELETE CASCADE,
      reserved_quantity REAL NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT,
      phone TEXT,
      email TEXT,
      lead_time TEXT,
      rating TEXT DEFAULT 'Tier 1 Verified',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      po_number TEXT NOT NULL,
      supplier_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
      supplier_name TEXT NOT NULL,
      material_id TEXT REFERENCES raw_materials(id) ON DELETE SET NULL,
      item_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT DEFAULT 'reams',
      unit_cost_inr REAL DEFAULT 0,
      total_cost_inr REAL NOT NULL,
      status TEXT DEFAULT 'DRAFT',
      order_date TEXT NOT NULL,
      expected_delivery TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      source_entity TEXT,
      source_id TEXT,
      target_tab TEXT,
      target_label TEXT,
      status TEXT DEFAULT 'ACTIVE',
      resolved INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS knowledge_records (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      rule_text TEXT NOT NULL,
      confidence TEXT DEFAULT 'Verified Rule',
      added_by TEXT NOT NULL,
      is_verified INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      factory_id TEXT NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS factory_settings (
      factory_id TEXT PRIMARY KEY REFERENCES factories(id) ON DELETE CASCADE,
      name TEXT,
      location TEXT,
      shifts_per_day INTEGER DEFAULT 2,
      shift_hours REAL DEFAULT 8,
      operating_days_per_week INTEGER DEFAULT 6,
      currency TEXT DEFAULT 'INR (₹)',
      timezone TEXT DEFAULT 'Asia/Kolkata (IST)',
      low_stock_threshold_pct REAL DEFAULT 20,
      downtime_alert_threshold_mins INTEGER DEFAULT 30,
      updated_at TEXT NOT NULL
    );

    -- Indices for tenant-isolated lookups
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_factories_owner ON factories(owner_id);
    CREATE INDEX IF NOT EXISTS idx_machines_factory ON machines(factory_id);
    CREATE INDEX IF NOT EXISTS idx_materials_factory ON raw_materials(factory_id);
    CREATE INDEX IF NOT EXISTS idx_workers_factory ON workers(factory_id);
    CREATE INDEX IF NOT EXISTS idx_mappings_factory ON machine_material_mappings(factory_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_factory ON worker_machine_assignments(factory_id);
    CREATE INDEX IF NOT EXISTS idx_import_jobs_factory ON import_jobs(factory_id);
    CREATE INDEX IF NOT EXISTS idx_orders_factory ON orders(factory_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_factory ON order_items(factory_id);
    CREATE INDEX IF NOT EXISTS idx_prod_jobs_factory ON production_jobs(factory_id);
    CREATE INDEX IF NOT EXISTS idx_prod_events_factory ON production_events(factory_id);
    CREATE INDEX IF NOT EXISTS idx_maintenance_factory ON maintenance_work_orders(factory_id);
    CREATE INDEX IF NOT EXISTS idx_inv_tx_factory ON inventory_transactions(factory_id);
    CREATE INDEX IF NOT EXISTS idx_stock_res_factory ON stock_reservations(factory_id);
    CREATE INDEX IF NOT EXISTS idx_suppliers_factory ON suppliers(factory_id);
    CREATE INDEX IF NOT EXISTS idx_purchase_orders_factory ON purchase_orders(factory_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_factory ON alerts(factory_id);
    CREATE INDEX IF NOT EXISTS idx_knowledge_factory ON knowledge_records(factory_id);
    CREATE INDEX IF NOT EXISTS idx_audit_factory ON audit_events(factory_id);
  `);

  try {
    db.exec("ALTER TABLE raw_materials ADD COLUMN damaged_stock REAL DEFAULT 0;");
  } catch {}
}

/**
 * Ensures initial domain data exists for a factory so all 15 modules are immediately functional.
 */
export function seedFactoryDefaults(factoryId: string, forceReset = false): void {
  // Permanently disabled.
  // FactoryOS demo mode is isolated in memory (lib/demoData.ts).
  // Mock/sample records are never written to the SQLite user database.
  return;
}


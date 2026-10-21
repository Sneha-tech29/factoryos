"""SQLite relational database connection and schema initialization for FactoryOS API."""

import sqlite3
from pathlib import Path
from typing import Optional

# Path to unified factoryos database
DB_PATH = Path(__file__).resolve().parents[4] / "data" / "db" / "factoryos.sqlite"


def get_db_connection(db_file: Optional[Path] = None) -> sqlite3.Connection:
    target_path = db_file or DB_PATH
    target_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(target_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    init_db_schema(conn)
    return conn


def init_db_schema(conn: sqlite3.Connection):
    conn.executescript("""
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

    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_factories_owner ON factories(owner_id);
    CREATE INDEX IF NOT EXISTS idx_machines_factory ON machines(factory_id);
    CREATE INDEX IF NOT EXISTS idx_materials_factory ON raw_materials(factory_id);
    CREATE INDEX IF NOT EXISTS idx_workers_factory ON workers(factory_id);
    """)
    conn.commit()

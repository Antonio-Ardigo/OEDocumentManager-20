import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from "@shared/schema";
import path from 'path';
import os from 'os';
import fs from 'fs';

// Create user data directory for the application
const userDataPath = path.join(os.homedir(), '.wsm-oe-manager');
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

const dbPath = path.join(userDataPath, 'wsm-oe.db');

// Create SQLite connection
const sqlite = new Database(dbPath);

// Enable foreign keys and WAL mode for better performance
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('journal_mode = WAL');

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

// Initialize database with tables if they don't exist
export function initializeDatabase() {
  console.log('Initializing database at:', dbPath);
  
  // Create tables manually since we're using SQLite
  const createTablesSQL = `
    -- Sessions table for authentication
    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expire DATETIME NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
    
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      email TEXT UNIQUE,
      first_name TEXT,
      last_name TEXT,
      profile_image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- OE Elements table
    CREATE TABLE IF NOT EXISTS oe_elements (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      element_number INTEGER NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- OE Processes table
    CREATE TABLE IF NOT EXISTS oe_processes (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      element_id TEXT NOT NULL,
      process_number TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      process_owner TEXT,
      review_frequency TEXT,
      last_review_date DATETIME,
      next_review_date DATETIME,
      process_status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (element_id) REFERENCES oe_elements(id) ON DELETE CASCADE
    );
    
    -- Process Steps table
    CREATE TABLE IF NOT EXISTS process_steps (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      process_id TEXT NOT NULL,
      step_number TEXT NOT NULL,
      step_name TEXT NOT NULL,
      step_details TEXT,
      responsible_role TEXT,
      estimated_time TEXT,
      required_resources TEXT,
      step_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (process_id) REFERENCES oe_processes(id) ON DELETE CASCADE
    );
    
    -- Performance Measures table
    CREATE TABLE IF NOT EXISTS performance_measures (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      process_id TEXT NOT NULL,
      measure_name TEXT NOT NULL,
      measure_type TEXT NOT NULL,
      target_value TEXT,
      current_value TEXT,
      measurement_frequency TEXT,
      data_source TEXT,
      responsible_person TEXT,
      last_measured DATETIME,
      trend TEXT DEFAULT 'stable',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (process_id) REFERENCES oe_processes(id) ON DELETE CASCADE
    );
    
    -- Document Versions table
    CREATE TABLE IF NOT EXISTS document_versions (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      process_id TEXT NOT NULL,
      version_number TEXT NOT NULL,
      change_description TEXT,
      changed_by TEXT,
      change_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      approval_status TEXT DEFAULT 'pending',
      approved_by TEXT,
      approval_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (process_id) REFERENCES oe_processes(id) ON DELETE CASCADE
    );
  `;

  // Execute the SQL to create tables
  sqlite.exec(createTablesSQL);
  
  // Insert sample data if database is empty
  const elementCount = sqlite.prepare('SELECT COUNT(*) as count FROM oe_elements').get() as { count: number };
  
  if (elementCount.count === 0) {
    console.log('Inserting sample data...');
    insertSampleData();
  }
  
  console.log('Database initialization complete');
}

function insertSampleData() {
  const sampleElements = [
    { elementNumber: 3, title: 'Plant Management & Operations', description: 'Comprehensive management of plant operations, maintenance, and safety procedures.' },
    { elementNumber: 4, title: 'Asset Management', description: 'Strategic management of physical assets throughout their lifecycle.' },
    { elementNumber: 5, title: 'Strategic Localization', description: 'Adapting global strategies to local market conditions and requirements.' }
  ];

  const insertElement = sqlite.prepare(`
    INSERT INTO oe_elements (element_number, title, description)
    VALUES (?, ?, ?)
  `);

  for (const element of sampleElements) {
    insertElement.run(element.elementNumber, element.title, element.description);
  }

  console.log('Sample data inserted successfully');
}

// Export SQLite instance for direct queries if needed
export { sqlite };

// Initialize on module load
initializeDatabase();
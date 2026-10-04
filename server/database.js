import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'leads.db');
const sqldb = sqlite3.verbose();

let db;
try {
  db = new sqldb.Database(dbPath, (err) => {
    if (err) {
      console.warn('Failed to open disk database, falling back to in-memory SQLite:', err.message);
      db = new sqldb.Database(':memory:');
    }
  });
} catch (e) {
  db = new sqldb.Database(':memory:');
}

db.configure('busyTimeout', 10000);
db.run('PRAGMA journal_mode = MEMORY', () => {});
db.run('PRAGMA synchronous = OFF', () => {});



// Promisified DB helpers
export const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Safe helper to add columns if they don't already exist
const ensureColumn = async (table, column, definition) => {
  try {
    const columns = await dbQuery(`PRAGMA table_info(${table})`);
    const exists = columns.some(c => c.name === column);
    if (!exists) {
      await dbRun(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`Added column ${column} to table ${table}`);
    }
  } catch (err) {
    console.warn(`Could not add column ${column} to ${table}:`, err.message);
  }
};

const setupSchema = async () => {


  // 1. Leads Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      website TEXT,
      industry TEXT,
      employee_count TEXT,
      location TEXT,
      contact_name TEXT,
      contact_title TEXT,
      contact_linkedin TEXT,
      contact_email TEXT,
      status TEXT DEFAULT 'Needs Review',
      icp_score REAL DEFAULT 85.0,
      intel_dossier TEXT,
      pain_points TEXT,
      draft_email TEXT,
      original_draft TEXT,
      subject_variant_a TEXT,
      subject_variant_b TEXT,
      follow_up_draft TEXT,
      reflection_score REAL,
      reflection_feedback TEXT,
      deliverability_score REAL DEFAULT 92.0,
      spam_risk TEXT DEFAULT 'Low',
      token_usage TEXT,
      campaign_id INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      sent_at DATETIME
    )
  `);

  // Run migrations for any existing columns
  await ensureColumn('leads', 'industry', 'TEXT');
  await ensureColumn('leads', 'employee_count', 'TEXT');
  await ensureColumn('leads', 'location', 'TEXT');
  await ensureColumn('leads', 'icp_score', 'REAL DEFAULT 85.0');
  await ensureColumn('leads', 'original_draft', 'TEXT');
  await ensureColumn('leads', 'subject_variant_a', 'TEXT');
  await ensureColumn('leads', 'subject_variant_b', 'TEXT');
  await ensureColumn('leads', 'follow_up_draft', 'TEXT');
  await ensureColumn('leads', 'deliverability_score', 'REAL DEFAULT 92.0');
  await ensureColumn('leads', 'spam_risk', "TEXT DEFAULT 'Low'");
  await ensureColumn('leads', 'campaign_id', 'INTEGER DEFAULT 1');
  await ensureColumn('leads', 'sent_at', 'DATETIME');

  // 2. Activity Logs Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER,
      agent TEXT,
      level TEXT DEFAULT 'info',
      message TEXT,
      latency_ms INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(lead_id) REFERENCES leads(id) ON DELETE CASCADE
    )
  `);
  await ensureColumn('activity_logs', 'level', "TEXT DEFAULT 'info'");
  await ensureColumn('activity_logs', 'latency_ms', 'INTEGER DEFAULT 0');

  // 3. Campaigns Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_persona TEXT NOT NULL,
      offering TEXT NOT NULL,
      value_prop TEXT NOT NULL,
      tone TEXT DEFAULT 'Executive',
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. Settings Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // Default settings if not exists
  const hasSettings = await dbGet('SELECT COUNT(*) as count FROM settings');
  if (hasSettings.count === 0) {
    const defaultProfile = {
      companyName: '',
      website: '',
      industry: '',
      productDescription: '',
      offering: '',
      targetPersona: '',
      valueProp: '',
      socialProof: '',
      senderName: '',
      senderTitle: '',
      senderEmail: '',
      emailSignature: '',
      defaultCampaignId: null,
      targetTitles: ['VP of Engineering', 'Chief Technology Officer', 'Head of Infrastructure', 'Founder', 'CEO'],
      targetHeadcounts: ['11-50', '51-200', '201-1000'],
      desiredTech: [],
      negativeExclusions: ['Agencies', 'Consultancies', 'Staffing', 'Student Projects'],
      agentControls: {
        enabledAgents: { agent1: true, agent2: true, agent3: true, agent4: true, agent5: true },
        emailTone: 'consultative',
        ctaType: 'soft_interest',
        maxWordCount: 120,
        autopilotApprovalThreshold: 90,
        minIcpScoreFloor: 60,
        minDeliverabilityScore: 90,
        useSearchGrounding: true,
        useLiveHtmlInspection: true,
        customSystemInstructions: ''
      }
    };
    await dbRun('INSERT INTO settings (key, value) VALUES (?, ?)', ['client_profile', JSON.stringify(defaultProfile)]);
  }

  // Purge any legacy SMTP config from settings table for security
  await dbRun("DELETE FROM settings WHERE key = 'smtp_config'");
};

export const initDatabase = async () => {
  console.log('Initializing LeadLens Enterprise SQLite schema...');
  try {
    await setupSchema();
  } catch (err) {
    console.warn(`[SQLite] Disk store encountered: ${err.message}. Seamlessly switching to in-memory SQLite store...`);
    db = new sqldb.Database(':memory:');
    await setupSchema();
    console.log('✅ LeadLens In-Memory SQLite store successfully initialized.');
  }
};


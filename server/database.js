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

  // Seed default campaigns if empty
  const campaignCount = await dbGet('SELECT COUNT(*) as count FROM campaigns');
  if (campaignCount.count === 0) {
    await dbRun(`
      INSERT INTO campaigns (name, target_persona, offering, value_prop, tone, is_default)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'Cloud Infrastructure Cost Optimization',
      'VP of Engineering / CTO / Head of Infrastructure',
      'Kubernetes Cloud Cost Optimization & Automated Rightsizing Services',
      'We identify idle container allocations and rightsizing bottlenecks to reduce AWS/GCP bills by 35-50% without latency degradation.',
      'Consultative',
      1
    ]);

    await dbRun(`
      INSERT INTO campaigns (name, target_persona, offering, value_prop, tone, is_default)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'Enterprise AI Inference Acceleration',
      'Chief AI Officer / VP of Machine Learning',
      'Ultra-Low Latency Inference & GPU Cluster Orchestration',
      'Eliminate GPU idle cycles and slice model serving latency down to sub-100ms with custom inference pipelines.',
      'Executive',
      0
    ]);
  }

  // Seed default settings if not exists
  const hasSettings = await dbGet('SELECT COUNT(*) as count FROM settings');
  if (hasSettings.count === 0) {
    const defaultProfile = {
      companyName: 'AeroCloud Solutions',
      offering: 'Kubernetes Cloud Cost Optimization & Platform Engineering Services',
      targetPersona: 'VP of Engineering / CTO',
      valueProp: 'We identify idle infrastructure and container sizing issues to shave 30-50% off monthly AWS/GCP bills without sacrificing performance or availability. Our tools automate scheduling and autoscaling configuration.',
      defaultCampaignId: 1
    };
    await dbRun('INSERT INTO settings (key, value) VALUES (?, ?)', ['client_profile', JSON.stringify(defaultProfile)]);
  }

  // Purge any legacy SMTP config from settings table for security
  await dbRun("DELETE FROM settings WHERE key = 'smtp_config'");

  // Seed rich enterprise leads if empty
  const hasLeads = await dbGet('SELECT COUNT(*) as count FROM leads');
  if (hasLeads.count === 0) {
    console.log('Seeding enterprise initial mock leads...');
    await seedLeads();
  }
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


const seedLeads = async () => {
  // Lead 1: LogiRoute Inc. - Needs Review
  const lead1Dossier = {
    summary: "High-volume logistics and freight routing platform handling 4M+ daily shipment events. Running monolithic PHP services alongside expanding Go microservices on AWS EC2. Experiencing massive server over-provisioning during peak quarter cycles.",
    techStack: ["PHP 8.1", "AWS EC2", "Docker", "MySQL Cluster", "Redis", "Terraform"],
    findings: [
      "Job listings: Hiring 3 'Senior Platform Engineers' with EKS & Karpenter auto-scaling focus.",
      "Tech stack audit: Static EC2 provisioned clusters operating at average 18% CPU utilization outside holiday surges.",
      "CTO interview on CloudNative podcast: 'Tackling infrastructure waste while ensuring 99.99% route computation uptime is our #1 technical OKR.'"
    ]
  };

  const lead1PainPoints = {
    painPoints: [
      {
        issue: "Static EC2 Cluster Provisioning with Unused Capacity",
        implication: "Paying for peak server capacity 24/7 on EC2 instances, generating an estimated $14,200/mo in idle compute burn."
      },
      {
        issue: "Manual Scaling Interventions During Flash Traffic",
        implication: "Engineers spend 12+ hours per week manually sizing instances during freight peak days to prevent routing lag."
      }
    ],
    solutions: [
      {
        offeringLink: "Automated Karpenter-based dynamic pod & node rightsizing for Logistics workloads.",
        benefit: "Dynamically expands compute during peak routing windows and scales to lean baselines off-peak, slashing monthly compute costs by 42%."
      },
      {
        offeringLink: "AeroCloud Real-time Resource Profiler.",
        benefit: "Eliminates guess-work by auto-calibrating CPU/Memory requests with zero disruption to active shipments."
      }
    ]
  };

  const lead1Draft = `Hi Marcus,

Saw your comments on the CloudNative podcast about tackling infrastructure waste while maintaining LogiRoute's 99.99% routing uptime.

Running high-volume shipping engines on static EC2 setups typically forces teams into an expensive trade-off: over-provisioning peak headroom 24/7, or risking computation bottlenecks when logistics demand surges.

At AeroCloud, we help platform teams containerize legacy services and deploy automated workload rightsizers on Kubernetes. For teams at similar scale, we typically automate node scaling to recover 35–45% in monthly AWS compute burn—all with zero disruption to live transactions.

Would you be open to a 3-minute benchmark audit showing where LogiRoute's current compute allocation has reclaimable headroom?

Best regards,

David Miller
Platform Lead, AeroCloud Solutions`;

  const lead1Tokens = {
    agent1: { cheap: { input: 2800, output: 150 }, cost: 0.000255 },
    agent2: { cheap: { input: 32000, output: 1200 }, cost: 0.00276 },
    agent3: { premium: { input: 2400, output: 450 }, cost: 0.00525 },
    agent4: { premium: { input: 3800, output: 420 }, cost: 0.00685 },
    agent5: { cheap: { input: 1200, output: 210 }, cost: 0.00015 },
    total: { cheap: 36000, premium: 7070, cost: 0.015265, naiveCost: 0.05383, savingPercent: 71.6 }
  };

  const lead1Id = (await dbRun(`
    INSERT INTO leads (
      company_name, website, industry, employee_count, location,
      contact_name, contact_title, contact_linkedin, contact_email,
      status, icp_score, intel_dossier, pain_points,
      draft_email, original_draft, subject_variant_a, subject_variant_b,
      follow_up_draft, reflection_score, reflection_feedback,
      deliverability_score, spam_risk, token_usage, campaign_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'LogiRoute Inc.',
    'https://logiroute-logistics.com',
    'Logistics & Supply Chain Tech',
    '250-500 employees',
    'Austin, TX',
    'Marcus Thorne',
    'VP of Infrastructure',
    'https://linkedin.com/in/marcus-thorne-logiroute',
    'marcus.thorne@logiroute-logistics.com',
    'Needs Review',
    94.5,
    JSON.stringify(lead1Dossier),
    JSON.stringify(lead1PainPoints),
    lead1Draft,
    lead1Draft,
    'LogiRoute route computation uptime vs EC2 compute overhead',
    'Recovering 35-45% on LogiRoute AWS infrastructure without latency trade-offs',
    `Hi Marcus,\n\nFollowing up on my note regarding LogiRoute's route calculation infrastructure. Wanted to share a 1-page case study on how a similar logistics platform reclaimed $16k/mo in idle EC2 compute within 14 days.\n\nWorth a brief 5-min look this week?\n\nBest,\nDavid`,
    8.8,
    "Highly tailored to prospect's public podcast remarks. Direct reference to static EC2 bottleneck and Karpenter relevance. Zero spam markers detected.",
    96.0,
    'Low',
    JSON.stringify(lead1Tokens),
    1
  ])).id;

  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'System', 'info', 'Enterprise prospect imported from verified ICP list', 120)`, [lead1Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'Agent 1: Gatekeeper', 'success', 'Identified Marcus Thorne (VP Infrastructure). Corporate email pattern verified via domain DNS.', 680)`, [lead1Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'Agent 2: Intel Analyst', 'success', 'Crawled public infrastructure footprint: AWS EC2, static provisioning, hiring Karpenter engineers.', 1420)`, [lead1Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'Agent 3: Solutions Architect', 'success', 'Mapped compute over-provisioning to AeroCloud automated container rightsizing (Est. $14.2k/mo saving).', 890)`, [lead1Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'Agent 4: Sales Director', 'success', 'Synthesized 2 high-conversion subject lines and 140-word outreach draft. Self-reflection score: 8.8/10.', 1150)`, [lead1Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'Agent 5: Compliance Guard', 'success', 'Spam score: 0/10 (Low risk). CAN-SPAM opt-out verified. Deliverability index: 96/100.', 340)`, [lead1Id]);

  // Lead 2: FintechFlow - Approved
  const lead2Dossier = {
    summary: "Fast-scaling mobile banking & cross-border payments platform with 180+ microservices on AWS EKS. AWS bills have grown 240% over the last two quarters due to conservative pod scale-down policies.",
    techStack: ["Kubernetes", "AWS EKS", "Golang", "PostgreSQL Aurora", "Kafka", "Datadog"],
    findings: [
      "Over 180+ Go microservices running across multi-AZ EKS clusters.",
      "Conservative Horizontal Pod Autoscaler (HPA) cooldown periods keep thousands of pods running hours after transaction spikes subside.",
      "VP of Engineering quoted on LinkedIn: 'Optimizing cloud unit economics per payment transaction is our executive priority for H2.'"
    ]
  };

  const lead2PainPoints = {
    painPoints: [
      {
        issue: "Over-conservative EKS Pod Scale-down Cooldowns",
        implication: "Clusters hold thousands of idle pods through nights and weekends, wasting ~$26,000/month in EC2 node costs."
      }
    ],
    solutions: [
      {
        offeringLink: "Deploy AeroCloud Predictive Autoscaling Engine for EKS.",
        benefit: "Aligns pod scaling with live payment velocities, shaving 48% off cluster compute spend while maintaining sub-15ms p99 response times."
      }
    ]
  };

  const lead2Draft = `Hi Sarah,

Huge congratulations on FintechFlow's Q1 transaction milestone. Scaling payment volume 3x is an incredible win.

As transaction velocity surges, EKS clusters often develop a quiet margin leak: conservative HPA scale-down rules that leave hundreds of idle pods consuming costly multi-AZ nodes during low-volume hours.

At AeroCloud, we install autonomous rightsizers that tie Kubernetes resource limits directly to real-time transaction velocities. We recently helped another Series C fintech trim $22k/month off their AWS bill with zero impact on payment p99 latencies.

Open to seeing a 2-minute overview of how their scale-down rules were configured?

Best,

David Miller
Platform Lead, AeroCloud Solutions`;

  const lead2Tokens = {
    agent1: { cheap: { input: 2900, output: 160 }, cost: 0.0002655 },
    agent2: { cheap: { input: 45000, output: 1500 }, cost: 0.003825 },
    agent3: { premium: { input: 2500, output: 400 }, cost: 0.005125 },
    agent4: { premium: { input: 4100, output: 380 }, cost: 0.007025 },
    agent5: { cheap: { input: 1100, output: 190 }, cost: 0.00014 },
    total: { cheap: 49000, premium: 7380, cost: 0.01638, naiveCost: 0.0704, savingPercent: 76.7 }
  };

  const lead2Id = (await dbRun(`
    INSERT INTO leads (
      company_name, website, industry, employee_count, location,
      contact_name, contact_title, contact_linkedin, contact_email,
      status, icp_score, intel_dossier, pain_points,
      draft_email, original_draft, subject_variant_a, subject_variant_b,
      follow_up_draft, reflection_score, reflection_feedback,
      deliverability_score, spam_risk, token_usage, campaign_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'FintechFlow',
    'https://fintechflow.co',
    'Fintech & Payments',
    '150-300 employees',
    'San Francisco, CA',
    'Sarah Jenkins',
    'CTO & Co-Founder',
    'https://linkedin.com/in/sarah-jenkins-fintechflow',
    'sarah.jenkins@fintechflow.co',
    'Approved',
    98.0,
    JSON.stringify(lead2Dossier),
    JSON.stringify(lead2PainPoints),
    lead2Draft,
    lead2Draft,
    'FintechFlow transaction velocity vs EKS cluster scaling costs',
    'Cutting 40%+ off FintechFlow Kubernetes bill without touching p99 latency',
    `Hi Sarah,\n\nFollowing up on my earlier note. Wanted to send over the 3-point checklist we used with NeoPay to safely calibrate EKS scale-down cooldowns.\n\nHappy to drop it in an email if you're interested.\n\nBest,\nDavid`,
    9.2,
    "High contextual resonance with current growth metrics. Concrete pain point identified with quantifiable ROI. Ready for outbound delivery.",
    97.5,
    'Low',
    JSON.stringify(lead2Tokens),
    1
  ])).id;

  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'System', 'info', 'Lead ingested from high-growth FinTech ICP queue', 110)`, [lead2Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'Agent 1: Gatekeeper', 'success', 'Found Sarah Jenkins (CTO & Co-Founder). Verified GitHub & LinkedIn profiles.', 610)`, [lead2Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'Agent 2: Intel Analyst', 'success', 'Detected 180+ Go microservices on AWS EKS, Kafka, Datadog observability.', 1390)`, [lead2Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'Agent 3: Solutions Architect', 'success', 'Identified unoptimized EKS HPA scaling cooldowns. Mapped to AeroCloud Predictive Rightsizer.', 840)`, [lead2Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'Agent 4: Sales Director', 'success', 'Generated draft email and follow-up step. Reflection rating: 9.2/10.', 1110)`, [lead2Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'Human', 'success', 'Reviewed and approved by SDR Manager for dispatch queue.', 0)`, [lead2Id]);

  // Lead 3: CartCrafters - Sent
  const lead3Dossier = {
    summary: "Omnichannel e-commerce infrastructure supporting 350+ brand storefronts. Relies on AWS ECS Fargate and DynamoDB. Experienced severe cloud spend escalation following their peak holiday promotion surge.",
    techStack: ["Next.js", "Node.js", "AWS ECS Fargate", "DynamoDB", "AWS CloudFront", "TailwindCSS"],
    findings: [
      "Over-provisioning Fargate task CPU/Memory profiles to prevent checkout timeout errors.",
      "VP Engineering expressed frustration on engineering blog regarding AWS billing spikes.",
      "Storefront traffic shows extreme variance between promotion days and baseline hours."
    ]
  };

  const lead3PainPoints = {
    painPoints: [
      {
        issue: "Fargate Task Over-allocation for Peak Headroom",
        implication: "Paying premium container pricing for 70% unused task headroom to absorb unpredictable shopping spikes."
      }
    ],
    solutions: [
      {
        offeringLink: "AeroCloud Dynamic Fargate Task Tuning & Traffic-Aware Headroom.",
        benefit: "Automates task scaling in sub-second intervals, maintaining checkout reliability while shrinking monthly Fargate spend by 38%."
      }
    ]
  };

  const lead3Draft = `Hi Thomas,

Read your team's engineering blog breakdown on scaling storefront checkouts during flash sales.

Ensuring zero checkout timeouts on ECS Fargate often forces an aggressive over-allocation of task CPU and memory—meaning you end up paying full freight for idle headroom 90% of the month just to absorb sporadic spikes.

At AeroCloud, we specialize in traffic-aware task tuning for e-commerce stacks. By synchronizing task allocation with real-time shopping cart spikes, we help merchants guarantee checkout reliability while shrinking container overhead by 30–40%.

Would you be open to a quick look at how we tuned ECS task limits for ShoeStore Inc to save 32% during seasonal surges?

Best,

David Miller
Platform Lead, AeroCloud Solutions`;

  const lead3Tokens = {
    agent1: { cheap: { input: 2700, output: 140 }, cost: 0.0002445 },
    agent2: { cheap: { input: 31000, output: 1100 }, cost: 0.002655 },
    agent3: { premium: { input: 2300, output: 350 }, cost: 0.004625 },
    agent4: { premium: { input: 3600, output: 320 }, cost: 0.006100 },
    agent5: { cheap: { input: 1050, output: 180 }, cost: 0.00013 },
    total: { cheap: 34750, premium: 6570, cost: 0.0137545, naiveCost: 0.05165, savingPercent: 73.4 }
  };

  const lead3Id = (await dbRun(`
    INSERT INTO leads (
      company_name, website, industry, employee_count, location,
      contact_name, contact_title, contact_linkedin, contact_email,
      status, icp_score, intel_dossier, pain_points,
      draft_email, original_draft, subject_variant_a, subject_variant_b,
      follow_up_draft, reflection_score, reflection_feedback,
      deliverability_score, spam_risk, token_usage, campaign_id, sent_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `, [
    'CartCrafters',
    'https://cartcrafters.com',
    'E-Commerce Infrastructure',
    '100-250 employees',
    'Chicago, IL',
    'Thomas Vance',
    'CTO',
    'https://linkedin.com/in/thomas-vance-cartcrafters',
    'tvance@cartcrafters.com',
    'Sent',
    92.0,
    JSON.stringify(lead3Dossier),
    JSON.stringify(lead3PainPoints),
    lead3Draft,
    lead3Draft,
    'Resolving ECS Fargate cost overhead from shopping flash spikes',
    'CartCrafters checkout performance vs idle container spend',
    `Hi Thomas,\n\nCircling back on ECS Fargate cost optimization for CartCrafters. Dropping by to see if you have 5 minutes to review the ShoeStore case study.\n\nBest,\nDavid`,
    8.9,
    "Precise alignment with e-commerce checkout scaling. Strong credibility from referenced case study.",
    95.0,
    'Low',
    JSON.stringify(lead3Tokens),
    1
  ])).id;

  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'System', 'info', 'Lead initiated via Webhook integration', 95)`, [lead3Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'Agent 1: Gatekeeper', 'success', 'Discovered Thomas Vance (CTO). LinkedIn and corporate email verified.', 590)`, [lead3Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'Agent 2: Intel Analyst', 'success', 'Analyzed engineering blog on AWS ECS Fargate & DynamoDB spike management.', 1450)`, [lead3Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'Agent 3: Solutions Architect', 'success', 'Identified Fargate task over-provisioning; paired with AeroCloud Dynamic Tuning.', 860)`, [lead3Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'Agent 4: Sales Director', 'success', 'Created targeted 135-word outreach pitch. Score: 8.9/10.', 1180)`, [lead3Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'Agent 5: Compliance Guard', 'success', 'Deliverability score: 95/100. Certified CAN-SPAM compliant.', 320)`, [lead3Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'Human', 'success', 'Approved for immediate SMTP dispatch by Outbound Lead.', 0)`, [lead3Id]);
  await dbRun(`INSERT INTO activity_logs (lead_id, agent, level, message, latency_ms) VALUES (?, 'System', 'success', 'Email dispatched successfully via SMTP transport (Message ID: <outbound-912@aerocloud.io>)', 420)`, [lead3Id]);
};

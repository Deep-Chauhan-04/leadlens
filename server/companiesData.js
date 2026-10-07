// Curated dataset and intelligence engine for LeadLens Company Discovery
import { callGeminiAPI, cleanAndParseJSON } from './agents.js';

export const VERIFIED_COMPANIES = [
  // AI & LLM Infrastructure
  {
    id: 'comp_anthropic',
    name: 'Anthropic',
    domain: 'anthropic.com',
    industry: 'AI & Machine Learning',
    headcount: '501-1000',
    location: 'San Francisco, CA',
    fundingStage: 'Series D',
    totalFunding: '$7.3B',
    revenueEst: '$800M+ ARR',
    techStack: ['Python', 'PyTorch', 'AWS', 'Kubernetes', 'Next.js'],
    growthSignal: '⚡ Massive model scaling and enterprise frontier safety partnerships',
    description: 'AI research and safety company building frontier systems like Claude 3.5.',
    targetTitles: ['VP of Engineering', 'Head of Enterprise Sales', 'Chief Information Officer'],
    painPoints: ['High inference latency across multi-region deployments', 'Enterprise compliance and governance scaling'],
    valueAngle: 'Automate sales qualification workflows for enterprise enterprise tiers.',
    defaultFitScore: 97
  },
  {
    id: 'comp_scale',
    name: 'Scale AI',
    domain: 'scale.com',
    industry: 'AI & Machine Learning',
    headcount: '501-1000',
    location: 'San Francisco, CA',
    fundingStage: 'Series F',
    totalFunding: '$1.6B',
    revenueEst: '$300M+ ARR',
    techStack: ['Python', 'React', 'GCP', 'Kafka', 'PostgreSQL'],
    growthSignal: '🚀 Expanding government contracts & enterprise data engine suite',
    description: 'Data infrastructure foundation for AI models and enterprise fine-tuning.',
    targetTitles: ['Head of Growth', 'VP of Product', 'Chief Commercial Officer'],
    painPoints: ['High CAC on legacy enterprise outbound', 'SDR pipeline friction across defense & automotive'],
    valueAngle: 'Autonomous research workflows for hyper-targeted Fortune 500 accounts.',
    defaultFitScore: 95
  },
  {
    id: 'comp_cursor',
    name: 'Cursor (Anysphere)',
    domain: 'cursor.com',
    industry: 'DevTools & Infrastructure',
    headcount: '11-50',
    location: 'San Francisco, CA',
    fundingStage: 'Series A',
    totalFunding: '$60M',
    revenueEst: '$50M+ ARR',
    techStack: ['TypeScript', 'Rust', 'Electron', 'OpenAI', 'Python'],
    growthSignal: '🔥 Hyper-viral developer adoption and rapid enterprise seat rollouts',
    description: 'AI-first code editor built for pairing with frontier language models.',
    targetTitles: ['Head of Enterprise Sales', 'VP of Business Development', 'Founder'],
    painPoints: ['Managing inbound surge while establishing disciplined outbound for Fortune 1000', 'Enterprise security reviews'],
    valueAngle: 'Streamlined prospect intelligence to target engineering leaders directly.',
    defaultFitScore: 98
  },
  {
    id: 'comp_perplexity',
    name: 'Perplexity AI',
    domain: 'perplexity.ai',
    industry: 'AI & Machine Learning',
    headcount: '51-200',
    location: 'San Francisco, CA',
    fundingStage: 'Series B',
    totalFunding: '$165M',
    revenueEst: '$40M+ ARR',
    techStack: ['React', 'Next.js', 'Python', 'AWS', 'TensorRT'],
    growthSignal: '📈 Enterprise Pro subscription launch and international enterprise expansion',
    description: 'Conversational answer engine delivering real-time citation-backed research.',
    targetTitles: ['VP of Sales', 'Head of Enterprise Partnerships', 'Head of Revenue'],
    painPoints: ['Differentiating enterprise research tier from generic consumer search', 'SDR outreach velocity'],
    valueAngle: 'Precision prospecting for enterprise knowledge teams.',
    defaultFitScore: 94
  },
  {
    id: 'comp_pinecone',
    name: 'Pinecone',
    domain: 'pinecone.io',
    industry: 'DevTools & Infrastructure',
    headcount: '51-200',
    location: 'San Francisco, CA',
    fundingStage: 'Series B',
    totalFunding: '$138M',
    revenueEst: '$35M+ ARR',
    techStack: ['Go', 'Rust', 'Kubernetes', 'AWS', 'GCP'],
    growthSignal: '⚡ Serverless vector database migration with 10x cost reduction benchmark',
    description: 'Serverless vector database for production AI search, RAG, and recommendation systems.',
    targetTitles: ['VP of Sales', 'Chief Technology Officer', 'Director of Demand Gen'],
    painPoints: ['Developer-led self-serve needing enterprise expansion motions', 'Complex technical sales cycles'],
    valueAngle: 'Deep-dive technical context dossiers to engage VP Eng and AI leads.',
    defaultFitScore: 92
  },
  {
    id: 'comp_elevenlabs',
    name: 'ElevenLabs',
    domain: 'elevenlabs.io',
    industry: 'AI & Machine Learning',
    headcount: '51-200',
    location: 'New York, NY',
    fundingStage: 'Series B',
    totalFunding: '$101M',
    revenueEst: '$65M+ ARR',
    techStack: ['Python', 'FastAPI', 'Next.js', 'CUDA', 'AWS'],
    growthSignal: '🎙️ Conversational AI Voice Agents launch across enterprise support verticals',
    description: 'Voice AI research and deployment platform for natural multi-lingual speech synthesis.',
    targetTitles: ['VP of Growth', 'Head of Enterprise Solutions', 'Head of Sales'],
    painPoints: ['Targeting customer experience leaders at scale', 'High outbound noise from competitors'],
    valueAngle: 'Multi-signal intent detection to identify brands revamping call center operations.',
    defaultFitScore: 96
  },
  {
    id: 'comp_runway',
    name: 'Runway',
    domain: 'runwayml.com',
    industry: 'AI & Machine Learning',
    headcount: '51-200',
    location: 'New York, NY',
    fundingStage: 'Series C',
    totalFunding: '$237M',
    revenueEst: '$50M+ ARR',
    techStack: ['PyTorch', 'TypeScript', 'WebGPU', 'AWS', 'Docker'],
    growthSignal: '🎬 Gen-3 Alpha model release and studio Hollywood partnership announcements',
    description: 'Applied AI research platform developing generative media tools for creatives and studios.',
    targetTitles: ['Head of Enterprise Creative', 'VP Marketing', 'Chief Revenue Officer'],
    painPoints: ['Reaching enterprise media buyers who hesitate on copyright and safety', 'Slow pipeline conversion'],
    valueAngle: 'Compliance-guarded executive outreach tailored to chief marketing officers.',
    defaultFitScore: 91
  },

  // Modern B2B SaaS & Productivity
  {
    id: 'comp_linear',
    name: 'Linear',
    domain: 'linear.app',
    industry: 'B2B SaaS',
    headcount: '51-200',
    location: 'San Francisco, CA',
    fundingStage: 'Series B',
    totalFunding: '$52M',
    revenueEst: '$45M+ ARR',
    techStack: ['TypeScript', 'React', 'GraphQL', 'AWS', 'SQLite'],
    growthSignal: '🚀 Linear Asks & Customer Requests rollout for enterprise engineering teams',
    description: 'Issue tracking and project management purpose-built for high-performance software teams.',
    targetTitles: ['Head of Sales', 'Head of Enterprise Growth', 'VP Product'],
    painPoints: ['Transitioning from product-led viral growth to outbound enterprise displacement of Jira', 'SDR productivity'],
    valueAngle: 'Surgical account research to pinpoint engineering teams suffering from Jira bloat.',
    defaultFitScore: 96
  },
  {
    id: 'comp_supabase',
    name: 'Supabase',
    domain: 'supabase.com',
    industry: 'DevTools & Infrastructure',
    headcount: '51-200',
    location: 'Singapore / Remote',
    fundingStage: 'Series B',
    totalFunding: '$116M',
    revenueEst: '$40M+ ARR',
    techStack: ['PostgreSQL', 'Elixir', 'TypeScript', 'Go', 'AWS'],
    growthSignal: '⚡ General Availability milestone with over 1M databases created',
    description: 'Open source Firebase alternative providing Postgres, Auth, Edge Functions, and Realtime.',
    targetTitles: ['VP of Sales', 'Head of Enterprise', 'Head of Growth'],
    painPoints: ['Converting open-source enthusiasts into high-contract enterprise cloud agreements', 'Long sales cycles'],
    valueAngle: 'Account intelligence detecting teams hitting AWS RDS scalability bottlenecks.',
    defaultFitScore: 93
  },
  {
    id: 'comp_retool',
    name: 'Retool',
    domain: 'retool.com',
    industry: 'B2B SaaS',
    headcount: '201-500',
    location: 'San Francisco, CA',
    fundingStage: 'Series C',
    totalFunding: '$135M',
    revenueEst: '$120M+ ARR',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Kubernetes', 'TypeScript'],
    growthSignal: '🏢 Retool Workflows & Retool AI enterprise deployment across Fortune 500 ops',
    description: 'Development platform for building custom internal tools, admin panels, and workflows.',
    targetTitles: ['Head of Enterprise Sales', 'VP of Solution Engineering', 'Director of Outbound'],
    painPoints: ['Identifying companies with custom tool debt', 'Coordinating multi-threaded outreach across engineering & ops'],
    valueAngle: 'Detecting companies hiring dozens of internal ops managers with tech debt.',
    defaultFitScore: 95
  },
  {
    id: 'comp_vercel',
    name: 'Vercel',
    domain: 'vercel.com',
    industry: 'DevTools & Infrastructure',
    headcount: '201-500',
    location: 'San Francisco, CA',
    fundingStage: 'Series E',
    totalFunding: '$563M',
    revenueEst: '$150M+ ARR',
    techStack: ['Next.js', 'React', 'Rust', 'AWS', 'Cloudflare'],
    growthSignal: '🌐 v0 generative UI adoption surpassing 2.5 million developer prompts',
    description: 'Frontend cloud platform providing developer workflow for deploying modern web apps.',
    targetTitles: ['VP of Commercial Sales', 'Head of Enterprise Marketing', 'Chief Revenue Officer'],
    painPoints: ['Targeting legacy monolith e-commerce brands for Next.js enterprise migration', 'Rep ramp-up time'],
    valueAngle: 'Precise technology profiling identifying slow legacy Magento/Salesforce storefronts.',
    defaultFitScore: 97
  },
  {
    id: 'comp_resend',
    name: 'Resend',
    domain: 'resend.com',
    industry: 'DevTools & Infrastructure',
    headcount: '11-50',
    location: 'San Francisco, CA',
    fundingStage: 'Series A',
    totalFunding: '$18M',
    revenueEst: '$12M+ ARR',
    techStack: ['React Email', 'TypeScript', 'Next.js', 'Node.js', 'AWS'],
    growthSignal: '📨 React Email ecosystem surpassing 2M monthly downloads',
    description: 'Modern email API and developer tooling for transactional and marketing communication.',
    targetTitles: ['Head of Growth', 'Founder', 'VP of Engineering'],
    painPoints: ['Scaling self-serve into outbound enterprise deals replacing SendGrid', 'Small sales team bandwidth'],
    valueAngle: 'Automated 5-agent pipeline handling entire qualification waterfall.',
    defaultFitScore: 94
  },
  {
    id: 'comp_posthog',
    name: 'PostHog',
    domain: 'posthog.com',
    industry: 'DevTools & Infrastructure',
    headcount: '51-200',
    location: 'San Francisco, CA / Remote',
    fundingStage: 'Series B',
    totalFunding: '$27M',
    revenueEst: '$30M+ ARR',
    techStack: ['Python', 'TypeScript', 'ClickHouse', 'Kafka', 'React'],
    growthSignal: '📊 All-in-one product OS adding LLM observability and feature flags',
    description: 'Open-source product analytics, session replay, feature flags, and A/B testing suite.',
    targetTitles: ['Head of Sales', 'VP of Marketing', 'Chief Commercial Officer'],
    painPoints: ['Positioning single platform against fragmented point solutions (Mixpanel, LaunchDarkly, FullStory)', 'Inbound qualification'],
    valueAngle: 'Multi-signal enrichment targeting CTOs frustrated with tool fragmentation.',
    defaultFitScore: 92
  },
  {
    id: 'comp_webflow',
    name: 'Webflow',
    domain: 'webflow.com',
    industry: 'B2B SaaS',
    headcount: '501-1000',
    location: 'San Francisco, CA',
    fundingStage: 'Series C',
    totalFunding: '$335M',
    revenueEst: '$200M+ ARR',
    techStack: ['React', 'Node.js', 'MongoDB', 'AWS', 'GraphQL'],
    growthSignal: '🎨 Webflow Apps & Enterprise Localization suite gaining traction in mid-market',
    description: 'Visual development platform for designing, building, and launching responsive websites.',
    targetTitles: ['VP of Enterprise Sales', 'Director of Field Marketing', 'VP Revenue Operations'],
    painPoints: ['Displacing legacy WordPress and Drupal installations at mid-market firms', 'High lead-to-opportunity costs'],
    valueAngle: 'Instant detection of target accounts using slow, unmaintained WordPress stacks.',
    defaultFitScore: 89
  },

  // FinTech & Modern Finance
  {
    id: 'comp_ramp',
    name: 'Ramp',
    domain: 'ramp.com',
    industry: 'Fintech',
    headcount: '501-1000',
    location: 'New York, NY',
    fundingStage: 'Series D',
    totalFunding: '$1.7B',
    revenueEst: '$300M+ ARR',
    techStack: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'AWS'],
    growthSignal: '💳 Ramp Procurement and global expense cards driving massive enterprise volume',
    description: 'Finance automation platform offering corporate cards, expense management, and procurement.',
    targetTitles: ['Head of Outbound Sales', 'VP of Mid-Market Sales', 'Chief Revenue Officer'],
    painPoints: ['High outbound volume needed to displace legacy Brex and AmEx corporate accounts', 'Rep productivity'],
    valueAngle: 'Automated finance persona targeting focused on CFOs seeking burn reduction.',
    defaultFitScore: 98
  },
  {
    id: 'comp_brex',
    name: 'Brex',
    domain: 'brex.com',
    industry: 'Fintech',
    headcount: '501-1000',
    location: 'San Francisco, CA',
    fundingStage: 'Series D',
    totalFunding: '$1.5B',
    revenueEst: '$250M+ ARR',
    techStack: ['Elixir', 'Kotlin', 'React', 'Kubernetes', 'AWS'],
    growthSignal: '🌍 Global Spend Management expansion into 100+ countries and enterprise subsidiaries',
    description: 'Corporate cards and spend management platform built for scaling startups and global enterprises.',
    targetTitles: ['VP of Commercial Sales', 'Head of Enterprise SDRs', 'Chief Growth Officer'],
    painPoints: ['Maintaining pipeline momentum across mid-market enterprise tiers', 'Complex CFO buying committees'],
    valueAngle: 'Multi-threaded executive outreach to both VP Finance and Controller.',
    defaultFitScore: 91
  },
  {
    id: 'comp_mercury',
    name: 'Mercury',
    domain: 'mercury.com',
    industry: 'Fintech',
    headcount: '201-500',
    location: 'San Francisco, CA',
    fundingStage: 'Series B',
    totalFunding: '$163M',
    revenueEst: '$100M+ ARR',
    techStack: ['Haskell', 'React', 'TypeScript', 'AWS', 'PostgreSQL'],
    growthSignal: '🏦 Mercury Personal banking launch & Mercury Venture Debt syndication platform',
    description: 'Banking and financial workflows engineered specifically for ambitious startups and venture-backed founders.',
    targetTitles: ['Head of Business Development', 'VP of Growth', 'Director of Marketing'],
    painPoints: ['Identifying newly incorporated seed and Series A startups ahead of competitors', 'Fast outreach execution'],
    valueAngle: 'Trigger-based prospecting reacting within 24 hours of funding rounds.',
    defaultFitScore: 93
  },
  {
    id: 'comp_deel',
    name: 'Deel',
    domain: 'deel.com',
    industry: 'Fintech',
    headcount: '1000+',
    location: 'San Francisco, CA / Remote',
    fundingStage: 'Series D',
    totalFunding: '$679M',
    revenueEst: '$500M+ ARR',
    techStack: ['Node.js', 'React', 'AWS', 'PostgreSQL', 'Redis'],
    growthSignal: '🌐 Deel IT equipment management & Global Payroll platform handling $10B+ volume',
    description: 'Global compliance and payroll platform helping organizations hire contractors and employees anywhere.',
    targetTitles: ['VP of Global Sales', 'Head of Enterprise Outbound', 'Chief Revenue Officer'],
    painPoints: ['Managing thousands of SDR leads across 6 continents without losing personal relevance', 'Tone consistency'],
    valueAngle: 'Local-jurisdiction awareness injected into every outbound research dossier.',
    defaultFitScore: 96
  },
  {
    id: 'comp_rippling',
    name: 'Rippling',
    domain: 'rippling.com',
    industry: 'B2B SaaS',
    headcount: '1000+',
    location: 'San Francisco, CA',
    fundingStage: 'Series F',
    totalFunding: '$1.4B',
    revenueEst: '$350M+ ARR',
    techStack: ['Python', 'Django', 'React', 'AWS', 'MongoDB'],
    growthSignal: '⚡ $200M Series F funding and aggressive compound product suite expansion into IT & Finance',
    description: 'Unified workforce management system managing HR, IT, and Finance across a single employee graph.',
    targetTitles: ['VP of Sales', 'Head of Demand Gen', 'Chief Revenue Officer'],
    painPoints: ['Multi-product positioning across VP HR, VP IT, and CFO simultaneously', 'Overloaded SDR teams'],
    valueAngle: 'Persona-specific email drafts dynamically tailored to HR vs IT buyer priorities.',
    defaultFitScore: 97
  },

  // Cybersecurity & Cloud Security
  {
    id: 'comp_wiz',
    name: 'Wiz',
    domain: 'wiz.io',
    industry: 'Cybersecurity',
    headcount: '501-1000',
    location: 'New York, NY',
    fundingStage: 'Series E',
    totalFunding: '$1.9B',
    revenueEst: '$500M+ ARR',
    techStack: ['Go', 'React', 'AWS', 'Azure', 'GCP'],
    growthSignal: '🛡️ Reaching $500M ARR in record time; expanding Cloud Detection and Response (CDR)',
    description: 'Agentless cloud security platform that provides complete risk visualization across multi-cloud infrastructure.',
    targetTitles: ['VP of Enterprise Sales', 'Chief Information Security Officer', 'Head of Global Outbound'],
    painPoints: ['Targeting multi-cloud CISOs overwhelmed by alert fatigue and legacy scanners', 'High rep quota demands'],
    valueAngle: 'Evidence-backed technical dossiers pinpointing cloud footprint and CVE risks.',
    defaultFitScore: 99
  },
  {
    id: 'comp_snyk',
    name: 'Snyk',
    domain: 'snyk.io',
    industry: 'Cybersecurity',
    headcount: '1000+',
    location: 'Boston, MA',
    fundingStage: 'Series G',
    totalFunding: '$850M',
    revenueEst: '$250M+ ARR',
    techStack: ['Node.js', 'TypeScript', 'Kubernetes', 'AWS', 'Docker'],
    growthSignal: '🔒 Snyk AppRisk & DeepCode AI engine rollout across enterprise DevSecOps pipelines',
    description: 'Developer security platform enabling teams to find and automatically fix vulnerabilities in code and containers.',
    targetTitles: ['VP of Sales', 'Head of Product Marketing', 'Director of Outbound'],
    painPoints: ['Bridging gap between engineering leads who use tool and CISOs who control security budget', 'Outbound engagement'],
    valueAngle: 'Dual-persona pitch generation addressing both AppSec leads and VP Eng.',
    defaultFitScore: 93
  },
  {
    id: 'comp_tailscale',
    name: 'Tailscale',
    domain: 'tailscale.com',
    industry: 'Cybersecurity',
    headcount: '51-200',
    location: 'Toronto, Canada',
    fundingStage: 'Series B',
    totalFunding: '$115M',
    revenueEst: '$45M+ ARR',
    techStack: ['Go', 'WireGuard', 'TypeScript', 'AWS', 'Kubernetes'],
    growthSignal: '⚡ Tailscale SSH & Enterprise Access Controls adoption surging across DevSecOps',
    description: 'Zero config mesh VPN built on WireGuard providing secure private network access across any device.',
    targetTitles: ['Head of Commercial Sales', 'VP of Engineering', 'Head of Growth'],
    painPoints: ['Educating enterprise network architects while retaining open-source developer goodwill', 'Outbound volume'],
    valueAngle: 'Pinpoint companies expanding remote engineering headcount.',
    defaultFitScore: 92
  },
  {
    id: 'comp_chainguard',
    name: 'Chainguard',
    domain: 'chainguard.dev',
    industry: 'Cybersecurity',
    headcount: '51-200',
    location: 'Kirkland, WA',
    fundingStage: 'Series C',
    totalFunding: '$256M',
    revenueEst: '$30M+ ARR',
    techStack: ['Go', 'Kubernetes', 'Docker', 'Linux', 'GCP'],
    growthSignal: '📦 Zero-CVE minimal container images adopted by Snowflake and leading cloud providers',
    description: 'Software supply chain security platform offering minimal, signed container images with zero known CVEs.',
    targetTitles: ['VP of Sales', 'Chief Technology Officer', 'Head of Enterprise'],
    painPoints: ['Targeting DevOps and compliance teams stuck in endless container patching cycles', 'Outbound lead scoring'],
    valueAngle: 'Targeting companies subject to stringent FedRAMP or SOC2 container compliance audits.',
    defaultFitScore: 95
  },

  // Data Infrastructure & Analytics
  {
    id: 'comp_databricks',
    name: 'Databricks',
    domain: 'databricks.com',
    industry: 'DevTools & Infrastructure',
    headcount: '1000+',
    location: 'San Francisco, CA',
    fundingStage: 'Series I',
    totalFunding: '$4B+',
    revenueEst: '$2.4B ARR',
    techStack: ['Apache Spark', 'Scala', 'Python', 'AWS', 'Azure'],
    growthSignal: '📊 LakehouseIQ and MosaicML generative AI integrations scaling to thousands of enterprise accounts',
    description: 'Data and AI company offering unified Lakehouse platform for data engineering, analytics, and machine learning.',
    targetTitles: ['VP of Strategic Accounts', 'Head of Enterprise SDRs', 'Global Sales Director'],
    painPoints: ['Complex multi-cloud accounts with long sales cycles', 'Coordinating SDR activity with account executives'],
    valueAngle: 'Account intelligence uncovering enterprise data lake migration initiatives.',
    defaultFitScore: 97
  },
  {
    id: 'comp_snowflake',
    name: 'Snowflake',
    domain: 'snowflake.com',
    industry: 'DevTools & Infrastructure',
    headcount: '1000+',
    location: 'Bozeman, MT',
    fundingStage: 'Public',
    totalFunding: 'IPO',
    revenueEst: '$3.2B ARR',
    techStack: ['C++', 'Java', 'SQL', 'AWS', 'Azure'],
    growthSignal: '❄️ Snowflake Cortex AI and Snowpark Container Services expanding compute consumption',
    description: 'Cloud data warehouse and analytical platform enabling data sharing, analytics, and AI workloads.',
    targetTitles: ['Regional VP Sales', 'Director of Sales Development', 'Chief Commercial Officer'],
    painPoints: ['Increasing consumption among accounts after initial onboarding', 'Identifying new workloads'],
    valueAngle: 'Identifying data teams migrating from legacy Teradata/Oracle systems.',
    defaultFitScore: 94
  },
  {
    id: 'comp_dbt',
    name: 'dbt Labs',
    domain: 'getdbt.com',
    industry: 'DevTools & Infrastructure',
    headcount: '201-500',
    location: 'Philadelphia, PA',
    fundingStage: 'Series D',
    totalFunding: '$414M',
    revenueEst: '$80M+ ARR',
    techStack: ['Python', 'SQL', 'React', 'AWS', 'Snowflake'],
    growthSignal: '🔄 dbt Semantic Layer and dbt Cloud multi-tenant orchestration expansions',
    description: 'Analytics engineering framework that enables data teams to transform and model data inside warehouses.',
    targetTitles: ['Head of Commercial Sales', 'VP of Growth', 'Director of Outbound'],
    painPoints: ['Converting open-source dbt Core users to paid dbt Cloud enterprise tiers', 'Pipeline generation'],
    valueAngle: 'Pinpoint companies with growing data analyst headcount lacking centralized CI/CD.',
    defaultFitScore: 91
  },
  {
    id: 'comp_clickhouse',
    name: 'ClickHouse',
    domain: 'clickhouse.com',
    industry: 'DevTools & Infrastructure',
    headcount: '51-200',
    location: 'San Francisco, CA',
    fundingStage: 'Series B',
    totalFunding: '$300M',
    revenueEst: '$50M+ ARR',
    techStack: ['C++', 'SQL', 'Kubernetes', 'AWS', 'GCP'],
    growthSignal: '⚡ ClickHouse Cloud adoption accelerating for real-time observability and financial analytics',
    description: 'Open source column-oriented DBMS for real-time analytical reporting and big data processing.',
    targetTitles: ['VP of Sales', 'Chief Technology Officer', 'Head of Enterprise Growth'],
    painPoints: ['Targeting engineering leaders struggling with slow Elasticsearch or Postgres query times', 'SDR velocity'],
    valueAngle: 'Signal detection for teams experiencing multi-second dashboard latency.',
    defaultFitScore: 94
  },
  {
    id: 'comp_fivetran',
    name: 'Fivetran',
    domain: 'fivetran.com',
    industry: 'DevTools & Infrastructure',
    headcount: '1000+',
    location: 'Oakland, CA',
    fundingStage: 'Series D',
    totalFunding: '$730M',
    revenueEst: '$200M+ ARR',
    techStack: ['Java', 'React', 'PostgreSQL', 'AWS', 'GCP'],
    growthSignal: '🔌 Automated ELT connector catalog reaching 500+ sources with HVR real-time replication',
    description: 'Automated data integration and ELT platform moving data into modern cloud data warehouses.',
    targetTitles: ['VP Mid-Market Sales', 'Head of Global Outbound', 'Director Demand Gen'],
    painPoints: ['Identifying teams building fragile in-house API data connectors', 'Cold outreach conversion'],
    valueAngle: 'Highlighting wasted engineering hours maintaining custom ETL pipelines.',
    defaultFitScore: 90
  },

  // HealthTech & BioTech
  {
    id: 'comp_benchling',
    name: 'Benchling',
    domain: 'benchling.com',
    industry: 'HealthTech & Biotech',
    headcount: '501-1000',
    location: 'San Francisco, CA',
    fundingStage: 'Series F',
    totalFunding: '$412M',
    revenueEst: '$150M+ ARR',
    techStack: ['Python', 'React', 'PostgreSQL', 'AWS', 'Docker'],
    growthSignal: '🧬 AI molecular design tools & biopharma enterprise digital lab notebooks expansion',
    description: 'R&D cloud software platform designed specifically for biotechnology scientists and pharmaceutical research.',
    targetTitles: ['VP of Enterprise Sales', 'Head of Life Sciences Commercial', 'Chief Revenue Officer'],
    painPoints: ['Targeting conservative lab directors hesitant about cloud software', 'Long multi-year buying cycles'],
    valueAngle: 'High-touch consultative outreach backed by scientific workflow terminology.',
    defaultFitScore: 93
  },
  {
    id: 'comp_tempus',
    name: 'Tempus AI',
    domain: 'tempus.com',
    industry: 'HealthTech & Biotech',
    headcount: '1000+',
    location: 'Chicago, IL',
    fundingStage: 'Public',
    totalFunding: 'IPO',
    revenueEst: '$600M ARR',
    techStack: ['Python', 'React', 'AWS', 'Kubernetes', 'Genomics'],
    growthSignal: '🏥 Precision medicine clinical oncology datasets partnered with top academic medical centers',
    description: 'Technology company advancing precision medicine through the collection and analysis of clinical and molecular data.',
    targetTitles: ['VP Commercial Oncology', 'Head of Enterprise Partnerships', 'Chief Data Officer'],
    painPoints: ['High stakes data privacy compliance and clinical integration standards', 'Prospecting hospital executives'],
    valueAngle: 'Strict compliance-audited outreach tailored to healthcare governance.',
    defaultFitScore: 92
  },

  // E-Commerce & Retail Tech
  {
    id: 'comp_gorgias',
    name: 'Gorgias',
    domain: 'gorgias.com',
    industry: 'B2B SaaS',
    headcount: '201-500',
    location: 'San Francisco, CA',
    fundingStage: 'Series C',
    totalFunding: '$72M',
    revenueEst: '$60M+ ARR',
    techStack: ['Python', 'Vue.js', 'PostgreSQL', 'AWS', 'Shopify'],
    growthSignal: '🛍️ Gorgias AI Agent answering 40% of customer inquiries automatically for top DTC brands',
    description: 'Customer service and helpdesk platform engineered exclusively for e-commerce merchants.',
    targetTitles: ['VP of Sales', 'Head of Merchant Growth', 'Director of Outbound'],
    painPoints: ['Targeting fast-scaling Shopify Plus brands before competitors', 'High churn in retail segment'],
    valueAngle: 'Live Shopify technology detection coupled with automated ROI projections.',
    defaultFitScore: 91
  },
  {
    id: 'comp_triplewhale',
    name: 'Triple Whale',
    domain: 'triplewhale.com',
    industry: 'B2B SaaS',
    headcount: '51-200',
    location: 'Columbus, OH',
    fundingStage: 'Series B',
    totalFunding: '$52M',
    revenueEst: '$35M+ ARR',
    techStack: ['Node.js', 'React', 'GCP', 'BigQuery', 'Shopify'],
    growthSignal: '🐋 AI data platform Moby helping DTC founders optimize multi-channel ad spend attribution',
    description: 'Smart data platform and attribution analytics tool for e-commerce brands and marketing agencies.',
    targetTitles: ['Head of Revenue', 'VP of Partnerships', 'Director of Sales'],
    painPoints: ['Educating brands on post-iOS14 attribution loss', 'Outbound SDR ramp times'],
    valueAngle: 'Pinpoint DTC brands running heavy Meta/TikTok ad spend with attribution leaks.',
    defaultFitScore: 89
  }
];

// Helper to filter and calculate dynamic ICP fit score
export function discoverCompanies({
  query = '',
  industry = 'All',
  size = 'All',
  location = 'All',
  funding = 'All',
  minScore = 0,
  limit = 50
}) {
  const q = query.trim().toLowerCase();

  const results = VERIFIED_COMPANIES.map(company => {
    let score = company.defaultFitScore;
    let matchReasons = [];

    // Filter checks
    if (industry && industry !== 'All') {
      if (company.industry.toLowerCase() !== industry.toLowerCase()) {
        return null;
      }
      score += 3;
      matchReasons.push(`Matches industry: ${company.industry}`);
    }

    if (size && size !== 'All') {
      if (company.headcount !== size) {
        return null;
      }
      score += 2;
      matchReasons.push(`Matches target headcount: ${company.headcount}`);
    }

    if (location && location !== 'All') {
      const locMatch = company.location.toLowerCase().includes(location.toLowerCase());
      if (!locMatch) return null;
      score += 2;
    }

    if (funding && funding !== 'All') {
      const fundMatch = company.fundingStage.toLowerCase().includes(funding.toLowerCase());
      if (!fundMatch) return null;
      score += 2;
    }

    // Query analysis
    if (q) {
      let queryHits = 0;
      if (company.name.toLowerCase().includes(q)) queryHits += 3;
      if (company.domain.toLowerCase().includes(q)) queryHits += 3;
      if (company.industry.toLowerCase().includes(q)) queryHits += 2;
      if (company.description.toLowerCase().includes(q)) queryHits += 2;
      if (company.growthSignal.toLowerCase().includes(q)) queryHits += 2;
      if (company.techStack.some(t => t.toLowerCase().includes(q))) queryHits += 3;
      if (company.location.toLowerCase().includes(q)) queryHits += 1;

      // Check words in prompt
      const words = q.split(/\s+/).filter(w => w.length > 2);
      words.forEach(word => {
        if (company.description.toLowerCase().includes(word) ||
            company.industry.toLowerCase().includes(word) ||
            company.growthSignal.toLowerCase().includes(word) ||
            company.techStack.some(t => t.toLowerCase().includes(word))) {
          queryHits += 1;
        }
      });

      if (queryHits === 0) {
        // If query has no relevance, penalize or filter
        score -= 20;
      } else {
        score += Math.min(queryHits * 2, 8);
      }
    }

    // Bound score
    const finalScore = Math.min(99, Math.max(60, score));

    if (minScore > 0 && finalScore < minScore) {
      return null;
    }

    return {
      ...company,
      icpFitScore: finalScore,
      matchReasons: matchReasons.length > 0 ? matchReasons : [`High firmographic relevance in ${company.industry}`]
    };
  })
  .filter(Boolean)
  .sort((a, b) => b.icpFitScore - a.icpFitScore)
  .slice(0, limit);

  return results;
}

// AI-assisted market scanner using Gemini
export async function scanWithGeminiAI(apiKey, prompt, clientProfile) {
  if (!apiKey) {
    // Return filtered local companies if no API key
    return discoverCompanies({ query: prompt });
  }

  const systemInstruction = `You are the LeadLens Market Scanner AI. Your job is to discover real, active, high-fit B2B companies based on the user's prospecting query and Ideal Customer Profile (ICP).
You must return only valid, real companies that exist with their actual domains. Do not invent fictitious companies.
Output strictly JSON matching this structure:
{
  "companies": [
    {
      "name": "Company Name",
      "domain": "example.com",
      "industry": "Industry Sector",
      "headcount": "11-50" | "51-200" | "201-500" | "501-1000" | "1000+",
      "location": "City, State/Country",
      "fundingStage": "Seed" | "Series A" | "Series B" | "Series C" | "Series D+" | "Public" | "Bootstrapped",
      "totalFunding": "$XXM",
      "revenueEst": "$XXM ARR",
      "techStack": ["Tech1", "Tech2", "Tech3"],
      "growthSignal": "Specific real trigger (e.g. Raised Series B, Scaling engineering team)",
      "description": "One sentence summary of what they do",
      "targetTitles": ["VP Engineering", "Head of Sales"],
      "painPoints": ["Key operational or technical challenge"],
      "valueAngle": "Why this company is a high-probability target",
      "icpFitScore": 95
    }
  ]
}`;

  const userPrompt = `Find 10 to 15 real-world target companies matching this search query and ICP criteria:
Search Query: "${prompt}"

Context from Workspace ICP Profile:
- Industry Focus: ${clientProfile?.industry || 'Modern Tech / B2B SaaS'}
- Target Persona: ${clientProfile?.targetPersona || 'Technical & Executive Decision Makers'}
- Value Proposition: ${clientProfile?.valueProp || 'AI sales intelligence and automated outreach'}
- Target Headcounts: ${JSON.stringify(clientProfile?.targetHeadcounts || ['51-200', '201-1000'])}

Ensure every company returned is a real company with an accurate website domain. Return valid JSON only.`;

  try {
    const rawResponse = await callGeminiAPI(apiKey, 'flash', userPrompt, systemInstruction);
    const parsed = cleanAndParseJSON(rawResponse);
    if (parsed && Array.isArray(parsed.companies) && parsed.companies.length > 0) {
      return parsed.companies.map((c, i) => ({
        id: `ai_${Date.now()}_${i}`,
        name: c.name,
        domain: c.domain,
        industry: c.industry || 'Technology',
        headcount: c.headcount || '51-200',
        location: c.location || 'United States',
        fundingStage: c.fundingStage || 'Growth',
        totalFunding: c.totalFunding || 'N/A',
        revenueEst: c.revenueEst || 'N/A',
        techStack: Array.isArray(c.techStack) ? c.techStack : ['Cloud', 'Modern Stack'],
        growthSignal: c.growthSignal || '⚡ High expansion signals in market',
        description: c.description || 'Technology enterprise',
        targetTitles: Array.isArray(c.targetTitles) ? c.targetTitles : ['VP Sales', 'CTO'],
        painPoints: Array.isArray(c.painPoints) ? c.painPoints : [],
        valueAngle: c.valueAngle || 'Strong ICP alignment',
        icpFitScore: Number(c.icpFitScore) || 92
      }));
    }
  } catch (err) {
    console.warn("AI Market Scanner Gemini error, falling back to verified database:", err.message);
  }

  // Fallback to verified dataset
  return discoverCompanies({ query: prompt });
}

// Convert company list to RFC-4180 CSV
export function companiesToCsv(companies = []) {
  const headers = [
    'Company Name',
    'Domain',
    'Industry',
    'Headcount',
    'Location',
    'Funding Stage',
    'Total Funding',
    'Estimated Revenue',
    'Key Growth Signal',
    'Tech Stack',
    'ICP Match Score',
    'Description',
    'Target Titles'
  ];

  const escapeCsv = (str) => {
    if (str === null || str === undefined) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const lines = [headers.join(',')];

  companies.forEach(c => {
    const techStr = Array.isArray(c.techStack) ? c.techStack.join('; ') : (c.techStack || '');
    const titlesStr = Array.isArray(c.targetTitles) ? c.targetTitles.join('; ') : (c.targetTitles || '');
    lines.push([
      escapeCsv(c.name),
      escapeCsv(c.domain),
      escapeCsv(c.industry),
      escapeCsv(c.headcount),
      escapeCsv(c.location),
      escapeCsv(c.fundingStage),
      escapeCsv(c.totalFunding),
      escapeCsv(c.revenueEst),
      escapeCsv(c.growthSignal),
      escapeCsv(techStr),
      c.icpFitScore || 90,
      escapeCsv(c.description),
      escapeCsv(titlesStr)
    ].join(','));
  });

  return lines.join('\n');
}

import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Target, 
  Send, 
  Sparkles, 
  Save, 
  Check, 
  RefreshCw, 
  FileText, 
  ShieldCheck, 
  Layers, 
  Plus, 
  X, 
  ExternalLink,
  Sliders,
  Mail,
  Zap,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const PRESETS = [
  {
    id: 'cloud_saas',
    name: '🚀 B2B Cloud & DevOps SaaS',
    data: {
      companyName: 'AeroCloud Solutions',
      website: 'aerocloud.io',
      industry: 'Cloud Infrastructure & DevOps',
      tagline: 'Automated Kubernetes container rightsizing and dynamic cloud cost reduction',
      offering: 'AI-Powered Kubernetes Cost Optimizer & Autoscaling Platform',
      targetPersona: 'VP of Engineering, CTO, Platform & Infrastructure Leads',
      valueProp: 'Guaranteed 35-50% reduction in monthly cloud compute spend with zero p99 latency regressions. We automate container resource limits and cluster autoscaling dynamically.',
      differentiators: 'Live telemetry rightsizing, automated Karpenter orchestration, zero-downtime reconfiguration.',
      caseStudyMetrics: 'A financial platform customer recovered $18,400/month in idle compute within 14 days of activation.',
      senderName: 'Alex Morgan',
      senderTitle: 'VP of Engineering Solutions',
      senderEmail: 'alex@aerocloud.io',
      targetTitles: ['CTO', 'VP of Engineering', 'Head of Platform', 'Director of Infrastructure', 'DevOps Manager'],
      targetCompanySizes: ['50-200', '200-500', '500-1000'],
      targetTechStack: ['Kubernetes', 'AWS', 'Docker', 'Go', 'Datadog', 'Terraform'],
      excludedKeywords: ['Student', 'Intern', 'Agency', 'Freelancer', 'Recruiter']
    }
  },
  {
    id: 'ai_devtools',
    name: '🤖 AI & Data Infrastructure',
    data: {
      companyName: 'NexusAI Platforms',
      website: 'nexusai.dev',
      industry: 'Developer Tools & Generative AI',
      tagline: 'High-throughput LLM caching and low-latency inference routing',
      offering: 'Enterprise LLM Gateway & Semantic Response Caching Engine',
      targetPersona: 'Chief AI Officer, VP of Engineering, Head of Machine Learning',
      valueProp: 'Slash LLM inference costs by 60% and drop p95 generation latency to under 120ms with our intelligent semantic vector caching layer.',
      differentiators: 'Self-hosted privacy mode, multi-provider automatic failover, sub-5ms cache hits.',
      caseStudyMetrics: 'Processed 45M daily AI completions for a healthcare SaaS, trimming OpenAI billing from $64k to $22k/mo.',
      senderName: 'Elena Rostova',
      senderTitle: 'Head of Developer Partnerships',
      senderEmail: 'elena@nexusai.dev',
      targetTitles: ['Chief AI Officer', 'VP of Engineering', 'Head of Machine Learning', 'Staff AI Engineer'],
      targetCompanySizes: ['20-100', '100-500', '500-2000'],
      targetTechStack: ['Python', 'Next.js', 'PyTorch', 'Vector Databases', 'OpenAI', 'Anthropic'],
      excludedKeywords: ['Consulting', 'Junior Developer', 'Design Agency']
    }
  },
  {
    id: 'ecommerce_agency',
    name: '🛍️ E-Commerce & Retail Growth',
    data: {
      companyName: 'CartCrafters Performance',
      website: 'cartcrafters.com',
      industry: 'E-Commerce Growth & Conversion Engineering',
      tagline: 'High-converting headless storefronts and checkout acceleration',
      offering: 'Shopify Plus Performance Optimization & Checkout Conversion Auditing',
      targetPersona: 'Founder, VP of E-Commerce, Chief Marketing Officer',
      valueProp: 'We eliminate mobile storefront lag and checkout friction to lift direct-to-consumer store conversions by 18-35% within 30 days.',
      differentiators: 'Dedicated Shopify Plus engineers, zero-risk performance guarantee, proprietary speed audits.',
      caseStudyMetrics: 'Lifted conversion rate by 28% for a $15M apparel brand, generating $420k in incremental revenue in Q3.',
      senderName: 'Marcus Bell',
      senderTitle: 'Managing Partner',
      senderEmail: 'marcus@cartcrafters.com',
      targetTitles: ['Founder', 'CEO', 'VP of E-Commerce', 'Head of Digital', 'CMO'],
      targetCompanySizes: ['10-50', '50-200'],
      targetTechStack: ['Shopify', 'Next.js', 'React', 'Klaviyo', 'Stripe Payments'],
      excludedKeywords: ['Student', 'Physical Store Only', 'Amazon Reseller']
    }
  },
  {
    id: 'cybersecurity',
    name: '🔒 Cybersecurity & SOC-2 Compliance',
    data: {
      companyName: 'Vigilant Security Labs',
      website: 'vigilantsec.com',
      industry: 'Enterprise Cybersecurity & Cloud Posture',
      tagline: 'Continuous cloud compliance automation and attack surface monitoring',
      offering: 'Automated SOC-2 & ISO 27001 Readiness and Cloud Vulnerability Shield',
      targetPersona: 'CISO, VP of Information Security, VP of Engineering',
      valueProp: 'Accelerate enterprise enterprise SOC-2 Type II audit readiness from 9 months down to 3 weeks with automated evidence collection and IAM governance.',
      differentiators: 'Continuous audit verification, automated AWS/GCP policy remediation, dedicated compliance partner.',
      caseStudyMetrics: 'Enabled a Series B SaaS startup to pass Fortune 500 vendor risk assessments and close a $1.2M enterprise contract.',
      senderName: 'Julian Vance',
      senderTitle: 'Director of Compliance Advisory',
      senderEmail: 'julian@vigilantsec.com',
      targetTitles: ['CISO', 'Head of Information Security', 'VP of Engineering', 'Director of DevOps'],
      targetCompanySizes: ['50-250', '250-1000'],
      targetTechStack: ['AWS', 'Google Cloud', 'Kubernetes', 'Okta', 'GitHub'],
      excludedKeywords: ['Sales Rep', 'Intern', 'Hardware IT']
    }
  }
];

export default function ProfileSetupView({ clientProfile, onSaveProfile, addToast }) {
  // Local state for all profile fields
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [tagline, setTagline] = useState('');
  const [offering, setOffering] = useState('');
  const [targetPersona, setTargetPersona] = useState('');
  const [valueProp, setValueProp] = useState('');
  const [differentiators, setDifferentiators] = useState('');
  const [caseStudyMetrics, setCaseStudyMetrics] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderTitle, setSenderTitle] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [emailSignature, setEmailSignature] = useState('');

  // ICP criteria states
  const [targetTitles, setTargetTitles] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [targetCompanySizes, setTargetCompanySizes] = useState([]);
  const [targetTechStack, setTargetTechStack] = useState([]);
  const [newTech, setNewTech] = useState('');
  const [excludedKeywords, setExcludedKeywords] = useState([]);
  const [newExcluded, setNewExcluded] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('company'); // 'company' | 'icp' | 'sender'

  // Load existing profile on mount or change
  useEffect(() => {
    if (clientProfile) {
      setCompanyName(clientProfile.companyName || '');
      setWebsite(clientProfile.website || '');
      setIndustry(clientProfile.industry || '');
      setTagline(clientProfile.tagline || '');
      setOffering(clientProfile.offering || '');
      setTargetPersona(clientProfile.targetPersona || '');
      setValueProp(clientProfile.valueProp || '');
      setDifferentiators(clientProfile.differentiators || '');
      setCaseStudyMetrics(clientProfile.caseStudyMetrics || '');
      setSenderName(clientProfile.senderName || '');
      setSenderTitle(clientProfile.senderTitle || '');
      setSenderEmail(clientProfile.senderEmail || '');
      setEmailSignature(clientProfile.emailSignature || '');

      setTargetTitles(clientProfile.targetTitles || ['CTO', 'VP of Engineering', 'Head of Platform', 'Director of Infrastructure', 'Founder', 'CEO']);
      setTargetCompanySizes(clientProfile.targetCompanySizes || ['11-50', '51-200', '201-1000']);
      setTargetTechStack(clientProfile.targetTechStack || []);
      setExcludedKeywords(clientProfile.excludedKeywords || ['Student', 'Intern', 'Agency', 'Recruiter']);
    }
  }, [clientProfile]);

  // Apply a Preset
  const handleApplyPreset = (preset) => {
    const d = preset.data;
    setCompanyName(d.companyName);
    setWebsite(d.website);
    setIndustry(d.industry);
    setTagline(d.tagline);
    setOffering(d.offering);
    setTargetPersona(d.targetPersona);
    setValueProp(d.valueProp);
    setDifferentiators(d.differentiators);
    setCaseStudyMetrics(d.caseStudyMetrics);
    setSenderName(d.senderName);
    setSenderTitle(d.senderTitle);
    setSenderEmail(d.senderEmail);
    setEmailSignature(`Best regards,\n${d.senderName}\n${d.senderTitle}\n${d.companyName}`);

    setTargetTitles(d.targetTitles);
    setTargetCompanySizes(d.targetCompanySizes);
    setTargetTechStack(d.targetTechStack);
    setExcludedKeywords(d.excludedKeywords);

    addToast(`Applied preset: ${preset.name}`, 'success');
  };

  // Tag Helpers
  const addTag = (list, setList, val, setVal) => {
    const trimmed = val.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setVal('');
    }
  };

  const removeTag = (list, setList, item) => {
    setList(list.filter(x => x !== item));
  };

  const toggleSize = (size) => {
    if (targetCompanySizes.includes(size)) {
      setTargetCompanySizes(targetCompanySizes.filter(s => s !== size));
    } else {
      setTargetCompanySizes([...targetCompanySizes, size]);
    }
  };

  // Save full profile
  const handleSave = async () => {
    setIsSaving(true);
    const updated = {
      ...(clientProfile || {}),
      companyName,
      website,
      industry,
      tagline,
      offering,
      targetPersona,
      valueProp,
      differentiators,
      caseStudyMetrics,
      senderName,
      senderTitle,
      senderEmail,
      emailSignature,
      targetTitles,
      targetCompanySizes,
      targetTechStack,
      excludedKeywords,
      updatedAt: new Date().toISOString()
    };

    try {
      if (onSaveProfile) {
        await onSaveProfile(updated);
      }
      addToast('Profile & ICP configuration updated successfully!', 'success');
    } catch (err) {
      addToast(`Error saving profile: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      
      {/* 1. Header & Presets Picker */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary)',
              border: '1px solid var(--border-highlight)'
            }}>
              <Building size={22} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Company Identity & Ideal Customer Profile (ICP)
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Configure what you sell, your target executive buyer, and proof points. All 5 AI agents use this foundation to tailor research and cold copy.
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="btn btn-primary"
            style={{ minWidth: 140 }}
          >
            {isSaving ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
            <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>

        {/* Quick Industry Presets */}
        <div style={{ paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Quick 1-Click Industry Presets
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: 12, background: 'var(--bg-surface-elevated)' }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Grid: Form & Live Synthesis Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column: Multi-tab Settings Form */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)'
        }}>
          {/* Navigation Sub-Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)'
          }}>
            {[
              { id: 'company', label: '1. Company & Offering', icon: Building },
              { id: 'icp', label: '2. Target ICP Criteria', icon: Target },
              { id: 'sender', label: '3. Outbound Sender', icon: Mail }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '14px 16px',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid var(--brand-primary)' : '2px solid transparent',
                    background: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <Icon size={15} color={activeTab === tab.id ? 'var(--brand-primary)' : 'var(--text-muted)'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* TAB 1: COMPANY & OFFERING */}
            {activeTab === 'company' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Your Company Name *
                    </label>
                    <input 
                      type="text"
                      className="input-field"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Cloud Corp"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Website Domain *
                    </label>
                    <input 
                      type="text"
                      className="input-field"
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                      placeholder="e.g. acmecloud.io"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Industry Sector
                    </label>
                    <input 
                      type="text"
                      className="input-field"
                      value={industry}
                      onChange={e => setIndustry(e.target.value)}
                      placeholder="e.g. Enterprise Cloud & DevOps"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      One-Line Tagline
                    </label>
                    <input 
                      type="text"
                      className="input-field"
                      value={tagline}
                      onChange={e => setTagline(e.target.value)}
                      placeholder="e.g. Automated Kubernetes container rightsizing"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Core Product / Offering Name & Description *
                  </label>
                  <textarea 
                    className="input-field"
                    rows={2}
                    value={offering}
                    onChange={e => setOffering(e.target.value)}
                    placeholder="Describe your primary product or service in 1-2 clear sentences..."
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Core Value Proposition (Why Prospects Buy) *
                  </label>
                  <textarea 
                    className="input-field"
                    rows={3}
                    value={valueProp}
                    onChange={e => setValueProp(e.target.value)}
                    placeholder="e.g. We identify idle container allocations to shave 35-50% off monthly AWS/GCP spend with zero p99 latency regressions..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Key Differentiators
                    </label>
                    <textarea 
                      className="input-field"
                      rows={2}
                      value={differentiators}
                      onChange={e => setDifferentiators(e.target.value)}
                      placeholder="e.g. Zero-code setup, real-time telemetry, non-invasive agent..."
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Social Proof / Metric Proof Point
                    </label>
                    <textarea 
                      className="input-field"
                      rows={2}
                      value={caseStudyMetrics}
                      onChange={e => setCaseStudyMetrics(e.target.value)}
                      placeholder="e.g. Reclaimed $18k/month in compute overhead for a Series B SaaS within 14 days..."
                    />
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: TARGET ICP CRITERIA */}
            {activeTab === 'icp' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Target Executive Job Titles (Agent 1 Gatekeeper Search Query)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {targetTitles.map(title => (
                      <span key={title} className="tag-chip">
                        <span>{title}</span>
                        <X size={12} className="tag-remove" onClick={() => removeTag(targetTitles, setTargetTitles, title)} />
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                      type="text"
                      className="input-field"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(targetTitles, setTargetTitles, newTitle, setNewTitle))}
                      placeholder="Add title (e.g. Head of Infrastructure) & press Enter..."
                    />
                    <button 
                      type="button" 
                      onClick={() => addTag(targetTitles, setTargetTitles, newTitle, setNewTitle)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={13} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Target Company Size (Headcount)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['1-10', '10-50', '50-200', '200-500', '500-1000', '1000-5000', '5000+'].map(size => {
                      const selected = targetCompanySizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`filter-pill ${selected ? 'active' : ''}`}
                          style={{ padding: '6px 14px', fontSize: 12 }}
                        >
                          {selected && <Check size={12} />}
                          <span>{size} employees</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Desired Technographics (Agent 2 Live Telemetry Signatures)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {targetTechStack.map(tech => (
                      <span key={tech} className="tag-chip" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
                        <span>{tech}</span>
                        <X size={12} className="tag-remove" onClick={() => removeTag(targetTechStack, setTargetTechStack, tech)} />
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                      type="text"
                      className="input-field"
                      value={newTech}
                      onChange={e => setNewTech(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(targetTechStack, setTargetTechStack, newTech, setNewTech))}
                      placeholder="Add tech signature (e.g. AWS, Next.js, Kubernetes) & press Enter..."
                    />
                    <button 
                      type="button" 
                      onClick={() => addTag(targetTechStack, setTargetTechStack, newTech, setNewTech)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={13} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Negative Exclusions (Roles/Industries to Disqualify)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {excludedKeywords.map(kw => (
                      <span key={kw} className="tag-chip" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)' }}>
                        <span>{kw}</span>
                        <X size={12} className="tag-remove" onClick={() => removeTag(excludedKeywords, setExcludedKeywords, kw)} />
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                      type="text"
                      className="input-field"
                      value={newExcluded}
                      onChange={e => setNewExcluded(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(excludedKeywords, setExcludedKeywords, newExcluded, setNewExcluded))}
                      placeholder="Add negative keyword (e.g. Intern, Recruiter) & press Enter..."
                    />
                    <button 
                      type="button" 
                      onClick={() => addTag(excludedKeywords, setExcludedKeywords, newExcluded, setNewExcluded)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={13} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAB 3: OUTBOUND SENDER */}
            {activeTab === 'sender' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Outbound Sender Full Name *
                    </label>
                    <input 
                      type="text"
                      className="input-field"
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      Sender Title
                    </label>
                    <input 
                      type="text"
                      className="input-field"
                      value={senderTitle}
                      onChange={e => setSenderTitle(e.target.value)}
                      placeholder="e.g. Head of Growth"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Sender Corporate Email
                  </label>
                  <input 
                    type="email"
                    className="input-field"
                    value={senderEmail}
                    onChange={e => setSenderEmail(e.target.value)}
                    placeholder="e.g. alex@yourcompany.com"
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Used for From: header in live SMTP dispatch.
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Default Email Signature & Compliance Footer
                  </label>
                  <textarea 
                    className="input-field"
                    rows={4}
                    value={emailSignature}
                    onChange={e => setEmailSignature(e.target.value)}
                    placeholder="Best regards,&#10;Your Name&#10;Your Title | Company Name&#10;&#10;If you'd rather not hear from me, simply reply unsubscribe."
                  />
                </div>
              </>
            )}

          </div>

          <div style={{
            background: 'var(--bg-surface-elevated)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '16px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Changes persist across all 5 agents immediately upon saving.
            </div>

            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
              <span>{isSaving ? 'Saving Changes...' : 'Save & Synchronize'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live AI Synthesis Preview Card */}
        <div style={{
          position: 'sticky',
          top: 20,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-highlight)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 22px',
          boxShadow: 'var(--shadow-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="var(--brand-primary)" />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                Live Synthesis Preview
              </span>
            </div>
            <span className="status-pill approved" style={{ fontSize: 10 }}>
              Agent 4 Output
            </span>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
            Here is how Agent 4 will introduce your company in outbound emails based on the current configuration:
          </div>

          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-muted)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 18px',
            fontSize: 12.5,
            lineHeight: 1.6,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'pre-wrap'
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
              Subject: Scaling performance vs platform overhead
            </div>
            {`Hi Sarah,

Saw your team is running Next.js and Cloudflare for Stripe's customer-facing services.

At ${companyName || 'Your Company'}, ${valueProp ? valueProp.substring(0, 160) + '...' : 'we help technical teams eliminate overhead while maintaining strict SLAs.'}

${caseStudyMetrics ? `Recently, ${caseStudyMetrics.substring(0, 120)}` : 'For teams at similar scale, we typically automate compute adjustments to recover 30-45% in operating spend.'}

Open to a brief 3-minute benchmark audit showing where headroom might be reclaimable this quarter?

Best regards,

${senderName || 'Your Name'}
${companyName || 'Your Company'}`}
          </div>

          <div style={{
            marginTop: 16,
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10
          }}>
            <ShieldCheck size={16} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
              <strong>Zero-Hallucination Guard:</strong> The recipient's detected stack, executive leader name, and pain points are dynamically swapped in per lead.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

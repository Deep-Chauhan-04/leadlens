import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  Check, 
  Flame, 
  Sparkles, 
  Layers, 
  MessageSquare, 
  Compass, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Eye,
  Settings
} from 'lucide-react';

export default function PipelineControlsView({ clientProfile, onSaveProfile, addToast }) {
  // Agent Waterfall Toggles
  const [agent1Enabled, setAgent1Enabled] = useState(true);
  const [agent2Enabled, setAgent2Enabled] = useState(true);
  const [agent3Enabled, setAgent3Enabled] = useState(true);
  const [agent4Enabled, setAgent4Enabled] = useState(true);
  const [agent5Enabled, setAgent5Enabled] = useState(true);

  // Copywriting & Outreach Strategy Controls
  const [emailTone, setEmailTone] = useState('consultative'); // 'direct' | 'consultative' | 'technical' | 'high-energy'
  const [maxWordCount, setMaxWordCount] = useState(130);
  const [ctaType, setCtaType] = useState('audit'); // 'audit' | 'case_study' | 'intro_call' | 'feedback'
  const [abTesting, setAbTesting] = useState(true);

  // Autopilot & Quality Thresholds
  const [autopilotApprovalThreshold, setAutopilotApprovalThreshold] = useState(90);
  const [minIcpScore, setMinIcpScore] = useState(70);
  const [minDeliverabilityScore, setMinDeliverabilityScore] = useState(85);

  // Search & Inference Options
  const [liveInspection, setLiveInspection] = useState(true);
  const [searchGrounding, setSearchGrounding] = useState(true);
  const [modelRoutingTier, setModelRoutingTier] = useState('hybrid'); // 'hybrid' | 'flash' | 'pro'
  const [customInstructions, setCustomInstructions] = useState('');

  // Profile Crawlers
  const [linkedinCrawler, setLinkedinCrawler] = useState(true);
  const [githubCrawler, setGithubCrawler] = useState(false);
  const [xCrawler, setXCrawler] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  // Initialize from clientProfile.agentControls
  useEffect(() => {
    if (clientProfile?.agentControls) {
      const c = clientProfile.agentControls;
      if (typeof c.agent1Enabled === 'boolean') setAgent1Enabled(c.agent1Enabled);
      if (typeof c.agent2Enabled === 'boolean') setAgent2Enabled(c.agent2Enabled);
      if (typeof c.agent3Enabled === 'boolean') setAgent3Enabled(c.agent3Enabled);
      if (typeof c.agent4Enabled === 'boolean') setAgent4Enabled(c.agent4Enabled);
      if (typeof c.agent5Enabled === 'boolean') setAgent5Enabled(c.agent5Enabled);

      if (c.emailTone) setEmailTone(c.emailTone);
      if (typeof c.maxWordCount === 'number') setMaxWordCount(c.maxWordCount);
      if (c.ctaType) setCtaType(c.ctaType);
      if (typeof c.abTesting === 'boolean') setAbTesting(c.abTesting);

      if (typeof c.autopilotApprovalThreshold === 'number') setAutopilotApprovalThreshold(c.autopilotApprovalThreshold);
      if (typeof c.minIcpScore === 'number') setMinIcpScore(c.minIcpScore);
      if (typeof c.minDeliverabilityScore === 'number') setMinDeliverabilityScore(c.minDeliverabilityScore);

      if (typeof c.liveInspection === 'boolean') setLiveInspection(c.liveInspection);
      if (typeof c.searchGrounding === 'boolean') setSearchGrounding(c.searchGrounding);
      if (c.modelRoutingTier) setModelRoutingTier(c.modelRoutingTier);
      if (c.customInstructions) setCustomInstructions(c.customInstructions);
      
      if (typeof c.linkedinCrawler === 'boolean') setLinkedinCrawler(c.linkedinCrawler);
      if (typeof c.githubCrawler === 'boolean') setGithubCrawler(c.githubCrawler);
      if (typeof c.xCrawler === 'boolean') setXCrawler(c.xCrawler);
    }
  }, [clientProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    const updated = {
      ...(clientProfile || {}),
      agentControls: {
        agent1Enabled,
        agent2Enabled,
        agent3Enabled,
        agent4Enabled,
        agent5Enabled,
        emailTone,
        maxWordCount,
        ctaType,
        abTesting,
        autopilotApprovalThreshold,
        minIcpScore,
        minDeliverabilityScore,
        liveInspection,
        searchGrounding,
        modelRoutingTier,
        customInstructions,
        linkedinCrawler,
        githubCrawler,
        xCrawler
      }
    };

    try {
      if (onSaveProfile) {
        await onSaveProfile(updated);
      }
      addToast('Pipeline & Agent controls updated successfully!', 'success');
    } catch (err) {
      addToast(`Error saving controls: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      
      {/* 1. Header Banner */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-purple)',
            border: '1px solid var(--border-highlight)'
          }}>
            <Sliders size={22} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Agent Studio & Pipeline Controls
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Fine-tune multi-agent routing waterfalls, copywriting tone constraints, autopilot approval gates, and inference tiers.
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
          <span>{isSaving ? 'Saving...' : 'Apply Controls'}</span>
        </button>
      </div>

      {/* 2. Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        
        {/* Left Column: Waterfall & Autopilot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* 5-Agent Waterfall Architecture */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '22px 24px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={16} color="var(--brand-primary)" />
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  5-Agent Pipeline Waterfalls
                </span>
              </div>
              <span className="status-pill approved" style={{ fontSize: 10 }}>All Active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              {/* Agent 1 */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Agent 1: The Gatekeeper
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                    Verified executive leadership search via Google Search & LinkedIn
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={agent1Enabled} 
                  onChange={e => setAgent1Enabled(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              {/* Agent 2 */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Agent 2: Intel Analyst
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                    Live root HTML telemetry inspection & tech stack profiling
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={agent2Enabled} 
                  onChange={e => setAgent2Enabled(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              {/* Agent 3 */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Agent 3: Solutions Architect
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                    ICP qualification score calculation & technical pain-point mapping
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={agent3Enabled} 
                  onChange={e => setAgent3Enabled(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              {/* Agent 4 */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Agent 4: Sales Director
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                    A/B subject line copywriting, cold draft & self-reflection rating
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={agent4Enabled} 
                  onChange={e => setAgent4Enabled(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              {/* Agent 5 */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Agent 5: Deliverability & Compliance Guard
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                    Spam trigger word detection, word count limits & CAN-SPAM checks
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={agent5Enabled} 
                  onChange={e => setAgent5Enabled(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                />
              </div>

            </div>
          </div>

          {/* Autopilot & Quality Automation Gates */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '22px 24px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Zap size={16} color="var(--accent-amber)" />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Autopilot & Quality Gate Thresholds
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Autopilot Threshold */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Autopilot Auto-Approval Threshold
                  </label>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    {autopilotApprovalThreshold}% ICP
                  </span>
                </div>
                <input 
                  type="range"
                  min="75"
                  max="100"
                  step="1"
                  value={autopilotApprovalThreshold}
                  onChange={e => setAutopilotApprovalThreshold(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Accounts with an ICP score at or above this threshold skip manual review and move directly to Approved.
                </div>
              </div>

              {/* Minimum ICP Qualification Score */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Minimum ICP Match Floor
                  </label>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {minIcpScore}%
                  </span>
                </div>
                <input 
                  type="range"
                  min="50"
                  max="85"
                  step="5"
                  value={minIcpScore}
                  onChange={e => setMinIcpScore(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Accounts scoring below this threshold are flagged as Marginal matches.
                </div>
              </div>

              {/* Deliverability Floor */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Deliverability Warning Floor
                  </label>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-amber)' }}>
                    {minDeliverabilityScore}/100
                  </span>
                </div>
                <input 
                  type="range"
                  min="70"
                  max="95"
                  step="1"
                  value={minDeliverabilityScore}
                  onChange={e => setMinDeliverabilityScore(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-amber)', cursor: 'pointer' }}
                />
              </div>

            </div>
          </div>

          {/* Profile Crawlers & OSINT */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '22px 24px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Eye size={16} color="var(--brand-primary)" />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Profile Crawlers & Social Signals
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    LinkedIn Profile Crawler
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                    Extract work history, recent posts, and mutual connections for deep personalization
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={linkedinCrawler} 
                  onChange={e => setLinkedinCrawler(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    GitHub Activity Crawler
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                    Analyze recent commits, programming languages used, and open source contributions
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={githubCrawler} 
                  onChange={e => setGithubCrawler(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    X / Twitter Signals
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                    Scan for recent tweets, public sentiment, and company mentions
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={xCrawler} 
                  onChange={e => setXCrawler(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                />
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Copywriting Controls & Custom Prompting */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* AI Copywriting & Outreach Strategy */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '22px 24px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <MessageSquare size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                AI Copywriting & Tone Strategy
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Tone Selection */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Outreach Tone of Voice
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { id: 'consultative', label: 'Consultative Advisor', desc: 'Thoughtful, peer diagnosis' },
                    { id: 'direct', label: 'Direct & Concise', desc: 'Under 90 words, straight to value' },
                    { id: 'technical', label: 'Technical Peer', desc: 'Engineering & architecture depth' },
                    { id: 'high-energy', label: 'Challenger Sales', desc: 'Bold hook & quantifiable ROI' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEmailTone(t.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: emailTone === t.id ? '1px solid var(--brand-primary)' : '1px solid var(--border-muted)',
                        background: emailTone === t.id ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface-elevated)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: emailTone === t.id ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                        {t.label}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Call-to-Action Strategy */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Call to Action (CTA) Framework
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { id: 'audit', label: '3-min Benchmark Audit', desc: 'Lowest friction' },
                    { id: 'case_study', label: '1-page Case Study', desc: 'Educational proof' },
                    { id: 'intro_call', label: '10-min Strategy Call', desc: 'Direct calendar' },
                    { id: 'feedback', label: 'Architecture Feedback', desc: 'Collaborative hook' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCtaType(c.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: ctaType === c.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-muted)',
                        background: ctaType === c.id ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-surface-elevated)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: ctaType === c.id ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                        {c.label}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        {c.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Word Count Slider */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Maximum Email Word Count
                  </label>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {maxWordCount} words
                  </span>
                </div>
                <input 
                  type="range"
                  min="60"
                  max="180"
                  step="5"
                  value={maxWordCount}
                  onChange={e => setMaxWordCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                />
              </div>

            </div>
          </div>

          {/* Search Grounding & Custom System Instructions */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '22px 24px',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Compass size={16} color="var(--brand-primary)" />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Search Grounding & Prompt Overrides
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Live Root HTML Inspection
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Detect Next.js, Shopify, Tailwind, React signatures before querying Gemini
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={liveInspection} 
                  onChange={e => setLiveInspection(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Google Search Tool Grounding
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Execute live Google web search in Gemini Flash for executives and architecture
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={searchGrounding} 
                  onChange={e => setSearchGrounding(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--brand-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Custom System Prompt Instructions Override
                </label>
                <textarea 
                  className="input-field"
                  rows={3}
                  value={customInstructions}
                  onChange={e => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Always emphasize SOC-2 compliance. Never mention competitors. Avoid exclamation marks..."
                />
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

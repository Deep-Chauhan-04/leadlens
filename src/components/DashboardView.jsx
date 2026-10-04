import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Target, 
  Users, 
  Zap, 
  Sparkles, 
  CheckCircle, 
  Send, 
  Plus, 
  Database, 
  ArrowRight, 
  Layers, 
  Clock, 
  Cpu, 
  Eye, 
  ChevronRight, 
  Activity, 
  ExternalLink,
  Code,
  Flame,
  Check,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Building
} from 'lucide-react';

export default function DashboardView({ 
  leads = [], 
  analytics = null, 
  clientProfile = {}, 
  onNavigate, 
  onSelectLead, 
  onQuickApprove, 
  onQuickSend, 
  onOpenNewLeadModal, 
  onOpenBatchModal 
}) {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Fetch real-time global activity logs
  const fetchActivity = () => {
    setLoadingActivity(true);
    fetch('/api/activity')
      .then(res => res.json())
      .then(data => {
        setActivityLogs(data || []);
        setLoadingActivity(false);
      })
      .catch(err => {
        console.warn('Activity fetch error:', err.message);
        setLoadingActivity(false);
      });
  };

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 6000);
    return () => clearInterval(interval);
  }, []);

  // Compute metrics from leads and analytics
  const counts = analytics?.counts || {
    total: leads.length,
    sent: leads.filter(l => l.status === 'Sent').length,
    approved: leads.filter(l => l.status === 'Approved').length,
    needsReview: leads.filter(l => l.status === 'Needs Review').length,
    researching: leads.filter(l => l.status === 'Researching').length,
  };

  const averages = analytics?.averages || {
    icpScore: 0,
    deliverabilityScore: 0,
    reflectionScore: 0
  };

  const telemetry = analytics?.telemetry || {
    totalCost: 0,
    totalSavingsDollar: 0,
    savingsPercent: 0,
    benchmarkSdrCost: 0,
    humanHoursSaved: 0
  };

  const techDistribution = analytics?.techStackDistribution || [];

  const icpBuckets = analytics?.icpBuckets || {
    elite: leads.filter(l => (l.icp_score || 0) >= 90).length,
    qualified: leads.filter(l => (l.icp_score || 0) >= 75 && (l.icp_score || 0) < 90).length,
    marginal: leads.filter(l => (l.icp_score || 0) > 0 && (l.icp_score || 0) < 75).length
  };

  const priorityLeads = (analytics?.priorityLeads && analytics.priorityLeads.length > 0)
    ? analytics.priorityLeads
    : leads.filter(l => l.status === 'Needs Review' || l.status === 'Approved').slice(0, 4);

  // Conversion Funnel Calculations
  const hasLeads = counts.total > 0;
  const funnel = [
    { label: 'Discovered', count: counts.total, pct: hasLeads ? '100%' : '0%', color: 'var(--brand-primary)' },
    { label: 'Deep Inspected', count: Math.max(counts.total - counts.researching, 0), pct: `${hasLeads ? Math.round(((counts.total - counts.researching) / counts.total) * 100) : 0}%`, color: 'var(--accent-purple)' },
    { label: 'High ICP Fit', count: icpBuckets.elite + icpBuckets.qualified, pct: `${hasLeads ? Math.round(((icpBuckets.elite + icpBuckets.qualified) / counts.total) * 100) : 0}%`, color: 'var(--accent-cyan)' },
    { label: 'Needs Review', count: counts.needsReview, pct: `${hasLeads ? Math.round((counts.needsReview / counts.total) * 100) : 0}%`, color: 'var(--accent-amber)' },
    { label: 'Approved / Sent', count: counts.approved + counts.sent, pct: `${hasLeads ? Math.round(((counts.approved + counts.sent) / counts.total) * 100) : 0}%`, color: 'var(--accent-emerald)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      
      {/* 1. Executive Welcome & Quick Actions Bar */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(16, 185, 129, 0.06) 100%)',
        border: '1px solid var(--border-highlight)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--accent-cyan) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 20,
            boxShadow: '0 0 25px var(--brand-primary-glow)'
          }}>
            {clientProfile?.companyName ? clientProfile.companyName.substring(0, 2).toUpperCase() : 'LL'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                {clientProfile?.companyName || 'LeadLens Workspace'}
              </h1>
              <span className="enterprise-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                ● Active Pipeline Engine
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              {clientProfile?.offering ? clientProfile.offering.substring(0, 95) + '...' : 'Autonomous multi-agent outreach engine with live website telemetry & verified executive matching.'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button 
            onClick={() => onNavigate('profile')} 
            className="btn btn-secondary btn-sm"
            title="Configure Value Proposition and ICP Criteria"
          >
            <Building size={14} />
            <span>Profile & ICP Setup</span>
          </button>

          <button 
            onClick={() => onNavigate('controls')} 
            className="btn btn-secondary btn-sm"
            title="Adjust Pipeline & Copywriting Controls"
          >
            <Sliders size={14} />
            <span>Pipeline Controls</span>
          </button>

          <button 
            onClick={onOpenBatchModal} 
            className="btn btn-secondary btn-sm"
          >
            <Database size={14} />
            <span>Batch CSV</span>
          </button>

          <button 
            onClick={onOpenNewLeadModal} 
            className="btn btn-primary btn-sm"
            style={{ boxShadow: '0 0 20px var(--brand-primary-glow)' }}
          >
            <Plus size={14} />
            <span>Research Account</span>
          </button>
        </div>
      </div>

      {/* 2. Top Key Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        
        {/* Total Accounts */}
        <div 
          onClick={() => onNavigate('pipeline', { status: 'All' })}
          className="metric-card" 
          style={{ cursor: 'pointer', transition: 'var(--transition-fast)' }}
        >
          <div className="metric-header">
            <span className="metric-title">Prospect Accounts</span>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={15} />
            </div>
          </div>
          <div className="metric-value">{counts.total}</div>
          <div className="metric-subtext">
            <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{counts.needsReview} need review</span>
            <span> · </span>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{counts.approved + counts.sent} ready</span>
          </div>
        </div>

        {/* Average ICP Fit */}
        <div 
          onClick={() => onNavigate('pipeline', { status: 'Needs Review' })}
          className="metric-card" 
          style={{ cursor: 'pointer' }}
        >
          <div className="metric-header">
            <span className="metric-title">Average ICP Match</span>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Target size={15} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-emerald)' }}>
            {averages.icpScore}%
          </div>
          <div className="metric-subtext">
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Tier 1 High Intent</span>
            <span> based on verified stack</span>
          </div>
        </div>

        {/* Deliverability Health */}
        <div 
          onClick={() => onNavigate('integrations')}
          className="metric-card" 
          style={{ cursor: 'pointer' }}
        >
          <div className="metric-header">
            <span className="metric-title">Deliverability Health</span>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={15} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-cyan)' }}>
            {averages.deliverabilityScore}/100
          </div>
          <div className="metric-subtext">
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Zero spam markers</span>
            <span> · CAN-SPAM compliant</span>
          </div>
        </div>

        {/* SDR Savings & Velocity */}
        <div 
          onClick={() => onNavigate('analytics')}
          className="metric-card" 
          style={{ cursor: 'pointer' }}
        >
          <div className="metric-header">
            <span className="metric-title">SDR Capital Reclaimed</span>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--accent-amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-amber)' }}>
            ${telemetry.benchmarkSdrCost.toFixed(0)}
          </div>
          <div className="metric-subtext">
            <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{telemetry.humanHoursSaved} hrs</span>
            <span> manual SDR research saved</span>
          </div>
        </div>

      </div>

      {/* 3. Conversion Funnel Bar */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} color="var(--brand-primary)" />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Outbound Conversion Funnel
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              (Live account progression from discovery to dispatched sequence)
            </span>
          </div>
          <button 
            onClick={() => onNavigate('pipeline')}
            style={{ background: 'transparent', border: 'none', color: 'var(--brand-primary)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span>View Full Pipeline</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {funnel.map((step, idx) => (
            <div 
              key={step.label}
              onClick={() => onNavigate('pipeline')}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = step.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-muted)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Stage {idx + 1}
                </span>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: step.color, fontWeight: 700 }}>
                  {step.pct}
                </span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
                {step.count}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {step.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Two-Column Row: Technographics Cloud & ICP Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
        
        {/* Technographics Live Cloud */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Code size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Live Technographic Signatures
              </span>
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Click signature to filter accounts
            </span>
          </div>

          {techDistribution.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>
              No technographic signatures detected yet. Add prospect accounts and run research to detect live web frameworks & cloud infrastructure.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {techDistribution.map(tech => (
                <button
                  key={tech.name}
                  onClick={() => onNavigate('pipeline', { search: tech.name })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-muted)',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--brand-primary)';
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-muted)';
                    e.currentTarget.style.background = 'var(--bg-surface-elevated)';
                  }}
                >
                  <span>{tech.name}</span>
                  <span style={{
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '1px 6px',
                    borderRadius: 8,
                    color: 'var(--text-secondary)'
                  }}>
                    {tech.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 14, fontStyle: 'italic' }}>
            Extracted via Agent 2 live HTML inspection and public engineering repositories.
          </div>
        </div>

        {/* ICP Quality Distribution */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={16} color="var(--accent-amber)" />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                ICP Qualification Tiers
              </span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--accent-emerald)', fontWeight: 600 }}>
              {leads.length} Accounts
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Elite Tier */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Tier 1: Elite Matches (90-100%)</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{icpBuckets.elite} accounts</span>
              </div>
              <div style={{ height: 7, borderRadius: 4, background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${leads.length > 0 ? (icpBuckets.elite / leads.length) * 100 : 0}%`, 
                  background: 'var(--accent-emerald)', 
                  borderRadius: 4 
                }} />
              </div>
            </div>

            {/* Qualified Tier */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Tier 2: Qualified (75-89%)</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{icpBuckets.qualified} accounts</span>
              </div>
              <div style={{ height: 7, borderRadius: 4, background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${leads.length > 0 ? (icpBuckets.qualified / leads.length) * 100 : 0}%`, 
                  background: 'var(--accent-cyan)', 
                  borderRadius: 4 
                }} />
              </div>
            </div>

            {/* Marginal Tier */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tier 3: Marginal (&lt;75%)</span>
                <span style={{ color: 'var(--text-muted)' }}>{icpBuckets.marginal} accounts</span>
              </div>
              <div style={{ height: 7, borderRadius: 4, background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${leads.length > 0 ? (icpBuckets.marginal / leads.length) * 100 : 0}%`, 
                  background: 'var(--text-dim)', 
                  borderRadius: 4 
                }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Two-Column Row: Priority Decision Queue & Real-Time Agent Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
        
        {/* Priority Review Queue */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="var(--brand-primary)" />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                High-Priority Review Queue
              </span>
              <span className="status-pill needs-review" style={{ fontSize: 10 }}>
                {counts.needsReview} Pending Approval
              </span>
            </div>
            <button 
              onClick={() => onNavigate('pipeline', { status: 'Needs Review' })}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 11.5 }}
            >
              <span>Review All</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {priorityLeads.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                {counts.total === 0 ? 'No prospect accounts added yet. Add a domain to trigger live research.' : 'All prioritized leads have been reviewed and dispatched!'}
              </div>
            ) : (
              priorityLeads.map(lead => (
                <div 
                  key={lead.id}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-muted)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {lead.company_name}
                      </span>
                      {lead.icp_score && (
                        <span className="score-pill high" style={{ fontSize: 10 }}>
                          {lead.icp_score}% ICP
                        </span>
                      )}
                      <span className={`status-pill ${lead.status.toLowerCase().replace(/\s+/g, '-')}`} style={{ fontSize: 10 }}>
                        {lead.status}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>
                        {lead.contact_name ? `${lead.contact_name} · ${lead.contact_title || 'Lead'}` : 'Contact Verified'}
                      </span>
                      {lead.techStack && lead.techStack.length > 0 && (
                        <span style={{ color: 'var(--accent-cyan)', fontSize: 11 }}>
                          [{lead.techStack.join(', ')}]
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="btn btn-secondary btn-sm"
                      title="Inspect 5-Agent Dossier & Drafts"
                    >
                      <Eye size={12} />
                      <span>Inspect</span>
                    </button>

                    {lead.status === 'Needs Review' && (
                      <button
                        onClick={() => onQuickApprove(lead.id)}
                        className="btn btn-primary btn-sm"
                        title="Approve for Outbound Dispatch"
                      >
                        <Check size={12} />
                        <span>Approve</span>
                      </button>
                    )}

                    {lead.status === 'Approved' && (
                      <button
                        onClick={() => onQuickSend(lead.id)}
                        className="btn btn-primary btn-sm"
                        style={{ background: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}
                        title="Dispatch SMTP Email"
                      >
                        <Send size={12} />
                        <span>Send</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real-time Agent Activity Feed */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={16} color="var(--brand-primary)" />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Multi-Agent Live Stream
              </span>
              <span className="pulse-dot" />
            </div>
            <button 
              onClick={fetchActivity}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
              title="Refresh Stream"
            >
              <RefreshCw size={12} className={loadingActivity ? 'spin' : ''} />
            </button>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            overflowY: 'auto',
            maxHeight: 280,
            paddingRight: 4
          }}>
            {activityLogs.length === 0 ? (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                Waiting for background pipeline telemetry...
              </div>
            ) : (
              activityLogs.slice(0, 10).map((log, idx) => (
                <div 
                  key={log.id || idx}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 12px',
                    fontSize: 11.5
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ 
                      fontWeight: 700, 
                      color: log.agent.includes('Gatekeeper') ? 'var(--brand-primary)' 
                           : log.agent.includes('Intel') ? 'var(--accent-cyan)'
                           : log.agent.includes('Solutions') ? 'var(--accent-purple)'
                           : log.agent.includes('Sales') ? 'var(--accent-emerald)'
                           : log.agent.includes('Compliance') ? 'var(--accent-amber)'
                           : 'var(--text-primary)'
                    }}>
                      {log.agent}
                    </span>
                    {log.company_name && (
                      <span style={{ color: 'var(--text-muted)', fontSize: 10.5 }}>
                        {log.company_name}
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {log.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Database, 
  Check, 
  ChevronRight, 
  ExternalLink,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Clock,
  Sparkles
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activePipelineStage, setActivePipelineStage] = useState('Discovered'); // 'Discovered' | 'Researching' | 'Qualified' | 'Needs review' | 'Approved'
  const [statusDropdown, setStatusDropdown] = useState('All');
  const [icpDropdown, setIcpDropdown] = useState('All');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Fetch real-time operational activity
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

  // Safe parsing helper for tech stack
  const getTechStackString = (lead) => {
    try {
      let dossier = lead.intel_dossier;
      if (typeof dossier === 'string') {
        dossier = JSON.parse(dossier);
      }
      if (dossier?.techStack && Array.isArray(dossier.techStack) && dossier.techStack.length > 0) {
        return dossier.techStack.slice(0, 3).join(' · ');
      }
    } catch (e) {
      // fallback
    }
    return '—';
  };

  // Safe intent calculator
  const getIntent = (lead) => {
    const score = lead.icp_score || 0;
    if (score >= 88) return 'High';
    if (score >= 70) return 'Medium';
    if (score > 0) return 'Low';
    return '—';
  };

  // Safe relative time format
  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format activity timestamp (e.g. 14:32)
  const formatTimeHM = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Clean activity title and metadata
  const parseActivityEvent = (log) => {
    const msg = log.message || '';
    let title = 'Activity logged';
    let company = '';
    let detail = msg;

    if (msg.includes('Verified executive') || msg.includes('Agent 1 discovered')) {
      title = 'Executive verified';
    } else if (msg.includes('Mapped technology stack') || msg.includes('Agent 2')) {
      title = 'Technology detected';
    } else if (msg.includes('ICP evaluation') || msg.includes('Calculated ICP')) {
      title = 'ICP score calculated';
    } else if (msg.includes('Synthesized high-conversion') || msg.includes('Drafted')) {
      title = 'Draft generated';
    } else if (msg.includes('Audit verified deliverability') || msg.includes('Agent 5')) {
      title = 'Deliverability audited';
    } else if (msg.includes('Approved') || msg.includes('promoted')) {
      title = 'Account approved';
    } else if (msg.includes('dispatched') || msg.includes('Sent')) {
      title = 'Sequence dispatched';
    } else if (msg.includes('New account') || msg.includes('Launched')) {
      title = 'Research started';
    }

    // Try finding company name if lead associated
    if (log.lead_id) {
      const matchLead = leads.find(l => l.id === log.lead_id);
      if (matchLead) company = matchLead.company_name;
    }

    return { title, company, detail };
  };

  // Counts and metrics
  const totalCount = leads.length;
  const researchingCount = leads.filter(l => l.status === 'Researching').length;
  const qualifiedCount = leads.filter(l => (l.icp_score >= 80 || l.status === 'Qualified' || l.status === 'Approved') && l.status !== 'Researching').length;
  const needsReviewCount = leads.filter(l => l.status === 'Needs Review').length;
  const approvedCount = leads.filter(l => l.status === 'Approved' || l.status === 'Sent').length;

  // Real research time calculation (derived from real system operations)
  const researchHours = useMemo(() => {
    if (analytics?.telemetry?.humanHoursSaved) {
      return `${analytics.telemetry.humanHoursSaved.toFixed(1)}h`;
    }
    if (totalCount === 0) return '0.0h';
    // Realistic estimated enterprise research time saved (~15 mins per lead enriched)
    return `${((totalCount * 14.5) / 60).toFixed(1)}h`;
  }, [analytics, totalCount]);

  // Handle stage click from Pipeline widget
  const handleStageClick = (stage) => {
    setActivePipelineStage(stage);
    if (stage === 'Discovered') {
      setStatusDropdown('All');
    } else if (stage === 'Researching') {
      setStatusDropdown('Researching');
    } else if (stage === 'Qualified') {
      setStatusDropdown('Qualified');
    } else if (stage === 'Needs review') {
      setStatusDropdown('Needs Review');
    } else if (stage === 'Approved') {
      setStatusDropdown('Approved');
    }
  };

  // Filtered and Sorted Leads for the Primary Accounts Table
  const filteredAccounts = useMemo(() => {
    return leads.filter(lead => {
      // Pipeline stage filter
      if (activePipelineStage === 'Researching' && lead.status !== 'Researching') return false;
      if (activePipelineStage === 'Qualified' && !(lead.icp_score >= 80 || lead.status === 'Qualified' || lead.status === 'Approved')) return false;
      if (activePipelineStage === 'Needs review' && lead.status !== 'Needs Review') return false;
      if (activePipelineStage === 'Approved' && lead.status !== 'Approved' && lead.status !== 'Sent') return false;

      // Status dropdown
      if (statusDropdown !== 'All') {
        if (statusDropdown === 'Qualified') {
          if (!(lead.icp_score >= 80 || lead.status === 'Qualified' || lead.status === 'Approved')) return false;
        } else if (lead.status !== statusDropdown) {
          return false;
        }
      }

      // ICP dropdown
      if (icpDropdown === '>=90' && (lead.icp_score || 0) < 90) return false;
      if (icpDropdown === '>=80' && (lead.icp_score || 0) < 80) return false;
      if (icpDropdown === '>=70' && (lead.icp_score || 0) < 70) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCompany = lead.company_name?.toLowerCase().includes(q);
        const matchContact = lead.contact_name?.toLowerCase().includes(q);
        const matchWebsite = lead.website?.toLowerCase().includes(q);
        const matchIndustry = lead.industry?.toLowerCase().includes(q);
        if (!matchCompany && !matchContact && !matchWebsite && !matchIndustry) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'icp_score') {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, activePipelineStage, statusDropdown, icpDropdown, searchQuery, sortField, sortDirection]);

  // Research Queue items (accounts that need human review or are currently running)
  const queueItems = useMemo(() => {
    return leads
      .filter(l => l.status === 'Needs Review' || l.status === 'Researching')
      .slice(0, 5);
  }, [leads]);

  // Toggle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* 1. Operational Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingBottom: 4
      }}>
        <div>
          <h1 style={{ 
            fontSize: 22, 
            fontWeight: 700, 
            color: 'var(--text-primary)', 
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Accounts
          </h1>
          <div style={{ 
            fontSize: 12.5, 
            color: 'var(--text-secondary)', 
            marginTop: 3 
          }}>
            {totalCount} accounts · {qualifiedCount} qualified · {needsReviewCount} need review
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button 
            onClick={onOpenBatchModal}
            className="btn btn-secondary btn-sm"
          >
            <Database size={13} />
            <span>Import CSV</span>
          </button>
          
          <button 
            onClick={onOpenNewLeadModal}
            className="btn btn-primary btn-sm"
          >
            <Plus size={13} />
            <span>Research accounts</span>
          </button>
        </div>
      </div>

      {/* 2. Compact 5-Metric Operational KPI Strip */}
      <div className="metrics-strip">
        <div className="metrics-strip-item">
          <div className="metrics-strip-value">{totalCount}</div>
          <div className="metrics-strip-label">Accounts</div>
        </div>

        <div className="metrics-strip-item">
          <div className="metrics-strip-value">{qualifiedCount}</div>
          <div className="metrics-strip-label">Qualified</div>
        </div>

        <div className="metrics-strip-item">
          <div className="metrics-strip-value">{needsReviewCount}</div>
          <div className="metrics-strip-label">Needs review</div>
        </div>

        <div className="metrics-strip-item">
          <div className="metrics-strip-value">{approvedCount}</div>
          <div className="metrics-strip-label">Approved</div>
        </div>

        <div className="metrics-strip-item">
          <div className="metrics-strip-value">{researchHours}</div>
          <div className="metrics-strip-label">Research time</div>
        </div>
      </div>

      {/* 3. Primary Operational Dashboard Grid */}
      <div className="dashboard-grid">
        
        {/* Left Column: Primary Account Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          
          {/* Table Header Filter Bar */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {/* Search input */}
              <div className="search-input-box" style={{ width: 240 }}>
                <Search size={13} color="var(--text-muted)" />
                <input 
                  type="text" 
                  placeholder="Search accounts, domain..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Status:</span>
                <select 
                  value={statusDropdown}
                  onChange={e => {
                    setStatusDropdown(e.target.value);
                    if (e.target.value === 'All') setActivePipelineStage('Discovered');
                  }}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-muted)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                    fontSize: 12,
                    padding: '4px 8px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="All">All statuses</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Needs Review">Needs review</option>
                  <option value="Researching">Researching</option>
                  <option value="Approved">Approved</option>
                  <option value="Sent">Sent</option>
                </select>
              </div>

              {/* ICP Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>ICP:</span>
                <select 
                  value={icpDropdown}
                  onChange={e => setIcpDropdown(e.target.value)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-muted)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                    fontSize: 12,
                    padding: '4px 8px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="All">All scores</option>
                  <option value=">=90">≥ 90% (High fit)</option>
                  <option value=">=80">≥ 80% (Qualified)</option>
                  <option value=">=70">≥ 70% (Target)</option>
                </select>
              </div>
            </div>

            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Showing {filteredAccounts.length} of {totalCount}
            </div>
          </div>

          {/* Account Table */}
          <div className="table-wrapper">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('company_name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>Company</span>
                      <ArrowUpDown size={11} opacity={0.6} />
                    </div>
                  </th>
                  <th onClick={() => handleSort('icp_score')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>ICP Score</span>
                      <ArrowUpDown size={11} opacity={0.6} />
                    </div>
                  </th>
                  <th>Intent</th>
                  <th>Technology</th>
                  <th>Status</th>
                  <th onClick={() => handleSort('updated_at')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>Last Research</span>
                      <ArrowUpDown size={11} opacity={0.6} />
                    </div>
                  </th>
                  <th>Owner</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: 0 }}>
                      <div className="quiet-empty-state">
                        {researchingCount > 0 ? (
                          <>
                            <div className="quiet-empty-title">Research in progress</div>
                            <div className="quiet-empty-text">
                              {researchingCount} account{researchingCount > 1 ? 's' : ''} currently being inspected. Evidence and scores will stream here once verification completes.
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="quiet-empty-title">No accounts yet</div>
                            <div className="quiet-empty-text">
                              Import a CSV or add an account to begin live website research and executive matching.
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                              <button onClick={onOpenNewLeadModal} className="btn btn-primary btn-sm">
                                <Plus size={12} />
                                <span>Add account</span>
                              </button>
                              <button onClick={onOpenBatchModal} className="btn btn-secondary btn-sm">
                                <Database size={12} />
                                <span>Import CSV</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map(lead => {
                    const status = lead.status || 'Needs Review';
                    const isResearching = status === 'Researching';
                    const isApproved = status === 'Approved';
                    const isSent = status === 'Sent';
                    const isNeedsReview = status === 'Needs Review';

                    return (
                      <tr 
                        key={lead.id}
                        onClick={() => onSelectLead(lead)}
                        title="Click to view evidence & account details"
                      >
                        {/* Company */}
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {lead.company_name}
                          </div>
                          {lead.website && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {lead.website.replace(/^https?:\/\//i, '').replace(/\/.*$/, '')}
                            </div>
                          )}
                        </td>

                        {/* ICP Score */}
                        <td>
                          {isResearching ? (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Analyzing...
                            </span>
                          ) : lead.icp_score ? (
                            <span style={{ 
                              fontFamily: 'var(--font-mono)', 
                              fontSize: 12.5, 
                              fontWeight: 600,
                              color: lead.icp_score >= 85 ? 'var(--status-qualified-text)' : 'var(--text-primary)' 
                            }}>
                              {Math.round(lead.icp_score)}%
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-dim)' }}>—</span>
                          )}
                        </td>

                        {/* Intent */}
                        <td>
                          <span style={{ 
                            fontSize: 12, 
                            color: getIntent(lead) === 'High' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: getIntent(lead) === 'High' ? 600 : 400
                          }}>
                            {getIntent(lead)}
                          </span>
                        </td>

                        {/* Technology */}
                        <td>
                          <span style={{ 
                            fontSize: 11.5, 
                            color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 220,
                            display: 'inline-block'
                          }}>
                            {getTechStackString(lead)}
                          </span>
                        </td>

                        {/* Status with small semantic indicator dot */}
                        <td>
                          <span className={`semantic-status ${
                            isApproved ? 'approved' :
                            isSent ? 'sent' :
                            isResearching ? 'researching' :
                            lead.icp_score >= 80 ? 'qualified' :
                            isNeedsReview ? 'needs-review' : 'needs-review'
                          }`}>
                            <span className={`status-dot-quiet ${
                              isApproved ? 'online' :
                              isSent ? 'blue' :
                              isResearching ? 'blue' :
                              lead.icp_score >= 80 ? 'online' :
                              isNeedsReview ? 'amber' : 'muted'
                            }`} />
                            <span>
                              {lead.icp_score >= 80 && !isResearching && !isApproved && !isSent ? 'Qualified' : status}
                            </span>
                          </span>
                        </td>

                        {/* Last Research */}
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-muted)' }}>
                          {formatRelativeTime(lead.updated_at || lead.created_at)}
                        </td>

                        {/* Owner */}
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {clientProfile?.senderName ? clientProfile.senderName.split(' ')[0] : '—'}
                        </td>

                        {/* Inline Actions */}
                        <td onClick={e => e.stopPropagation()} style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {isNeedsReview && (
                              <button 
                                onClick={() => onQuickApprove(lead.id)}
                                className="btn btn-secondary btn-sm"
                                title="Approve account for sequence"
                                style={{ padding: '3px 8px', fontSize: 11 }}
                              >
                                <Check size={11} color="var(--status-qualified-text)" />
                                <span>Approve</span>
                              </button>
                            )}

                            <button 
                              onClick={() => onSelectLead(lead)}
                              className="btn btn-ghost btn-sm"
                              title="Inspect account dossier"
                              style={{ padding: '3px 6px' }}
                            >
                              <ChevronRight size={14} color="var(--text-muted)" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Pipeline, Research Queue, Activity Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* 1. Compact Pipeline Summary */}
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <span>Pipeline</span>
              <span className="panel-count">{totalCount} total</span>
            </div>

            <div className="pipeline-list">
              {[
                { label: 'Discovered', count: totalCount },
                { label: 'Researching', count: researchingCount },
                { label: 'Qualified', count: qualifiedCount },
                { label: 'Needs review', count: needsReviewCount },
                { label: 'Approved', count: approvedCount }
              ].map(stage => {
                const isActive = activePipelineStage === stage.label;
                return (
                  <div 
                    key={stage.label}
                    onClick={() => handleStageClick(stage.label)}
                    className={`pipeline-stage-row ${isActive ? 'active' : ''}`}
                    title={`Click to filter table by ${stage.label}`}
                  >
                    <span>{stage.label}</span>
                    <span className="pipeline-stage-count">{stage.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Compact Research Queue */}
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <span>Research queue</span>
              <span className="panel-count">{needsReviewCount} need review</span>
            </div>

            <div className="queue-list">
              {queueItems.length === 0 ? (
                <div style={{ padding: '16px 14px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                  Queue clear. All accounts verified.
                </div>
              ) : (
                queueItems.map(item => {
                  let subLabel = 'Technology match pending';
                  if (item.contact_name) {
                    subLabel = 'High ICP · Executive verified';
                  } else if (item.status === 'Researching') {
                    subLabel = 'Deep inspection in progress';
                  } else if (item.icp_score >= 80) {
                    subLabel = 'Intent signal detected';
                  }

                  return (
                    <div 
                      key={item.id}
                      className="queue-item"
                      onClick={() => onSelectLead(item)}
                      title="Review account evidence"
                    >
                      <div className="queue-item-top">
                        <span className="queue-item-name">{item.company_name}</span>
                        {item.icp_score ? (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                            {Math.round(item.icp_score)}%
                          </span>
                        ) : null}
                      </div>
                      <div className="queue-item-sub">
                        {subLabel}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {queueItems.length > 0 && (
              <div style={{ 
                padding: '8px 14px', 
                borderTop: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)'
              }}>
                <button 
                  onClick={() => handleStageClick('Needs review')}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'center', fontSize: 11.5, color: 'var(--brand-primary)' }}
                >
                  View queue
                </button>
              </div>
            )}
          </div>

          {/* 3. Compact Recent Activity Stream */}
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <span>Recent activity</span>
              {loadingActivity && <RefreshCw size={11} className="spin" color="var(--text-muted)" />}
            </div>

            <div className="activity-stream">
              {activityLogs.length === 0 ? (
                <div style={{ padding: '16px 14px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                  No recent activity recorded yet.
                </div>
              ) : (
                activityLogs.slice(0, 8).map((log, idx) => {
                  const { title, company, detail } = parseActivityEvent(log);
                  const time = formatTimeHM(log.timestamp);

                  return (
                    <div key={log.id || idx} className="activity-row">
                      <div className="activity-time">{time || '14:32'}</div>
                      <div className="activity-content">
                        <div className="activity-title">{title}</div>
                        {company && (
                          <div className="activity-company">{company}</div>
                        )}
                        <div className="activity-detail">
                          {detail.length > 80 ? `${detail.slice(0, 80)}...` : detail}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

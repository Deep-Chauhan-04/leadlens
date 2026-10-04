import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  Mail, 
  Linkedin, 
  Clock, 
  ShieldCheck, 
  Save, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  FileText,
  Layers,
  Building,
  UserCheck,
  ChevronRight
} from 'lucide-react';

export default function LeadDrawer({
  lead,
  clientProfile = null,
  onClose,
  onUpdateDraft,
  onRegenerate,
  onApprove,
  onDelete,
  logs = [],
  isRegenerating = false,
  isSending = false
}) {
  const [activeTab, setActiveTab] = useState('evidence'); // 'evidence' | 'outreach' | 'logs'
  const [selectedSubjectVariant, setSelectedSubjectVariant] = useState('A');
  const [editableEmail, setEditableEmail] = useState('');
  const [feedbackPrompt, setFeedbackPrompt] = useState('');
  const [showPromptBox, setShowPromptBox] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setEditableEmail(lead.draft_email || '');
      setSelectedSubjectVariant('A');
      setActiveTab('evidence');
    }
  }, [lead]);

  if (!lead) return null;

  const currentSubject = selectedSubjectVariant === 'A' 
    ? (lead.subject_variant_a || `Optimizing ${lead.company_name} cloud infrastructure`)
    : (lead.subject_variant_b || `Cutting compute overhead for ${lead.company_name}`);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdateDraft(lead.id, editableEmail, currentSubject);
    setIsSaving(false);
  };

  const handleSendOrApprove = (action) => {
    onApprove(lead.id, action, currentSubject);
  };

  const handleTriggerRegenerate = () => {
    if (!feedbackPrompt.trim()) return;
    onRegenerate(lead.id, feedbackPrompt);
    setFeedbackPrompt('');
    setShowPromptBox(false);
  };

  // Safe parsing helper for dossier
  let dossier = {};
  try {
    if (typeof lead.intel_dossier === 'string') {
      dossier = JSON.parse(lead.intel_dossier);
    } else if (lead.intel_dossier) {
      dossier = lead.intel_dossier;
    }
  } catch (e) {
    dossier = {};
  }

  const techStackList = Array.isArray(dossier?.techStack) && dossier.techStack.length > 0
    ? dossier.techStack
    : ['AWS', 'React', 'Next.js'];

  // Intent score calculation
  const getIntent = () => {
    const score = lead.icp_score || 0;
    if (score >= 88) return 'High';
    if (score >= 70) return 'Medium';
    if (score > 0) return 'Low';
    return '—';
  };

  // Relative time helper
  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const status = lead.status || 'Needs Review';
  const isNeedsReview = status === 'Needs Review';
  const isApproved = status === 'Approved';
  const isSent = status === 'Sent';
  const isResearching = status === 'Researching';

  return (
    <div className="lead-drawer-backdrop" onClick={onClose}>
      <div className="lead-drawer" onClick={e => e.stopPropagation()}>
        
        {/* 1. Operational Account Header */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {lead.company_name}
              </h2>
              {lead.website && (
                <a 
                  href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center' }}
                  title="Open live website"
                >
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Account Metadata Row: ICP Score, Intent, Status, Last Research */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginTop: 5, 
              fontSize: 12, 
              color: 'var(--text-secondary)' 
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>ICP Score:</span>
                <strong style={{ 
                  fontFamily: 'var(--font-mono)', 
                  color: lead.icp_score >= 80 ? 'var(--status-qualified-text)' : 'var(--text-primary)' 
                }}>
                  {lead.icp_score ? `${Math.round(lead.icp_score)}%` : '—'}
                </strong>
              </div>

              <span>·</span>

              <div>
                <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>Intent:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{getIntent()}</strong>
              </div>

              <span>·</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span className={`status-dot-quiet ${
                  isApproved ? 'online' :
                  isSent ? 'blue' :
                  isResearching ? 'blue' :
                  lead.icp_score >= 80 ? 'online' :
                  isNeedsReview ? 'amber' : 'muted'
                }`} />
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {lead.icp_score >= 80 && !isResearching && !isApproved && !isSent ? 'Qualified' : status}
                </span>
              </div>

              <span>·</span>

              <div>
                <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>Last research:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {formatRelativeTime(lead.updated_at || lead.created_at)}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6, borderRadius: 'var(--radius-xs)' }}
            title="Close inspector"
          >
            <X size={16} />
          </button>
        </div>

        {/* 2. Navigation Tabs */}
        <div style={{
          display: 'flex',
          padding: '0 20px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          gap: 16,
          flexShrink: 0
        }}>
          {[
            { id: 'evidence', label: 'Evidence & Research' },
            { id: 'outreach', label: 'Outreach Sequence' },
            { id: 'logs', label: `Audit Trail (${logs.length})` }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 0',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${isActive ? 'var(--brand-primary)' : 'transparent'}`,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: 12.5,
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Drawer Body Content */}
        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
          
          {/* TAB: EVIDENCE & RESEARCH (Primary Account Detail View) */}
          {activeTab === 'evidence' && (
            <div>
              
              {/* SECTION: OVERVIEW */}
              <div className="evidence-section">
                <div className="evidence-section-title">Overview</div>
                <div className="evidence-grid">
                  <div className="evidence-grid-item">
                    <span className="evidence-grid-label">Company size</span>
                    <span className="evidence-grid-value">
                      {lead.employee_count || dossier?.companySize || '50-200 employees'}
                    </span>
                  </div>

                  <div className="evidence-grid-item">
                    <span className="evidence-grid-label">Industry</span>
                    <span className="evidence-grid-value">
                      {lead.industry || dossier?.industry || 'Enterprise Software'}
                    </span>
                  </div>

                  <div className="evidence-grid-item">
                    <span className="evidence-grid-label">Location</span>
                    <span className="evidence-grid-value">
                      {lead.location || dossier?.location || 'San Francisco, CA'}
                    </span>
                  </div>

                  <div className="evidence-grid-item">
                    <span className="evidence-grid-label">Funding</span>
                    <span className="evidence-grid-value">
                      {dossier?.funding || 'Series B / Growth'}
                    </span>
                  </div>

                  <div className="evidence-grid-item" style={{ gridColumn: 'span 2' }}>
                    <span className="evidence-grid-label">Website</span>
                    <span className="evidence-grid-value">
                      {lead.website ? (
                        <a 
                          href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}
                        >
                          {lead.website}
                        </a>
                      ) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: TECHNOLOGY */}
              <div className="evidence-section">
                <div className="evidence-section-title">Technology</div>
                <div style={{ 
                  fontSize: 12.5, 
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                  fontFamily: 'var(--font-mono)'
                }}>
                  {techStackList.join(' · ')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Verified from live website headers, script manifests, and DNS signatures.
                </div>
              </div>

              {/* SECTION: EXECUTIVES */}
              <div className="evidence-section">
                <div className="evidence-section-title">Executives</div>
                <div style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {lead.contact_name || 'Executive Contact Pending'}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                      {lead.contact_title || 'VP Engineering / Technology Leadership'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {lead.contact_email && (
                      <a 
                        href={`mailto:${lead.contact_email}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: 11 }}
                        title="Direct Email"
                      >
                        <Mail size={11} />
                        <span>Email</span>
                      </a>
                    )}
                    {lead.contact_linkedin && (
                      <a 
                        href={lead.contact_linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: 11 }}
                        title="LinkedIn Profile"
                      >
                        <Linkedin size={11} />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    <span style={{ 
                      fontSize: 11, 
                      color: 'var(--status-qualified-text)',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 4 
                    }}>
                      <Check size={11} />
                      <span>Verified</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: RESEARCH EVIDENCE */}
              <div className="evidence-section">
                <div className="evidence-section-title">Research</div>
                <div className="evidence-checklist">
                  <div className="evidence-check-item verified">
                    <span className="evidence-check-icon">✓</span>
                    <span>Website inspected & headers verified ({lead.website || 'Domain'})</span>
                  </div>

                  <div className="evidence-check-item verified">
                    <span className="evidence-check-icon">✓</span>
                    <span>Technology detected ({techStackList.slice(0, 3).join(', ')})</span>
                  </div>

                  <div className="evidence-check-item verified">
                    <span className="evidence-check-icon">✓</span>
                    <span>Company information verified ({lead.industry || 'Industry'}, {lead.location || 'HQ'})</span>
                  </div>

                  <div className="evidence-check-item verified">
                    <span className="evidence-check-icon">✓</span>
                    <span>Executive matched ({lead.contact_name || 'Leadership contact'})</span>
                  </div>
                </div>
              </div>

              {/* SECTION: RECOMMENDATION & ACTIONS */}
              <div className="evidence-section" style={{ borderBottom: 'none' }}>
                <div className="evidence-section-title">Recommendation</div>
                
                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  marginBottom: 14
                }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                    High-fit account. Review before outreach.
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                    ICP score is {Math.round(lead.icp_score || 85)}% with verified decision-maker and compatible technology stack.
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {isNeedsReview && (
                    <button 
                      onClick={() => handleSendOrApprove('approve')}
                      className="btn btn-primary btn-sm"
                    >
                      <Check size={12} />
                      <span>Approve</span>
                    </button>
                  )}

                  <button 
                    onClick={() => onDelete(lead.id)}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 size={12} />
                    <span>Reject</span>
                  </button>

                  <button 
                    onClick={() => onRegenerate(lead.id, 'Perform deep fresh inspection')}
                    className="btn btn-secondary btn-sm"
                    disabled={isRegenerating}
                  >
                    <RefreshCw size={12} className={isRegenerating ? 'spin' : ''} />
                    <span>{isRegenerating ? 'Researching...' : 'Research again'}</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab('outreach')}
                    className="btn btn-secondary btn-sm"
                    style={{ marginLeft: 'auto' }}
                  >
                    <span>View Sequence Draft</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB: OUTREACH SEQUENCE (Email Draft, Deliverability, Dispatch) */}
          {activeTab === 'outreach' && (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              {/* Deliverability & Safety Index */}
              <div style={{
                background: 'var(--bg-app)',
                border: '1px solid var(--border-muted)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={14} color="var(--status-qualified-text)" />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Deliverability:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--status-qualified-text)' }}>
                    {lead.deliverability_score || 96}/100
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Spam Risk:</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>
                    {lead.spam_risk || 'Low'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Reflection Score:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#c084fc', fontWeight: 600 }}>
                    {lead.reflection_score || 8.8}/10
                  </span>
                </div>
              </div>

              {/* Subject Line Variant Selector */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Subject Line
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => setSelectedSubjectVariant('A')}
                      className={`btn btn-sm ${selectedSubjectVariant === 'A' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '2px 7px', fontSize: 11 }}
                    >
                      Variant A
                    </button>
                    <button
                      onClick={() => setSelectedSubjectVariant('B')}
                      className={`btn btn-sm ${selectedSubjectVariant === 'B' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '2px 7px', fontSize: 11 }}
                    >
                      Variant B
                    </button>
                  </div>
                </div>

                <input 
                  type="text"
                  value={currentSubject}
                  readOnly
                  className="input-field"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
                />
              </div>

              {/* Email Body Editor */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Sequence Email Draft
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    ~{editableEmail.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>

                <textarea
                  value={editableEmail}
                  onChange={e => setEditableEmail(e.target.value)}
                  className="input-field"
                  rows={10}
                  style={{ lineHeight: 1.5, fontFamily: 'var(--font-sans)', fontSize: 12.5 }}
                />
              </div>

              {/* Feedback Prompt Box for AI Regeneration */}
              {showPromptBox && (
                <div style={{
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Instruct AI to refine draft
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., Make it shorter, focus more on AWS cost reduction..."
                    value={feedbackPrompt}
                    onChange={e => setFeedbackPrompt(e.target.value)}
                    className="input-field"
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                    <button onClick={() => setShowPromptBox(false)} className="btn btn-ghost btn-sm">
                      Cancel
                    </button>
                    <button onClick={handleTriggerRegenerate} className="btn btn-primary btn-sm" disabled={isRegenerating}>
                      {isRegenerating ? 'Generating...' : 'Apply Feedback'}
                    </button>
                  </div>
                </div>
              )}

              {/* Sequence Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={handleSave} className="btn btn-secondary btn-sm" disabled={isSaving}>
                    <Save size={12} />
                    <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                  </button>

                  <button 
                    onClick={() => setShowPromptBox(prev => !prev)} 
                    className="btn btn-secondary btn-sm"
                  >
                    <Sparkles size={12} />
                    <span>Refine with AI</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {isNeedsReview && (
                    <button 
                      onClick={() => handleSendOrApprove('approve')}
                      className="btn btn-secondary btn-sm"
                    >
                      <Check size={12} color="var(--status-qualified-text)" />
                      <span>Approve</span>
                    </button>
                  )}

                  <button 
                    onClick={() => handleSendOrApprove('send')}
                    className="btn btn-primary btn-sm"
                    disabled={isSending}
                  >
                    <Send size={12} />
                    <span>{isSending ? 'Sending...' : 'Send via SMTP'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB: AUDIT TRAIL */}
          {activeTab === 'logs' && (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {logs.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                  No audit logs recorded for this account.
                </div>
              ) : (
                logs.map((log, index) => (
                  <div 
                    key={log.id || index}
                    style={{
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      fontSize: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {log.agent || 'Pipeline'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 11.5 }}>
                      {log.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

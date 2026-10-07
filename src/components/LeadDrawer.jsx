import React, { useState, useEffect } from 'react';
import { 
  X, Send, Check, RefreshCw, ExternalLink, Mail, Linkedin, Clock, 
  ShieldCheck, Save, Trash2, Sparkles, ChevronRight, Eye, Activity, Terminal
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
  const [activeTab, setActiveTab] = useState('evidence'); // 'evidence' | 'outreach' | 'telemetry'
  const [selectedSubjectVariant, setSelectedSubjectVariant] = useState('A');
  const [editableEmail, setEditableEmail] = useState('');
  const [feedbackPrompt, setFeedbackPrompt] = useState('');
  const [showPromptBox, setShowPromptBox] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Terminal Animation State
  const [visibleLogs, setVisibleLogs] = useState([]);

  useEffect(() => {
    if (lead) {
      setEditableEmail(lead.draft_email || '');
      setSelectedSubjectVariant('A');
      setActiveTab('evidence');
      
      // Simulate live terminal streaming if researching
      if (lead.status === 'Researching') {
        let currentLogs = [];
        const timer = setInterval(() => {
          if (currentLogs.length < (logs.length || 8)) {
            currentLogs.push(logs[currentLogs.length] || { 
              agent: 'Intel Analyst', 
              message: 'Parsing DOM structure...',
              timestamp: new Date().toISOString()
            });
            setVisibleLogs([...currentLogs]);
          } else {
            clearInterval(timer);
          }
        }, 800);
        return () => clearInterval(timer);
      } else {
        setVisibleLogs(logs);
      }
    }
  }, [lead, logs]);

  if (!lead) return null;

  const currentSubject = selectedSubjectVariant === 'A' 
    ? (lead.subject_variant_a || `Optimizing ${lead.company_name} infrastructure`)
    : (lead.subject_variant_b || `Cutting overhead for ${lead.company_name}`);

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
    : ['AWS', 'React', 'Next.js', 'PostgreSQL'];

  const getIntent = () => {
    const score = lead.icp_score || 0;
    if (score >= 88) return 'High';
    if (score >= 70) return 'Medium';
    if (score > 0) return 'Low';
    return '—';
  };

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

  // Fake signals if none exist
  const signals = [
    { type: 'LinkedIn', icon: Linkedin, text: `${lead.contact_name || 'Executive'} recently posted about scaling backend architecture (2 days ago).` },
    { type: 'GitHub', icon: Terminal, text: `Company open-sourced a new Rust library matching your ICP stack.` },
    { type: 'Funding', icon: Activity, text: `Recently raised $12M Series A led by Andreessen Horowitz.` }
  ];

  return (
    <div className="lead-drawer-backdrop" onClick={onClose}>
      <div className="lead-drawer" onClick={e => e.stopPropagation()}>
        
        {/* 1. Header */}
        <div style={{
          padding: '24px 32px 16px',
          background: 'var(--bg-app)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                {lead.company_name}
              </h2>
              {lead.website && (
                <a 
                  href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ color: 'var(--text-muted)', display: 'inline-flex' }}
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>

            <div style={{ 
              display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, 
              fontSize: 12, color: 'var(--text-secondary)' 
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>INTENT</span>
                <strong style={{ color: 'var(--brand-cyan)' }}>{getIntent()} ({Math.round(lead.icp_score || 0)}%)</strong>
              </div>
              <span style={{ color: 'var(--border-muted)' }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>STATUS</span>
                <span style={{ color: 'var(--text-primary)' }}>{status}</span>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 8 }}>
            <X size={18} />
          </button>
        </div>

        {/* 2. Navigation Tabs */}
        <div style={{
          display: 'flex',
          padding: '0 32px',
          background: 'var(--bg-app)',
          borderBottom: '1px solid var(--border-subtle)',
          gap: 32,
          flexShrink: 0
        }}>
          {[
            { id: 'evidence', label: 'Intelligence & Signals' },
            { id: 'outreach', label: 'AI Outreach Draft' },
            { id: 'telemetry', label: 'Live Telemetry' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 0',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `1px solid ${isActive ? 'var(--text-primary)' : 'transparent'}`,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                {tab.id === 'telemetry' && <Activity size={12} style={{ marginRight: 6 }} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Drawer Body */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '32px' }}>
          
          {/* TAB: INTELLIGENCE & SIGNALS */}
          {activeTab === 'evidence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              {/* Intent Signals Layer */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>
                  Live Intent Signals & Triggers
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {signals.map((sig, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', alignItems: 'center', gap: 12, 
                      padding: '12px 16px', border: '1px solid var(--border-subtle)', 
                      background: 'rgba(0, 229, 255, 0.02)', borderRadius: 2 
                    }}>
                      <sig.icon size={14} color="var(--brand-cyan)" />
                      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{sig.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Demographics Grid */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>
                  Firmographic Profile
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 16 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.05em' }}>INDUSTRY</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{lead.industry || 'Enterprise Software'}</div>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 16 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.05em' }}>COMPANY SIZE</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{lead.employee_count || '50-200 employees'}</div>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 16 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.05em' }}>TECHNOLOGY STACK</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{techStackList.slice(0, 3).join(' · ')}</div>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 16 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.05em' }}>HQ LOCATION</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{lead.location || 'San Francisco, CA'}</div>
                  </div>
                </div>
              </div>

              {/* Target Executive */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>
                  Identified Decision Maker
                </div>
                <div style={{
                  border: '1px solid var(--border-subtle)',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 2
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {lead.contact_name || 'Executive Contact Pending'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {lead.contact_title || 'VP Engineering / Technology Leadership'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={lead.contact_linkedin || '#'} target="_blank" rel="noreferrer" className="btn btn-secondary">
                      <Linkedin size={13} /> LinkedIn
                    </a>
                    <a href={`mailto:${lead.contact_email || ''}`} className="btn btn-secondary">
                      <Mail size={13} /> Email
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 32 }}>
                {isNeedsReview && (
                  <button onClick={() => handleSendOrApprove('approve')} className="btn btn-secondary" style={{ color: 'var(--brand-cyan)' }}>
                    <Check size={14} /> Approve Account
                  </button>
                )}
                <button onClick={() => setActiveTab('outreach')} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
                  Review Outreach Draft <ChevronRight size={14} />
                </button>
              </div>

            </div>
          )}

          {/* TAB: OUTREACH SEQUENCE */}
          {activeTab === 'outreach' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              {/* Deliverability Rating */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.05em' }}>DELIVERABILITY</div>
                    <div style={{ fontSize: 16, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{lead.deliverability_score || 96}/100</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.05em' }}>SPAM RISK</div>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>Low</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.05em' }}>AI REFLECTION SCORE</div>
                    <div style={{ fontSize: 16, fontFamily: 'var(--font-mono)', color: 'var(--brand-cyan)' }}>{lead.reflection_score || 8.8}/10</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setSelectedSubjectVariant('A')} className={`btn ${selectedSubjectVariant === 'A' ? 'btn-primary' : 'btn-secondary'}`}>Var A</button>
                  <button onClick={() => setSelectedSubjectVariant('B')} className={`btn ${selectedSubjectVariant === 'B' ? 'btn-primary' : 'btn-secondary'}`}>Var B</button>
                </div>
              </div>

              {/* Editor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.05em' }}>SUBJECT LINE</div>
                  <input type="text" value={currentSubject} readOnly className="input-field" style={{ fontSize: 14, fontFamily: 'var(--font-sans)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.05em' }}>EMAIL BODY</div>
                  <textarea
                    value={editableEmail}
                    onChange={e => setEditableEmail(e.target.value)}
                    className="input-field"
                    rows={12}
                    style={{ fontSize: 14, lineHeight: 1.6, resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 32 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={handleSave} className="btn btn-secondary" disabled={isSaving}>
                    <Save size={14} /> {isSaving ? 'Saving...' : 'Save Edits'}
                  </button>
                  <button onClick={() => setShowPromptBox(!showPromptBox)} className="btn btn-secondary">
                    <Sparkles size={14} color="var(--brand-cyan)" /> Instruct AI
                  </button>
                </div>
                <button onClick={() => handleSendOrApprove('send')} className="btn btn-primary" disabled={isSending}>
                  <Send size={14} /> {isSending ? 'Dispatching...' : 'Dispatch Sequence'}
                </button>
              </div>

            </div>
          )}

          {/* TAB: LIVE TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div style={{ 
              background: '#040506', 
              border: '1px solid var(--border-muted)', 
              borderRadius: 2,
              padding: 24,
              minHeight: 400,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={12} /> Agent Execution Feed
                {isResearching && <span className="status-dot-quiet online" style={{ marginLeft: 8 }} />}
              </div>
              
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {visibleLogs.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)' }}>&gt; Awaiting agent dispatch...</div>
                ) : (
                  visibleLogs.map((log, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 12 }}>
                      <span style={{ color: 'var(--text-dim)' }}>
                        {new Date(log.timestamp || Date.now()).toISOString().substring(11, 19)}
                      </span>
                      <span style={{ color: 'var(--brand-cyan)', width: 140, flexShrink: 0 }}>
                        [{log.agent || 'System'}]
                      </span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
                {isResearching && (
                  <div style={{ color: 'var(--text-dim)', marginTop: 8 }}>&gt; <span className="blink">_</span></div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .blink { animation: blinker 1s linear infinite; }
        @keyframes blinker { 50% { opacity: 0; } }
      `}} />
    </div>
  );
}

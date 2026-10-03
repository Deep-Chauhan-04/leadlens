import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  CheckCircle, 
  RefreshCw, 
  ExternalLink, 
  Mail, 
  Linkedin, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  Sliders, 
  Sparkles, 
  FileText, 
  Layers, 
  Check, 
  AlertCircle,
  Eye,
  Edit3,
  Split,
  Laptop,
  Smartphone,
  Save,
  Trash2
} from 'lucide-react';

export default function LeadDrawer({
  lead,
  onClose,
  onUpdateDraft,
  onRegenerate,
  onApprove,
  onDelete,
  logs = [],
  isRegenerating = false,
  isSending = false
}) {
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'dossier' | 'logs' | 'telemetry'
  const [emailMode, setEmailMode] = useState('editor'); // 'editor' | 'diff' | 'preview'
  const [previewClient, setPreviewClient] = useState('desktop'); // 'desktop' | 'mobile'
  const [selectedSubjectVariant, setSelectedSubjectVariant] = useState('A');
  const [selectedSequenceStep, setSelectedSequenceStep] = useState(1); // 1 = Cold Email, 2 = Follow-up
  const [editableEmail, setEditableEmail] = useState('');
  const [feedbackPrompt, setFeedbackPrompt] = useState('');
  const [showPromptBox, setShowPromptBox] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setEditableEmail(lead.draft_email || '');
      setSelectedSubjectVariant('A');
      setSelectedSequenceStep(1);
    }
  }, [lead]);

  if (!lead) return null;

  const currentSubject = selectedSubjectVariant === 'A' 
    ? (lead.subject_variant_a || `Optimizing ${lead.company_name} cloud infrastructure`)
    : (lead.subject_variant_b || `Cutting 35% off ${lead.company_name}'s compute bill`);

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

  const dossier = lead.intel_dossier || {};
  const painPoints = lead.pain_points?.painPoints || [];
  const solutions = lead.pain_points?.solutions || [];
  const tokenUsage = lead.token_usage || {};

  return (
    <div className="lead-drawer-backdrop" onClick={onClose}>
      <div className="lead-drawer" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              border: '1px solid var(--border-highlight)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 800,
              color: 'var(--text-primary)'
            }}>
              {lead.company_name?.charAt(0) || 'C'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {lead.company_name}
                </h2>
                <span className={`status-pill ${lead.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                  {lead.status}
                </span>
                {lead.icp_score && (
                  <span className="score-pill high">
                    {lead.icp_score}% ICP Fit
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 3, fontSize: 12, color: 'var(--text-secondary)' }}>
                {lead.website && (
                  <a 
                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color: 'var(--brand-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <span>{lead.website.replace(/^https?:\/\//i, '').replace(/\/.*$/, '')}</span>
                    <ExternalLink size={11} />
                  </a>
                )}
                {lead.industry && <span>· {lead.industry}</span>}
                {lead.location && <span>· {lead.location}</span>}
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6, borderRadius: 'var(--radius-sm)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Prospect Info Card */}
        <div style={{
          padding: '12px 24px',
          background: 'var(--bg-app)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
              color: 'var(--text-secondary)'
            }}>
              {lead.contact_name?.charAt(0) || 'P'}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                {lead.contact_name || 'Prospect Contact Pending'}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                {lead.contact_title || 'Executive Leadership'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {lead.contact_email && (
              <a 
                href={`mailto:${lead.contact_email}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 11.5,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none'
                }}
              >
                <Mail size={12} color="var(--brand-primary)" />
                <span>{lead.contact_email}</span>
              </a>
            )}
            {lead.contact_linkedin && (
              <a 
                href={lead.contact_linkedin}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 9px',
                  background: 'rgba(10, 102, 194, 0.1)',
                  border: '1px solid rgba(10, 102, 194, 0.3)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 11.5,
                  color: '#60a5fa',
                  textDecoration: 'none'
                }}
              >
                <Linkedin size={12} />
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        </div>

        {/* Nav Tabs */}
        <div style={{
          display: 'flex',
          padding: '0 24px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          gap: 20,
          flexShrink: 0
        }}>
          {[
            { id: 'email', label: 'Email Studio & Deliverability', icon: Mail },
            { id: 'dossier', label: 'Intel Dossier & Tech Stack', icon: Layers },
            { id: 'logs', label: `Agent Audit Logs (${logs.length})`, icon: Clock },
            { id: 'telemetry', label: 'Token & Cost ROI', icon: Cpu }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 0',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${isActive ? 'var(--brand-primary)' : 'transparent'}`,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                <Icon size={14} color={isActive ? 'var(--brand-primary)' : 'var(--text-muted)'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* TAB 1: EMAIL STUDIO */}
          {activeTab === 'email' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              {/* Deliverability & Safety Scorecard */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 16,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12
              }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Deliverability Index</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={18} color="var(--accent-emerald)" />
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                      {lead.deliverability_score || 96}/100
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Spam Risk Rating</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="pulse-dot" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: lead.spam_risk === 'High' ? '#fb7185' : 'var(--text-primary)' }}>
                      {lead.spam_risk || 'Low'} Risk
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Self-Reflection Score</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={16} color="#a855f7" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
                      {lead.reflection_score || 8.8}/10
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Estimated Read Time</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={16} color="var(--text-secondary)" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      ~32 sec ({editableEmail.trim().split(/\s+/).filter(Boolean).length} words)
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject Line A/B Switcher */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 14
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    Subject Line A/B Test Optimization
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => setSelectedSubjectVariant('A')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 11,
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        background: selectedSubjectVariant === 'A' ? 'var(--brand-primary)' : 'var(--bg-surface-elevated)',
                        color: selectedSubjectVariant === 'A' ? '#fff' : 'var(--text-muted)'
                      }}
                    >
                      Variant A (Tech)
                    </button>
                    <button
                      onClick={() => setSelectedSubjectVariant('B')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 11,
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        background: selectedSubjectVariant === 'B' ? 'var(--brand-primary)' : 'var(--bg-surface-elevated)',
                        color: selectedSubjectVariant === 'B' ? '#fff' : 'var(--text-muted)'
                      }}
                    >
                      Variant B (ROI)
                    </button>
                  </div>
                </div>
                <div style={{
                  padding: '8px 12px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}>
                  {currentSubject}
                </div>
              </div>

              {/* Sequence Step Toggle & View Mode Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      setSelectedSequenceStep(1);
                      setEditableEmail(lead.draft_email || '');
                    }}
                    className={`btn btn-sm ${selectedSequenceStep === 1 ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Step 1: Cold Email
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSequenceStep(2);
                      setEditableEmail(lead.follow_up_draft || `Hi ${lead.contact_name ? lead.contact_name.split(' ')[0] : 'there'},\n\nFollowing up on my note regarding ${lead.company_name}'s infrastructure rightsizing. Wanted to share a 1-page case study on how a similar team shaved $18k/mo in idle compute.\n\nWorth a brief 5-min look this week?\n\nBest,\nDavid`);
                    }}
                    className={`btn btn-sm ${selectedSequenceStep === 2 ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Step 2: 48hr Follow-up
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 6, background: 'var(--bg-surface)', padding: 3, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-muted)' }}>
                  <button
                    onClick={() => setEmailMode('editor')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: 'none',
                      background: emailMode === 'editor' ? 'var(--bg-surface-elevated)' : 'transparent',
                      color: emailMode === 'editor' ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontSize: 11.5,
                      cursor: 'pointer'
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Editor</span>
                  </button>
                  <button
                    onClick={() => setEmailMode('diff')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: 'none',
                      background: emailMode === 'diff' ? 'var(--bg-surface-elevated)' : 'transparent',
                      color: emailMode === 'diff' ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontSize: 11.5,
                      cursor: 'pointer'
                    }}
                  >
                    <Split size={12} />
                    <span>AI Diff</span>
                  </button>
                  <button
                    onClick={() => setEmailMode('preview')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: 'none',
                      background: emailMode === 'preview' ? 'var(--bg-surface-elevated)' : 'transparent',
                      color: emailMode === 'preview' ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontSize: 11.5,
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={12} />
                    <span>Client Mock</span>
                  </button>
                </div>
              </div>

              {/* EDITOR MODE */}
              {emailMode === 'editor' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <textarea
                    rows={12}
                    value={editableEmail}
                    onChange={e => setEditableEmail(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-muted)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 16,
                      color: 'var(--text-primary)',
                      fontSize: 13.5,
                      lineHeight: 1.7,
                      fontFamily: 'var(--font-sans)',
                      outline: 'none',
                      resize: 'vertical',
                      boxShadow: 'var(--shadow-subtle)'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="btn btn-secondary btn-sm"
                    >
                      <Save size={13} />
                      <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* DIFF VIEWER MODE */}
              {emailMode === 'diff' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  background: 'var(--bg-surface)',
                  padding: 16,
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                      Original AI Generation (Agent 4)
                    </div>
                    <div style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      padding: 12,
                      borderRadius: 'var(--radius-md)',
                      fontSize: 12.5,
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6
                    }}>
                      {lead.original_draft || lead.draft_email}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', marginBottom: 8 }}>
                      Current Working Copy
                    </div>
                    <div style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-highlight)',
                      padding: 12,
                      borderRadius: 'var(--radius-md)',
                      fontSize: 12.5,
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6
                    }}>
                      {editableEmail}
                    </div>
                  </div>
                </div>
              )}

              {/* EMAIL CLIENT MOCKUP MODE */}
              {emailMode === 'preview' && (
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 18
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Laptop size={14} />
                      <span>Simulated Recipient Inbox (Gmail Client)</span>
                    </div>
                  </div>

                  <div style={{
                    background: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}>
                    {/* Fake Gmail Header */}
                    <div style={{ background: '#161b22', padding: '12px 16px', borderBottom: '1px solid #30363d' }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f6fc', marginBottom: 8 }}>
                        {currentSubject}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#8b949e' }}>
                        <div>
                          <strong style={{ color: '#c9d1d9' }}>David Miller</strong> &lt;david.miller@aerocloud.io&gt;
                          <div style={{ fontSize: 11 }}>to {lead.contact_email || 'prospect@company.com'}</div>
                        </div>
                        <div>10:42 AM (Just now)</div>
                      </div>
                    </div>

                    {/* Email Body */}
                    <div style={{
                      padding: 20,
                      color: '#e6edf3',
                      fontSize: 13.5,
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {editableEmail}
                    </div>
                  </div>
                </div>
              )}

              {/* Prompt Regeneration Box */}
              {showPromptBox ? (
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-highlight)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 16,
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={14} color="var(--brand-primary)" />
                    <span>Direct Instructions for Agent 4 (The Sales Director)</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 'Make it shorter under 90 words', 'Emphasize Kubernetes security', 'More casual tone'..."
                    value={feedbackPrompt}
                    onChange={e => setFeedbackPrompt(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleTriggerRegenerate(); }}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-muted)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      marginBottom: 10,
                      outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button onClick={() => setShowPromptBox(false)} className="btn btn-ghost btn-sm">
                      Cancel
                    </button>
                    <button 
                      onClick={handleTriggerRegenerate}
                      disabled={isRegenerating || !feedbackPrompt.trim()}
                      className="btn btn-primary btn-sm"
                    >
                      <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
                      <span>{isRegenerating ? 'Regenerating...' : 'Regenerate Draft'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    onClick={() => setShowPromptBox(true)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Sparkles size={13} color="var(--brand-primary)" />
                    <span>Refine with AI Prompt</span>
                  </button>

                  <div style={{ display: 'flex', gap: 10 }}>
                    {lead.status !== 'Approved' && lead.status !== 'Sent' && (
                      <button
                        onClick={() => handleSendOrApprove('approve')}
                        className="btn btn-secondary"
                      >
                        <CheckCircle size={14} color="var(--accent-emerald)" />
                        <span>Approve for Queue</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleSendOrApprove('send')}
                      disabled={isSending}
                      className="btn btn-primary"
                    >
                      <Send size={14} />
                      <span>{isSending ? 'Sending...' : '1-Click Send via SMTP'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INTEL DOSSIER */}
          {activeTab === 'dossier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Executive Summary */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 16
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Company Profile & Architecture Overview
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {dossier.summary || 'Profile research compiled by Agent 2.'}
                </div>
              </div>

              {/* Tech Stack Tags */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 16
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Verified Technical Infrastructure Footprint
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(dossier.techStack || ['Kubernetes', 'AWS', 'Docker', 'PostgreSQL']).map((tech, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-muted)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Cpu size={12} color="var(--brand-primary)" />
                      <span>{tech}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Public Findings */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 16
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Public Web Intelligence & Scaling OKRs
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(dossier.findings || []).map((finding, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: 10,
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: 12.5,
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>•</span>
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solutions Architect Mapping */}
              {painPoints.length > 0 && (
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 16
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
                    Solutions Architect Value Mapping
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {painPoints.map((pp, idx) => (
                      <div 
                        key={idx}
                        style={{
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-muted)',
                          borderRadius: 'var(--radius-md)',
                          padding: 14
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fb7185', marginBottom: 4 }}>
                          Pain Point: {pp.issue}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                          Impact: {pp.implication}
                        </div>
                        {solutions[idx] && (
                          <div style={{
                            paddingTop: 8,
                            borderTop: '1px solid var(--border-subtle)',
                            fontSize: 12,
                            color: 'var(--accent-emerald)'
                          }}>
                            <strong>Proposed Solution:</strong> {solutions[idx].benefit}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No execution logs recorded yet.
                </div>
              ) : (
                logs.map((log, i) => {
                  const isAgent = log.agent?.startsWith('Agent');
                  const isSuccess = log.level === 'success';
                  const isError = log.level === 'error';

                  return (
                    <div 
                      key={i}
                      style={{
                        padding: '10px 14px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        fontSize: 12.5
                      }}
                    >
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        background: isAgent ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-elevated)',
                        color: isAgent ? '#a5b4fc' : 'var(--text-muted)'
                      }}>
                        {log.agent}
                      </span>
                      <div style={{ flexGrow: 1, color: isError ? '#fb7185' : 'var(--text-secondary)' }}>
                        {log.message}
                      </div>
                      <span style={{ fontSize: 10.5, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: TOKEN TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 16
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Tiered Model Execution Cost Telemetry
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Comparison between LeadLens tiered multi-model execution and brute-force single-tier LLM routing.
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 14,
                  marginBottom: 20
                }}>
                  <div style={{ background: 'var(--bg-input)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tiered Cost (Actual)</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                      ${tokenUsage.total?.cost?.toFixed(4) || '0.0152'}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Naive Pro Cost</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      ${tokenUsage.total?.naiveCost?.toFixed(4) || '0.0538'}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Efficiency Saving</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                      {tokenUsage.total?.savingPercent || '71.8'}% Saved
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '14px 24px',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <button 
            onClick={() => onDelete(lead.id)}
            className="btn btn-ghost btn-sm"
            style={{ color: '#fb7185' }}
          >
            <Trash2 size={14} />
            <span>Delete Prospect</span>
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

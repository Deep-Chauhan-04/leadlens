import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Send, CheckCircle, FileText, Database, Settings, ArrowRight, X, LayoutDashboard, Building, Sliders } from 'lucide-react';

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  leads = [], 
  onSelectLead, 
  onNavigate, 
  onOpenBatchModal, 
  onOpenNewLeadModal 
}) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredLeads = query.trim() ? leads.filter(l => 
    l.company_name?.toLowerCase().includes(query.toLowerCase()) ||
    l.contact_name?.toLowerCase().includes(query.toLowerCase()) ||
    l.website?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5) : leads.slice(0, 4);

  const quickActions = [
    { id: 'view-dashboard', label: 'Go to Executive Dashboard', icon: LayoutDashboard, action: () => { onClose(); onNavigate('dashboard'); } },
    { id: 'view-profile', label: 'Configure Company & ICP Profile', icon: Building, action: () => { onClose(); onNavigate('profile'); } },
    { id: 'view-controls', label: 'Adjust Pipeline & Agent Controls', icon: Sliders, action: () => { onClose(); onNavigate('controls'); } },
    { id: 'new-lead', label: 'Trigger Single Prospect Research', icon: Sparkles, action: () => { onClose(); onOpenNewLeadModal(); } },
    { id: 'batch-import', label: 'Batch Import Prospects (CSV / Domain List)', icon: Database, action: () => { onClose(); onOpenBatchModal(); } },
    { id: 'view-pipeline', label: 'Go to Pipeline Board', icon: FileText, action: () => { onClose(); onNavigate('pipeline'); } },
    { id: 'view-agents', label: 'Go to Agent Studio (DAG Graph)', icon: Sparkles, action: () => { onClose(); onNavigate('agents'); } },
    { id: 'view-analytics', label: 'Go to Executive ROI & Telemetry', icon: Settings, action: () => { onClose(); onNavigate('analytics'); } },
    { id: 'view-integrations', label: 'Diagnostics & SMTP Settings', icon: Send, action: () => { onClose(); onNavigate('integrations'); } },
  ].filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 120 }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ width: 620, padding: 0, border: '1px solid var(--border-highlight)', background: 'var(--bg-sidebar)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border-muted)', gap: 10 }}>
          <Search size={18} color="var(--brand-primary)" />
          <input 
            autoFocus
            type="text"
            placeholder="Type a command, search prospect or company..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flexGrow: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: 14,
              fontFamily: 'var(--font-sans)'
            }}
          />
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ maxHeight: 380, overflowY: 'auto', padding: 8 }}>
          {/* Quick Actions Section */}
          {quickActions.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', padding: '6px 10px', letterSpacing: '0.08em' }}>
                Navigation & Quick Actions
              </div>
              {quickActions.map(qa => {
                const Icon = qa.icon;
                return (
                  <div
                    key={qa.id}
                    onClick={qa.action}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--bg-surface-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <Icon size={15} color="var(--brand-primary)" />
                    <span style={{ flexGrow: 1 }}>{qa.label}</span>
                    <ArrowRight size={13} color="var(--text-dim)" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Prospects Section */}
          {filteredLeads.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', padding: '6px 10px', letterSpacing: '0.08em' }}>
                Prospects & Accounts
              </div>
              {filteredLeads.map(lead => (
                <div
                  key={lead.id}
                  onClick={() => {
                    onClose();
                    onSelectLead(lead);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    background: 'var(--bg-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--text-muted)'
                  }}>
                    {lead.company_name?.charAt(0) || 'P'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{lead.company_name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {lead.contact_name ? `${lead.contact_name} · ${lead.contact_title || 'Lead'}` : lead.website}
                    </span>
                  </div>
                  <span className={`status-pill ${lead.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          padding: '8px 16px',
          background: 'var(--bg-app)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: 'var(--text-dim)'
        }}>
          <span>Press <kbd className="kbd-shortcut">ESC</kbd> to exit</span>
          <span>Tip: Press <kbd className="kbd-shortcut">Ctrl+K</kbd> anywhere</span>
        </div>
      </div>
    </div>
  );
}

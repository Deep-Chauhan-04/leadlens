import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Layers, 
  Send, 
  CheckCircle, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Search, 
  FileText, 
  Activity, 
  ShieldCheck, 
  Sliders, 
  Database, 
  TrendingUp, 
  Download, 
  Settings, 
  ChevronRight, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Eye, 
  Kanban, 
  Table as TableIcon, 
  X,
  Target,
  Mail,
  Zap,
  Clock,
  LayoutDashboard,
  Building,
  Cpu
} from 'lucide-react';

import CommandPalette from './components/CommandPalette.jsx';
import AgentGraph from './components/AgentGraph.jsx';
import LeadDrawer from './components/LeadDrawer.jsx';
import BatchImportModal from './components/BatchImportModal.jsx';
import AnalyticsView from './components/AnalyticsView.jsx';
import CampaignsView from './components/CampaignsView.jsx';
import IntegrationsView from './components/IntegrationsView.jsx';
import DashboardView from './components/DashboardView.jsx';
import ProfileSetupView from './components/ProfileSetupView.jsx';
import PipelineControlsView from './components/PipelineControlsView.jsx';

export default function App() {
  // Navigation View State
  const [activeView, setActiveView] = useState('overview'); // 'overview' | 'accounts' | 'research' | 'campaigns' | 'sequences' | 'automation' | 'integrations' | 'settings'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'

  // Data States
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [clientProfile, setClientProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadLogs, setLeadLogs] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('All');
  const [campaignFilter, setCampaignFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Process Indicators
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch Leads
  const fetchLeads = async (selectId = null) => {
    try {
      const res = await fetch('/api/leads');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLeads(data);

      if (selectId) {
        const found = data.find(l => l.id === selectId);
        if (found) {
          setSelectedLead(found);
          fetchLeadLogs(selectId);
        }
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  };

  // Fetch Campaigns
  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  // Fetch Activity Logs for Lead
  const fetchLeadLogs = async (id) => {
    try {
      const res = await fetch(`/api/leads/${id}`);
      if (res.ok) {
        const data = await res.json();
        setLeadLogs(data.logs || []);
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead(data.lead);
        }
      }
    } catch (err) {
      console.error('Error fetching lead logs:', err);
    }
  };

  // Fetch Settings / Profile
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setClientProfile(data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  // Fetch Analytics
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  // Save updated profile
  const handleSaveProfile = async (updated) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    setClientProfile(updated);
    fetchSettings();
    fetchAnalytics();
  };

  // Navigate with optional filter/search preset
  const handleNavigate = (view, options = {}) => {
    setActiveView(view);
    if (options.status) {
      setStatusFilter(options.status);
    }
    if (options.search !== undefined) {
      setSearchQuery(options.search);
    }
  };

  // Quick Approve lead from dashboard
  const handleQuickApprove = async (leadId) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/approve`, { method: 'POST' });
      if (res.ok) {
        addToast('Lead approved for outreach sequence!', 'success');
        fetchLeads();
        fetchAnalytics();
      }
    } catch (err) {
      addToast(`Approval failed: ${err.message}`, 'error');
    }
  };

  // Quick Send lead from dashboard
  const handleQuickSend = async (leadId) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/send`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Outbound email dispatched successfully via SMTP!', 'success');
        fetchLeads();
        fetchAnalytics();
      } else {
        addToast(`Send failed: ${data.error || 'Check SMTP configuration'}`, 'error');
      }
    } catch (err) {
      addToast(`Send error: ${err.message}`, 'error');
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchCampaigns();
    fetchSettings();
    fetchAnalytics();
  }, []);

  // Poll active researching leads
  useEffect(() => {
    const hasResearching = leads.some(l => l.status === 'Researching');
    if (!hasResearching) return;

    const interval = setInterval(() => {
      fetchLeads(selectedLead?.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [leads, selectedLead]);

  // Keyboard shortcut listener (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Trigger Single Lead
  const handleCreateSingleLead = async (e) => {
    e.preventDefault();
    if (!newCompany || !newWebsite) return;

    setIsSubmittingNew(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: newCompany.trim(),
          website: newWebsite.trim(),
          campaignId: 1
        })
      });

      const data = await res.json();
      if (res.ok) {
        setNewCompany('');
        setNewWebsite('');
        setIsNewLeadModalOpen(false);
        addToast(`Launched 5-Agent research pipeline for ${newCompany}`, 'success');
        fetchLeads(data.id);
      } else {
        addToast(data.error || 'Failed to trigger pipeline', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Handle Batch Submit
  const handleBatchSubmit = async (entries, campaignId) => {
    try {
      const res = await fetch('/api/leads/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries, campaignId })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, 'success');
        fetchLeads();
      } else {
        addToast(data.error || 'Batch import failed', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Handle Update Draft
  const handleUpdateDraft = async (id, draftEmail, subjectVariant) => {
    try {
      const res = await fetch(`/api/leads/${id}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftEmail, subjectVariant })
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Draft updated and deliverability score recalculated.', 'success');
        fetchLeads(id);
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Handle AI Regenerate
  const handleRegenerate = async (id, feedback) => {
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/leads/${id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedLead(data);
        addToast('Draft regenerated with AI feedback applied.', 'success');
        fetchLeads(id);
      } else {
        addToast(data.error || 'Regeneration failed', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle Approve or Send
  const handleApprove = async (id, action, selectedSubject) => {
    setIsSending(true);
    try {
      const res = await fetch(`/api/leads/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, selectedSubject })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, 'success');
        fetchLeads(id);
      } else {
        addToast(data.error || 'Action failed', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Handle Delete Lead
  const handleDeleteLead = async (id) => {
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedLead?.id === id) setSelectedLead(null);
        addToast('Lead deleted.', 'info');
        fetchLeads();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action) => {
    if (selectedLeadIds.size === 0) return;
    try {
      const res = await fetch('/api/leads/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, leadIds: Array.from(selectedLeadIds) })
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message, 'success');
        setSelectedLeadIds(new Set());
        fetchLeads();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const toggleSelectLead = (id, e) => {
    e.stopPropagation();
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtered Leads list
  const filteredLeads = leads.filter(l => {
    if (statusFilter !== 'All' && l.status !== statusFilter) return false;
    if (campaignFilter !== 'All' && String(l.campaign_id) !== String(campaignFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCompany = l.company_name?.toLowerCase().includes(q);
      const matchContact = l.contact_name?.toLowerCase().includes(q);
      const matchWebsite = l.website?.toLowerCase().includes(q);
      if (!matchCompany && !matchContact && !matchWebsite) return false;
    }
    return true;
  });

  const statusCounts = {
    All: leads.length,
    'Needs Review': leads.filter(l => l.status === 'Needs Review').length,
    Approved: leads.filter(l => l.status === 'Approved').length,
    Sent: leads.filter(l => l.status === 'Sent').length,
    Researching: leads.filter(l => l.status === 'Researching').length,
  };

  return (
    <div className="enterprise-app">
      {/* 1. Sleek, Compact & Quiet Sidebar */}
      <aside className="app-sidebar">
        <div className="brand-header">
          <div className="brand-emblem">
            <span className="brand-title">LEADLENS</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div 
            onClick={() => setActiveView('overview')}
            className={`nav-link ${activeView === 'overview' || activeView === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={15} className="nav-icon" />
            <span>Overview</span>
          </div>

          <div 
            onClick={() => setActiveView('accounts')}
            className={`nav-link ${activeView === 'accounts' || activeView === 'pipeline' ? 'active' : ''}`}
          >
            <Building size={15} className="nav-icon" />
            <span>Accounts</span>
            {leads.length > 0 && <span className="nav-badge">{leads.length}</span>}
          </div>

          <div 
            onClick={() => setActiveView('research')}
            className={`nav-link ${activeView === 'research' || activeView === 'agents' ? 'active' : ''}`}
          >
            <Search size={15} className="nav-icon" />
            <span>Research</span>
            {leads.some(l => l.status === 'Researching') && (
              <span className="status-dot-quiet blue" style={{ marginLeft: 'auto' }} />
            )}
          </div>

          <div 
            onClick={() => setActiveView('campaigns')}
            className={`nav-link ${activeView === 'campaigns' ? 'active' : ''}`}
          >
            <Target size={15} className="nav-icon" />
            <span>Campaigns</span>
          </div>

          <div 
            onClick={() => setActiveView('sequences')}
            className={`nav-link ${activeView === 'sequences' ? 'active' : ''}`}
          >
            <Mail size={15} className="nav-icon" />
            <span>Sequences</span>
          </div>

          <hr className="sidebar-divider" />

          <div 
            onClick={() => setActiveView('automation')}
            className={`nav-link ${activeView === 'automation' || activeView === 'controls' ? 'active' : ''}`}
          >
            <Sliders size={15} className="nav-icon" />
            <span>Automation</span>
          </div>

          <div 
            onClick={() => setActiveView('integrations')}
            className={`nav-link ${activeView === 'integrations' ? 'active' : ''}`}
          >
            <Cpu size={15} className="nav-icon" />
            <span>Integrations</span>
          </div>

          <hr className="sidebar-divider" />

          <div 
            onClick={() => setActiveView('settings')}
            className={`nav-link ${activeView === 'settings' || activeView === 'profile' ? 'active' : ''}`}
          >
            <Settings size={15} className="nav-icon" />
            <span>Settings</span>
          </div>
        </nav>

        {/* Quiet Compact Footer */}
        <div className="sidebar-footer">
          <div 
            className="client-identity-card" 
            onClick={() => setActiveView('settings')}
            style={{ cursor: 'pointer' }}
            title="Workspace & Settings"
          >
            <div className="client-avatar">
              {clientProfile?.companyName ? clientProfile.companyName.substring(0, 2).toUpperCase() : 'LL'}
            </div>
            <div className="client-details">
              <div className="client-company">{clientProfile?.companyName || 'Enterprise Workspace'}</div>
              <div className="client-tier">
                <span className="status-dot-quiet online" />
                <span>Operational</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="app-main">
        {/* Compact Top Navigation Bar */}
        <header className="top-command-bar">
          <div className="command-bar-left">
            <div className="top-breadcrumb">
              <span>LeadLens</span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <strong>Enterprise</strong>
            </div>

            <div 
              className="global-search-trigger"
              onClick={() => setIsCommandPaletteOpen(true)}
            >
              <Search size={13} />
              <span>Search accounts, commands...</span>
              <kbd className="kbd-shortcut">Ctrl + K</kbd>
            </div>
          </div>

          <div className="command-bar-right">
            {/* Research status */}
            <div className="status-badge-quiet">
              <span className={`status-dot-quiet ${leads.some(l => l.status === 'Researching') ? 'blue' : 'online'}`} />
              <span>
                {leads.some(l => l.status === 'Researching') 
                  ? `Research in progress (${leads.filter(l => l.status === 'Researching').length})`
                  : 'System ready'}
              </span>
            </div>

            {/* Workspace indicator */}
            <div 
              className="status-badge-quiet"
              onClick={() => setActiveView('settings')}
              style={{ cursor: 'pointer' }}
              title="Workspace settings"
            >
              <span>{clientProfile?.companyName || 'Enterprise Workspace'}</span>
            </div>

            <button 
              onClick={() => setIsBatchModalOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              <Database size={12} />
              <span>Import CSV</span>
            </button>

            <button 
              onClick={() => setIsNewLeadModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={12} />
              <span>+ Research</span>
            </button>

            {/* User Menu / Avatar */}
            <div 
              onClick={() => setActiveView('settings')}
              style={{
                width: 26,
                height: 26,
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10.5,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
              title="User settings"
            >
              {clientProfile?.senderName ? clientProfile.senderName.substring(0, 2).toUpperCase() : 'LL'}
            </div>
          </div>
        </header>

        {/* Workspace Views */}
        <div className="workspace-container">
          
          {/* VIEW: OVERVIEW / DASHBOARD */}
          {(activeView === 'overview' || activeView === 'dashboard') && (
            <DashboardView 
              leads={leads}
              analytics={analytics}
              clientProfile={clientProfile}
              onNavigate={handleNavigate}
              onSelectLead={lead => {
                setSelectedLead(lead);
                fetchLeadLogs(lead.id);
              }}
              onQuickApprove={handleQuickApprove}
              onQuickSend={handleQuickSend}
              onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
              onOpenBatchModal={() => setIsBatchModalOpen(true)}
            />
          )}

          {/* VIEW: SETTINGS */}
          {(activeView === 'settings' || activeView === 'profile') && (
            <ProfileSetupView 
              clientProfile={clientProfile}
              onSaveProfile={handleSaveProfile}
              addToast={addToast}
            />
          )}

          {/* VIEW: AUTOMATION */}
          {(activeView === 'automation' || activeView === 'controls') && (
            <PipelineControlsView 
              clientProfile={clientProfile}
              onSaveProfile={handleSaveProfile}
              addToast={addToast}
            />
          )}

          {/* VIEW: ACCOUNTS */}
          {(activeView === 'accounts' || activeView === 'pipeline') && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Page Title & View Switch */}
              <div className="page-header">
                <div className="page-title-group">
                  <h1 className="page-title">
                    <span>Autonomous Outreach Pipeline</span>
                  </h1>
                  <p className="page-subtitle">
                    Autonomous prospect enrichment, value proposition synthesis, and human-in-the-loop email review.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {selectedLeadIds.size > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-surface)', padding: '3px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-muted)' }}>
                      <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                        {selectedLeadIds.size} selected
                      </span>
                      <button onClick={() => handleBulkAction('approve')} className="btn btn-secondary btn-sm">
                        Approve
                      </button>
                      <button onClick={() => handleBulkAction('delete')} className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    </div>
                  )}

                  <div className="view-switch">
                    <button 
                      onClick={() => setViewMode('kanban')}
                      className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                      title="Kanban Board View"
                    >
                      <Kanban size={15} />
                    </button>
                    <button 
                      onClick={() => setViewMode('table')}
                      className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                      title="Data Table View"
                    >
                      <TableIcon size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Controls Bar */}
              <div className="controls-bar">
                <div className="filter-pills">
                  {['All', 'Needs Review', 'Approved', 'Sent', 'Researching'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
                    >
                      <span>{status}</span>
                      <span className="filter-count">{statusCounts[status] || 0}</span>
                    </button>
                  ))}
                </div>

                <div className="search-input-box">
                  <Search size={14} color="var(--text-muted)" />
                  <input 
                    type="text" 
                    placeholder="Filter accounts or contacts..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* KANBAN BOARD VIEW */}
              {viewMode === 'kanban' && (
                <div className="kanban-board">
                  {['Researching', 'Needs Review', 'Approved', 'Sent'].map(columnStatus => {
                    const colLeads = filteredLeads.filter(l => l.status === columnStatus);
                    return (
                      <div key={columnStatus} className="kanban-col">
                        <div className="kanban-col-header">
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className={`status-pill ${columnStatus.toLowerCase().replace(/\s+/g, '-')}`} style={{ padding: '2px 7px' }}>
                              {columnStatus}
                            </span>
                          </span>
                          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            {colLeads.length}
                          </span>
                        </div>

                        <div className="kanban-cards">
                          {colLeads.length === 0 ? (
                            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: 12 }}>
                              No prospects in this stage.
                            </div>
                          ) : (
                            colLeads.map(lead => (
                              <div
                                key={lead.id}
                                onClick={() => {
                                  setSelectedLead(lead);
                                  fetchLeadLogs(lead.id);
                                }}
                                className={`kanban-card ${selectedLead?.id === lead.id ? 'selected' : ''}`}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {lead.company_name}
                                  </span>
                                  {lead.icp_score && (
                                    <span className="score-pill high" style={{ fontSize: 10 }}>
                                      {lead.icp_score}% ICP
                                    </span>
                                  )}
                                </div>

                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                  {lead.contact_name ? (
                                    <span>{lead.contact_name} · <span style={{ color: 'var(--text-muted)' }}>{lead.contact_title}</span></span>
                                  ) : (
                                    <span style={{ color: 'var(--brand-primary)', fontStyle: 'italic' }}>Agent 1 discovering leadership...</span>
                                  )}
                                </div>

                                {lead.draft_email && (
                                  <div style={{
                                    fontSize: 11.5,
                                    color: 'var(--text-muted)',
                                    lineHeight: 1.4,
                                    maxHeight: 32,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    marginBottom: 10
                                  }}>
                                    {lead.subject_variant_a || lead.draft_email.slice(0, 70)}...
                                  </div>
                                )}

                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  paddingTop: 8,
                                  borderTop: '1px solid var(--border-subtle)',
                                  fontSize: 11,
                                  color: 'var(--text-muted)'
                                }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <ShieldCheck size={12} color="var(--accent-emerald)" />
                                    <span>{lead.deliverability_score || 96}/100</span>
                                  </span>
                                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                                    ${lead.token_usage?.total?.cost?.toFixed(4) || '0.015'}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* DATA TABLE VIEW */}
              {viewMode === 'table' && (
                <div className="table-wrapper">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th style={{ width: 36 }}>
                          <input 
                            type="checkbox" 
                            checked={selectedLeadIds.size > 0 && selectedLeadIds.size === filteredLeads.length}
                            onChange={() => {
                              if (selectedLeadIds.size === filteredLeads.length) setSelectedLeadIds(new Set());
                              else setSelectedLeadIds(new Set(filteredLeads.map(l => l.id)));
                            }}
                          />
                        </th>
                        <th>Account / Domain</th>
                        <th>Executive Contact</th>
                        <th>Status</th>
                        <th>ICP Fit</th>
                        <th>Deliverability</th>
                        <th>Reflection</th>
                        <th>Tiered Cost</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map(lead => (
                        <tr 
                          key={lead.id}
                          onClick={() => {
                            setSelectedLead(lead);
                            fetchLeadLogs(lead.id);
                          }}
                          className={selectedLead?.id === lead.id ? 'selected' : ''}
                        >
                          <td onClick={e => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              checked={selectedLeadIds.has(lead.id)}
                              onChange={e => toggleSelectLead(lead.id, e)}
                            />
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.company_name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.website}</div>
                          </td>
                          <td>
                            <div style={{ color: 'var(--text-primary)' }}>{lead.contact_name || 'Pending'}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.contact_title}</div>
                          </td>
                          <td>
                            <span className={`status-pill ${lead.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td>
                            <span className="score-pill high">{lead.icp_score || 92}%</span>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                              {lead.deliverability_score || 96}/100
                            </span>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', color: '#c084fc', fontWeight: 600 }}>
                              {lead.reflection_score || 8.8}/10
                            </span>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                            ${lead.token_usage?.total?.cost?.toFixed(4) || '0.0152'}
                          </td>
                          <td onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button 
                                onClick={() => {
                                  setSelectedLead(lead);
                                  fetchLeadLogs(lead.id);
                                }}
                                className="btn btn-secondary btn-sm"
                                title="Inspect Lead Dossier"
                              >
                                <Eye size={12} />
                              </button>
                              {lead.status !== 'Approved' && lead.status !== 'Sent' && (
                                <button 
                                  onClick={() => handleApprove(lead.id, 'approve', lead.subject_variant_a)}
                                  className="btn btn-secondary btn-sm"
                                  title="Approve for Queue"
                                >
                                  <Check size={12} color="var(--accent-emerald)" />
                                </button>
                              )}
                              <button 
                                onClick={() => handleApprove(lead.id, 'send', lead.subject_variant_a)}
                                className="btn btn-primary btn-sm"
                                title="1-Click Dispatch via SMTP"
                              >
                                <Send size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIEW: RESEARCH PIPELINE & EVIDENCE GRAPH */}
          {(activeView === 'research' || activeView === 'agents') && (
            <AgentGraph activeLead={selectedLead} isExecuting={leads.some(l => l.status === 'Researching')} />
          )}

          {/* VIEW: SEQUENCES & OUTREACH ANALYTICS */}
          {(activeView === 'sequences' || activeView === 'analytics') && (
            <AnalyticsView />
          )}

          {/* VIEW: CAMPAIGNS */}
          {activeView === 'campaigns' && (
            <CampaignsView campaigns={campaigns} onReloadCampaigns={fetchCampaigns} />
          )}

          {/* VIEW: INTEGRATIONS */}
          {activeView === 'integrations' && (
            <IntegrationsView />
          )}

        </div>
      </main>

      {/* Slide-over Lead Command Center */}
      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          clientProfile={clientProfile}
          logs={leadLogs}
          onClose={() => setSelectedLead(null)}
          onUpdateDraft={handleUpdateDraft}
          onRegenerate={handleRegenerate}
          onApprove={handleApprove}
          onDelete={handleDeleteLead}
          isRegenerating={isRegenerating}
          isSending={isSending}
        />
      )}

      {/* Batch Import Modal */}
      <BatchImportModal 
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onBatchSubmit={handleBatchSubmit}
        campaigns={campaigns}
      />

      {/* New Single Account Research Modal */}
      {isNewLeadModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsNewLeadModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Research Single Target Account
              </div>
              <button onClick={() => setIsNewLeadModalOpen(false)} className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSingleLead} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Target Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stripe, Figma, Datadog..."
                  value={newCompany}
                  onChange={e => setNewCompany(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-muted)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 12px',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Website URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. stripe.com or https://stripe.com"
                  value={newWebsite}
                  onChange={e => setNewWebsite(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-muted)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 12px',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setIsNewLeadModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingNew} className="btn btn-primary">
                  <Sparkles size={14} />
                  <span>{isSubmittingNew ? 'Initializing Pipeline...' : 'Launch 5-Agent Pipeline'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        leads={leads}
        onSelectLead={(lead) => {
          setSelectedLead(lead);
          fetchLeadLogs(lead.id);
        }}
        onNavigate={(view) => setActiveView(view)}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenNewLeadModal={() => setIsNewLeadModalOpen(true)}
      />

      {/* Toast Notification Stack */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            {t.type === 'success' && <CheckCircle size={16} color="var(--accent-emerald)" />}
            {t.type === 'error' && <AlertCircle size={16} color="#fb7185" />}
            {t.type === 'info' && <Sparkles size={16} color="var(--brand-primary)" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

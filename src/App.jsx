import React, { useState, useEffect } from 'react';
import { Search, Activity, Bell } from 'lucide-react';

// New specialized views
import DashboardView from './components/DashboardView.jsx';
import CompanyDiscoveryView from './components/CompanyDiscoveryView.jsx';

// Original functional views
import ProfileSetupView from './components/ProfileSetupView.jsx';
import AnalyticsView from './components/AnalyticsView.jsx';
import CampaignsView from './components/CampaignsView.jsx';
import IntegrationsView from './components/IntegrationsView.jsx';
import PipelineControlsView from './components/PipelineControlsView.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import BatchImportModal from './components/BatchImportModal.jsx';
import LeadDrawer from './components/LeadDrawer.jsx';

export default function App() {
  const [activeView, setActiveView] = useState('overview');
  const [leads, setLeads] = useState([]);
  const [clientProfile, setClientProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  
  // Modal & Drawer States
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  // Fetch logic
  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.warn('Failed to fetch leads', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setClientProfile(data);
      }
    } catch (err) {
      console.warn('Failed to fetch settings', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.warn('Failed to fetch analytics', err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchSettings();
    fetchAnalytics();
  }, []);

  const handleQuickApprove = (id) => {
    setLeads(leads.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
  };
  
  const handleQuickSend = (id) => {
    console.log("Send campaign to", id);
  };

  return (
    <div className="enterprise-app">
      
      {/* Minimal Top Navigation replacing the old sidebar */}
      <header className="top-nav">
        <div className="nav-brand">
          <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--brand-cyan)' }}></div>
          LEADLENS
        </div>

        <nav className="nav-links">
          {['Overview', 'Companies', 'Accounts', 'Analytics', 'Campaigns', 'Integrations'].map(view => {
            const key = view.toLowerCase();
            return (
              <div 
                key={key}
                className={`nav-link ${activeView === key ? 'active' : ''}`}
                onClick={() => setActiveView(key)}
              >
                {view}
              </div>
            );
          })}
        </nav>

        <div className="nav-actions">
          <div className="nav-icon-btn" title="Command Search (Ctrl+K)" onClick={() => setIsCommandPaletteOpen(true)}>
            <Search size={16} />
          </div>
          <div className="nav-icon-btn" title="Live Activity">
            <Activity size={16} />
          </div>
          <div className="nav-icon-btn" title="Notifications">
            <Bell size={16} />
          </div>
          <div 
            className="nav-avatar" 
            title="Settings & Workspace"
            onClick={() => setActiveView('settings')}
          >
            {clientProfile?.companyName ? clientProfile.companyName.substring(0, 1).toUpperCase() : 'W'}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-main">
        {activeView === 'overview' && (
          <DashboardView 
            leads={leads} 
            analytics={analytics}
            clientProfile={clientProfile}
            onSelectLead={setSelectedLead}
            onQuickApprove={handleQuickApprove}
            onQuickSend={handleQuickSend}
            onOpenBatchModal={() => setIsBatchModalOpen(true)}
            onOpenNewLeadModal={() => setActiveView('companies')}
          />
        )}

        {/* Company Discovery & Intelligence with CSV Export */}
        {activeView === 'companies' && (
          <CompanyDiscoveryView 
            clientProfile={clientProfile}
            onAddLeadsToPipeline={() => {
              fetchLeads();
              fetchAnalytics();
            }}
            onNavigateToAccounts={() => setActiveView('accounts')}
          />
        )}
        
        {/* Restore Original Tabs fully functional */}
        {activeView === 'accounts' && (
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <PipelineControlsView 
               leads={leads}
               onSelectLead={setSelectedLead}
            />
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="workspace-container">
            <AnalyticsView leads={leads} analytics={analytics} />
          </div>
        )}
        
        {activeView === 'campaigns' && (
          <div className="workspace-container">
            <CampaignsView leads={leads} />
          </div>
        )}

        {activeView === 'integrations' && (
          <div className="workspace-container">
            <IntegrationsView />
          </div>
        )}

        {activeView === 'settings' && (
          <div className="workspace-container">
            <ProfileSetupView clientProfile={clientProfile} />
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      {isCommandPaletteOpen && (
        <CommandPalette 
          isOpen={isCommandPaletteOpen}
          leads={leads}
          onClose={() => setIsCommandPaletteOpen(false)} 
          onNavigate={setActiveView}
          onSelectLead={setSelectedLead}
          onOpenBatchModal={() => { setIsCommandPaletteOpen(false); setIsBatchModalOpen(true); }}
          onOpenNewLeadModal={() => { setIsCommandPaletteOpen(false); setActiveView('companies'); }}
        />
      )}
      
      {isBatchModalOpen && (
        <BatchImportModal 
           isOpen={isBatchModalOpen}
           onClose={() => setIsBatchModalOpen(false)} 
           onBatchSubmit={async (entries, campaignId) => {
             try {
               const res = await fetch('/api/leads/batch', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ leads: entries, campaignId: campaignId || 1 })
               });
               if (res.ok) {
                 await fetchLeads();
                 await fetchAnalytics();
               }
             } catch (err) {
               console.error('Batch import failed:', err);
             }
             setIsBatchModalOpen(false);
           }} 
        />
      )}

      {selectedLead && (
        <LeadDrawer 
           lead={selectedLead} 
           onClose={() => setSelectedLead(null)} 
           onApprove={() => handleQuickApprove(selectedLead.id)}
        />
      )}
      
    </div>
  );
}

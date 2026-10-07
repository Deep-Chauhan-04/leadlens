import React, { useState, useMemo } from 'react';
import IntelligentLensWidget from './IntelligentLens';
import { Search, Plus, Check, ChevronRight, Database, Clock } from 'lucide-react';

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
  const [activeStage, setActiveStage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Re-implement functional pipeline logic
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      // Pipeline stage filter
      if (activeStage !== 'All') {
        if (activeStage === 'Qualified' && !(l.icp_score >= 80)) return false;
        if (activeStage !== 'Qualified' && l.status !== activeStage) return false;
      }
      
      // Text search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (l.company_name || '').toLowerCase().includes(q) || 
               (l.website || '').toLowerCase().includes(q) ||
               (l.industry || '').toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => {
      // Sort researching and needs review to top, then by score
      if (a.status === 'Researching' && b.status !== 'Researching') return -1;
      if (b.status === 'Researching' && a.status !== 'Researching') return 1;
      return (b.icp_score || 0) - (a.icp_score || 0);
    });
  }, [leads, activeStage, searchQuery]);

  const activeCount = leads.length;
  const highIntentCount = leads.filter(l => l.icp_score >= 80).length;

  return (
    <div className="immersive-overview">
      <IntelligentLensWidget leads={leads} />

      <div className="overview-ui-layer">
        
        {/* Top Centered Hero */}
        <div className="hero-centered-content">
          <div className="hero-suptitle">YOUR PIPELINE</div>
          <div className="hero-maintitle">{activeCount.toLocaleString()} active prospects</div>
        </div>

        {/* Vertical space for the Lens */}
        <div style={{ flexGrow: 1, minHeight: '360px' }}></div>

        {/* Bottom Centered Subtitle */}
        <div className="hero-centered-content bottom-aligned">
          <div className="hero-subtitle">SCANNING PIPELINE</div>
          <div className="hero-callout">{highIntentCount} opportunities in focus</div>
        </div>

        {/* Functional Feature Bar: Search, Filters, and Actions */}
        <div className="intelligence-action-bar">
          <div className="stage-filters">
            {['All', 'Needs Review', 'Qualified', 'Researching', 'Approved'].map(stage => (
              <button 
                key={stage} 
                className={`stage-filter-btn ${activeStage === stage ? 'active' : ''}`}
                onClick={() => setActiveStage(stage)}
              >
                {stage}
              </button>
            ))}
          </div>

          <div className="action-bar-right">
            <div className="search-input-minimal">
              <Search size={14} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search pipeline..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <button className="btn btn-secondary" onClick={onOpenBatchModal}>
              <Database size={14} />
              <span>Import</span>
            </button>
            <button className="btn btn-primary" onClick={onOpenNewLeadModal}>
              <Plus size={14} />
              <span>New prospect</span>
            </button>
          </div>
        </div>

        {/* Functional Data List */}
        <div className="in-focus-centered-section" style={{ maxWidth: '860px' }}>
           <h2 className="section-title-centered" style={{ textAlign: 'left', marginBottom: 12 }}>
             {activeStage === 'All' ? 'ALL ACCOUNTS' : activeStage.toUpperCase()}
           </h2>
           
           <div className="intelligence-rows-minimal">
              {filteredLeads.length === 0 ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-dim)' }}>
                  No accounts match this filter.
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const isResearching = lead.status === 'Researching';
                  const isNeedsReview = lead.status === 'Needs Review';
                  
                  return (
                   <div 
                     key={lead.id} 
                     className="intelligence-row-minimal interactive"
                     onClick={() => onSelectLead(lead)}
                   >
                      <div className="row-col-min" style={{ flex: '0 0 250px' }}>
                         <h4>{lead.company_name}</h4>
                         <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                           {lead.industry || 'Unknown industry'}
                         </div>
                      </div>
                      
                      <div className="row-col-min">
                         <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, letterSpacing: '0.05em' }}>INTENT</div>
                         {isResearching ? (
                           <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Analyzing...</span>
                         ) : (
                           <span className="value cyan">{Math.round(lead.icp_score || 0)}</span>
                         )}
                      </div>

                      <div className="row-col-min" style={{ flex: '0 0 220px' }}>
                         <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4, letterSpacing: '0.05em' }}>SIGNAL / STATUS</div>
                         <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                           {isResearching ? (
                             <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                               <Clock size={12} /> Live inspection
                             </span>
                           ) : isNeedsReview ? (
                             <span style={{ color: 'var(--text-primary)' }}>Executive verified</span>
                           ) : lead.status}
                         </div>
                      </div>
                      
                      <div className="row-col-min right-align" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
                         {isNeedsReview && (
                           <button 
                             className="btn btn-ghost" 
                             onClick={(e) => { e.stopPropagation(); onQuickApprove(lead.id); }}
                             style={{ padding: '6px 12px', color: 'var(--brand-cyan)' }}
                           >
                             <Check size={14} /> Approve
                           </button>
                         )}
                         <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChevronRight size={16} color="var(--text-muted)" />
                         </div>
                      </div>
                   </div>
                )
              })
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

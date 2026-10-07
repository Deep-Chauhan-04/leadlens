import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Download, Plus, Check, ExternalLink, Sparkles, Filter, 
  Layers, ArrowUpDown, ChevronRight, X, Building2, Globe, Users, 
  MapPin, DollarSign, Cpu, Zap, CheckSquare, Square, RefreshCw, AlertCircle
} from 'lucide-react';

export default function CompanyDiscoveryView({ 
  clientProfile = null, 
  onAddLeadsToPipeline,
  onNavigateToAccounts 
}) {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedFunding, setSelectedFunding] = useState('All');
  const [minScore, setMinScore] = useState(0);
  const [activePreset, setActivePreset] = useState('all');

  // Selection & Drawer
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [inspectedCompany, setInspectedCompany] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isAddingToPipeline, setIsAddingToPipeline] = useState(false);

  // Fetch verified companies from server
  const fetchCompanies = async (query = '', industry = 'All', size = 'All', funding = 'All', score = 0) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (industry !== 'All') params.append('industry', industry);
      if (size !== 'All') params.append('size', size);
      if (funding !== 'All') params.append('funding', funding);
      if (score > 0) params.append('minScore', score);

      const res = await fetch(`/api/companies/discover?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
      }
    } catch (err) {
      console.warn('Failed to fetch companies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(searchQuery, selectedIndustry, selectedSize, selectedFunding, minScore);
  }, [selectedIndustry, selectedSize, selectedFunding, minScore]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    fetchCompanies(searchQuery, selectedIndustry, selectedSize, selectedFunding, minScore);
  };

  // AI Market Scanner via Gemini
  const handleAiScan = async () => {
    if (!searchQuery.trim()) {
      showToast('Enter a query or ICP target (e.g. "Series A AI developer tools") to scan with Gemini.');
      return;
    }
    setIsAiScanning(true);
    showToast('Scanning live market with Gemini Intelligence...');
    try {
      const res = await fetch('/api/companies/ai-discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: searchQuery })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.companies && data.companies.length > 0) {
          setCompanies(data.companies);
          showToast(`Gemini discovered ${data.companies.length} high-fit accounts.`);
        } else {
          showToast('No new companies found for that query, showing matched database accounts.');
        }
      }
    } catch (err) {
      console.error('AI scan error:', err);
      showToast('AI scanner error, reverted to verified accounts.');
    } finally {
      setIsAiScanning(false);
    }
  };

  // Match Active Workspace ICP preset
  const handleMatchActiveIcp = () => {
    setActivePreset('active_icp');
    if (clientProfile?.industry) {
      setSelectedIndustry(clientProfile.industry);
    }
    if (clientProfile?.targetHeadcounts && clientProfile.targetHeadcounts.length > 0) {
      setSelectedSize(clientProfile.targetHeadcounts[0]);
    }
    setMinScore(88);
    const queryTerm = clientProfile?.targetPersona || clientProfile?.offering || '';
    setSearchQuery(queryTerm);
    fetchCompanies(queryTerm, clientProfile?.industry || 'All', clientProfile?.targetHeadcounts?.[0] || 'All', 'All', 88);
    showToast('Applied active ICP profile filters.');
  };

  // Preset quick filters
  const applyPreset = (presetKey) => {
    setActivePreset(presetKey);
    setSearchQuery('');
    switch (presetKey) {
      case 'all':
        setSelectedIndustry('All');
        setSelectedSize('All');
        setSelectedFunding('All');
        setMinScore(0);
        fetchCompanies('', 'All', 'All', 'All', 0);
        break;
      case 'high_match':
        setMinScore(94);
        fetchCompanies('', selectedIndustry, selectedSize, selectedFunding, 94);
        break;
      case 'ai_llm':
        setSelectedIndustry('AI & Machine Learning');
        setMinScore(0);
        fetchCompanies('', 'AI & Machine Learning', selectedSize, selectedFunding, 0);
        break;
      case 'devtools':
        setSelectedIndustry('DevTools & Infrastructure');
        setMinScore(0);
        fetchCompanies('', 'DevTools & Infrastructure', selectedSize, selectedFunding, 0);
        break;
      case 'fintech':
        setSelectedIndustry('Fintech');
        setMinScore(0);
        fetchCompanies('', 'Fintech', selectedSize, selectedFunding, 0);
        break;
      case 'security':
        setSelectedIndustry('Cybersecurity');
        setMinScore(0);
        fetchCompanies('', 'Cybersecurity', selectedSize, selectedFunding, 0);
        break;
      default:
        break;
    }
  };

  // Selection handlers
  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === companies.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(companies.map(c => c.id)));
    }
  };

  // CSV Generator & Exporter
  const exportCompaniesToCsv = (companiesToExport, customFilename = 'leadlens_companies.csv') => {
    if (!companiesToExport || companiesToExport.length === 0) {
      showToast('No companies available to export.');
      return;
    }

    const headers = [
      'Company Name',
      'Domain',
      'Industry',
      'Headcount',
      'Location',
      'Funding Stage',
      'Total Funding',
      'Estimated Revenue',
      'Key Growth Signal',
      'Tech Stack',
      'ICP Match Score',
      'Description',
      'Target Titles',
      'Strategic Pain Points'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const csvRows = [headers.join(',')];

    companiesToExport.forEach(c => {
      const techStr = Array.isArray(c.techStack) ? c.techStack.join('; ') : (c.techStack || '');
      const titlesStr = Array.isArray(c.targetTitles) ? c.targetTitles.join('; ') : (c.targetTitles || '');
      const painStr = Array.isArray(c.painPoints) ? c.painPoints.join('; ') : (c.painPoints || '');

      csvRows.push([
        escapeCsv(c.name),
        escapeCsv(c.domain),
        escapeCsv(c.industry),
        escapeCsv(c.headcount),
        escapeCsv(c.location),
        escapeCsv(c.fundingStage),
        escapeCsv(c.totalFunding),
        escapeCsv(c.revenueEst),
        escapeCsv(c.growthSignal),
        escapeCsv(techStr),
        c.icpFitScore || 90,
        escapeCsv(c.description),
        escapeCsv(titlesStr),
        escapeCsv(painStr)
      ].join(','));
    });

    const csvBlob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', customFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    showToast(`Saved ${companiesToExport.length} companies to ${customFilename}`);
  };

  const handleExportSelected = () => {
    const selectedList = companies.filter(c => selectedIds.has(c.id));
    const timestamp = new Date().toISOString().split('T')[0];
    exportCompaniesToCsv(selectedList, `leadlens_selected_companies_${timestamp}.csv`);
  };

  const handleExportAll = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportCompaniesToCsv(companies, `leadlens_companies_${timestamp}.csv`);
  };

  // Add selected or single company to lead pipeline
  const handleAddToPipeline = async (companiesToAdd, autoStart = true) => {
    if (!companiesToAdd || companiesToAdd.length === 0) return;
    setIsAddingToPipeline(true);
    try {
      const res = await fetch('/api/companies/add-to-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companies: companiesToAdd,
          campaignId: 1,
          autoStart
        })
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`Queued ${data.count} accounts into Lead Pipeline.`);
        setSelectedIds(new Set());
        onAddLeadsToPipeline?.();
      } else {
        showToast('Failed to import to pipeline.');
      }
    } catch (err) {
      console.error('Error importing to pipeline:', err);
      showToast('Error importing to pipeline.');
    } finally {
      setIsAddingToPipeline(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Dynamic Metrics
  const avgScore = useMemo(() => {
    if (companies.length === 0) return 0;
    const sum = companies.reduce((acc, c) => acc + (c.icpFitScore || 90), 0);
    return Math.round(sum / companies.length);
  }, [companies]);

  const uniqueSectors = useMemo(() => {
    const set = new Set(companies.map(c => c.industry));
    return set.size;
  }, [companies]);

  return (
    <div className="workspace-container" style={{ position: 'relative', paddingBottom: 80 }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 30,
          right: 40,
          background: 'rgba(16, 18, 22, 0.95)',
          border: '1px solid var(--border-focus)',
          padding: '12px 20px',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          zIndex: 200,
          animation: 'fadeIn 0.2s ease'
        }}>
          <Sparkles size={16} color="var(--brand-cyan)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div>
          <div style={{ 
            fontSize: 11, 
            textTransform: 'uppercase', 
            letterSpacing: '0.12em', 
            color: 'var(--brand-cyan)', 
            marginBottom: 6,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Building2 size={13} />
            Market Intelligence Engine
          </div>
          <h1 className="page-title" style={{ fontSize: 26, fontWeight: 500, margin: 0 }}>
            Company Discovery & Target Scouting
          </h1>
          <p className="page-subtitle" style={{ marginTop: 4 }}>
            Identify high-probability B2B target accounts matching your ICP, inspect firmographics, and save to CSV.
          </p>
        </div>

        {/* Global Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleExportAll}
            title="Download entire current list of companies as CSV"
            style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38 }}
          >
            <Download size={14} color="var(--brand-cyan)" />
            <span>Export All ({companies.length}) to CSV</span>
          </button>

          {selectedIds.size > 0 && (
            <button 
              className="btn btn-primary" 
              onClick={handleExportSelected}
              style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38 }}
            >
              <Download size={14} />
              <span>Export Selected ({selectedIds.size}) CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Intelligence Metrics Ribbon */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 24
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px 20px',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Verified Accounts
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {companies.length}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Pre-indexed and real-time scanned
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px 20px',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Average ICP Match
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--brand-cyan)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {avgScore}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Based on active targeting rules
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px 20px',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Target Verticals
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {uniqueSectors}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Covering modern technology sectors
          </div>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px 20px',
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Selected for Action
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, color: selectedIds.size > 0 ? 'var(--brand-cyan)' : 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {selectedIds.size}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Ready to export or queue to pipeline
          </div>
        </div>
      </div>

      {/* Search & AI Scanner Bar */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-muted)',
        borderRadius: 'var(--radius-sm)',
        padding: '18px 20px',
        marginBottom: 20
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 16px'
          }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text"
              placeholder="Search companies by name, domain, tech stack (e.g. OpenAI, AWS), or natural language prompt..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: 13,
                fontFamily: 'var(--font-sans)'
              }}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => { setSearchQuery(''); fetchCompanies('', selectedIndustry, selectedSize, selectedFunding, minScore); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-secondary"
            style={{ height: 42, padding: '0 20px', fontSize: 13 }}
          >
            Search
          </button>

          <button 
            type="button" 
            onClick={handleAiScan}
            disabled={isAiScanning}
            className="btn"
            style={{ 
              height: 42, 
              padding: '0 20px', 
              fontSize: 13,
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
              border: '1px solid rgba(0, 229, 255, 0.4)',
              color: 'var(--brand-cyan)'
            }}
            title="Use Gemini AI to scan the market for newly discovered accounts matching your prompt"
          >
            <Sparkles size={15} color="var(--brand-cyan)" className={isAiScanning ? 'spin-icon' : ''} />
            <span>{isAiScanning ? 'Scanning...' : 'Scan with AI'}</span>
          </button>
        </form>

        {/* Quick Presets Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 4 }}>
            Presets:
          </span>
          {[
            { id: 'all', label: 'All Accounts' },
            { id: 'high_match', label: '🔥 High Match (>94%)' },
            { id: 'ai_llm', label: '🤖 AI & Machine Learning' },
            { id: 'devtools', label: '⚡ Cloud & DevTools' },
            { id: 'fintech', label: '💳 FinTech' },
            { id: 'security', label: '🛡️ Cybersecurity' },
            { id: 'active_icp', label: '🎯 Match Workspace ICP', special: true }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => p.id === 'active_icp' ? handleMatchActiveIcp() : applyPreset(p.id)}
              style={{
                background: activePreset === p.id ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: activePreset === p.id ? '1px solid var(--brand-cyan)' : '1px solid var(--border-subtle)',
                color: activePreset === p.id ? 'var(--brand-cyan)' : 'var(--text-secondary)',
                fontSize: 11.5,
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Granular Filter Dropdowns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 12,
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
              Industry
            </label>
            <select
              value={selectedIndustry}
              onChange={e => setSelectedIndustry(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: 12,
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                outline: 'none'
              }}
            >
              <option value="All">All Industries</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="DevTools & Infrastructure">DevTools & Infrastructure</option>
              <option value="B2B SaaS">B2B SaaS</option>
              <option value="Fintech">Fintech</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="HealthTech & Biotech">HealthTech & Biotech</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
              Company Size
            </label>
            <select
              value={selectedSize}
              onChange={e => setSelectedSize(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: 12,
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                outline: 'none'
              }}
            >
              <option value="All">All Headcounts</option>
              <option value="11-50">11-50 Employees</option>
              <option value="51-200">51-200 Employees</option>
              <option value="201-500">201-500 Employees</option>
              <option value="501-1000">501-1000 Employees</option>
              <option value="1000+">1000+ Employees</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
              Funding Stage
            </label>
            <select
              value={selectedFunding}
              onChange={e => setSelectedFunding(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: 12,
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                outline: 'none'
              }}
            >
              <option value="All">All Funding Stages</option>
              <option value="Series A">Series A</option>
              <option value="Series B">Series B</option>
              <option value="Series C">Series C</option>
              <option value="Series D">Series D+</option>
              <option value="Public">Public (IPO)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
              Min ICP Fit
            </label>
            <select
              value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: 12,
                padding: '7px 10px',
                borderRadius: 'var(--radius-sm)',
                outline: 'none'
              }}
            >
              <option value="0">Any Fit Score</option>
              <option value="80">80%+ Fit</option>
              <option value="90">90%+ Fit</option>
              <option value="95">95%+ High Conviction</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                setSelectedIndustry('All');
                setSelectedSize('All');
                setSelectedFunding('All');
                setMinScore(0);
                setSearchQuery('');
                setActivePreset('all');
                fetchCompanies('', 'All', 'All', 'All', 0);
              }}
              style={{
                width: '100%',
                height: 35,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: 12,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Bar when rows are selected */}
      {selectedIds.size > 0 && (
        <div style={{
          position: 'sticky',
          top: 20,
          zIndex: 40,
          background: 'rgba(16, 18, 22, 0.95)',
          border: '1px solid var(--brand-cyan)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          boxShadow: '0 4px 24px rgba(0, 229, 255, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedIds.size} {selectedIds.size === 1 ? 'account' : 'accounts'} selected
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Clear selection
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn btn-secondary"
              onClick={handleExportSelected}
              style={{ display: 'flex', alignItems: 'center', gap: 8, height: 34 }}
            >
              <Download size={13} color="var(--brand-cyan)" />
              <span>Save Selected to CSV</span>
            </button>

            <button
              className="btn btn-primary"
              disabled={isAddingToPipeline}
              onClick={() => {
                const selectedList = companies.filter(c => selectedIds.has(c.id));
                handleAddToPipeline(selectedList);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, height: 34 }}
            >
              <Plus size={13} />
              <span>{isAddingToPipeline ? 'Importing...' : 'Add to Pipeline & Research'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Companies Table */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 2.2fr 1.6fr 1.4fr 1.4fr 1.8fr 1.6fr 90px 140px',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          alignItems: 'center'
        }}>
          <div>
            <button
              onClick={selectAll}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
              title="Select all"
            >
              {selectedIds.size === companies.length && companies.length > 0 ? (
                <CheckSquare size={16} color="var(--brand-cyan)" />
              ) : (
                <Square size={16} />
              )}
            </button>
          </div>
          <div>Company & Domain</div>
          <div>Industry</div>
          <div>Size & Stage</div>
          <div>Location</div>
          <div>Tech Stack</div>
          <div>Key Signal</div>
          <div style={{ textAlign: 'center' }}>ICP Fit</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} className="spin-icon" color="var(--brand-cyan)" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 13 }}>Scanning verified company database...</div>
          </div>
        ) : companies.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <AlertCircle size={28} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>No target companies match your filters</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Try adjusting your query, widening headcount criteria, or click "Reset Filters".
            </div>
          </div>
        ) : (
          companies.map(company => {
            const isSelected = selectedIds.has(company.id);
            return (
              <div
                key={company.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 2.2fr 1.6fr 1.4fr 1.4fr 1.8fr 1.6fr 90px 140px',
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: 12.5,
                  alignItems: 'center',
                  background: isSelected ? 'rgba(0, 229, 255, 0.03)' : 'transparent',
                  transition: 'background 0.15s ease',
                  cursor: 'pointer'
                }}
                onClick={() => setInspectedCompany(company)}
              >
                {/* Checkbox */}
                <div onClick={e => { e.stopPropagation(); toggleSelect(company.id); }}>
                  <button
                    style={{ background: 'none', border: 'none', color: isSelected ? 'var(--brand-cyan)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                  >
                    {isSelected ? <CheckSquare size={16} color="var(--brand-cyan)" /> : <Square size={16} />}
                  </button>
                </div>

                {/* Company Name & Domain */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--brand-cyan)',
                    flexShrink: 0
                  }}>
                    {company.name.charAt(0)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {company.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <a 
                        href={`https://${company.domain}`} 
                        target="_blank" 
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ 
                          fontSize: 11, 
                          color: 'var(--text-secondary)', 
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3
                        }}
                      >
                        {company.domain}
                        <ExternalLink size={10} color="var(--text-muted)" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Industry */}
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    padding: '2px 8px',
                    borderRadius: 2,
                    fontSize: 11
                  }}>
                    {company.industry}
                  </span>
                </div>

                {/* Size & Funding */}
                <div>
                  <div style={{ color: 'var(--text-primary)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                    {company.headcount}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {company.fundingStage}
                  </div>
                </div>

                {/* Location */}
                <div style={{ color: 'var(--text-secondary)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} color="var(--text-muted)" />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {company.location}
                  </span>
                </div>

                {/* Tech Stack Chips */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {company.techStack.slice(0, 2).map((tech, idx) => (
                    <span 
                      key={idx}
                      style={{
                        fontSize: 10.5,
                        fontFamily: 'var(--font-mono)',
                        padding: '1px 6px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 2,
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                  {company.techStack.length > 2 && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      +{company.techStack.length - 2}
                    </span>
                  )}
                </div>

                {/* Key Signal */}
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={company.growthSignal}>
                  {company.growthSignal}
                </div>

                {/* ICP Fit Score */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3px 8px',
                    borderRadius: 2,
                    background: company.icpFitScore >= 95 ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${company.icpFitScore >= 95 ? 'rgba(0, 229, 255, 0.4)' : 'var(--border-subtle)'}`,
                    color: company.icpFitScore >= 95 ? 'var(--brand-cyan)' : 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11.5,
                    fontWeight: 600
                  }}>
                    {company.icpFitScore}%
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => exportCompaniesToCsv([company], `${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_leadlens.csv`)}
                    title="Export this company as CSV"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      padding: '5px 8px',
                      borderRadius: 2,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11
                    }}
                  >
                    <Download size={11} color="var(--brand-cyan)" />
                    <span>CSV</span>
                  </button>

                  <button
                    onClick={() => handleAddToPipeline([company])}
                    title="Add company directly to LeadLens research pipeline"
                    style={{
                      background: 'rgba(0, 229, 255, 0.08)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      color: 'var(--brand-cyan)',
                      padding: '5px 8px',
                      borderRadius: 2,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11
                    }}
                  >
                    <Plus size={11} />
                    <span>Add</span>
                  </button>

                  <button
                    onClick={() => setInspectedCompany(company)}
                    title="View full dossier"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      padding: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Side Company Dossier Inspection Drawer */}
      {inspectedCompany && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8, 9, 11, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
          onClick={() => setInspectedCompany(null)}
        >
          <div 
            style={{
              width: 540,
              height: '100%',
              background: '#0B0C0E',
              borderLeft: '1px solid var(--border-muted)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.8)',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    background: 'rgba(0, 229, 255, 0.1)',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-cyan)',
                    fontWeight: 700,
                    fontSize: 16
                  }}>
                    {inspectedCompany.name.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {inspectedCompany.name}
                    </h2>
                    <a 
                      href={`https://${inspectedCompany.domain}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ fontSize: 12, color: 'var(--brand-cyan)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none', marginTop: 2 }}
                    >
                      {inspectedCompany.domain}
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setInspectedCompany(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
              
              {/* Score & Stage Banner */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 2,
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12
              }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ICP Fit Score</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand-cyan)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    {inspectedCompany.icpFitScore}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Headcount</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', marginTop: 2 }}>
                    {inspectedCompany.headcount}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Funding Stage</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', marginTop: 2 }}>
                    {inspectedCompany.fundingStage}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Company Overview
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {inspectedCompany.description}
                </div>
              </div>

              {/* Growth Signal & Intent Trigger */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Key Signal & Intent Trigger
                </div>
                <div style={{
                  background: 'rgba(0, 229, 255, 0.04)',
                  border: '1px solid rgba(0, 229, 255, 0.2)',
                  borderRadius: 2,
                  padding: '12px 14px',
                  fontSize: 12.5,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <Zap size={14} color="var(--brand-cyan)" flexShrink={0} />
                  <span>{inspectedCompany.growthSignal}</span>
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Detected Tech Stack
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {inspectedCompany.techStack.map((tech, i) => (
                    <span 
                      key={i}
                      style={{
                        fontSize: 11.5,
                        fontFamily: 'var(--font-mono)',
                        padding: '4px 10px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 2,
                        color: 'var(--text-primary)'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Decision Makers */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Recommended Buyer Personas
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {inspectedCompany.targetTitles.map((title, i) => (
                    <div 
                      key={i}
                      style={{
                        fontSize: 12.5,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <Users size={12} color="var(--brand-cyan)" />
                      <span>{title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Pain Points */}
              {inspectedCompany.painPoints && inspectedCompany.painPoints.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    Strategic Pain Points
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {inspectedCompany.painPoints.map((pain, i) => (
                      <div 
                        key={i}
                        style={{
                          fontSize: 12.5,
                          color: 'var(--text-secondary)',
                          lineHeight: 1.5,
                          paddingLeft: 12,
                          borderLeft: '2px solid var(--border-muted)'
                        }}
                      >
                        {pain}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pitch Angle */}
              {inspectedCompany.valueAngle && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    Recommended Outreach Angle
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{inspectedCompany.valueAngle}"
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div style={{
              padding: '20px 28px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <button
                className="btn btn-secondary"
                onClick={() => exportCompaniesToCsv([inspectedCompany], `${inspectedCompany.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_leadlens.csv`)}
                style={{ flex: 1, height: 40 }}
              >
                <Download size={14} color="var(--brand-cyan)" />
                <span>Save Company to CSV</span>
              </button>

              <button
                className="btn btn-primary"
                onClick={() => {
                  handleAddToPipeline([inspectedCompany]);
                  setInspectedCompany(null);
                }}
                style={{ flex: 1, height: 40 }}
              >
                <Plus size={14} />
                <span>Queue to 5-Agent Waterfall</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

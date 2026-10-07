import React, { useState } from 'react';
import { X, Upload, Database, CheckCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';

export default function BatchImportModal({ isOpen, onClose, onBatchSubmit, campaigns = [] }) {
  const [inputText, setInputText] = useState(
    "Stripe, stripe.com\nDatabricks, databricks.com\nVercel, vercel.com\nSnowflake, snowflake.com"
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const parseEntries = () => {
    return inputText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split(/[,\t]+/).map(p => p.trim());
        const companyName = parts[0] || '';
        let website = parts[1] || '';
        if (!website && companyName.includes('.')) {
          website = companyName;
        } else if (!website) {
          website = `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
        }
        return { companyName, website };
      })
      .filter(item => item.companyName);
  };

  const parsed = parseEntries();

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setInputText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (parsed.length === 0) return;
    setIsSubmitting(true);
    await onBatchSubmit(parsed, selectedCampaignId);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(8, 9, 11, 0.85)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110
    }} onClick={onClose}>
      <div style={{
        width: 640,
        background: 'var(--bg-app)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '24px 32px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 2,
              background: 'rgba(0, 229, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 229, 255, 0.2)'
            }}>
              <Database size={16} color="var(--brand-cyan)" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Batch Account Ingestion
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Queue raw accounts directly into the autonomous research pipeline.
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6 }}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Campaign Selector */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Destination Pipeline & Ruleset
            </label>
            <select
              value={selectedCampaignId}
              onChange={e => setSelectedCampaignId(Number(e.target.value))}
              className="input-field"
            >
              {campaigns.length > 0 ? campaigns.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.target_persona})
                </option>
              )) : (
                <option value={1}>Default Global Outreach Pipeline</option>
              )}
            </select>
          </div>

          {/* Input Format & File Upload */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Raw Data Paste (CSV/Text)
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                color: 'var(--brand-cyan)',
                cursor: 'pointer'
              }}>
                <Upload size={12} />
                <span>Upload .CSV file</span>
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <textarea
              rows={6}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="e.g.&#10;Stripe, stripe.com&#10;Databricks, databricks.com&#10;Vercel, vercel.com"
              className="input-field"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12.5,
                lineHeight: 1.6,
                resize: 'vertical'
              }}
            />
          </div>

          {/* Parsed Preview */}
          <div style={{
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: 2,
            padding: 16
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              Execution Queue ({parsed.length} Verified)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 90, overflowY: 'auto' }}>
              {parsed.map((p, i) => (
                <span
                  key={i}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {p.companyName} ({p.website})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12
        }}>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting || parsed.length === 0}
            className="btn btn-primary"
          >
            <CheckCircle size={14} />
            <span>{isSubmitting ? 'Enqueuing Pipeline...' : `Launch Agents (${parsed.length} Accounts)`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

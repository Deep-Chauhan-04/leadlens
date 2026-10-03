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
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 110 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: 640 }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary)'
            }}>
              <Database size={18} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Batch Prospect Importer
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Queue multiple target accounts into the autonomous 5-agent research pipeline.
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: 6 }}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Campaign Selector */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Target Campaign & ICP Value Proposition
            </label>
            <select
              value={selectedCampaignId}
              onChange={e => setSelectedCampaignId(Number(e.target.value))}
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
            >
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.target_persona})
                </option>
              ))}
            </select>
          </div>

          {/* Input Format & File Upload */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Paste Company List (Format: Company Name, Website)
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                color: 'var(--brand-primary)',
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
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-muted)',
                borderRadius: 'var(--radius-md)',
                padding: 12,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12.5,
                lineHeight: 1.6,
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Parsed Preview */}
          <div style={{
            background: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 12
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              Ready to Queue ({parsed.length} Accounts Identified)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 90, overflowY: 'auto' }}>
              {parsed.map((p, i) => (
                <span
                  key={i}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-muted)',
                    fontSize: 11.5,
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
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 10
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
            <span>{isSubmitting ? 'Enqueuing Pipeline...' : `Launch Pipeline (${parsed.length} Accounts)`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

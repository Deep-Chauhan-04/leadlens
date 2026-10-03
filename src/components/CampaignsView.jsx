import React, { useState, useEffect } from 'react';
import { Target, Plus, Check, Sliders, Sparkles, Building, Briefcase, FileText } from 'lucide-react';

export default function CampaignsView({ campaigns = [], onReloadCampaigns }) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [targetPersona, setTargetPersona] = useState('VP of Engineering / CTO');
  const [offering, setOffering] = useState('');
  const [valueProp, setValueProp] = useState('');
  const [tone, setTone] = useState('Executive');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!name || !offering) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          target_persona: targetPersona,
          offering,
          value_prop: valueProp,
          tone
        })
      });

      if (res.ok) {
        setName('');
        setOffering('');
        setValueProp('');
        setIsCreating(false);
        onReloadCampaigns?.();
      }
    } catch (err) {
      console.error('Error creating campaign:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-primary)',
            border: '1px solid var(--border-highlight)'
          }}>
            <Target size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Campaign & ICP Profile Studio
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
              Define target buyer personas, value propositions, and pitch angles used by Agent 3 & Agent 4.
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsCreating(!isCreating)} 
          className="btn btn-primary"
        >
          <Plus size={14} />
          <span>{isCreating ? 'Cancel' : 'Create New Campaign'}</span>
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <form onSubmit={handleCreateCampaign} style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-highlight)',
          borderRadius: 'var(--radius-xl)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            New ICP Campaign Setup
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Campaign Name
              </label>
              <input 
                type="text" 
                placeholder="e.g. Enterprise Cloud Cost Optimization" 
                value={name} 
                onChange={e => setName(e.target.value)} 
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
                Target Buyer Persona
              </label>
              <input 
                type="text" 
                placeholder="e.g. VP of Engineering / CTO / Head of Infra" 
                value={targetPersona} 
                onChange={e => setTargetPersona(e.target.value)} 
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
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Core Product / Service Offering
            </label>
            <input 
              type="text" 
              placeholder="e.g. Automated Kubernetes rightsizing and autoscaling daemon" 
              value={offering} 
              onChange={e => setOffering(e.target.value)} 
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
              Value Proposition & ROI Claim
            </label>
            <textarea 
              rows={3}
              placeholder="e.g. We identify idle container allocations to shave 30-50% off monthly AWS/GCP bills without touching p99 latency..." 
              value={valueProp} 
              onChange={e => setValueProp(e.target.value)} 
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-muted)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={() => setIsCreating(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              <Check size={14} />
              <span>{isSubmitting ? 'Saving Campaign...' : 'Save Campaign'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Campaign Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
        {campaigns.map(camp => (
          <div 
            key={camp.id}
            style={{
              background: 'var(--bg-surface)',
              border: `1px solid ${camp.is_default ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-xl)',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: camp.is_default ? '0 0 20px var(--brand-primary-glow)' : 'var(--shadow-subtle)',
              position: 'relative'
            }}
          >
            {camp.is_default === 1 && (
              <span style={{
                position: 'absolute',
                top: 16,
                right: 16,
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--brand-primary)',
                background: 'rgba(99, 102, 241, 0.15)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>
                DEFAULT CAMPAIGN
              </span>
            )}

            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, paddingRight: 100 }}>
                {camp.name}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                <Briefcase size={13} color="var(--brand-primary)" />
                <span>Persona: {camp.target_persona}</span>
              </div>

              <div style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 12,
                fontSize: 12.5,
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                marginBottom: 14
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  OFFERING & PROPOSITION
                </div>
                {camp.offering}
              </div>

              {camp.value_prop && (
                <div style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: 16 }}>
                  "{camp.value_prop}"
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 14,
              borderTop: '1px solid var(--border-subtle)',
              fontSize: 11.5,
              color: 'var(--text-muted)'
            }}>
              <span>Tone: <strong>{camp.tone || 'Executive'}</strong></span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>ID: #{camp.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

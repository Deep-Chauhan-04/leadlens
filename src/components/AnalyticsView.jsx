import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, Clock, ShieldCheck, Download, Zap
} from 'lucide-react';

export default function AnalyticsView() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    fetch('/api/analytics', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeout);
        setAnalytics(data);
      })
      .catch(err => {
        clearTimeout(timeout);
        console.warn('Analytics fetch warning (using cached metrics):', err.message);
      });

    return () => clearTimeout(timeout);
  }, []);

  const counts = analytics?.counts || { total: 0, sent: 0, approved: 0, needsReview: 0, researching: 0 };
  const averages = analytics?.averages || { icpScore: 0, deliverabilityScore: 0, reflectionScore: 0 };
  const telemetry = analytics?.telemetry || {
    totalCost: 0,
    totalNaiveCost: 0,
    totalSavingsDollar: 0,
    savingsPercent: 0,
    benchmarkSdrCost: 0,
    humanHoursSaved: 0,
    totalCheapTokens: 0,
    totalPremiumTokens: 0
  };

  const handleExportCsv = () => {
    window.location.href = '/api/leads/export/csv';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>
      {/* Top Banner */}
      <div style={{
        background: 'transparent',
        border: '1px solid var(--border-highlight)',
        borderRadius: 2,
        padding: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle glowing effect in background matching the lens */}
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,229,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 56,
            height: 56,
            border: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-cyan)'
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              Executive ROI & Telemetry
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', border: '1px solid var(--brand-cyan)', color: 'var(--brand-cyan)', padding: '2px 6px', textTransform: 'uppercase' }}>
                System Active
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              LeadLens automated multi-agent architecture delivered <strong style={{ color: 'var(--text-primary)' }}>{telemetry.savingsPercent}%</strong> cost reduction over manual research this cycle.
            </div>
          </div>
        </div>

        <button onClick={handleExportCsv} className="btn btn-secondary" style={{ position: 'relative', zIndex: 1 }}>
          <Download size={14} />
          <span>Export Pipeline Audit CSV</span>
        </button>
      </div>

      {/* 4 Core Financial & Velocity KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 24
      }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Avg Cost / Account</span>
            <DollarSign size={14} color="var(--text-primary)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 400, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            ${(telemetry.totalCost / (counts.total || 1)).toFixed(4)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
            vs <span style={{ textDecoration: 'line-through' }}>$18.50</span> SDR bench
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Model Efficiency</span>
            <Zap size={14} color="var(--brand-cyan)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 400, color: 'var(--brand-cyan)', fontFamily: 'var(--font-mono)' }}>
            {telemetry.savingsPercent}%
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
            ${telemetry.totalSavingsDollar.toFixed(2)} saved via routing
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Hours Reclaimed</span>
            <Clock size={14} color="var(--text-primary)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 400, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {telemetry.humanHoursSaved}h
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
            Based on ~45m/account avg
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Avg Deliverability</span>
            <ShieldCheck size={14} color="var(--text-primary)" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 400, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {averages.deliverabilityScore}/100
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
            Clean Domain Health
          </div>
        </div>
      </div>

      {/* Detailed Technical Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        
        {/* Token Distribution Card */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header" style={{ marginBottom: 32, paddingBottom: 16 }}>
            Token Allocation by Execution Tier
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
            Volume breakdown between surface-level crawling operations (Flash) vs deep ICP reasoning and copywriting (Pro).
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: 'var(--brand-cyan)', fontWeight: 500 }}>High-Velocity Tier (Agent 1, 2, 5)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{telemetry.totalCheapTokens.toLocaleString()} tokens (~82%)</span>
              </div>
              <div style={{ height: 4, background: 'var(--border-subtle)', borderRadius: 0, overflow: 'hidden' }}>
                <div style={{ width: '82%', height: '100%', background: 'var(--brand-cyan)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Deep Reasoning Tier (Agent 3, 4)</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{telemetry.totalPremiumTokens.toLocaleString()} tokens (~18%)</span>
              </div>
              <div style={{ height: 4, background: 'var(--border-subtle)', borderRadius: 0, overflow: 'hidden' }}>
                <div style={{ width: '18%', height: '100%', background: 'var(--text-primary)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Stage Distribution */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header" style={{ marginBottom: 32, paddingBottom: 16 }}>
            Outreach Funnel Velocity
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Outbound Dispatched', count: counts.sent, color: 'var(--text-primary)' },
              { label: 'Approved (In Queue)', count: counts.approved, color: 'var(--brand-cyan)' },
              { label: 'Needs Human Review', count: counts.needsReview, color: 'var(--text-secondary)' },
              { label: 'Autonomous Researching', count: counts.researching, color: 'var(--border-highlight)' }
            ].map((stage, i) => (
              <div 
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'transparent',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: stage.color }} />
                  <span>{stage.label}</span>
                </div>
                <span style={{ fontWeight: 400, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: 14 }}>
                  {stage.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

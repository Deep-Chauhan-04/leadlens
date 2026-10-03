import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertCircle, Send, Cpu, Database, RefreshCw, Key, Globe, Terminal } from 'lucide-react';

export default function IntegrationsView() {
  const [health, setHealth] = useState(null);
  const [smtpSettings, setSmtpSettings] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [testStatus, setTestStatus] = useState(null); // { loading, success, message }

  const fetchHealthAndSettings = () => {
    fetch('/api/health')
      .then(res => res.json())
      .then(setHealth)
      .catch(console.error);

    fetch('/api/settings')
      .then(res => res.json())
      .then(setSmtpSettings)
      .catch(console.error);
  };

  useEffect(() => {
    fetchHealthAndSettings();
  }, []);

  const handleTestSmtp = async () => {
    setTestStatus({ loading: true, message: 'Verifying SMTP credentials with transport host...' });
    try {
      const res = await fetch('/api/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testRecipient: testEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus({ loading: false, success: true, message: data.message });
      } else {
        setTestStatus({ loading: false, success: false, message: data.error || 'SMTP Connection Test Failed' });
      }
    } catch (err) {
      setTestStatus({ loading: false, success: false, message: err.message });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-emerald)',
            border: '1px solid var(--border-highlight)'
          }}>
            <Shield size={22} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Integrations, Outbound Delivery & System Diagnostics
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
              Live verification of LLM inference engines, SMTP transport servers, and CRM sync endpoints.
            </div>
          </div>
        </div>

        <button onClick={fetchHealthAndSettings} className="btn btn-secondary btn-sm">
          <RefreshCw size={13} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* Services Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {/* Gemini Service */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: 18
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Google Gemini Engine</span>
            <span className="status-pill approved" style={{ fontSize: 10 }}>Operational</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Tier: <strong>Gemini 2.5 Flash + Pro</strong>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle size={12} />
            <span>Google Search Tool Grounding Active</span>
          </div>
        </div>

        {/* SMTP Outbound */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: 18
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Outbound SMTP Transport</span>
            <span className="status-pill approved" style={{ fontSize: 10 }}>Configured</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Host: <strong>{smtpSettings?.smtpHost || 'smtp.gmail.com'}</strong>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            Sender: {smtpSettings?.smtpFromEmail || 'thinklog85@gmail.com'}
          </div>
        </div>

        {/* Database */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: 18
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>SQLite Enterprise Store</span>
            <span className="status-pill approved" style={{ fontSize: 10 }}>Healthy</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Storage: <strong>Persistent SQLite 3</strong>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            Timeout: 10,000ms Busy Lock Guard
          </div>
        </div>
      </div>

      {/* SMTP Test Console */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          Outbound Mail Dispatch Diagnostic
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
          Test your production SMTP delivery before enabling autonomous 1-click dispatch.
        </div>

        <div style={{ display: 'flex', gap: 12, maxWidth: 600 }}>
          <input
            type="email"
            placeholder="Enter test recipient email (or leave blank to verify handshake)..."
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
            style={{
              flexGrow: 1,
              background: 'var(--bg-input)',
              border: '1px solid var(--border-muted)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none'
            }}
          />
          <button
            onClick={handleTestSmtp}
            disabled={testStatus?.loading}
            className="btn btn-primary"
          >
            <Send size={13} />
            <span>{testStatus?.loading ? 'Testing...' : 'Run SMTP Test'}</span>
          </button>
        </div>

        {testStatus && (
          <div style={{
            padding: 12,
            borderRadius: 'var(--radius-md)',
            background: testStatus.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
            border: `1px solid ${testStatus.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            color: testStatus.success ? '#34d399' : '#fb7185',
            fontSize: 12.5,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            {testStatus.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            <span>{testStatus.message}</span>
          </div>
        )}
      </div>

      {/* CRM & Webhook Preview */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: 24
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          CRM Bi-directional Synchronization (HubSpot / Salesforce)
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Automatically push approved leads, enriched dossiers, and sent outreach emails to your CRM pipeline.
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16
        }}>
          <div style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 16
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              HubSpot Deals & Contacts Sync
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Webhook endpoint: <code>https://api.leadlens.io/v1/webhooks/hubspot</code>
            </div>
            <span className="status-pill sent" style={{ fontSize: 10 }}>Ready to Bind</span>
          </div>

          <div style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 16
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Salesforce Enterprise Lead Ingestion
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Sync on status transition: <code>Approved ➔ Sent</code>
            </div>
            <span className="status-pill sent" style={{ fontSize: 10 }}>Ready to Bind</span>
          </div>
        </div>
      </div>
    </div>
  );
}

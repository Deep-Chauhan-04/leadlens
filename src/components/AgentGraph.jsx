import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Layers, 
  PenTool, 
  ShieldCheck, 
  Cpu, 
  Clock, 
  Coins, 
  ChevronRight, 
  Activity, 
  Zap, 
  CheckCircle2, 
  Terminal,
  Info,
  X
} from 'lucide-react';

const AGENT_NODES = [
  {
    id: 'gatekeeper',
    number: 1,
    name: 'Gatekeeper',
    title: 'Executive Prospect Discovery',
    icon: Users,
    modelTier: 'Gemini 2.5 Flash',
    costPerM: '$0.075 / $0.30',
    type: 'fast',
    description: 'Searches real-time Google web data to pinpoint key technical decision makers (CTO, VP Eng, VP Infra), verified email patterns, and LinkedIn profiles.',
    latencyMs: 640,
    samplePrompt: 'Search Google and find the primary technical leader at "{{companyName}}". Deduce corporate email format and locate verified LinkedIn URL.',
    schema: 'contactName, contactTitle, contactLinkedin, contactEmail, industry, employeeCount'
  },
  {
    id: 'analyst',
    number: 2,
    name: 'Intel Analyst',
    title: 'Architecture & Tech Profiler',
    icon: Search,
    modelTier: 'Gemini 2.5 Flash',
    costPerM: '$0.075 / $0.30',
    type: 'fast',
    description: 'Scours technical blogs, job descriptions, and domain DNS to extract cloud provider (AWS/GCP), container setup (Kubernetes), databases, and observability tooling.',
    latencyMs: 1420,
    samplePrompt: 'Identify technical infrastructure stack for "{{companyName}}". Compile at least 3 concrete findings regarding scaling bottlenecks or engineering goals.',
    schema: 'summary, techStack: string[], findings: string[]'
  },
  {
    id: 'architect',
    number: 3,
    name: 'Solutions Architect',
    title: 'Value Proposition Mapper',
    icon: Layers,
    modelTier: 'Gemini 2.5 Pro',
    costPerM: '$1.25 / $5.00',
    type: 'reasoning',
    description: 'Bridges prospect technical findings directly to client product offerings. Identifies quantifiable infrastructure waste and calculates ICP fit score.',
    latencyMs: 890,
    samplePrompt: 'Map our Kubernetes Rightsizer offering to their static EC2 provisioning findings. Quantify expected monthly compute waste.',
    schema: 'icpScore: number, painPoints: { issue, implication }[], solutions: { offeringLink, benefit }[]'
  },
  {
    id: 'director',
    number: 4,
    name: 'Sales Director',
    title: 'A/B Copywriter & Critic',
    icon: PenTool,
    modelTier: 'Gemini 2.5 Pro',
    costPerM: '$1.25 / $5.00',
    type: 'reasoning',
    description: 'Crafts hyper-personalized under-140-word outreach emails referencing exact tech stack, generates A/B subject lines, and conducts rigorous self-reflection scoring.',
    latencyMs: 1150,
    samplePrompt: 'Write a high-converting cold email to {{contactName}}. Keep under 140 words, conversational, no generic fluff. Generate A/B subject lines and Step 2 follow-up.',
    schema: 'subjectVariantA, subjectVariantB, draftEmail, followUpDraft, reflectionScore, reflectionFeedback'
  },
  {
    id: 'compliance',
    number: 5,
    name: 'Compliance Guard',
    title: 'Deliverability & Spam Auditor',
    icon: ShieldCheck,
    modelTier: 'Enterprise Safety Layer',
    costPerM: 'Local Heuristic / Sub-ms',
    type: 'safety',
    description: 'Scans cold copy for high-risk spam keywords, calculates reading time, deliverability score (0-100), and validates CAN-SPAM / GDPR opt-out compliance.',
    latencyMs: 320,
    samplePrompt: 'Audit draft copy against 50+ enterprise spam trigger tokens. Calculate word count, reading pace, and deliverability index.',
    schema: 'deliverabilityScore: 0-100, spamRisk: Low|Medium|High, readTimeSeconds, canSpamCompliant: boolean'
  }
];

export default function AgentGraph({ activeLead, isExecuting = false }) {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
      {/* Header Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand-primary)'
          }}>
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              5-Agent Autonomous Pipeline DAG
              <span className="enterprise-badge" style={{ fontSize: 9 }}>Tiered Routing Active</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Heterogeneous execution graph: Cheap Flash models handle high-volume scraping while Pro reasoning models craft high-conversion copy.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Graph Latency</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
              ~4.4s End-to-End
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Estimated Cost / Lead</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              $0.0152 (72% saved)
            </div>
          </div>
        </div>
      </div>

      {/* DAG Visual Grid */}
      <div style={{
        flexGrow: 1,
        background: 'var(--bg-sidebar)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '30px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle grid lines background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }} />

        {/* Nodes Container */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 1,
          gap: 12
        }}>
          {AGENT_NODES.map((node, index) => {
            const Icon = node.icon;
            const isLast = index === AGENT_NODES.length - 1;
            const isReasoning = node.type === 'reasoning';
            const isSafety = node.type === 'safety';

            let accentColor = '#6366f1';
            if (isReasoning) accentColor = '#a855f7';
            if (isSafety) accentColor = '#10b981';

            return (
              <React.Fragment key={node.id}>
                {/* Node Card */}
                <div 
                  onClick={() => setSelectedNode(node)}
                  style={{
                    flex: '1 1 0',
                    maxWidth: 240,
                    background: 'var(--bg-surface)',
                    border: `1px solid ${selectedNode?.id === node.id ? accentColor : 'var(--border-muted)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: 16,
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    boxShadow: selectedNode?.id === node.id ? `0 0 20px ${accentColor}33` : 'var(--shadow-subtle)',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {
                    if (selectedNode?.id !== node.id) {
                      e.currentTarget.style.borderColor = 'var(--border-highlight)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (selectedNode?.id !== node.id) {
                      e.currentTarget.style.borderColor = 'var(--border-muted)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {/* Top Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: 'var(--radius-sm)',
                      background: `${accentColor}18`,
                      border: `1px solid ${accentColor}44`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: accentColor
                    }}>
                      <Icon size={16} />
                    </div>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)'
                    }}>
                      0{node.number}
                    </span>
                  </div>

                  {/* Title & Name */}
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {node.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 12, height: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {node.title}
                  </div>

                  {/* Model & Tier Pills */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Model Tier</span>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: accentColor,
                        padding: '1px 6px',
                        background: `${accentColor}12`,
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${accentColor}25`
                      }}>
                        {node.modelTier}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Latency</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {node.latencyMs}ms
                      </span>
                    </div>
                  </div>

                  {/* Execution Status Indicator */}
                  <div style={{
                    marginTop: 12,
                    paddingTop: 8,
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 10.5,
                    color: 'var(--accent-emerald)'
                  }}>
                    <span className="pulse-dot" />
                    <span>Engine Ready</span>
                  </div>
                </div>

                {/* Animated Connecting Arrow */}
                {!isLast && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-dim)',
                    position: 'relative',
                    width: 24
                  }}>
                    <ChevronRight size={18} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Selected Node Deep Inspector */}
        {selectedNode && (
          <div style={{
            marginTop: 24,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-highlight)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
            animation: 'fadeIn 0.2s ease-out',
            position: 'relative'
          }}>
            <button 
              onClick={() => setSelectedNode(null)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-primary)'
              }}>
                <Zap size={20} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Agent 0{selectedNode.number}: {selectedNode.name} Inspector
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  {selectedNode.description}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                  System Prompt Template
                </div>
                <div style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 12,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6
                }}>
                  {selectedNode.samplePrompt}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Structured JSON Output Schema
                </div>
                <div style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 12,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  color: '#a5b4fc',
                  lineHeight: 1.6
                }}>
                  {`{\n  ${selectedNode.schema.split(', ').map(k => `"${k}": ...`).join(',\n  ')}\n}`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

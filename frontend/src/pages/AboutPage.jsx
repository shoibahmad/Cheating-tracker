import React from 'react';
import { Shield, Cpu, Lock, Eye, Server, Code, Users, CheckCircle, Database, Layout, Activity, FileText, ChevronRight, Globe, Zap, Settings, Layers, MousePointer2, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
    return (
        <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>

            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '6rem', paddingTop: '4rem', position: 'relative' }}>
                <div style={{
                    position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
                    width: '300px', height: '300px', background: 'var(--accent-primary)',
                    filter: 'blur(150px)', opacity: 0.1, pointerEvents: 'none'
                }}></div>
                <div style={{
                    display: 'inline-block', padding: '0.6rem 1.2rem', borderRadius: '30px',
                    background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: 'var(--accent-primary)', fontSize: '0.9rem', marginBottom: '1.5rem',
                    fontWeight: '600', letterSpacing: '0.5px'
                }}>
                    ✨ THE FUTURE OF EXAM INTEGRITY
                </div>
                <h1 style={{ fontSize: '4.5rem', fontWeight: '900', marginBottom: '1.5rem', lineHeight: 1.05, letterSpacing: '-1px' }}>
                    Securing <span className="text-gradient">Academic Excellence</span> <br />
                    with Advanced AI
                </h1>
                <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', maxWidth: '850px', margin: '0 auto', lineHeight: '1.6' }}>
                    Stop Cheating leverages deep learning and computer vision to create an unshakeable environment for online assessments,
                    ensuring fairness and trust in every digital certification.
                </p>
            </div>

            {/* Core Features Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '8rem' }}>
                <FeatureCard
                    icon={<Eye size={36} color="#f43f5e" />}
                    title="Real-Time Computer Vision"
                    desc="Proprietary gaze tracking and head-pose estimation detect if a candidate is seeking external help or looking away from the screen."
                    borderColor="#f43f5e"
                    glowColor="rgba(244, 63, 94, 0.2)"
                />
                <FeatureCard
                    icon={<Lock size={36} color="#10b981" />}
                    title="Immutable Environment"
                    desc="Zero-tolerance lockdown mode disables OS-level shortcuts, tab-switching, and multi-monitor setups to prevent resource access."
                    borderColor="#10b981"
                    glowColor="rgba(16, 185, 129, 0.2)"
                />
                <FeatureCard
                    icon={<Cpu size={36} color="#6366f1" />}
                    title="Cognitive AI Grading"
                    desc="Utilizing LLMs to understand nuance, context, and semantic meaning in descriptive answers, providing objective scores instantly."
                    borderColor="#6366f1"
                    glowColor="rgba(99, 102, 241, 0.2)"
                />
            </div>

            {/* 3-Tier Architecture Section */}
            <SectionHeader title="System Architecture" subtitle="A robust 3-tier infrastructure designed for scalability and security" />

            <div style={{ marginBottom: '8rem' }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', padding: '4rem',
                    background: 'rgba(255,255,255,0.02)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    {/* Background Glow */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

                    <ArchLayer
                        title="Presentation Layer (React.js)"
                        icon={<MousePointer2 size={24} />}
                        desc="Highly responsive UI with real-time proctoring dashboard and student portals"
                        color="#61DAFB"
                    />

                    <LayerConnector />

                    <ArchLayer
                        title="Application & AI Layer (FastAPI)"
                        icon={<Terminal size={24} />}
                        desc="Business logic, MediaPipe computer vision, and Gemini AI integration"
                        color="#009688"
                        highlight
                    />

                    <LayerConnector />

                    <ArchLayer
                        title="Data Layer (Firebase)"
                        icon={<Database size={24} />}
                        desc="Cloud Firestore for real-time state management and Firebase Auth for security"
                        color="#FFCA28"
                    />
                </div>
            </div>

            {/* DFD & Flowchart Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '8rem' }}>

                <div className="glass-panel" style={{ padding: '3rem', position: 'relative' }}>
                    <h3 style={{ fontSize: '1.6rem', marginBottom: '2.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Database size={24} color="var(--accent-primary)" /> Data Flow (L-0)
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <EntityBox name="Student" icon={<Users size={20} />} />
                        <Connector label="Telemetry & Video Stream" />
                        <div style={{
                            width: '140px', height: '140px', borderRadius: '30px', border: '2px solid var(--accent-primary)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(99, 102, 241, 0.1)', boxShadow: '0 0 40px rgba(99, 102, 241, 0.1)',
                            textAlign: 'center', padding: '10px'
                        }}>
                            <Shield size={32} style={{ marginBottom: '8px' }} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Proctor Engine</span>
                        </div>
                        <Connector label="Integrity Analytics" />
                        <EntityBox name="Admin" icon={<Layout size={20} />} />
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '3rem' }}>
                    <h3 style={{ fontSize: '1.6rem', marginBottom: '2.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Activity size={24} color="var(--accent-secondary)" /> System Lifecycle
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <FlowStepCompact title="Auth" icon={<Lock size={16} />} step="01" />
                        <FlowLine />
                        <FlowStepCompact title="System Check" icon={<Shield size={16} />} step="02" />
                        <FlowLine />
                        <FlowStepCompact title="Live Proctoring" icon={<Eye size={16} />} step="03" active />
                        <FlowLine />
                        <FlowStepCompact title="AI Evaluation" icon={<Cpu size={16} />} step="04" />
                        <FlowLine />
                        <FlowStepCompact title="Final Insights" icon={<FileText size={16} />} step="05" />
                    </div>
                </div>
            </div>

            {/* Components Grid */}
            <SectionHeader title="Application Map" subtitle="Full breakdown of portal modules and services" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '8rem' }}>
                <ModuleCard
                    title="Administrative Office"
                    icon={<Layout color="var(--accent-primary)" />}
                    color="rgba(99, 102, 241, 0.1)"
                    items={[
                        "Dashboard: Real-time system health & overview",
                        "Paper Engine: AI-driven question synthesis",
                        "Proctor Board: Live monitoring & intervention",
                        "Analytics: Behavioral forensics & patterns"
                    ]}
                />
                <ModuleCard
                    title="Student Terminal"
                    icon={<Users color="var(--accent-secondary)" />}
                    color="rgba(168, 85, 247, 0.1)"
                    items={[
                        "Test Center: Secure exam execution environment",
                        "Pre-Flight: Automated system & hardware audit",
                        "Performance: Detailed result & feedback matrix",
                        "Security: Device and session management"
                    ]}
                />
                <ModuleCard
                    title="Core Kernel"
                    icon={<Server color="#10b981" />}
                    color="rgba(16, 185, 129, 0.1)"
                    items={[
                        "Vision Service: Gaze & presence compute",
                        "Reasoning Hub: LLM integration & prompt logic",
                        "Persistence: Real-time DB & state sync",
                        "Auth Gateway: Role-based access control"
                    ]}
                />
            </div>

            {/* Professional Tech Stack */}
            <div style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)',
                padding: '5rem 3rem', borderRadius: '40px', marginBottom: '8rem', border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '4rem', textAlign: 'center' }}>The Tech Stack</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'center' }}>
                    <TechItem name="React 18" sub="Next-Gen UI" />
                    <TechItem name="FastAPI" sub="High Performance" />
                    <TechItem name="Gemini Pro" sub="Reasoning AI" />
                    <TechItem name="MediaPipe" sub="Vision Engine" />
                    <TechItem name="Firestore" sub="Cloud Data" />
                </div>
            </div>

            {/* Creators Section */}
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                <SectionHeader title="The Visionaries" subtitle="Developed with passion at Integral University, Lucknow" />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', marginTop: '4rem' }}>
                    <VisionaryCard name="Nagma Khan" role="System Architect & AI Lead" initials="NK" />
                    <VisionaryCard name="Sonam Chauhan" role="User Experience & Frontend Lead" initials="SC" />
                </div>
            </div>

            <div style={{ textAlign: 'center', paddingBottom: '6rem' }}>
                <Link to="/" className="btn btn-primary" style={{
                    padding: '1.4rem 5rem', fontSize: '1.2rem', borderRadius: '50px',
                    fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px',
                    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)', transition: 'all 0.3s ease'
                }}>
                    Unlock the Platform
                </Link>
            </div>
        </div>
    );
};

// --- Atomic Components ---

const SectionHeader = ({ title, subtitle }) => (
    <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-1px' }}>{title}</h2>
        <div style={{ width: '80px', height: '5px', background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))', margin: '0 auto 1.5rem', borderRadius: '10px' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: '500' }}>{subtitle}</p>
    </div>
);

const FeatureCard = ({ icon, title, desc, borderColor, glowColor }) => (
    <div className="glass-card" style={{
        padding: '3rem', borderTop: `1px solid ${borderColor}`,
        background: 'rgba(255,255,255,0.02)', borderRadius: '30px',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', cursor: 'default',
        boxShadow: `0 0 0 0 transparent`
    }} onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-15px)';
        e.currentTarget.style.boxShadow = `0 20px 40px -10px ${glowColor}`;
        e.currentTarget.style.borderColor = borderColor;
    }} onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
    }}>
        <div style={{
            width: '70px', height: '70px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.03)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '2rem'
        }}>{icon}</div>
        <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', fontWeight: 'bold' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>{desc}</p>
    </div>
);

const ArchLayer = ({ title, icon, desc, color, highlight }) => (
    <div style={{
        padding: '2.5rem', borderRadius: '24px',
        background: highlight ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${highlight ? color : 'rgba(255,255,255,0.1)'}`,
        display: 'flex', alignItems: 'center', gap: '2rem',
        boxShadow: highlight ? `0 10px 30px -10px ${color}44` : 'none',
        transition: 'all 0.3s ease'
    }}>
        <div style={{
            width: '60px', height: '60px', borderRadius: '16px',
            background: `${color}22`, display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: color
        }}>{icon}</div>
        <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '1.4rem', color: color, fontWeight: 'bold', marginBottom: '0.25rem' }}>{title}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{desc}</p>
        </div>
    </div>
);

const LayerConnector = () => (
    <div style={{ height: '40px', width: '2px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)', marginLeft: '120px' }}></div>
);

const EntityBox = ({ name, icon }) => (
    <div style={{
        padding: '1.2rem 2.5rem', borderRadius: '15px', background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '15px',
        fontWeight: 'bold', fontSize: '1rem', minWidth: '180px', justifyContent: 'center'
    }}>
        {icon} {name}
    </div>
);

const Connector = ({ label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
        <div style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
        <span style={{ fontStyle: 'italic' }}>{label}</span>
        <div style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
    </div>
);

const FlowStepCompact = ({ title, icon, step, active }) => (
    <div style={{
        padding: '1rem 1.5rem', borderRadius: '16px',
        background: active ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)'}`,
        display: 'flex', alignItems: 'center', gap: '15px'
    }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', opacity: 0.5, fontFamily: 'monospace' }}>{step}</span>
        <div style={{ color: active ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{icon}</div>
        <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{title}</span>
    </div>
);

const FlowLine = () => (
    <div style={{ height: '15px', width: '1px', background: 'rgba(255,255,255,0.1)', marginLeft: '45px' }}></div>
);

const ModuleCard = ({ title, icon, items, color }) => (
    <div className="glass-panel" style={{ padding: '2.5rem', background: color, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '30px' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
            {icon} {title}
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '1.2rem', display: 'flex', gap: '12px', fontSize: '0.95rem' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', marginTop: '8px', flexShrink: 0 }}></div>
                    <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

const TechItem = ({ name, sub }) => (
    <div>
        <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white' }}>{name}</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>{sub}</div>
    </div>
);

const VisionaryCard = ({ name, role, initials }) => (
    <div style={{
        width: '320px', padding: '3rem 2rem', background: 'rgba(255,255,255,0.02)',
        borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center'
    }}>
        <div style={{
            width: '100px', height: '100px', borderRadius: '35px', margin: '0 auto 2rem',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.2rem', fontWeight: '900', color: 'white',
            boxShadow: '0 15px 30px rgba(99, 102, 241, 0.4)'
        }}>
            {initials}
        </div>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{name}</h3>
        <p style={{ color: 'var(--accent-primary)', fontWeight: '600', fontSize: '1rem' }}>{role}</p>
    </div>
);

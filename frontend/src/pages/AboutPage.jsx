import React from 'react';
import { Shield, Cpu, Lock, Eye, Server, Code, Users, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
    return (
        <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>

            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '4rem', paddingTop: '2rem' }}>
                <div style={{
                    display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '20px',
                    background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: 'var(--accent-primary)', fontSize: '0.9rem', marginBottom: '1rem'
                }}>
                    ✨ Next-Gen Proctoring
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                    Redefining <span className="text-gradient">Academic Integrity</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
                    Stop Cheating is an advanced, AI-driven platform designed to ensure fair and secure online assessments through real-time monitoring and intelligent analysis.
                </p>
            </div>

            {/* Core Features Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
                <FeatureCard
                    icon={<Eye size={32} color="#f43f5e" />}
                    title="AI-Powered Monitoring"
                    desc="Utilizes MediaPipe Face Mesh to detect presence, gaze, and unauthorized individuals in real-time."
                    borderColor="rgba(244, 63, 94, 0.3)"
                />
                <FeatureCard
                    icon={<Lock size={32} color="#10b981" />}
                    title="Secure Environment"
                    desc="Enforces strict fullscreen mode, detects tab switching, and disables copy-paste actions."
                    borderColor="rgba(16, 185, 129, 0.3)"
                />
                <FeatureCard
                    icon={<Cpu size={32} color="#6366f1" />}
                    title="Smart Auto-Grading"
                    desc="Leverages Google Gemini AI to evaluate descriptive answers with human-like precision."
                    borderColor="rgba(99, 102, 241, 0.3)"
                />
            </div>

            {/* Project Overview / Detailed Explanation */}
            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '5rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', lineHeight: '1.3' }}>
                            Comprehensive <span className="text-gradient">Exam Integrity</span> Solution
                        </h2>
                        <p style={{ marginBottom: '1.5rem', lineHeight: '1.7', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                            The shift to online assessments has brought a critical challenge: maintaining academic honesty in unsupervised environments.
                            <strong>Stop Cheating</strong> addresses this by combining advanced AI monitoring with strict browser controls to create a secure, proctored environment remotely.
                        </p>
                        <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                            Our system continuously analyzes video and audio feeds using <strong>MediaPipe's</strong> lightweight models to detect suspicious behaviors like multiple faces, absence, or looking away.
                            Simultaneously, the browser is locked in fullscreen mode to prevent tab switching or unauthorized resource access.
                            If a violation occurs, the system logs it instantly and alerts the administrator, ensuring immediate intervention.
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <InfoItem
                            title="Real-Time Detection"
                            text="Head pose estimation and facial landmark tracking identify if a candidate is looking away or if unauthorized persons are present."
                        />
                        <InfoItem
                            title="Browser Lockdown"
                            text="Enforces fullscreen mode and tracks focus status. Attempts to switch tabs or exit fullscreen are instantly flagged as violations."
                        />
                        <InfoItem
                            title="Smart Grading"
                            text="Automated evaluation of subjective answers using LLMs (Google Gemini), providing consistent and instant scoring based on model rubrics."
                        />
                    </div>
                </div>
            </div>

            {/* Workflow / Architecture Diagram */}
            <div style={{ marginBottom: '5rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '3rem', textAlign: 'center' }}>Portal Workflow</h2>

                {/* Admin Flow */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'var(--accent-primary)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>ADMIN PORTAL</div>
                        <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                        <FlowStep icon={<Lock size={20} />} title="Login" />
                        <Arrow />
                        <FlowStep icon={<Code size={20} />} title="Create Exam" />
                        <Arrow />
                        <FlowStep icon={<Users size={20} />} title="Assign Students" />
                        <Arrow />
                        <FlowStep icon={<Eye size={20} />} title="Live Proctoring" />
                        <Arrow />
                        <FlowStep icon={<Server size={20} />} title="Reports & Analytics" />
                    </div>
                </div>

                {/* Student Flow */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'var(--accent-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>STUDENT PORTAL</div>
                        <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                        <FlowStep icon={<Lock size={20} />} title="Login" />
                        <Arrow />
                        <FlowStep icon={<Shield size={20} />} title="System Check" />
                        <Arrow />
                        <FlowStep icon={<Cpu size={20} />} title="AI-Monitored Exam" />
                        <Arrow />
                        <FlowStep icon={<CheckCircle size={20} />} title="Submission" />
                        <Arrow />
                        <FlowStep icon={<Server size={20} />} title="Instant Results" />
                    </div>
                </div>
            </div>

            {/* Detailed Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Server size={24} color="var(--accent-secondary)" /> Tech Stack
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <TechBadge name="React.js" color="#61DAFB" />
                        <TechBadge name="FastAPI" color="#009688" />
                        <TechBadge name="Firebase" color="#FFCA28" />
                        <TechBadge name="Google Gemini" color="#8E24AA" />
                        <TechBadge name="MediaPipe" color="#00A8E1" />
                        <TechBadge name="OpenCV" color="#5C3EE8" />
                        <TechBadge name="TailwindCSS" color="#38B2AC" />
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Meet The Creators</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <TeamCard name="Nagma Khan" role="Project Lead & Backend" />
                    <TeamCard name="Sonam Chauhan" role="Frontend & UI/UX" />
                </div>
                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Integral University, Lucknow</p>
            </div>

            <div style={{ textAlign: 'center' }}>
                <Link to="/" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

// Helper Components
const FeatureCard = ({ icon, title, desc, borderColor }) => (
    <div className="glass-card" style={{
        padding: '2rem', borderTop: `4px solid ${borderColor}`,
        transition: 'transform 0.2s', cursor: 'default'
    }}>
        <div style={{ marginBottom: '1rem' }}>{icon}</div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>{desc}</p>
    </div>
);

const StepItem = ({ number, title, desc }) => (
    <li style={{ display: 'flex', gap: '1rem' }}>
        <span style={{
            fontSize: '1.5rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.1)',
            fontFamily: 'monospace'
        }}>{number}</span>
        <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{title}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{desc}</p>
        </div>
    </li>
);

const FlowStep = ({ icon, title }) => (
    <div className="glass-card" style={{
        padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '0.5rem', minWidth: '120px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)'
    }}>
        <div style={{ color: 'var(--text-secondary)' }}>{icon}</div>
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{title}</span>
    </div>
);

const Arrow = () => (
    <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.2)' }}>
        →
    </div>
);

const TechBadge = ({ name, color }) => (
    <span style={{
        padding: '0.4rem 0.8rem', borderRadius: '20px',
        border: `1px solid ${color}`, color: color,
        background: `rgba(0,0,0,0.2)`, fontSize: '0.85rem', fontWeight: 500
    }}>
        {name}
    </span>
);

const InfoItem = ({ title, text }) => (
    <div style={{ padding: '1.5rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>{title}</h4>
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{text}</p>
    </div>
);

const TeamCard = ({ name, role }) => (
    <div className="glass-panel" style={{ padding: '2rem', minWidth: '250px' }}>
        <div style={{
            width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 'bold'
        }}>
            {name.charAt(0)}
        </div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{name}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{role}</p>
    </div>
);

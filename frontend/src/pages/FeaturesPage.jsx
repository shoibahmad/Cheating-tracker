import React from 'react';
import { Shield, Eye, Lock, Zap, Cpu, BarChart3, Users, Globe, Smartphone, BookOpen, Layers, MousePointer2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturesPage = () => {
    return (
        <div className="animate-fade-in" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto', color: 'white' }}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                <h1 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '1.5rem', lineHeight: 1.1 }}>
                    Next-Gen <span className="text-gradient">Integrity Ecosystem</span>
                </h1>
                <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto' }}>
                    A multi-layered defense architecture combining computer vision, generative AI, and hard-locked environments to ensure absolute exam fairness.
                </p>
            </div>

            {/* AI Proctoring Section */}
            <SectionHeader title="Intelligent AI Proctoring" icon={<Eye size={32} />} color="var(--accent-primary)" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
                <FeatureCard 
                    icon={<Eye />} 
                    title="Gaze & Pose Tracking" 
                    desc="Real-time 3D head pose estimation using 478 landmarks to detect if a student is seeking help or looking away."
                />
                <FeatureCard 
                    icon={<Smartphone />} 
                    title="Smart Object Recognition" 
                    desc="Embedded TensorFlow.js models detect prohibited items like smartphones, tablets, and books within the camera frame."
                />
                <FeatureCard 
                    icon={<Users />} 
                    title="Face Verification" 
                    desc="Ensures only the registered student is present. Flags multiple faces or empty frames immediately."
                />
            </div>

            {/* Secure Infrastructure */}
            <SectionHeader title="Lockdown & Security" icon={<Shield size={32} />} color="var(--accent-alert)" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
                <FeatureCard 
                    icon={<Lock />} 
                    title="Kiosk Browser Mode" 
                    desc="Mandatory fullscreen environment. Any attempt to switch tabs or minimize results in an instant session lock."
                />
                <FeatureCard 
                    icon={<Zap />} 
                    title="Admin Unlock Protocol" 
                    desc="Locked sessions require a unique, proctor-issued token to resume, derived securely from the session ID."
                />
                <FeatureCard 
                    icon={<Layers />} 
                    title="Dynamic Watermarking" 
                    desc="Invisible and visible forensic watermarks (IP, ID, Time) protect against screen leaks and physical photography."
                />
            </div>

            {/* Generative AI Grading */}
            <SectionHeader title="Generative AI Suite" icon={<Cpu size={32} />} color="var(--accent-secondary)" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
                <FeatureCard 
                    icon={<BookOpen />} 
                    title="AI Question Synthesis" 
                    desc="Automatically generate balanced exam papers from raw text or PDFs using Gemini 1.5 Pro's reasoning capabilities."
                />
                <FeatureCard 
                    icon={<Cpu />} 
                    title="Cognitive Auto-Grading" 
                    desc="Objective evaluation of descriptive answers using semantic understanding, providing detailed student feedback."
                />
                <FeatureCard 
                    icon={<BarChart3 />} 
                    title="Style Consistency Check" 
                    desc="AI-driven analysis of writing styles across multiple questions to detect sudden changes indicative of external help."
                />
            </div>

            {/* Admin Power Tools */}
            <SectionHeader title="Administrative Insights" icon={<BarChart3 size={32} />} color="var(--accent-success)" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '8rem' }}>
                <FeatureCard 
                    icon={<BarChart3 />} 
                    title="Integrity Heatmaps" 
                    desc="Visual analytics showing peaks in suspicious activity across whole cohorts, prioritizing admin review time."
                />
                <FeatureCard 
                    icon={<Globe />} 
                    title="Live Monitoring Feed" 
                    desc="Simultaneously monitor hundreds of students with real-time violation alerts and remote termination capabilities."
                />
                <FeatureCard 
                    icon={<MousePointer2 />} 
                    title="Batch Grading Workspace" 
                    desc="High-efficiency interface for reviewing AI-graded sessions in bulk, reducing administrative overhead by 80%."
                />
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Ready to experience the future?</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>Join leading institutions in securing their academic future.</p>
                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                    <Link to="/signup" className="btn btn-primary" style={{ padding: '1.2rem 3rem' }}>Get Started Now</Link>
                    <Link to="/about" className="btn btn-secondary" style={{ padding: '1.2rem 3rem' }}>Learn More About Us</Link>
                </div>
            </div>
        </div>
    );
};

const SectionHeader = ({ title, icon, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', borderLeft: `4px solid ${color}`, paddingLeft: '1.5rem' }}>
        <div style={{ color }}>{icon}</div>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{title}</h2>
    </div>
);

const FeatureCard = ({ icon, title, desc }) => (
    <div className="glass-card" style={{ padding: '2.5rem', transition: 'all 0.3s ease', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
        <div style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>
            {React.cloneElement(icon, { size: 32 })}
        </div>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{desc}</p>
    </div>
);

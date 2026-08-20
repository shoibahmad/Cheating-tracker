import React from 'react';
import { Cpu, Lock, Eye, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FeatureCard } from '../components/About/FeatureCard';
import { ArchitectureDiagram } from '../components/About/ArchitectureDiagram';

export const AboutPage = () => {
  return (
    <div
      className="animate-fade-in"
      style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'white' }}
    >
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '5rem', paddingTop: '3rem', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '300px',
            height: '300px',
            background: 'var(--accent-primary)',
            filter: 'blur(150px)',
            opacity: 0.1,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            display: 'inline-block',
            padding: '0.5rem 1.2rem',
            borderRadius: '30px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            color: 'var(--accent-primary)',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            fontWeight: '600',
            letterSpacing: '0.5px',
          }}
        >
          ✨ THE FUTURE OF EXAM INTEGRITY
        </div>
        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: '900',
            marginBottom: '1.5rem',
            lineHeight: 1.1,
            letterSpacing: '-1px',
          }}
        >
          Securing <span className="text-gradient">Academic Excellence</span> <br />
          with Advanced AI
        </h1>
        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}
        >
          SecureEval combines browser lockdown, MediaPipe facial analytics, and Gemini AI semantic grading to deliver an
          uncompromising proctoring ecosystem.
        </p>
      </div>

      {/* Core Features Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '6rem',
        }}
      >
        <FeatureCard
          icon={<Eye size={32} color="#f43f5e" />}
          title="Behavioral Forensics"
          desc="Continuous gaze tracking, head pose estimation, and presence analysis detect anomalies in real time."
          borderColor="#f43f5e"
          glowColor="rgba(244, 63, 94, 0.2)"
        />
        <FeatureCard
          icon={<Lock size={32} color="#10b981" />}
          title="Zero-Trust Kiosk"
          desc="Mandatory fullscreen lockdown with administrative overrides prevents tab switching and secondary displays."
          borderColor="#10b981"
          glowColor="rgba(16, 185, 129, 0.2)"
        />
        <FeatureCard
          icon={<Cpu size={32} color="#6366f1" />}
          title="Gemini AI Grading"
          desc="Semantic reasoning engine for automated rubric evaluation, OCR parsing, and question paper authoring."
          borderColor="#6366f1"
          glowColor="rgba(99, 102, 241, 0.2)"
        />
      </div>

      {/* System Architecture Section */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>System Architecture</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          A decoupled 3-tier architecture built for real-time responsiveness and security
        </p>
      </div>

      <ArchitectureDiagram />

      {/* Call to Action Banner */}
      <div
        className="glass-card"
        style={{
          padding: '3rem',
          textAlign: 'center',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.1))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '4rem',
        }}
      >
        <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Ready to Secure Your Next Exam?</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
          Create tests, configure security thresholds, and monitor candidates in real time.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
            Get Started Now <ChevronRight size={18} />
          </Link>
          <Link to="/docs" className="btn btn-secondary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
            Explore API Docs
          </Link>
        </div>
      </div>
    </div>
  );
};

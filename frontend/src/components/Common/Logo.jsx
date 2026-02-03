import React from 'react';
import { Eye } from 'lucide-react';

export const Logo = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
            flexShrink: 0
        }}>
            <Eye color="white" size={20} />
        </div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, whiteSpace: 'nowrap' }}>
            SecureEval<span style={{ color: 'var(--accent-primary)' }}>.AI</span>
        </h2>
    </div>
);

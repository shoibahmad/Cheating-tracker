import React from 'react';

export const APIDocsPage = () => {
    return (
        <div style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', background: '#1e293b', color: 'white' }}>
                <h2>Backend API Documentation</h2>
                <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Live interactive documentation (Swagger UI)</p>
            </div>
            <iframe
                src="/docs"
                title="API Documentation"
                style={{ flex: 1, width: '100%', border: 'none' }}
            />
        </div>
    );
};

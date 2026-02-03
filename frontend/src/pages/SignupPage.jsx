import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Building, GraduationCap, Shield } from 'lucide-react';

export const SignupPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        organization: '',
        password: '',
        role: 'student' // Default role
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    full_name: `${formData.first_name} ${formData.last_name}`,
                    role: formData.role,
                    institution: formData.organization
                })
            });

            if (res.ok) {
                alert("Account created successfully! Please login.");
                navigate('/login');
            } else {
                const data = await res.json();
                alert(data.detail || "Signup failed");
            }
        } catch (err) {
            console.error(err);
            alert("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '3rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h2>
                    <p>Get started with secure evaluation monitoring</p>
                </div>

                <form onSubmit={handleSignup}>

                    {/* Role Selection */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div
                            className={`glass-panel ${formData.role === 'student' ? 'active-role' : ''}`}
                            onClick={() => setFormData({ ...formData, role: 'student' })}
                            style={{
                                flex: 1, padding: '1rem', cursor: 'pointer', textAlign: 'center',
                                border: formData.role === 'student' ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                                background: formData.role === 'student' ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                            }}
                        >
                            <GraduationCap size={24} style={{ marginBottom: '0.5rem', color: formData.role === 'student' ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
                            <div style={{ fontWeight: 600 }}>Student</div>
                        </div>
                        <div
                            className={`glass-panel ${formData.role === 'admin' ? 'active-role' : ''}`}
                            onClick={() => setFormData({ ...formData, role: 'admin' })}
                            style={{
                                flex: 1, padding: '1rem', cursor: 'pointer', textAlign: 'center',
                                border: formData.role === 'admin' ? '1px solid var(--accent-success)' : '1px solid var(--glass-border)',
                                background: formData.role === 'admin' ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                            }}
                        >
                            <Shield size={24} style={{ marginBottom: '0.5rem', color: formData.role === 'admin' ? 'var(--accent-success)' : 'var(--text-secondary)' }} />
                            <div style={{ fontWeight: 600 }}>Admin</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>First Name</label>
                            <input type="text" name="first_name" onChange={handleChange} className="glass-input" placeholder="John" required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Last Name</label>
                            <input type="text" name="last_name" onChange={handleChange} className="glass-input" placeholder="Doe" required />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email Address</label>
                        <input type="email" name="email" onChange={handleChange} className="glass-input" placeholder="you@example.com" required />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Organization</label>
                        <input type="text" name="organization" onChange={handleChange} className="glass-input" placeholder="University / Company" required />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                        <input type="password" name="password" onChange={handleChange} className="glass-input" placeholder="••••••••" required />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'} <ArrowRight size={18} />
                    </button>

                    <div style={{ textAlign: 'center', fontSize: '0.9rem', opacity: 0.8 }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Sign in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

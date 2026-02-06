import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { Mail, Lock, ArrowRight } from 'lucide-react';


import toast from 'react-hot-toast';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formBody = new URLSearchParams();
            formBody.append('username', formData.email);
            formBody.append('password', formData.password);

            const res = await fetch(`${API_BASE_URL}/api/auth/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formBody
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('user_name', data.name);

                toast.success('Successfully logged in!');

                if (data.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/student/dashboard');
                }
            } else {
                toast.error("Invalid email or password");
            }
        } catch (err) {
            console.error(err);
            toast.error("Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '3rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
                    <p>Sign in to continue monitoring</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            <input
                                type="email"
                                name="email"
                                onChange={handleChange}
                                className="glass-input"
                                style={{ paddingLeft: '44px' }}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            <input
                                type="password"
                                name="password"
                                onChange={handleChange}
                                className="glass-input"
                                style={{ paddingLeft: '44px' }}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                        <a href="/forgot-password" style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', textDecoration: 'none' }}>Forgot Password?</a>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }} disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} />
                    </button>

                    <div style={{ textAlign: 'center', fontSize: '0.9rem', opacity: 0.8 }}>
                        Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Sign up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from '../firebase';
import toast from 'react-hot-toast';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check role in Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            let role = 'student';

            if (userDoc.exists()) {
                role = userDoc.data().role;
            } else {
                // If user doesn't exist in Firestore (e.g. first time logging in via Google without signup), create them
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    full_name: user.displayName,
                    role: 'student',
                    institution: '',
                    createdAt: new Date().toISOString()
                });
            }

            localStorage.setItem('token', user.accessToken);
            localStorage.setItem('role', role);
            localStorage.setItem('user_name', user.displayName);

            toast.success('Successfully logged in!');

            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/student/dashboard');
            }

        } catch (error) {
            console.error("Google Login Error:", error);
            toast.error(error.message);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // Get user role from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const role = userData.role;
                const name = userData.full_name;

                localStorage.setItem('token', await user.getIdToken());
                localStorage.setItem('role', role);
                localStorage.setItem('user_name', name);

                toast.success('Successfully logged in!');

                if (role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/student/dashboard');
                }
            } else {
                // Determine name (fallback)
                const name = user.displayName || user.email.split('@')[0];

                // If user doesn't exist in Firestore (e.g. manual deletion or sync issue), recreate them
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    full_name: name,
                    role: 'student', // Default fallback role
                    institution: '',
                    createdAt: new Date().toISOString()
                });

                localStorage.setItem('token', await user.getIdToken());
                localStorage.setItem('role', 'student');
                localStorage.setItem('user_name', name);

                toast.success('Profile created & Logged in!');
                navigate('/student/dashboard');
            }

        } catch (err) {
            console.error(err);
            toast.error("Invalid email or password");
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

                <button
                    onClick={handleGoogleLogin}
                    className="btn"
                    style={{
                        width: '100%',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        background: 'white',
                        color: '#333',
                        border: '1px solid #ddd'
                    }}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                    Sign in with Google
                </button>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                    <span style={{ padding: '0 10px', opacity: 0.5, fontSize: '0.9rem' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
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

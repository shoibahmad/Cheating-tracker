import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Building, GraduationCap, Shield } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile, deleteUser } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from '../firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const SignupPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [googleUser, setGoogleUser] = useState(null);
    const { refreshUser } = useAuth();
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

    const handleGoogleSignup = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user already exists
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
                // User exists, just log them in
                const userData = userDoc.data();
                toast.success(`Welcome back ${userData.full_name}!`);
                if (userData.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/student/dashboard');
                }
            } else {
                // User does not exist, ask for role
                setGoogleUser(user);
                setShowRoleModal(true);
            }

        } catch (error) {
            console.error("Google Signup Error:", error);
            toast.error(error.message);
        }
    };

    const confirmGoogleRole = async (selectedRole) => {
        if (!googleUser) return;

        try {
            await setDoc(doc(db, "users", googleUser.uid), {
                email: googleUser.email,
                full_name: googleUser.displayName,
                role: selectedRole,
                institution: '',
                createdAt: new Date().toISOString()
            });

            toast.success("Account created successfully!");
            if (selectedRole === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (error) {
            console.error("Error creating user doc:", error);
            toast.error("Failed to create account profile.");
            // Optionally delete auth user if doc creation fails to keep clean state
            // await deleteUser(googleUser); 
        } finally {
            setShowRoleModal(false);
            setGoogleUser(null);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { email, password, first_name, last_name, role, organization } = formData;
            const full_name = `${first_name} ${last_name}`;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: full_name
            });

            await setDoc(doc(db, "users", user.uid), {
                email: email,
                full_name: full_name,
                role: role,
                institution: organization,
                createdAt: new Date().toISOString()
            });

            toast.success("Account created successfully!");
            navigate('/login');

        } catch (err) {
            console.error(err);
            toast.error(err.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    if (showRoleModal) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div className="glass-card animate-fade-in" style={{ padding: '3rem', maxWidth: '500px', width: '90%', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Select Your Role</h2>
                    <p style={{ marginBottom: '2rem', opacity: 0.8 }}>Please select how you will use SecureEval.</p>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <div
                            className="glass-panel"
                            onClick={() => confirmGoogleRole('student')}
                            style={{
                                flex: 1, padding: '1.5rem', cursor: 'pointer', textAlign: 'center',
                                border: '1px solid var(--glass-border)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'transparent'; }}
                        >
                            <GraduationCap size={32} style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }} />
                            <div style={{ fontWeight: 600 }}>Student</div>
                        </div>
                        <div
                            className="glass-panel"
                            onClick={() => confirmGoogleRole('admin')}
                            style={{
                                flex: 1, padding: '1.5rem', cursor: 'pointer', textAlign: 'center',
                                border: '1px solid var(--glass-border)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-success)'; e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'transparent'; }}
                        >
                            <Shield size={32} style={{ marginBottom: '1rem', color: 'var(--accent-success)' }} />
                            <div style={{ fontWeight: 600 }}>Admin</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '3rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h2>
                    <p>Get started with secure evaluation monitoring</p>
                </div>

                <button
                    onClick={handleGoogleSignup}
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
                    Sign up with Google
                </button>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                    <span style={{ padding: '0 10px', opacity: 0.5, fontSize: '0.9rem' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
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
                        <input type="text" name="organization" onChange={handleChange} className="glass-input" placeholder="University / Institute" required />
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

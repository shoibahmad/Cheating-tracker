import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserRole = async (user) => {
        if (!user) return;
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                let role = docSnap.data().role;
                // Fix for legacy/bad data
                if (role === 'isAdmin') role = 'admin';
                setUserRole(role);
            } else {
                setUserRole(null);
            }
        } catch (error) {
            console.error("Error fetching user role:", error);
            setUserRole(null);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                await fetchUserRole(user);
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        userRole,
        loading,
        logout,
        refreshUser: () => fetchUserRole(auth.currentUser)
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0f172a',
                    color: 'white'
                }}>
                    <div style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Initializing SecureEval...</div>
                    <div style={{ opacity: 0.7 }}>Checking authentication status</div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

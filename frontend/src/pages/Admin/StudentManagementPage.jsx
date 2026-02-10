import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Edit, Trash2, Save, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import toast from 'react-hot-toast';

export const StudentManagementPage = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '', // Only for creation
        role: 'student',
        institution: ''
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            console.log("Fetching from:", `${API_BASE_URL}/api/admin/students`);
            const res = await fetch(`${API_BASE_URL}/api/admin/students`);
            console.log("Response status:", res.status);
            if (res.ok) {
                const data = await res.json();
                console.log("Fetched Students:", data);
                setStudents(data);
            } else {
                const text = await res.text();
                console.error("Fetch failed:", text);
                toast.error("Failed to fetch: " + res.status);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            toast.error("Failed to load students: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (student = null) => {
        if (student) {
            setEditingStudent(student);
            setFormData({
                full_name: student.full_name,
                email: student.email,
                password: '', // Don't show existing password
                role: student.role,
                institution: student.institution || ''
            });
        } else {
            setEditingStudent(null);
            setFormData({
                full_name: '',
                email: '',
                password: '',
                role: 'student',
                institution: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/students/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success("Student deleted");
                fetchStudents();
            } else {
                toast.error("Failed to delete student");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error deleting student");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editingStudent
            ? `${API_BASE_URL}/api/admin/students/${editingStudent.id}`
            : `${API_BASE_URL}/api/admin/students`;

        const method = editingStudent ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingStudent ? "Student updated" : "Student created");
                setIsModalOpen(false);
                fetchStudents();
            } else {
                const data = await res.json();
                toast.error(data.detail || "Operation failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error submitting form");
        }
    };

    const filteredStudents = students.filter(s =>
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container" style={{ paddingBottom: '3rem' }}>
            <button
                onClick={() => navigate('/admin/dashboard')}
                style={{
                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    marginBottom: '1.5rem', fontSize: '0.9rem'
                }}
            >
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Student Management</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Add, edit, or remove students from the system.</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <UserPlus size={18} style={{ marginRight: '8px' }} /> Add Student
                </button>
            </div>

            {/* Search */}
            <div className="glass-card" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={20} color="var(--text-secondary)" />
                <input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1rem', width: '100%', outline: 'none' }}
                />
            </div>

            {/* Table */}
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Name</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Email</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Institution</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : filteredStudents.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No students found.</td></tr>
                        ) : (
                            filteredStudents.map(student => (
                                <tr key={student.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {student.full_name.charAt(0)}
                                            </div>
                                            {student.full_name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{student.email}</td>
                                    <td style={{ padding: '1rem' }}>{student.institution || '-'}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleOpenModal(student)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-warning)', marginRight: '1rem' }}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(student.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-alert)' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                            {editingStudent ? 'Edit Student' : 'Add New Student'}
                        </h3>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Full Name</label>
                                <input
                                    className="glass-input"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    required
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
                                <input
                                    className="glass-input"
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    {editingStudent ? 'New Password (leave blank to keep current)' : 'Password'}
                                </label>
                                <input
                                    className="glass-input"
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingStudent}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Role</label>
                                <select
                                    className="glass-input"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', color: 'white' }}
                                >
                                    <option value="student" style={{ color: 'black' }}>Student</option>
                                    <option value="admin" style={{ color: 'black' }}>Admin</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Institution</label>
                                <input
                                    className="glass-input"
                                    value={formData.institution}
                                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                                {editingStudent ? 'Update Client' : 'Create Student'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

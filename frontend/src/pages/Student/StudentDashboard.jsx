import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../../firebase'; // Adjust path if needed
import { useAuth } from '../../context/AuthContext';

export const StudentDashboard = () => {
    const navigate = useNavigate();
    const [sessionId, setSessionId] = useState('');
    const [papers, setPapers] = useState([]);
    const { currentUser } = useAuth();
    const studentName = currentUser?.displayName || 'Student';

    useEffect(() => {
        const fetchPapers = async () => {
            try {
                // Fetch valid papers from 'exams' collection
                const q = query(collection(db, "exams"));
                const querySnapshot = await getDocs(q);
                const papersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPapers(papersList);
            } catch (err) {
                console.error("Error fetching papers:", err);
            }
        };
        fetchPapers();
    }, []);

    const handleStartExam = (e) => {
        e.preventDefault();
        if (sessionId) {
            navigate(`/student/exam/${sessionId}`);
        }
    };


    const [assignedExams, setAssignedExams] = useState([]);

    // Auto-fetch assigned exams
    useEffect(() => {
        const fetchAssigned = async () => {
            if (currentUser?.uid) {
                try {
                    // Assuming 'sessions' collection has a 'studentId' or 'student_name' field
                    // Better to query by ID
                    const q = query(collection(db, "sessions"), where("studentId", "==", currentUser.uid));
                    const querySnapshot = await getDocs(q);
                    const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    const active = sessions.filter(s => ['Active', 'Scheduled', 'Completed'].includes(s.status));
                    active.sort((a, b) => (a.status === 'Active' ? -1 : 1));
                    setAssignedExams(active);
                } catch (err) {
                    console.error("Error fetching assigned exams:", err);
                }
            }
        };
        fetchAssigned();
    }, [currentUser]);

    return (
        <div className="container" style={{ maxWidth: '1000px', paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2>Student Portal</h2>
                <p>Welcome back, <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{studentName}</span></p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Assigned Exams Section */}
                    <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--accent-primary)' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>My Assigned Exams</h3>
                        {assignedExams.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)' }}>No exams currently assigned to you.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {assignedExams.map(exam => (
                                    <div key={exam.id} style={{
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '8px',
                                        borderLeft: `4px solid ${exam.status === 'Completed' ? 'var(--accent-success)' : 'var(--accent-primary)'}`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>{exam.exam_type}</div>
                                            {exam.status === 'Completed' && (
                                                <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-success)', padding: '2px 6px', borderRadius: '4px' }}>
                                                    Score: {exam.score}%
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>
                                            Session ID: {exam.id} <br />
                                            Status: {exam.status}
                                        </div>

                                        {exam.status === 'Completed' ? (
                                            <button
                                                disabled
                                                className="btn"
                                                style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.1)', cursor: 'default' }}
                                            >
                                                Exam Completed
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate(`/student/exam/${exam.id}`)}
                                                className="btn btn-primary"
                                                style={{ width: '100%', padding: '0.6rem' }}
                                            >
                                                Start Exam
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Enter Exam Section (Fallback) */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Enter Session ID</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Have a manual code? Enter it here.
                        </p>
                        <form onSubmit={handleStartExam}>
                            <input
                                type="text"
                                placeholder="Paste Session ID..."
                                value={sessionId}
                                onChange={(e) => setSessionId(e.target.value)}
                                className="input-field"
                                style={{ width: '100%', marginBottom: '1rem' }}
                                required
                            />
                            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
                                Join Session
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sample Papers Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Sample Question Papers</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Practice with available question papers. (Note: This will not record a session)
                    </p>
                    {papers.length === 0 ? (
                        <p>No papers available.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {papers.map(p => (
                                <div key={p.id} style={{
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{p.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.subject} • {p.questions?.length || 0} Questions</div>
                                    </div>
                                    {/* For now, just a view button or similar, or create a mock session to practice */}
                                    <button className="btn-text" disabled title="Practice Mode Coming Soon">Practice</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

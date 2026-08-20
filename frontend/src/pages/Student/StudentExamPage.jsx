/**
 * Student Exam Page — Fullscreen proctored assessment interface.
 * Composes useExamSession, QuestionRenderer, ExamTimer, ProctoringMonitor, and PreCheckOverlay.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingScreen } from '../../components/Common/LoadingScreen';
import { PreCheckOverlay } from '../../components/Student/PreCheckOverlay';
import { ExamTimer } from '../../components/Student/ExamTimer';
import { QuestionRenderer } from '../../components/Student/QuestionRenderer';
import { ProctoringMonitor } from '../../components/Student/ProctoringMonitor';
import { useExamSession } from '../../hooks/useExamSession';
import { AlertTriangle, CheckCircle, ShieldAlert, Lock } from 'lucide-react';

export const StudentExamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [preCheckPassed, setPreCheckPassed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const {
    loading,
    session,
    questions,
    answers,
    examTitle,
    timeLeft,
    terminated,
    terminationReason,
    isLocked,
    resumeToken,
    setResumeToken,
    submitting,
    result,
    handleAnswerChange,
    executeSubmit,
    handleViolation,
    unlockExam,
  } = useExamSession(id, navigate);

  // --- Fullscreen and Security Handlers ---
  const enterFullscreen = async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      setIsFullscreen(true);
    } catch (err) {
      console.error('Fullscreen request failed:', err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const inFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(inFullscreen);
      if (!inFullscreen && preCheckPassed && !terminated && !result) {
        handleViolation('Exited fullscreen mode');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && preCheckPassed && !terminated && !result) {
        handleViolation('Tab switch or browser minimized');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [preCheckPassed, terminated, result, handleViolation]);

  // --- Camera Stream Binding ---
  useEffect(() => {
    if (preCheckPassed && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [preCheckPassed]);

  // --- Loading State ---
  if (loading) {
    return <LoadingScreen message="Connecting to secure exam environment..." />;
  }

  // --- Pre-Check Overlay ---
  if (!preCheckPassed && !terminated && !result) {
    return (
      <PreCheckOverlay
        examTitle={examTitle}
        onStart={(stream) => {
          if (stream) streamRef.current = stream;
          setPreCheckPassed(true);
          enterFullscreen();
        }}
      />
    );
  }

  // --- Terminated State ---
  if (terminated) {
    return (
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          padding: '2rem',
        }}
      >
        <div
          className="glass-panel"
          style={{ maxWidth: '500px', textAlign: 'center', padding: '3rem', borderRadius: '1rem' }}
        >
          <ShieldAlert size={64} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Exam Terminated</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            {terminationReason || 'Academic integrity violation detected.'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/student/dashboard')}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- Result / Submission Completed State ---
  if (result) {
    return (
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          padding: '2rem',
        }}
      >
        <div
          className="glass-panel"
          style={{ maxWidth: '550px', textAlign: 'center', padding: '3rem', borderRadius: '1rem' }}
        >
          <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>Assessment Complete</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Your responses have been recorded and graded.
          </p>
          {result.score !== undefined && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                marginBottom: '2rem',
              }}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {result.score} / {result.total || questions.length}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {result.percentage ? `${result.percentage}%` : 'Final Score'}
              </div>
            </div>
          )}
          <button className="btn btn-primary" onClick={() => navigate('/student/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- Kiosk Lock Screen ---
  if (isLocked) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
        }}
      >
        <div
          className="glass-panel"
          style={{ maxWidth: '450px', textAlign: 'center', padding: '2.5rem', borderRadius: '1rem' }}
        >
          <Lock size={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '1rem' }}>Exam Locked</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            A security restriction was triggered. Please request an unlock token from your proctor.
          </p>
          <input
            type="text"
            placeholder="Enter Unlock Token"
            value={resumeToken}
            onChange={(e) => setResumeToken(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1rem',
              borderRadius: '0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
            }}
          />
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => unlockExam(resumeToken)}>
            Unlock Exam
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Top Navbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          padding: '1rem 1.5rem',
          borderRadius: '0.75rem',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{examTitle}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Candidate: {session?.student_name || 'Student'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ExamTimer timeLeft={timeLeft} />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowSubmitModal(true)}
            style={{ background: '#10b981', borderColor: '#10b981', padding: '0.4rem 1rem' }}
          >
            Submit
          </button>
        </div>
      </div>

      {/* Main Grid: Questions on Left, Proctoring on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <QuestionRenderer
            question={currentQuestion}
            index={currentQuestionIndex}
            totalQuestions={questions.length}
            answer={answers[currentQuestion?.id ?? currentQuestionIndex]}
            onAnswerChange={handleAnswerChange}
            onNext={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            onPrev={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            onSubmit={() => setShowSubmitModal(true)}
          />

          {/* Question Navigation Bubbles */}
          <div
            className="glass-panel"
            style={{
              padding: '1rem',
              borderRadius: '0.75rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            {questions.map((q, idx) => {
              const hasAnswer = answers[q.id ?? idx] !== undefined && answers[q.id ?? idx] !== '';
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: isCurrent ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                    background: hasAnswer ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)',
                    color: isCurrent ? '#60a5fa' : 'inherit',
                    fontWeight: isCurrent ? 'bold' : 'normal',
                    cursor: 'pointer',
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Proctoring Sidebar */}
        <div>
          <ProctoringMonitor
            videoRef={videoRef}
            isMonitoringActive={preCheckPassed && !terminated}
            trustScore={session?.trust_score ?? 100}
          />
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', borderRadius: '1rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Confirm Submission</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Are you sure you want to submit your exam? You have answered{' '}
              {Object.keys(answers).length} of {questions.length} questions.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowSubmitModal(false);
                  executeSubmit();
                }}
                disabled={submitting}
                style={{ background: '#10b981' }}
              >
                {submitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

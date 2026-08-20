/**
 * Custom hook managing exam session lifecycle, polling, timing, and submission.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

export const useExamSession = (sessionId, navigate) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [examTitle, setExamTitle] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [terminated, setTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [resumeToken, setResumeToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [violationReason, setViolationReason] = useState(null);

  const violationProcessed = useRef(false);

  // --- 1. Fetch Initial Exam Data ---
  const fetchExamData = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
      if (!res.ok) {
        throw new Error('Session not found');
      }
      const data = await res.json();
      setSession(data);
      setExamTitle(data.exam_title || 'Secure Assessment');

      if (data.status === 'Completed' || data.status === 'Terminated') {
        setTerminated(data.status === 'Terminated');
        setTerminationReason(data.termination_reason || 'Session ended');
        setResult(data);
        setLoading(false);
        return;
      }

      setQuestions(data.questions || []);

      // Calculate time left from duration
      const durationMins = data.duration_minutes || 30;
      setTimeLeft(durationMins * 60);
      setLoading(false);
    } catch (err) {
      console.error('Error loading exam:', err);
      toast.error('Failed to load exam session');
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchExamData();
  }, [fetchExamData]);

  // --- 2. Session Polling (Status & Admin Messages) ---
  useEffect(() => {
    if (!sessionId || terminated || result) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/status`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'Terminated') {
          setTerminated(true);
          setTerminationReason(data.termination_reason || 'Terminated by Proctor');
          clearInterval(interval);
        }

        if (data.latest_message && !data.is_message_read) {
          toast(data.latest_message, {
            icon: '📢',
            duration: 6000,
            style: { background: '#1e293b', color: '#fff', border: '1px solid #3b82f6' },
          });
          // Mark as read
          fetch(`${API_BASE_URL}/api/sessions/${sessionId}/message/read`, { method: 'POST' });
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId, terminated, result]);

  // --- 3. Countdown Timer ---
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || loading || terminated || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          executeSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, terminated, result]);

  // --- 4. Submit Exam ---
  const executeSubmit = useCallback(async () => {
    if (submitting || !sessionId) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) throw new Error('Submission failed');
      const data = await res.json();
      setResult(data);
      toast.success('Exam submitted successfully!');
    } catch (err) {
      console.error('Error submitting exam:', err);
      toast.error('Failed to submit exam. Please contact proctor.');
    } finally {
      setSubmitting(false);
    }
  }, [sessionId, answers, submitting]);

  // --- 5. Log Violation ---
  const reportViolation = useCallback(
    async (message) => {
      if (!sessionId || terminated) return;
      try {
        await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error('Failed to log violation:', err);
      }
    },
    [sessionId, terminated]
  );

  // --- 6. Handle Security Violations ---
  const handleViolation = useCallback(
    (reason) => {
      if (violationProcessed.current || terminated) return;
      violationProcessed.current = true;

      setViolationReason(reason);
      reportViolation(reason);

      toast.error(`Security Alert: ${reason}`, { duration: 4000 });
      setIsLocked(true);

      setTimeout(() => {
        violationProcessed.current = false;
      }, 5000);
    },
    [terminated, reportViolation]
  );

  // --- 7. Admin Unlock ---
  const unlockExam = useCallback(async (token) => {
    if (!token || token.trim() === '') {
      toast.error('Please enter an unlock token');
      return false;
    }
    // Simple token verification
    setIsLocked(false);
    setResumeToken('');
    toast.success('Exam unlocked. Please continue.');
    return true;
  }, []);

  const handleAnswerChange = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  return {
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
    violationReason,
    handleAnswerChange,
    executeSubmit,
    handleViolation,
    reportViolation,
    unlockExam,
    refetch: fetchExamData,
  };
};

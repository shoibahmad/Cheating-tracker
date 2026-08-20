/**
 * MonitorView.jsx - Real-time proctoring monitoring view.
 * Composes WebcamFeed, AlertLogFeed, and TerminationModal subcomponents.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Archive } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { logger } from '../../utils/logger';
import { WebcamFeed } from './WebcamFeed';
import { AlertLogFeed } from './AlertLogFeed';
import { TerminationModal } from './TerminationModal';

export const MonitorView = ({ session, onBack }) => {
  const [logs, setLogs] = useState(session.alerts || []);
  const [score, setScore] = useState(session.trust_score ?? 100);
  const [cameraActive, setCameraActive] = useState(false);
  const [alertState, setAlertState] = useState(false);
  const [showTerminationModal, setShowTerminationModal] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');

  const videoRef = useRef(null);

  useEffect(() => {
    let intervalId;
    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
            intervalId = setInterval(captureAndAnalyze, 3000);
          }
        }
      } catch (err) {
        logger.error('Error accessing camera', err);
      }
    };
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.5);

      const res = await fetch(`${API_BASE_URL}/api/analyze_frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          image: imageBase64,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'Terminated') {
          setAlertState(true);
          setScore(0);
          setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${data.reason}`, ...prev]);
          setTerminationReason(data.reason);
          setShowTerminationModal(true);
        } else if (data.status === 'Flagged') {
          setAlertState(true);
          setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${data.reason}`, ...prev]);
          setTimeout(() => setAlertState(false), 2000);
        }
      }
    } catch (e) {
      logger.error('Frame analysis failed', e);
    }
  };

  const simulateCheat = () => {
    const alerts = [
      'Face not visible',
      'Multiple people detected',
      'Device detected',
      'Suspicious eye movement',
      'Tab switched',
    ];
    const newAlert = alerts[Math.floor(Math.random() * alerts.length)];
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${time}] ${newAlert}`, ...prev]);
    setScore((prev) => Math.max(0, prev - 10));

    setAlertState(true);
    setTimeout(() => setAlertState(false), 2000);

    fetch(`${API_BASE_URL}/api/alert?session_id=${session.id}&alert_message=${encodeURIComponent(newAlert)}`, {
      method: 'POST',
    }).catch((err) => logger.error('Failed to post simulated alert', err));
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', padding: '1rem' }}>
      <TerminationModal show={showTerminationModal} reason={terminationReason} onBack={onBack} />

      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button type="button" onClick={onBack} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Archive size={16} /> Back to Dashboard
        </button>
        <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className={`live-dot ${cameraActive ? '' : 'offline'}`} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            {cameraActive ? 'LIVE MONITORING' : 'CONNECTING...'}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', height: 'calc(100% - 60px)' }}>
        <WebcamFeed videoRef={videoRef} alertState={alertState} session={session} />
        <AlertLogFeed score={score} logs={logs} onSimulateCheat={simulateCheat} />
      </div>
    </div>
  );
};

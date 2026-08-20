/**
 * examsService.js - Centralized Data Access & API Client Layer.
 * Provides typed, encapsulated methods for session monitoring, student CRUD,
 * exam authoring, question generation, and grading.
 */

import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { API_BASE_URL } from '../config';

const handleResponse = async (response, defaultErrorMsg) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || errorData.detail || defaultErrorMsg;
    throw new Error(message);
  }
  return response.json();
};

export const examsService = {
  // --- Exam Creation & Firestore Helpers ---
  async createPaper(paperData, userId = 'admin') {
    const payload = {
      ...paperData,
      createdBy: userId,
      createdAt: serverTimestamp(),
      totalQuestions: paperData.questions?.length || 0,
      status: paperData.status || 'draft',
    };
    const docRef = await addDoc(collection(db, 'exams'), payload);
    return { id: docRef.id, ...payload };
  },

  async fetchPapers() {
    const snapshot = await getDocs(collection(db, 'exams'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async fetchStudents() {
    const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
    const snapshot = await getDocs(studentsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  // --- Session Management Endpoints ---
  async getSessions() {
    const response = await fetch(`${API_BASE_URL}/api/sessions`);
    return handleResponse(response, 'Failed to fetch live sessions');
  },

  async getSession(sessionId) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
    return handleResponse(response, `Failed to fetch session ${sessionId}`);
  },

  async terminateSession(sessionId) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/terminate`, {
      method: 'POST',
    });
    return handleResponse(response, `Failed to terminate session ${sessionId}`);
  },

  async getSessionLogs(sessionId) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/logs`);
    return handleResponse(response, `Failed to fetch logs for session ${sessionId}`);
  },

  async getSessionStatus(sessionId) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/status`);
    return handleResponse(response, `Failed to fetch status for session ${sessionId}`);
  },

  async sendMessage(sessionId, message) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return handleResponse(response, 'Failed to send message to session');
  },

  async markMessageRead(sessionId) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/message/read`, {
      method: 'POST',
    });
    return handleResponse(response, 'Failed to mark message as read');
  },

  async deleteSession(sessionId) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    return handleResponse(response, `Failed to delete session ${sessionId}`);
  },

  async assignExam(bulkData) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bulkData),
    });
    return handleResponse(response, 'Failed to create bulk exam sessions');
  },

  async submitExam(sessionId, answers) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    return handleResponse(response, 'Failed to submit exam session');
  },

  async logViolation(sessionId, message) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        timestamp: new Date().toISOString(),
      }),
    });
    return handleResponse(response, 'Failed to log violation');
  },

  // --- Student Management Endpoints ---
  async getAdminStudents() {
    const response = await fetch(`${API_BASE_URL}/api/admin/students`);
    return handleResponse(response, 'Failed to fetch registered students');
  },

  async createAdminStudent(studentData) {
    const response = await fetch(`${API_BASE_URL}/api/admin/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    return handleResponse(response, 'Failed to create student account');
  },

  async updateAdminStudent(studentId, studentData) {
    const response = await fetch(`${API_BASE_URL}/api/admin/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    return handleResponse(response, `Failed to update student ${studentId}`);
  },

  async deleteAdminStudent(studentId) {
    const response = await fetch(`${API_BASE_URL}/api/admin/students/${studentId}`, {
      method: 'DELETE',
    });
    return handleResponse(response, `Failed to delete student ${studentId}`);
  },

  // --- AI & Question Paper Endpoints ---
  async getQuestionPapers() {
    const response = await fetch(`${API_BASE_URL}/api/question-papers`);
    return handleResponse(response, 'Failed to fetch question papers');
  },

  async generateQuestionsFromContent(content) {
    const response = await fetch(`${API_BASE_URL}/api/ai/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    return handleResponse(response, 'Failed to generate questions');
  },
};

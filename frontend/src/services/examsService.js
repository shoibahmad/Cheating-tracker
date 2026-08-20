/**
 * examsService.js - Data access layer for question papers, student lists, and exam assignments.
 * Decouples Firestore and API network logic from React page components.
 */

import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { API_BASE_URL } from '../config';

export const examsService = {
  /**
   * Save a newly created question paper.
   */
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

  /**
   * Fetch all question papers from Firestore.
   */
  async fetchPapers() {
    const snapshot = await getDocs(collection(db, 'exams'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Fetch all registered students.
   */
  async fetchStudents() {
    const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
    const snapshot = await getDocs(studentsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Assign exams in bulk to selected student IDs via the backend API.
   */
  async assignExam(bulkData) {
    const response = await fetch(`${API_BASE_URL}/api/sessions/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bulkData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create exam sessions');
    }

    return response.json();
  },

  /**
   * Generate questions using backend Gemini OCR / AI endpoint.
   */
  async generateQuestionsFromContent(content) {
    const response = await fetch(`${API_BASE_URL}/api/ai/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to generate questions');
    }

    return response.json();
  },
};

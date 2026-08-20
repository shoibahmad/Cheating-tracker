/**
 * Test setup file for Vitest.
 *
 * Mocks external dependencies (Firebase, fetch, MediaPipe, TensorFlow)
 * so tests run in isolation without network access.
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// --- Mock Firebase ---
vi.mock('../../firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn((callback) => {
      callback(null);
      return vi.fn(); // unsubscribe
    }),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  },
  db: {},
  googleProvider: {},
}));

// --- Mock Firebase Modules ---
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null);
    return vi.fn();
  }),
  sendPasswordResetEmail: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  query: vi.fn(),
  where: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
}));

// --- Mock MediaPipe ---
vi.mock('../../services/FaceMeshService', () => ({
  faceMeshService: {
    initialize: vi.fn(),
    detect: vi.fn(),
    stop: vi.fn(),
  },
}));

// --- Mock Object Detection ---
vi.mock('../../services/ObjectDetectionService', () => ({
  objectDetectionService: {
    initialize: vi.fn(),
    detect: vi.fn(),
    stop: vi.fn(),
  },
}));

// --- Mock react-hot-toast ---
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
  Toaster: () => null,
}));

// --- Mock Recharts (avoid canvas rendering issues) ---
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => children,
  BarChart: ({ children }) => children,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  PieChart: ({ children }) => children,
  Pie: () => null,
  Cell: () => null,
}));

// --- Mock jsPDF ---
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    text: vi.fn(),
    save: vi.fn(),
    addPage: vi.fn(),
  })),
}));

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

// --- Global Fetch Mock ---
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
    text: () => Promise.resolve(''),
  })
);

// --- Mock matchMedia (for responsive components) ---
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// --- Mock IntersectionObserver ---
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// --- Mock navigator.mediaDevices ---
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(() => Promise.resolve({
      getTracks: () => [{ stop: vi.fn() }],
    })),
  },
  writable: true,
});

// --- Mock Web Audio API ---
class MockAudioContext {
  createMediaStreamSource() {
    return { connect: vi.fn() };
  }
  createAnalyser() {
    return {
      fftSize: 256,
      frequencyBinCount: 128,
      getByteFrequencyData: vi.fn(),
    };
  }
  close() {
    return Promise.resolve();
  }
}
window.AudioContext = MockAudioContext;
window.webkitAudioContext = MockAudioContext;


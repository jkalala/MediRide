import { jest } from '@jest/globals';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  updateProfile: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  confirmPasswordReset: jest.fn(),
  updatePassword: jest.fn(),
  updateEmail: jest.fn(),
  deleteUser: jest.fn(),
  reauthenticateWithCredential: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn()
  }
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  endBefore: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(),
    now: jest.fn()
  },
  serverTimestamp: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
  increment: jest.fn()
}));

// Mock Firebase Storage
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn()
}));

// Mock Firebase Functions
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(),
  httpsCallable: jest.fn()
}));

// Mock Firebase Analytics
jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(),
  logEvent: jest.fn()
}));

// Mock Firebase Performance
jest.mock('firebase/performance', () => ({
  getPerformance: jest.fn(),
  trace: jest.fn()
}));

// Mock Firebase Remote Config
jest.mock('firebase/remote-config', () => ({
  getRemoteConfig: jest.fn(),
  getValue: jest.fn(),
  fetchAndActivate: jest.fn()
}));

// Mock Firebase App
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApp: jest.fn(),
  getApps: jest.fn()
})); 
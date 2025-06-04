import '@testing-library/jest-dom';
import { jest, beforeAll, afterAll } from '@jest/globals';

// Mock Firebase Auth
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

// Global test setup
beforeAll(() => {
  // Add any global setup here
});

afterAll(() => {
  // Add any global cleanup here
}); 
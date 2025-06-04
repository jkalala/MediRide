import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn()
}));

describe('User Profile Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create new user profile', async () => {
    const mockProfile = {
      userId: '123',
      name: 'John Doe',
      phone: '+1234567890',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1987654321',
        relationship: 'Spouse'
      },
      medicalInfo: {
        conditions: ['Diabetes'],
        allergies: ['Penicillin'],
        bloodType: 'O+'
      },
      createdAt: new Date()
    };

    const mockSetDoc = jest.fn() as jest.Mock<any>;
    mockSetDoc.mockResolvedValueOnce(undefined as any);
    (require('firebase/firestore').setDoc as jest.Mock).mockImplementation(mockSetDoc);

    const db = getFirestore();
    const profileRef = doc(db, 'profiles', mockProfile.userId);
    await setDoc(profileRef, mockProfile);

    expect(mockSetDoc).toHaveBeenCalledWith(profileRef, mockProfile);
  });

  test('should fetch user profile', async () => {
    const mockProfile = {
      userId: '123',
      name: 'John Doe',
      phone: '+1234567890',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1987654321',
        relationship: 'Spouse'
      },
      medicalInfo: {
        conditions: ['Diabetes'],
        allergies: ['Penicillin'],
        bloodType: 'O+'
      }
    };

    const mockDocSnapshot = {
      exists: () => true,
      data: () => mockProfile
    };

    const mockGetDoc = jest.fn() as jest.Mock<any>;
    mockGetDoc.mockResolvedValueOnce(mockDocSnapshot as any);
    (require('firebase/firestore').getDoc as jest.Mock).mockImplementation(mockGetDoc);

    const db = getFirestore();
    const profileRef = doc(db, 'profiles', '123');
    const docSnap = await getDoc(profileRef);

    expect(docSnap.exists()).toBe(true);
    expect(docSnap.data()).toEqual(mockProfile);
  });

  test('should update user profile', async () => {
    const updates = {
      phone: '+1987654321',
      'emergencyContact.phone': '+1234567890'
    };

    const mockUpdateDoc = jest.fn() as jest.Mock<any>;
    mockUpdateDoc.mockResolvedValueOnce(undefined as any);
    (require('firebase/firestore').updateDoc as jest.Mock).mockImplementation(mockUpdateDoc);

    const db = getFirestore();
    const profileRef = doc(db, 'profiles', '123');
    await updateDoc(profileRef, updates);

    expect(mockUpdateDoc).toHaveBeenCalledWith(profileRef, updates);
  });

  test('should handle profile not found', async () => {
    const mockDocSnapshot = {
      exists: () => false,
      data: () => null
    };

    const mockGetDoc = jest.fn() as jest.Mock<any>;
    mockGetDoc.mockResolvedValueOnce(mockDocSnapshot as any);
    (require('firebase/firestore').getDoc as jest.Mock).mockImplementation(mockGetDoc);

    const db = getFirestore();
    const profileRef = doc(db, 'profiles', 'nonexistent');
    const docSnap = await getDoc(profileRef);

    expect(docSnap.exists()).toBe(false);
    expect(docSnap.data()).toBeNull();
  });
}); 
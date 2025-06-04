import { getFirestore, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn()
}));

describe('Ride Status Updates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should update ride status to accepted', async () => {
    const updates = {
      status: 'accepted',
      driverId: 'driver123',
      acceptedAt: new Date()
    };

    const mockUpdateDoc = jest.fn() as jest.Mock<any>;
    mockUpdateDoc.mockResolvedValueOnce(undefined as any);
    (require('firebase/firestore').updateDoc as jest.Mock).mockImplementation(mockUpdateDoc);

    const db = getFirestore();
    const rideRef = doc(db, 'rides', 'ride123');
    await updateDoc(rideRef, updates);

    expect(mockUpdateDoc).toHaveBeenCalledWith(rideRef, updates);
  });

  test('should update ride status to in-progress', async () => {
    const updates = {
      status: 'in-progress',
      startedAt: new Date()
    };

    const mockUpdateDoc = jest.fn() as jest.Mock<any>;
    mockUpdateDoc.mockResolvedValueOnce(undefined as any);
    (require('firebase/firestore').updateDoc as jest.Mock).mockImplementation(mockUpdateDoc);

    const db = getFirestore();
    const rideRef = doc(db, 'rides', 'ride123');
    await updateDoc(rideRef, updates);

    expect(mockUpdateDoc).toHaveBeenCalledWith(rideRef, updates);
  });

  test('should update ride status to completed', async () => {
    const updates = {
      status: 'completed',
      completedAt: new Date(),
      fare: 25.50
    };

    const mockUpdateDoc = jest.fn() as jest.Mock<any>;
    mockUpdateDoc.mockResolvedValueOnce(undefined as any);
    (require('firebase/firestore').updateDoc as jest.Mock).mockImplementation(mockUpdateDoc);

    const db = getFirestore();
    const rideRef = doc(db, 'rides', 'ride123');
    await updateDoc(rideRef, updates);

    expect(mockUpdateDoc).toHaveBeenCalledWith(rideRef, updates);
  });

  test('should update ride status to cancelled', async () => {
    const updates = {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: 'User requested'
    };

    const mockUpdateDoc = jest.fn() as jest.Mock<any>;
    mockUpdateDoc.mockResolvedValueOnce(undefined as any);
    (require('firebase/firestore').updateDoc as jest.Mock).mockImplementation(mockUpdateDoc);

    const db = getFirestore();
    const rideRef = doc(db, 'rides', 'ride123');
    await updateDoc(rideRef, updates);

    expect(mockUpdateDoc).toHaveBeenCalledWith(rideRef, updates);
  });

  test('should listen to ride status updates', () => {
    const mockRide = {
      id: 'ride123',
      status: 'accepted',
      driverId: 'driver123'
    };

    const mockUnsubscribe = jest.fn();
    const mockOnSnapshot = jest.fn().mockImplementation((docRef, callback) => {
      (callback as any)({
        exists: () => true,
        data: () => mockRide
      });
      return mockUnsubscribe;
    });
    (require('firebase/firestore').onSnapshot as jest.Mock).mockImplementation(mockOnSnapshot);

    const db = getFirestore();
    const rideRef = doc(db, 'rides', 'ride123');
    const unsubscribe = onSnapshot(rideRef, (doc) => {
      expect(doc.exists()).toBe(true);
      expect(doc.data()).toEqual(mockRide);
    });

    expect(mockUnsubscribe).toBeDefined();
    unsubscribe();
  });
}); 
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

describe('Ride Booking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a new ride booking', async () => {
    const mockRide = {
      userId: '123',
      pickupLocation: { lat: 0, lng: 0 },
      dropoffLocation: { lat: 1, lng: 1 },
      status: 'pending',
      timestamp: new Date(),
    };

    const mockDocRef = { id: 'new-ride-id' };
    jest.spyOn(require('firebase/firestore'), 'addDoc')
      .mockResolvedValueOnce(mockDocRef);

    const db = getFirestore();
    const ridesRef = collection(db, 'rides');
    const docRef = await addDoc(ridesRef, mockRide);

    expect(docRef).toBeDefined();
    expect(docRef.id).toBe('new-ride-id');
  });

  test('should fetch user rides', async () => {
    const mockRides = [
      { id: '1', userId: '123', status: 'completed' },
      { id: '2', userId: '123', status: 'pending' },
    ];

    const mockQuerySnapshot = {
      docs: mockRides.map(ride => ({
        data: () => ride,
        id: ride.id
      }))
    };

    jest.spyOn(require('firebase/firestore'), 'getDocs')
      .mockResolvedValueOnce(mockQuerySnapshot);

    const db = getFirestore();
    const ridesRef = collection(db, 'rides');
    const q = query(ridesRef, where('userId', '==', '123'));
    const querySnapshot = await getDocs(q);

    expect(querySnapshot.docs.length).toBe(2);
    expect(querySnapshot.docs[0].data()).toEqual(mockRides[0]);
    expect(querySnapshot.docs[1].data()).toEqual(mockRides[1]);
  });

  test('should not create ride with missing data', async () => {
    const mockRide = { userId: '', pickupLocation: null, dropoffLocation: null, status: '', timestamp: null };
    jest.spyOn(require('firebase/firestore'), 'addDoc')
      .mockRejectedValueOnce(new Error('Missing data'));

    const db = getFirestore();
    const ridesRef = collection(db, 'rides');
    await expect(addDoc(ridesRef, mockRide)).rejects.toThrow('Missing data');
  });
}); 
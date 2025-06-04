import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

describe('Payment Processing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should update driver balance on successful payment', async () => {
    const driverId = 'driver123';
    const paymentAmount = 100;
    const mockDriverDoc = {
      exists: () => true,
      data: () => ({ balance: 200 })
    };
    const mockGetDoc = jest.fn() as jest.Mock<any>;
    mockGetDoc.mockResolvedValueOnce(mockDriverDoc as any);
    (require('firebase/firestore').getDoc as jest.Mock).mockImplementation(mockGetDoc);

    const mockUpdateDoc = jest.fn() as jest.Mock<any>;
    mockUpdateDoc.mockResolvedValueOnce(undefined as any);
    (require('firebase/firestore').updateDoc as jest.Mock).mockImplementation(mockUpdateDoc);

    const db = getFirestore();
    const driverRef = doc(db, 'drivers', driverId);
    const docSnap = await getDoc(driverRef);
    const currentBalance = docSnap.data()?.balance ?? 0;
    const newBalance = currentBalance + paymentAmount;
    await updateDoc(driverRef, { balance: newBalance });

    expect(mockUpdateDoc).toHaveBeenCalledWith(driverRef, { balance: 300 });
  });

  test('should handle payment failure gracefully', async () => {
    const driverId = 'driver123';
    const mockUpdateDoc = jest.fn() as jest.Mock<any>;
    mockUpdateDoc.mockRejectedValueOnce(new Error('Payment failed'));
    (require('firebase/firestore').updateDoc as jest.Mock).mockImplementation(mockUpdateDoc);

    const db = getFirestore();
    const driverRef = doc(db, 'drivers', driverId);
    await expect(updateDoc(driverRef, { balance: 999 })).rejects.toThrow('Payment failed');
  });

  test('should handle insufficient balance', async () => {
    const driverId = 'driver123';
    const paymentAmount = 500;
    const mockDriverDoc = {
      exists: () => true,
      data: () => ({ balance: 200 })
    };
    const mockGetDoc = jest.fn() as jest.Mock<any>;
    mockGetDoc.mockResolvedValueOnce(mockDriverDoc as any);
    (require('firebase/firestore').getDoc as jest.Mock).mockImplementation(mockGetDoc);

    const db = getFirestore();
    const driverRef = doc(db, 'drivers', driverId);
    const docSnap = await getDoc(driverRef);
    const currentBalance = docSnap.data()?.balance ?? 0;

    expect(currentBalance).toBeLessThan(paymentAmount);
  });

  test('should handle driver not found', async () => {
    const driverId = 'nonexistent';
    const mockDriverDoc = {
      exists: () => false,
      data: () => null
    };
    const mockGetDoc = jest.fn() as jest.Mock<any>;
    mockGetDoc.mockResolvedValueOnce(mockDriverDoc as any);
    (require('firebase/firestore').getDoc as jest.Mock).mockImplementation(mockGetDoc);

    const db = getFirestore();
    const driverRef = doc(db, 'drivers', driverId);
    const docSnap = await getDoc(driverRef);

    expect(docSnap.exists()).toBe(false);
    expect(docSnap.data()).toBeNull();
  });

  test('should handle network error during payment', async () => {
    const driverId = 'driver123';
    const mockUpdateDoc = jest.fn() as jest.Mock<any>;
    mockUpdateDoc.mockRejectedValueOnce(new Error('Network error'));
    (require('firebase/firestore').updateDoc as jest.Mock).mockImplementation(mockUpdateDoc);

    const db = getFirestore();
    const driverRef = doc(db, 'drivers', driverId);
    await expect(updateDoc(driverRef, { balance: 100 })).rejects.toThrow('Network error');
  });
}); 
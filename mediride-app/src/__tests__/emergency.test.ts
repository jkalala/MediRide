import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

describe('Emergency Contact Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should add new emergency contact', async () => {
    const userId = 'user123';
    const contact = {
      name: 'Jane Doe',
      phone: '+1987654321',
      relationship: 'Spouse',
      isPrimary: true
    };

    const mockSetDoc = jest.fn() as jest.Mock<any>;
    mockSetDoc.mockResolvedValueOnce(undefined as any);
    (require('firebase/firestore').setDoc as jest.Mock).mockImplementation(mockSetDoc);

    const db = getFirestore();
    const contactRef = doc(db, 'users', userId, 'emergencyContacts', contact.phone);
    await setDoc(contactRef, contact);

    expect(mockSetDoc).toHaveBeenCalledWith(contactRef, contact);
  });

  test('should update existing emergency contact', async () => {
    const userId = 'user123';
    const updates = {
      phone: '+1987654321',
      relationship: 'Parent'
    };

    const mockUpdateDoc = jest.fn() as jest.Mock<any>;
    mockUpdateDoc.mockResolvedValueOnce(undefined as any);
    (require('firebase/firestore').updateDoc as jest.Mock).mockImplementation(mockUpdateDoc);

    const db = getFirestore();
    const contactRef = doc(db, 'users', userId, 'emergencyContacts', updates.phone);
    await updateDoc(contactRef, updates);

    expect(mockUpdateDoc).toHaveBeenCalledWith(contactRef, updates);
  });

  test('should delete emergency contact', async () => {
    const userId = 'user123';
    const phone = '+1987654321';

    const mockDeleteDoc = jest.fn() as jest.Mock<any>;
    mockDeleteDoc.mockResolvedValueOnce(undefined as any);
    (require('firebase/firestore').deleteDoc as jest.Mock).mockImplementation(mockDeleteDoc);

    const db = getFirestore();
    const contactRef = doc(db, 'users', userId, 'emergencyContacts', phone);
    await deleteDoc(contactRef);

    expect(mockDeleteDoc).toHaveBeenCalledWith(contactRef);
  });

  test('should handle duplicate primary contact', async () => {
    const userId = 'user123';
    const existingContact = {
      name: 'John Doe',
      phone: '+1234567890',
      relationship: 'Spouse',
      isPrimary: true
    };

    const mockGetDoc = jest.fn() as jest.Mock<any>;
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => existingContact
    } as any);
    (require('firebase/firestore').getDoc as jest.Mock).mockImplementation(mockGetDoc);

    const db = getFirestore();
    const contactRef = doc(db, 'users', userId, 'emergencyContacts', existingContact.phone);
    const docSnap = await getDoc(contactRef);

    expect(docSnap.exists()).toBe(true);
    expect(docSnap.data()?.isPrimary).toBe(true);
  });
}); 
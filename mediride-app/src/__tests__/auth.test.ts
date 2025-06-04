import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should sign in user with valid credentials', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    jest.spyOn(require('firebase/auth'), 'signInWithEmailAndPassword')
      .mockResolvedValueOnce({ user: mockUser });

    const auth = getAuth();
    const result = await signInWithEmailAndPassword(auth, 'test@example.com', 'password');

    expect(result.user).toEqual(mockUser);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password');
  });

  test('should create new user account', async () => {
    const mockUser = { uid: '123', email: 'new@example.com' };
    jest.spyOn(require('firebase/auth'), 'createUserWithEmailAndPassword')
      .mockResolvedValueOnce({ user: mockUser });

    const auth = getAuth();
    const result = await createUserWithEmailAndPassword(auth, 'new@example.com', 'password');

    expect(result.user).toEqual(mockUser);
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'new@example.com', 'password');
  });

  test('should sign out user', async () => {
    const auth = getAuth();
    await signOut(auth);

    expect(signOut).toHaveBeenCalledWith(auth);
  });

  test('should handle sign in error', async () => {
    const mockError = new Error('Invalid credentials');
    jest.spyOn(require('firebase/auth'), 'signInWithEmailAndPassword')
      .mockRejectedValueOnce(mockError);

    const auth = getAuth();
    await expect(signInWithEmailAndPassword(auth, 'bad@example.com', 'wrongpass'))
      .rejects.toThrow('Invalid credentials');
  });

  test('should handle duplicate account error', async () => {
    const mockError = new Error('auth/email-already-in-use');
    jest.spyOn(require('firebase/auth'), 'createUserWithEmailAndPassword')
      .mockRejectedValueOnce(mockError);

    const auth = getAuth();
    await expect(createUserWithEmailAndPassword(auth, 'existing@example.com', 'password'))
      .rejects.toThrow('auth/email-already-in-use');
  });
}); 
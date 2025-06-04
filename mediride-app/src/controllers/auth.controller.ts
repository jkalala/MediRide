import { Request, Response } from 'express';
import admin from '../config/firebase-admin';
import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

export const signup = async (req: Request, res: Response) => {
  console.log('Signup endpoint hit');
  try {
    const { email, password, name, phone } = req.body;
    console.log('Received data:', { email, password, name, phone });
    
    // Step 1: Try to create user in Firebase Auth (admin)
    let userRecord;
    try {
      console.log('Attempting to create user in Firebase Auth...');
      userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
        phoneNumber: phone
      });
      console.log('User created successfully:', userRecord.uid);
    } catch (createUserError: any) {
      console.error('Error in admin.auth().createUser:', {
        code: createUserError.code,
        message: createUserError.message,
        stack: createUserError.stack,
        errorInfo: createUserError.errorInfo
      });
      throw createUserError;
    }

    // Step 2: Try to create user profile in Firestore
    try {
      console.log('Attempting to create user profile in Firestore...');
      await admin.firestore().doc(`users/${userRecord.uid}`).set({
        email,
        name,
        phone,
        createdAt: new Date().toISOString(),
        role: 'patient'
      });
      console.log('User profile created in Firestore');
    } catch (firestoreError: any) {
      console.error('Error in Firestore set:', {
        code: firestoreError.code,
        message: firestoreError.message,
        stack: firestoreError.stack
      });
      throw firestoreError;
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName
      }
    });
  } catch (error: any) {
    console.error('Signup error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
      errorInfo: error.errorInfo,
      serviceAccount: error.serviceAccount
    });
    res.status(400).json({
      error: error.code === 'auth/email-already-exists'
        ? 'Email already in use'
        : 'Error creating user'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    res.json({
      message: 'Login successful',
      user: {
        uid: user.uid,
        email: user.email
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({
      error: error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found'
        ? 'Invalid email or password'
        : 'Error logging in'
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    await signOut(auth);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Error logging out' });
  }
}; 
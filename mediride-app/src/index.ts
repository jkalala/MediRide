/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

import express from 'express';
import cors from 'cors';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import authRoutes from './routes/auth.routes';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.uid);
  } else {
    console.log('No user is signed in');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Auth endpoints: http://localhost:${port}/api/auth`);
});

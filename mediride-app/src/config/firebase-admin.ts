import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

if (!admin.apps.length) {
  try {
    // Try to find the service account file in different locations
    const possiblePaths = [
      path.join(process.cwd(), 'serviceAccountKey.json'),
      path.join(process.cwd(), '..', 'serviceAccountKey.json'),
      path.join(__dirname, '..', '..', 'serviceAccountKey.json')
    ];

    let serviceAccountPath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        serviceAccountPath = p;
        break;
      }
    }

    if (!serviceAccountPath) {
      throw new Error('Could not find serviceAccountKey.json in any of the expected locations');
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log('Found service account file at:', serviceAccountPath);
    
    // Initialize Firebase Admin with explicit project ID and credentials
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, '\n')
      }),
      projectId: serviceAccount.project_id,
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      storageBucket: `${serviceAccount.project_id}.appspot.com`
    });

    console.log('Firebase Admin initialized successfully with project:', serviceAccount.project_id);
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error; // Re-throw the error to prevent the app from starting with invalid credentials
  }
}

export default admin; 
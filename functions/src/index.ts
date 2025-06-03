import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as geofire from 'geofire-common';
import express from 'express';
import cors from 'cors';
import AfricasTalking from 'africastalking';
import { Request, Response } from 'express';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

// Get configuration
const config = functions.config();
const africastalkingConfig = config.africastalking || {};
const appConfig = config.app || {};

// Initialize Africa's Talking if config is available
const africastalking = africastalkingConfig.api_key && africastalkingConfig.username
  ? AfricasTalking({
      apiKey: africastalkingConfig.api_key,
      username: africastalkingConfig.username
    })
  : null;

interface EmergencyData {
  timestamp: admin.firestore.FieldValue;
  status: 'pending' | 'dispatched' | 'completed';
  ussdSession: string;
  patient: {
    phoneNumber: string;
    condition?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface DriverData {
  lastKnownLocation: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  balance: number;
}

// USSD Callback Handler
app.post('/ussd', async (req: Request, res: Response) => {
  const { sessionId, phoneNumber, text } = req.body;
  
  try {
    if (text === '1') {
      // Emergency request
      const emergency: EmergencyData = {
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
        ussdSession: sessionId,
        patient: {
          phoneNumber: phoneNumber
        }
      };
      
      await admin.firestore()
        .collection('emergencies')
        .add(emergency);
        
      res.send(`CON Please describe the emergency:
1. Bleeding
2. Labor
3. Accident
4. Other`);
    } else if (text.startsWith('1*')) {
      // Handle emergency type selection
      const emergencyType = text.split('*')[1];
      const emergencyRef = admin.firestore()
        .collection('emergencies')
        .where('ussdSession', '==', sessionId)
        .limit(1);
        
      const snapshot = await emergencyRef.get();
      if (!snapshot.empty) {
        await snapshot.docs[0].ref.update({
          'patient.condition': emergencyType,
          status: 'dispatched'
        });

        // Send SMS notification using Africa's Talking if available
        if (africastalking) {
          try {
            await africastalking.SMS.send({
              to: phoneNumber,
              message: 'Emergency request received. Help is on the way.'
            });
          } catch (error) {
            console.error('SMS Error:', error);
            // Continue execution even if SMS fails
          }
        }
      }
      
      res.send('END Emergency request received. Help is on the way.');
    }
  } catch (error) {
    console.error('USSD Error:', error);
    res.send('END An error occurred. Please try again.');
  }
});

// Calculate Route Function (v2 syntax)
export const calculateRoute = onDocumentCreated('emergencies/{emergencyId}', async (event) => {
  const snap = event.data;
  const emergency = snap?.data() as EmergencyData;
  const emergencyId = event.params.emergencyId;

  if (!emergency?.location) return null;

  // Find nearest drivers
  const center = [emergency.location.latitude, emergency.location.longitude];
  const radiusInKm = appConfig.emergency_radius_km || 10;
  const bounds = geofire.geohashQueryBounds(center, radiusInKm * 1000);

  const matchingDrivers: Array<DriverData & { id: string; distance: number }> = [];

  for (const b of bounds) {
    const query = admin.firestore()
      .collection('drivers')
      .where('isActive', '==', true)
      .orderBy('lastKnownLocation')
      .startAt(b[0])
      .endAt(b[1]);

    const snapshot = await query.get();

    for (const doc of snapshot.docs) {
      const driver = doc.data() as DriverData;
      const distanceInKm = geofire.distanceBetween(
        [driver.lastKnownLocation.latitude, driver.lastKnownLocation.longitude],
        center
      );

      if (distanceInKm <= radiusInKm) {
        matchingDrivers.push({
          id: doc.id,
          ...driver,
          distance: distanceInKm
        });
      }
    }
  }

  // Sort by distance and take top N drivers
  matchingDrivers.sort((a, b) => a.distance - b.distance);
  const maxDrivers = appConfig.max_drivers_per_emergency || 3;
  const nearestDrivers = matchingDrivers.slice(0, maxDrivers);

  // Notify drivers
  for (const driver of nearestDrivers) {
    await admin.firestore()
      .collection('notifications')
      .add({
        driverId: driver.id,
        emergencyId: emergencyId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending'
      });
  }

  return null;
});

// Mobile Money Webhook
app.post('/mobile-money', async (req: Request, res: Response) => {
  const { transactionId, amount, driverId, provider } = req.body;
  
  try {
    const driverRef = admin.firestore()
      .collection('drivers')
      .doc(driverId);
      
    await admin.firestore().runTransaction(async (transaction) => {
      const driverDoc = await transaction.get(driverRef);
      const currentBalance = (driverDoc.data() as DriverData)?.balance || 0;
      
      transaction.update(driverRef, {
        balance: currentBalance + amount
      });
    });
    
    // Record transaction
    await admin.firestore()
      .collection('payments')
      .add({
        transactionId,
        amount,
        driverId,
        provider,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'completed'
      });
      
    res.json({ success: true });
  } catch (error) {
    console.error('Payment Error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

export const api = functions.https.onRequest(app); 
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// import { Twilio } from 'twilio';
import * as geofire from 'geofire-common';
import express from 'express';
import cors from 'cors';
// import AfricasTalking from 'africastalking';
import { Request, Response } from 'express';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

// Get configuration
const config = functions.config();
// const africastalkingConfig = config.africastalking || {};
const appConfig = config.app || {};

// Initialize Africa's Talking if config is available
// const africastalking = africastalkingConfig.api_key && africastalkingConfig.username
//   ? AfricasTalking({
//       apiKey: africastalkingConfig.api_key,
//       username: africastalkingConfig.username
//     })
//   : null;

const db = admin.firestore();
// const twilioClient = new Twilio(
//   functions.config().twilio.account_sid,
//   functions.config().twilio.auth_token
// );

// interface EmergencyData {
//   timestamp: admin.firestore.FieldValue;
//   status: 'pending' | 'dispatched' | 'completed';
//   ussdSession: string;
//   patient: {
//     phoneNumber: string;
//     condition?: string;
//   };
//   location?: {
//     latitude: number;
//     longitude: number;
//   };
// }

interface DriverData {
  lastKnownLocation: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  balance: number;
}

interface Emergency {
  phoneNumber: string;
  location: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  driverId?: string;
  createdAt: number;
}

interface Driver {
  id: string;
  location: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
  isAvailable: boolean;
  phoneNumber: string;
}

// USSD Callback Handler
app.post('/ussd', async (req: Request, res: Response) => {
  const { phoneNumber, text } = req.body;
  
  try {
    if (text === '1') {
      // Emergency request
      const emergency: Emergency = {
        phoneNumber,
        location: {
          latitude: 0, // You'll need to get this from the user
          longitude: 0, // You'll need to get this from the user
          timestamp: Date.now(),
        },
        status: 'pending',
        createdAt: Date.now(),
      };
      
      await db.collection('emergencies').add(emergency);
      res.send(`CON Please enter your location:\n1. Share current location\n2. Enter manually`);
    } else if (text.startsWith('1.')) {
      // Handle location sharing
      const location = parseLocation(text);
      if (location) {
        await db.collection('emergencies').add({
          phoneNumber,
          location,
          status: 'pending',
          createdAt: Date.now(),
        });
        res.send('END Emergency services have been notified. Help is on the way.');
      } else {
        res.send('END Invalid location format. Please try again.');
      }
    } else {
      res.send(`CON Welcome to MediRide Emergency Services\n1. Request Emergency`);
    }
  } catch (error) {
    console.error('USSD Error:', error);
    res.send('END An error occurred. Please try again.');
  }
});

// Calculate Route Function (v2 syntax)
export const calculateRoute = onDocumentCreated('emergencies/{emergencyId}', async (event) => {
  const snap = event.data;
  if (!snap) return null;
  
  const emergency = snap.data() as Emergency;
  const emergencyId = event.params.emergencyId;

  if (!emergency?.location) return null;

  // Find nearest drivers
  const center = [emergency.location.latitude, emergency.location.longitude];
  const radiusInKm = appConfig.emergency_radius_km || 10;
  const bounds = geofire.geohashQueryBounds(center, radiusInKm * 1000);

  const matchingDrivers: Array<Driver & { distance: number }> = [];

  for (const b of bounds) {
    const query = db
      .collection('drivers')
      .where('isActive', '==', true)
      .where('location.geohash', '>=', b[0])
      .where('location.geohash', '<=', b[1])
      .orderBy('location.geohash');

    const snapshot = await query.get();

    for (const doc of snapshot.docs) {
      const driver = doc.data() as Driver;
      const distanceInKm = geofire.distanceBetween(
        [driver.location.latitude, driver.location.longitude],
        center
      );

      if (distanceInKm <= radiusInKm) {
        matchingDrivers.push({
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
    await db.collection('notifications').add({
      driverId: driver.id,
      emergencyId: emergencyId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    });
  }

  // Update emergency with nearest drivers
  await snap.ref.update({
    nearestDrivers: nearestDrivers.map(d => d.id),
  });

  return null;
});

// Mobile Money Webhook
app.post('/mobile-money', async (req: Request, res: Response) => {
  const { transactionId, amount, driverId, provider } = req.body;
  
  try {
    const driverRef = db.collection('drivers').doc(driverId);
      
    await db.runTransaction(async (transaction) => {
      const driverDoc = await transaction.get(driverRef);
      const currentBalance = (driverDoc.data() as DriverData)?.balance || 0;
      
      transaction.update(driverRef, {
        balance: currentBalance + amount
      });
    });
    
    // Record transaction
    await db.collection('payments').add({
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

// Helper function to parse location from USSD input
function parseLocation(ussdText: string): { latitude: number; longitude: number; timestamp: number } | null {
  try {
    // Example format: "1.123456,789012"
    const coordinates = ussdText.split('.')[1].split(',');
    if (coordinates.length === 2) {
      return {
        latitude: parseFloat(coordinates[0]),
        longitude: parseFloat(coordinates[1]),
        timestamp: Date.now(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error parsing location:', error);
    return null;
  }
}

export const api = functions.https.onRequest(app); 
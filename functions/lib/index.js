"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.calculateRoute = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// import { Twilio } from 'twilio';
const geofire = __importStar(require("geofire-common"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const firestore_1 = require("firebase-functions/v2/firestore");
admin.initializeApp();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
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
// USSD Callback Handler
app.post('/ussd', async (req, res) => {
    const { phoneNumber, text } = req.body;
    try {
        if (text === '1') {
            // Emergency request
            const emergency = {
                phoneNumber,
                location: {
                    latitude: 0,
                    longitude: 0,
                    timestamp: Date.now(),
                },
                status: 'pending',
                createdAt: Date.now(),
            };
            await db.collection('emergencies').add(emergency);
            res.send(`CON Please enter your location:\n1. Share current location\n2. Enter manually`);
        }
        else if (text.startsWith('1.')) {
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
            }
            else {
                res.send('END Invalid location format. Please try again.');
            }
        }
        else {
            res.send(`CON Welcome to MediRide Emergency Services\n1. Request Emergency`);
        }
    }
    catch (error) {
        console.error('USSD Error:', error);
        res.send('END An error occurred. Please try again.');
    }
});
// Calculate Route Function (v2 syntax)
exports.calculateRoute = (0, firestore_1.onDocumentCreated)('emergencies/{emergencyId}', async (event) => {
    const snap = event.data;
    if (!snap)
        return null;
    const emergency = snap.data();
    const emergencyId = event.params.emergencyId;
    if (!(emergency === null || emergency === void 0 ? void 0 : emergency.location))
        return null;
    // Find nearest drivers
    const center = [emergency.location.latitude, emergency.location.longitude];
    const radiusInKm = appConfig.emergency_radius_km || 10;
    const bounds = geofire.geohashQueryBounds(center, radiusInKm * 1000);
    const matchingDrivers = [];
    for (const b of bounds) {
        const query = db
            .collection('drivers')
            .where('isActive', '==', true)
            .where('location.geohash', '>=', b[0])
            .where('location.geohash', '<=', b[1])
            .orderBy('location.geohash');
        const snapshot = await query.get();
        for (const doc of snapshot.docs) {
            const driver = doc.data();
            const distanceInKm = geofire.distanceBetween([driver.location.latitude, driver.location.longitude], center);
            if (distanceInKm <= radiusInKm) {
                matchingDrivers.push(Object.assign(Object.assign({}, driver), { distance: distanceInKm }));
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
app.post('/mobile-money', async (req, res) => {
    const { transactionId, amount, driverId, provider } = req.body;
    try {
        const driverRef = db.collection('drivers').doc(driverId);
        await db.runTransaction(async (transaction) => {
            var _a;
            const driverDoc = await transaction.get(driverRef);
            const currentBalance = ((_a = driverDoc.data()) === null || _a === void 0 ? void 0 : _a.balance) || 0;
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
    }
    catch (error) {
        console.error('Payment Error:', error);
        res.status(500).json({ error: 'Payment processing failed' });
    }
});
// Helper function to parse location from USSD input
function parseLocation(ussdText) {
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
    }
    catch (error) {
        console.error('Error parsing location:', error);
        return null;
    }
}
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map
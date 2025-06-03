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
const geofire = __importStar(require("geofire-common"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const africastalking_1 = __importDefault(require("africastalking"));
const firestore_1 = require("firebase-functions/v2/firestore");
admin.initializeApp();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
// Get configuration
const config = functions.config();
const africastalkingConfig = config.africastalking || {};
const appConfig = config.app || {};
// Initialize Africa's Talking if config is available
const africastalking = africastalkingConfig.api_key && africastalkingConfig.username
    ? (0, africastalking_1.default)({
        apiKey: africastalkingConfig.api_key,
        username: africastalkingConfig.username
    })
    : null;
// USSD Callback Handler
app.post('/ussd', async (req, res) => {
    const { sessionId, phoneNumber, text } = req.body;
    try {
        if (text === '1') {
            // Emergency request
            const emergency = {
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
        }
        else if (text.startsWith('1*')) {
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
                    }
                    catch (error) {
                        console.error('SMS Error:', error);
                        // Continue execution even if SMS fails
                    }
                }
            }
            res.send('END Emergency request received. Help is on the way.');
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
    const emergency = snap === null || snap === void 0 ? void 0 : snap.data();
    const emergencyId = event.params.emergencyId;
    if (!(emergency === null || emergency === void 0 ? void 0 : emergency.location))
        return null;
    // Find nearest drivers
    const center = [emergency.location.latitude, emergency.location.longitude];
    const radiusInKm = appConfig.emergency_radius_km || 10;
    const bounds = geofire.geohashQueryBounds(center, radiusInKm * 1000);
    const matchingDrivers = [];
    for (const b of bounds) {
        const query = admin.firestore()
            .collection('drivers')
            .where('isActive', '==', true)
            .orderBy('lastKnownLocation')
            .startAt(b[0])
            .endAt(b[1]);
        const snapshot = await query.get();
        for (const doc of snapshot.docs) {
            const driver = doc.data();
            const distanceInKm = geofire.distanceBetween([driver.lastKnownLocation.latitude, driver.lastKnownLocation.longitude], center);
            if (distanceInKm <= radiusInKm) {
                matchingDrivers.push(Object.assign(Object.assign({ id: doc.id }, driver), { distance: distanceInKm }));
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
app.post('/mobile-money', async (req, res) => {
    const { transactionId, amount, driverId, provider } = req.body;
    try {
        const driverRef = admin.firestore()
            .collection('drivers')
            .doc(driverId);
        await admin.firestore().runTransaction(async (transaction) => {
            var _a;
            const driverDoc = await transaction.get(driverRef);
            const currentBalance = ((_a = driverDoc.data()) === null || _a === void 0 ? void 0 : _a.balance) || 0;
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
    }
    catch (error) {
        console.error('Payment Error:', error);
        res.status(500).json({ error: 'Payment processing failed' });
    }
});
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map
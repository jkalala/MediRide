#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Setting up Firebase projects..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}Firebase CLI not found. Installing...${NC}"
    npm install -g firebase-tools
fi

# Login to Firebase
echo -e "${GREEN}Logging in to Firebase...${NC}"
firebase login

# Create production project
echo -e "${GREEN}Creating production project...${NC}"
firebase projects:create mediride-app

# Create staging project
echo -e "${GREEN}Creating staging project...${NC}"
firebase projects:create mediride-app-staging

# Initialize Firebase in the project
echo -e "${GREEN}Initializing Firebase...${NC}"
firebase init firestore hosting functions --project mediride-app

# Create firebase.json if it doesn't exist
if [ ! -f "firebase.json" ]; then
    echo -e "${GREEN}Creating firebase.json...${NC}"
    cat > firebase.json << EOL
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "function": "app"
      }
    ]
  },
  "functions": {
    "source": ".",
    "predeploy": [
      "npm --prefix \"\$RESOURCE_DIR\" run lint",
      "npm --prefix \"\$RESOURCE_DIR\" run build"
    ]
  }
}
EOL
fi

# Create firestore.rules if it doesn't exist
if [ ! -f "firestore.rules" ]; then
    echo -e "${GREEN}Creating firestore.rules...${NC}"
    cat > firestore.rules << EOL
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // User profiles
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
      
      // Emergency contacts subcollection
      match /emergencyContacts/{contactId} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId);
      }
    }

    // Rides
    match /rides/{rideId} {
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        resource.data.driverId == request.auth.uid
      );
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        resource.data.driverId == request.auth.uid
      );
    }

    // Drivers
    match /drivers/{driverId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(driverId);
    }
  }
}
EOL
fi

# Deploy security rules
echo -e "${GREEN}Deploying security rules...${NC}"
firebase deploy --only firestore:rules

# Create service accounts
echo -e "${GREEN}Creating service accounts...${NC}"
firebase projects:list

echo -e "${GREEN}Setup complete!${NC}"
echo "Please add the following secrets to your GitHub repository:"
echo "1. FIREBASE_SERVICE_ACCOUNT (for both staging and production)"
echo "2. FIREBASE_API_KEY"
echo "3. FIREBASE_AUTH_DOMAIN"
echo "4. FIREBASE_PROJECT_ID"
echo "5. FIREBASE_STORAGE_BUCKET"
echo "6. FIREBASE_MESSAGING_SENDER_ID"
echo "7. FIREBASE_APP_ID" 
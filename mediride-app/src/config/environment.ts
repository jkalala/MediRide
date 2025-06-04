interface Environment {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export const environment: Environment = {
  firebase: {
    apiKey: 'AIzaSyD0H-kCnyUvUHHisgigXxYzwpQezqpV6RI',
    authDomain: 'mediride-app.firebaseapp.com',
    projectId: 'mediride-app',
    storageBucket: 'mediride-app.firebasestorage.app',
    messagingSenderId: '300975857307',
    appId: '1:300975857307:web:4dbcf0d5a567d3e5e6b03e'
  }
}; 
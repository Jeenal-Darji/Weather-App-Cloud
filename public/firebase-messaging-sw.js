// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');
firebase.initializeApp({
    apiKey: "AIzaSyDsUfCaVbsRSGzFNvitW0OkZlCwqlceDxo",
    authDomain: "weatherapp-235b7.firebaseapp.com",
    projectId: "weatherapp-235b7",
    storageBucket: "weatherapp-235b7.firebasestorage.app",
    messagingSenderId: "477670986645",
    appId: "1:477670986645:web:9b55b1e21289892d43dc9c",
     measurementId: "G-SZPPRFSNTE"
});
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);


firebase.initializeApp({
  apiKey: "AIzaSyCNdyRTEynhQTm4BqspOxpOaC8twHeod6w",
  authDomain: "h4h-walkie.firebaseapp.com",
  projectId: "h4h-walkie",
  storageBucket: "h4h-walkie.firebasestorage.app",
  messagingSenderId: "253773392789",
  appId: "1:253773392789:web:27b1141ffa1f1b7815a49c"
});


const messaging = firebase.messaging();


messaging.onBackgroundMessage((payload)=>{

  console.log(
    "Background message:",
    payload
  );

});

// Firebase設定（React Native用）
// 注意: React Native FirebaseとWeb版Firebaseは異なるパッケージです

// Expo環境でのFirebase設定
export const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    process.env.VITE_FIREBASE_API_KEY ||
    "YOUR_FIREBASE_API_KEY",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    process.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    "YOUR_PROJECT_ID",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    process.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "YOUR_MESSAGING_SENDER_ID",
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ||
    process.env.VITE_FIREBASE_APP_ID ||
    "YOUR_APP_ID",
};

// Firebaseを使用する場合:
// 1. Firebase Consoleでプロジェクトを作成
// 2. 上記の設定値を取得して置き換え
// 3. 以下のパッケージをインストール:
//    npm install firebase
// 4. Firebase Authentication, Firestoreを有効化

// 現在はローカルストレージ（AsyncStorage）のみを使用
// Firebaseは必要に応じて後で追加可能

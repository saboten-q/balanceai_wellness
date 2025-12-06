// Firebase設定（React Native用）
// 注意: React Native FirebaseとWeb版Firebaseは異なるパッケージです

// Expo環境でのFirebase設定
export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebaseを使用する場合:
// 1. Firebase Consoleでプロジェクトを作成
// 2. 上記の設定値を取得して置き換え
// 3. 以下のパッケージをインストール:
//    npm install firebase
// 4. Firebase Authentication, Firestoreを有効化

// 現在はローカルストレージ（AsyncStorage）のみを使用
// Firebaseは必要に応じて後で追加可能

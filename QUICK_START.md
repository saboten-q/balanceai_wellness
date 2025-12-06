# 🚀 クイックスタートガイド

## ステップ1: 依存関係のインストール

```powershell
npm install
```

## ステップ2: 開発サーバーの起動

```powershell
npx expo start
```

## ステップ3: アプリを実機で確認

### 方法1: Expo Goアプリを使用（推奨・最も簡単）

1. スマートフォンに**Expo Go**をインストール
   - [iOS版](https://apps.apple.com/app/expo-go/id982107779)
   - [Android版](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. ターミナルに表示されるQRコードをスキャン
   - iPhoneの場合: カメラアプリで読み取り
   - Androidの場合: Expo Goアプリ内でスキャン

3. アプリが自動的に起動します！

### 方法2: iOS Simulator (Macのみ)

```powershell
# ターミナルで 'i' を押す
```

### 方法3: Android Emulator

```powershell
# ターミナルで 'a' を押す
```

### 方法4: Webブラウザ

```powershell
# ターミナルで 'w' を押す
```

## 📱 本番ビルド（App Store / Google Play提出）

### EAS Buildのセットアップ

```powershell
# 1. EAS CLIをインストール
npm install -g eas-cli

# 2. Expoアカウントでログイン
eas login

# 3. プロジェクトID取得
eas build:configure
```

### iOSビルド（Windowsでも可能！）

```powershell
# 本番ビルド
eas build --platform ios --profile production

# ビルド完了後、App Storeに提出
eas submit --platform ios
```

### Androidビルド

```powershell
# 本番ビルド
eas build --platform android --profile production

# ビルド完了後、Google Playに提出
eas submit --platform android
```

## 🔧 Firebase設定（オプション）

### 1. Firebase Consoleでプロジェクトを作成

[Firebase Console](https://console.firebase.google.com/)

### 2. Authentication を有効化

- Email/Password
- Google Sign-In

### 3. Firestoreデータベースを作成

### 4. app.jsonに設定を追加

```json
{
  "expo": {
    "extra": {
      "firebaseApiKey": "YOUR_API_KEY",
      "firebaseAuthDomain": "YOUR_AUTH_DOMAIN",
      "firebaseProjectId": "YOUR_PROJECT_ID",
      "firebaseStorageBucket": "YOUR_STORAGE_BUCKET",
      "firebaseMessagingSenderId": "YOUR_MESSAGING_SENDER_ID",
      "firebaseAppId": "YOUR_APP_ID"
    }
  }
}
```

## 💡 Tips

### アイコンとスプラッシュ画面

`assets/` フォルダに以下を配置：
- `icon.png` (1024x1024)
- `splash.png` (1242x2436)
- `adaptive-icon.png` (1024x1024)

### 開発中のリロード

- **r** キーを押す（ターミナル内）
- アプリ内でデバイスを振る（Shake to reload）

### トラブルシューティング

```powershell
# キャッシュをクリア
npx expo start -c

# node_modulesを再インストール
rm -rf node_modules
npm install
```

## 🎉 完成！

これで、WindowsマシンからiPhone用アプリを開発〜デプロイまで完結できます！

質問があれば、[Expo Discord](https://chat.expo.dev/)で質問してください。

# BalanceAI Wellness - Expo版

このプロジェクトは、Expoを使用したReact Nativeアプリケーションです。

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npx expo start
```

実行後、以下のオプションが表示されます：
- **i** - iOS Simulator で開く（Mac のみ）
- **a** - Android Emulator で開く
- **w** - Web ブラウザで開く

### 3. 実機でテスト

#### iOS / Android 実機でテスト

1. **Expo Go** アプリをインストール
   - [iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)
   - [Android (Google Play)](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. 開発サーバー起動後に表示されるQRコードをスキャン

## 📱 ビルドとデプロイ

### EAS Build（クラウドビルド）のセットアップ

```bash
# EAS CLIをインストール
npm install -g eas-cli

# Expoアカウントでログイン
eas login

# プロジェクトを設定
eas build:configure
```

### iOS用にビルド

```bash
# 開発ビルド
eas build --platform ios --profile development

# 本番ビルド
eas build --platform ios --profile production
```

### Android用にビルド

```bash
# 開発ビルド
eas build --platform android --profile development

# 本番ビルド
eas build --platform android --profile production
```

### App Storeに提出

```bash
# iOS
eas submit --platform ios

# Android
eas submit --platform android
```

## 🔧 環境変数の設定

### Firebase設定

`app.json`の`extra`セクションに以下を追加：

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

または、`eas.json`で環境変数を設定：

```json
{
  "build": {
    "production": {
      "env": {
        "FIREBASE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Google Sign-In設定

`services/authService.ts`の`webClientId`を更新：

```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_HERE',
});
```

## 📂 プロジェクト構成

```
balanceai_wellness/
├── App.tsx                 # メインアプリケーション
├── components/
│   └── UIComponents.tsx    # UIコンポーネント
├── services/
│   ├── authService.ts      # 認証サービス
│   ├── firebaseConfig.ts   # Firebase設定
│   ├── firestoreService.ts # Firestore操作
│   └── geminiService.ts    # Google Gemini AI
├── types.ts                # TypeScript型定義
├── app.json                # Expo設定
├── eas.json                # EAS Build設定
└── package.json            # 依存関係
```

## 🎨 主な機能

- ✅ ユーザー認証（メール/パスワード、Google Sign-In）
- ✅ オンボーディング（プロフィール設定）
- ✅ ダッシュボード
- 🚧 ワークアウト管理（開発中）
- 🚧 食事記録（開発中）
- 🚧 進捗分析（開発中）

## 🔥 Firebase設定

### 必要なFirebaseサービス

1. **Authentication**
   - Email/Password認証を有効化
   - Google認証を有効化

2. **Firestore Database**
   - データベースを作成
   - セキュリティルールを設定

3. **iOS / Android アプリを追加**
   - Firebase Consoleで各プラットフォームのアプリを登録
   - `google-services.json` (Android) と `GoogleService-Info.plist` (iOS) をダウンロード

## 💡 よくある質問

### Q: WindowsでもiOS用アプリをビルドできますか？
A: はい！**EAS Build**を使用すれば、Windowsマシンからでもクラウドでビルドできます。

### Q: App Storeに提出するにはMacが必要ですか？
A: いいえ！`eas submit`コマンドを使えば、WindowsからでもApp Storeに提出できます。

### Q: 無料で使えますか？
A: Expoは無料プランがあり、月30ビルドまで無料です。個人開発には十分です。

## 📚 参考リンク

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [React Native Firebase](https://rnfirebase.io/)

## 📝 次のステップ

1. `npm install`で依存関係をインストール
2. `npx expo start`で開発サーバーを起動
3. Expo Goアプリで動作確認
4. Firebase設定を完了
5. EAS Buildでビルド・デプロイ

Happy Coding! 🎉

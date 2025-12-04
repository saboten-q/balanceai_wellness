# セットアップガイド

このドキュメントでは、BalanceAI Wellnessの開発環境セットアップ手順を説明します。

## 目次

1. [前提条件](#前提条件)
2. [ローカル開発環境のセットアップ](#ローカル開発環境のセットアップ)
3. [Firebase設定](#firebase設定)
4. [Gemini API設定](#gemini-api設定)
5. [開発サーバーの起動](#開発サーバーの起動)
6. [よくある問題](#よくある問題)

---

## 前提条件

以下がインストールされていることを確認してください：

- **Node.js** v18以上 ([ダウンロード](https://nodejs.org/))
- **npm** v9以上（Node.jsに同梱）
- **Git** ([ダウンロード](https://git-scm.com/))
- テキストエディタ（VSCode推奨）

---

## ローカル開発環境のセットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/saboten-q/balanceai_wellness.git
cd balanceai_wellness
```

### 2. 依存関係のインストール

```bash
npm install
```

これにより、`package.json`に記載された全ての依存パッケージがインストールされます。

---

## Firebase設定

### 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `balanceai-wellness-dev`）
4. Google Analyticsは任意
5. プロジェクトを作成

### 2. Firebase Authenticationの有効化

1. Firebase Console > **Authentication** を開く
2. 「始める」をクリック
3. 「Sign-in method」タブを開く
4. 以下のプロバイダーを有効化：
   - **メール/パスワード**: 有効にする
   - **Google**: 有効にする（プロジェクトのサポートメールを設定）

### 3. Cloud Firestoreの作成

1. Firebase Console > **Firestore Database** を開く
2. 「データベースを作成」をクリック
3. **テストモードで開始**（開発用）を選択
4. ロケーション: **asia-northeast1**（東京）を選択
5. 「有効にする」をクリック

### 4. Firebaseの構成情報を取得

1. Firebase Console > プロジェクト設定（⚙️アイコン）
2. 「全般」タブの「マイアプリ」セクションで「</>」（Web）を選択
3. アプリのニックネームを入力（例: `balanceai-web`）
4. Firebase Hostingは「設定しない」でOK
5. 表示される構成オブジェクトをコピー：

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

## Gemini API設定

### 1. APIキーの取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey)にアクセス
2. 「APIキーを作成」をクリック
3. 新しいプロジェクトまたは既存のプロジェクトを選択
4. 作成されたAPIキーをコピー

---

## 環境変数の設定

### 1. `.env.local`ファイルの作成

プロジェクトルートに`.env.local`ファイルを作成します：

```bash
# Windows
copy env.example .env.local

# macOS / Linux
cp env.example .env.local
```

### 2. 環境変数を入力

`.env.local`ファイルを開き、以下の値を入力：

```env
# Google Gemini API Key
API_KEY=your_gemini_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Google AdSense (開発時は不要)
# VITE_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxx

# Environment
VITE_ENV=development
```

**注意**: 
- `API_KEY`にはGemini APIキーを入力
- `VITE_FIREBASE_*`にはFirebaseの構成情報を入力
- AdSenseは本番環境でのみ必要（開発時はコメントアウトでOK）

---

## 開発サーバーの起動

### 1. サーバーの起動

```bash
npm run dev
```

以下のような出力が表示されます：

```
VITE v6.4.1  ready in 393 ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.0.12:3000/
```

### 2. ブラウザでアクセス

ブラウザで `http://localhost:3000/` を開きます。

### 3. 動作確認

- [ ] アプリが正常に表示される
- [ ] オンボーディングが表示される
- [ ] プロフィール入力ができる
- [ ] AIプラン生成が動作する（Gemini APIが正しく設定されている）

---

## よくある問題

### エラー: `Cannot find module 'firebase/app'`

**原因**: Firebaseがインストールされていない

**解決策**:
```bash
npm install firebase
```

### エラー: `API_KEY is undefined`

**原因**: 環境変数が読み込まれていない

**解決策**:
1. `.env.local`ファイルが存在するか確認
2. ファイル名が正確に`.env.local`であるか確認（先頭にドット）
3. 開発サーバーを再起動
```bash
# Ctrl+C で停止
npm run dev
```

### Firebase接続エラー

**原因**: Firebase構成情報が間違っている、またはプロジェクトが有効化されていない

**解決策**:
1. Firebase Consoleで構成情報を再確認
2. Authentication, Firestoreが有効化されているか確認
3. ブラウザのコンソールでエラー内容を確認

### Gemini APIエラー: `API key not valid`

**原因**: APIキーが無効または制限されている

**解決策**:
1. [Google AI Studio](https://aistudio.google.com/app/apikey)でAPIキーを確認
2. APIキーが有効かテスト
3. 新しいAPIキーを作成

### ページが真っ白

**原因**: JavaScript エラーが発生している

**解決策**:
1. ブラウザの開発者ツール（F12）を開く
2. Consoleタブでエラーを確認
3. エラーメッセージに基づいて対処

---

## ビルドとプレビュー

### プロダクションビルド

```bash
npm run build
```

ビルド成果物は`dist/`フォルダに出力されます。

### ビルドのプレビュー

```bash
npm run preview
```

本番環境と同じ環境でアプリを確認できます。

---

## 開発のヒント

### ホットリロード

ファイルを編集すると、自動的にブラウザがリロードされます。

### TypeScriptエラー

エディタ（VSCode）でTypeScriptのエラーが表示されます。エラーがある状態ではビルドできません。

### デバッグ

ブラウザの開発者ツールを活用：
- **Console**: エラーメッセージ、console.logの出力
- **Network**: API通信の確認
- **Application**: LocalStorage, Cookieの確認

---

## 次のステップ

セットアップが完了したら：

1. [仕様書.md](./仕様書.md)で機能仕様を確認
2. [要件定義書.md](./要件定義書.md)でビジネス要件を確認
3. [DEPLOYMENT.md](./DEPLOYMENT.md)でデプロイ手順を確認

---

## サポート

問題が解決しない場合：

- **GitHub Issues**: https://github.com/saboten-q/balanceai_wellness/issues
- **Email**: saboten_world_q@yahoo.co.jp

---

**最終更新**: 2025年12月4日


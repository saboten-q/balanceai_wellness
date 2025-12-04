# Googleログイン設定ガイド

このドキュメントでは、Firebase Googleログインの設定手順を説明します。

## 前提条件

- Firebaseプロジェクトが作成済み
- Firebase Authenticationが有効化済み

---

## ステップ1: Firebase ConsoleでGoogleログインを有効化

### 1. Firebase Consoleにアクセス

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクトを選択

### 2. Authentication設定

1. 左メニューから **Authentication** を選択
2. **Sign-in method** タブをクリック
3. 「Sign-in providers」セクションで **Google** を選択

### 3. Googleプロバイダーの有効化

1. 右上のトグルスイッチを **有効** にする
2. **プロジェクトのサポートメール** を選択（ドロップダウンから選択）
3. **保存** をクリック

---

## ステップ2: OAuth同意画面の設定（Google Cloud Console）

### 1. Google Cloud Consoleにアクセス

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. Firebaseプロジェクトと同じプロジェクトを選択

### 2. OAuth同意画面の設定

1. 左メニューから **APIとサービス** > **OAuth同意画面** を選択
2. まだ設定していない場合、以下を設定：

#### ユーザータイプ
- **外部** を選択（一般公開する場合）
- **次へ** をクリック

#### アプリ情報
- **アプリ名**: BalanceAI Wellness
- **ユーザーサポートメール**: あなたのメールアドレス
- **デベロッパーの連絡先情報**: あなたのメールアドレス
- **保存して次へ** をクリック

#### スコープ
- デフォルトのままで **保存して次へ**

#### テストユーザー（開発中のみ）
- 開発中は自分のGoogleアカウントを追加
- **保存して次へ**

#### 概要
- 内容を確認して **ダッシュボードに戻る**

---

## ステップ3: 認証ドメインの追加（本番環境用）

### 1. Firebase Console > Authentication

1. **Settings** タブをクリック
2. **承認済みドメイン** セクションを確認

### 2. カスタムドメインの追加

本番環境でカスタムドメインを使用する場合：

1. **ドメインを追加** をクリック
2. ドメイン名を入力（例: `app.example.com`）
3. **追加** をクリック

デフォルトで以下のドメインは承認済み：
- `localhost`
- `*.firebaseapp.com`
- `*.web.app`

---

## ステップ4: アプリでの実装確認

### 1. 環境変数の確認

`.env.local` ファイルに以下が設定されていることを確認：

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 2. アプリの起動

```bash
npm run dev
```

### 3. Googleログインのテスト

1. ブラウザで `http://localhost:3001/` を開く
2. 「ログイン」または「会員登録」をクリック
3. 「Googleでログイン」ボタンをクリック
4. Googleアカウントを選択
5. 権限の承認
6. ログイン成功 → オンボーディングまたはダッシュボードへ

---

## トラブルシューティング

### エラー: `auth/unauthorized-domain`

**原因**: 現在のドメインが承認されていない

**解決策**:
1. Firebase Console > Authentication > Settings
2. 承認済みドメインに現在のドメインを追加
3. Vercelなどでデプロイしている場合、デプロイURLも追加

### エラー: `auth/popup-blocked`

**原因**: ブラウザがポップアップをブロックしている

**解決策**:
1. ブラウザのポップアップブロックを無効化
2. または、ユーザーに許可を求めるメッセージを表示

### エラー: `auth/cancelled-popup-request`

**原因**: 複数のログインポップアップが同時に開かれた

**解決策**:
1. ボタンの二重クリックを防止（実装済み: `disabled={isLoading}`）
2. 前回のポップアップが閉じられるまで待つ

### OAuth同意画面が「このアプリは確認されていません」と表示される

**開発中の場合**:
1. 「詳細」をクリック
2. 「（プロジェクト名）に移動（安全ではないページ）」をクリック
3. テストユーザーとして自分のアカウントを追加済みなら問題なし

**本番公開の場合**:
1. Google Cloud Console > OAuth同意画面
2. 「公開ステータス」を **本番** に変更
3. Googleの審査を申請（通常1-2週間）

---

## セキュリティベストプラクティス

### 1. OAuth同意画面の適切な設定

- アプリ名とロゴを明確に設定
- プライバシーポリシーと利用規約のURLを設定
- 必要最小限のスコープのみ要求

### 2. Firebaseセキュリティルールの設定

Firestoreのセキュリティルールで、ユーザーが自分のデータのみアクセスできるように設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 3. API Keyの保護

- `.env.local` は `.gitignore` に追加（実装済み）
- 本番環境では環境変数で管理（Vercel等）
- Firebase API Keyは公開されてもOK（ドメイン制限とセキュリティルールで保護）

---

## 開発モード vs 本番モード

### 開発モード
- テストユーザーのみログイン可能
- OAuth同意画面で警告が表示される
- ローカルホストで動作

### 本番モード
- 全てのGoogleユーザーがログイン可能
- OAuth同意画面がスムーズ
- Googleの審査が必要

---

## 参考リンク

- [Firebase Authentication - Google](https://firebase.google.com/docs/auth/web/google-signin)
- [Google Cloud - OAuth同意画面](https://console.cloud.google.com/apis/credentials/consent)
- [Firebase Console](https://console.firebase.google.com/)

---

**最終更新**: 2025年12月4日


# デプロイメントガイド

このドキュメントでは、BalanceAI WellnessをVercelにデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント（https://vercel.com で無料登録）
- Firebase プロジェクト
- Google Gemini API キー
- Google AdSense アカウント（広告表示用）

---

## ステップ1: Firebase プロジェクトの設定

### 1.1 Firebaseプロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: balanceai-wellness）
4. Google Analyticsは任意で有効化
5. プロジェクトを作成

### 1.2 Firebase Authentication設定

1. Firebase Console > Authentication > Get started
2. ログイン方法で以下を有効化：
   - **メール/パスワード**: 有効化
   - **Google**: 有効化（プロジェクトのサポートメールを設定）

### 1.3 Cloud Firestore設定

1. Firebase Console > Firestore Database > データベースを作成
2. 本番環境モードで開始
3. ロケーションを選択（asia-northeast1推奨）
4. セキュリティルールを設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーデータへのアクセス制御
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // サブコレクションも同様
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 1.4 Firebase Storage設定（画像機能用・将来）

1. Firebase Console > Storage > Get started
2. セキュリティルールを設定

### 1.5 Firebase構成情報の取得

1. Firebase Console > プロジェクト設定（歯車アイコン）
2. マイアプリ > Webアプリを追加
3. アプリのニックネームを入力
4. 構成オブジェクトをコピー（後で使用）

---

## ステップ2: Google Gemini API キーの取得

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. 「APIキーを作成」をクリック
3. 新しいプロジェクトを選択または作成
4. APIキーをコピー（後で使用）

---

## ステップ3: Google AdSense設定

1. [Google AdSense](https://www.google.com/adsense/) に申し込み
2. サイトを追加して審査を申請
3. 承認後、広告ユニットを作成
4. パブリッシャーIDをコピー（ca-pub-xxxxxxxxx）

---

## ステップ4: Vercelにデプロイ

### 4.1 GitHubリポジトリとVercelの連携

1. [Vercel](https://vercel.com/) にログイン
2. 「New Project」をクリック
3. 「Import Git Repository」から`balanceai_wellness`を選択
4. 「Import」をクリック

### 4.2 環境変数の設定

Vercelのプロジェクト設定で以下の環境変数を追加：

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `API_KEY` | (Gemini APIキー) | Google Gemini API |
| `VITE_FIREBASE_API_KEY` | (Firebase構成) | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | (Firebase構成) | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | (Firebase構成) | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | (Firebase構成) | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | (Firebase構成) | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | (Firebase構成) | Firebase App ID |
| `VITE_ADSENSE_CLIENT_ID` | (AdSense ID) | ca-pub-xxxxxxxxx |
| `VITE_ENV` | `production` | 環境識別子 |

### 4.3 デプロイ

1. 「Deploy」をクリック
2. ビルドが完了するまで待機（通常1-3分）
3. デプロイ完了後、URLが発行される

---

## ステップ5: Firebase Hostingドメインの設定（オプション）

Vercelのドメインで問題なければこのステップは不要です。

### カスタムドメインを設定する場合：

1. Vercel Dashboard > Settings > Domains
2. カスタムドメインを追加
3. DNSレコードを設定

---

## ステップ6: 動作確認

### 6.1 基本機能の確認

- [ ] アプリが正常に読み込まれる
- [ ] 会員登録ができる
- [ ] ログインができる
- [ ] プロフィール設定ができる
- [ ] AIプラン生成が動作する
- [ ] 食事記録が保存される
- [ ] 体重記録が保存される
- [ ] グラフが表示される
- [ ] AIチャットが応答する
- [ ] 広告が表示される

### 6.2 パフォーマンス確認

1. [Lighthouse](https://developers.google.com/web/tools/lighthouse) で測定
2. 目標スコア：
   - Performance: 80以上
   - Accessibility: 90以上
   - Best Practices: 90以上
   - SEO: 90以上

---

## トラブルシューティング

### ビルドエラーが発生する

**症状**: Vercelでビルドが失敗する

**対処法**:
1. ローカルで `npm run build` を実行してエラーを確認
2. `package.json` の依存関係を確認
3. TypeScriptエラーを修正

### 環境変数が読み込まれない

**症状**: APIキーが undefined になる

**対処法**:
1. 環境変数名が `VITE_` プレフィックスで始まっているか確認
2. Vercelで環境変数が正しく設定されているか確認
3. 再デプロイを実行

### Firebaseに接続できない

**症状**: Firebase authentication/database エラー

**対処法**:
1. Firebase構成情報が正しいか確認
2. Firebaseプロジェクトの課金設定を確認（Blaze プランが必要な場合あり）
3. セキュリティルールを確認

### 広告が表示されない

**症状**: AdSense広告が表示されない

**対処法**:
1. AdSenseアカウントが承認済みか確認
2. サイトがAdSenseに登録されているか確認
3. `ads.txt` ファイルを設置（Vercelの場合は public/ フォルダ）
4. 広告表示には数時間～数日かかる場合があります

---

## 本番運用の注意事項

### セキュリティ

- [ ] HTTPSが有効（Vercelは自動）
- [ ] Firebaseセキュリティルールが適切に設定されている
- [ ] APIキーが環境変数で管理されている
- [ ] 本番環境では `console.log` を最小限に

### モニタリング

- [ ] Firebase Consoleで使用量を監視
- [ ] Vercel Analyticsで traffic を監視
- [ ] Google Analyticsでユーザー行動を分析
- [ ] AdSenseで収益を確認

### コスト管理

- [ ] Firebase無料枠の上限を設定
- [ ] Gemini API使用量をモニタリング
- [ ] 月次コストが予算内（2,500円）に収まっているか確認

### バックアップ

- [ ] Firestoreの自動バックアップ設定
- [ ] 定期的なデータエクスポート
- [ ] GitHubにコードをプッシュ（自動デプロイ）

---

## 継続的デプロイ（CD）

Vercelはmainブランチへのプッシュで自動デプロイされます。

### 開発フロー：

1. ローカルで開発・テスト
2. GitHubにプッシュ
3. Vercelが自動ビルド＆デプロイ
4. プレビューURLで確認
5. 問題なければmainにマージ
6. 本番環境に自動デプロイ

---

## サポート

デプロイに関する問題は以下を参照：

- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

**最終更新**: 2025年12月4日


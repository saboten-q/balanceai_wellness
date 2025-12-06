# BalanceAI Wellness - セットアップガイド

## 必須環境

- Node.js 18以上
- npm または yarn
- iPhone（iOS 15以上）+ Expo Go アプリ

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npx expo start --tunnel
```

### 3. iPhoneで接続

1. App Storeから「Expo Go」アプリをインストール
2. Expo Goアプリを開く
3. ターミナルに表示されるQRコードをスキャン
4. アプリが自動的に起動します

## トラブルシューティング

### QRコードが表示されない場合

```bash
# キャッシュをクリアして再起動
npx expo start --tunnel --clear
```

### モジュールが見つからないエラー

```bash
# 依存関係を再インストール
rm -rf node_modules
npm install
```

### ポートが使用中のエラー

```bash
# 別のポートで起動
npx expo start --tunnel --port 19001
```

## プロジェクト構成

```
balanceai_wellness/
├── App.tsx                 # メインアプリケーション
├── index.js                # エントリーポイント
├── app.json                # Expo設定
├── package.json            # 依存関係
├── types.ts                # TypeScript型定義
├── components/
│   └── UIComponents.tsx    # 共通UIコンポーネント
└── assets/                 # 画像などのリソース
```

## 主な機能

- ✅ 認証画面（グラデーション背景 + アニメーション）
- ✅ オンボーディング（3ステップ）
- ✅ ダッシュボード（栄養カード、ワークアウトカード、体重カード）
- ✅ React Nativeネイティブコンポーネント
- ✅ Expo Go対応

## AI機能（Gemini）の設定

### 1. APIキーの取得

1. https://aistudio.google.com/app/apikey にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. APIキーをコピー

### 2. APIキーの設定

`services/geminiService.ts` の10行目を編集：

```typescript
return "YOUR_GEMINI_API_KEY_HERE"; // ここに取得したAPIキーを貼り付け
```

### 3. 機能

- ✅ ワークアウトプラン自動生成
- ✅ 食事の栄養分析
- ✅ デイリー励ましメッセージ

## データストレージ

現在は**AsyncStorage**（ローカルストレージ）を使用しています：
- ✅ オフラインでも動作
- ✅ セットアップ不要
- ❌ デバイス間で同期されない

### Firebaseへの移行（オプション）

将来的にクラウド同期が必要な場合：

1. Firebase Consoleでプロジェクトを作成
2. `services/firebaseConfig.ts` にAPIキーを設定
3. Firebaseパッケージをインストール:
   ```bash
   npm install firebase
   ```
4. `services/firestoreService.ts` をFirebase実装に置き換え

現在のAsyncStorage実装は、Firebaseと互換性のあるインターフェースで設計されているため、移行は簡単です。

## 注意事項

- このプロジェクトはExpo管理ワークフローを使用しています
- Web版は現在非対応（iPhoneアプリのみ）
- AI機能はAPIキーを設定すると使えるようになります
- データはローカルに保存されます（Firebase移行は任意）

<div align="center">
  <h1>🏋️ BalanceAI Wellness</h1>
  <p><strong>あなただけの専属AIトレーナー</strong></p>
  <p>Google Gemini AIを活用したパーソナライズフィットネス＆健康管理アプリ</p>
</div>

---

## 📖 概要

**BalanceAI Wellness**は、最新のAI技術を活用して、あなたの目標や体質に合わせた完全パーソナライズの運動・栄養プランを提供するWebアプリケーションです。

### ✨ 主な機能

- 🤖 **AIパーソナライズプラン**: Google Gemini AIがあなた専用のワークアウトプランを生成
- 📊 **包括的な健康管理**: 運動・食事・体重を一元管理
- 💬 **24/7 AIトレーナー**: いつでも相談できるインタラクティブなチャットサポート
- 📱 **美しいUI**: モダンで直感的なユーザーインターフェース
- 🏠 **環境対応**: 自宅でもジムでも、あなたの環境に合わせたプラン

---

## 🚀 クイックスタート

### 前提条件

- **Node.js** (v18以上推奨)
- **Google Gemini API Key**

### インストール手順

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/saboten-q/balanceai_wellness.git
   cd balanceai_wellness
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**
   
   プロジェクトルートに `.env.local` ファイルを作成し、以下を記述：
   ```
   API_KEY=your_gemini_api_key_here
   ```
   
   > Gemini APIキーは[Google AI Studio](https://aistudio.google.com/app/apikey)で取得できます

4. **開発サーバーの起動**
   ```bash
   npm run dev
   ```
   
   ブラウザで `http://localhost:3000` を開きます

---

## 🛠️ 技術スタック

### フロントエンド
- **React 19.2.0** - UIフレームワーク
- **TypeScript 5.8.2** - 型安全な開発
- **Vite 6.2.0** - 高速ビルドツール
- **TailwindCSS** - スタイリング
- **Lucide React** - アイコン
- **Recharts** - データビジュアライゼーション

### AI統合
- **Google Gemini AI (gemini-2.5-flash)** - パーソナライゼーション、栄養分析、チャット機能

---

## 📂 プロジェクト構成

```
balanceai_wellness/
├── App.tsx                      # メインアプリケーション
├── index.tsx                    # エントリーポイント
├── types.ts                     # TypeScript型定義
├── components/
│   └── UIComponents.tsx         # 共通UIコンポーネント
├── services/
│   └── geminiService.ts         # Google Gemini AI統合
├── vite.config.ts               # Vite設定
├── tsconfig.json                # TypeScript設定
├── package.json                 # 依存関係
├── 仕様書.md                    # 詳細な仕様書（日本語）
└── README.md                    # このファイル
```

---

## 📱 主要機能

### 1. 認証システム
- メール/パスワードでの登録・ログイン
- Googleログイン（準備中）
- パスワードリセット機能
- ゲストモード（登録なしで利用可能）

### 2. オンボーディング
- 3ステップで簡単なプロフィール設定
- AIが最適なプランを自動生成

### 3. ダッシュボード
- 本日のカロリー摂取状況
- ワークアウト進捗
- 体重推移
- AIからの毎日のメッセージ

### 4. ワークアウト管理
- 週間トレーニングスケジュール
- 各エクササイズの詳細説明
- YouTube解説動画リンク
- エクササイズ完了チェック
- コンテキスト別AIチャット

### 5. 栄養管理
- 食事の写真またはテキストで簡単記録
- AIが自動で栄養素を分析
- カロリー・マクロ栄養素の可視化
- パーソナライズされた栄養アドバイス

### 6. 進捗管理
- 体重変化のグラフ表示
- 目標までの距離を可視化
- 定期的な記録で長期的なトレンド把握

### 7. グローバルAIチャット
- いつでもどこからでもアクセス可能
- トレーニング・栄養に関する質問に即答
- あなたのプロフィールに基づいたアドバイス

---

## 🎯 使い方

1. **初回起動**: オンボーディングで基本情報を入力
2. **毎朝**: ダッシュボードで今日のメッセージとワークアウトを確認
3. **運動時**: ワークアウト画面でメニューを実行し、チェックマーク
4. **食事時**: 食事画面で内容を記録
5. **定期的**: プログレス画面で体重を記録し、進捗を確認

---

## 📄 ビルド・デプロイ

### プロダクションビルド
```bash
npm run build
```

ビルド結果は `dist/` ディレクトリに出力されます。

### プレビュー
```bash
npm run preview
```

---

## 🔒 セキュリティとプライバシー

- すべてのデータはローカルストレージに保存
- API通信は暗号化
- 個人情報は最小限のみ使用
- APIキーは環境変数で管理

---

## 📚 ドキュメント

詳細な仕様については、[仕様書.md](./仕様書.md)をご覧ください。

---

## 🤝 コントリビューション

現在は個人プロジェクトですが、フィードバックや提案は歓迎します！

---

## 📝 ライセンス

このプロジェクトはプライベートリポジトリです。

---

## 👤 作成者

**saboten-q**
- GitHub: [@saboten-q](https://github.com/saboten-q)
- Repository: [balanceai_wellness](https://github.com/saboten-q/balanceai_wellness)

---

## 🙏 謝辞

- Google Gemini AI for providing powerful AI capabilities
- AI Studio for the initial project template
- React, Vite, and all open-source contributors

---

**バージョン**: 1.0.0  
**最終更新**: 2025年12月4日

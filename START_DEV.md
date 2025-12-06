# 開発サーバー起動手順

## 問題が発生した場合

現在、依存関係の問題でExpoが起動しない可能性があります。以下の手順を試してください：

## 方法1: 完全クリーンインストール

```powershell
# プロジェクトディレクトリに移動
cd "C:\Users\sabot\OneDrive\デスクトップ\balanceai_wellness"

# node_modulesとロックファイルを削除
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 依存関係を再インストール
npm install

# Expo CLIをグローバルにインストール（まだの場合）
npm install -g expo-cli

# 開発サーバーを起動
npx expo start
```

## 方法2: Expo CLI を使用

```powershell
cd "C:\Users\sabot\OneDrive\デスクトップ\balanceai_wellness"

# Expo CLIをインストール
npm install -g @expo/cli

# 起動
npx expo start
```

## 方法3: 新しいPowerShellウィンドウで実行

1. PowerShellを**管理者として**開く
2. 以下のコマンドを実行：

```powershell
cd "C:\Users\sabot\OneDrive\デスクトップ\balanceai_wellness"
npx expo start --tunnel
```

## トラブルシューティング

### エラー: "expo コマンドが見つかりません"

```powershell
npm install --save-dev @expo/cli
npx expo start
```

### エラー: "Module not found"

```powershell
npm install
npx expo start --clear
```

### ポートが使用中

```powershell
npx expo start --port 8081
```

## 成功したら

QRコードが表示されます：
1. iPhoneで**Expo Go**アプリを開く
2. QRコードをスキャン
3. アプリが起動！

## 注意事項

- 初回起動は数分かかる場合があります
- `Metro bundler` が起動するまで待ちましょう
- エラーが表示されたら、まず `npm install` を再実行

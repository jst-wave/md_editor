# Markdown Memo App

モダンなWebベースのマークダウンメモ帳アプリケーションです。リアルタイムプレビュー、タブ管理、検索・置換機能を備えています。

## 🚀 主な機能

### ✏️ エディタ機能
- **マークダウン記法**: 標準的なMarkdown記法をサポート
- **ライブプレビュー**: 入力と同時にプレビューが更新
- **分割可能なレイアウト**: エディタとプレビューの境界をドラッグして幅を調整可能
- **キーボードショートカット**: 効率的な編集をサポート

### 📁 ファイル管理
- **マルチタブ**: 複数のメモを同時に開いて管理
- **自動保存**: ブラウザのローカルストレージに自動保存
- **ファイルダウンロード**: `.md`ファイルとしてローカルにダウンロード可能

### 🔍 検索・置換
- **全文検索**: メモ内のテキストを検索してハイライト表示
- **一括置換**: テキストの一括置換機能
- **検索ナビゲーション**: 前/次の検索結果に移動

### ⌨️ キーボードショートカット
- `Ctrl+S`: マークダウンファイルとしてダウンロード
- `Ctrl+Alt+S`: ローカルストレージに保存
- `Ctrl+N`: 新しいタブを作成
- `Ctrl+W`: 現在のタブを閉じる
- `Ctrl+F`: 検索パネルを開く
- `Ctrl+B`: 太字
- `Ctrl+I`: 斜体
- `Ctrl+K`: リンク挿入

## 🛠️ 技術スタック

- **Frontend**: Vanilla JavaScript (ES6+)
- **Build Tool**: Webpack 5
- **CSS**: カスタムCSS（フレックスボックス、グリッド）
- **Markdown**: Marked.js
- **Storage**: Browser LocalStorage API

## 📦 インストールと起動

### 🎯 配布版を使用する場合（推奨）

**事前準備**: Node.js または Python 3.x をインストール
- [Node.js（推奨）](https://nodejs.org/)
- [Python](https://www.python.org/)

**ダウンロードと起動**:
1. [Releases](https://github.com/jst-wave/md_editor/releases) から `MarkdownEditor-配布版-v2-final.zip` をダウンロード
2. ZIPファイルを展開
3. 以下のいずれかの方法で起動：

**方法A（最も簡単）**: `MarkdownEditor.bat` をダブルクリック
**方法B**: `launcher.html` をブラウザで開く
**方法C**: `index.html` を直接ブラウザで開く

### 🔧 開発環境での起動

前提条件: Node.js 14以上、npm または yarn

```bash
# リポジトリをクローン
git clone https://github.com/jst-wave/md_editor.git
cd memo-app

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm start
```

アプリケーションは `http://localhost:4001` で起動します。

### ビルド
```bash
# プロダクション用ビルド
npm run build
```

## 📱 対応ブラウザ

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 🏗️ プロジェクト構造

```
src/
├── index.html          # メインHTMLファイル
├── css/
│   └── style.css       # アプリケーションスタイル
├── js/
│   ├── app.js          # アプリケーションエントリーポイント
│   ├── editor.js       # エディタ機能とリサイザー
│   ├── tabs.js         # タブ管理
│   ├── storage.js      # ローカルストレージ管理
│   ├── search.js       # 検索・置換機能
│   └── markdown.js     # マークダウンレンダリング
└── assets/
    └── icons/          # アイコンファイル
```

## 🔧 開発

### 開発サーバー起動
```bash
npm start
```

### コード品質
- ESLint設定済み
- モジュール化されたJavaScript
- レスポンシブデザイン

## 📝 使用方法

1. **新しいメモの作成**: 「新しいタブ」ボタンをクリック
2. **マークダウン記法で記述**: エディタにマークダウンテキストを入力
3. **リアルタイムプレビュー**: 右側でリアルタイムプレビューを確認
4. **幅の調整**: エディタとプレビューの境界をドラッグして幅を調整
5. **保存**: `Ctrl+S`でファイルダウンロード、または自動保存機能を利用

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📱 配布版の詳細

### ファイル構成
- `index.html` - メインアプリケーション
- `bundle.js` - JavaScript バンドル（135KB）
- `MarkdownEditor.bat` - Windows用起動スクリプト
- `launcher.html` - ブラウザベースランチャー
- `README.txt` - 使用方法

### 対応環境
- **OS**: Windows 10/11、macOS、Linux
- **ブラウザ**: Chrome、Firefox、Edge、Safari（最新版）
- **ランタイム**: Node.js 14+ または Python 3.6+

### トラブルシューティング
- **バッチファイルが実行できない**: `launcher.html` を使用
- **文字化けが発生**: UTF-8対応済みのバッチファイルを使用
- **ポートエラー**: 他のアプリケーションとのポート競合を確認
- **接続エラー**: サーバー起動まで数秒待機

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 📞 サポート

- 🐛 バグ報告: [Issues](https://github.com/jst-wave/md_editor/issues)
- 💡 機能要望: [Issues](https://github.com/jst-wave/md_editor/issues)
- 📧 開発者: jst-wave

---

**最終更新**: 2025年6月5日  
**バージョン**: v2.0（配布版改善リリース）

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 🔄 更新履歴

### v1.0.0 (2025-06-05)
- 初回リリース
- マークダウンエディタとライブプレビュー
- タブ管理機能
- 検索・置換機能
- ファイルダウンロード機能
- リサイザー機能
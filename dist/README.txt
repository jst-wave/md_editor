========================================
   Markdown Editor - 配布版 v2.0
========================================

【メイン起動方法】
1. MarkdownEditor.bat をダブルクリック
   - Node.js または Python を自動検出
   - ブラウザが自動で開きます
   - 最も確実な方法です

【代替起動方法】
2. launcher.html をブラウザで開く
   - ブラウザベースのランチャー
   - 起動方法を選択できます
   - バッチファイルをダウンロード可能

3. index.html をブラウザで開く
   - 直接アプリケーションを起動
   - 一部機能が制限される可能性があります

【必要なソフトウェア】
以下のいずれか1つが必要です：
- Node.js（推奨）: https://nodejs.org/
- Python 3.x: https://www.python.org/

【機能一覧】
✅ Markdownリアルタイムプレビュー
✅ タブ機能（複数ファイル管理）
✅ 検索・置換機能
✅ ファイルダウンロード（.md形式）
✅ 自動保存（ブラウザ内）
✅ キーボードショートカット
✅ レスポンシブデザイン
✅ 文字化け対応（UTF-8）

【起動後のアクセス先】
- Node.js版: http://localhost:3001
- Python版: http://localhost:8000

【トラブルシューティング】
- バッチファイルが実行できない
  → launcher.html を使用してください
- セキュリティ警告が表示される
  → 「詳細情報」→「実行」を選択
- 文字化けが発生する
  → バッチファイルにUTF-8対応を追加済み
- ポートが使用中のエラー
  → 他のアプリを終了するか、別のポートを使用
- 「接続が拒否されました」エラー
  → サーバーが起動するまで数秒待ってください

【手動起動コマンド】
コマンドプロンプトで以下を実行：

Node.js版:
node -e "const http=require('http'),fs=require('fs');http.createServer((req,res)=>{try{const file=req.url==='/'?'index.html':req.url.slice(1);const content=fs.readFileSync(file);res.writeHead(200,{'Content-Type':file.endsWith('.js')?'application/javascript':'text/html'});res.end(content)}catch{res.writeHead(404);res.end('404')}}).listen(3001,()=>{console.log('Server: http://localhost:3001');require('child_process').exec('start http://localhost:3001')})"

Python版:
python -m http.server 8000

【ファイル構成】
- index.html: メインアプリケーション
- bundle.js: JavaScript（135KB）
- MarkdownEditor.bat: 起動スクリプト
- launcher.html: ブラウザランチャー
- README.txt: このファイル
- 配布版実行手順.md: 詳細手順

【サポート】
GitHub: https://github.com/jst-wave/md_editor
開発者: jst-wave

最終更新: 2025年6月5日
バージョン: 2.0（起動方法改善版）

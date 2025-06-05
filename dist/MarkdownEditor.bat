@echo off
chcp 65001 >nul
cd /d %~dp0
cls
echo ==========================================
echo    Markdown Editor - 起動スクリプト
echo ==========================================
echo.
echo このスクリプトはMarkdown Editorを起動します
echo.

REM Node.js チェック
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo [成功] Node.js が見つかりました
    echo [情報] サーバーを http://localhost:3001 で起動します
    echo [情報] ブラウザが自動で開きます
    echo.
    echo サーバーを停止するには Ctrl+C を押してください
    echo.
    start "" http://localhost:3001
    node -e "const http=require('http'),fs=require('fs');http.createServer((req,res)=>{try{const file=req.url==='/'?'index.html':req.url.slice(1);res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end('Not Found')}}).listen(3001,()=>console.log('サーバー起動: http://localhost:3001'))"
    goto :end
)

REM Python チェック
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [成功] Python が見つかりました
    echo [情報] サーバーを http://localhost:8000 で起動します
    echo [情報] ブラウザで http://localhost:8000 を開いてください
    echo.
    echo サーバーを停止するには Ctrl+C を押してください
    echo.
    start "" http://localhost:8000
    python -m http.server 8000
    goto :end
)

REM どちらも見つからない場合
echo [エラー] Node.js または Python が必要です
echo.
echo 以下のいずれかをインストールしてください:
echo.
echo 1. Node.js (推奨): https://nodejs.org/
echo 2. Python: https://www.python.org/
echo.
echo または launcher.html をブラウザで開いてください
echo.
pause
exit /b 1

:end
echo.
echo [情報] サーバーが停止しました
pause

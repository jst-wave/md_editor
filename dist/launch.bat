@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo Markdown Editor を起動中...
echo.

node --version >nul 2>&1
if errorlevel 1 goto try_python

echo Node.js でサーバーを起動します
echo ブラウザが自動で開きます: http://localhost:3001
echo 終了するには Ctrl+C を押してください
echo.
start "" http://localhost:3001
node -e "const http=require('http'),fs=require('fs'),path=require('path');http.createServer((req,res)=>{const file=path.join(__dirname,req.url==='/'?'index.html':req.url.slice(1));try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':file.endsWith('.js')?'application/javascript':'text/html'});res.end(data)}catch{res.writeHead(404);res.end('404')}}).listen(3001,()=>console.log('サーバー起動: http://localhost:3001'))"
goto end

:try_python
python --version >nul 2>&1
if errorlevel 1 goto no_runtime

echo Python でサーバーを起動します
echo ブラウザで開いてください: http://localhost:8000
echo 終了するには Ctrl+C を押してください
echo.
start "" http://localhost:8000
python -m http.server 8000
goto end

:no_runtime
echo エラー: Node.js または Python が必要です
echo.
echo 以下からダウンロードしてください:
echo Node.js: https://nodejs.org/
echo Python: https://www.python.org/
echo.
pause
exit /b 1

:end
pause

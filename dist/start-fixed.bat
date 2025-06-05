@echo off
cd /d "%~dp0"
echo Markdown Editor を起動しています...

REM Node.jsを確認
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.jsでサーバーを起動します...
    start http://localhost:3001
    node -e "const http=require('http'); const fs=require('fs'); const path=require('path'); const server=http.createServer((req,res)=>{const filePath=path.join(__dirname, req.url==='/'?'index.html':req.url.slice(1)); try{const content=fs.readFileSync(filePath); res.writeHead(200,{'Content-Type':req.url.endsWith('.js')?'application/javascript':'text/html'}); res.end(content);}catch{res.writeHead(404); res.end('Not Found');}}); server.listen(3001,()=>console.log('Server running at http://localhost:3001'));"
    goto end
)

REM Pythonを確認
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Pythonでサーバーを起動します...
    start http://localhost:8000
    python -m http.server 8000
    goto end
)

echo エラー: Node.jsまたはPythonが必要です
pause

:end

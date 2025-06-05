# Markdown Editor Launcher
Write-Host "Markdown Editor を起動しています..." -ForegroundColor Green
Set-Location $PSScriptRoot

# Node.js を確認
$nodeExists = Get-Command node -ErrorAction SilentlyContinue
if ($nodeExists) {
    Write-Host "Node.js が見つかりました。サーバーを起動します..." -ForegroundColor Yellow
    Write-Host "ブラウザで http://localhost:3001 を開きます" -ForegroundColor Cyan
    
    # ブラウザを開く
    Start-Process "http://localhost:3001"
    
    # Node.js サーバーを起動
    $serverScript = @"
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.slice(1));
    try {
        const content = fs.readFileSync(filePath);
        const contentType = req.url.endsWith('.js') ? 'application/javascript' : 'text/html';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (error) {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3001, () => {
    console.log('サーバーが起動しました: http://localhost:3001');
});
"@
    
    node -e $serverScript
    exit
}

# Python を確認
$pythonExists = Get-Command python -ErrorAction SilentlyContinue
if ($pythonExists) {
    Write-Host "Python が見つかりました。サーバーを起動します..." -ForegroundColor Yellow
    Write-Host "ブラウザで http://localhost:8000 を開いてください" -ForegroundColor Cyan
    
    Start-Process "http://localhost:8000"
    python -m http.server 8000
    exit
}

# どちらも見つからない場合
Write-Host "エラー: Node.js または Python が必要です" -ForegroundColor Red
Write-Host ""
Write-Host "以下からダウンロードしてください:"
Write-Host "Node.js: https://nodejs.org/" -ForegroundColor Blue
Write-Host "Python: https://www.python.org/" -ForegroundColor Blue
Write-Host ""
Read-Host "Enterキーを押して終了"

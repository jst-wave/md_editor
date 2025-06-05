# PowerShell Script for Markdown Editor
Write-Host "Markdown Editor を起動しています..." -ForegroundColor Green

# Change to script directory
Set-Location $PSScriptRoot

# Check for Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "Node.js ($nodeVersion) でサーバーを起動します..." -ForegroundColor Cyan
        Start-Process "http://localhost:3001"
        
        # Start Node.js server
        $serverScript = @"
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.slice(1));
    try {
        const content = fs.readFileSync(filePath);
        const contentType = req.url.endsWith('.js') ? 'application/javascript' : 'text/html';
        res.writeHead(200, {'Content-Type': contentType});
        res.end(content);
    } catch (error) {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3001, () => {
    console.log('Server running at http://localhost:3001');
});
"@
        
        node -e $serverScript
        exit
    }
} catch {
    Write-Host "Node.js が見つかりません" -ForegroundColor Yellow
}

# Check for Python
try {
    $pythonVersion = python --version 2>$null
    if ($pythonVersion) {
        Write-Host "Python ($pythonVersion) でサーバーを起動します..." -ForegroundColor Cyan
        Start-Process "http://localhost:8000"
        python -m http.server 8000
        exit
    }
} catch {
    Write-Host "Python が見つかりません" -ForegroundColor Yellow
}

Write-Host "エラー: Node.jsまたはPythonが必要です" -ForegroundColor Red
Write-Host "以下からダウンロードしてください:" -ForegroundColor Yellow
Write-Host "- Node.js: https://nodejs.org/" -ForegroundColor Cyan
Write-Host "- Python: https://python.org/" -ForegroundColor Cyan
Read-Host "何かキーを押してください"

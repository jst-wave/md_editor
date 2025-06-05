# Markdown Editor - Auto Start (PowerShell版)

# ウィンドウタイトルを設定
$Host.UI.RawUI.WindowTitle = "Markdown Editor - Auto Start"

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "        Markdown Editor - Auto Start" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# スクリプトのディレクトリに移動
Set-Location $PSScriptRoot

# Node.jsを試す（推奨）
try {
    $null = Get-Command node -ErrorAction Stop
    Write-Host "[OK] Node.js found, starting with Node.js..." -ForegroundColor Green
    Write-Host "[INFO] Browser will open at http://localhost:3001" -ForegroundColor Yellow
    Write-Host "[INFO] Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    
    # ポート3001でhttp-serverを起動
    & npx http-server@latest -p 3001 -o -c-1 --cors
    
} catch {
    # Pythonにフォールバック
    try {
        $null = Get-Command python -ErrorAction Stop
        Write-Host "[OK] Python found, starting with Python..." -ForegroundColor Green
        Write-Host "[INFO] Please open http://localhost:8000 in your browser" -ForegroundColor Yellow
        Write-Host "[INFO] Press Ctrl+C to stop" -ForegroundColor Yellow
        Write-Host ""
        
        & python -m http.server 8000
        
    } catch {
        # py コマンドを試す
        try {
            $null = Get-Command py -ErrorAction Stop
            Write-Host "[OK] Python launcher found, starting with Python..." -ForegroundColor Green
            Write-Host "[INFO] Please open http://localhost:8000 in your browser" -ForegroundColor Yellow
            Write-Host "[INFO] Press Ctrl+C to stop" -ForegroundColor Yellow
            Write-Host ""
            
            & py -m http.server 8000
            
        } catch {
            # ランタイムが見つからない
            Write-Host "[ERROR] Neither Node.js nor Python found" -ForegroundColor Red
            Write-Host ""
            Write-Host "Please install one of the following:" -ForegroundColor Yellow
            Write-Host "- Node.js: https://nodejs.org (Recommended)" -ForegroundColor Yellow
            Write-Host "- Python: https://python.org" -ForegroundColor Yellow
            Write-Host ""
            
            $response = Read-Host "Open Node.js download page? (y/n)"
            if ($response -eq "y" -or $response -eq "Y") {
                Start-Process "https://nodejs.org"
            }
            
            Read-Host "Press Enter to exit"
            exit 1
        }
    }
}

Write-Host ""
Write-Host "[INFO] Server stopped" -ForegroundColor Yellow
Read-Host "Press Enter to exit"

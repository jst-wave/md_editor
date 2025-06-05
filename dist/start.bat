@echo off
cd /d "%~dp0"
echo Markdown Editor を起動します...
node -e "require('http').createServer((q,s)=>{try{s.end(require('fs').readFileSync(q.url=='/'?'index.html':q.url.slice(1)))}catch{s.end()}}).listen(3001);console.log('http://localhost:3001');require('child_process').exec('start http://localhost:3001')"
pause

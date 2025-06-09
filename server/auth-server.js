const express = require('express');
const cors = require('cors');
const axios = require('axios');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// セッション設定
app.use(session({
    secret: process.env.SESSION_SECRET || 'google-docs-uploader-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24時間
}));

// CORS設定
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://localhost:3002', 
        'http://localhost:3004',
        'http://localhost:3005',
        'http://localhost:3006',
        'http://localhost:4000', 
        'http://127.0.0.1:3000', 
        'http://127.0.0.1:3002', 
        'http://127.0.0.1:3004',
        'http://127.0.0.1:3005',
        'http://127.0.0.1:3006',
        'http://127.0.0.1:4000'
    ],
    credentials: true
}));

app.use(express.json());

// Google OAuth設定
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3001/auth/google/callback';

// Google OAuth認証URLを生成
app.get('/auth/google', (req, res) => {
    const state = Math.random().toString(36).substring(7);
    const scope = 'openid email profile https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file';
    
    const authUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${state}`;
    
    // セッションにstate情報を保存
    req.session.authState = state;
    
    res.json({ authUrl });
});

// Google OAuth コールバック処理
app.get('/auth/google/callback', async (req, res) => {
    const { code, error } = req.query;
    
    if (error) {
        return res.redirect(`http://localhost:3000?error=${encodeURIComponent(error)}`);
    }
    
    if (!code) {
        return res.redirect('http://localhost:3000?error=no_code');
    }
    
    try {
        // アクセストークンを取得
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        });
        
        const { access_token, refresh_token, expires_in } = tokenResponse.data;
        
        // ユーザー情報を取得
        const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });
        
        const userProfile = userResponse.data;
          // 認証データをまとめる
        const authData = {
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt: Date.now() + (expires_in * 1000),
            userInfo: {
                id: userProfile.id,
                email: userProfile.email,
                name: userProfile.name,
                picture: userProfile.picture
            }
        };
        
        // セッションに認証データを保存
        req.session.authData = authData;
          // 認証成功をクライアントに伝える
        const successHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>認証成功</title>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .success { color: #0f9d58; }
                .countdown { color: #666; margin-top: 20px; }
            </style>
        </head>
        <body>
            <h2 class="success">✅ Google認証が完了しました</h2>
            <p>こんにちは、${userProfile.name}さん！</p>
            <p>このウィンドウは自動的に閉じられます。</p>
            <div class="countdown" id="countdown">3秒後にウィンドウを閉じます...</div>
            <script>
                let count = 3;
                const countdown = document.getElementById('countdown');
                
                const timer = setInterval(() => {
                    count--;
                    countdown.textContent = count > 0 ? count + '秒後にウィンドウを閉じます...' : 'ウィンドウを閉じています...';
                    
                    if (count <= 0) {
                        clearInterval(timer);
                        window.close();
                    }
                }, 1000);
                
                // 親ウィンドウに認証完了を通知
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'google_auth_success'
                    }, '*');
                }
            </script>
        </body>
        </html>
        `;
        
        res.send(successHtml);
        
    } catch (error) {
        console.error('OAuth error:', error.response?.data || error.message);
        res.redirect(`http://localhost:3000?error=${encodeURIComponent('auth_failed')}`);
    }
});

// 認証状態確認エンドポイント
app.get('/auth/status', (req, res) => {
    if (req.session.authData) {
        const authData = req.session.authData;
        
        // トークンの有効期限をチェック
        if (authData.expiresAt && authData.expiresAt > Date.now()) {
            res.json({
                authenticated: true,
                accessToken: authData.accessToken,
                userInfo: authData.userInfo,
                expiresAt: authData.expiresAt
            });
        } else {
            // トークンが期限切れ
            req.session.authData = null;
            res.json({ authenticated: false, reason: 'token_expired' });
        }
    } else {
        res.json({ authenticated: false, reason: 'not_authenticated' });
    }
});

// トークンリフレッシュエンドポイント
app.post('/auth/refresh', async (req, res) => {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
        return res.status(400).json({ error: 'refresh_token is required' });
    }
    
    try {
        const response = await axios.post('https://oauth2.googleapis.com/token', {
            refresh_token,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            grant_type: 'refresh_token'
        });
        
        const { access_token, expires_in } = response.data;
        
        res.json({
            access_token,
            expires_at: Date.now() + (expires_in * 1000)
        });
        
    } catch (error) {
        console.error('Token refresh error:', error.response?.data || error.message);
        res.status(401).json({ error: 'Failed to refresh token' });
    }
});

// ヘルスチェック
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'Google OAuth Auth Server',
        configured: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Google OAuth認証サーバーがポート ${PORT} で起動しました`);
    console.log(`設定状況:`);
    console.log(`  - GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID ? '設定済み' : '未設定'}`);
    console.log(`  - GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET ? '設定済み' : '未設定'}`);
    console.log(`  - REDIRECT_URI: ${REDIRECT_URI}`);
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        console.log(`\n⚠️  Google OAuth設定が不完全です。.envファイルに以下を設定してください:`);
        console.log(`GOOGLE_CLIENT_ID=your_client_id_here`);
        console.log(`GOOGLE_CLIENT_SECRET=your_client_secret_here`);
    }
});

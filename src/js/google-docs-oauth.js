/**
 * Google Docs Upload Functionality with OAuth Authentication
 */

class GoogleDocsUploader {
    constructor() {
        this.isAuthenticated = false;
        this.isInitialized = false;
        this.userProfile = null;
        this.accessToken = null;
        
        // Google OAuth設定（本番環境では環境変数から取得）
        this.CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // 実際のクライアントIDに置き換え
        this.REDIRECT_URI = window.location.origin;
        this.SCOPE = 'openid email profile https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file';
        
        console.log('GoogleDocsUploader初期化完了');
        this.loadSavedAuth();
    }

    // 保存された認証情報を読み込み
    loadSavedAuth() {
        const savedAuth = localStorage.getItem('google_auth_data');
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                if (this.isTokenValid(authData)) {
                    this.accessToken = authData.access_token;
                    this.userProfile = authData.user_profile;
                    this.isAuthenticated = true;
                    console.log('保存されたGoogle認証を復元しました:', this.userProfile?.email);
                    this.updateUI();
                }
            } catch (error) {
                console.error('保存された認証情報の読み込みエラー:', error);
                this.clearAuth();
            }
        }
    }

    // トークンの有効性チェック
    isTokenValid(authData) {
        if (!authData.expires_at) return false;
        return Date.now() < authData.expires_at;
    }

    // Google OAuth認証を開始
    async startGoogleAuth() {
        if (this.CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
            this.showConfigMessage();
            return;
        }

        const authUrl = `https://accounts.google.com/oauth/authorize?` +
            `client_id=${this.CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&` +
            `scope=${encodeURIComponent(this.SCOPE)}&` +
            `response_type=code&` +
            `access_type=offline&` +
            `prompt=consent&` +
            `state=${Math.random().toString(36).substring(7)}`;

        // ポップアップウィンドウでGoogle認証を開く
        const popup = window.open(
            authUrl,
            'google-auth',
            'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // ポップアップからの認証完了を監視
        return new Promise((resolve, reject) => {
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    // 認証情報を再チェック
                    this.loadSavedAuth();
                    if (this.isAuthenticated) {
                        resolve(true);
                    } else {
                        reject(new Error('認証がキャンセルされました'));
                    }
                }
            }, 1000);

            // タイムアウト（5分）
            setTimeout(() => {
                clearInterval(checkClosed);
                if (!popup.closed) {
                    popup.close();
                }
                reject(new Error('認証がタイムアウトしました'));
            }, 300000);
        });
    }

    // 設定が必要であることを表示
    showConfigMessage() {
        const message = `
Google Docs連携を使用するには設定が必要です。

必要な設定：
1. Google Cloud Consoleでプロジェクトを作成
2. Google Docs API / Google Drive APIを有効化
3. OAuth 2.0 クライアントIDを作成
4. google-docs.jsファイルでCLIENT_IDを設定

詳細は GOOGLE_DOCS_SETUP.md を参照してください。

設定が完了したら、ページを再読み込みしてください。
        `;
        
        alert(message.trim());
    }

    // Google Docsにアップロード
    async uploadToGoogleDocs(content, title = null) {
        console.log('Google Docs アップロード機能が呼び出されました');
        
        if (!this.isAuthenticated) {
            const confirmed = confirm('Google Docsにアップロードするには、Googleアカウントでログインする必要があります。ログインしますか？');
            if (confirmed) {
                try {
                    await this.startGoogleAuth();
                } catch (error) {
                    console.error('Google認証エラー:', error);
                    alert('Google認証に失敗しました: ' + error.message);
                    return;
                }
            } else {
                return;
            }
        }

        // タイトルが指定されていない場合は現在のタブタイトルを使用
        if (!title) {
            title = window.getCurrentTabTitle ? window.getCurrentTabTitle() : 'Markdown文書';
        }

        try {
            const docId = await this.createGoogleDoc(content, title);
            if (docId) {
                const docUrl = `https://docs.google.com/document/d/${docId}/edit`;
                const confirmed = confirm(`Google Docsに「${title}」がアップロードされました。\n\n文書を開きますか？`);
                if (confirmed) {
                    window.open(docUrl, '_blank');
                }
            }
        } catch (error) {
            console.error('Google Docsアップロードエラー:', error);
            alert('Google Docsへのアップロードに失敗しました: ' + error.message);
        }
    }

    // Google Docsを作成
    async createGoogleDoc(content, title) {
        // マークダウンをプレーンテキストに変換（簡易版）
        const plainText = content
            .replace(/^#{1,6}\s+(.+)$/gm, '$1') // ヘッダー
            .replace(/\*\*(.+?)\*\*/g, '$1') // 太字
            .replace(/\*(.+?)\*/g, '$1') // 斜体
            .replace(/`(.+?)`/g, '$1') // インラインコード
            .replace(/```[\s\S]*?```/g, '[コードブロック]') // コードブロック
            .trim();

        const docData = {
            title: title
        };

        // Google Docs APIで文書を作成
        const response = await fetch('https://docs.googleapis.com/v1/documents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(docData)
        });

        if (!response.ok) {
            throw new Error(`Google Docs API エラー: ${response.status}`);
        }

        const doc = await response.json();
        const docId = doc.documentId;

        // 文書にコンテンツを挿入
        if (plainText) {
            await this.insertTextToDoc(docId, plainText);
        }

        return docId;
    }

    // 文書にテキストを挿入
    async insertTextToDoc(docId, text) {
        const requests = [{
            insertText: {
                location: {
                    index: 1
                },
                text: text
            }
        }];

        const response = await fetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requests })
        });

        if (!response.ok) {
            throw new Error(`テキスト挿入エラー: ${response.status}`);
        }
    }

    // ログアウト
    logout() {
        this.clearAuth();
        this.updateUI();
        alert('Googleアカウントからログアウトしました。');
    }

    // 認証情報をクリア
    clearAuth() {
        this.isAuthenticated = false;
        this.userProfile = null;
        this.accessToken = null;
        localStorage.removeItem('google_auth_data');
    }

    // UIを更新
    updateUI() {
        const btn = document.getElementById('google-docs-upload');
        if (btn) {
            if (this.isAuthenticated && this.userProfile) {
                btn.innerHTML = `📄 Google Docs (${this.userProfile.email})`;
                btn.title = `Googleアカウント: ${this.userProfile.email}\nクリックしてアップロード、右クリックでログアウト`;
            } else {
                btn.innerHTML = `📄 Google Docs`;
                btn.title = 'Google Docsにアップロード（要ログイン）';
            }
        }
    }

    setupEventListeners() {
        console.log('setupEventListeners開始');
        const uploadBtn = document.getElementById('google-docs-upload');
        console.log('setupEventListeners内でボタン検索:', uploadBtn);
        
        if (uploadBtn) {
            console.log('setupEventListeners内でボタンが見つかりました');
            
            // 既存のイベントリスナーを削除（重複防止）
            const existingListener = uploadBtn.getAttribute('data-google-docs-listener');
            if (existingListener === 'true') {
                console.log('既存のイベントリスナーが存在するため、スキップします');
                return;
            }
            
            // イベントリスナーを設定
            const clickHandler = (e) => {
                console.log('GoogleDocsUploaderのクリックイベントが発火！');
                e.preventDefault();
                e.stopPropagation();
                
                // 認証済みの場合は右クリックでログアウトオプション
                if (this.isAuthenticated && e.button === 2) {
                    e.preventDefault();
                    const confirmed = confirm(`${this.userProfile.email} からログアウトしますか？`);
                    if (confirmed) {
                        this.logout();
                    }
                    return;
                }
                
                const content = window.getMarkdownContent ? window.getMarkdownContent() : '';
                console.log('取得されたコンテンツ:', content ? content.substring(0, 50) + '...' : '空');
                
                this.uploadToGoogleDocs(content);
            };
            
            // 右クリックイベントも追加（ログアウト用）
            uploadBtn.addEventListener('click', clickHandler);
            uploadBtn.addEventListener('contextmenu', clickHandler);
            uploadBtn.setAttribute('data-google-docs-listener', 'true');
            
            console.log('Google Docsボタンのイベントリスナーを設定しました');
            
            // 初期UI更新
            this.updateUI();
        } else {
            console.error('Google Docsボタンが見つかりません。ID: google-docs-upload');
        }
    }
}

export default GoogleDocsUploader;

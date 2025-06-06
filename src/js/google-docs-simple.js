/**
 * Google Docs OAuth Upload Functionality
 * シンプルなES6モジュール版
 */

class GoogleDocsUploader {
    constructor() {
        this.isAuthenticated = false;
        this.accessToken = null;
        this.userInfo = null;
        this.authServerUrl = 'http://localhost:3001';
        console.log('GoogleDocsUploader (シンプル版) 初期化完了');
        
        // 認証状態を復元
        this.restoreAuthState();
        
        // イベントリスナーを設定（初期化後）
        this.setupEventListeners();
    }

    // 認証状態を復元
    restoreAuthState() {
        try {
            const authData = localStorage.getItem('google_auth_data');
            if (authData) {
                const data = JSON.parse(authData);
                this.accessToken = data.accessToken;
                this.userInfo = data.userInfo;
                this.isAuthenticated = true;
                
                // トークンの有効性を確認
                this.validateToken();
            }
        } catch (error) {
            console.error('認証状態の復元エラー:', error);
            this.clearAuthState();
        }
    }

    // トークンの有効性を確認
    async validateToken() {
        if (!this.accessToken) return false;
        
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (response.ok) {
                this.updateAuthUI(true);
                return true;
            } else {
                this.clearAuthState();
                return false;
            }
        } catch (error) {
            console.error('トークン検証エラー:', error);
            this.clearAuthState();
            return false;
        }
    }

    // 認証状態をクリア
    clearAuthState() {
        this.isAuthenticated = false;
        this.accessToken = null;
        this.userInfo = null;
        localStorage.removeItem('google_auth_data');
        this.updateAuthUI(false);
    }

    // Google OAuth認証を開始
    async startAuthentication() {
        try {
            console.log('Google OAuth認証を開始します...');
            
            // 認証サーバーのヘルスチェック
            const healthResponse = await fetch(`${this.authServerUrl}/health`);
            if (!healthResponse.ok) {
                throw new Error('認証サーバーに接続できません。サーバーが起動していることを確認してください。');
            }
            
            // OAuth認証URLを取得
            const authResponse = await fetch(`${this.authServerUrl}/auth/google`);
            if (!authResponse.ok) {
                throw new Error('認証URLの取得に失敗しました');
            }
            
            const authData = await authResponse.json();
            
            // 新しいウィンドウで認証ページを開く
            const authWindow = window.open(
                authData.authUrl,
                'googleAuth',
                'width=500,height=600,scrollbars=yes,resizable=yes'
            );
            
            // 認証完了を待つ
            this.waitForAuthCompletion(authWindow);
            
        } catch (error) {
            console.error('認証開始エラー:', error);
            alert(`認証エラー: ${error.message}`);
        }
    }

    // 認証完了を待つ
    waitForAuthCompletion(authWindow) {
        const checkClosed = setInterval(() => {
            if (authWindow.closed) {
                clearInterval(checkClosed);
                // 認証状態を確認
                setTimeout(() => {
                    this.checkAuthenticationResult();
                }, 1000);
            }
        }, 1000);
        
        // 5分後にタイムアウト
        setTimeout(() => {
            if (!authWindow.closed) {
                authWindow.close();
                clearInterval(checkClosed);
                alert('認証がタイムアウトしました。再度お試しください。');
            }
        }, 5 * 60 * 1000);
    }

    // 認証結果を確認
    async checkAuthenticationResult() {
        try {
            const response = await fetch(`${this.authServerUrl}/auth/status`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const authData = await response.json();
                if (authData.authenticated) {
                    // 認証成功
                    this.accessToken = authData.accessToken;
                    this.userInfo = authData.userInfo;
                    this.isAuthenticated = true;
                    
                    // ローカルストレージに保存
                    localStorage.setItem('google_auth_data', JSON.stringify({
                        accessToken: this.accessToken,
                        userInfo: this.userInfo,
                        timestamp: Date.now()
                    }));
                    
                    this.updateAuthUI(true);
                    alert(`Google認証が完了しました。こんにちは、${this.userInfo.name}さん！`);
                } else {
                    throw new Error('認証が完了していません');
                }
            } else {
                throw new Error('認証状態の確認に失敗しました');
            }
        } catch (error) {
            console.error('認証結果確認エラー:', error);
            alert('認証の完了確認でエラーが発生しました。');
        }
    }

    // UIを認証状態に応じて更新
    updateAuthUI(isAuthenticated) {
        const uploadBtn = document.getElementById('google-docs-upload');
        if (uploadBtn) {
            if (isAuthenticated) {
                uploadBtn.textContent = 'Google Docsにアップロード';
                uploadBtn.style.backgroundColor = '#4285f4';
                uploadBtn.style.color = 'white';
                uploadBtn.title = `${this.userInfo ? this.userInfo.email : 'Google'}アカウントでログイン済み`;
            } else {
                uploadBtn.textContent = 'Google Docsに接続';
                uploadBtn.style.backgroundColor = '#f8f9fa';
                uploadBtn.style.color = '#3c4043';
                uploadBtn.title = 'Googleアカウントでログインしてください';
            }
        }
    }

    // メインのアップロード処理
    async handleUpload() {
        if (!this.isAuthenticated) {
            // 未認証の場合は認証を開始
            await this.startAuthentication();
            return;
        }

        // 認証済みの場合はアップロード処理
        await this.uploadToGoogleDocs();
    }

    // Google Docsにアップロード
    async uploadToGoogleDocs() {
        try {
            console.log('Google Docsへのアップロードを開始...');
            
            // エディタの内容を取得
            const content = this.getEditorContent();
            if (!content) {
                alert('アップロードするコンテンツがありません。');
                return;
            }

            // ドキュメントを作成
            const response = await fetch('https://docs.googleapis.com/v1/documents', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: `メモ - ${new Date().toLocaleDateString('ja-JP')}`
                })
            });

            if (!response.ok) {
                throw new Error(`ドキュメント作成エラー: ${response.status}`);
            }

            const doc = await response.json();
            console.log('ドキュメントが作成されました:', doc.title);

            // コンテンツを挿入
            const updateResponse = await fetch(`https://docs.googleapis.com/v1/documents/${doc.documentId}:batchUpdate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requests: [{
                        insertText: {
                            location: { index: 1 },
                            text: content
                        }
                    }]
                })
            });

            if (!updateResponse.ok) {
                throw new Error(`コンテンツ挿入エラー: ${updateResponse.status}`);
            }

            alert(`Google Docsへのアップロードが完了しました！\nドキュメント: ${doc.title}`);
            
            // ドキュメントを開くかどうか確認
            if (confirm('作成されたGoogle Docsドキュメントを開きますか？')) {
                window.open(`https://docs.google.com/document/d/${doc.documentId}/edit`, '_blank');
            }

        } catch (error) {
            console.error('Google Docsアップロードエラー:', error);
            alert(`アップロードエラー: ${error.message}`);
        }
    }    // エディタの内容を取得
    getEditorContent() {
        // メインエディタから取得
        const editor = document.getElementById('editor');
        if (editor && editor.value.trim()) {
            console.log('メインエディタからコンテンツを取得:', editor.value.length, '文字');
            return editor.value;
        }
        
        // フォールバック: アクティブなタブのコンテンツを取得
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) {
            const tabId = activeTab.dataset.tabId;
            const content = localStorage.getItem(`memo-${tabId}`) || '';
            console.log('アクティブタブからコンテンツを取得:', content.length, '文字');
            return content;
        }
        
        console.log('コンテンツが見つかりません');
        return '';
    }

    // イベントリスナーを設定
    setupEventListeners() {
        // DOM読み込み完了を待つ
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.attachButtonListener();
            });
        } else {
            this.attachButtonListener();
        }
    }

    // ボタンのイベントリスナーを設定
    attachButtonListener() {
        const uploadBtn = document.getElementById('google-docs-upload');
        if (uploadBtn) {
            // 既存のリスナーを削除
            uploadBtn.removeEventListener('click', this.handleUpload.bind(this));
            
            // 新しいリスナーを追加
            uploadBtn.addEventListener('click', async (event) => {
                event.preventDefault();
                console.log('Google Docsボタンがクリックされました');
                await this.handleUpload();
            });
            
            // 初期UI状態を設定
            this.updateAuthUI(this.isAuthenticated);
            
            console.log('Google Docsボタンのイベントリスナーを設定しました');
        } else {
            console.error('Google Docsボタンが見つかりません。ID: google-docs-upload');
        }
    }
}

// ES6 デフォルトエクスポート
export default GoogleDocsUploader;

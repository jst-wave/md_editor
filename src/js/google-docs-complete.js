/**
 * Google Docs OAuth Upload Functionality
 * 要件定義に基づく完全版実装
 */

class GoogleDocsUploader {
    constructor() {
        this.isAuthenticated = false;
        this.accessToken = null;
        this.userInfo = null;
        this.authServerUrl = 'http://localhost:3001';
        this.retryCount = 0;
        this.maxRetries = 3;
        
        console.log('GoogleDocsUploader 初期化完了');
        
        // 認証状態を復元
        this.restoreAuthState();
        
        // イベントリスナーを設定
        this.setupEventListeners();
        
        // UI要素を初期化
        this.initializeUI();
    }

    // 認証状態を復元
    restoreAuthState() {
        try {
            const authData = localStorage.getItem('google_auth_data');
            if (authData) {
                const data = JSON.parse(authData);
                
                // 有効期限をチェック
                if (data.expiresAt && data.expiresAt > Date.now()) {
                    this.accessToken = data.accessToken;
                    this.userInfo = data.userInfo;
                    this.isAuthenticated = true;
                    console.log('認証状態を復元しました:', this.userInfo?.name);
                } else {
                    console.log('認証トークンが期限切れです');
                    this.clearAuthState();
                }
            }
        } catch (error) {
            console.error('認証状態の復元エラー:', error);
            this.clearAuthState();
        }
    }

    // UI要素を初期化
    initializeUI() {
        this.updateButtonState();
        this.createUploadModal();
        this.addModalStyles();
    }

    // ボタンの状態を更新
    updateButtonState() {
        const button = document.getElementById('google-docs-btn');
        if (!button) return;

        if (this.isAuthenticated && this.userInfo) {
            button.textContent = `Google Docs (${this.userInfo.name})`;
            button.classList.add('authenticated');
        } else {
            button.textContent = 'Google Docs (ログイン)';
            button.classList.remove('authenticated');
        }
    }

    // モーダル用のスタイルを追加
    addModalStyles() {
        if (document.getElementById('upload-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'upload-modal-styles';
        style.textContent = `
            .modal {
                display: none;
                position: fixed;
                z-index: 10000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
            }

            .modal-content {
                background-color: #fefefe;
                margin: 10% auto;
                padding: 0;
                border: none;
                border-radius: 8px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            }

            .modal-header {
                background-color: #4285f4;
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
                position: relative;
            }

            .modal-header h3 {
                margin: 0;
                font-size: 18px;
            }

            .modal-header .close {
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 24px;
                cursor: pointer;
                user-select: none;
            }

            .modal-body {
                padding: 20px;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: #333;
            }

            .form-group input,
            .form-group select {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                box-sizing: border-box;
            }

            .error-message {
                background-color: #fee;
                color: #c33;
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 15px;
                border-left: 4px solid #c33;
            }

            .retry-section {
                text-align: center;
                padding: 10px;
            }

            .modal-footer {
                padding: 20px;
                text-align: right;
                border-top: 1px solid #eee;
                border-radius: 0 0 8px 8px;
            }

            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                margin-left: 10px;
                transition: background-color 0.2s;
            }

            .btn-primary {
                background-color: #4285f4;
                color: white;
            }

            .btn-primary:hover {
                background-color: #3367d6;
            }

            .btn-secondary {
                background-color: #f8f9fa;
                color: #3c4043;
                border: 1px solid #dadce0;
            }

            .btn-secondary:hover {
                background-color: #e8eaed;
            }

            .btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .progress-bar {
                width: 100%;
                height: 4px;
                background-color: #f0f0f0;
                border-radius: 2px;
                overflow: hidden;
                margin: 10px 0;
            }

            .progress-bar-fill {
                height: 100%;
                background-color: #4285f4;
                width: 0%;
                transition: width 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // アップロード設定モーダルを作成
    createUploadModal() {
        if (document.getElementById('upload-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'upload-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Google Docsにアップロード</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="document-title">ドキュメントタイトル:</label>
                        <input type="text" id="document-title" value="" placeholder="ドキュメントのタイトルを入力">
                    </div>
                    <div class="form-group">
                        <label for="upload-format">アップロード形式:</label>
                        <select id="upload-format">
                            <option value="markdown">Markdown（プレーンテキスト）</option>
                            <option value="html">HTML（フォーマット付き）</option>
                        </select>
                    </div>
                    <div class="progress-bar" id="upload-progress" style="display: none;">
                        <div class="progress-bar-fill" id="progress-fill"></div>
                    </div>
                    <div class="error-message" id="upload-error" style="display: none;"></div>
                    <div class="retry-section" id="retry-section" style="display: none;">
                        <button id="retry-btn" class="btn btn-secondary">🔄 リトライ</button>
                        <span id="retry-countdown"></span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="upload-execute-btn" class="btn btn-primary">📤 アップロード</button>
                    <button id="upload-cancel-btn" class="btn btn-secondary">キャンセル</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupModalEventListeners();
    }

    // モーダルのイベントリスナーを設定
    setupModalEventListeners() {
        const modal = document.getElementById('upload-modal');
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = document.getElementById('upload-cancel-btn');
        const executeBtn = document.getElementById('upload-execute-btn');
        const retryBtn = document.getElementById('retry-btn');

        // モーダルを閉じる
        const closeModal = () => {
            modal.style.display = 'none';
            this.resetModalState();
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // モーダル外をクリックして閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // アップロード実行
        executeBtn.addEventListener('click', () => {
            const title = document.getElementById('document-title').value.trim();
            const format = document.getElementById('upload-format').value;
            
            if (!title) {
                this.showError('ドキュメントタイトルを入力してください');
                return;
            }
            
            this.executeUpload(title, format);
        });

        // リトライ
        retryBtn.addEventListener('click', () => {
            const title = document.getElementById('document-title').value.trim();
            const format = document.getElementById('upload-format').value;
            this.executeUpload(title, format);
        });
    }

    // イベントリスナーを設定
    setupEventListeners() {
        // Google Docsボタンのクリックイベント
        const interval = setInterval(() => {
            const button = document.getElementById('google-docs-btn');
            if (button) {
                button.addEventListener('click', () => this.handleUpload());
                clearInterval(interval);
            }
        }, 100);
    }

    // メインのアップロード処理
    async handleUpload() {
        if (!this.isAuthenticated) {
            // 未認証の場合は認証を開始
            await this.startAuthentication();
            return;
        }

        // 認証済みの場合はアップロード設定画面を表示
        this.showUploadModal();
    }

    // アップロード設定画面を表示
    showUploadModal() {
        const modal = document.getElementById('upload-modal');
        const titleInput = document.getElementById('document-title');
        const formatSelect = document.getElementById('upload-format');
        
        // タブタイトルを自動設定
        const currentTitle = this.getCurrentTabTitle();
        titleInput.value = currentTitle;
        
        // 前回の設定を復元
        const lastFormat = localStorage.getItem('google_docs_last_format');
        if (lastFormat) {
            formatSelect.value = lastFormat;
        }
        
        this.resetModalState();
        modal.style.display = 'block';
        titleInput.focus();
    }

    // 現在のタブタイトルを取得
    getCurrentTabTitle() {
        if (window.getCurrentTabTitle) {
            return window.getCurrentTabTitle();
        }
        
        // フォールバック: ページタイトルを使用
        const pageTitle = document.title;
        if (pageTitle && pageTitle !== 'Markdown Editor') {
            return pageTitle;
        }
        
        return '新しいドキュメント';
    }

    // モーダルの状態をリセット
    resetModalState() {
        const errorDiv = document.getElementById('upload-error');
        const retrySection = document.getElementById('retry-section');
        const progressBar = document.getElementById('upload-progress');
        const executeBtn = document.getElementById('upload-execute-btn');
        
        errorDiv.style.display = 'none';
        retrySection.style.display = 'none';
        progressBar.style.display = 'none';
        executeBtn.disabled = false;
        executeBtn.textContent = '📤 アップロード';
        
        this.retryCount = 0;
    }

    // アップロード実行
    async executeUpload(title, format) {
        const executeBtn = document.getElementById('upload-execute-btn');
        const progressBar = document.getElementById('upload-progress');
        const progressFill = document.getElementById('progress-fill');
        
        try {
            executeBtn.disabled = true;
            executeBtn.textContent = '⏳ アップロード中...';
            progressBar.style.display = 'block';
            progressFill.style.width = '20%';
            
            // エディタの内容を取得
            const content = this.getEditorContent();
            if (!content.trim()) {
                throw new Error('アップロードするコンテンツがありません');
            }
            
            progressFill.style.width = '40%';
            
            // フォーマット変換
            const processedContent = await this.processContent(content, format);
            
            progressFill.style.width = '60%';
            
            // Google Docsドキュメントを作成
            const documentUrl = await this.createGoogleDoc(title, processedContent, format);
            
            progressFill.style.width = '100%';
            
            // 成功処理
            this.handleUploadSuccess(title, documentUrl, format);
            
        } catch (error) {
            console.error('アップロードエラー:', error);
            this.handleUploadError(error);
        }
    }

    // コンテンツを処理（フォーマット変換）
    async processContent(content, format) {
        if (format === 'html') {
            return this.convertMarkdownToHtml(content);
        }
        return content; // Markdown形式はそのまま
    }

    // Markdown を HTML に変換
    convertMarkdownToHtml(markdown) {
        try {
            // 簡易的なMarkdown→HTML変換
            let html = markdown
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                .replace(/\*(.*)\*/gim, '<em>$1</em>')
                .replace(/`(.*)`/gim, '<code>$1</code>')
                .replace(/\n\n/gim, '</p><p>')
                .replace(/\n/gim, '<br>');
            
            html = '<p>' + html + '</p>';
            return html;
        } catch (error) {
            console.error('Markdown変換エラー:', error);
            throw new Error('Markdown→HTML変換に失敗しました');
        }
    }

    // Google Docsドキュメントを作成
    async createGoogleDoc(title, content, format) {
        try {
            // ドキュメント作成
            const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title
                })
            });

            if (!createResponse.ok) {
                const errorData = await createResponse.json();
                throw new Error(`ドキュメント作成エラー: ${errorData.error?.message || createResponse.status}`);
            }

            const docData = await createResponse.json();
            const documentId = docData.documentId;

            // コンテンツを挿入
            const insertResponse = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requests: [{
                        insertText: {
                            location: {
                                index: 1
                            },
                            text: content
                        }
                    }]
                })
            });

            if (!insertResponse.ok) {
                const errorData = await insertResponse.json();
                throw new Error(`コンテンツ挿入エラー: ${errorData.error?.message || insertResponse.status}`);
            }

            // ドキュメントURLを返す
            return `https://docs.google.com/document/d/${documentId}/edit`;

        } catch (error) {
            console.error('Google Docs作成エラー:', error);
            
            if (error.message.includes('401')) {
                this.clearAuthState();
                throw new Error('認証が切れました。再度ログインしてください');
            }
            
            throw error;
        }
    }

    // アップロード成功処理
    handleUploadSuccess(title, documentUrl, format) {
        const modal = document.getElementById('upload-modal');
        
        // 設定を保存
        localStorage.setItem('google_docs_last_format', format);
        
        // モーダルを閉じる
        modal.style.display = 'none';
        
        // 成功通知
        const message = `「${title}」をGoogle Docsにアップロードしました！\n\nドキュメントを開きますか？`;
        if (confirm(message)) {
            window.open(documentUrl, '_blank');
        }
        
        this.resetModalState();
    }

    // アップロードエラー処理
    handleUploadError(error) {
        const executeBtn = document.getElementById('upload-execute-btn');
        const progressBar = document.getElementById('upload-progress');
        
        executeBtn.disabled = false;
        executeBtn.textContent = '📤 アップロード';
        progressBar.style.display = 'none';
        
        // エラー分類とメッセージ
        let errorMessage = error.message || 'アップロードに失敗しました';
        let showRetry = true;
        
        if (error.message.includes('認証')) {
            errorMessage = '認証エラー: ' + error.message;
            showRetry = false;
        } else if (error.message.includes('ネットワーク')) {
            errorMessage = 'ネットワークエラー: ' + error.message;
        } else if (error.message.includes('API')) {
            errorMessage = 'Google APIエラー: ' + error.message;
        }
        
        this.showError(errorMessage, showRetry);
    }

    // エラーメッセージを表示
    showError(message, showRetry = true) {
        const errorDiv = document.getElementById('upload-error');
        const retrySection = document.getElementById('retry-section');
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        if (showRetry && this.retryCount < this.maxRetries) {
            retrySection.style.display = 'block';
        } else {
            retrySection.style.display = 'none';
        }
    }

    // エディタの内容を取得
    getEditorContent() {
        if (window.getMarkdownContent) {
            return window.getMarkdownContent();
        }
        
        // フォールバック
        const editor = document.getElementById('editor');
        return editor ? editor.value || '' : '';
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
                    
                    // ローカルストレージに保存（有効期限付き）
                    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24時間後
                    localStorage.setItem('google_auth_data', JSON.stringify({
                        accessToken: this.accessToken,
                        userInfo: this.userInfo,
                        timestamp: Date.now(),
                        expiresAt: expiresAt
                    }));
                    
                    this.updateButtonState();
                    alert(`Google認証が完了しました。こんにちは、${this.userInfo.name}さん！`);
                    
                    // 認証完了後、アップロード画面を表示
                    setTimeout(() => {
                        this.showUploadModal();
                    }, 500);
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

    // 認証状態をクリア
    clearAuthState() {
        this.isAuthenticated = false;
        this.accessToken = null;
        this.userInfo = null;
        localStorage.removeItem('google_auth_data');
        this.updateButtonState();
    }

    // ログアウト
    logout() {
        this.clearAuthState();
        alert('Google Docsからログアウトしました。');
    }
}

// ES6モジュールとしてエクスポート
export default GoogleDocsUploader;

/**
 * Google Docs Upload Functionality
 * Google APIを使用してMarkdownコンテンツをGoogle Docsにアップロードする機能
 */

class GoogleDocsUploader {
    constructor() {
        this.isAuthenticated = false;
        this.gapi = null;
        this.accessToken = null;
        
        // Google API設定 (開発者が設定する必要があります)
        this.CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // 実際のクライアントIDに置き換える
        this.API_KEY = 'YOUR_GOOGLE_API_KEY'; // 実際のAPIキーに置き換える
        this.DISCOVERY_DOC = 'https://docs.googleapis.com/$discovery/rest?version=v1';
        this.SCOPES = 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file';
        
        this.init();
    }

    /**
     * Google API初期化
     */
    async init() {
        try {
            // Google API読み込み完了を待つ
            await this.waitForGoogleAPI();
            
            // gapi初期化
            await new Promise((resolve) => {
                gapi.load('auth2:client:picker', resolve);
            });

            await gapi.client.init({
                apiKey: this.API_KEY,
                clientId: this.CLIENT_ID,
                discoveryDocs: [this.DISCOVERY_DOC],
                scope: this.SCOPES
            });

            // 認証状態の確認
            const authInstance = gapi.auth2.getAuthInstance();
            this.isAuthenticated = authInstance.isSignedIn.get();
            
            if (this.isAuthenticated) {
                this.updateUIForAuthenticatedState();
            }

            console.log('Google API初期化完了');
        } catch (error) {
            console.error('Google API初期化エラー:', error);
            this.showError('Google APIの初期化に失敗しました。');
        }
    }

    /**
     * Google API読み込み完了を待つ
     */
    waitForGoogleAPI() {
        return new Promise((resolve, reject) => {
            const maxAttempts = 50;
            let attempts = 0;
            
            const checkAPI = () => {
                attempts++;
                if (typeof gapi !== 'undefined' && gapi.load) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Google API読み込みタイムアウト'));
                } else {
                    setTimeout(checkAPI, 100);
                }
            };
            
            checkAPI();
        });
    }

    /**
     * Google認証
     */
    async authenticate() {
        try {
            this.showStatus('認証中...', 'loading');
            
            const authInstance = gapi.auth2.getAuthInstance();
            const user = await authInstance.signIn();
            
            this.isAuthenticated = true;
            this.accessToken = user.getAuthResponse().access_token;
            
            this.updateUIForAuthenticatedState();
            this.showStatus('認証成功！', 'success');
            
        } catch (error) {
            console.error('認証エラー:', error);
            this.showError('認証に失敗しました。');
        }
    }

    /**
     * Markdownをハイドテキストに変換
     */
    markdownToHtml(markdown) {
        // 基本的なMarkdown変換
        let html = markdown
            // ヘッダー
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // 太字
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            // イタリック
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            // コード
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // リンク
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            // 改行
            .replace(/\n/g, '<br>');

        return html;
    }

    /**
     * Google Docsに新しいドキュメントを作成
     */
    async createGoogleDoc(title, content, format) {
        try {
            this.showStatus('ドキュメント作成中...', 'loading');

            // Google Docs APIでドキュメント作成
            const response = await gapi.client.docs.documents.create({
                resource: {
                    title: title
                }
            });

            const documentId = response.result.documentId;
            
            // コンテンツの挿入
            await this.insertContentToDoc(documentId, content, format);
            
            const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;
            this.showStatus(`アップロード成功！ <a href="${docUrl}" target="_blank">ドキュメントを開く</a>`, 'success');
            
            return docUrl;
            
        } catch (error) {
            console.error('ドキュメント作成エラー:', error);
            this.showError('ドキュメントの作成に失敗しました。');
            throw error;
        }
    }

    /**
     * ドキュメントにコンテンツを挿入
     */
    async insertContentToDoc(documentId, content, format) {
        try {
            let processedContent;
            
            if (format === 'html') {
                // HTMLの場合は、Google Docsで対応できるよう簡略化
                processedContent = this.markdownToHtml(content);
                // Google DocsはHTMLの直接挿入をサポートしていないため、
                // プレーンテキストとして挿入し、後で手動で整形する
                processedContent = this.stripHtmlTags(processedContent);
            } else {
                // Markdownの場合はそのまま
                processedContent = content;
            }

            const requests = [
                {
                    insertText: {
                        location: {
                            index: 1
                        },
                        text: processedContent
                    }
                }
            ];

            await gapi.client.docs.documents.batchUpdate({
                documentId: documentId,
                resource: {
                    requests: requests
                }
            });

        } catch (error) {
            console.error('コンテンツ挿入エラー:', error);
            throw error;
        }
    }

    /**
     * HTMLタグを除去してプレーンテキストに変換
     */
    stripHtmlTags(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    /**
     * アップロード処理
     */
    async uploadToGoogleDocs() {
        try {
            if (!this.isAuthenticated) {
                this.showError('先にGoogle認証を行ってください。');
                return;
            }

            const title = document.getElementById('doc-title').value.trim();
            if (!title) {
                this.showError('ドキュメントタイトルを入力してください。');
                return;
            }

            const format = document.querySelector('input[name="upload-format"]:checked').value;
            const content = window.editorApp ? window.editorApp.getCurrentContent() : '';
            
            if (!content.trim()) {
                this.showError('アップロードするコンテンツがありません。');
                return;
            }

            await this.createGoogleDoc(title, content, format);
            
        } catch (error) {
            console.error('アップロードエラー:', error);
            this.showError('アップロードに失敗しました。');
        }
    }

    /**
     * UI状態を認証済みに更新
     */
    updateUIForAuthenticatedState() {
        const authSection = document.getElementById('auth-section');
        const uploadSection = document.getElementById('upload-section');
        
        if (authSection) authSection.classList.add('hidden');
        if (uploadSection) uploadSection.classList.remove('hidden');
    }

    /**
     * ステータスメッセージ表示
     */
    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('upload-status');
        if (statusElement) {
            statusElement.innerHTML = message;
            statusElement.className = `status-message ${type}`;
        }
    }

    /**
     * エラーメッセージ表示
     */
    showError(message) {
        this.showStatus(message, 'error');
    }    /**
     * モーダルを開く
     */
    openModal() {
        const modal = document.getElementById('google-upload-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // タイトルフィールドにデフォルト値を設定
            const titleField = document.getElementById('doc-title');
            if (titleField && !titleField.value.trim()) {
                // 現在のタブのタイトルを使用、それがなければデフォルト値
                let defaultTitle = 'Untitled';
                if (window.editorApp && typeof window.editorApp.getCurrentTabTitle === 'function') {
                    const tabTitle = window.editorApp.getCurrentTabTitle();
                    if (tabTitle && tabTitle !== 'Untitled') {
                        defaultTitle = tabTitle;
                    } else {
                        const currentDate = new Date().toLocaleDateString('ja-JP');
                        defaultTitle = `メモ - ${currentDate}`;
                    }
                } else {
                    const currentDate = new Date().toLocaleDateString('ja-JP');
                    defaultTitle = `メモ - ${currentDate}`;
                }
                titleField.value = defaultTitle;
            }
        }
    }

    /**
     * モーダルを閉じる
     */
    closeModal() {
        const modal = document.getElementById('google-upload-modal');
        if (modal) {
            modal.classList.add('hidden');
            
            // ステータスをクリア
            this.showStatus('', '');
        }
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // Google Docs アップロードボタン
        const googleDocsBtn = document.getElementById('google-docs-upload');
        if (googleDocsBtn) {
            googleDocsBtn.addEventListener('click', () => this.openModal());
        }

        // 認証ボタン
        const authBtn = document.getElementById('google-auth-btn');
        if (authBtn) {
            authBtn.addEventListener('click', () => this.authenticate());
        }

        // アップロードボタン
        const uploadBtn = document.getElementById('upload-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.uploadToGoogleDocs());
        }

        // キャンセルボタン
        const cancelBtn = document.getElementById('cancel-upload');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        // モーダル閉じるボタン
        const closeBtn = document.getElementById('close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // モーダル外クリックで閉じる
        const modal = document.getElementById('google-upload-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }
}

// インスタンス作成とイベントリスナー設定
let googleDocsUploader;

document.addEventListener('DOMContentLoaded', () => {
    googleDocsUploader = new GoogleDocsUploader();
    googleDocsUploader.setupEventListeners();
});

// グローバルにエクスポート
window.GoogleDocsUploader = GoogleDocsUploader;

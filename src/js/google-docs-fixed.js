/**
 * Google Docs Upload Functionality
 */

class GoogleDocsUploader {
    constructor() {
        this.isAuthenticated = false;
        this.isConfigured = false;
        console.log('GoogleDocsUploader初期化完了');
        
        // コンストラクタ内で直接イベントリスナーを設定
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // DOM読み込み完了後に実行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
            });
        } else {
            this.setupEventListeners();
        }
    }

    async uploadToGoogleDocs(content, title = 'Untitled Document') {
        console.log('Google Docs アップロード機能が呼び出されました');
        console.log('アップロード内容:', content ? content.substring(0, 100) + '...' : '空');
        alert('Google Docs機能は設定が必要です。設定を完了してください。');
    }

    setupEventListeners() {
        console.log('setupEventListeners開始');
        const uploadBtn = document.getElementById('google-docs-upload');
        console.log('setupEventListeners内でボタン検索:', uploadBtn);
        
        if (uploadBtn) {
            console.log('setupEventListeners内でボタンが見つかりました');
            
            // 既存のイベントリスナーをクリア（重複防止）
            if (this.handleClick) {
                uploadBtn.removeEventListener('click', this.handleClick);
            }
            
            // バインドしたメソッドを保存
            this.handleClick = (e) => {
                console.log('GoogleDocsUploaderのクリックイベントが発火！');
                e.preventDefault();
                const content = window.getMarkdownContent ? window.getMarkdownContent() : '';
                console.log('取得されたコンテンツ:', content ? content.substring(0, 50) + '...' : '空');
                this.uploadToGoogleDocs(content);
            };
            
            uploadBtn.addEventListener('click', this.handleClick);
            console.log('Google Docsボタンのイベントリスナーを設定しました');
        } else {
            console.error('Google Docsボタンが見つかりません。ID: google-docs-upload');
            
            // 5秒後に再試行
            setTimeout(() => {
                console.log('5秒後にGoogle Docsボタンの設定を再試行...');
                this.setupEventListeners();
            }, 5000);
        }
    }
}

export default GoogleDocsUploader;

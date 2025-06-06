// app.js - メインアプリケーション

// CSSファイルをインポート
import '../css/style.css';

// 他のモジュールをインポート
import { StorageManager } from './storage.js';
import { MarkdownRenderer } from './markdown.js';
import { SearchManager } from './search.js';
import { TabManager } from './tabs.js';
import { EditorManager } from './editor.js';
import GoogleDocsUploader from './google-docs-simple.js';

class MemoApp {
    constructor() {
        this.isInitialized = false;
        this.version = '1.0.0';
        
        // コンポーネントインスタンスを初期化（依存関係注入）
        this.storageManager = new StorageManager();
        this.markdownRenderer = new MarkdownRenderer();
        this.searchManager = new SearchManager();
        this.tabManager = new TabManager(this.storageManager);
        this.editorManager = new EditorManager(this.storageManager, this.markdownRenderer);
        
        // エディタマネージャーにタブマネージャーの参照を設定
        this.editorManager.tabManager = this.tabManager;
        this.editorManager.searchManager = this.searchManager;
    }

    // アプリケーションを初期化
    async initialize() {
        if (this.isInitialized) return;

        console.log(`メモ帳アプリ v${this.version} を初期化中...`);

        try {
            // 各コンポーネントを初期化
            this.initializeComponents();
            
            // イベントリスナーを設定
            this.setupGlobalEventListeners();
            
            // 初期データを読み込み
            this.loadInitialData();

            this.isInitialized = true;
            console.log('アプリケーションの初期化が完了しました');

            // 初期化完了後の処理
            this.onInitializationComplete();

        } catch (error) {
            console.error('アプリケーションの初期化に失敗しました:', error);
            this.showErrorMessage('アプリケーションの初期化に失敗しました。ページを再読み込みしてください。');
        }
    }

    // 各コンポーネントを初期化
    initializeComponents() {
        // エディタマネージャーを初期化
        this.editorManager.initialize();

        // タブマネージャーを初期化
        this.tabManager.initialize();

        // 検索マネージャーを初期化
        this.searchManager.setupEventListeners();

        // マークダウンレンダラーを初期化（DOM確認後）
        const editorElement = document.getElementById('editor');
        const previewElement = document.getElementById('preview');
        
        if (editorElement && previewElement) {
            // エディタマネージャーの要素参照を更新
            this.editorManager.editor = editorElement;
            this.editorManager.preview = previewElement;
            
            // ライブプレビューをセットアップ
            this.markdownRenderer.setupLivePreview(editorElement, previewElement);
        } else {
            console.error('エディタまたはプレビュー要素が見つかりません');
        }
    }

    // グローバルイベントリスナーを設定
    setupGlobalEventListeners() {
        // 検索・置換パネルの切り替え
        const searchToggle = document.getElementById('search-toggle');
        searchToggle?.addEventListener('click', () => {
            this.searchManager.toggleSearchPanel();
        });

        // プレビュー表示の切り替え
        const togglePreview = document.getElementById('toggle-preview');
        togglePreview?.addEventListener('click', () => {
            this.editorManager.togglePreview();
        });

        // 新しいタブの追加
        const addTab = document.getElementById('add-tab');
        addTab?.addEventListener('click', () => {
            this.tabManager.createNewTab();
        });

        // マークダウンファイルの保存（ダウンロード）
        const saveMarkdown = document.getElementById('save-markdown');
        saveMarkdown?.addEventListener('click', () => {
            this.editorManager.downloadAsMarkdown();
        });

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeydown(e);
        });

        // ウィンドウのリサイズイベント
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });

        // ページを離れる前の保存
        window.addEventListener('beforeunload', (e) => {
            this.handleBeforeUnload(e);
        });

        // オンライン/オフライン状態の監視
        window.addEventListener('online', () => {
            this.handleOnlineStatusChange(true);
        });

        window.addEventListener('offline', () => {
            this.handleOnlineStatusChange(false);
        });

        // エラーハンドリング
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });

        // Promise のエラーハンドリング
        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e);
        });
    }

    // 初期データを読み込み
    loadInitialData() {
        // タブマネージャーで自動的に処理されるため、特別な処理は不要
    }

    // 初期化完了後の処理
    onInitializationComplete() {
        // アプリケーションの準備完了を示すスタイルクラスを追加
        document.body.classList.add('app-ready');

        // Google Docs機能を初期化
        this.initializeGoogleDocs();

        // 初回起動時のヘルプメッセージ
        this.showWelcomeMessageIfFirstTime();

        // パフォーマンス測定
        if (performance.mark) {
            performance.mark('app-ready');
        }
    }

    // Google Docs機能を初期化
    initializeGoogleDocs() {
        console.log('Google Docs機能を初期化中...');
        
        // DOM読み込み完了を待つ
        const initializeWhenReady = () => {
            const googleDocsBtn = document.getElementById('google-docs-upload');
            console.log('Google Docsボタン:', googleDocsBtn);
            console.log('Google Docsボタンが存在:', !!googleDocsBtn);
            console.log('GoogleDocsUploaderクラス:', GoogleDocsUploader);
            console.log('GoogleDocsUploaderタイプ:', typeof GoogleDocsUploader);
            
            if (googleDocsBtn) {
                console.log('Google Docsボタンが見つかりました');
                
                // 既存のインスタンスがない場合は新しく作成
                if (!window.googleDocsUploader) {
                    try {
                        console.log('GoogleDocsUploaderクラス:', GoogleDocsUploader);
                        console.log('GoogleDocsUploaderタイプ:', typeof GoogleDocsUploader);
                        
                        if (typeof GoogleDocsUploader === 'function') {
                            window.googleDocsUploader = new GoogleDocsUploader();
                            console.log('GoogleDocsUploaderインスタンスを作成しました');
                        } else {
                            throw new Error('GoogleDocsUploaderクラスが見つからないか、関数ではありません');
                        }
                    } catch (error) {
                        console.error('GoogleDocsUploaderインスタンス作成エラー:', error);
                        console.log('エラーの詳細:', error.stack);
                        return;
                    }
                }
                
                // イベントリスナーを設定
                if (window.googleDocsUploader.setupEventListeners) {
                    try {
                        window.googleDocsUploader.setupEventListeners();
                        console.log('Google Docsイベントリスナーを設定しました');
                    } catch (error) {
                        console.error('Google Docsイベントリスナー設定エラー:', error);
                    }
                }
                
                // グローバルに公開
                window.GoogleDocsUploader = GoogleDocsUploader;
                
                // バックアップ用：直接イベントリスナーを追加
                googleDocsBtn.addEventListener('click', function(e) {
                    console.log('直接追加されたクリックイベントが発火しました');
                    
                    // GoogleDocsUploaderのメソッドを直接呼び出し
                    if (window.googleDocsUploader && window.googleDocsUploader.uploadToGoogleDocs) {
                        const content = window.getMarkdownContent ? window.getMarkdownContent() : '';
                        window.googleDocsUploader.uploadToGoogleDocs(content);
                    }
                });
                
            } else {
                console.error('Google Docsボタンが見つかりません');
                console.log('DOM内のすべてのボタン:');
                const allButtons = document.querySelectorAll('button');
                allButtons.forEach((btn, i) => {
                    console.log(`  ${i}: id="${btn.id}" text="${btn.textContent.trim()}"`);
                });
                
                // 5秒後に再試行
                setTimeout(() => {
                    console.log('Google Docsボタンの初期化を再試行...');
                    initializeWhenReady();
                }, 5000);
            }
        };
        
        // 即座に実行または DOM読み込み完了を待つ
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeWhenReady);
        } else {
            initializeWhenReady();
        }
    }

    // グローバルキーボードショートカットの処理
    handleGlobalKeydown(e) {
        // エディタにフォーカスがある場合は、エディタレベルで処理されるため
        // ここではバックアップとして機能
        const activeElement = document.activeElement;
        const isEditorFocused = activeElement && activeElement.id === 'editor';
        
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    // エディタレベルで処理されない場合のバックアップ
                    if (!isEditorFocused) {
                        e.preventDefault();
                        if (this.editorManager) {
                            this.editorManager.downloadAsMarkdown();
                        }
                    }
                    break;
                case 't':
                    // エディタレベルで処理されない場合のバックアップ
                    if (!isEditorFocused) {
                        e.preventDefault();
                        this.tabManager.createNewTab();
                    }
                    break;
                case 'w':
                    // エディタレベルで処理されない場合のバックアップ
                    if (!isEditorFocused) {
                        e.preventDefault();
                        const activeTab = this.tabManager.getActiveTab();
                        if (activeTab) {
                            this.tabManager.closeTab(activeTab.id);
                        }
                    }
                    break;
                case 'f':
                    // エディタレベルで処理されない場合のバックアップ
                    if (!isEditorFocused) {
                        e.preventDefault();
                        this.searchManager.toggleSearchPanel();
                    }
                    break;
            }
        }

        // Escapeキーで検索パネルを閉じる
        if (e.key === 'Escape') {
            if (this.searchManager && this.searchManager.isSearchVisible) {
                this.searchManager.closeSearchPanel();
            }
        }
    }

    // ウィンドウリサイズの処理
    handleWindowResize() {
        // レスポンシブ対応の調整など
        this.adjustLayoutForScreenSize();
    }

    // ページを離れる前の処理
    handleBeforeUnload(e) {
        // 現在のタブを保存
        if (this.tabManager) {
            this.tabManager.saveCurrentTab();
        }

        // 未保存の変更がある場合は警告
        const hasUnsavedChanges = this.hasUnsavedChanges();
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '未保存の変更があります。ページを離れますか？';
            return e.returnValue;
        }
    }

    // オンライン/オフライン状態の変更処理
    handleOnlineStatusChange(isOnline) {
        const statusMessage = isOnline ? 'オンライン' : 'オフライン';
        console.log(`接続状態: ${statusMessage}`);
        
        // 将来の拡張：クラウド同期機能など
    }

    // グローバルエラーの処理
    handleGlobalError(e) {
        console.error('グローバルエラー:', e.error);
        this.showErrorMessage('予期しないエラーが発生しました。');
    }

    // 未処理のPromise拒否の処理
    handleUnhandledRejection(e) {
        console.error('未処理のPromise拒否:', e.reason);
        this.showErrorMessage('非同期処理でエラーが発生しました。');
    }

    // 画面サイズに応じたレイアウト調整
    adjustLayoutForScreenSize() {
        const isMobile = window.innerWidth <= 768;
        document.body.classList.toggle('mobile-layout', isMobile);
    }

    // 未保存の変更があるかチェック
    hasUnsavedChanges() {
        if (!this.tabManager) return false;
        
        const tabs = this.tabManager.getAllTabs();
        return tabs.some(tab => tab.isModified);
    }

    // 初回起動時のウェルカムメッセージ
    showWelcomeMessageIfFirstTime() {
        const hasVisited = localStorage.getItem('memo_app_visited');
        if (!hasVisited) {
            localStorage.setItem('memo_app_visited', 'true');
            
            // サンプルテキストを表示
            const sampleText = `# メモ帳アプリへようこそ！

このアプリの使い方：

## 基本機能
- **マークダウン記法**でテキストを装飾できます
- **タブ機能**で複数のメモを管理
- **プレビュー機能**でリアルタイム表示
- **検索・置換機能**で効率的な編集

## キーボードショートカット
- \`Ctrl+S\`: マークダウンファイルとしてダウンロード保存
- \`Ctrl+Alt+S\`: ブラウザ内での保存（自動保存も利用可能）
- \`Ctrl+T\`: 新しいタブ
- \`Ctrl+W\`: タブを閉じる
- \`Ctrl+F\`: 検索・置換
- \`Ctrl+B\`: 太字
- \`Ctrl+I\`: 斜体

## 保存について
- **自動保存**: メモは自動的にブラウザに保存され、次回起動時に復元されます
- **ファイル保存**: Ctrl+Sで.mdファイルとしてローカルにダウンロード保存できます

Happy Writing! 📝`;

            if (this.editorManager) {
                this.editorManager.setContent(sampleText);
            }
        }
    }

    // エラーメッセージを表示
    showErrorMessage(message) {
        // 簡易実装：alert を使用
        // 将来の改善：カスタム通知システム
        alert(`エラー: ${message}`);
    }

    // 成功メッセージを表示
    showSuccessMessage(message) {
        console.log(`成功: ${message}`);
        // 将来の改善：カスタム通知システム
    }

    // アプリケーションの状態を取得
    getAppState() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            tabCount: this.tabManager ? this.tabManager.getAllTabs().length : 0,
            activeTabId: this.tabManager ? this.tabManager.activeTabId : null,
            isSearchVisible: this.searchManager ? this.searchManager.isSearchVisible : false,
            isPreviewVisible: this.editorManager ? this.editorManager.isPreviewVisible : false
        };
    }

    // デバッグ情報を出力
    debug() {
        console.group('メモ帳アプリ デバッグ情報');
        console.log('アプリケーション状態:', this.getAppState());
        
        console.log('保存されているメモ:', this.storageManager.getAllMemos());
        console.log('タブ情報:', this.storageManager.getTabs());
        
        console.groupEnd();
    }

    // 現在のエディタコンテンツを取得（Google Docs連携用）
    getCurrentContent() {
        if (this.editorManager && this.editorManager.editor) {
            return this.editorManager.editor.value;
        }
        return '';
    }

    // 現在のタブのタイトルを取得（Google Docs連携用）
    getCurrentTabTitle() {
        if (this.tabManager) {
            const activeTab = this.tabManager.getActiveTab();
            return activeTab ? activeTab.title : 'Untitled';
        }
        return 'Untitled';
    }

    // プレビュー機能専用デバッグ
    debugPreview() {
        console.group('プレビュー機能デバッグ');
        
        // DOM要素の確認
        const editor = document.getElementById('editor');
        const preview = document.getElementById('preview');
        const previewPane = document.getElementById('preview-pane');
        const toggleButton = document.getElementById('toggle-preview');
        
        console.log('DOM要素:');
        console.log('  - Editor:', !!editor, editor);
        console.log('  - Preview:', !!preview, preview);
        console.log('  - Preview Pane:', !!previewPane, previewPane);
        console.log('  - Toggle Button:', !!toggleButton, toggleButton);
        
        // アプリケーション状態
        console.log('アプリケーション状態:');
        console.log('  - editorManager.editor:', !!this.editorManager.editor);
        console.log('  - editorManager.preview:', !!this.editorManager.preview);
        console.log('  - editorManager.isPreviewVisible:', this.editorManager.isPreviewVisible);
        console.log('  - markdownRenderer:', !!this.markdownRenderer);
        
        // CSS クラスの確認
        if (previewPane) {
            console.log('Preview Pane Classes:', previewPane.className);
            console.log('Preview Pane Hidden:', previewPane.classList.contains('hidden'));
        }
        
        // プレビュー切り替えテスト
        console.log('プレビュー切り替えテストを実行...');
        try {
            this.editorManager.togglePreview();
            console.log('✓ プレビュー切り替え成功');
        } catch (error) {
            console.error('✗ プレビュー切り替え失敗:', error);
        }
        
        console.groupEnd();
    }
}

// アプリケーションのインスタンスを作成
const memoApp = new MemoApp();

// Google Docs統合用のグローバル関数
window.getMarkdownContent = function() {
    if (memoApp && memoApp.editorManager && memoApp.editorManager.editor) {
        return memoApp.editorManager.editor.value || '';
    }
    
    // フォールバック: 直接DOM要素を取得
    const editor = document.getElementById('editor');
    return editor ? editor.value || '' : '';
};

// 現在のタブタイトルを取得
window.getCurrentTabTitle = function() {
    if (memoApp && memoApp.tabManager) {
        const activeTab = memoApp.tabManager.getActiveTab();
        return activeTab ? activeTab.title : '新しいドキュメント';
    }
    return '新しいドキュメント';
};

// DOMが読み込まれたらアプリケーションを初期化
document.addEventListener('DOMContentLoaded', () => {
    memoApp.initialize();
});

// デバッグ用・他のモジュールからのアクセス用：グローバルオブジェクトとして公開
window.memoApp = memoApp;
window.editorApp = memoApp; // Google Docs連携用のエイリアス
window.storageManager = memoApp.storageManager;
window.markdownRenderer = memoApp.markdownRenderer;
window.searchManager = memoApp.searchManager;
window.tabManager = memoApp.tabManager;
window.editorManager = memoApp.editorManager;
// app.js - メインアプリケーション (簡素化版)

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
        
        // コンポーネントインスタンスを初期化
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

            // Google Docs機能を初期化
            await this.initializeGoogleDocs();

        } catch (error) {
            console.error('アプリケーションの初期化に失敗しました:', error);
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

        // マークダウンレンダラーを初期化
        const editorElement = document.getElementById('editor');
        const previewElement = document.getElementById('preview');
        
        if (editorElement && previewElement) {
            this.editorManager.editor = editorElement;
            this.editorManager.preview = previewElement;
            this.markdownRenderer.setupLivePreview(editorElement, previewElement);
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

        // マークダウンファイルの保存
        const saveMarkdown = document.getElementById('save-markdown');
        saveMarkdown?.addEventListener('click', () => {
            this.editorManager.downloadAsMarkdown();
        });
    }

    // 初期データを読み込み
    loadInitialData() {
        // タブマネージャーで自動的に処理される
    }

    // Google Docs機能を初期化
    async initializeGoogleDocs() {
        console.log('Google Docs機能を初期化中...');
        
        try {
            // GoogleDocsUploaderインスタンスを作成
            window.googleDocsUploader = new GoogleDocsUploader();
            console.log('GoogleDocsUploaderインスタンスを作成しました');
            
            // グローバルヘルパー関数を設定
            window.getMarkdownContent = () => {
                const editor = document.getElementById('editor');
                return editor ? editor.value || '' : '';
            };
            
            window.getCurrentTabTitle = () => {
                if (this.tabManager) {
                    const activeTab = this.tabManager.getActiveTab();
                    return activeTab ? activeTab.title : '新しいドキュメント';
                }
                return '新しいドキュメント';
            };
            
            console.log('Google Docs機能の初期化が完了しました');
            
        } catch (error) {
            console.error('Google Docs機能の初期化エラー:', error);
        }
    }

    // 現在のエディタコンテンツを取得
    getCurrentContent() {
        const editor = document.getElementById('editor');
        return editor ? editor.value || '' : '';
    }

    // 現在のタブのタイトルを取得
    getCurrentTabTitle() {
        if (this.tabManager) {
            const activeTab = this.tabManager.getActiveTab();
            return activeTab ? activeTab.title : 'Untitled';
        }
        return 'Untitled';
    }
}

// アプリケーションのインスタンスを作成
const memoApp = new MemoApp();

// DOMが読み込まれたらアプリケーションを初期化
document.addEventListener('DOMContentLoaded', () => {
    memoApp.initialize();
});

// デバッグ用：グローバルオブジェクトとして公開
window.memoApp = memoApp;

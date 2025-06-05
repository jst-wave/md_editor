// tabs.js - タブ管理機能

export class TabManager {
    constructor(storageManager = null) {
        this.storageManager = storageManager;
        this.tabs = [];
        this.activeTabId = null;
        this.tabContainer = document.getElementById('tab-list');
        this.isLoading = false;
    }

    // タブを初期化
    initialize() {
        this.loadTabsFromStorage();
        this.setupEventListeners();
        
        // タブが存在しない場合は新しいタブを作成
        if (this.tabs.length === 0) {
            this.createNewTab();
        } else {
            // 前回のアクティブタブを復元
            const savedActiveTabId = this.storageManager.getActiveTabId();
            const activeTab = this.tabs.find(tab => tab.id === savedActiveTabId);
            if (activeTab) {
                this.switchToTab(activeTab.id);
            } else {
                this.switchToTab(this.tabs[0].id);
            }
        }
    }

    // 新しいタブを作成
    createNewTab(content = '', title = null) {
        const tabId = this.storageManager.generateUniqueId();
        const tabTitle = title || '無題のメモ';
        
        const tab = {
            id: tabId,
            title: tabTitle,
            content: content,
            lastModified: new Date().toISOString(),
            isModified: false
        };

        this.tabs.push(tab);
        this.renderTabs();
        this.switchToTab(tabId);
        this.saveTabsToStorage();

        // メモをストレージに保存
        this.storageManager.saveMemo(tabId, content, tabTitle);

        return tab;
    }

    // タブを閉じる
    closeTab(tabId) {
        const tabIndex = this.tabs.findIndex(tab => tab.id === tabId);
        if (tabIndex === -1) return;

        const tab = this.tabs[tabIndex];

        // 変更があるかチェック（必要に応じて保存確認）
        if (tab.isModified) {
            this.saveCurrentTab();
        }

        // タブを削除
        this.tabs.splice(tabIndex, 1);
        
        // ストレージからメモを削除
        this.storageManager.deleteMemo(tabId);

        // 最後のタブの場合は新しいタブを作成
        if (this.tabs.length === 0) {
            this.createNewTab();
        } else {
            // アクティブタブが削除された場合は別のタブに切り替え
            if (this.activeTabId === tabId) {
                const newActiveIndex = Math.min(tabIndex, this.tabs.length - 1);
                this.switchToTab(this.tabs[newActiveIndex].id);
            }
        }

        this.renderTabs();
        this.saveTabsToStorage();
    }

    // タブを切り替え
    switchToTab(tabId) {
        // 現在のタブを保存
        if (this.activeTabId && this.activeTabId !== tabId) {
            this.saveCurrentTab();
        }

        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        this.activeTabId = tabId;
        this.renderTabs();

        // エディタに内容を読み込み
        const editor = document.getElementById('editor');
        if (editor) {
            this.isLoading = true;
            editor.value = tab.content || '';
            this.isLoading = false;

            // プレビューを更新
            if (window.memoApp && window.memoApp.markdownRenderer) {
                const preview = document.getElementById('preview');
                const previewPane = document.getElementById('preview-pane');
                // プレビューが表示されている場合のみ更新
                if (preview && previewPane && !previewPane.classList.contains('hidden')) {
                    window.memoApp.markdownRenderer.updatePreview(editor.value, preview);
                }
            }

            // 文字数を更新
            this.updateCharCount(editor.value);
        }

        // アクティブタブをストレージに保存
        this.storageManager.saveActiveTabId(tabId);
    }

    // 現在のタブを保存
    saveCurrentTab() {
        if (!this.activeTabId) return;

        const editor = document.getElementById('editor');
        if (!editor) return;

        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;

        const content = editor.value;
        const newTitle = this.storageManager.generateTitle(content);

        // タブ情報を更新
        tab.content = content;
        tab.title = newTitle;
        tab.lastModified = new Date().toISOString();
        tab.isModified = false;

        // ストレージに保存
        this.storageManager.saveMemo(this.activeTabId, content, newTitle);
        this.saveTabsToStorage();
        this.renderTabs();

        // 保存状態を表示
        this.updateSaveStatus(true);
    }

    // タブを複製
    duplicateTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;

        const newTab = this.createNewTab(tab.content, tab.title + ' のコピー');
        return newTab;
    }

    // タブをレンダリング
    renderTabs() {
        if (!this.tabContainer) return;

        this.tabContainer.innerHTML = '';

        this.tabs.forEach(tab => {
            const li = document.createElement('li');
            li.className = `tab ${tab.id === this.activeTabId ? 'active' : ''}`;
            li.dataset.tabId = tab.id;

            const titleSpan = document.createElement('span');
            titleSpan.className = 'tab-title';
            titleSpan.textContent = tab.title + (tab.isModified ? ' •' : '');
            titleSpan.title = tab.title;

            const closeButton = document.createElement('button');
            closeButton.className = 'tab-close';
            closeButton.textContent = '×';
            closeButton.title = 'タブを閉じる';

            li.appendChild(titleSpan);
            li.appendChild(closeButton);

            // タブクリックイベント
            titleSpan.addEventListener('click', () => {
                this.switchToTab(tab.id);
            });

            // 閉じるボタンイベント
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeTab(tab.id);
            });

            // 右クリックメニュー（将来の拡張用）
            li.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showTabContextMenu(e, tab.id);
            });

            this.tabContainer.appendChild(li);
        });
    }

    // タブのコンテキストメニューを表示
    showTabContextMenu(event, tabId) {
        // 簡易実装：confirm ダイアログ
        const actions = [
            '複製',
            '閉じる'
        ];

        const action = prompt('アクション選択:\n1: 複製\n2: 閉じる', '1');
        
        if (action === '1') {
            this.duplicateTab(tabId);
        } else if (action === '2') {
            this.closeTab(tabId);
        }
    }

    // ストレージからタブを読み込み
    loadTabsFromStorage() {
        const savedTabs = this.storageManager.getTabs();
        
        if (savedTabs.length === 0) {
            this.tabs = [];
            return;
        }

        // メモデータとタブ情報をマージ
        this.tabs = savedTabs.map(tabInfo => {
            const memo = this.storageManager.getMemo(tabInfo.id);
            return {
                id: tabInfo.id,
                title: memo.title || tabInfo.title || '無題のメモ',
                content: memo.content || '',
                lastModified: memo.lastModified || tabInfo.lastModified,
                isModified: false
            };
        });
    }

    // タブをストレージに保存
    saveTabsToStorage() {
        const tabInfo = this.tabs.map(tab => ({
            id: tab.id,
            title: tab.title,
            lastModified: tab.lastModified
        }));
        
        this.storageManager.saveTabs(tabInfo);
    }

    // エディタの変更を監視
    handleEditorChange(content) {
        if (this.isLoading || !this.activeTabId) return;

        const tab = this.tabs.find(t => t.id === this.activeTabId);
        if (!tab) return;

        // 変更があったかチェック
        const hasChanges = tab.content !== content;
        tab.isModified = hasChanges;

        if (hasChanges) {
            tab.content = content;
            this.updateSaveStatus(false);
            this.renderTabs();

            // 自動保存（デバウンス付き）
            this.debounceAutoSave();
        }

        // 文字数更新
        this.updateCharCount(content);
    }

    // 自動保存（デバウンス）
    debounceAutoSave() {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            this.saveCurrentTab();
        }, 2000); // 2秒後に自動保存
    }

    // 保存状態の表示を更新
    updateSaveStatus(isSaved) {
        const saveStatus = document.getElementById('save-status');
        if (saveStatus) {
            if (isSaved) {
                saveStatus.textContent = '保存済み';
                saveStatus.className = 'saved';
            } else {
                saveStatus.textContent = '未保存';
                saveStatus.className = 'unsaved';
            }
        }
    }

    // 文字数の表示を更新
    updateCharCount(content) {
        const charCount = document.getElementById('char-count');
        if (charCount) {
            const length = content.length;
            const lines = content.split('\n').length;
            charCount.textContent = `${length}文字 ${lines}行`;
        }
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // 新しいタブボタン（アプリレベルで処理されるため、ここでは設定しない）
        // const addTabBtn = document.getElementById('add-tab');
        // addTabBtn?.addEventListener('click', () => {
        //     this.createNewTab();
        // });

        // エディタの変更監視
        const editor = document.getElementById('editor');
        editor?.addEventListener('input', (e) => {
            this.handleEditorChange(e.target.value);
        });

        // Ctrl+S で保存（アプリレベルで処理されるため、ここでは設定しない）
        // document.addEventListener('keydown', (e) => {
        //     if (e.ctrlKey && e.key === 's') {
        //         e.preventDefault();
        //         this.saveCurrentTab();
        //     }
        // });

        // ページを離れる前に保存
        window.addEventListener('beforeunload', (e) => {
            this.saveCurrentTab();
        });
    }

    // 現在のアクティブタブを取得
    getActiveTab() {
        return this.tabs.find(tab => tab.id === this.activeTabId);
    }

    // すべてのタブを取得
    getAllTabs() {
        return [...this.tabs];
    }
}
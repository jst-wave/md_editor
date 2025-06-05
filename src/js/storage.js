// storage.js - ローカルストレージ管理
export class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'memo_app_data';
        this.TABS_KEY = 'memo_app_tabs';
        this.ACTIVE_TAB_KEY = 'memo_app_active_tab';
    }

    // すべてのメモデータを取得
    getAllMemos() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('メモデータの読み込みに失敗しました:', error);
            return {};
        }
    }

    // 特定のメモを取得
    getMemo(id) {
        const memos = this.getAllMemos();
        return memos[id] || { content: '', title: '無題のメモ' };
    }

    // メモを保存
    saveMemo(id, content, title = null) {
        try {
            const memos = this.getAllMemos();
            memos[id] = {
                content: content,
                title: title || this.generateTitle(content),
                lastModified: new Date().toISOString()
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(memos));
            return true;
        } catch (error) {
            console.error('メモの保存に失敗しました:', error);
            return false;
        }
    }

    // メモを削除
    deleteMemo(id) {
        try {
            const memos = this.getAllMemos();
            delete memos[id];
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(memos));
            return true;
        } catch (error) {
            console.error('メモの削除に失敗しました:', error);
            return false;
        }
    }

    // タブ情報を取得
    getTabs() {
        try {
            const data = localStorage.getItem(this.TABS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('タブ情報の読み込みに失敗しました:', error);
            return [];
        }
    }

    // タブ情報を保存
    saveTabs(tabs) {
        try {
            localStorage.setItem(this.TABS_KEY, JSON.stringify(tabs));
            return true;
        } catch (error) {
            console.error('タブ情報の保存に失敗しました:', error);
            return false;
        }
    }

    // アクティブタブIDを取得
    getActiveTabId() {
        return localStorage.getItem(this.ACTIVE_TAB_KEY);
    }

    // アクティブタブIDを保存
    saveActiveTabId(id) {
        try {
            localStorage.setItem(this.ACTIVE_TAB_KEY, id);
            return true;
        } catch (error) {
            console.error('アクティブタブの保存に失敗しました:', error);
            return false;
        }
    }

    // コンテンツからタイトルを生成
    generateTitle(content) {
        if (!content.trim()) {
            return '無題のメモ';
        }

        // 最初の行をタイトルとして使用
        const firstLine = content.split('\n')[0].trim();
        if (firstLine) {
            // マークダウンのヘッダー記号を除去
            const title = firstLine.replace(/^#+\s*/, '');
            return title.substring(0, 30) + (title.length > 30 ? '...' : '');
        }

        return '無題のメモ';
    }

    // ユニークIDを生成
    generateUniqueId() {
        return 'memo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}
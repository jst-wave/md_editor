// search.js - 検索・置換機能
export class SearchManager {
    constructor() {
        this.currentMatches = [];
        this.currentMatchIndex = -1;
        this.lastSearchTerm = '';
        this.isSearchVisible = false;
    }

    // 検索・置換パネルの表示/非表示を切り替え
    toggleSearchPanel() {
        const panel = document.getElementById('search-replace-panel');
        const searchInput = document.getElementById('search-input');
        
        if (this.isSearchVisible) {
            panel.classList.add('hidden');
            this.clearHighlights();
            this.isSearchVisible = false;
        } else {
            panel.classList.remove('hidden');
            searchInput.focus();
            this.isSearchVisible = true;
        }
    }

    // 検索パネルを閉じる
    closeSearchPanel() {
        const panel = document.getElementById('search-replace-panel');
        panel.classList.add('hidden');
        this.clearHighlights();
        this.isSearchVisible = false;
    }

    // テキスト内の検索を実行
    search(searchTerm, editorElement) {
        if (!searchTerm || !editorElement) {
            this.clearHighlights();
            this.updateSearchCount(0, 0);
            return;
        }

        const text = editorElement.value;
        const searchRegex = new RegExp(this.escapeRegExp(searchTerm), 'gi');
        const matches = [];
        let match;

        // すべてのマッチを見つける
        while ((match = searchRegex.exec(text)) !== null) {
            matches.push({
                index: match.index,
                text: match[0],
                length: match[0].length
            });
        }

        this.currentMatches = matches;
        this.currentMatchIndex = matches.length > 0 ? 0 : -1;
        this.lastSearchTerm = searchTerm;

        this.highlightMatches(editorElement);
        this.updateSearchCount(matches.length, this.currentMatchIndex + 1);

        // 最初のマッチにジャンプ
        if (matches.length > 0) {
            this.jumpToMatch(editorElement, 0);
        }
    }

    // 次のマッチにジャンプ
    searchNext(editorElement) {
        if (this.currentMatches.length === 0) return;

        this.currentMatchIndex = (this.currentMatchIndex + 1) % this.currentMatches.length;
        this.jumpToMatch(editorElement, this.currentMatchIndex);
        this.updateSearchCount(this.currentMatches.length, this.currentMatchIndex + 1);
    }

    // 前のマッチにジャンプ
    searchPrevious(editorElement) {
        if (this.currentMatches.length === 0) return;

        this.currentMatchIndex = this.currentMatchIndex <= 0 
            ? this.currentMatches.length - 1 
            : this.currentMatchIndex - 1;
        this.jumpToMatch(editorElement, this.currentMatchIndex);
        this.updateSearchCount(this.currentMatches.length, this.currentMatchIndex + 1);
    }

    // 指定されたマッチ位置にジャンプ
    jumpToMatch(editorElement, matchIndex) {
        if (matchIndex < 0 || matchIndex >= this.currentMatches.length) return;

        const match = this.currentMatches[matchIndex];
        editorElement.focus();
        editorElement.setSelectionRange(match.index, match.index + match.length);
        
        // エディタ内でのスクロール位置を調整
        const textBeforeMatch = editorElement.value.substring(0, match.index);
        const lines = textBeforeMatch.split('\n');
        const lineNumber = lines.length - 1;
        const lineHeight = 22; // 概算の行の高さ
        const scrollTop = Math.max(0, (lineNumber - 5) * lineHeight);
        
        editorElement.scrollTop = scrollTop;
    }

    // 一件置換
    replaceOne(editorElement, replaceTerm) {
        if (this.currentMatchIndex < 0 || this.currentMatches.length === 0) return;

        const match = this.currentMatches[this.currentMatchIndex];
        const currentText = editorElement.value;
        
        // 現在選択されているテキストが検索語と一致するかチェック
        const selectedText = currentText.substring(match.index, match.index + match.length);
        if (selectedText.toLowerCase() !== this.lastSearchTerm.toLowerCase()) {
            return;
        }

        // テキストを置換
        const newText = currentText.substring(0, match.index) + 
                       replaceTerm + 
                       currentText.substring(match.index + match.length);
        
        editorElement.value = newText;
        
        // カーソル位置を調整
        const newCursorPos = match.index + replaceTerm.length;
        editorElement.setSelectionRange(newCursorPos, newCursorPos);

        // 検索を再実行（置換により位置が変わるため）
        this.search(this.lastSearchTerm, editorElement);
        
        // 変更イベントを発生させる
        editorElement.dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true,
        }));
    }

    // 全件置換
    replaceAll(editorElement, replaceTerm) {
        if (this.currentMatches.length === 0) return;

        const currentText = editorElement.value;
        const searchRegex = new RegExp(this.escapeRegExp(this.lastSearchTerm), 'gi');
        const newText = currentText.replace(searchRegex, replaceTerm);
        
        editorElement.value = newText;
        
        // 検索をクリア
        this.clearHighlights();
        this.currentMatches = [];
        this.currentMatchIndex = -1;
        this.updateSearchCount(0, 0);
        
        // 変更イベントを発生させる
        editorElement.dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true,
        }));

        // 置換した件数を表示
        const replaceCount = (currentText.match(searchRegex) || []).length;
        this.showReplaceMessage(`${replaceCount}件を置換しました`);
    }

    // ハイライトを表示（簡易版 - テキストエリアでは背景色変更は制限的）
    highlightMatches(editorElement) {
        // テキストエリアでは直接ハイライトできないため、
        // 検索結果の表示のみに留める
        // 実際のハイライトは選択状態で代用
    }

    // ハイライトをクリア
    clearHighlights() {
        this.currentMatches = [];
        this.currentMatchIndex = -1;
    }

    // 検索結果数の表示を更新
    updateSearchCount(total, current) {
        const countElement = document.getElementById('search-count');
        if (countElement) {
            if (total === 0) {
                countElement.textContent = '見つかりません';
            } else {
                countElement.textContent = `${current}/${total}`;
            }
        }
    }

    // 置換メッセージを表示
    showReplaceMessage(message) {
        const countElement = document.getElementById('search-count');
        if (countElement) {
            countElement.textContent = message;
            setTimeout(() => {
                this.updateSearchCount(this.currentMatches.length, 
                    this.currentMatchIndex >= 0 ? this.currentMatchIndex + 1 : 0);
            }, 2000);
        }
    }

    // 正規表現のエスケープ
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // イベントリスナーの設定
    setupEventListeners() {
        const searchInput = document.getElementById('search-input');
        const replaceInput = document.getElementById('replace-input');
        const searchPrevBtn = document.getElementById('search-prev');
        const searchNextBtn = document.getElementById('search-next');
        const replaceOneBtn = document.getElementById('replace-one');
        const replaceAllBtn = document.getElementById('replace-all');
        const closeSearchBtn = document.getElementById('close-search');
        const editorElement = document.getElementById('editor');

        // 検索入力時
        let searchTimeout;
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.search(e.target.value, editorElement);
            }, 300);
        });

        // エンターキーで次の検索結果へ
        searchInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) {
                    this.searchPrevious(editorElement);
                } else {
                    this.searchNext(editorElement);
                }
            } else if (e.key === 'Escape') {
                this.closeSearchPanel();
            }
        });

        // 置換入力でエンターキー
        replaceInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) {
                    this.replaceAll(editorElement, e.target.value);
                } else {
                    this.replaceOne(editorElement, e.target.value);
                }
            } else if (e.key === 'Escape') {
                this.closeSearchPanel();
            }
        });

        // ボタンイベント
        searchPrevBtn?.addEventListener('click', () => {
            this.searchPrevious(editorElement);
        });

        searchNextBtn?.addEventListener('click', () => {
            this.searchNext(editorElement);
        });

        replaceOneBtn?.addEventListener('click', () => {
            this.replaceOne(editorElement, replaceInput?.value || '');
        });

        replaceAllBtn?.addEventListener('click', () => {
            this.replaceAll(editorElement, replaceInput?.value || '');
        });

        closeSearchBtn?.addEventListener('click', () => {
            this.closeSearchPanel();
        });
    }
}
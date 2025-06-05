// editor.js - エディタ機能

export class EditorManager {
    constructor(storageManager = null, markdownRenderer = null) {
        this.storageManager = storageManager;
        this.markdownRenderer = markdownRenderer;
        this.editor = null;
        this.preview = null;
        this.isPreviewVisible = true; // デフォルトでプレビューを表示
        this.debounceTimer = null;
        this.resizer = null;
        this.isResizing = false;
    }

    // エディタを初期化
    initialize() {
        this.editor = document.getElementById('editor');
        this.preview = document.getElementById('preview');
        this.resizer = document.getElementById('resizer');
        
        if (!this.editor) {
            console.error('エディタ要素が見つかりません');
            return;
        }

        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.loadEditorPreferences();
        this.setupResizer();
        
        // プレビューボタンの初期状態を設定
        this.updatePreviewButtonText();
    }

    // イベントリスナーを設定
    setupEventListeners() {
        // エディタの入力イベント
        this.editor.addEventListener('input', (e) => {
            this.handleInput(e);
        });

        // エディタのキー入力イベント
        this.editor.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        // エディタのスクロールイベント
        this.editor.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // フォーカス/ブラーイベント
        this.editor.addEventListener('focus', () => {
            this.handleFocus();
        });

        this.editor.addEventListener('blur', () => {
            this.handleBlur();
        });

        // プレビュー切り替えボタン（重複回避のため、アプリレベルで処理）
        // const previewToggle = document.getElementById('toggle-preview');
        // previewToggle?.addEventListener('click', () => {
        //     this.togglePreview();
        // });
    }

    // キーボードショートカットを設定
    setupKeyboardShortcuts() {
        this.editor.addEventListener('keydown', (e) => {
            // アプリレベルで処理されるキーボードショートカットを明示的に処理
            
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        if (e.altKey) {
                            // Ctrl+Alt+S はローカルストレージに保存
                            e.preventDefault();
                            if (window.memoApp && window.memoApp.tabManager) {
                                window.memoApp.tabManager.saveCurrentTab();
                            }
                        } else {
                            // Ctrl+S はマークダウンファイルとしてダウンロード
                            e.preventDefault();
                            this.downloadAsMarkdown();
                        }
                        break;
                    case 'b':
                        e.preventDefault();
                        this.toggleBold();
                        break;
                    case 'i':
                        e.preventDefault();
                        this.toggleItalic();
                        break;
                    case 'k':
                        e.preventDefault();
                        this.insertLink();
                        break;
                    case '/':
                        e.preventDefault();
                        if (this.searchManager) {
                            this.searchManager.toggleSearchPanel();
                        }
                        break;
                    case 't':
                        // Ctrl+T は新しいタブ作成をアプリレベルに委譲
                        e.preventDefault();
                        if (window.memoApp && window.memoApp.tabManager) {
                            window.memoApp.tabManager.createNewTab();
                        }
                        break;
                    case 'w':
                        // Ctrl+W はタブを閉じる処理をアプリレベルに委譲
                        e.preventDefault();
                        if (window.memoApp && window.memoApp.tabManager) {
                            const activeTab = window.memoApp.tabManager.getActiveTab();
                            if (activeTab) {
                                window.memoApp.tabManager.closeTab(activeTab.id);
                            }
                        }
                        break;
                    case 'f':
                        // Ctrl+F は検索パネル切り替えをアプリレベルに委譲
                        e.preventDefault();
                        if (window.memoApp && window.memoApp.searchManager) {
                            window.memoApp.searchManager.toggleSearchPanel();
                        }
                        break;
                    default:
                        // その他のCtrl+キーの組み合わせはバブリングを許可
                        break;
                }
            }

            // Tab キー処理
            if (e.key === 'Tab') {
                e.preventDefault();
                this.insertTab(e.shiftKey);
            }
        });
    }

    // 入力処理
    handleInput(e) {
        const content = e.target.value;

        // タブマネージャーに変更を通知
        if (this.tabManager) {
            this.tabManager.handleEditorChange(content);
        }

        // プレビューを更新（デバウンス付き）
        this.updatePreviewDebounced(content);

        // 自動補完機能
        this.handleAutoComplete(e);
    }

    // キーダウン処理
    handleKeyDown(e) {
        // マークダウンの自動補完
        if (e.key === 'Enter') {
            this.handleEnterKey(e);
        }
    }

    // スクロール処理
    handleScroll() {
        // プレビューとのスクロール同期は markdown.js で処理
    }

    // フォーカス処理
    handleFocus() {
        // エディタがフォーカスされた時の処理
    }

    // ブラー処理
    handleBlur() {
        // エディタからフォーカスが外れた時の処理
        if (this.tabManager) {
            this.tabManager.saveCurrentTab();
        }
    }

    // プレビューの表示/非表示を切り替え
    togglePreview() {
        const previewPane = document.getElementById('preview-pane');
        const editorPane = document.getElementById('editor-pane');
        const resizer = document.getElementById('resizer');

        if (!previewPane) {
            console.error('プレビュー切り替えに必要な要素が見つかりません');
            return;
        }

        this.isPreviewVisible = !this.isPreviewVisible;

        if (this.isPreviewVisible) {
            previewPane.classList.remove('hidden');
            if (resizer) {
                resizer.style.display = 'block';
            }
            
            // プレビュー要素を再取得（確実性のため）
            const previewElement = document.getElementById('preview');
            if (!previewElement) {
                console.error('プレビュー要素が見つかりません');
                return;
            }
            
            // プレビューを更新
            if (this.markdownRenderer && this.editor) {
                const content = this.editor.value || '';
                this.markdownRenderer.updatePreview(content, previewElement);
            } else {
                console.error('プレビュー更新に必要なコンポーネントが見つかりません');
            }

            // 画面サイズに応じてレイアウトを調整
            if (window.innerWidth <= 768) {
                editorPane.style.display = 'none';
                if (resizer) {
                    resizer.style.display = 'none';
                }
            }
        } else {
            previewPane.classList.add('hidden');
            if (resizer) {
                resizer.style.display = 'none';
            }
            if (editorPane) {
                editorPane.style.display = 'flex';
            }
        }

        // ボタンテキストを更新
        this.updatePreviewButtonText();
    }

    // プレビューボタンのテキストを更新
    updatePreviewButtonText() {
        const toggleButton = document.getElementById('toggle-preview');
        if (toggleButton) {
            toggleButton.textContent = this.isPreviewVisible ? 'エディタのみ' : 'プレビュー表示';
        }
    }

    // リサイザーを設定
    setupResizer() {
        if (!this.resizer) return;

        this.resizer.addEventListener('mousedown', (e) => {
            this.startResize(e);
        });

        // グローバルなマウスイベントをリッスン
        document.addEventListener('mousemove', (e) => {
            this.handleResize(e);
        });

        document.addEventListener('mouseup', () => {
            this.stopResize();
        });

        // ドラッグ中のテキスト選択を防ぐ
        this.resizer.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });
    }

    // リサイズ開始
    startResize(e) {
        this.isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none'; // テキスト選択を無効化
        e.preventDefault();
    }

    // リサイズ処理
    handleResize(e) {
        if (!this.isResizing) return;

        const container = document.getElementById('editor-container');
        const editorPane = document.getElementById('editor-pane');
        const previewPane = document.getElementById('preview-pane');
        
        if (!container || !editorPane || !previewPane) return;

        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const resizerWidth = 6; // リサイザーの幅
        
        // マウス位置を相対位置に変換
        const mouseX = e.clientX - containerRect.left;
        
        // 最小幅を設定（30%と70%の範囲内）
        const minWidth = containerWidth * 0.2;
        const maxWidth = containerWidth * 0.8;
        
        let editorWidth = Math.max(minWidth, Math.min(maxWidth, mouseX));
        let previewWidth = containerWidth - editorWidth - resizerWidth;
        
        // フレックスベースでの幅を計算
        const editorFlex = editorWidth / containerWidth;
        const previewFlex = previewWidth / containerWidth;
        
        // CSSカスタムプロパティで幅を設定
        editorPane.style.flex = `0 0 ${editorWidth}px`;
        previewPane.style.flex = `0 0 ${previewWidth}px`;
        
        e.preventDefault();
    }

    // リサイズ終了
    stopResize() {
        if (this.isResizing) {
            this.isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    }

    // プレビューを更新（デバウンス付き）
    updatePreviewDebounced(content) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            if (this.isPreviewVisible && this.markdownRenderer) {
                const previewElement = document.getElementById('preview');
                if (previewElement) {
                    this.markdownRenderer.updatePreview(content, previewElement);
                }
            }
        }, 300);
    }

    // Tabキーの挿入処理
    insertTab(isShiftKey) {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const selectedText = this.editor.value.substring(start, end);

        if (isShiftKey) {
            // Shift+Tab: インデント削除
            this.removeIndent(start, end, selectedText);
        } else {
            // Tab: インデント追加
            this.addIndent(start, end, selectedText);
        }
    }

    // インデント追加
    addIndent(start, end, selectedText) {
        if (selectedText.includes('\n')) {
            // 複数行の場合
            const lines = selectedText.split('\n');
            const indentedLines = lines.map(line => '    ' + line);
            const newText = indentedLines.join('\n');
            
            this.replaceSelection(start, end, newText);
            this.editor.setSelectionRange(start, start + newText.length);
        } else {
            // 単一行の場合
            this.insertText('    ');
        }
    }

    // インデント削除
    removeIndent(start, end, selectedText) {
        if (selectedText.includes('\n')) {
            // 複数行の場合
            const lines = selectedText.split('\n');
            const unindentedLines = lines.map(line => {
                if (line.startsWith('    ')) {
                    return line.substring(4);
                } else if (line.startsWith('\t')) {
                    return line.substring(1);
                }
                return line;
            });
            const newText = unindentedLines.join('\n');
            
            this.replaceSelection(start, end, newText);
            this.editor.setSelectionRange(start, start + newText.length);
        } else {
            // カーソル位置の行のインデントを削除
            const lineStart = this.editor.value.lastIndexOf('\n', start - 1) + 1;
            const lineEnd = this.editor.value.indexOf('\n', start);
            const line = this.editor.value.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
            
            if (line.startsWith('    ')) {
                this.editor.setSelectionRange(lineStart, lineStart + 4);
                this.insertText('');
            } else if (line.startsWith('\t')) {
                this.editor.setSelectionRange(lineStart, lineStart + 1);
                this.insertText('');
            }
        }
    }

    // Enterキーの処理
    handleEnterKey(e) {
        const cursorPos = this.editor.selectionStart;
        const textBeforeCursor = this.editor.value.substring(0, cursorPos);
        const currentLine = textBeforeCursor.split('\n').pop();

        // リスト項目の継続
        const listMatch = currentLine.match(/^(\s*)([-*+]|\d+\.)\s/);
        if (listMatch) {
            e.preventDefault();
            const indent = listMatch[1];
            const marker = listMatch[2];
            
            if (currentLine.trim() === marker) {
                // 空のリスト項目の場合はリストを終了
                const lineStart = textBeforeCursor.lastIndexOf('\n') + 1;
                this.editor.setSelectionRange(lineStart, cursorPos);
                this.insertText('\n');
            } else {
                // 次のリスト項目を挿入
                let nextMarker;
                if (marker.match(/\d+/)) {
                    const num = parseInt(marker) + 1;
                    nextMarker = num + '.';
                } else {
                    nextMarker = marker;
                }
                this.insertText(`\n${indent}${nextMarker} `);
            }
            return;
        }

        // コードブロックの継続
        if (currentLine.trim() === '```') {
            e.preventDefault();
            this.insertText('\n\n```');
            this.editor.setSelectionRange(cursorPos + 1, cursorPos + 1);
            return;
        }
    }

    // 自動補完処理
    handleAutoComplete(e) {
        const cursorPos = this.editor.selectionStart;
        const textBeforeCursor = this.editor.value.substring(0, cursorPos);
        
        // リンクの自動補完
        if (textBeforeCursor.endsWith('](')) {
            // [text]( の後にhttps:// を自動挿入
            this.insertText('https://');
        }
    }

    // 太字の切り替え
    toggleBold() {
        this.wrapSelection('**', '**');
    }

    // 斜体の切り替え
    toggleItalic() {
        this.wrapSelection('*', '*');
    }

    // リンクの挿入
    insertLink() {
        const selectedText = this.getSelectedText();
        const linkText = selectedText || 'リンクテキスト';
        const url = prompt('URL を入力してください:', 'https://');
        
        if (url) {
            this.replaceSelection(
                this.editor.selectionStart,
                this.editor.selectionEnd,
                `[${linkText}](${url})`
            );
        }
    }

    // 選択テキストを包む
    wrapSelection(prefix, suffix) {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const selectedText = this.getSelectedText();
        
        if (selectedText) {
            this.replaceSelection(start, end, `${prefix}${selectedText}${suffix}`);
            this.editor.setSelectionRange(start + prefix.length, end + prefix.length);
        } else {
            this.insertText(`${prefix}${suffix}`);
            this.editor.setSelectionRange(start + prefix.length, start + prefix.length);
        }
    }

    // テキストを挿入
    insertText(text) {
        const start = this.editor.selectionStart;
        this.replaceSelection(start, this.editor.selectionEnd, text);
        this.editor.setSelectionRange(start + text.length, start + text.length);
    }

    // 選択範囲を置換
    replaceSelection(start, end, text) {
        const currentValue = this.editor.value;
        this.editor.value = currentValue.substring(0, start) + text + currentValue.substring(end);
        
        // 変更イベントを発生
        this.editor.dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true,
        }));
    }

    // 選択されたテキストを取得
    getSelectedText() {
        return this.editor.value.substring(this.editor.selectionStart, this.editor.selectionEnd);
    }

    // ドキュメントを保存（ローカルストレージ）
    saveDocument() {
        if (this.tabManager) {
            this.tabManager.saveCurrentTab();
        }
    }

    // マークダウンファイルとしてダウンロード保存
    downloadAsMarkdown() {
        const content = this.getContent();
        const activeTab = this.tabManager ? this.tabManager.getActiveTab() : null;
        const filename = activeTab ? this.sanitizeFilename(activeTab.title) + '.md' : 'memo.md';

        this.downloadFile(content, filename, 'text/markdown');
    }

    // ファイル名をサニタイズ
    sanitizeFilename(title) {
        // ファイル名に使用できない文字を除去/置換
        return title
            .replace(/[<>:"/\\|?*]/g, '') // 禁止文字を除去
            .replace(/\s+/g, '_') // スペースをアンダースコアに
            .substring(0, 50) // 長さを制限
            || 'untitled'; // 空の場合のデフォルト
    }

    // ファイルダウンロード機能
    downloadFile(content, filename, mimeType = 'text/plain') {
        // Blobオブジェクトでファイルデータを作成
        const blob = new Blob([content], { type: mimeType });
        
        // ダウンロード用のURLを作成
        const url = URL.createObjectURL(blob);
        
        // 一時的なリンク要素を作成してクリック
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // メモリを解放
        URL.revokeObjectURL(url);

        // 成功メッセージを表示
        this.showDownloadMessage(filename);
    }

    // ダウンロード成功メッセージを表示
    showDownloadMessage(filename) {
        // 簡易実装：コンソールログ
        console.log(`✓ ファイルをダウンロードしました: ${filename}`);
        
        // 将来の改善：ユーザーに見える通知を表示
        const saveStatus = document.getElementById('save-status');
        if (saveStatus) {
            const originalText = saveStatus.textContent;
            saveStatus.textContent = `ダウンロード完了: ${filename}`;
            saveStatus.className = 'saved';
            
            setTimeout(() => {
                saveStatus.textContent = originalText;
            }, 3000);
        }
    }

    // エディタの設定を読み込み
    loadEditorPreferences() {
        // 将来の拡張用：フォントサイズ、テーマなどの設定
    }

    // 現在のエディタの内容を取得
    getContent() {
        return this.editor ? this.editor.value : '';
    }

    // エディタの内容を設定
    setContent(content) {
        if (this.editor) {
            this.editor.value = content;
            this.editor.dispatchEvent(new Event('input', {
                bubbles: true,
                cancelable: true,
            }));
        }
    }

    // エディタにフォーカスを設定
    focus() {
        if (this.editor) {
            this.editor.focus();
        }
    }
}
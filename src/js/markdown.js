// markdown.js - マークダウンプレビュー機能
import MarkdownIt from 'markdown-it';

export class MarkdownRenderer {
    constructor() {
        // markdown-it を使用してマークダウンを HTML に変換
        this.md = new MarkdownIt({
            html: false,        // HTML タグを無効化（セキュリティ）
            xhtmlOut: false,    // XHTML 出力を無効化
            breaks: true,       // 改行を <br> に変換
            linkify: true,      // URL を自動的にリンク化
            typographer: false  // タイポグラフィ変換を無効化
        });
    }

    // マークダウンテキストをHTMLに変換
    render(markdown) {
        if (!markdown || markdown.trim() === '') {
            return '<p><em>プレビューする内容がありません。左側のエディタにマークダウンを入力してください。</em></p>';
        }

        try {
            return this.md.render(markdown);
        } catch (error) {
            console.error('マークダウンのレンダリングに失敗しました:', error);
            return `<p><strong>エラー:</strong> マークダウンのレンダリングに失敗しました。</p>`;
        }
    }

    // プレビューを更新
    updatePreview(markdown, previewElement) {
        if (!previewElement) {
            console.error('プレビュー要素が見つかりません');
            return;
        }

        const html = this.render(markdown);
        previewElement.innerHTML = html;

        // 生成されたリンクに target="_blank" を追加
        const links = previewElement.querySelectorAll('a');
        links.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });

        // テーブルにレスポンシブクラスを追加
        const tables = previewElement.querySelectorAll('table');
        tables.forEach(table => {
            if (!table.parentElement.classList.contains('table-container')) {
                const container = document.createElement('div');
                container.className = 'table-container';
                table.parentElement.insertBefore(container, table);
                container.appendChild(table);
            }
        });
    }

    // リアルタイムプレビューのセットアップ
    setupLivePreview(editorElement, previewElement) {
        if (!editorElement || !previewElement) {
            console.error('エディタまたはプレビュー要素が見つかりません');
            return;
        }

        // 初期プレビューを表示
        this.updatePreview(editorElement.value, previewElement);

        // 既存のイベントリスナーがあれば削除（重複回避）
        if (this.livePreviewHandler) {
            editorElement.removeEventListener('input', this.livePreviewHandler);
        }

        // 入力時のリアルタイム更新（デバウンス付き）
        let debounceTimer;
        this.livePreviewHandler = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                // プレビューが表示されている場合のみ更新
                const previewPane = document.getElementById('preview-pane');
                if (previewPane && !previewPane.classList.contains('hidden')) {
                    this.updatePreview(editorElement.value, previewElement);
                }
            }, 300); // 300msのデバウンス
        };

        editorElement.addEventListener('input', this.livePreviewHandler);

        // スクロール同期（オプション）
        this.setupScrollSync(editorElement, previewElement);
        
        console.log('ライブプレビューのセットアップが完了しました');
    }

    // エディタとプレビューのスクロール同期
    setupScrollSync(editorElement, previewElement) {
        let isEditorScrolling = false;
        let isPreviewScrolling = false;

        editorElement.addEventListener('scroll', () => {
            if (isPreviewScrolling) return;
            isEditorScrolling = true;

            const editorScrollPercent = editorElement.scrollTop / (editorElement.scrollHeight - editorElement.clientHeight);
            const previewScrollTop = editorScrollPercent * (previewElement.scrollHeight - previewElement.clientHeight);
            
            previewElement.scrollTop = previewScrollTop;

            setTimeout(() => {
                isEditorScrolling = false;
            }, 100);
        });

        previewElement.addEventListener('scroll', () => {
            if (isEditorScrolling) return;
            isPreviewScrolling = true;

            const previewScrollPercent = previewElement.scrollTop / (previewElement.scrollHeight - previewElement.clientHeight);
            const editorScrollTop = previewScrollPercent * (editorElement.scrollHeight - editorElement.clientHeight);
            
            editorElement.scrollTop = editorScrollTop;

            setTimeout(() => {
                isPreviewScrolling = false;
            }, 100);
        });
    }

    // マークダウンのエクスポート機能
    exportAsHtml(markdown, title = 'エクスポートされたメモ') {
        const html = this.render(markdown);
        const fullHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3, h4, h5, h6 { color: #333; }
        h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
        h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: 'Courier New', monospace; }
        pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; font-style: italic; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
        th { background-color: #f4f4f4; font-weight: bold; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
${html}
</body>
</html>`;
        return fullHtml;
    }
}
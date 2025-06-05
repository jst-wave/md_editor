// プレビュー機能のデバッグスクリプト
// ブラウザのコンソールで実行してください

console.log('=== プレビュー機能デバッグ ===');

// DOM要素の確認
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const previewPane = document.getElementById('preview-pane');
const toggleButton = document.getElementById('toggle-preview');

console.log('Editor element:', editor);
console.log('Preview element:', preview);
console.log('Preview pane element:', previewPane);
console.log('Toggle button element:', toggleButton);

// プレビューペインの初期状態確認
if (previewPane) {
    console.log('Preview pane classes:', previewPane.className);
    console.log('Preview pane is hidden:', previewPane.classList.contains('hidden'));
    console.log('Preview pane computed display:', window.getComputedStyle(previewPane).display);
}

// アプリケーションオブジェクトの確認
if (window.memoApp) {
    console.log('memoApp exists:', !!window.memoApp);
    console.log('editorManager exists:', !!window.memoApp.editorManager);
    console.log('markdownRenderer exists:', !!window.memoApp.markdownRenderer);
    
    if (window.memoApp.editorManager) {
        console.log('Editor in editorManager:', window.memoApp.editorManager.editor);
        console.log('Preview in editorManager:', window.memoApp.editorManager.preview);
        console.log('isPreviewVisible:', window.memoApp.editorManager.isPreviewVisible);
    }
    
    // デバッグ専用メソッドを実行
    if (typeof window.memoApp.debugPreview === 'function') {
        console.log('Running built-in preview debug...');
        window.memoApp.debugPreview();
    }
}

// エディタにテストコンテンツを設定
if (editor) {
    console.log('Setting test content in editor...');
    editor.value = '# テスト見出し\n\nこれは**太字**です。\n\n- リスト項目1\n- リスト項目2\n\n```javascript\nconsole.log("Hello World");\n```';
    editor.dispatchEvent(new Event('input'));
}

// 手動でプレビュー切り替えテスト
if (window.memoApp && window.memoApp.editorManager) {
    console.log('Testing preview toggle...');
    try {
        window.memoApp.editorManager.togglePreview();
        console.log('Preview toggle executed successfully');
        console.log('Preview visibility after toggle:', window.memoApp.editorManager.isPreviewVisible);
        
        // 再度切り替えてテスト
        setTimeout(() => {
            console.log('Testing toggle again...');
            window.memoApp.editorManager.togglePreview();
            console.log('Second toggle completed');
        }, 1000);
    } catch (error) {
        console.error('Preview toggle failed:', error);
    }
}

console.log('=== デバッグ終了 ===');

// キーボードショートカットのデバッグスクリプト
// ブラウザのコンソールで実行してください

console.log('=== キーボードショートカット 詳細デバッグ ===');

// 現在のイベントリスナーの確認
console.log('memoApp存在確認:', !!window.memoApp);
console.log('tabManager存在確認:', !!window.memoApp?.tabManager);

// 各要素にデバッグリスナーを追加
function addDebugListeners() {
    const editor = document.getElementById('editor');
    const documentElement = document;
    
    // エディタレベルのキーイベント監視
    if (editor) {
        editor.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                console.log('🎯 エディタレベルでCtrl+S検出:', {
                    target: e.target.tagName,
                    bubbles: e.bubbles,
                    cancelable: e.cancelable,
                    defaultPrevented: e.defaultPrevented
                });
            }
        }, true); // capture phase
        
        editor.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                console.log('🎯 エディタレベルでCtrl+S検出 (bubble):', {
                    target: e.target.tagName,
                    bubbles: e.bubbles,
                    cancelable: e.cancelable,
                    defaultPrevented: e.defaultPrevented
                });
            }
        }, false); // bubble phase
    }
    
    // ドキュメントレベルのキーイベント監視
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            console.log('📄 ドキュメントレベルでCtrl+S検出:', {
                target: e.target.tagName,
                bubbles: e.bubbles,
                cancelable: e.cancelable,
                defaultPrevented: e.defaultPrevented
            });
        }
    }, true); // capture phase
    
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            console.log('📄 ドキュメントレベルでCtrl+S検出 (bubble):', {
                target: e.target.tagName,
                bubbles: e.bubbles,
                cancelable: e.cancelable,
                defaultPrevented: e.defaultPrevented
            });
        }
    }, false); // bubble phase
}

// アプリのキーボードハンドラーが登録されているか確認
console.log('handleGlobalKeydown関数:', typeof window.memoApp?.handleGlobalKeydown);

// 手動でキーボードイベントをシミュレート
function testCtrlS() {
    console.log('=== Ctrl+S シミュレーションテスト ===');
    
    const editor = document.getElementById('editor');
    const event = new KeyboardEvent('keydown', {
        key: 's',
        code: 'KeyS', 
        ctrlKey: true,
        bubbles: true,
        cancelable: true
    });
    
    console.log('イベント作成:', event);
    console.log('エディタにフォーカス設定...');
    if (editor) {
        editor.focus();
        console.log('エディタにイベント送信...');
        editor.dispatchEvent(event);
    }
    console.log('イベント送信完了');
}

// エディタの状態確認
function checkEditorState() {
    console.log('=== エディタ状態確認 ===');
    const editor = document.getElementById('editor');
    const activeTab = window.memoApp?.tabManager?.getActiveTab();
    
    console.log('エディタ要素:', !!editor);
    console.log('エディタフォーカス:', document.activeElement === editor);
    console.log('アクティブタブ:', activeTab?.id);
    console.log('タブ変更フラグ:', activeTab?.isModified);
    console.log('エディタ内容長:', editor?.value?.length);
}

// 保存機能のテスト
function testSaveFunction() {
    console.log('=== 保存機能テスト ===');
    
    if (window.memoApp?.tabManager) {
        try {
            console.log('saveCurrentTab実行前...');
            const beforeTab = window.memoApp.tabManager.getActiveTab();
            console.log('保存前の状態:', beforeTab?.isModified);
            
            window.memoApp.tabManager.saveCurrentTab();
            
            const afterTab = window.memoApp.tabManager.getActiveTab();
            console.log('保存後の状態:', afterTab?.isModified);
            console.log('saveCurrentTab実行完了');
        } catch (error) {
            console.error('saveCurrentTab実行エラー:', error);
        }
    } else {
        console.error('tabManagerが見つかりません');
    }
}

// アプリのhandleGlobalKeydownを直接テスト
function testAppKeyHandler() {
    console.log('=== アプリキーハンドラー直接テスト ===');
    
    if (window.memoApp?.handleGlobalKeydown) {
        const fakeEvent = {
            ctrlKey: true,
            key: 's',
            preventDefault: () => console.log('preventDefault called')
        };
        
        try {
            console.log('handleGlobalKeydown実行...');
            window.memoApp.handleGlobalKeydown(fakeEvent);
            console.log('handleGlobalKeydown実行完了');
        } catch (error) {
            console.error('handleGlobalKeydown実行エラー:', error);
        }
    } else {
        console.error('handleGlobalKeydownが見つかりません');
    }
}

// デバッグリスナーを追加
addDebugListeners();

console.log('デバッグ関数が利用可能になりました:');
console.log('- testCtrlS() : Ctrl+Sシミュレーション');
console.log('- checkEditorState() : エディタ状態確認');
console.log('- testSaveFunction() : 保存機能テスト');
console.log('- testAppKeyHandler() : アプリキーハンドラー直接テスト');
console.log('');
console.log('今すぐCtrl+Sを押してみてください。デバッグ情報が表示されます。');

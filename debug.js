// デバッグスクリプト - ブラウザのコンソールで実行
// アプリケーションの状態を確認

console.log('=== メモアプリ デバッグ情報 ===');

// アプリケーションの基本情報
if (window.memoApp) {
    console.log('✓ memoApp インスタンスが存在');
    console.log('アプリ状態:', window.memoApp.getAppState());
    
    // 各コンポーネントの確認
    console.log('✓ storageManager:', !!window.memoApp.storageManager);
    console.log('✓ markdownRenderer:', !!window.memoApp.markdownRenderer);
    console.log('✓ searchManager:', !!window.memoApp.searchManager);
    console.log('✓ tabManager:', !!window.memoApp.tabManager);
    console.log('✓ editorManager:', !!window.memoApp.editorManager);
    
    // DOM要素の確認
    console.log('✓ editor要素:', !!document.getElementById('editor'));
    console.log('✓ preview要素:', !!document.getElementById('preview'));
    console.log('✓ tab-list要素:', !!document.getElementById('tab-list'));
    
    // 機能テスト
    console.log('--- 機能テスト ---');
    
    // タブの作成テスト
    try {
        const newTab = window.memoApp.tabManager.createNewTab('# テストメモ\n\nこれはテストです。', 'テストタブ');
        console.log('✓ タブ作成テスト成功:', newTab.id);
    } catch (error) {
        console.error('✗ タブ作成テスト失敗:', error);
    }
    
    // エディタコンテンツ設定テスト
    try {
        window.memoApp.editorManager.setContent('# デバッグテスト\n\n**太字**と*斜体*のテストです。');
        console.log('✓ エディタコンテンツ設定テスト成功');
    } catch (error) {
        console.error('✗ エディタコンテンツ設定テスト失敗:', error);
    }
    
    // ストレージテスト
    try {
        const testMemoId = 'test_' + Date.now();
        window.memoApp.storageManager.saveMemo(testMemoId, 'テストコンテンツ', 'テストタイトル');
        const retrievedMemo = window.memoApp.storageManager.getMemo(testMemoId);
        console.log('✓ ストレージテスト成功:', retrievedMemo.title);
        window.memoApp.storageManager.deleteMemo(testMemoId);
    } catch (error) {
        console.error('✗ ストレージテスト失敗:', error);
    }
    
} else {
    console.error('✗ memoApp インスタンスが見つかりません');
}

console.log('=== デバッグ完了 ===');

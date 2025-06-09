// Integration test for Google Docs functionality
console.log('=== Google Docs統合テスト開始 ===');

// 1. 基本モジュールの確認
setTimeout(() => {
    console.log('1. アプリケーション状態確認:');
    console.log('  - MemoApp:', window.memoApp ? '✓' : '✗');
    console.log('  - getMarkdownContent:', typeof window.getMarkdownContent === 'function' ? '✓' : '✗');
    console.log('  - getCurrentTabTitle:', typeof window.getCurrentTabTitle === 'function' ? '✓' : '✗');
    
    // 2. Google Docsアップローダーの確認
    console.log('2. Google Docsアップローダー確認:');
    const googleDocsUploader = window.memoApp?.googleDocsUploader;
    console.log('  - GoogleDocsUploader:', googleDocsUploader ? '✓' : '✗');
    
    if (googleDocsUploader) {
        console.log('  - 認証状態:', googleDocsUploader.isAuthenticated ? '認証済み' : '未認証');
        console.log('  - 認証サーバーURL:', googleDocsUploader.authServerUrl);
    }
    
    // 3. UI要素の確認
    console.log('3. UI要素確認:');
    const button = document.getElementById('google-docs-btn');
    console.log('  - Google Docsボタン:', button ? '✓' : '✗');
    if (button) {
        console.log('  - ボタンテキスト:', button.textContent);
    }
    
    const modal = document.getElementById('upload-modal');
    console.log('  - アップロードモーダル:', modal ? '✓' : '✗');
    
    // 4. 認証サーバー接続テスト
    console.log('4. 認証サーバー接続テスト:');
    fetch('http://localhost:3001/health')
        .then(response => response.json())
        .then(data => {
            console.log('  - ヘルスチェック:', data.status === 'ok' ? '✓' : '✗');
            console.log('  - 設定状態:', data.configured ? '✓' : '✗');
        })
        .catch(error => {
            console.log('  - ヘルスチェック: ✗ (エラー:', error.message + ')');
        });
    
    // 5. 機能テスト
    console.log('5. 機能テスト:');
    try {
        const content = window.getMarkdownContent();
        console.log('  - コンテンツ取得:', content !== undefined ? '✓' : '✗');
        console.log('  - コンテンツ長:', content ? content.length + ' 文字' : '0 文字');
        
        const title = window.getCurrentTabTitle();
        console.log('  - タイトル取得:', title !== undefined ? '✓' : '✗');
        console.log('  - タイトル:', title || 'なし');
    } catch (error) {
        console.log('  - 機能テスト: ✗ (エラー:', error.message + ')');
    }
    
    console.log('=== テスト完了 ===');
}, 1000);

// 最終テスト - Google Docsボタンの完全動作確認
console.log('=== 最終テスト開始 ===');

// 1. ボタンの存在確認
const googleDocsBtn = document.getElementById('google-docs-upload');
console.log('1. Google Docsボタン:', googleDocsBtn);

if (googleDocsBtn) {
    console.log('✓ ボタンが見つかりました');
    
    // 2. GoogleDocsUploaderインスタンスの確認
    console.log('2. GoogleDocsUploaderインスタンス:', window.googleDocsUploader);
    
    if (window.googleDocsUploader) {
        console.log('✓ GoogleDocsUploaderインスタンスが存在します');
        
        // 3. メソッドの存在確認
        console.log('3. setupEventListenersメソッド:', typeof window.googleDocsUploader.setupEventListeners);
        console.log('3. uploadToGoogleDocsメソッド:', typeof window.googleDocsUploader.uploadToGoogleDocs);
        
        // 4. 手動でsetupEventListenersを実行
        console.log('4. 手動でsetupEventListenersを実行...');
        try {
            window.googleDocsUploader.setupEventListeners();
            console.log('✓ setupEventListenersが正常に実行されました');
        } catch (error) {
            console.error('✗ setupEventListeners実行エラー:', error);
        }
        
        // 5. ボタンクリックテスト
        console.log('5. ボタンクリックテスト実行...');
        googleDocsBtn.click();
        
    } else {
        console.error('✗ GoogleDocsUploaderインスタンスが存在しません');
    }
    
} else {
    console.error('✗ Google Docsボタンが見つかりません');
    
    // すべてのボタンを表示
    const allButtons = document.querySelectorAll('button');
    console.log('利用可能なボタン:');
    allButtons.forEach((btn, i) => {
        console.log(`  ${i}: id="${btn.id}" text="${btn.textContent.trim()}"`);
    });
}

console.log('=== 最終テスト終了 ===');

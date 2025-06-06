// 段階的Google Docsボタンテスト
console.log('=== 段階的Google Docsボタンテスト ===');

// Step 1: 基本的な要素確認
console.log('Step 1: 基本的な要素確認');
const btn = document.getElementById('google-docs-upload');
console.log('ボタン要素:', btn);
console.log('ボタンが存在:', !!btn);

if (!btn) {
    console.error('❌ ボタンが見つからないため、テストを中断します');
    console.log('利用可能なボタン一覧:');
    document.querySelectorAll('button').forEach((b, i) => {
        console.log(`  ${i}: id="${b.id}" text="${b.textContent.trim()}"`);
    });
    return;
}

// Step 2: ボタンの状態確認
console.log('\nStep 2: ボタンの状態確認');
console.log('ボタンテキスト:', btn.textContent);
console.log('ボタンdisabled:', btn.disabled);
console.log('ボタンのクラス:', btn.className);
console.log('data-google-docs-listener:', btn.getAttribute('data-google-docs-listener'));

// Step 3: GoogleDocsUploaderインスタンス確認
console.log('\nStep 3: GoogleDocsUploaderインスタンス確認');
console.log('window.googleDocsUploader:', window.googleDocsUploader);
console.log('window.GoogleDocsUploader:', window.GoogleDocsUploader);

if (!window.googleDocsUploader) {
    console.error('❌ GoogleDocsUploaderインスタンスが存在しません');
    return;
}

// Step 4: メソッドの確認
console.log('\nStep 4: メソッドの確認');
console.log('setupEventListeners:', typeof window.googleDocsUploader.setupEventListeners);
console.log('uploadToGoogleDocs:', typeof window.googleDocsUploader.uploadToGoogleDocs);

// Step 5: イベントリスナーの再設定
console.log('\nStep 5: イベントリスナーの再設定');
try {
    window.googleDocsUploader.setupEventListeners();
    console.log('✅ setupEventListeners実行完了');
} catch (error) {
    console.error('❌ setupEventListeners実行エラー:', error);
}

// Step 6: 手動クリックテスト
console.log('\nStep 6: 手動クリックテスト');
console.log('ボタンをクリックします...');

// 追加のテスト用イベントリスナー
btn.addEventListener('click', function(e) {
    console.log('🎯 テスト用イベントリスナーが発火しました');
    console.log('Event:', e);
    console.log('Target:', e.target);
    console.log('CurrentTarget:', e.currentTarget);
});

// クリック実行
btn.click();

console.log('\n=== テスト完了 ===');
console.log('注意: もしGoogleDocsUploaderのイベントリスナーが発火しない場合は、');
console.log('以下のコマンドを実行してください:');
console.log('window.googleDocsUploader.setupEventListeners();');

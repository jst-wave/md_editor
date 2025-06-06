// Google Docsボタンの詳細デバッグスクリプト
// ブラウザのコンソールで実行してください

console.log('=== Google Docsボタン 詳細デバッグ ===');

// 1. ボタンの存在確認
const googleDocsBtn = document.getElementById('google-docs-upload');
console.log('1. ボタン要素:', googleDocsBtn);

if (googleDocsBtn) {
    console.log('  - ボタンが見つかりました');
    console.log('  - テキスト:', googleDocsBtn.textContent);
    console.log('  - disabled:', googleDocsBtn.disabled);
    console.log('  - style.display:', googleDocsBtn.style.display);
    console.log('  - classList:', googleDocsBtn.classList.toString());
    
    // 2. イベントリスナーのテスト
    console.log('2. 手動でクリックイベントを追加...');
    googleDocsBtn.addEventListener('click', function(e) {
        console.log('  - クリックイベント発火！');
        console.log('  - Event object:', e);
        alert('手動追加のクリックイベントが動作しました！');
    });
    
    // 3. 強制クリック実行
    console.log('3. 強制クリック実行...');
    googleDocsBtn.click();
    
} else {
    console.log('  - ボタンが見つかりません');
    
    // すべてのボタンを表示
    const allButtons = document.querySelectorAll('button');
    console.log('  - 利用可能なボタン一覧:');
    allButtons.forEach((btn, i) => {
        console.log(`    ${i}: id="${btn.id}" text="${btn.textContent.trim()}"`);
    });
}

// 4. GoogleDocsUploaderインスタンスの確認
console.log('4. GoogleDocsUploaderの状態:');
console.log('  - window.googleDocsUploader:', window.googleDocsUploader);
console.log('  - window.GoogleDocsUploader:', window.GoogleDocsUploader);

// 5. DOMの読み込み状態確認
console.log('5. DOM状態:');
console.log('  - document.readyState:', document.readyState);
console.log('  - DOMContentLoaded:', document.readyState === 'complete');

console.log('=== デバッグ終了 ===');

// 簡単なGoogle Docsボタンテスト
console.log('=== 簡単テスト ===');
const btn = document.getElementById('google-docs-upload');
console.log('ボタン:', btn);
if (btn) {
    console.log('テキスト:', btn.textContent);
    console.log('クリックテスト実行...');
    btn.click();
} else {
    console.log('ボタンが見つかりません');
    console.log('すべてのボタン:');
    document.querySelectorAll('button').forEach((b, i) => {
        console.log(`${i}: ${b.id} - "${b.textContent.trim()}"`);
    });
}

// GoogleDocsUploaderインスタンスの状態確認
console.log('=== GoogleDocsUploader状態確認 ===');
console.log('window.googleDocsUploader:', window.googleDocsUploader);
console.log('window.GoogleDocsUploader:', window.GoogleDocsUploader);

if (window.googleDocsUploader) {
    console.log('GoogleDocsUploaderインスタンスが存在します');
    console.log('setupEventListeners メソッド:', typeof window.googleDocsUploader.setupEventListeners);
    console.log('uploadToGoogleDocs メソッド:', typeof window.googleDocsUploader.uploadToGoogleDocs);
    
    // 手動でsetupEventListeners実行
    console.log('手動でsetupEventListeners実行...');
    window.googleDocsUploader.setupEventListeners();
} else {
    console.log('GoogleDocsUploaderインスタンスが存在しません');
}

// GoogleDocsUploaderクラスのインポートテスト

// 1. CommonJS require でテスト
try {
    const path = require('path');
    const fs = require('fs');
    
    // google-docs.jsファイルの内容を直接読み込み
    const googleDocsPath = path.join(__dirname, 'src', 'js', 'google-docs.js');
    const googleDocsContent = fs.readFileSync(googleDocsPath, 'utf8');
    
    console.log('=== Google Docs ファイル情報 ===');
    console.log('ファイルサイズ:', googleDocsContent.length, '文字');
    console.log('exportの記述を検索...');
    
    // export文を検索
    const exportMatches = googleDocsContent.match(/export.*/g);
    if (exportMatches) {
        console.log('見つかったexport文:', exportMatches);
    } else {
        console.log('export文が見つかりません');
    }
    
    // class定義を検索
    const classMatches = googleDocsContent.match(/class\s+\w+/g);
    if (classMatches) {
        console.log('見つかったclass定義:', classMatches);
    } else {
        console.log('class定義が見つかりません');
    }
    
    // constructor を検索
    const constructorMatches = googleDocsContent.match(/constructor\s*\(/g);
    if (constructorMatches) {
        console.log('constructorが見つかりました:', constructorMatches.length, '個');
    } else {
        console.log('constructorが見つかりません');
    }
    
} catch (error) {
    console.error('ファイル読み込みエラー:', error.message);
}

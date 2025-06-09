/**
 * Google Docs連携機能の動作テスト
 * コンソールで実行して認証とアップロードをテスト
 */

// テスト用の設定
const TEST_CONFIG = {
    authServerUrl: 'http://localhost:3001',
    testContent: `# Google Docs連携テスト

これは**Google Docs連携機能**のテストドキュメントです。

## 主な機能
- OAuth認証フロー
- Markdown/HTML形式アップロード  
- エラーハンドリング
- 認証状態の永続化

### テスト結果
このドキュメントが正常にGoogle Docsに作成されれば、連携機能は成功です。

\`\`\`javascript
console.log('Google Docs連携完了！');
\`\`\`

**実行日時**: ${new Date().toLocaleString('ja-JP')}
`
};

// テスト実行関数
async function runGoogleDocsTest() {
    console.log('🚀 Google Docs連携機能テストを開始します...');
    
    try {
        // 1. 認証サーバーのヘルスチェック
        console.log('1️⃣ 認証サーバーの接続テスト...');
        const healthResponse = await fetch(`${TEST_CONFIG.authServerUrl}/health`);
        if (!healthResponse.ok) {
            throw new Error('認証サーバーに接続できません');
        }
        const healthData = await healthResponse.json();
        console.log('✅ 認証サーバー接続OK:', healthData);
        
        // 2. 認証状態の確認
        console.log('2️⃣ 認証状態の確認...');
        const statusResponse = await fetch(`${TEST_CONFIG.authServerUrl}/auth/status`, {
            credentials: 'include'
        });
        const statusData = await statusResponse.json();
        console.log('📋 認証状態:', statusData);
        
        if (!statusData.authenticated) {
            console.log('⚠️ 認証が必要です。Google Docsボタンをクリックして認証を完了してください。');
            return;
        }
        
        // 3. Google Docs APIテスト
        console.log('3️⃣ Google Docs API接続テスト...');
        const testApiResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${statusData.accessToken}`
            }
        });
        
        if (!testApiResponse.ok) {
            throw new Error('Google APIアクセスに失敗しました');
        }
        
        const userInfo = await testApiResponse.json();
        console.log('✅ Google API接続OK:', userInfo);
        
        // 4. ドキュメント作成テスト
        console.log('4️⃣ テストドキュメントの作成...');
        const documentTitle = `Google Docs連携テスト - ${new Date().toLocaleTimeString()}`;
        
        const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${statusData.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: documentTitle
            })
        });
        
        if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(`ドキュメント作成エラー: ${errorData.error?.message || createResponse.status}`);
        }
        
        const docData = await createResponse.json();
        console.log('✅ ドキュメント作成成功:', docData.title);
        
        // 5. コンテンツ挿入テスト
        console.log('5️⃣ コンテンツの挿入...');
        const insertResponse = await fetch(`https://docs.googleapis.com/v1/documents/${docData.documentId}:batchUpdate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${statusData.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                requests: [{
                    insertText: {
                        location: {
                            index: 1
                        },
                        text: TEST_CONFIG.testContent
                    }
                }]
            })
        });
        
        if (!insertResponse.ok) {
            const errorData = await insertResponse.json();
            throw new Error(`コンテンツ挿入エラー: ${errorData.error?.message || insertResponse.status}`);
        }
        
        console.log('✅ コンテンツ挿入成功');
        
        // 6. 結果レポート
        const documentUrl = `https://docs.google.com/document/d/${docData.documentId}/edit`;
        console.log('🎉 Google Docs連携テスト完了！');
        console.log('📄 作成されたドキュメント:', documentTitle);
        console.log('🔗 ドキュメントURL:', documentUrl);
        
        // ドキュメントを開くかユーザーに確認
        if (confirm('作成されたドキュメントを開きますか？')) {
            window.open(documentUrl, '_blank');
        }
        
        return {
            success: true,
            documentId: docData.documentId,
            documentUrl: documentUrl,
            documentTitle: documentTitle
        };
        
    } catch (error) {
        console.error('❌ テスト失敗:', error);
        console.log('🔧 トラブルシューティング:');
        console.log('- 認証サーバーが起動していることを確認してください');
        console.log('- Google OAuth認証が完了していることを確認してください');
        console.log('- .envファイルの設定を確認してください');
        
        return {
            success: false,
            error: error.message
        };
    }
}

// テストをグローバル関数として公開
window.runGoogleDocsTest = runGoogleDocsTest;

// コンソールにテスト実行方法を表示
console.log('Google Docs連携テスト準備完了');
console.log('テストを実行するには以下をコンソールで実行してください:');
console.log('runGoogleDocsTest()');

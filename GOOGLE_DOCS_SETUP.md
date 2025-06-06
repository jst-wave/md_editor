# Google Docs アップロード機能の設定方法

Google Docsアップロード機能を使用するには、Google Cloud Platform（GCP）でプロジェクトを作成し、Google APIs を有効にする必要があります。

## 1. Google Cloud Platform プロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. プロジェクト名: 例「Markdown Editor」

## 2. 必要なAPIの有効化

Google Cloud Console で以下のAPIを有効にしてください：

1. **Google Docs API**
   - プロジェクトダッシュボード → APIとサービス → ライブラリ
   - 「Google Docs API」を検索して有効化

2. **Google Drive API**
   - 同様に「Google Drive API」を検索して有効化

## 3. 認証情報の作成

### APIキーの作成
1. APIとサービス → 認証情報
2. 「認証情報を作成」→「APIキー」
3. 作成されたAPIキーをコピー

### OAuth 2.0 クライアントIDの作成
1. 「認証情報を作成」→「OAuth クライアント ID」
2. アプリケーションの種類：「ウェブアプリケーション」
3. 名前：「Markdown Editor Web Client」
4. 承認済みのJavaScript生成元：
   - `http://localhost:3000` (開発環境)
   - `http://localhost:8080` (開発環境)
   - 本番環境のURL (必要に応じて)
5. 作成されたクライアントIDをコピー

## 4. 設定ファイルの更新

`src/js/google-docs.js` ファイルの以下の部分を更新してください：

```javascript
// Google API設定
this.CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // ここに作成したクライアントIDを設定
this.API_KEY = 'YOUR_GOOGLE_API_KEY'; // ここに作成したAPIキーを設定
```

## 5. OAuth同意画面の設定

1. APIとサービス → OAuth同意画面
2. ユーザータイプ：「外部」を選択（テスト用）
3. アプリ情報を入力：
   - アプリ名：「Markdown Editor」
   - ユーザーサポートメール：あなたのメールアドレス
   - デベロッパーの連絡先情報：あなたのメールアドレス
4. スコープの設定：
   - `.../auth/documents` (Google Docs API)
   - `.../auth/drive.file` (Google Drive API)

## 6. テストユーザーの追加（開発中）

開発中は「テストユーザー」として自分のGoogleアカウントを追加してください：
1. OAuth同意画面 → テストユーザー
2. 「ユーザーを追加」で自分のGoogleアカウントを追加

## 7. 本番環境への公開

アプリを一般公開する場合：
1. アプリの検証を完了
2. OAuth同意画面の公開状態を「本番環境」に変更
3. Google の審査を通過

## セキュリティに関する注意事項

- APIキーとクライアントIDは公開リポジトリにコミットしないでください
- 本番環境では環境変数や設定ファイルを使用してください
- 承認済みドメインを適切に設定してください

## トラブルシューティング

### よくあるエラー

1. **「このアプリは確認されていません」**
   - OAuth同意画面がテスト状態の場合の正常な動作
   - 「詳細設定」→「[アプリ名]に移動（安全ではありません）」をクリック

2. **「access_blocked: This app's request is invalid」**
   - OAuth同意画面の設定を確認
   - 承認済みJavaScript生成元を確認

3. **「API key not valid」**
   - APIキーが正しく設定されているか確認
   - Google Docs API、Google Drive APIが有効になっているか確認

## サポート

設定に関する詳細は以下を参照してください：
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Docs API ドキュメント](https://developers.google.com/docs/api)
- [Google Drive API ドキュメント](https://developers.google.com/drive/api)

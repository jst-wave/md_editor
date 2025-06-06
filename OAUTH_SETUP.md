# Google Docs OAuth設定ガイド

Google DocsのOAuth認証を設定するためのガイドです。

## 1. Google Cloud Consoleでの設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択
3. 「APIとサービス」> 「認証情報」に移動
4. 「認証情報を作成」> 「OAuth 2.0 クライアント ID」を選択
5. アプリケーションタイプとして「ウェブアプリケーション」を選択
6. 以下の設定を入力：
   - **承認済みJavaScript生成元**: `http://localhost:3001`
   - **承認済みリダイレクトURI**: `http://localhost:3001/auth/google/callback`

## 2. 必要なAPIの有効化

以下のAPIを有効化してください：
- Google Docs API
- Google Drive API

## 3. 認証情報の設定

1. 作成されたクライアントIDとクライアントシークレットをコピー
2. プロジェクトルートの `.env` ファイルを編集：

```env
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
AUTH_SERVER_PORT=3001
CLIENT_URL=http://localhost:3000
```

## 4. アプリケーションの起動

以下のコマンドで認証サーバーとメインアプリを同時に起動：

```bash
npm run dev-with-auth
```

または、個別に起動：

```bash
# 認証サーバー（ターミナル1）
npm run auth-server

# メインアプリ（ターミナル2）
npm run dev
```

## 5. 使用方法

1. アプリケーションを開く（通常は `http://localhost:3000`）
2. 「Google Docs (ログイン)」ボタンをクリック
3. Googleアカウントでログイン
4. 認証完了後、ボタンに「Google Docs (your-email@gmail.com)」と表示される
5. ボタンをクリックしてマークダウンをGoogle Docsにアップロード

## トラブルシューティング

- **認証サーバーが起動しない**: ポート3001が使用されていないか確認
- **認証に失敗する**: `.env`ファイルの設定を確認
- **APIエラー**: Google Cloud ConsoleでAPIが有効化されているか確認

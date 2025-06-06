/**
 * Google Docs統合の代替実装
 * 動的importを使用してモジュール読み込み問題を回避
 */

export class GoogleDocsManager {
    constructor() {
        this.uploader = null;
        this.isLoading = false;
    }

    async loadUploader() {
        if (this.uploader) return this.uploader;
        if (this.isLoading) return null;
        
        this.isLoading = true;
        try {
            console.log('動的importでGoogleDocsUploaderを読み込み中...');
            const module = await import('./google-docs.js');
            console.log('読み込み結果:', module);
            
            const UploaderClass = module.default || module.GoogleDocsUploader;
            console.log('取得したクラス:', UploaderClass);
            console.log('クラスタイプ:', typeof UploaderClass);
            
            if (typeof UploaderClass === 'function') {
                this.uploader = new UploaderClass();
                console.log('✅ GoogleDocsUploaderインスタンス作成成功');
                return this.uploader;
            } else {
                throw new Error('GoogleDocsUploaderクラスが見つかりません');
            }
        } catch (error) {
            console.error('❌ 動的import失敗:', error);
            return null;
        } finally {
            this.isLoading = false;
        }
    }

    async initialize() {
        const uploader = await this.loadUploader();
        if (uploader && uploader.setupEventListeners) {
            uploader.setupEventListeners();
        }
        return uploader;
    }

    async uploadToGoogleDocs(content, title) {
        const uploader = await this.loadUploader();
        if (uploader && uploader.uploadToGoogleDocs) {
            return uploader.uploadToGoogleDocs(content, title);
        }
        throw new Error('GoogleDocsUploaderが利用できません');
    }
}

export default GoogleDocsManager;

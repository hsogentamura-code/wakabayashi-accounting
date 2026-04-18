# 若林町西自治会 Webシステム アーキテクチャ図

本ドキュメントは、当Webシステムを構成する外部サービスと、開発・運用サイクルの全体像を示すアーキテクチャ図です。

## 全体構成図（開発サイクル・実行サイクル）

以下の図は、開発者のPCからソースコードがデプロイされるまでの「開発サイクル」と、一般ユーザーや管理者が実際にシステムを利用する際の「実行サイクル」を表しています。

```mermaid
flowchart TB
    %% 登場人物・デバイス
    subgraph Users [ユーザー・管理者]
        Visitor((一般ユーザー\nスマホ・PC))
        Admin((管理者\nスマホ・PC))
    end
    
    subgraph DevEnv [開発環境]
        DevPC["💻 開発者のPC\n(VS Code / ローカル環境)"]
    end

    %% システムのコア構成
    subgraph Hosting [アプリケーション・ホスティング]
        Vercel{"▲ Vercel\n(Next.js アプリケーションサーバー)"}
    end

    subgraph DataSaaS [データ管理・ストレージ群]
        MicroCMS[("🔵 MicroCMS\n(テキストDB / コンテンツ管理)")]
        R2[("🟧 Cloudflare R2\n(画像・PDF・ファイルストレージ)")]
    end

    subgraph CodeSaaS [ソースコード管理]
        GitHub[("🐙 GitHub\n(ソースコード・リポジトリ)")]
    end

    %% -------------------------
    %% 開発サイクル (青い矢印)
    %% -------------------------
    DevPC -.->|① コードを書いて\nGitHubへPush| GitHub
    GitHub -.->|② Pushを検知して\n自動ビルド＆デプロイ| Vercel

    %% -------------------------
    %% 実行サイクル (赤い・緑の矢印)
    %% -------------------------
    %% 一般ユーザーの閲覧
    Visitor ==>|③ サイトへアクセス\n(https://...)| Vercel
    Vercel ==>|④ 軽量な文字データを\nAPIで高速取得・表示| MicroCMS

    %% 管理者の操作
    Admin ==>|⑤ 管理画面へログインし\n記事や予定を作成・編集| Vercel
    Vercel ==>|⑥ 画像やPDF等の\n「重いファイル」を\n直接アップロード| R2
    Vercel ==>|⑦ ファイルの「URL」と\n「文字データ」をAPIで保存| MicroCMS

    %% スタイル定義
    classDef dev fill:#e0f7fa,stroke:#006064,stroke-width:2px;
    classDef hosting fill:#000000,stroke:#ffffff,color:#ffffff,stroke-width:2px;
    classDef github fill:#24292e,stroke:#ffffff,color:#ffffff,stroke-width:2px;
    classDef microcms fill:#2B2B2B,stroke:#00C2B2,color:#ffffff,stroke-width:2px;
    classDef r2 fill:#F38020,stroke:#ffffff,color:#ffffff,stroke-width:2px;
    
    class DevPC dev;
    class Vercel hosting;
    class GitHub github;
    class MicroCMS microcms;
    class R2 r2;
```

## 各コンポーネントの役割

### 開発・デプロイのサイクル
1. **💻 開発者のPC**: システムの機能追加やデザイン変更などのプログラミングを行うローカル環境です。
2. **🐙 GitHub**: 全ての設計図（ソースコード）を安全に保管・バージョン管理するクラウド上の金庫です。開発者がPCから修正したコードを送信（Push）すると、それがトリガーとなります。
3. **▲ Vercel**: GitHubへ新しいコードが届いたことを自動で検知し、システムを組み立て直して（ビルド）、全世界に向けてインターネット上に公開（デプロイ）します。

### アプリケーション実行のサイクル
1. **▲ Vercel (Next.js)**: 一般ユーザーからのアクセスや、管理者からの画面操作をすべて受け止める「メインサーバー」として稼働します。
2. **🔵 MicroCMS**: 「新着情報のタイトル」「行事予定の日時」「カテゴリ」などの**軽くて構造化された文字データ**を超高速で出し入れする専用のデータベースです。
3. **🟧 Cloudflare R2**: アップロードされた「画像・PDF・動画」など**重いファイル**を専門に引き受ける巨大な倉庫です。Vercelは巨大なファイルをここに投げ込み、そのファイルの「URL」だけを取り出してMicroCMSの文字データと一緒に保存するという効率的な分散処理を行っています。

# Fukuro - HSP向けマインドフルネスアプリ

![Fukuro App Logo](./assets/images/app-logo-placeholder.png)

## 概要

Fukuroは高感受性者（HSP: Highly Sensitive Person）向けのモバイルアプリケーションです。日常的なストレス管理、感情のセルフケア、マインドフルネスの実践をサポートします。

### 主要機能

1. **フクロウAIカウンセラー**
   - 親しみやすいフクロウキャラクター「ミミ」によるAIチャット
   - HSPの特性を理解した共感的対話
   - 日々の感情記録と振り返り

2. **マインドフルネス＆リラクゼーションパック**
   - ガイド付き瞑想セッション
   - 呼吸法エクササイズ
   - HSP向けサウンドセラピー

3. **HSP向けUI/UX**
   - 視覚的刺激を抑えたデザイン
   - 調整可能な視覚的強度と動きの設定
   - ハプティックフィードバックのコントロール

## 実装済み機能

- ✅ 認証機能 (ログイン/登録)
- ✅ AIチャット機能
- ✅ 瞑想セッションブラウザ
- ✅ 瞑想タイマーと音声ガイド
- ✅ サウンドライブラリと再生機能
- ✅ ユーザープロフィールと設定
- ✅ HSP向けアクセシビリティ設定
- ✅ プレミアム機能サンプル

## スクリーンショット

![スクリーンショット](./docs/screenshots-placeholder.png)

## 技術スタック

- React Native + Expo
- TypeScript
- Supabase (認証・データベース)
- OpenAI API (AIチャット)
- NativeWind (スタイリング)
- Zustand (状態管理)

## プロジェクト構造

```
hsp-fukuro-app/
├── app/                            # Expoルーター (ファイルベースルーティング)
│   ├── (auth)/                    # 認証関連画面
│   │   ├── login.tsx             # ログイン画面
│   │   ├── register.tsx          # 登録画面
│   │   └── _layout.tsx           # 認証レイアウト
│   ├── (main)/                    # メイン画面
│   │   ├── index.tsx             # ホーム画面
│   │   ├── chat.tsx              # チャット画面
│   │   ├── meditation.tsx        # 瞑想セッション一覧
│   │   ├── meditation/           # 瞑想関連
│   │   │   └── session.tsx       # 瞑想セッション実行
│   │   ├── sounds.tsx            # サウンド画面
│   │   ├── profile.tsx           # プロフィール画面
│   │   └── _layout.tsx           # メインレイアウト (タブナビゲーション)
├── components/                     # コンポーネント
│   ├── ui/                        # UIエレメント
│   │   ├── atoms/                # 最小単位のコンポーネント
│   │   ├── molecules/            # 複合的な小コンポーネント
│   │   └── organisms/            # 複雑な大コンポーネント
│   ├── layout/                    # レイアウトコンポーネント
│   └── providers/                 # コンテキストプロバイダー
├── hooks/                         # カスタムフック
├── lib/                           # 外部サービス/ユーティリティ
│   └── supabase/                 # Supabase関連
├── services/                      # サービス層
├── store/                         # 状態管理
│   └── slices/                   # ステートスライス
├── config/                        # アプリ設定
├── assets/                        # 静的アセット
└── styles/                        # スタイル定義
```

## インストール

```bash
# リポジトリのクローン
git clone https://github.com/tomiz-samurai/hsp-fukuro-app.git
cd hsp-fukuro-app

# パッケージのインストール
pnpm install

# 開発サーバーの起動
pnpm start
```

## 開発環境

- Node.js v20.0.0以上
- pnpm v8.14.0以上
- Expo CLI v0.10.0以上

## 対応プラットフォーム

- iOS 13.0以上
- Android 9.0以上

## ライセンス

Copyright © 2025 Fukuro App Team. All rights reserved.

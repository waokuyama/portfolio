## 概要
AWS 未経験からの学習ポートフォリオ。
AWS CLI を中心に操作し、IAM / Lambda / S3 / CloudFront / CloudWatch などの主要サービスを段階的に組み合わせて構築。
シナリオごとに実装、検証、エラーの記録を残し、再現性のある環境構築スキルを身につけることが目的。

---

## シナリオ一覧

### 1-1.Lambda:HelloWorld
- 目的: AWS Lambda と IAM ロールの基本理解
- 成果物: Node.js 20.x の Hello World 関数
- 学び:
  - IAM ロール作成とポリシーの付与
  - Lambda 関数のデプロイ（CLI）
  - CloudWatch Logs でのログ確認

---

### 1-2.Lambda + APIGateway:GreetAPI
- 目的: Lambda と API Gateway を組み合わせた API 構築の基礎理解
- 成果物: greet-world 関数を HTTP API 経由で呼び出せる環境
- 学び:
  - IAM ロールの作成とポリシー付与
  - Lambda 関数 (greet-world) の作成
  - API Gateway HTTP API の作成と Lambda への紐付け
  - 環境変数 (ROLE_ARN, API_ID, API_ENDPOINT) を使った CLI 操作
  - Lambda に API Gateway 呼び出し権限を付与
  - 削除手順の体系化（API → Lambda → IAM ロール → ローカルファイルまで）
  - エラー対応（例: API_ID 指定ミス）

---

## 今後の展望

### 短期
1-1〜1-3の基礎シナリオを発展させ、API Gateway / DynamoDB / SQS / SNS などを追加したシナリオを作成
AWS CLI 操作に慣れ、サービスの連携に対する理解を深める

### 中期（実践シナリオ）
3〜4サービスを組み合わせたサーバレスアプリの構築
例: API Gateway → Lambda → DynamoDB → CloudWatch
CI/CD（CodePipeline, CodeBuild）を導入し、自動デプロイを実践

### 長期（教材化・共有）
学習ログを教材化し、サンプル問題や演習課題を追加
「次世代エンジニア育成用のシナリオ集」として活用

---

## アピールポイント
- 単なる「ハンズオン」ではなく、CLI 実行ログ・エラー記録・設計資料 を残し、再現性を担保
- サービスの連携・運用面（ログ管理、セキュリティ）を意識した構成
- 学習成果を「ポートフォリオ」＋「教材」として体系化し、継続的なスキルアップとアウトプットに活用
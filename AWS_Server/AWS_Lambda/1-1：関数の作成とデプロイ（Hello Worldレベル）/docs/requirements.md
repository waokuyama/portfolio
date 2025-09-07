# 要件定義書

AWS Lambdaを利用して「Hello World」を返す
APIを作成し、Lambdaの基本構成フローを習得するためのプロジェクト。

---

## 目次
- [要件定義書](#要件定義書)
  - [目次](#目次)
  - [1. プロジェクト概要](#1-プロジェクト概要)
  - [2. 機能概要](#2-機能概要)
    - [(1) Lambda関数の作成](#1-lambda関数の作成)
    - [(2) ログの出力](#2-ログの出力)
    - [(3) テスト実行](#3-テスト実行)
  - [3. 非機能要件](#3-非機能要件)
  - [4. 開発・運用要件](#4-開発運用要件)
  - [5.制約・前提条件](#5制約前提条件)
  - [6.命名規則](#6命名規則)
  - [7.使用技術](#7使用技術)
  - [8.削除対象](#8削除対象)

---

## 1. プロジェクト概要
- **目的**  
  AWS Lambdaを利用して「Hello World」を返すAPIを作成し、Lambdaの基本構成フローを習得する。

- **利用範囲**  
  個人AWSアカウント（東京リージョン）

- **スコープ外**  
  VPC連携  
  DB接続  
  API Gatewayとの統合  

---

## 2. 機能概要

### (1) Lambda関数の作成
- 関数名：hello-world
- ランタイム：Node.js 20.x 
- ハンドラー：index.handler 

コード内容
```javascript
exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" }),
    headers: { "Content-Type": "application/json" }
  };
};
```

### (2) ログの出力
- 出力先：CloudWatchLogs
- 出力内容例：Hello world invoked. Event{...}

### (3) テスト実行
入力ペイロード
```javascript
{
  "Sample": "data"
}
```
期待値
```javascript
{
  "StatusCode": 200,
  "body": {
    "message": "Hello world"
  },
  "headers": {
    "Content-Type": "application/json"
  }
}

```

## 3. 非機能要件
- セキュリティ：最小権限IAMロール（AWSLambdaBasicExecutionRole）
- リージョン：ap-northeast-1（東京）
- コスト：最小限

## 4. 開発・運用要件
- 構成管理：ソースコードをGitHubに保存
- テスト：Lambdaコンソールのテストイベントを使用
- 監視：CloudWatch Logsでエラーメッセージを確認

## 5.制約・前提条件
- ローカルPCにAWS CLIがインストール済みであること
- IAMユーザーに以下の権限が付与されていること
>>lambda:*<br>
>>logs:*<br>
>>iam:*<br>
- 実行リージョンは東京（ap-northeast-1）

## 6.命名規則
- Lambda関数名：hello-world（小文字・ハイフン区切り）
- IAMロール名：hello-world-role
- CloudWatchロググループ：/aws/lambda/hello-world

## 7.使用技術
- AWS Lambda関数（Hello World API）
- IAMロール（hello-world-role）
- GitHubリポジトリ（ソースコード・要件定義）

## 8.削除対象
- Lambda関数：hello-world
- IAMロール：hello-world-role
- CloudWatch Logs：/aws/lambda/hello-world
  
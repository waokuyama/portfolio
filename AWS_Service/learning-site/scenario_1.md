## シナリオ概要
- DynamoDBに「ユーザー情報」を保存
- Lambda(Python)からDynamoDBに対して「登録」「取得」ができる
- CLI からテストできる構成

---

## 構成図（最小構成）
```javascript
[CLI] → invoke → [Lambda (Python)] ↔ [DynamoDB]
```

---

## DynamoDBテーブル例
```javascript
{
  "userId": "u001",
  "name": "Alice",
  "email": "alice@example.com",
  "createdAt": "2025-09-12T12:00:00Z"
}
```
- テーブル名：`Users`
- パーティションキー：`userId` 
- 属性：`name`, `email`, `createdAt`

---

## 今後の拡張
- APIGatewayの追加：RESTAPI化
- Cognitoの追加：認証付きAPI
- DynamoDBのスキーマの拡大：「教材」「問題」「進捗データ」など

- 入力バリエーションの追加
- 例外処理の追加
- 最小権限の IAM

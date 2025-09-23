# ロール作成時
入力値、出力値、出力値の意味、改善方法

## 1.API削除時
入力値
```javascript
aws apigatewayv2 delete-api --api-id $fyv0mxr1s4 --region ap-northeast-1
```

エラー内容
```javascript
usage: aws [options] <command> <subcommand> [<subcommand> ...] [parameters]
To see help text, you can run:

  aws help
  aws <command> help
  aws <command> <subcommand> help

aws: error: argument --api-id: expected one argument
```

意味：API_ID名が異なる

解決方法：API_ID名の確認

---

## 2.ロールの削除時
入力値
```javascript
aws iam delete-service-linked-role --role-name AWSServiceRoleForAPIGateway
```
出力値
```javascript
{
    "DeletionTaskId": "task/aws-service-role/ops.apigateway.amazonaws.com/AWSServiceRoleForAPIGateway/a51fd6e0-7d1c-4ad4-976a-335257c18008"
}
```

意味：エラーではなく削除リクエストを受け付けた状態
解決方法：時間空けてからロールの一覧を再表示
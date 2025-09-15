## 概要
APIGateway → WebからアクセスできるAPIの作成
※1の続き

- [概要](#概要)
- [1.APIGatewayの作成](#1apigatewayの作成)
- [2.ルートリソースの取得](#2ルートリソースの取得)
- [3./user リソースの追加](#3user-リソースの追加)
- [4.HTTP メソッドの追加（POST → Lambda 呼び出し）](#4http-メソッドの追加post--lambda-呼び出し)
- [5.Lambda と統合](#5lambda-と統合)
- [6.LambdaにAPIGateway実行権限を付与](#6lambdaにapigateway実行権限を付与)
- [7.デプロイ](#7デプロイ)
- [8.動作確認（curl を使用）](#8動作確認curl-を使用)

---

## 1.APIGatewayの作成
入力値
```javascript
aws apigateway create-rest-api \
  --name "UserAPI" \
  --region ap-northeast-1
```
- aws apigateway create-rest-api：新しいRESTAPIの作成
- --name "UserAPI"：API名を設定
- --region ap-northeast-1：東京リージョンに作成

出力値
```javascript

```

確認方法<br>
```javascript
aws apigateway get-rest-apis --region ap-northeast-1
```

作成されていない状態の出力<br>
```javascript

```

作成されている状態の出力<br>
```javascript
 
```

削除方法<br>
```javascript
aws apigateway delete-rest-api \
  --rest-api-id xxxx \
  --region ap-northeast-1
```
- --rest-api-id xxxx：「aws apigateway get-rest-apis --region ap-northeast-1」でID確認できる


---

## 2.ルートリソースの取得
入力値
```javascript
aws apigateway get-resources \
  --rest-api-id xxxx \
  --region ap-northeast-1
```
- aws apigateway get-resources：APIGateway内にあるリソース一覧を取得
- --rest-api-id xxxx：「aws apigateway get-rest-apis --region ap-northeast-1」でID確認できる
- --region ap-northeast-1：東京リージョン
※情報の取得：リソースIDをメモ

出力値
```javascript

```




---

## 3./user リソースの追加
入力値
```javascript
aws apigateway create-resource \
  --rest-api-id xxxx \
  --parent-id abc123 \
  --path-part user \
  --region ap-northeast-1
```
- aws apigateway create-resource：APIGatewayのリソースを作成
- --rest-api-id xxxx：「aws apigateway get-rest-apis --region ap-northeast-1」でID確認できる
- --parent-id abc123：新しいリソースを配置する親リソースのリソースID
- --path-part user：作るリソースの パスセグメント
- --region ap-northeast-1：東京リージョン

出力値
```javascript

```

確認方法<br>
```javascript
aws apigateway get-resources \
  --rest-api-id xxxx \
  --region ap-northeast-1
```
- --rest-api-id xxxx：「aws apigateway get-rest-apis --region ap-northeast-1」でID確認できる

作成されていない状態の出力<br>
```javascript

```

作成されている状態の出力<br>
```javascript
 
```

削除方法<br>
```javascript
aws apigateway delete-resource \
  --rest-api-id xxxx \
  --resource-id def456 \
  --region ap-northeast-1
```
- --rest-api-id xxxx：「aws apigateway get-rest-apis --region ap-northeast-1」でID確認できる
- --resource-id def456：下記コマンドで確認
  「aws apigateway get-resources \
  --rest-api-id xxxx \
  --region ap-northeast-1」
  
---

## 4.HTTP メソッドの追加（POST → Lambda 呼び出し）
入力値
```javascript
aws apigateway put-method \
  --rest-api-id xxxx \
  --resource-id def456 \
  --http-method POST \
  --authorization-type "NONE" \
  --region ap-northeast-1
```
- aws apigateway put-method：APIGatewayにメソッドを追加／設定する操作
- --rest-api-id xxxx：「aws apigateway get-rest-apis --region ap-northeast-1」でID確認できる
- --resource-id def456：下記コマンドで確認
  「aws apigateway get-resources \
  --rest-api-id xxxx \
  --region ap-northeast-1」
- --http-method POST：作成するHTTPメソッド
- --authorization-type "NONE"：認証方式の指定「NONE」は認証不要
- --region ap-northeast-1：東京リージョン

出力値
```javascript

```

確認方法(単体)<br>
```javascript
aws apigateway get-method \
  --rest-api-id xxxx \
  --resource-id def456 \
  --http-method POST \
  --region ap-northeast-1
```
- --rest-api-id xxxx：「aws apigateway get-rest-apis --region ap-northeast-1」でID確認できる
- --resource-id def456：下記コマンドで確認
  「aws apigateway get-resources \
  --rest-api-id xxxx \
  --region ap-northeast-1」

作成されていない状態の出力<br>
```javascript

```

作成されている状態の出力<br>
```javascript
 
```

削除方法(メソッド本体)<br>
```javascript
aws apigateway delete-method \
  --rest-api-id xxxx \
  --resource-id def456 \
  --http-method POST \
  --region ap-northeast-1
```
- --rest-api-id xxxx：「aws apigateway get-rest-apis --region ap-northeast-1」でID確認できる
- --resource-id def456：下記コマンドで確認
  「aws apigateway get-resources \
  --rest-api-id xxxx \
  --region ap-northeast-1」

---

## 5.Lambda と統合
入力値
```javascript
aws apigateway put-integration \
  --rest-api-id xxxx \
  --resource-id def456 \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:ap-northeast-1:lambda:path/2015-03-31/functions/arn:aws:lambda:ap-northeast-1:xxxx:function:UserHandler/invocations \
  --region ap-northeast-1
```
- aws apigateway put-integration：APIGatewayのメソッドとバックエンド（Lambda）を統合
- --rest-api-id xxxx：「aws apigateway get-rest-apis --region ap-northeast-1」でID確認できる
- --resource-id def456：下記コマンドで確認
  「aws apigateway get-resources \
  --rest-api-id xxxx \
  --region ap-northeast-1」
- --http-method POST：どのメソッドに対して統合を作るか
- --type AWS_PROXY：統合タイプ
- --integration-http-method POST：バックエンド呼び出しに使うHTTP メソッド。Lambdaの場合は常にPOST
- --uri〜〜：呼び出すLambda関数のURI。指定した関数（UserHandler）が呼ばれる
- --region ap-northeast-1：東京リージョン

出力値
```javascript

```

確認方法<br>
```javascript
aws apigateway get-integration \
  --rest-api-id xxxx \
  --resource-id def456 \
  --http-method POST \
  --region ap-northeast-1
```
- --rest-api-id xxxx：「aws apigateway get-rest-apis --region ap-northeast-1」でID確認できる
- --resource-id def456：下記コマンドで確認
  「aws apigateway get-resources \
  --rest-api-id xxxx \
  --region ap-northeast-1」

作成されていない状態の出力<br>
```javascript

```

作成されている状態の出力<br>
```javascript
 
```

削除方法<br>
```javascript
aws apigateway delete-integration \
  --rest-api-id xxxx \
  --resource-id def456 \
  --http-method POST \
  --region ap-northeast-1
```
- --rest-api-id xxxx：「aws apigateway get-rest-apis --region ap-northeast-1」でID確認できる
- --resource-id def456：下記コマンドで確認
  「aws apigateway get-resources \
  --rest-api-id xxxx \
  --region ap-northeast-1」

---

## 6.LambdaにAPIGateway実行権限を付与
入力値
```javascript
aws lambda add-permission \
  --function-name UserHandler \
  --statement-id apigateway-test-1 \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn arn:aws:execute-api:ap-northeast-1:123456789012:a1b2c3d4e5/*/POST/user \
  --region ap-northeast-1
```
- aws lambda add-permission：Lambda関数のリソースベースポリシーに権限を追加

出力値
```javascript

```

確認方法<br>
```javascript

```

作成されていない状態の出力<br>
```javascript

```

作成されている状態の出力<br>
```javascript
 
```

削除方法<br>
```javascript
 
```

---

## 7.デプロイ
入力値
```javascript
aws apigateway create-deployment \
  --rest-api-id a1b2c3d4e5 \
  --stage-name dev \
  --region ap-northeast-1
```

出力値
```javascript

```

確認方法<br>
```javascript

```

作成されていない状態の出力<br>
```javascript

```

作成されている状態の出力<br>
```javascript
 
```

削除方法<br>
```javascript
 
```

---

## 8.動作確認（curl を使用）
入力値
```javascript
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"action":"createUser","userId":"u002","name":"Bob","email":"bob@example.com"}' \
  https://a1b2c3d4e5.execute-api.ap-northeast-1.amazonaws.com/dev/user
```

出力値
```javascript

```

確認方法<br>
```javascript

```

作成されていない状態の出力<br>
```javascript

```

作成されている状態の出力<br>
```javascript
 
```

削除方法<br>
```javascript
 
```

---
# CLI実行ログ

## 1. IAMロール用のファイル作成
入力値
```javascript
cat > greet-trust.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
EOF

```
---

## 2. ロール作成
入力値
```javascript
aws iam create-role \
  --role-name greet-world-role \
  --assume-role-policy-document file://greet-trust.json

```

---

## 3. ポリシー付与
入力値
```javascript
aws iam attach-role-policy \
  --role-name greet-world-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

---

## 4. index.mjs 作成
入力値
```javascript
cat > greet.mjs <<'EOF'
export const handler = async (event) => {
  console.log("Greet World invoked. Event:", JSON.stringify(event));

  // GET の場合はクエリパラメータから name を取得
  let name = "Guest";
  if (event.queryStringParameters && event.queryStringParameters.name) {
    name = event.queryStringParameters.name;
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: `Hello, ${name}!` })
  };
};
EOF

```

---

## 5. zip化
入力値
```javascript
zip greet.zip greet.mjs
```

---

## 6. 環境変数の定義
入力値
```javascript
ROLE_ARN=$(aws iam get-role \
  --role-name greet-world-role \
  --query Role.Arn \
  --output text)
```

---

## 7. Lambda関数の作成
入力値
```javascript
aws lambda create-function \
  --region ap-northeast-1 \
  --function-name greet-world \
  --runtime nodejs20.x \
  --role "$ROLE_ARN" \
  --handler greet.handler \
  --zip-file fileb://greet.zip
```

---

## 8. APIの作成
入力値
```javascript
API_ID=$(aws apigatewayv2 create-api \
  --name greet-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:ap-northeast-1:123456789012:function:greet-world \
  --query 'ApiId' \
  --output text \
  --region ap-northeast-1)
```

---

## 9. APIの情報確認
入力値
```javascript
API_ENDPOINT=$(aws apigatewayv2 get-api \
  --api-id $API_ID \
  --query 'ApiEndpoint' \
  --output text \
  --region ap-northeast-1)
echo $API_ENDPOINT
```

---

## 10. Lambda に API Gateway 呼び出し権限を追加
入力値
```javascript
aws lambda add-permission \
  --function-name greet-world \
  --statement-id apigateway-greet-1 \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:ap-northeast-1:123456789012:$API_ID/*/*" \
  --region ap-northeast-1
```

---

## 11. 実行
入力値
```javascript
https://$API_ENDPOINT?name=Taro
curl "$API_ENDPOINT?name=Hanako"
```

---

## 12. 削除
入力値
```javascript
aws apigatewayv2 delete-api \
  --api-id $API_ID \
  --region ap-northeast-1

aws lambda delete-function \
  --function-name greet-world \
  --region ap-northeast-1

aws iam detach-role-policy \
  --role-name greet-world-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam delete-role --role-name greet-world-role

rm greet-trust.json greet.mjs greet.zip
```

---
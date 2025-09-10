# CLI実行ログ

## 1. IAMロール用のファイル作成
入力値
```javascript
cat > site-trust.json <<'EOF'
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

## 2.ロールの作成
入力値
```javascript
aws iam create-role \
  --role-name site-lambda-role \
  --assume-role-policy-document file://site-trust.json
```
---

## 3.ポリシーの付与
入力値
```javascript
aws iam attach-role-policy \
  --role-name site-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```
---

## 4.index.mjsファイルの作成
入力値
```javascript
cat > site.mjs <<'EOF'
export const handler = async (event) => {
  console.log("Lambda invoked:", JSON.stringify(event));
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Lambda!" })
  };
};
EOF
```
---

## 5.zip化
入力値
```javascript
zip site.zip site.mjs
```
---

## 6.環境変数の定義
入力値
```javascript
ROLE_ARN=$(aws iam get-role \
  --role-name site-lambda-role \
  --query Role.Arn \
  --output text)
```
---

## 7.Lambda関数の作成
入力値
```javascript
aws lambda create-function \
  --region ap-northeast-1 \
  --function-name site-lambda \
  --runtime nodejs20.x \
  --role "$ROLE_ARN" \
  --handler site.handler \
  --zip-file fileb://site.zip
```
---

## 8.API Gateway 作成
入力値
```javascript
aws apigatewayv2 create-api \
  --name site-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:ap-northeast-1:123456789012:function:site-lambda \
  --region ap-northeast-1
```
---

## 9.API の情報を取得
入力値
```javascript
API_ID=$(aws apigatewayv2 get-apis \
  --query "Items[?Name=='site-api'].ApiId" \
  --output text \
  --region ap-northeast-1)

API_ENDPOINT=$(aws apigatewayv2 get-api \
  --api-id $API_ID \
  --query "ApiEndpoint" \
  --output text \
  --region ap-northeast-1)

```
---

## 10.Lambda に実行権限を付与
入力値
```javascript
aws lambda add-permission \
  --function-name site-lambda \
  --statement-id apigateway-site-1 \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:ap-northeast-1:123456789012:$API_ID/*/*" \
  --region ap-northeast-1
```
---

## 11.S3 バケット作成
入力値
```javascript
aws s3 mb s3://site-sample-bucket-123456
```
---

## 12.HTML ファイル作成
入力値
```javascript
cat > index.html <<EOF
<!DOCTYPE html>
<html>
<head><title>Site + Lambda</title></head>
<body>
  <h1>My Static Site</h1>
  <button onclick="callApi()">Call Lambda</button>
  <pre id="result"></pre>
  <script>
    async function callApi() {
      const res = await fetch('$API_ENDPOINT');
      const data = await res.json();
      document.getElementById('result').innerText = JSON.stringify(data);
    }
  </script>
</body>
</html>
EOF

```
---

## 13.アップロード
入力値
```javascript
aws s3 cp index.html s3://site-sample-bucket-123456/ --acl public-read
```
---

## 14.CloudFront ディストリビューション作成
入力値
```javascript
aws cloudfront create-distribution \
  --origin-domain-name site-sample-bucket-123456.s3.amazonaws.com \
  --default-root-object index.html
```
※出力される"DomainName": "xxxx.cloudfront.net" をメモ
---

## 15.動作確認
入力値(ブラウザ上)
```javascript
https://xxxx.cloudfront.net
```
---

## 15.削除
入力値
```javascript
# CloudFront 削除 (ディストリビューションIDは確認必要)
aws cloudfront delete-distribution --id CLOUDFRONT_ID --if-match ETAG

# S3 削除
aws s3 rb s3://site-sample-bucket-123456 --force

# API Gateway 削除
aws apigatewayv2 delete-api --api-id $API_ID --region ap-northeast-1

# Lambda 削除
aws lambda delete-function --function-name site-lambda --region ap-northeast-1

# ロール削除
aws iam detach-role-policy \
  --role-name site-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam delete-role --role-name site-lambda-role

# ローカルファイル削除
rm site-trust.json site.mjs site.zip index.html

```
---
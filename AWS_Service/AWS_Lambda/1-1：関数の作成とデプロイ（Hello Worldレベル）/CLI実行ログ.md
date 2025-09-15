# CLI実行ログ
入力値と出力値のみ

## 1. IAMロール用のファイル作成
入力値
```javascript
cat > trust.json <<'EOF'
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

出力値<br>
無し：作業ディレクトリ配下にtrust.jsonファイルの作成<br>

---

## 2. IAMロールの作成
入力値
```javascript
aws iam create-role \
  --role-name hello-world-role\
  --assume-role-policy-document file://trust.json
```

出力値
```javascript
{
    "Role": {
        "Path": "/",
        "RoleName": "hello-world-role",
        "RoleId": "AROA53F2J43EMIBO47FPF",
        "Arn": "arn:aws:iam::xxxx:role/hello-world-role",
        "CreateDate": "2025-09-02T11:23:53+00:00",
        "AssumeRolePolicyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "lambda.amazonaws.com"
                    },
                    "Action": "sts:AssumeRole"
                }
            ]
        }
    }
}
```

---

## 3.hello-world-roleロールにポリシーの付与
入力値
```javascript
aws iam attach-role-policy \
  --role-name hello-world-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

出力値<br>
無し<br>

---

## 4.Lambda実行用のファイル作成
入力値
```javascript
cat > index.mjs <<'EOF'
export const handler = async (event) => {
  console.log("Hello World invoked. Event:", JSON.stringify(event));
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" })
  };
};
EOF
```

出力値<br>
無し：作業ディレクトリ配下にtrust.jsonファイルの作成<br>

---

## 5.Zipファイルの作成
入力値
```javascript
zip function.zip index.mjs
```

出力値
```javascript
adding: index.mjs (deflated 25%)
```

---

## 6.IAMロールのARNを抽出する環境変数の定義
入力値
```javascript
ROLE_ARN=$(aws iam get-role \
  --role-name hello-world-role \
  --query Role.Arn \
  --output text)
```

出力値<br>
無し：Linux / Mac のシェル（bashやzsh）の中の環境変数を定義<br>

---

## 7.Lambda関数の作成
入力値
```javascript
aws lambda create-function \
  --region ap-northeast-1 \
  --function-name hello-world \
  --runtime nodejs20.x \
  --role "$ROLE_ARN" \
  --handler index.handler \
  --zip-file fileb://function.zip
```

出力値
```javascript
"FunctionName": "hello-world",
〜〜〜

"LoggingConfig": {
"LogFormat": "Text",
"LogGroup": "/aws/lambda/hello-world"
}
```

---

## 8.テストイベントファイルの作成
入力値
```javascript
cat > payload.json <<'EOF'
{
  "key1": "value1"
}
EOF
```

出力値
無し：作業ディレクトリ配下にpayload.jsonファイルの作成<br>

---

## 9.Lambda関数の実行
入力値<br>
```javascript
aws lambda invoke \
  --function-name hello-world \
  --payload file://payload.json \
  out.json \
  --region ap-northeast-1 \
  --cli-binary-format raw-in-base64-out
```

出力値
```javascript
{
    "StatusCode": 200,
    "ExecutedVersion": "$LATEST"
}
```

---


# CLI実行ログ

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

削除方法<br>
```javascript
rm trust.json
```

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
        "Arn": "arn:aws:iam::951725975240:role/hello-world-role",
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
確認方法(ロール名の一覧表示)<br>
```javascript
aws iam list-roles --query 'Roles[].RoleName' --output table
```
ロールが作成されていない状態の出力
```javascript
|                   ListRoles                  |
+----------------------------------------------+
|  amplify-myamplifyapp-dev-151126-authRole    |
|  amplify-myamplifyapp-dev-151126-unauthRole  |
|  AWSServiceRoleForSupport                    |
|  AWSServiceRoleForTrustedAdvisor 
```
ロールが作成されている状態の出力
```javascript
|                   ListRoles                  |
+----------------------------------------------+
|  amplify-myamplifyapp-dev-151126-authRole    |
|  amplify-myamplifyapp-dev-151126-unauthRole  |
|  AWSServiceRoleForSupport                    |
|  AWSServiceRoleForTrustedAdvisor             |
|  hello-world-role    
```
削除方法<br>
```javascript
aws iam delete-role --role-name hello-world-role
```
※アタッチされているポリシーがあると削除できない<br>

---

## 3.hello-world-roleロールにポリシーの付与
入力値
```javascript
aws iam attach-role-policy \
  --role-name hello-world-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```
出力値<br>
無し

確認方法
```javascript
aws iam list-attached-role-policies \
  --role-name hello-world-role
```
ポリシーが付与されていない状態の出力
```javascript
{
    "AttachedPolicies": []
}
```
ポリシーが付与されている状態の出力
```javascript
{
 "AttachedPolicies": [
        {
            "PolicyName": "AWSLambdaBasicExecutionRole",
            "PolicyArn": "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        }
    ]
}
```
ポリシーのデタッチ
```javascript
aws iam detach-role-policy \
  --role-name hello-world-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

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
削除方法<br>
```javascript
rm index.mjs
```

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
削除方法<br>
```javascript
rm function.zip
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
無し：Linux / Mac のシェル（bashやzsh）の中の環境変数<br>

確認方法
```javascript
echo $ROLE_ARN
```
環境変数が定義されていない状態の出力
```javascript

```
環境変数が定義されている状態の出力
```javascript
arn:aws:iam::951725975240:role/hello-world-role
```
削除方法
```javascript
unset ROLE_ARN
```

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

```
確認方法(一覧)
```javascript
aws lambda list-functions --region ap-northeast-1
```
確認方法(単体の関数)
```javascript
aws lambda get-function \
  --function-name hello-world \
  --region ap-northeast-1
```

Lambda関数が作成されていない状態の出力
```javascript
{
    "Functions": []
}
```
Lambda関数が作成されている状態の出力
```javascript
〜〜
        "RevisionId": "cafd739c-dafc-4c34-bb44-f26208a5eef3",
        "State": "Active",
        "LastUpdateStatus": "Successful",
        "PackageType": "Zip",
        "Architectures": 
```
削除方法
```javascript
aws lambda delete-function \
  --function-name hello-world \
  --region ap-northeast-1
```

---

## 8.Lambda関数の実行
入力値
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
確認方法(ローカルファイル out.json)
```javascript
cat out.json
```
確認方法(CloudWatch Logs)
```javascript
aws logs describe-log-groups --region ap-northeast-1
```

削除方法(out.json の削除（ローカルファイル）)
```javascript
rm out.json
```
削除方法(CloudWatch Logs の削除)
```javascript
aws logs delete-log-group \
  --log-group-name /aws/lambda/hello-world \
  --region ap-northeast-1
```
---

## 9.削除
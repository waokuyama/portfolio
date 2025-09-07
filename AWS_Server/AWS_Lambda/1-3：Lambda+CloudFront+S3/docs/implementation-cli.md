### CLIでの実装手順
---
## 目次
- [目次](#目次)
- [1. IAMロール用のファイル作成](#1-iamロール用のファイル作成)
- [2.ロールの作成](#2ロールの作成)
- [3.ポリシーの付与](#3ポリシーの付与)
- [4.site.mjsファイルの作成](#4sitemjsファイルの作成)
- [5.zip化](#5zip化)
- [6.環境変数の定義](#6環境変数の定義)
- [7.Lambda関数の作成](#7lambda関数の作成)
- [8.API Gateway 作成](#8api-gateway-作成)
- [9.API の情報を取得](#9api-の情報を取得)
- [10.Lambda に実行権限を付与](#10lambda-に実行権限を付与)
- [11.S3 バケット作成](#11s3-バケット作成)
- [12.HTML ファイル作成](#12html-ファイル作成)
- [13.アップロード](#13アップロード)
- [14.CloudFront ディストリビューション作成](#14cloudfront-ディストリビューション作成)
- [15.動作確認](#15動作確認)
- [16.削除](#16削除)
---

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
- cat > site-trust.json <<'EOF'<br>
「site-trust.json」ファイルを作業ディレクトリ配下に作成
- "Version": "2012-10-17"<br>
バージョンの指定基本変動無し
- "Effect": "Allow"<br>
許可の指定 
- "Principal": { "Service": "lambda.amazonaws.com" }<br>
Lambdaサービスがこのロールを使うのを許可
- "Action": "sts:AssumeRole"<br>
一時的な認証情報の発行

出力値<br>
無し：作業ディレクトリ配下にsite-trust.jsonファイルの作成<br>

削除方法<br>
```javascript
rm site-trust.json
```
---

## 2.ロールの作成
入力値
```javascript
aws iam create-role \
  --role-name site-lambda-role \
  --assume-role-policy-document file://site-trust.json
```
- aws iam create-role<br>
新規でロールの作成
- --role-name site-lambda-role<br>
ロール名の設定「site-lambda-role」
- --assume-role-policy-document file://site-trust.json<br>
信頼ポリシーの設定「site-trust.json」の中身を信頼ポリシーとして設定

出力値
```javascript
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
EOF
seri@seris-MacBook-Air Desktop % aws iam create-role \
  --role-name site-lambda-role \
  --assume-role-policy-document file://site-trust.json
{
    "Role": {
        "Path": "/",
        "RoleName": "site-lambda-role",
        "RoleId": "AROA53F2J43EJQLI3PSLA",
        "Arn": "arn:aws:iam::xxxxxxxxxxxx:role/site-lambda-role",
        "CreateDate": "2025-09-07T00:12:20+00:00",
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
|  site-lambda-role
```

削除方法<br>
```javascript
aws iam delete-role --role-name site-lambda-role
```
※アタッチされているポリシーがあると削除できない<br>

---

## 3.ポリシーの付与
入力値
```javascript
aws iam attach-role-policy \
  --role-name site-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```
- aws iam attach-role-policy<br>
ポリシーのアタッチ(付与)
- --role-name site-lambda-role<br>
ポリシーをアタッチする対象のロール
- --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole<br>
CloudWatchLogsへの出力

出力値<br>
無し

確認方法
```javascript
aws iam list-attached-role-policies \
  --role-name site-lambda-role
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
  --role-name site-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

---

## 4.site.mjsファイルの作成
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
- cat > site.mjs <<'EOF'<br>
「site.mjs」ファイルを作業ディレクトリ配下に作成
- export const handler = async (event) => {
  console.log("Hello World invoked. Event:", JSON.stringify(event));<br>
  - export const：この関数を外部から呼び出せるようにする
  - handler：Lambdaが呼び出されたときに最初に実行される関数
  - async (event)：非同期処理をする関数として定義
  - console.log：Lambdaの実行ログをCloudWatchLogsに
  - JSON.stringify(event));：eventの中身をJSON文字列に変換してログ出力
  - return：戻り値()

出力値<br>
無し：作業ディレクトリ配下にsite.mjsファイルの作成<br>

削除方法<br>
```javascript
rm site.mjs
```

---

## 5.zip化
入力値
```javascript
zip site.zip site.mjs
```
- 「site.mjs」ファイルのzip化　zip名「site.zip」ファイルの作成

出力値
```javascript
adding: site.mjs (deflated 23%)
```

削除方法<br>
```javascript
rm site.zip
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
- ROLE_ARN：環境変数の定義 macだとターミナル閉じると消える
- aws iam get-role：ロールの詳細情報の取得
- --role-name site-lambda-role：対象のロール名
- --query Role.Arn：Arnの内容だけ抽出する指定(IAMロールの一意ID)
- --output text：出力形式を テキストのみ にするオプション

出力値<br>
無し：Linux / Mac のシェル（bashやzsh）の中の環境変数<br>

確認方法
```javascript
echo $ROLE_ARN
```
環境変数が定義されていない状態の出力<br>
無し：何も表示されない

環境変数が定義されている状態の出力
```javascript
arn:aws:iam::xxxxxxxxxxxx:role/site-lambda-role
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
  --function-name site-lambda \
  --runtime nodejs20.x \
  --role "$ROLE_ARN" \
  --handler site.handler \
  --zip-file fileb://site.zip
```
- aws lambda create-function：Lambda関数の作成
- --function-name site-lambda：関数名「site-lambda」の設定
- --runtime nodejs20.x：ランタイムの指定
- --role "$ROLE_ARN"：実行時に使うIAMロールのARNを指定
- --handler index.handler：実行するファイルと関数の指定 拡張子の記述は不要
- --zip-file fileb://site.zip：アップロード先の指定


出力値
```javascript
〜〜〜
    "LoggingConfig": {
        "LogFormat": "Text",
        "LogGroup": "/aws/lambda/site-lambda"
    }
```
確認方法(一覧)
```javascript
aws lambda list-functions --region ap-northeast-1
```
確認方法(単体の関数)
```javascript
aws lambda get-function \
  --function-name site-lambda \
  --region ap-northeast-1
```

Lambda関数が作成されていない状態の出力(一覧)
```javascript
{
    "Functions": []
}
```
Lambda関数が作成されている状態の出力
```javascript
〜〜
{
    "LogFormat": "Text",
    "LogGroup": "/aws/lambda/site-lambda"
}
```
削除方法
```javascript
aws lambda delete-function \
  --function-name site-lambda \
  --region ap-northeast-1
```

---

## 8.API Gateway 作成
入力値
```javascript
aws apigatewayv2 create-api \
  --name site-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:ap-northeast-1:xxxxxxxxxxxx:function:site-lambda \
  --region ap-northeast-1
```
- aws apigatewayv2 create-api：シンプルな HTTP APIの作成
- --name site-api：作成するAPI名「site-api」
- --protocol-type HTTP：APIのタイプの指定「HTTP」を指定
- --target arn:aws:lambda:ap-northeast-1:xxxxxxxxxxxx:function:site-lambda
  - 実行するLambda関数の指定xxxxxxxxxxxxはAWSアカウントID

出力値
```javascript
〜〜〜
    "Name": "site-api",
    "ProtocolType": "HTTP",
    "RouteSelectionExpression": "$request.method $request.path"
```

APIの一覧から探す場合
```javascript
aws apigatewayv2 get-apis --region ap-northeast-1 \
  --query "Items[?Name=='site-api'].[ApiId,ApiEndpoint,Name]" --output table
```
※?Name=='site-api'：「site-api」は8.で作成したAPI名を指定

APIが作成されていない場合の出力
```javascript
無し：
```

APIが作成されている場合の出力
```javascript
$API_ID-API-API名
```
※3つの情報が出力される

削除方法(APIの削除)
```javascript
aws apigatewayv2 delete-api --api-id $API_ID --region ap-northeast-1
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
- API_ID：データの抽出　変数「API_ID」に特定の情報を格納
- API_ENDPOINT：データの抽出　変数「API_ENDPOINT」に特定の情報を格納
- aws apigatewayv2 get-api：作成済みのAPI情報の取得
- --api-id $API_ID：対象のAPIの指定
  - $API_ID：echo $API_IDの出力内容
- --query 'ApiEndpoint' ：「ApiEndpoint」の部分を抽出
  - echo $API_ENDPOINT：APIの抽出内容の出力
※get-apisとget-api入力値の確認　間違えやすい

出力値
```javascript
APIが出力される　ブラウザで検索する値
```


確認方法
```javascript
echo $API_ID
echo $API_ENDPOINT
```

削除方法
```javascript
unset API_ID
unset API_ENDPOINT
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
  --source-arn "arn:aws:execute-api:ap-northeast-1:xxxxxxxxxxxx:$API_ID/*/*" \
  --region ap-northeast-1
```
- aws lambda add-permission：ポリシーの許可設定の追加
- --function-name site-lambda：追加する対象の関数名「site-lambda」
- --statement-id apigateway-site-1：ラベルの設定　
- --action lambda:InvokeFunction：許可設定の指定
- --principal apigateway.amazonaws.com：<br>
API GatewayからLambdaを呼び出せるようにする許可設定
- --source-arn"arn:aws:execute-api:ap-northeast-1:xxxxxxxxxxxx:$API_ID/*/*"：<br>
  - xxxxxxxxxxxx：AWSアカウントのID
  - $API_ID：echo $API_IDの出力値
呼び出し元の制限<br>　
※API_IDに紐づくAPIGatewayからの呼び出しのみ許可する設定

出力値
```javascript
 "Statement": 〜〜AWSアカウントID:APIID番号/*/*\"}}}"
```

確認方法
```javascript
aws lambda get-policy --function-name site-lambda --region ap-northeast-1
```

権限が追加されていない場合の出力
```javascript
An error occurred (ResourceNotFoundException) when calling the GetPolicy operation: The resource you requested does not exist.
```

権限が追加されている場合の出力
```javascript
 "Policy":〜〜"RevisionId": "~~~"
```

削除方法
```javascript
aws lambda remove-permission \
  --function-name site-lambda \
  --statement-id apigateway-site-1 \
  --region ap-northeast-1
```

---

## 11.S3 バケット作成
入力値
```javascript
aws s3 mb s3://site-sample-bucket-123456
```

出力値
```javascript
make_bucket: site-sample-bucket-123456
```

確認方法
```javascript
aws s3 ls
```

バケットの削除
```javascript
aws s3 rb s3://site-sample-bucket-123456 
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
- <pre id="result"></pre>：
-     async function callApi() {
      const res = await fetch('$API_ENDPOINT');
      const data = await res.json();
      document.getElementById('result').innerText = JSON.stringify(data);
    }：

出力値<br>
無し：作業ディレクトリ配下にindex.htmlファイルの作成<br>

削除方法<br>
```javascript
rm index.html
```

---



## 13.アップロード
入力値
```javascript
aws s3 cp index.html s3://site-sample-bucket-123456/ 
```
- ローカルにある「index.html」ファイルをAWSのS3上s3://site-sample-bucket-123456/フォルダ内にコピー

出力値
```javascript
upload: ./index.html to s3://site-sample-bucket-123456/index.html
```

確認方法(オブジェクトの確認)
```javascript
aws s3 ls s3://site-sample-bucket-123456/
```

削除方法(オブジェクトの削除)
```javascript
aws s3 rm s3://site-sample-bucket-123456/index.html
```

---

## 14.CloudFront ディストリビューション作成
入力値
```javascript
aws cloudfront create-distribution \
  --origin-domain-name site-sample-bucket-123456.s3.amazonaws.com \
  --default-root-object index.html
```

出力値
```javascript

```

確認方法
```javascript
aws cloudfront list-distributions
```

削除方法
ETag を取得
```javascript
aws cloudfront get-distribution-config --id E1234567890ABC
```
　
無効化
```javascript
aws cloudfront update-distribution \
  --id E1234567890ABC \
  --if-match ETag  \
  --distribution-config file://dist-config.json
```
ディストリビューションが "Status": "Deployed" かつ "Enabled": false になったら削除可能
無効化
```javascript
aws cloudfront delete-distribution \
  --id E1234567890ABC \
  --if-match ETag 
```


※出力される"DomainName": "xxxx.cloudfront.net" をメモ

---

## 15.動作確認
入力値(ブラウザ上)
```javascript
https://xxxx.cloudfront.net
```
---

## 16.削除
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

エラー一覧
API_ENDPOINT抽出時
入力値
```javascript
API_ENDPOINT=$(aws apigatewayv2 get-apis \
  --api-id $API_ID \
  --query "ApiEndpoint" \
  --output text \
  --region ap-northeast-1)
```
※$API_ID：API_IDを入力

出力値
```javascript
usage: aws [options] <command> <subcommand> [<subcommand> ...] [parameters]
To see help text, you can run:

  aws help
  aws <command> help
  aws <command> <subcommand> help

Unknown options: --api-id, y0iv4qt61h
```

解決方法：aws apigatewayv2 get-apisの部分をaws apigatewayv2 get-apiに変更


アップロード時
入力値
```javascript
aws s3 cp index.html s3://site-sample-bucket-123456/ --acl public-read
```

出力値
```javascript
upload failed: ./index.html to s3://site-sample-bucket-123456/index.html An error occurred (AccessControlListNotSupported) when calling the PutObject operation: The bucket does not allow ACLs
```
意味：
このバケットは ACL をサポートしていない
2023 年以降に作成されたバケットはデフォルトで ACL が無効化

解決方法：--acl public-readはいらない


セキュア版(本番想定)
本番想定の場合OAC(Origin Access Control)を設定してS3を非公開にしたまま配信
この後実現予定

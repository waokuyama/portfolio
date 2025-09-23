### CLIでの実装手順
---
## 目次
- [目次](#目次)
- [1. 信頼ポリシーファイル作成](#1-信頼ポリシーファイル作成)
- [2. ロール作成](#2-ロール作成)
- [3. ロールにポリシーの付与](#3-ロールにポリシーの付与)
- [4. Lambda関数実行用のファイル作成](#4-lambda関数実行用のファイル作成)
- [5. zip化](#5-zip化)
- [6. 環境変数の定義(ARNの抽出)](#6-環境変数の定義arnの抽出)
- [7. Lambda関数の作成](#7-lambda関数の作成)
- [8. APIの作成と環境変数の定義(APIの抽出)](#8-apiの作成と環境変数の定義apiの抽出)
- [9. API\_ENDPOINT情報の抽出](#9-api_endpoint情報の抽出)
- [10. LambdaにAPIGateway呼び出し権限を追加](#10-lambdaにapigateway呼び出し権限を追加)
- [11. 実行](#11-実行)
- [12. 削除](#12-削除)
---

## 1. 信頼ポリシーファイル作成
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
- cat > greet-trust.json <<'EOF'<br>
「greet-trust.json」ファイルを作業ディレクトリ配下に作成
- "Version": "2012-10-17"<br>
バージョンの指定基本変動無し
- "Effect": "Allow"<br>
許可の指定 
- "Principal": { "Service": "lambda.amazonaws.com" }<br>
Lambdaサービスがこのロールを使うのを許可
- "Action": "sts:AssumeRole"<br>
一時的な認証情報の発行<br>
※作業ディレクトリ配下にgreet-trust.jsonファイルの作成<br>

削除方法<br>
```javascript
rm greet-trust.json
```
---

## 2. ロール作成
入力値
```javascript
aws iam create-role \
  --role-name greet-world-role \
  --assume-role-policy-document file://greet-trust.json
```
- aws iam create-role<br>
新規でロールの作成
- --role-name greet-world-role<br>
ロール名の設定「greet-world-role」
- --assume-role-policy-document file://greet-trust.json<br>
信頼ポリシーの設定「greet-trust.json」の中身を信頼ポリシーとして設定

出力値
```javascript
{
    "Role": {
        "Path": "/",
        "RoleName": "greet-world-role",
        "RoleId": "AROA53F2J43EGU4FRTSYM",
        "Arn": "arn:aws:iam::xxxxxxxxxxxx:role/greet-world-role",
        "CreateDate": "2025-09-05T05:43:34+00:00",
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
|  greet-world-role   
```

削除方法<br>
```javascript
aws iam delete-role --role-name greet-world-role
```
※アタッチされているポリシーがあると削除できない<br>


---

## 3. ロールにポリシーの付与
入力値
```javascript
aws iam attach-role-policy \
  --role-name greet-world-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```
- aws iam attach-role-policy<br>
ポリシーのアタッチ(付与)
- --role-name greet-world-role<br>
ポリシーをアタッチする対象のロール
- --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole<br>
CloudWatchLogsへの出力

出力値<br>
無し

確認方法
```javascript
aws iam list-attached-role-policies \
  --role-name greet-world-role
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
  --role-name greet-world-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

---

## 4. Lambda関数実行用のファイル作成
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
- cat > greet.mjs <<'EOF'<br>
「greet.mjs」ファイルを作業ディレクトリ配下に作成
- export const handler = async (event) => {
  console.log("Hello World invoked. Event:", JSON.stringify(event));<br>
  - export const：この関数を外部から呼び出せるようにする
  - handler：Lambdaが呼び出されたときに最初に実行される関数
  - async (event)：非同期処理をする関数として定義
  - console.log：Lambdaの実行ログをCloudWatchLogsに
  - JSON.stringify(event));：eventの中身をJSON文字列に変換してログ出力
- let name = "Guest";：name変数に「Guest」を格納
- if (event.queryStringParameters && event.queryStringParameters.name) {
    name = event.queryStringParameters.name;
  }
  - event.queryStringParameters：入力値があるかどうかのチェック
  - event.queryStringParameters.name：nameの入力値の格納
  - ※事前に入力値のチェックを入れることでエラーを防ぐことができる
- return：戻り値()
※作業ディレクトリ配下にgreet.mjsファイルの作成<br>

削除方法<br>
```javascript
rm greet.mjs
```

---

## 5. zip化
入力値
```javascript
zip greet.zip greet.mjs
```

出力値
```javascript
adding: greet.mjs (deflated 31%)
```

削除方法<br>
```javascript
rm greet.zip
```

---

## 6. 環境変数の定義(ARNの抽出)
入力値
```javascript
ROLE_ARN=$(aws iam get-role \
  --role-name greet-world-role \
  --query Role.Arn \
  --output text)
```
- ROLE_ARN：環境変数の定義 macだとターミナル閉じると消える
- aws iam get-role：ロールの詳細情報の取得
- --role-name greet-world-role：対象のロール名
- --query Role.Arn：Arnの内容だけ抽出する指定(IAMロールの一意ID)
- --output text：出力形式を テキストのみ にするオプション

出力値<br>
無し：Linux / Mac のシェル（bashやzsh）の中の環境変数<br>

確認方法
```javascript
echo $ROLE_ARN
```
環境変数が定義されていない状態の出力<br>
無し：Linux / Mac のシェル（bashやzsh）の中の環境変数<br>

環境変数が定義されている状態の出力
```javascript
arn:aws:iam::xxxxxxxxxxxx:role/hello-world-role
```

削除方法
```javascript
unset ROLE_ARN
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
- aws lambda create-function：Lambda関数の作成
- --function-name greet-world：関数名「greet-world」の設定
- --runtime nodejs20.x：ランタイムの指定
- --role "$ROLE_ARN"：実行時に使うIAMロールのARNを指定
- --handler greet.handler：実行するファイルと関数の指定 拡張子の記述は不要
- --zip-file fileb://greet.zip：アップロード先の指定


出力値
```javascript
~~~
    "LoggingConfig": {
        "LogFormat": "Text",
        "LogGroup": "/aws/lambda/greet-world"
    }
```
確認方法(一覧)
```javascript
aws lambda list-functions --region ap-northeast-1
```
確認方法(単体の関数)
```javascript
aws lambda get-function \
  --function-name greet-world \
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
  --function-name greet-world \
  --region ap-northeast-1
```

---

## 8. APIの作成と環境変数の定義(APIの抽出)
入力値
```javascript
API_ID=$(aws apigatewayv2 create-api \
  --name greet-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:ap-northeast-1:xxxxxxxxxxxx:function:greet-world \
  --query 'ApiId' \
  --output text \
  --region ap-northeast-1)
```
- API_ID：データの抽出　変数「API_ID」に内容を格納
- aws apigatewayv2 create-api：シンプルな HTTP APIの作成
- --name greet-api：作成するAPI名「greet-api」
- --protocol-type HTTP：APIのタイプの指定「HTTP」を指定
- --target arn:aws:lambda:ap-northeast-1:xxxxxxxxxxxx:function:greet-world
  - 実行するLambda関数の指定xxxxxxxxxxxxはAWSアカウントID

出力値
```javascript
無し：
```

確認方法
```javascript
echo $API_ID
```

環境変数が定義されいない場合の出力
```javascript
無し：
```

環境変数が定義されいる場合の出力
```javascript
10桁の英数字 毎回異なる値
```

APIの一覧から探す場合
```javascript
aws apigatewayv2 get-apis --region ap-northeast-1 \
  --query "Items[?Name=='greet-api'].[ApiId,ApiEndpoint,Name]" --output table
```

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

削除方法(環境変数の削除)
```javascript
unset API_ID
```

---

## 9. API_ENDPOINT情報の抽出
入力値
```javascript
API_ENDPOINT=$(aws apigatewayv2 get-api \
  --api-id $API_ID \
  --query 'ApiEndpoint' \
  --output text \
  --region ap-northeast-1)
echo $API_ENDPOINT
```
- API_ENDPOINT：データの抽出　変数「API_ENDPOINT」に内容を格納
- aws apigatewayv2 get-api：作成済みのAPI情報の取得
- --api-id $API_ID：対象のAPIの指定
  - $API_ID：echo $API_IDの出力内容
- --query 'ApiEndpoint' ：「ApiEndpoint」の部分を抽出
- echo $API_ENDPOINT：APIの抽出内容の出力

出力値
```javascript
APIが出力される　ブラウザで検索する値
```


確認方法
```javascript
echo $API_ENDPOINT
```

削除方法
```javascript
unset API_ENDPOINT
```

---

## 10. LambdaにAPIGateway呼び出し権限を追加
入力値
```javascript
aws lambda add-permission \
  --function-name greet-world \
  --statement-id apigateway-greet-1 \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:ap-northeast-1:xxxxxxxxxxxx:$API_ID/*/*" \
  --region ap-northeast-1
```
- aws lambda add-permission：ポリシーの許可設定の追加
- --function-name greet-world：追加する対象の関数名「greet-world」
- --statement-id apigateway-greet-1：ラベルの設定　
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
aws lambda get-policy --function-name greet-world --region ap-northeast-1
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
  --function-name greet-world \
  --statement-id apigateway-greet-1 \
  --region ap-northeast-1
```

---
## 11. 実行
入力値
```javascript
$API_ENDPOINT?name=Taro
curl "$API_ENDPOINT?name=Hanako"
```

出力値
```javascript
{"message":"Hello, Hanako!"}% 
```

※curl実行時""の入れる位置注意APIの前と入力値の後に"を付ける

---

## 12. 削除
LambdaにAPIGateway呼び出し権限の削除
削除方法
```javascript
aws lambda remove-permission \
  --function-name greet-world \
  --statement-id apigateway-greet-1 \
  --region ap-northeast-1
```

環境変数$API_ENDPOINTの削除
```javascript
unset API_ENDPOINT
```

削除方法(APIの削除)
```javascript
aws apigatewayv2 delete-api --api-id $API_ID --region ap-northeast-1
```

削除方法(環境変数の削除)
```javascript
unset API_ID
```

Lambda関数の削除
削除方法
```javascript
aws lambda delete-function \
  --function-name greet-world \
  --region ap-northeast-1
```

環境変数ROLE_ARNの削除
削除方法
```javascript
unset ROLE_ARN
```

zipファイルgreet.zipの削除
```javascript
rm greet.zip
```

greet.mjsファイルの削除
```javascript
rm greet.mjs
```

ポリシーのデタッチ
```javascript
aws iam detach-role-policy \
  --role-name greet-world-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

ロールの削除
```javascript
aws iam delete-role --role-name greet-world-role
```

APIで作成されたロールの削除
```javascript
aws iam delete-service-linked-role --role-name AWSServiceRoleForAPIGateway
```



---
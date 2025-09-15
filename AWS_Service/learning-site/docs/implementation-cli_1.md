## 概要
DynamoDB、Lambda関数を作成しCLIを使いLambda関数を実行
ユーザの作成、確認、削除
- [概要](#概要)
- [1.信頼ポリシーファイル作成](#1信頼ポリシーファイル作成)
- [2.IAMロールの作成](#2iamロールの作成)
- [3.ロールにポリシーの付与(CloudWatch ログ出力用ポリシー)](#3ロールにポリシーの付与cloudwatch-ログ出力用ポリシー)
- [3.ロールにポリシーの付与(ynamoDB フルアクセス)](#3ロールにポリシーの付与ynamodb-フルアクセス)
- [4.DynamoDBテーブル作成](#4dynamodbテーブル作成)
- [5.Lambda関数実行用のファイル作成](#5lambda関数実行用のファイル作成)
- [6.Zipファイルの作成](#6zipファイルの作成)
- [7.環境変数の定義(ARNの抽出)](#7環境変数の定義arnの抽出)
- [8.Lambda関数の作成](#8lambda関数の作成)
- [9.ユーザー登録](#9ユーザー登録)
- [10.ユーザー取得](#10ユーザー取得)

---

## 1.信頼ポリシーファイル作成
入力値
```javascript
cat > trust-policy.json <<'EOF'
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
- cat > trust-policy.json <<'EOF'<br>
「trust.json」ファイルを作業ディレクトリ配下に作成
- "Version": "2012-10-17"<br>
バージョンの指定基本変動無し
- "Effect": "Allow"<br>
許可の指定 
- "Principal": { "Service": "lambda.amazonaws.com" }<br>
Lambdaサービスがこのロールを使うのを許可
- "Action": "sts:AssumeRole"<br>
一時的な認証情報の発行<br>
※作業ディレクトリ配下にtrust-policy.jsonファイルの作成<br>

削除方法<br>
```javascript
rm trust-policy.json
```

---

## 2.IAMロールの作成
入力値
```javascript
aws iam create-role \
  --role-name MyLambdaRole \
  --assume-role-policy-document file://trust-policy.json
```
- aws iam create-role<br>
新規でロールの作成
- --role-name MyLambdaRole<br>
ロール名の設定「MyLambdaRole」
- --assume-role-policy-document file://trust-policy.json<br>
信頼ポリシーの設定「trust-policy.json」の中身を信頼ポリシーとして設定

出力値
```javascript
{
    "Role": {
        "Path": "/",
        "RoleName": "MyLambdaRole",
        "RoleId": "AROA53F2J43EA4HES7PGM",
        "Arn": "arn:aws:iam::xxxx:role/MyLambdaRole",
        "CreateDate": "2025-09-14T01:03:51+00:00",
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
|  MyLambdaRole
```

削除方法<br>
```javascript
aws iam delete-role --role-name MyLambdaRole
```
※アタッチされているポリシーがあると削除できない<br>


---

## 3.ロールにポリシーの付与(CloudWatch ログ出力用ポリシー)
入力値
```javascript
aws iam attach-role-policy \
  --role-name MyLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```
- aws iam attach-role-policy<br>
ポリシーのアタッチ(付与)
- --role-name hello-world-role<br>
ポリシーをアタッチする対象のロール
- --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole<br>
CloudWatchLogsへの出力

出力値<br>
無し

確認方法
```javascript
aws iam list-attached-role-policies \
  --role-name MyLambdaRole
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

ポリシーのデタッチ(CloudWatch ログ出力用ポリシー)
```javascript
aws iam detach-role-policy \
  --role-name MyLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

## 3.ロールにポリシーの付与(ynamoDB フルアクセス)
```javascript
aws iam attach-role-policy \
  --role-name MyLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
```
- --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess：DynamoDBへのフルアクセス許可

※出力値、確認方法、ポリシーが付与されていない状態の出力は上記と同じ

ポリシーが付与されている状態の出力
```javascript

```

ポリシーのデタッチ(ynamoDB フルアクセス)
```javascript
aws iam detach-role-policy \
  --role-name MyLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
```

---

## 4.DynamoDBテーブル作成
入力値
```javascript
aws dynamodb create-table \
  --table-name Users \
  --attribute-definitions AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```
- aws dynamodb create-table：DynamoDBテーブルの作成
- --table-name Users：「Users」テーブル名の設定
- --attribute-definitions AttributeName=userId,AttributeType=S
  - 属性と型の宣言
  - 「userId」を定義
  - AttributeType=S：SはString、文字列の指定
- --key-schema AttributeName=userId,KeyType=HASH
  - 主キーの指定
  - 「userId」をパーティションキー（HASH） に指定
- --billing-mode PAY_PER_REQUEST：テーブルの課金モードを「オンデマンド（Pay-per-request）」に設定

出力値
```javascript
"TableDescription": 
〜〜〜
"TableSizeBytes": 0,
```

確認方法(全体)<br>
```javascript
aws dynamodb list-tables
```

確認方法(指定テーブル)<br>
```javascript
aws dynamodb describe-table --table-name Users
```

作成されていない状態の出力(全体)<br>
```javascript
{
    "TableNames": []
}
```

作成されている状態の出力(全体)<br>
```javascript
{
    "TableNames": [
        "Users"
    ]
}
```

削除方法<br>
```javascript
aws dynamodb delete-table --table-name Users
```

---

## 5.Lambda関数実行用のファイル作成

入力値
```javascript
cat > lambda_function.py <<'EOF'

import json
import boto3
import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Users')

def lambda_handler(event, context):
    action = event.get("action")

    if action == "createUser":
        user_id = event["userId"]
        name = event["name"]
        email = event["email"]
        created_at = datetime.datetime.utcnow().isoformat()

        table.put_item(
            Item={
                "userId": user_id,
                "name": name,
                "email": email,
                "createdAt": created_at
            }
        )
        return {"message": f"User {user_id} created."}

    elif action == "getUser":
        user_id = event["userId"]
        response = table.get_item(Key={"userId": user_id})
        return response.get("Item", {"message": "User not found"})

    else:
        return {"error": "Invalid action"}

EOF
```
- import json：jsonモジュールの読み込み
- import boto3：AWSSDKforPython（boto3）の読み込み
- import datetime：現在時刻を取得するための標準ライブラリの読み込み
- dynamodb = boto3.resource('dynamodb')：リソースオブジェクト「dynamodb」の作成
- table = dynamodb.Table('Users')：DynamoDBのUsersテーブルへの参照オブジェクト「table」の作成
- def lambda_handler(event, context):：lambdaのエンドポイント
  - event：呼び出し時に渡される入力データ
  - context：実行メタデータ
- action = event.get("action")：入力値を変数「action」に代入、入力値が無ければ「None」が代入される
- if action == "createUser":：条件分岐、actionがcreateUserの場合(新規作成)の実行
- user_id = event["userId"]：入力値、userIdの取得、nameやemailも同様
- created_at = datetime.datetime.utcnow().isoformat()：現在の時刻の取得
- table.put_item：特定のテーブル(今回はUsersテーブル)に対して書き込み
- Item内左側のキー：テーブル内の属性(フィールド名)
- Item内右側のキー：テーブル内に格納する入力値
- return {"message": f"User {user_id} created."}：戻り値の出力先は「response.json」ファイル
- elif action == "getUser":：条件分岐、actionがgetUser(ユーザー情報)の取得
- response = table.get_item(Key={"userId": user_id})：get_itemを呼び主キー(userId)でテーブル内情報の取得
- return response.get("Item", {"message": "User not found"})：Itemを返す、無ければ{"message":"User not found"}を返す
- else:　return {"error": "Invalid action"}：actionがcreateUser/getUser以外だったらエラーを返す

削除方法<br>
```javascript
rm lambda_function.py
```

---

## 6.Zipファイルの作成
入力値
```javascript
zip function.zip lambda_function.py
```

出力値
```javascript
adding: lambda_function.py (deflated 58%)
```

削除方法<br>
```javascript
rm function.zip
```

---

## 7.環境変数の定義(ARNの抽出)
入力値
```javascript
ROLE_ARN=$(aws iam get-role \
  --role-name MyLambdaRole \
  --query Role.Arn \
  --output text)
```
- ROLE_ARN：環境変数の定義 macだとターミナル閉じると消える
- aws iam get-role：ロールの詳細情報の取得
- --role-name MyLambdaRole：対象のロール名
- --query Role.Arn：Arnの内容だけ抽出する指定(IAMロールの一意ID)
- --output text：出力形式を テキストのみ にするオプション

出力値<br>
無し：Linux / Mac のシェル（bashやzsh）の中の環境変数を定義<br>

確認方法
```javascript
echo $ROLE_ARN
```
環境変数が定義されていない状態の出力<br>
無し：何も表示されない

環境変数が定義されている状態の出力
```javascript
arn:aws:iam::xxxxxxxxxxxx:role/MyLambdaRole
```

削除方法
```javascript
unset ROLE_ARN
```

---

## 8.Lambda関数の作成
入力値
```javascript
aws lambda create-function \
  --function-name UserHandler \
  --runtime python3.9 \
  --role arn:aws:iam::xxxx:role/MyLambdaRole \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://function.zip
```
- aws lambda create-function：Lambda関数の作成
- --function-name UserHandler：関数名「UserHandler」の設定
- --runtime python3.9：ランタイムの指定
- --role arn:aws:iam::xxxx:role/MyLambdaRole：実行時に使うIAMロールの指定「MyLambdaRole」
- --handler lambda_function.lambda_handler：実行するファイルと関数の指定 拡張子の記述は不要
- --zip-file fileb://function.zip：アップロード先の指定
- xxxx：AWSアカウントID「echo $ROLE_ARN」出力に記載あり

出力値
```javascript
"FunctionName": "UserHandler"
〜〜〜

"LoggingConfig": {
"LogFormat": "Text",
"LogGroup": "/aws/lambda/UserHandler"
```

確認方法<br>
```javascript
aws lambda list-functions --region ap-northeast-1
```

作成されていない状態の出力<br>
```javascript
{
    "Functions": []
}
```

作成されている状態の出力<br>
```javascript
"FunctionName": "UserHandler"
〜〜〜

"LoggingConfig": {
"LogFormat": "Text",
"LogGroup": "/aws/lambda/UserHandler"
```

削除方法<br>
```javascript
aws lambda delete-function \
  --function-name UserHandler \
  --region ap-northeast-1
```

---

## 9.ユーザー登録
入力値
```javascript
aws lambda invoke \
  --function-name UserHandler \
  --cli-binary-format raw-in-base64-out \
  --payload '{"action":"createUser","userId":"u001","name":"Alice","email":"alice@example.com"}' \
  response.json
cat response.json
```
- aws lambda invoke：Lambda関数の実行
- --function-name UserHandler：呼び出す関数名の指定
- --cli-binary-format raw-in-base64-out：--payload に渡すときに必要になるフラグ
- --payload：Lambda に渡す入力データ「event」に渡されるデータ
- response.json：呼び出し結果を保存するローカルファイル名

出力値
```javascript
{
    "StatusCode": 200,
    "ExecutedVersion": "$LATEST"
}
{"message": "User u001 created."}% 
```

確認方法(全体)<br>
```javascript
aws dynamodb scan --table-name Users --limit 50 --region ap-northeast-1
```

確認方法(特定のID)<br>
```javascript
aws dynamodb get-item \
  --table-name Users \
  --key '{"userId":{"S":"u001"}}' \
  --region ap-northeast-1
```

確認方法(CloudWatch Logs)
```javascript
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/UserHandler --region ap-northeast-1
```

確認方法(ローカルファイルの確認)
```javascript
cat response.json
```

作成されていない時の出力(特定のID)
```javascript
無し
```

作成されている時の出力(特定のID)
```javascript
{
    "Item": {
        "createdAt": {
            "S": "2025-09-14T01:26:54.841850"
        },
        "email": {
            "S": "alice@example.com"
        },
        "name": {
            "S": "Alice"
        },
        "userId": {
            "S": "u001"
        }
    }
}
```


削除方法(単一ユーザー削除)<br>
```javascript
aws dynamodb delete-item \
  --table-name Users \
  --key '{"userId":{"S":"u001"}}' \
  --region ap-northeast-1
```



---

## 10.ユーザー取得
入力値
```javascript
aws lambda invoke \
  --function-name UserHandler \
  --payload '{"action":"getUser","userId":"u001"}' \
  response.json
cat response.json
```
- aws lambda invoke：Lambda関数の実行
- --function-name UserHandler：呼び出す関数名の指定
- --payload '{"action":"getUser","userId":"u001"}' ：Lambda に渡す入力データ
- response.json：呼び出し結果を保存するローカルファイル名

出力値
```javascript
Invalid base64: "{"action":"getUser","userId":"u001"}"
{"message": "User u001 created."}
```

確認方法(ローカルファイルの確認)
```javascript
cat response.json
```

削除方法<br>
```javascript
rm response.json
```

---
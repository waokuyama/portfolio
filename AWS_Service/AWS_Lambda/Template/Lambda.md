
## 目次
---
- [目次](#目次)
- [1.信頼ポリシーファイル作成](#1信頼ポリシーファイル作成)
- [2.IAMロールの作成](#2iamロールの作成)
- [3.ロールにポリシーの付与](#3ロールにポリシーの付与)
- [4.Lambda関数実行用のファイル作成](#4lambda関数実行用のファイル作成)
- [5.Zipファイルの作成](#5zipファイルの作成)
- [6.環境変数の定義(ARNの抽出)](#6環境変数の定義arnの抽出)
- [7.Lambda関数の作成](#7lambda関数の作成)
- [8.](#8)
---
入力値・出力値・確認・作成前の出力・作成後の出力・削除
※ファイルの作成時：入力値・削除方法のみ記載 zipファイルは出力値あり

## 1.信頼ポリシーファイル作成
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
- cat > trust.json <<'EOF'<br>
「trust.json」ファイルを作業ディレクトリ配下に作成
- "Version": "2012-10-17"<br>
バージョンの指定基本変動無し
- "Effect": "Allow"<br>
許可の指定 
- "Principal": { "Service": "lambda.amazonaws.com" }<br>
Lambdaサービスがこのロールを使うのを許可
- "Action": "sts:AssumeRole"<br>
一時的な認証情報の発行<br>
※作業ディレクトリ配下にtrust.jsonファイルの作成<br>

削除方法<br>
```javascript
rm trust.json
```

--- 
## 2.IAMロールの作成
入力値
```javascript
aws iam create-role \
  --role-name hello-world-role\
  --assume-role-policy-document file://trust.json
```
- aws iam create-role<br>
新規でロールの作成
- --role-name hello-world-role<br>
ロール名の設定「hello-world-role」
- --assume-role-policy-document file://trust.json<br>
信頼ポリシーの設定「trust.json」ファイルの中身を信頼ポリシーとして設定

出力値
```javascript
{
    "Role": {
        "Path": "/",
        "RoleName": "hello-world-role",
        "RoleId": "AROA53F2J43EMIBO47FPF",
        "Arn": "arn:aws:iam::xxxxxxxxxxxx:role/hello-world-role",
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

## 3.ロールにポリシーの付与
入力値
```javascript
aws iam attach-role-policy \
  --role-name hello-world-role \
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

## 4.Lambda関数実行用のファイル作成
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
- cat > index.mjs <<'EOF'<br>
「index.mjs」ファイルを作業ディレクトリ配下に作成
- export const handler = async (event) => {
  console.log("Hello World invoked. Event:", JSON.stringify(event));<br>
  - export const：この関数を外部から呼び出せるようにする
  - handler：Lambdaが呼び出されたときに最初に実行される関数
  - async (event)：非同期処理をする関数として定義
  - console.log：Lambdaの実行ログをCloudWatchLogsに
  - JSON.stringify(event));：eventの中身をJSON文字列に変換してログ出力
  - return：戻り値()
※作業ディレクトリ配下にtrust.jsonファイルの作成<br>

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
- 「index.mjs」ファイルのzip化　zip名「function.zip」ファイルの作成

出力値
```javascript
adding: index.mjs (deflated 25%)
```

削除方法<br>
```javascript
rm function.zip
```

---

## 6.環境変数の定義(ARNの抽出)
入力値
```javascript
ROLE_ARN=$(aws iam get-role \
  --role-name hello-world-role \
  --query Role.Arn \
  --output text)
```
- ROLE_ARN：環境変数の定義 macだとターミナル閉じると消える
- aws iam get-role：ロールの詳細情報の取得
- --role-name hello-world-role：対象のロール名
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
arn:aws:iam::xxxxxxxxxxxx:role/hello-world-role
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
- aws lambda create-function：Lambda関数の作成
- --function-name hello-world：関数名「hello-world」の設定
- --runtime nodejs20.x：ランタイムの指定
- --role "$ROLE_ARN"：実行時に使うIAMロールのARNを指定
- --handler index.handler：実行するファイルと関数の指定 拡張子の記述は不要
- --zip-file fileb://function.zip：アップロード先の指定

出力値
```javascript
"FunctionName": "hello-world",
〜〜〜

"LoggingConfig": {
"LogFormat": "Text",
"LogGroup": "/aws/lambda/hello-world"
}
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

## 8.
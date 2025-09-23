## 概要
implementation-cli_1.mdファイルの内容を
CloudFormationを使いテンプレート化
確認方法(ロール名の一覧表示)<br>

## 1.IAMロール
### 1.template-role.ymlファイルの作成
入力値<br>
```javascript
cat > template-role.yml <<'EOF'
AWSTemplateFormatVersion: "2010-09-09"
Description: Create IAM Role for Lambda

Resources:
  MyLambdaRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: MyLambdaRole
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
EOF
```
- AWSTemplateFormatVersion: "2010-09-09"：CloudFormationテンプレートのバージョン
- Description:Usermanagementapp with Lambda + DynamoDB：メモ
- MyLambdaRole:：
- Type: AWS::IAM::Role：IAMロールを作成
- RoleName: MyLambdaRole：ロール名
- AssumeRolePolicyDocument:
  - Version: "2012-10-17"：バージョンの指定
  - Statement:
    - Effect: Allow：許可設定
    - Principal:
      - Service: lambda.amazonaws.com：許可ポリシーの指定
    - Action: sts:AssumeRole：
  - ManagedPolicyArns:：以下の付与設定
    - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole：CloudWatch Logs への書き込み権限
    - arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess：DynamoDBへのフルアクセス

削除方法<br>
```javascript
rm template-role.yml
```

### 2.作成
```javascript
aws cloudformation create-stack \
  --stack-name RoleStack \
  --template-body file://template-role.yml \
  --capabilities CAPABILITY_NAMED_IAM
```
- aws cloudformation create-stack：スタックの作成(テンプレート)
- --stack-name RoleStack：スタック名
- --template-body file://template-role.yml：実行ファイル
- --capabilities CAPABILITY_NAMED_IAM：CloudFormationがIAMリソースを作成する権限を持つことを明示的に承認
※CAPABILITY_IAM：IAM リソースを作成できるが名前は自動
※CAPABILITY_NAMED_IAM：リソースを固定された名前で作成できる

出力値<br>
```javascript
{
    "StackId": "arn:aws:cloudformation:ap-northeast-1:xxxx:stack/RoleStack/99393e00-95da-11f0-99d4-0e8ee5e748e9"
}
```
- xxxx：AWSアカウントID

確認方法<br>
```javascript
aws cloudformation describe-stacks --stack-name RoleStack

aws iam get-role --role-name MyLambdaRole
```

テンプレートが作成されていない状態の出力<br>
```javascript
An error occurred (ValidationError) when calling the DescribeStacks operation: Stack with id RoleStack does not exist
```

テンプレートが作成されている状態の出力<br>
```javascript
"Stacks":
〜〜〜
"StackDriftStatus": "NOT_CHECKED"
```

ロールが作成されていない状態の出力<br>
```javascript
An error occurred (NoSuchEntity) when calling the GetRole operation: The role with name MyLambdaRole cannot be found.
```

ロールが作成されている状態の出力<br>
```javascript
"Role":
〜〜〜
"Description": "",
"MaxSessionDuration": 3600,
"RoleLastUsed": {}
```

削除方法(テンプレート)<br>
```javascript
aws cloudformation delete-stack --stack-name RoleStack
```

---

## 2.DynamoDB テーブル
### 1.template-dynamodb.ymlファイルの作成
入力値<br>
```javascript
cat > template-dynamodb.yml <<'EOF'
AWSTemplateFormatVersion: "2010-09-09"
Description: Create DynamoDB Users table

Resources:
  UsersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: Users
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: userId
          AttributeType: S
      KeySchema:
        - AttributeName: userId
          KeyType: HASH
EOF
```
- UsersTable:
- Type: AWS::DynamoDB::Table：DynamoDBテーブルの作成
- Properties:
  - TableName: Users：テーブル名の設定
  - BillingMode: PAY_PER_REQUEST：オンデマンド課金方式
  - AttributeDefinitions:：以下で主キーの属性定義
    - AttributeName: userId：属性名の定義
    - AttributeType: S：
  - KeySchema:：パーティションキーの利用
    - AttributeName: userId：パーティションキーを指定する属性名
    - KeyType: HASH：

削除方法<br>
```javascript
rm template-dynamodb.yml
```

### 2.作成
入力値<br>
```javascript
aws cloudformation create-stack \
  --stack-name DynamoDBStack \
  --template-body file://template-dynamodb.yml
```

出力値<br>
```javascript
{
    "StackId": "arn:aws:cloudformation:ap-northeast-1:xxxx:stack/DynamoDBStack/09684ab0-95e3-11f0-8b00-06c8508f1b65"
}
```
- xxxx：AWSアカウントID

確認方法<br>
```javascript
aws dynamodb describe-table --table-name Users

aws cloudformation describe-stacks --stack-name DynamoDBStack
```

テンプレートの出力状況は1.ロールと同じ<br>


データベースが作成されていない状態の出力<br>
```javascript
An error occurred (ResourceNotFoundException) when calling the DescribeTable operation: Requested resource not found: Table: Users not found
```

データベースが作成されている状態の出力<br>
```javascript
"Table":
〜〜〜
"DeletionProtectionEnabled": false
```

削除方法
```javascript
aws cloudformation delete-stack --stack-name DynamoDBStack
```

※テンプレートの削除後は少し時間を空けてから確認コマンドで確かめる

---

## 3.Lambda関数(ロールとDynamoDBがすでに存在している前提)
- 1や2の他「payload.json」「response.json」ファイルの作成が
  必要なため注意<br>
- template-lambda.ymlファイル作成時AWSアカウントIDのの入力忘れ注意
### 1.template-lambda.ymlファイルの作成
入力値<br>
```javascript
cat > template-lambda.yml <<'EOF'
AWSTemplateFormatVersion: "2010-09-09"
Description: Lambda function for user management

Resources:
  UserHandler:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: UserHandler
      Runtime: python3.9
      Role: arn:aws:iam::xxxx:role/MyLambdaRole
      Handler: index.lambda_handler
      Code:
        ZipFile: |
          import json, boto3
          dynamodb = boto3.resource('dynamodb')
          table = dynamodb.Table('Users')
          def lambda_handler(event, context):
              return {"status": "ok"}
EOF
```
- AWSTemplateFormatVersion: "2010-09-09"：バージョンの指定
- Description：メモ
- Resources:：リソースの定義
- UserHandler：CloudFormation 内での識別子
- Type: AWS::Lambda::Function：Lambda関数の作成
- FunctionName: UserHandler：関数名
- Runtime: python3.9：Python 3.9の指定
- Role: ：xxxxはAWSアカウントID
  MyLambdaRoleが作成されている前提
- Handler: index.lambda_handler：Lambdaが実行する関数
  - index：ファイル名(拡張子は除く)
  - lambda_handler：関数名
- ZipFile: ：Zipファイルの作成？
- import json：JSON 形式のデータを扱う標準ライブラリ
- importboto3：AWS SDK for Python。DynamoDB など AWS サービスを操作
- dynamodb = boto3.resource('dynamodb')：DynamoDBへの接続オブジェクトの作成
- table = dynamodb.Table('Users')：Usersというテーブルを扱うオブジェクトの作成
- def lambda_handler：Lambdaのエントリーポイント
- event：呼び出し時渡されるデータ
- context：実行環境のデータ　※今回は未使用
- context：返り値({"status": "ok"})


削除方法<br>
```javascript
rm template-lambda.yml 
```

### 2.Lambda関数の作成
入力値<br>
```javascript
aws cloudformation create-stack \
  --stack-name LambdaStack \
  --template-body file://template-lambda.yml \
  --capabilities CAPABILITY_IAM
```

出力値<br>
```javascript
{
    "StackId": "arn:aws:cloudformation:ap-northeast-1:xxxx:stack/LambdaStack/ffe814e0-976b-11f0-ae89-06f883fe27af"
}
```
-javascript xxxx：AWSアカウントID



### 3.Lambda関数の実行
ファイルの作成：<br>
payload.jsonファイルの作成<br>
```javascript
echo '{"test":"ping"}' > payload.json
```
- Lambda関数呼び出し時に渡すデータ値

response.jsonファイルの作成<br>
```javascript
touch response.json
```
- Lambda関数の実行結果の保存先ファイル

実行<br>
```javascript
aws lambda invoke \
  --function-name UserHandler \
  --payload file://payload.json \
  --cli-binary-format raw-in-base64-out \
response.json
```
- 実行結果をresponse.jsonファイルに保存
※--cli-binary-format raw-in-base64-out \：

出力値<br>
```javascript
{
    "StatusCode": 200,
    "FunctionError": "Unhandled",
    "ExecutedVersion": "$LATEST"
}
```

確認方法<br>
```javascript
cat response.json
```

実行結果の出力がない時<br>
```javascript
空欄
```

実行結果の出力がある時<br>
```javascript
{"status": "ok"}
```

削除方法<br>
```javascript
aws cloudformation delete-stack --stack-name LambdaStack
```
---

ここまでは動作確認済み

---

## 4.1つにまとめたテンプレート
入力値<br>
```javascript

```

出力値<br>
```javascript

```

確認方法：前文参照<br>
削除方法：前文参照<br>

---

## エラー対応
### 1.IAMロール作成時
入力値
```javascript
aws cloudformation create-stack \
  --stack-name RoleStack \
  --template-body file://template-role.yml \
  --capabilities CAPABILITY_IAM
```

出力値
```javascript
An error occurred (InsufficientCapabilitiesException) when calling the CreateStack operation: Requires capabilities : [CAPABILITY_NAMED_IAM]
```

エラー内容：<br>
テンプレートでIAMリソースを明示的に作成しているため<br>
--capabilities CAPABILITY_NAMED_IAMを付けないと<br>
「ユーザーがリスクを理解して同意している」と見なされず、<br>
スタック作成が拒否される

解決方法：CAPABILITY_NAMED_IAMで作成
```javascript
aws cloudformation create-stack \
  --stack-name RoleStack \
  --template-body file://template-role.yml \
  --capabilities CAPABILITY_IAM
```

---

### 2.Lambda関数実行時
入力値
```javascript
aws lambda invoke \
  --function-name UserHandler \
  --payload file://payload.json \
response.json
```

出力値
```javascript
An error occurred (InvalidRequestContentException) when calling the Invoke operation: Could not parse request body into json: Could not parse payload into json: Invalid UTF-8 middle byte 0x2d
 at [Source: REDACTED (`StreamReadFeature.INCLUDE_SOURCE_IN_LOCATION` disabled); line: 1, column: 4]
```

エラー内容：Lambdaに渡されたリクエストのボディをJSONとして解釈できない

解決方法：<br>
--cli-binary-format raw-in-base64-out \<br>
を追加する<br>
AWSCLIバージョン2でLambdaの--payloadを指定する場合、原則として<br>
--cli-binary-format raw-in-base64-outが必要

---
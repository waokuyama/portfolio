
## ロール作成時
### 1.同名ロール作成時エラー
入力値<br>
```javascript
aws iam create-role \
  --role-name hello-world-role\
  --assume-role-policy-document file://trust.json
```
出力値<br>
```javascript
An error occurred (EntityAlreadyExists) when calling the CreateRole operation: Role with name hello-world-role already exists.
```
意味<br>
「hello-world-role」というロール名がすでに存在している<br>
既存ロールの確認<br>
```javascript
aws iam get-role --role-name hello-world-role
```
削除方法
```javascript
aws iam delete-role --role-name hello-world-role
```
削除済み確認方法
```javascript
aws iam get-role --role-name hello-world-role
```
ロール名の一覧表示
```javascript
aws iam list-roles --query 'Roles[].RoleName' --output table
```
---

## ポリシー付与時
### 1.付与するロール名が存在しない時
入力値<br>
```javascript
aws iam attach-role-policy \
  --role-name hello-world-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```
出力値<br>
```javascript
zsh: no such file or directory: span
```
意味<br>
指定したファイルやディレクトリが存在しない<br>
ロール名の一覧表示
```javascript
aws iam list-roles --query 'Roles[].RoleName' --output table
```

---

## Lambda関数の作成時
### 1.
入力値<br>
```javascript
aws lambda create-function \
  --region ap-northeast-1 \
  --function-name hello-world \
  --runtime nodejs20.x \
  --role "$ROLE_ARN" \
  --handler index.handler \
  --zip-file fileb://function.zip
```
出力値<br>
```javascript
An error occurred (ValidationException) when calling the CreateFunction operation: 1 validation error detected: Value '' at 'role' failed to satisfy constraint: Member must satisfy regular expression pattern: arn:(aws[a-zA-Z-]*)?:iam::\d{12}:role/?[a-zA-Z_0-9+=,.@\-_/]+
```
意味<br>
指定した変数"$ROLE_ARN"が無い<br>
### CLIでの実装手順
---
## 目次
- [目次](#目次)
- [1.SNSトピックを作成](#1snsトピックを作成)
- [2.メール購読（サブスクリプション）](#2メール購読サブスクリプション)
- [3.S3バケット作成](#3s3バケット作成)
- [4.S3イベント通知設定](#4s3イベント通知設定)
- [5.動作確認](#5動作確認)

---

## 1.SNSトピックを作成
入力値
```javascript
aws sns create-topic --name s3-upload-notify
```
- 「s3-upload-notify」という名前のSNSトピックの作成
- 出力値のTopicArnを控えておく

出力値
```javascript

```

確認方法<br>
```javascript

```

作成されていない状態の出力<br>
```javascript

```

作成されている状態の出力<br>
```javascript
 
```

削除方法<br>
```javascript
 
```

---

## 2.メール購読（サブスクリプション）
入力値
```javascript

```

出力値
```javascript

```

確認方法<br>
```javascript

```

作成されていない状態の出力<br>
```javascript

```

作成されている状態の出力<br>
```javascript
 
```

削除方法<br>
```javascript
 
```

---

## 3.S3バケット作成
入力値
```javascript

```

出力値
```javascript

```

確認方法<br>
```javascript

```

作成されていない状態の出力<br>
```javascript

```

作成されている状態の出力<br>
```javascript
 
```

削除方法<br>
```javascript
 
```

---

## 4.S3イベント通知設定
入力値
```javascript

```

出力値
```javascript

```

確認方法<br>
```javascript

```

作成されていない状態の出力<br>
```javascript

```

作成されている状態の出力<br>
```javascript
 
```

削除方法<br>
```javascript
 
```

---

## 5.動作確認
入力値
```javascript

```

出力値
```javascript

```

確認方法<br>
```javascript

```

作成されていない状態の出力<br>
```javascript

```

作成されている状態の出力<br>
```javascript
 
```

削除方法<br>
```javascript
 
```

---

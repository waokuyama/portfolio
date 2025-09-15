## 目次
- [目次](#目次)
- [1.SNSトピックを作成](#1snsトピックを作成)
- [2.メール購読（サブスクリプション）](#2メール購読サブスクリプション)
- [3.S3バケット作成](#3s3バケット作成)
- [4.S3イベント通知設定](#4s3イベント通知設定)
- [5.動作確認](#5動作確認)
- [6.今後の拡張](#6今後の拡張)

---

## 1.SNSトピックを作成
入力値
```javascript
aws sns create-topic --name s3-upload-notify
```
- 「s3-upload-notify」という名前のSNSトピックの作成
- 出力値のTopicArnを控えておく<br>

出力値
```javascript
{
    "TopicArn": "arn:aws:sns:ap-northeast-1:xxxx:s3-upload-notify"
}
```
- xxxx：AWSアカウントID

確認方法<br>
```javascript
aws sns list-topics
```

作成されていない状態の出力<br>
```javascript
{
    "Topics": []
}
```

作成されている状態の出力<br>
```javascript
{
    "Topics": [
        {
            "TopicArn": "arn:aws:sns:ap-northeast-1:xxxx:s3-upload-notify"
        }
    ]
}
```

削除方法<br>
```javascript
 aws sns delete-topic \
  --topic-arn arn:aws:sns:ap-northeast-1:xxxx:s3-upload-notify
```
- xxxx：AWSアカウントID<br>
※トピックに紐づいていた サブスクリプション（購読設定）も一緒に削除

---

## 2.メール購読（サブスクリプション）
入力値
```javascript
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-northeast-1:xxxx:s3-upload-notify \
  --protocol email \
  --notification-endpoint xxxx@xxxx.xxx
```
※実行後登録したメールアドレス宛にメールが届く
→「Confirm subscription」をクリックする必要がある

出力値
```javascript

```

受信メール内容
```javascript

```


確認方法(全体)<br>
```javascript
aws sns list-subscriptions
```

特定トピックに紐づくサブスクリプションだけ確認<br>
```javascript
aws sns list-subscriptions-by-topic \
  --topic-arn arn:aws:sns:ap-northeast-1:xxxx:s3-upload-notify
```
- xxxx：AWSアカウントID<br>

作成されていない状態の出力(全体)<br>
```javascript

```

作成されている状態の出力(全体)<br>
```javascript
 
```

削除方法<br>
```javascript
aws sns unsubscribe \
  --subscription-arn arn:aws:sns:ap-northeast-1:xxxx:s3-upload-notify:abcd1234-efgh-5678-ijkl-9012mnop3456
```

---

## 3.S3バケット作成
入力値
```javascript
aws s3api create-bucket \
  --bucket s3-sns-demo-bucket-20250911 \
  --region ap-northeast-1 \
  --create-bucket-configuration LocationConstraint=ap-northeast-1
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
aws s3api put-bucket-notification-configuration \
  --bucket s3-sns-demo-bucket-20250911 \
  --notification-configuration '{
    "TopicConfigurations": [
      {
        "Id": "ImageUploadNotification",
        "TopicArn": "arn:aws:sns:ap-northeast-1:xxxx:s3-upload-notify",
        "Events": ["s3:ObjectCreated:*"],
        "Filter": {
          "Key": {
            "FilterRules": [
              {"Name": "suffix", "Value": ".jpg"}
            ]
          }
        }
      }
    ]
  }'

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
aws s3 cp test.jpg s3://s3-sns-demo-bucket-20250911/
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

## 6.今後の拡張
- フィルタリング条件を変更＞特定プレフィックスのファイルだけ通知
- 通知先をLambdaに変え自動化の練習
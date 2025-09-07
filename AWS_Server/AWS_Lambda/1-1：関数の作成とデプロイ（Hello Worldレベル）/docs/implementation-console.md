### GUIでの実装手順：作成日2025/8/25
---
## 目次
- [目次](#目次)
- [0.前提](#0前提)
- [1.Lambda関数の作成](#1lambda関数の作成)
  - [作成した関数の確認方法](#作成した関数の確認方法)
  - [作成したロールの確認方法](#作成したロールの確認方法)
- [2.コードを入れる](#2コードを入れる)
- [3.ハンドラー設定の確認](#3ハンドラー設定の確認)
- [4.テストイベントを作成して実行](#4テストイベントを作成して実行)
- [5.CloudWatchLogsでログを確認](#5cloudwatchlogsでログを確認)
- [6.設定削除](#6設定削除)
- [トラブルシューティング](#トラブルシューティング)
---

## 0.前提
1.AWSアカウントにログインし、右上のリージョンが 東京 になっていることを確認<br>
2.IAM の権限が「Lambda 関数作成＆実行、IAMロール作成、CloudWatchログ閲覧」ができること<br>

---

## 1.Lambda関数の作成
コンソール上部の検索＞Lambda<br>
＜Lambdaダッシュボード画面＞<br>
1.関数の作成：クリック <br>
＜関数の作成画面＞<br>
2.入力値<br>
- 関数の作成：一から作成
- 関数名：hello-world
- ランタイム：Node.js 22.x
- アーキテクチャ：x86_64
- 実行ロール：基本的な Lambda 権限で新しいロールを作成<br>
- 関数の作成：クリック

3.関数の作成：クリック<br>
※CloudWatch にログを書ける最小権限（AWSLambdaBasicExecutionRole 付き）の<br>
ロールが自動作成<br>

---

### 作成した関数の確認方法
Lambda＞関数<br>
hello-world：関数が作成されていることを確認<br>
### 作成したロールの確認方法
IAM＞ロール<br>
hello-world-role-xxxx：ロールが作成されていることを確認

---

## 2.コードを入れる
コンソール上部の検索＞Lambda＞関数＞hello-world<br>
＜hello-world画面＞<br>
1.下部タブ：コードタブが選択されていることを確認<br>
2.右側のファイルツリーで index.mjs を開き、以下を入力＞デプロイ：クリック
```javascript
// index.mjs (Node.js 20.x / ESM)
export const handler = async (event) => {
  // event には入力ペイロードが入る（今回は未使用）
  console.log("Hello World invoked. Event:", JSON.stringify(event));
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" }),
    headers: { "Content-Type": "application/json" },
  };
};
```
※編集後にデプロイを押し忘れると古いコードのまま実行

---

## 3.ハンドラー設定の確認
コンソール上部の検索＞Lambda＞関数＞hello-world<br>
＜hello-world画面＞<br>
1.ランタイム設定のハンドラーがindex.handler になっていることを確認<br>
※ファイル名を app.mjs に変えたら app.handler に直す必要があり

---

## 4.テストイベントを作成して実行
コンソール上部の検索＞Lambda＞関数＞hello-world<br>
＜hello-world画面＞<br>
1.下部タブ：テストタブを選択<br>
・イベントアクションをテスト：新イベントを作成
・イベント名：hello
・イベント共有の設定：プライベート
・テンプレート-オプション：操作なし
イベントJSON：以下を入力
```javascript
{ "sample": "data" }
```
3.[保存] → [テスト] を押す<br>
4.上部に 実行結果: 成功 と出て、下に以下のようなレスポンスが表示されればOK
```javascript
{
  "statusCode": 200,
  "body": "{\"message\":\"Hello World\"}",
  "headers": { "Content-Type": "application/json" }
}
```

---

## 5.CloudWatchLogsでログを確認
1.関数ページ → タブ [モニタリング] → [ログを表示]（CloudWatch に遷移）<br>
2.ログストリームを開くと、console.log で出した
```javascript
Hello World invoked. Event: {"sample":"data"}
```
のようなログが確認できる

---

## 6.設定削除
1.Lambda 関数の削除
- Lambda → 対象関数 hello-world → [アクション] > [削除]<br>

2.IAM ロールの削除
- コンソールで IAM → [ロール] → hello-world-role-xxxxx を検索
- アタッチポリシー（AWSLambdaBasicExecutionRole）を確認しつつ [削除]<br>
※共有している場合は削除しない
3.CloudWatch ログの削除
- CloudWatch → [ロググループ] → /aws/lambda/hello-world →<br>
   [アクション] > [ロググループの削除]

## トラブルシューティング
- ハンドラー名のずれ：index.mjs に export const handler なのに<br>
  設定が app.handler などになっている
- デプロイ忘れ：編集後に [デプロイ] を押していない
- リージョン違い：東京で作ったのに別のリージョンを見ている
- 権限不足：ほぼ起きないが、組織アカウントなどで IAM 制約があると失敗する
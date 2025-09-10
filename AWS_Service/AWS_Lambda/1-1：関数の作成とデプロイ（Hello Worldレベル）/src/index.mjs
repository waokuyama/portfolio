//Lambda Hello Worldコード
cat > index.mjs <<'EOF'
export const handler = async (event) => {
  console.log("Hello World invoked. Event:", JSON.stringify(event));
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" })
  };
};
EOF
/* 
- Lambdaで実行するNode.jsコード
- `handler` がLambdaのエントリーポイント
- 引数 `event` にはAPI Gatewayや他サービスからのイベントが入る
*/



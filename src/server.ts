import {
  GetQueueUrlCommand,
  SQSClient,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";
import { createServer } from "http";
import { parse } from "url";

const sqs = new SQSClient({});

const getQueueUrlCommand = new GetQueueUrlCommand({
  QueueName: process.env.QUEUE_NAME!,
});

let queueUrl = "";

try {
  sqs.send(getQueueUrlCommand).then((resp) => {
    queueUrl = resp.QueueUrl!;
  });
} catch (err) {
  console.log(err);
  process.exit(1);
}

createServer(async (req, res) => {
  const uri = parse(req.url!, true);
  const routeKey = `${req.method} ${uri.pathname}`;
  switch (routeKey) {
    case "POST /items":
      const sendCommand = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: "Hello World!",
      });
      try {
        await sqs.send(sendCommand);
      } catch (err) {
        console.log(err);
      }
  }
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end();
}).listen(8080);

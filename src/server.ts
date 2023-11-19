import {
  GetQueueUrlCommand,
  SQSClient,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";
import { createServer } from "http";
import { parse } from "url";

const sqs = new SQSClient({});

createServer(async (req, res) => {
  const uri = parse(req.url!, true);
  const routeKey = `${req.method} ${uri.pathname}`;
  switch (routeKey) {
    case "POST /items":
      const sendCommand = new SendMessageCommand({
        QueueUrl: process.env.QUEUE_URL,
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

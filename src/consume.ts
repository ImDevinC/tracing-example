import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  ReceiveMessageCommand,
  Message,
  SQSClient,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer(process.env.SERVICE_NAME!);

const s3 = new S3Client({});
const sqs = new SQSClient({});

const start = async () => {
  return tracer.startActiveSpan("consume", async (span) => {
    try {
      await consume();
    } catch (err: any) {
      console.log(err);
      span.recordException(err);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: JSON.stringify(err),
      });
    }
    span.end();
  });
};

const consume = async () => {
  const receiveCommand = new ReceiveMessageCommand({
    QueueUrl: process.env.QUEUE_URL,
  });

  let messages: Message[] = [];

  try {
    const response = await sqs.send(receiveCommand);
    messages = response.Messages || [];
  } catch (err) {
    throw err;
  }

  if (messages.length == 0) {
    console.log("No messages found");
    return;
  }

  const promises: Promise<void>[] = [];

  messages.forEach((message) => {
    promises.push(processMessage(message));
  });

  try {
    await Promise.all(promises);
  } catch (err) {
    throw err;
  }
};

const processMessage = async (message: Message) => {
  console.log(JSON.stringify(message));
  const putCommand = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: "message.txt",
    Body: message.Body,
  });
  const deleteMessageCommand = new DeleteMessageCommand({
    QueueUrl: process.env.QUEUE_URL,
    ReceiptHandle: message.ReceiptHandle,
  });
  try {
    await s3.send(putCommand);
    await sqs.send(deleteMessageCommand);
  } catch (err) {
    throw err;
  }
};

start().then(async () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 5000);
  }).then(() => {
    console.log("done");
  });
});

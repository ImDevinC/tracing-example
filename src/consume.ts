import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  ReceiveMessageCommand,
  Message,
  SQSClient,
  DeleteMessageCommand,
  GetQueueUrlCommand,
} from "@aws-sdk/client-sqs";
import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer(process.env.SERVICE_NAME!);

const start = async () => {
  return tracer.startActiveSpan("consume", async (span) => {
    try {
      await consume();
    } catch (err) {
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
  const sqs = new SQSClient({});
  const getQueueUrlCommand = new GetQueueUrlCommand({
    QueueName: process.env.QUEUE_NAME,
  });

  let queueUrl = "";

  try {
    const response = await sqs.send(getQueueUrlCommand);
    if (!response.QueueUrl) {
      throw new Error("no queue url");
    }
    queueUrl = response.QueueUrl;
  } catch (err) {
    throw err;
  }

  const publishCommand = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
  });

  let messages: Message[] = [];

  try {
    const response = await sqs.send(publishCommand);
    messages = response.Messages || [];
  } catch (err) {
    throw err;
  }

  if (messages.length == 0) {
    console.log("No messages found");
    return;
  }

  const s3 = new S3Client({});
  for (const message of messages) {
    console.log(JSON.stringify(message));
    const putCommand = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: "message.txt",
      Body: message.Body,
    });
    const deleteMessageCommand = new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: message.ReceiptHandle,
    });
    try {
      await s3.send(putCommand);
      await sqs.send(deleteMessageCommand);
    } catch (err) {
      throw err;
    }
  }
};

start().then(async () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 5000);
  }).then(() => {
    console.log("done");
  });
});

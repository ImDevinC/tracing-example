import {
  GetQueueUrlCommand,
  SQSClient,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";
import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer(process.env.SERVICE_NAME!);

const start = async () => {
  return tracer.startActiveSpan("publish", async (span) => {
    try {
      await publish();
    } catch (err) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: JSON.stringify(err),
      });
    }
    span.end();
  });
};

const publish = async () => {
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
    console.log(err);
    return;
  }

  const publishCommand = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: "Hello World!",
  });

  try {
    const response = await sqs.send(publishCommand);
    console.log(JSON.stringify(response));
  } catch (err) {
    console.log(err);
  }
};

start().then(async () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 5000);
  }).then(() => {
    console.log("done");
  });
});

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

const publish = async () => {
  const sqs = new SQSClient({});

  const publishCommand = new SendMessageCommand({
    QueueUrl: process.env.QUEUE_URL,
    MessageBody: "Hello World!",
  });

  try {
    const response = await sqs.send(publishCommand);
    console.log(JSON.stringify(response));
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

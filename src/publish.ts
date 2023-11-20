import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

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

publish().then(async () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 5000);
  }).then(() => {
    console.log("done");
  });
});

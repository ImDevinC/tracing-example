import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  ReceiveMessageCommand,
  Message,
  SQSClient,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { withObservabilityTopLevelHandler } from "@jupiterone/platform-sdk-observability/api";

const consume = withObservabilityTopLevelHandler({
  run: async () => {
    const sqs = new SQSClient({});
    const publishCommand = new ReceiveMessageCommand({
      QueueUrl: process.env.QUEUE_URL,
    });

    let messages: Message[] = [];

    try {
      const response = await sqs.send(publishCommand);
      messages = response.Messages || [];
    } catch (err) {
      console.log(err);
    }

    if (!messages) {
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
        QueueUrl: process.env.QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
      });
      try {
        await s3.send(putCommand);
        await sqs.send(deleteMessageCommand);
      } catch (err) {
        console.log(err);
      }
    }
  },
});

consume();

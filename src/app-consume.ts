import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { Consumer } from "sqs-consumer";

const s3 = new S3Client({});

const app = Consumer.create({
  queueUrl: process.env.QUEUE_URL!,
  sqs: new SQSClient({}),
  handleMessage: async (message) => {
    if (message.Body) {
      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME!,
        Key: "message.txt",
        Body: message.Body,
      });
      try {
        await s3.send(putObjectCommand);
      } catch (err) {
        console.log(err);
      }
    }
  },
});

app.start();

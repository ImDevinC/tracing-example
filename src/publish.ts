import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { withObservabilityTopLevelHandler } from "@jupiterone/platform-sdk-observability/api";

const publish = withObservabilityTopLevelHandler({
  run: async () => {
    const sqs = new SQSClient({});
    const publishCommand = new SendMessageCommand({
      QueueUrl: process.env.QUEUE_URL,
      MessageBody: "Hello World!",
    });

    try {
      const response = await sqs.send(publishCommand);
      console.log(JSON.stringify(response));
    } catch (err) {
      console.log(err);
    }
  },
});

publish();

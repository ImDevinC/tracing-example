# tracing-example

This is a simple example showcasing how to use auto-instrumentation with SQS. Currently it doesn't work, and this is a work in progress to understand why.

## Setup

Copy the `.env.sample` to `.env` and fill in the appropriate values for your configuration.

## Running

To run, perform the following:

1. `docker-compose up` will start both an opentelemetry collector and a Jaeger container
1. Use `npm run send` to publish a message to the SQS queue
1. Use `npm run consume` to consume the message from the SQS queue
1. Look in Jaeger at `localhost:16686` and you should see a linked trace between the two services

## How it works

### `send`

When running `npm run send`, the process sends a message to the SQS queue with the text `"Hello World!"`.

### `consume`

When running `npm run consume`, the process reads a message from the SQS queue, uploads the contents of the message body to the S3 bucket, and then deletes the message from the queue.

### The solution
Due to the way SQS instrumentation works, [documented here](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/plugins/node/opentelemetry-instrumentation-aws-sdk/doc/sqs.md#processing-spans), looping over each message has to be done in a specific manner. Using the following will not work:
```typescript
const receiveCommand = new ReceiveMessageCommand({
  QueueUrl: process.env.QUEUE_URL,
});
const messages = await sqs.send(receiveCommand).Messages;
for (const message of messages) {
  // Do the stuff
}
```
But the following will
```typescript
const processMessage = async(message: Message) => {
	// Do the stuff
}

const receiveCommand = new ReceiveMessageCommand({
  QueueUrl: process.env.QUEUE_URL,
});
const messages = await sqs.send(receiveCommand).Messages;
const promises: Promise<void>[] = [];
messages.forEach((message) => { promises.push(processMessage(message)) };
await Promise.all(messages)
```
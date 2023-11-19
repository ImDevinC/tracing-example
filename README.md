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
   - **Currently, this does not work**

## How it works

### `send`

When running `npm run send`, the process sends a message to the SQS queue with the text `"Hello World!"`.

### `consume`

When running `npm run consume`, the process reads a message from the SQS queue, uploads the contents of the message body to the S3 bucket, and then deletes the message from the queue.

## Working example
If you instead use `npm run app-consume` to read from SQS, then the proper trace link does show up.
```json
  links: [
    {
      context: {
        traceId: "e5542e0485177fe00346b0c651df31af",
        spanId: "27e72eea0cc7aef5",
        traceFlags: 1,
        isRemote: true
      },
      attributes: {}
    }
  ]
```
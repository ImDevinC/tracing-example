const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-proto");
const { NodeSDK } = require("@opentelemetry/sdk-node");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-node");

const exporter = new ConsoleSpanExporter();

// const exporter = new OTLPTraceExporter({
//   url:
//     "http://" +
//     (process.env.OTEL_COLLECTOR_URL ?? "localhost:4318") +
//     "/v1/traces",
// });

const sdk = new NodeSDK({
  spanProcessor: new BatchSpanProcessor(exporter),
  serviceName: process.env.SERVICE_NAME,
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-aws-sdk": {
        sqsExtractContextPropagationFromPayload: true,
        suppressInternalInstrumentation: true,
      }
    }),
  ],
});

sdk.start();

process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => console.log("Tracing terminated"))
    .catch((error) => console.log("Error terminating tracing", error))
    .finally(() => process.exit(0));
});

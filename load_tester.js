#!/usr/bin/env node

require('dotenv').config();
const { EventHubProducerClient } = require('@azure/event-hubs');

// Configuration from command line arguments first, then environment, then defaults
const connectionString = process.env.EVENTHUB_CONNECTION_STRING;
const eventHubName = process.env.EVENTHUB_NAME;
const eventsPerSecond = parseInt(process.argv[2] || process.env.LOAD_TEST_RPS || '100', 10);
const totalEvents = parseInt(process.argv[3] || process.env.LOAD_TEST_TOTAL || '1000', 10);
const batchSize = parseInt(process.env.LOAD_TEST_BATCH_SIZE || '10', 10);

if (!connectionString || !eventHubName) {
  console.error('ERROR: EVENTHUB_CONNECTION_STRING and EVENTHUB_NAME environment variables are required.');
  console.error('Usage: node load_tester.js [eventsPerSecond] [totalEvents]');
  console.error('Or set environment variables: EVENTHUB_CONNECTION_STRING, EVENTHUB_NAME');
  process.exit(1);
}

const producer = new EventHubProducerClient(connectionString, eventHubName);

// Metrics
let sentCount = 0;
let errorCount = 0;
let startTime = Date.now();

const metricsInterval = setInterval(() => {
  const elapsedSec = (Date.now() - startTime) / 1000;
  const actualRps = sentCount / elapsedSec;
  const remaining = totalEvents - sentCount;
  console.log(`[${new Date().toISOString()}] Sent: ${sentCount}/${totalEvents} | RPS: ${actualRps.toFixed(1)} | Errors: ${errorCount} | Remaining: ${remaining}`);
}, 2000);

async function sendBatch() {
  try {
    const batch = await producer.createBatch();
    const messagesToSend = Math.min(batchSize, totalEvents - sentCount);

    for (let i = 0; i < messagesToSend; i++) {
      const message = {
        text: `Load test message ${sentCount + i + 1} at ${new Date().toISOString()}`,
        tag: 'loadtest',
        timestamp: new Date().toISOString(),
        messageId: sentCount + i + 1
      };

      if (!batch.tryAdd({ body: message })) {
        console.warn(`[WARN] Could not add message to batch at index ${i}`);
        break;
      }
    }

    if (batch.count > 0) {
      await producer.sendBatch(batch);
      sentCount += batch.count;
    }
  } catch (err) {
    errorCount++;
    console.error(`[ERROR] Batch send failed: ${err.message}`);
  }
}

async function runLoadTest() {
  console.log(`\n=== Azure Event Hubs Load Test ===`);
  console.log(`Connection: ${connectionString.substring(0, 50)}...`);
  console.log(`Event Hub: ${eventHubName}`);
  console.log(`Target RPS: ${eventsPerSecond}`);
  console.log(`Total events: ${totalEvents}`);
  console.log(`Batch size: ${batchSize}`);
  console.log(`\nStarting load test at ${new Date().toISOString()}...\n`);

  startTime = Date.now();

  // Calculate interval between batches to achieve target RPS
  const batchInterval = (batchSize / eventsPerSecond) * 1000; // milliseconds
  const intervalHandle = setInterval(async () => {
    if (sentCount >= totalEvents) {
      clearInterval(intervalHandle);
      clearInterval(metricsInterval);
      await finalize();
      return;
    }
    await sendBatch();
  }, batchInterval);
}

async function finalize() {
  const elapsedMs = Date.now() - startTime;
  const elapsedSec = elapsedMs / 1000;
  const actualRps = sentCount / elapsedSec;

  console.log(`\n=== Load Test Complete ===`);
  console.log(`Total events sent: ${sentCount}`);
  console.log(`Total errors: ${errorCount}`);
  console.log(`Time elapsed: ${elapsedSec.toFixed(2)}s`);
  console.log(`Actual RPS: ${actualRps.toFixed(2)}`);
  console.log(`Success rate: ${(((sentCount - errorCount) / sentCount) * 100).toFixed(2)}%`);
  console.log(`Finished at: ${new Date().toISOString()}\n`);

  try {
    await producer.close();
  } catch (e) {
    console.error('Error closing producer:', e.message);
  }
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nInterrupted. Shutting down gracefully...');
  clearInterval(metricsInterval);
  try {
    await producer.close();
  } catch (e) {
    /* ignore */
  }
  process.exit(0);
});

runLoadTest().catch(async (err) => {
  console.error('Fatal error:', err);
  try {
    await producer.close();
  } catch (e) {
    /* ignore */
  }
  process.exit(1);
});

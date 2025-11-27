require('dotenv').config();
const express = require('express');
const path = require('path');
const { EventHubProducerClient } = require('@azure/event-hubs');

const app = express();
app.use(express.json());

const connectionString = process.env.EVENTHUB_CONNECTION_STRING;
const eventHubName = process.env.EVENTHUB_NAME;
if (!connectionString || !eventHubName) {
  console.warn('EVENTHUB_CONNECTION_STRING or EVENTHUB_NAME not set. The sender will fail until these are provided.');
}
//
// Create a producer client once and reuse
let producer;
if (connectionString && eventHubName) {
  producer = new EventHubProducerClient(connectionString, eventHubName);
}

app.use(express.static(path.join(__dirname, 'public')));

// Endpoint receives JSON and forwards to Event Hubs with lowercase `text` and `tag`
app.post('/api/send', async (req, res) => {
  try {
    // Normalize to lowercase keys `text` and `tag`
    const incoming = req.body || {};
    const payload = {
      text: incoming.text !== undefined ? String(incoming.text) : (incoming.Text !== undefined ? String(incoming.Text) : ''),
      tag: incoming.tag !== undefined ? String(incoming.tag) : (incoming.Tag !== undefined ? String(incoming.Tag) : '')
    };

    if (!producer) {
      return res.status(500).json({ error: 'Event Hub producer not configured. Set EVENTHUB_CONNECTION_STRING and EVENTHUB_NAME.' });
    }

    const batch = await producer.createBatch();
    const added = batch.tryAdd({ body: payload });
    if (!added) {
      return res.status(500).json({ error: 'Event too large for the batch.' });
    }

    await producer.sendBatch(batch);
    return res.json({ ok: true, sent: payload });
  } catch (err) {
    console.error('Send error', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Azure RPi Simulator listening on http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  try {
    if (producer) await producer.close();
  } catch (e) { /* ignore */ }
  process.exit(0);
});

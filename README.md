# Azure Raspberry Pi Web Simulator

A Node.js/Express application that simulates a Raspberry Pi sending telemetry data to Azure Event Hubs. Includes a web-based UI for interactive message sending and a high-performance load tester for stress testing.

## 🎯 Overview

This project provides:
- **Express Server** — REST API endpoint (`/api/send`) that forwards JSON messages to Azure Event Hubs
- **Web Simulator UI** — Simple browser-based interface to send messages manually or auto-stream at 1 msg/sec
- **Load Tester** — Node.js script to send high-volume events at configurable rates (tested up to 100+ RPS)
- **Event Normalization** — All messages normalized with lowercase `text` and `tag` fields

Use cases:
- Simulate Raspberry Pi IoT devices sending sensor data
- Load test Azure Event Hubs infrastructure
- Prototype IoT event ingestion pipelines
- Test Event Hub consumers and stream processing

## 📋 Prerequisites

- **Node.js** 14+ (tested with v24.11.0)
- **npm** 6+ (tested with v11.6.1)
- **Azure Event Hubs** namespace and hub configured
- **Connection String** with `Send` rights to the event hub

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/azure-rpi-simulator.git
cd azure-rpi-simulator
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Event Hubs credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
EVENTHUB_CONNECTION_STRING=Endpoint=sb://your-namespace.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=YOUR_KEY
EVENTHUB_NAME=your-hub-name
PORT=3000
LOAD_TEST_RPS=100
LOAD_TEST_TOTAL=1000
LOAD_TEST_BATCH_SIZE=10
```

### 3. Start the Server

```bash
npm start
```

Server runs on `http://localhost:3000`. Visit in your browser to see the simulator UI.

## 🎮 Using the Simulator UI

1. **Open** http://localhost:3000
2. **Enter Text** — any message string (e.g., "Temperature: 72F")
3. **Enter Tag** — optional label (e.g., "sensor1", "room-temp")
4. **Click "Send once"** — sends a single message immediately
5. **Click "Start auto (1/s)"** — streams 1 message per second; click again to stop

Each message is forwarded to Event Hubs with structure:
```json
{
  "text": "your message",
  "tag": "your-tag",
  "timestamp": "2025-11-16T21:29:48.256Z",
  "messageId": 12345
}
```

## 📊 Load Testing

Run the load tester to send high volumes of events:

```bash
# 100 RPS, 5,000 events (~50 seconds)
node load_tester.js 100 5000

# 50 RPS, 5,000 events (~100 seconds)
node load_tester.js 50 5000

# 100 RPS, 60,000 events (~10 minutes)
node load_tester.js 100 60000
```

### Load Test Parameters

```
node load_tester.js [RPS] [TOTAL_EVENTS]

RPS              = Target events per second (default 100)
TOTAL_EVENTS     = Total number of events to send (default 1000)
```

### Example Output

```
=== Azure Event Hubs Load Test ===
Target RPS: 100
Total events: 60000

[21:29:48Z] Sent: 5000/60000 | RPS: 92.6 | Errors: 0 | Remaining: 55000
...
=== Load Test Complete ===
Total events sent: 60000
Total errors: 0
Time elapsed: 647.59s
Actual RPS: 92.65
Success rate: 100.00%
```

## 📁 Project Structure

```
azure-rpi-simulator/
├── server.js              # Express server + Event Hubs producer
├── load_tester.js         # High-volume load testing script
├── package.json           # Dependencies and scripts
├── .env.example           # Sample environment variables
├── README.md              # This file
└── public/
    ├── index.html         # Simulator UI (HTML)
    └── simulator.js       # Simulator UI logic (JavaScript)
```

## 🔧 API Endpoints

### POST /api/send

Send a message to Event Hubs.

**Request:**
```json
{
  "text": "Sensor reading: 23.5°C",
  "tag": "sensor-01"
}
```

**Response (Success):**
```json
{
  "ok": true,
  "sent": {
    "text": "Sensor reading: 23.5°C",
    "tag": "sensor-01"
  }
}
```

**Response (Error):**
```json
{
  "error": "Event Hub producer not configured. Set EVENTHUB_CONNECTION_STRING and EVENTHUB_NAME."
}
```

## 🌐 Deployment

### Option A: Azure App Service

```bash
# Create resource group, app service plan, and web app
az group create --name rg-rpi-sim --location eastus
az appservice plan create --name asp-rpi-sim --resource-group rg-rpi-sim --sku B1 --is-linux
az webapp create --resource-group rg-rpi-sim --plan asp-rpi-sim --name azure-rpi-sim-001 --runtime "NODE|18-lts"

# Deploy via zip
Compress-Archive -Force -Path * -DestinationPath ../app.zip
az webapp deployment source config-zip --resource-group rg-rpi-sim --name azure-rpi-sim-001 --src ../app.zip

# Set app settings
az webapp config appsettings set --resource-group rg-rpi-sim --name azure-rpi-sim-001 \
  --settings EVENTHUB_CONNECTION_STRING="..." EVENTHUB_NAME="your-hub"

### CI / Auto-deploy via GitHub Actions

This repository includes a GitHub Actions workflow that can deploy to Azure App Service automatically on push to `main`.

Steps to enable auto-deploy:

1. In the Azure Portal, go to your Web App → Overview → **Get publish profile** and download the `.PublishSettings` file.
2. In your GitHub repo, go to **Settings → Secrets and variables → Actions** and add two repository secrets:
  - `AZURE_WEBAPP_NAME` — the name of your Web App (e.g., `azure-rpi-sim-001`)
  - `AZURE_WEBAPP_PUBLISH_PROFILE` — the full contents of the publish profile file (open the file and copy the XML)
3. Push to `main` — the workflow `.github/workflows/deploy-azure.yml` will run, build, and deploy your app.

Note: You can also use `AZURE_CREDENTIALS` (service principal JSON) instead of a publish profile; update the workflow accordingly.
```

### Option B: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t azure-rpi-sim .
docker run -e EVENTHUB_CONNECTION_STRING="..." -e EVENTHUB_NAME="hub" -p 3000:3000 azure-rpi-sim
```

## 📊 Performance & Metrics

Tested performance:
- **Throughput**: 90–93 RPS sustained (100 RPS target)
- **Batch Size**: 10 events per API call
- **Latency**: <10ms typical per batch
- **Success Rate**: 100% on 60,000+ event tests
- **Error Rate**: 0 (with valid credentials)

## 🔐 Security

- **Secrets**: Store Event Hubs connection string in `.env` (never commit to git)
- **Environment Variables**: Use `.env` or App Service Configuration
- **Managed Identity** (optional): Use Azure AD identity instead of connection strings for higher security
- **.gitignore**: Includes `.env` to prevent secret leaks

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| `EVENTHUB_CONNECTION_STRING` not set | Copy `.env.example` to `.env` and fill in credentials |
| Connection refused on localhost | Ensure `npm start` ran successfully; check port 3000 is available |
| Event Hub errors (throttling) | Reduce RPS or increase Event Hub capacity (Standard/Premium tier) |
| High latency | Increase `LOAD_TEST_BATCH_SIZE` for batching efficiency |

## 📈 Example Workflows

### 1. Interactive Testing
```bash
npm start
# Open http://localhost:3000 and manually send messages
```

### 2. Continuous Load Test (5 minutes at 50 RPS)
```bash
node load_tester.js 50 15000  # 15,000 events ÷ 50 RPS = 300 seconds = 5 minutes
```

### 3. Spike Test (1,000 RPS burst)
```bash
node load_tester.js 1000 10000
```

## 📝 License

MIT

## 🤝 Contributing

Pull requests welcome. For major changes, open an issue first to discuss.

## 📬 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Event Hubs documentation: https://docs.microsoft.com/azure/event-hubs/
3. Open a GitHub issue with logs and steps to reproduce

---

**Built for:** Azure Event Hubs, IoT simulations, load testing, and cloud infrastructure validation.

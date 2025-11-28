# Deployment & Run Guide — azure-rpi-simulator

This document describes how to run the simulator locally, deploy it to Azure App Service, and enable CI/CD using GitHub Actions.

Prerequisites
- Node.js 18+ installed
- Azure subscription (to create App Service)
- GitHub repository (already present)

1) Run locally

```powershell
cd C:\KK_ACE\KK_Projects\azure-rpi-simulator
copy .env.example .env
# Edit .env to add your EVENTHUB_CONNECTION_STRING and EVENTHUB_NAME
npm ci
npm start
# Open http://localhost:3000
```

2) Set environment variables
- Put secrets in `.env` locally. DO NOT commit `.env`.

3) Deploy to Azure App Service (publish profile)

- Create a Web App in Azure (Linux or Windows). Example (Azure CLI):

```powershell
az group create --name rg-rpi-sim --location eastus
az appservice plan create --name asp-rpi-sim --resource-group rg-rpi-sim --sku B1 --is-linux
az webapp create --resource-group rg-rpi-sim --plan asp-rpi-sim --name <your-app-name> --runtime "NODE|18-lts"
```

- Get publish profile (Azure Portal → Web App → Get publish profile) and copy contents.

- Add GitHub Secrets (repository → Settings → Secrets and variables → Actions):
  - `AZURE_WEBAPP_NAME` = `<your-app-name>`
  - `AZURE_WEBAPP_PUBLISH_PROFILE` = contents of publish profile XML

The included workflow `.github/workflows/deploy-azure.yml` will deploy on push to `main`.

4) Deploy via Azure CLI (manual zip deploy)

```powershell
cd C:\KK_ACE\KK_Projects\azure-rpi-simulator
Compress-Archive -Force -Path * -DestinationPath ../app.zip
az webapp deployment source config-zip --resource-group rg-rpi-sim --name <your-app-name> --src ../app.zip
```

5) Post-deploy: App Settings
- In Azure Portal → Configuration for your Web App, add values:
  - `EVENTHUB_CONNECTION_STRING` (value from Azure or rotated key)
  - `EVENTHUB_NAME`

6) Notes & Security
- Rotate and remove any pasted connection strings from local `.env` after setting secrets in Azure/GitHub.
- Use Managed Identity + Azure SDK to avoid storing connection strings in environments for production.

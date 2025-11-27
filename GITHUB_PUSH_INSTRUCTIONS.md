# Complete Guide: Upload azure-rpi-simulator to GitHub

## Prerequisites: Install Git

### Step 1: Download and Install Git

1. **Download Git for Windows:**
   - Go to: https://git-scm.com/download/win
   - Click the **64-bit Git for Windows Setup** link
   - Run the installer and accept defaults
   - Click **Finish**

2. **Verify Installation:**
   - Open PowerShell (new window)
   - Run: `git --version`
   - Should output: `git version 2.x.x.windows.x`

3. **If PATH not updated:**
   - Restart PowerShell or computer
   - Or add to PATH manually: `C:\Program Files\Git\cmd`

---

## Step 2: Create GitHub Repository

1. **Go to GitHub:**
   - Visit: https://github.com/KarunakarKotha09
   - Click **+** (top-right) → **New repository**

2. **Configure Repository:**
   - **Repository name:** `azure-rpi-simulator`
   - **Description:** Azure Event Hubs simulator with load testing capability
   - **Visibility:** Public ✅ (so others can see it)
   - **Initialize this repository with:**
     - ❌ Uncheck "Add a README file"
     - ❌ Uncheck "Add .gitignore"
     - ❌ Uncheck "Choose a license"
   - **Click:** Create repository

3. **After creation, you'll see:**
   - Repository URL: `https://github.com/KarunakarKotha09/azure-rpi-simulator.git`
   - Instructions to push existing code

---

## Step 3: Upload Your Project via PowerShell

### Open PowerShell and Run These Commands:

```powershell
# Navigate to project directory
cd C:\KK_ACE\KK_Projects\azure-rpi-simulator

# Initialize git repository
git init

# Configure git user (one-time setup)
git config --global user.name "Karunakar Kotha"
git config --global user.email "your-email@example.com"

# Stage all project files
git add .

# Create initial commit
git commit -m "Initial commit: Azure RPi Simulator with Event Hubs integration and load testing"

# Add GitHub remote
git remote add origin https://github.com/KarunakarKotha09/azure-rpi-simulator.git

# Rename branch to main (GitHub default)
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## Step 4: Authenticate with GitHub

When you run `git push`, GitHub will prompt for authentication:

### Option A: Personal Access Token (Recommended)

1. **Generate Token on GitHub:**
   - Go to: https://github.com/settings/tokens
   - Click **Generate new token (classic)**
   - Select scopes:
     - ✅ `repo` (full control of private repositories)
   - Click **Generate token**
   - **Copy the token** (won't be shown again!)

2. **When Git asks for password:**
   - **Username:** `KarunakarKotha09`
   - **Password:** Paste the token you copied
   - **Save credentials** when prompted

### Option B: Git Credential Manager (Easier)

Git Credential Manager handles authentication automatically:
1. When prompted, click **Sign in with your browser**
2. Authorize GitHub in your browser
3. Return to PowerShell (should be done)

---

## Step 5: Verify Upload Success ✅

### Check on GitHub

1. **Visit your repository:**
   - https://github.com/KarunakarKotha09/azure-rpi-simulator

2. **Verify files are present:**
   ```
   ✅ README.md
   ✅ server.js
   ✅ load_tester.js
   ✅ package.json
   ✅ .env.example
   ✅ public/index.html
   ✅ public/simulator.js
   ✅ .gitignore
   ```

3. **Verify secrets are NOT present:**
   ```
   ❌ .env file should NOT exist
   ❌ Any connection strings in code should NOT be visible
   ```

### Verify Locally

```powershell
# Show remote configuration
git remote -v

# Show recent commits
git log --oneline -5

# Check current branch
git branch -a
```

Expected output:
```
origin  https://github.com/KarunakarKotha09/azure-rpi-simulator.git (fetch)
origin  https://github.com/KarunakarKotha09/azure-rpi-simulator.git (push)

* 35a8c5f (HEAD -> main, origin/main) Initial commit: Azure RPi...
```

---

## Troubleshooting

### ❌ "git: command not found"
**Solution:** Install Git from https://git-scm.com/download/win

### ❌ "fatal: not a git repository"
**Solution:** You're not in the correct directory
```powershell
cd C:\KK_ACE\KK_Projects\azure-rpi-simulator
git init
```

### ❌ "remote origin already exists"
**Solution:** Remove and re-add the remote
```powershell
git remote remove origin
git remote add origin https://github.com/KarunakarKotha09/azure-rpi-simulator.git
git push -u origin main
```

### ❌ "fatal: Authentication failed"
**Solution:** Use GitHub CLI or Personal Access Token
```powershell
# Option 1: Try HTTPS with Git Credential Manager
git config --global credential.helper wincred
git push -u origin main

# Option 2: Use GitHub CLI
gh auth login
gh repo create azure-rpi-simulator --source=. --remote=origin --push
```

### ❌ ".env file was uploaded (security risk)"
**Solution:** Remove from history
```powershell
git rm --cached .env
git add .gitignore
git commit -m "Remove .env from tracking"
git push

# IMPORTANT: Rotate your Event Hubs credentials in Azure!
```

---

## Quick Reference: All Commands in One Block

Copy and paste into PowerShell:

```powershell
cd C:\KK_ACE\KK_Projects\azure-rpi-simulator
git init
git config --global user.name "Karunakar Kotha"
git config --global user.email "your-email@example.com"
git add .
git commit -m "Initial commit: Azure RPi Simulator with Event Hubs integration and load testing"
git remote add origin https://github.com/KarunakarKotha09/azure-rpi-simulator.git
git branch -M main
git push -u origin main
```

**Then:** When prompted, enter your GitHub credentials (use Personal Access Token as password)

---

## What Gets Uploaded?

✅ **Uploaded to GitHub:**
- `README.md` — Complete project documentation
- `server.js` — Express server + Event Hubs integration
- `load_tester.js` — High-performance load testing script
- `package.json` — Dependencies and scripts
- `package-lock.json` — Locked dependency versions
- `public/index.html` — Web simulator UI
- `public/simulator.js` — UI logic
- `.env.example` — Template for environment variables
- `.gitignore` — Configuration to exclude secrets
- `LICENSE` — MIT open-source license

❌ **NOT Uploaded (Protected by .gitignore):**
- `.env` — Your actual Event Hubs credentials
- `node_modules/` — Dependencies (reinstalled via npm install)
- Logs and temporary files

---

## After Upload: Next Steps

### 1. Share Your GitHub Link
- Main repo: https://github.com/KarunakarKotha09/azure-rpi-simulator

### 2. Update Your Social Profiles
- LinkedIn, Twitter, portfolio with the GitHub link

### 3. Make Future Updates
```powershell
# After making changes locally:
git add .
git commit -m "feat: add new feature description"
git push
```

### 4. Create a Release (Optional)
```powershell
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

---

## README Highlights

Your README includes:

📋 **Overview & Features**
- Project description
- Tech stack
- Use cases

🚀 **Quick Start**
- Installation steps
- Configuration
- Running the server

🎮 **Using the Simulator**
- UI walkthrough
- Manual and auto-send modes

📊 **Load Testing**
- Parameters explained
- Example commands with output

🔧 **API Documentation**
- POST /api/send endpoint
- Request/response format

🌐 **Deployment**
- Azure App Service setup
- Docker containerization

📈 **Performance Metrics**
- Tested throughput (90–93 RPS)
- Reliability stats

🐛 **Troubleshooting**
- Common issues and solutions

---

## Support

If you encounter issues:

1. **Check Git Installation:**
   ```powershell
   git --version
   ```

2. **Check GitHub Authentication:**
   ```powershell
   git config --global user.name
   git config --global user.email
   ```

3. **Check Remote Configuration:**
   ```powershell
   git remote -v
   ```

4. **View Git Status:**
   ```powershell
   git status
   git log --oneline -5
   ```

---

**Your GitHub Profile:** https://github.com/KarunakarKotha09  
**Your Project Will Be At:** https://github.com/KarunakarKotha09/azure-rpi-simulator

Good luck! 🚀

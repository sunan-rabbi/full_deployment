# 🚀 EC2_Test Deployment Guide

### Next.js + Express + Prisma + PostgreSQL

(AWS Ubuntu Server Deployment)

---

## 🧱 Project Stack

- **Frontend** → Next.js 16.1.1 (Port 3001)
- **Backend** → Express.js + TypeScript (Port 5000)
- **ORM** → Prisma with custom output path
- **Database** → PostgreSQL
- **Server** → AWS EC2 (Ubuntu)
- **Reverse Proxy** → Nginx
- **Process Manager** → PM2

---

## 🌐 Architecture Flow

```
User Browser
    ↓
Nginx (Port 80/443)
    ↓
Next.js Frontend (Port 3001)
    ↓
Express API (Port 5000 at /api/v1/)
    ↓
PostgreSQL Database
```

---

# PART 1 — Create Server (AWS EC2)

## 1️⃣ Launch EC2 Instance

1. Go to **AWS Console** → **EC2**
2. Click **Launch Instance**
3. Configure:
   - **Name**: `EC2_Test-Server`
   - **OS**: Ubuntu 22.04 LTS
   - **Instance Type**: t2.small (recommended) or t2.micro (free tier)
   - **Storage**: 20 GB minimum
4. **Security Group** - Open these ports:
   - **22** (SSH)
   - **80** (HTTP)
   - **443** (HTTPS)
   - **5000** (Backend - can be closed after Nginx setup)
   - **3001** (Frontend - can be closed after Nginx setup)
5. Download your `.pem` key file

## 2️⃣ Connect to Server

```bash
# Windows (PowerShell or WSL)
ssh -i "your-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP

# If permission error on Windows
icacls "your-key.pem" /inheritance:r
icacls "your-key.pem" /grant:r "%username%:R"
```

---

# PART 2 — Prepare Server Environment

## Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

## Install Essential Tools

```bash
sudo apt install -y git curl nginx build-essential
```

---

# PART 3 — Install Node.js

## Install NVM (Node Version Manager)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
```

## Install Node.js LTS

```bash
nvm install --lts
nvm use --lts
```

## Verify Installation

```bash
node -v   # Should show v20.x.x or similar
npm -v    # Should show v10.x.x or similar
```

---

# PART 4 — Install & Configure PostgreSQL

## Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Create Database & User

```bash
sudo -u postgres createuser --interactive --pwprompt
```

Inside PostgreSQL shell:

```sql
# example:
# username: sunan
# password: sunan

```

## Test Connection

```bash
sudo -u postgres createdb -O sunan mydb
```

---

# PART 5 — Upload Your Project

## Option A: Clone from GitHub (Recommended)

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/<repo>.git
cd <repo>
```

---

# PART 6 — Setup Backend (Express + Prisma + TypeScript)

```bash
cd ~/<repo>/backend
npm install
```

## Create Production Environment File

```bash
sudo cp .env.example .env
```

Paste the following (update with your values):

```env
NODE_ENV=production
PORT=5000

# Database - Use ONLINE_DATABASE_URL for production
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<database name>"

# Cookie Secret (generate a secure random string)
COOKIE_SECRET="your_secure_random_string_here_use_openssl_rand_base64_32"

#CORS
NEEDCORS=1

ALLOWORIGINS=http://localhost:3000,http://localhost:3001,http://DOMAIN_IP4,http://DOMAIN_IP4:3000,http://DOMAIN_IP4:3001
```

## Setup Prisma Database

```bash

# Run migrations
npm run migrate

# Generate Prisma Client
npm run generate

```

## Build TypeScript

```bash
npm run build
npm run start
```

If you see:

```
🚀 Server ready at http://localhost:5000
🔧 Environment: production
```

Success! Press `Ctrl + C` to stop.

---

# PART 7 — Setup PM2 (Process Manager)

## Install PM2 Globally

```bash
npm install -g pm2
```

## Start Backend with PM2

```bash
cd ~/<repo>/backend
pm2 start dist/src/server.js --name server
pm2 save
pm2 startup
```

## Verify Backend is Running

```bash
pm2 status
pm2 logs server --lines 20
```

Test endpoint:

```bash
curl http://localhost:5000/health
```

---

# PART 8 — Setup Frontend (Next.js)

```bash
cd ~/<repo>/frontend
npm install
```

## Create Environment File

```bash
nano .env
```

Paste (use empty string to call through nginx):

```env
NEXT_PUBLIC_API_URL= http://DOMAIN_IP
```

## Build Next.js

```bash
npm run build
npm run start
```

This will create an optimized production build.

## Start Frontend with PM2

```bash
pm2 start npm --name "client" -- start
pm2 save
```

## Verify Frontend is Running

```bash
pm2 status
pm2 logs client --lines 20
```

Test:

```bash
curl http://localhost:3000
```

---

# PART 9 — Configure Nginx (Reverse Proxy)

## Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/app
```

Paste (replace YOUR_DOMAIN_OR_IP with your actual domain or IP):

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Increase timeouts for large requests
    client_max_body_size 10M;
    client_body_timeout 60s;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API (Express)
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Origin $http_origin;
    }

    # Next.js static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

## Enable Site & Restart Nginx

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

# PART 10 — Configure Firewall

```bash
# Allow SSH
sudo ufw allow OpenSSH

# Allow Nginx (HTTP & HTTPS)
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Update AWS Security Group

Go to AWS Console → EC2 → Security Groups:

- **Remove** public access to ports 3001 and 5000 (only Nginx needs access)
- **Keep open**: 22, 80, 443

---

# PART 11 — SSL Certificate (HTTPS)

## Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

## Get SSL Certificate

```bash
# Replace with your actual domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:

- Enter email address
- Agree to terms
- Choose to redirect HTTP to HTTPS (recommended)

## Auto-renewal Test

```bash
sudo certbot renew --dry-run
```

Certbot will automatically renew certificates before expiry.

# PART 12 — Useful PM2 Commands

```bash
# View all processes
pm2 status

# View logs
pm2 logs
pm2 logs ec2test-backend
pm2 logs ec2test-frontend

# Restart services
pm2 restart ec2test-backend
pm2 restart ec2test-frontend
pm2 restart all

# Stop services
pm2 stop ec2test-backend
pm2 stop ec2test-frontend

# Delete service
pm2 delete ec2test-backend

# Monitor resources
pm2 monit

# Save current PM2 processes
pm2 save

# View PM2 startup command
pm2 startup
```

---

# PART 13 — Database Management

## Connect to PostgreSQL

```bash
psql -U ec2user -d ec2testdb -h localhost
```

## Useful PostgreSQL Commands

```sql
-- List all tables
\dt

-- Describe table structure
\d user

-- View all users
SELECT * FROM user;

-- Count users
SELECT COUNT(*) FROM user;

-- Exit
\q
```

## Prisma Studio (Database GUI)

Prisma Studio provides a visual interface to view and edit your database. **For security, use SSH tunneling instead of exposing the port publicly.**

### Method 1: SSH Tunnel (Recommended - Most Secure)

**From your local machine (Windows PowerShell or WSL):**

```bash
# Create SSH tunnel
ssh -i "your-key.pem" -L 51212:localhost:51212 ubuntu@YOUR_EC2_PUBLIC_IP

# Keep this terminal open
```

**In a new terminal on the server (or same SSH session):**

```bash
cd ~/EC2_Test/backend
npx prisma studio --browser none
```

**Access from your local browser:** `http://localhost:51212`

This way, Prisma Studio is never exposed to the internet!

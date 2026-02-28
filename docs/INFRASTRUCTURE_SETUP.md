# Step 18.3: Infrastructure Setup Guide (Vercel + AWS EC2 Direct Docker)

This guide walks you through the absolute fastest, most memory-efficient way to deploy CineVision on the AWS Free Tier.
By completely bypassing heavy orchestrators like Kubernetes, the API uses only ~80MB of RAM, making it lightning fast.

- **Frontend:** Vercel (Global CDN, instant loading, free SSL)
- **Backend API:** AWS EC2 Free Tier running native **Docker Compose**

---

## Part 1: Provisioning the backend EC2 Instance (Ubuntu 24.04 LTS)

Because we are using an automated GitHub Action that requires SSH access, we MUST create a Key Pair (`.pem` file) during launch.

### 1.1 Launch the EC2 Instance
1. Go to AWS Console: https://console.aws.amazon.com/ec2
2. Click **"Launch instance"**.
3. **Name:** `cinevision-api`
4. **AMI:** Select **Ubuntu Server 24.04 LTS (HVM)**
5. **Instance type:** `t3.micro` or `t2.micro` (Free Tier — 1GB RAM)
6. **Key pair (login):** 
   - Click **"Create new key pair"**.
   - Name it `cinevision-deploy-key`.
   - Key pair type: **RSA**.
   - Private key file format: **.pem**.
   - Click **"Create key pair"**. The `.pem` file will instantly download to your laptop. Keep it safe!
7. **Network settings (Security Group):**
   - Click "Edit". Add inbound rules:
     - **HTTP (Port 80):** Source `0.0.0.0/0` (For Vercel frontend to reach the API)
     - **SSH (Port 22):** Source `0.0.0.0/0` (For GitHub Actions to connect and deploy)
8. Click **"Launch instance"**. Wait for the state to show "Running". Note the **Public IPv4 address**.

---

## Part 2: Prepare the Server (Install Docker)

1. Connect to your instance using SSH from your laptop terminal (or the EC2 Instance Connect browser window):
   ```bash
   # If using your laptop terminal, swap with your real IP and pem file path:
   ssh -i ~/Downloads/cinevision-deploy-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
   ```

2. Run this single script to install Docker and Docker-Compose:
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose-v2
   sudo systemctl enable --now docker
   sudo usermod -aG docker ubuntu
   ```

3. Create the project folder where GitHub Actions will put the files:
   ```bash
   mkdir -p /home/ubuntu/cinevision
   ```

4. **Disconnect and Reconnect** so the Docker permissions apply:
   ```bash
   exit
   # Then SSH back in!
   ```

---

## Part 3: Create the `.env` File Directly on the Server

Our `docker-compose.prod.yml` expects a `.env` file to exist in the `cinevision` folder.

1. Once SSH'd back into the server, open a new file:
   ```bash
   nano /home/ubuntu/cinevision/.env
   ```

2. Paste your **Backend Environment Variables**. Fill in all the final values:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_super_secure_secret
   JWT_EXPIRES_IN=7d
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=wJalr...
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=cinevision-app-storage
   GEMINI_API_KEY=AIza...
   AI_MODEL=gemini-1.5-flash
   CLIENT_URL=https://cinevision-virid.vercel.app
   ```

3. Save and Exit: Press `CTRL+O`, `ENTER`, then `CTRL+X`.

---

## Part 4: Add the SSH Key to GitHub Actions Secrets

For GitHub Actions to connect to your server and deploy the code, it needs your `.pem` key.

1. Open the `.pem` file you downloaded in Step 1.1 in a basic text editor (like Notepad or VSCode).
2. Copy the **entire contents** (including `-----BEGIN RSA PRIVATE KEY-----` and the END line).
3. Go to your GitHub Repository → **Settings** → **Secrets and variables** → **Actions**.
4. You need the following 4 Secrets:
   - **`DOCKERHUB_USERNAME`**: `fawaz482`
   - **`DOCKERHUB_TOKEN`**: A Docker Hub Access Token
   - **`EC2_HOST`**: Your EC2 **Public IPv4 address** (e.g., `3.236.204.4`)
   - **`EC2_SSH_KEY`**: Paste the entire contents of the `.pem` file.

## Part 5: Trigger the Deployment!

With your server running Docker, the `.env` file in place, and the GitHub secrets configured, you are ready to deploy.

Simply commit your code to `main`. 

GitHub Actions will securely SSH into your server, pull the latest `fawaz482/cinevision-server` image from Docker Hub, and boot it up instantly using `docker-compose`.

Your API will be instantly reachable at `http://YOUR_EC2_PUBLIC_IP/api/health`!

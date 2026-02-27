# Step 18.3: Infrastructure Setup Guide (Vercel + AWS EC2 + K3s)

This guide walks you through the modern (2026) approach to deploying CineVision.
For maximum performance and lowest cost, we are splitting the deployment:
- **Frontend:** Vercel (Global CDN, instant loading, free SSL)
- **Backend API:** AWS EC2 Free Tier running K3s (Lightweight Kubernetes)

---

## Part 1: Deploy Frontend to Vercel (Takes 2 minutes)

1. Go to **[Vercel.com](https://vercel.com/)** and sign in with GitHub.
2. Click **"Add New..." → "Project"**.
3. Import your `CineVision` GitHub repository.
4. **CRITICAL:** In the "Root Directory" setting, click Edit and change it from `./` to `client`.
5. Vercel will auto-detect Vite. Open the **"Environment Variables"** dropdown and add:
   - Name: `VITE_API_URL`
   - Value: `http://YOUR_EC2_PUBLIC_IP` (You can fill this in *after* completing Part 2, or use your custom domain later).
6. Click **Deploy**. Vercel will give you a live URL (e.g., `https://cinevision-app.vercel.app`).

---

## Part 2: Provisioning the backend EC2 Instance (Ubuntu 24.04 LTS)

We use **Ubuntu 24.04 LTS** (Noble Numbat) for best container performance.
We will use **AWS Systems Manager (SSM)** to connect instead of old `.pem` SSH keys for greatly improved security.

### 2.1 Launch the EC2 Instance
1. Go to AWS Console: https://console.aws.amazon.com/ec2
2. Click **"Launch instance"**.
3. **Name:** `cinevision-api`
4. **AMI:** Select **Ubuntu Server 24.04 LTS (HVM)**
5. **Instance type:** `t3.micro` or `t2.micro` (Free Tier — 1GB RAM)
6. **Key pair:** Proceed **without a key pair** (we use SSM).
7. **Network settings (Security Group):**
   - Click "Edit". Add inbound rules:
     - **HTTP (Port 80):** Source `0.0.0.0/0`
     - **HTTPS (Port 443):** Source `0.0.0.0/0`
     - **Custom TCP (Port 6443):** Source `0.0.0.0/0` (For GitHub Actions deployment)
     - *Note: Do NOT open Port 22 (SSH). We don't need it.*
8. **Advanced Details → IAM instance profile:**
   - Create and attach an IAM role that has the `AmazonSSMManagedInstanceCore` policy.
9. Click **"Launch instance"**. Wait for the state to show "Running". Note the **Public IPv4 address**.

---

## Part 3: Connect Securely via AWS SSM

1. In the EC2 Instances list, select `cinevision-api` and click **"Connect"**.
2. Go to the **"Session Manager"** tab.
3. Click **"Connect"**. A browser-based secure terminal opens.
4. Elevate to the root user:
   ```bash
   sudo su - ubuntu
   ```

---

## Part 4: Install K3s (Optimized for 1GB RAM)

A standard 1GB `t3.micro` instance will crash if Kubernetes uses too much memory.
Run this highly-optimized K3s installation command in your browser terminal:

```bash
curl -sfL https://get.k3s.io | sh -s - server \
  --disable servicelb \
  --disable metrics-server \
  --disable local-storage \
  --kubelet-arg="eviction-hard=memory.available<50Mi,nodefs.available<10%"
```

*This disables heavy unused components and prevents K3s from panic-killing the API pod if RAM spikes.*

Verify the cluster is running:
```bash
sudo kubectl get nodes
# Should show "Ready"
```

---

## Part 5: Securely Inject Application Secrets

Your Express backend needs 10 specific environment variables to function correctly.
Instead of committing these to Git, we create a secure Kubernetes `Secret` directly on the server.

Inside your SSM terminal, carefully customize and paste this entire block:

```bash
sudo kubectl create secret generic cinevision-secrets \
  --from-literal=NODE_ENV="production" \
  --from-literal=MONGODB_URI="mongodb+srv://..." \
  --from-literal=JWT_SECRET="your_long_secure_string_here" \
  --from-literal=JWT_EXPIRES_IN="7d" \
  --from-literal=AWS_ACCESS_KEY_ID="AKIA..." \
  --from-literal=AWS_SECRET_ACCESS_KEY="wJalr..." \
  --from-literal=AWS_REGION="us-east-1" \
  --from-literal=AWS_S3_BUCKET_NAME="cinevision-app-storage" \
  --from-literal=GEMINI_API_KEY="AIza..." \
  --from-literal=AI_MODEL="gemini-1.5-flash" \
  --from-literal=CLIENT_URL="https://your-vercel-frontend-url.vercel.app"
```

Verify it exists:
```bash
sudo kubectl describe secret cinevision-secrets
```

---

## Part 6: Export Kubeconfig for GitHub Actions

In Step 18.4, GitHub Actions will build your Docker image and deploy it to this K3s cluster.
To do this, GitHub needs your cluster's "Kubeconfig" password file.

1. **Retrieve the config:**
   ```bash
   sudo cat /etc/rancher/k3s/k3s.yaml
   ```
2. Copy the entire output.
3. **Add to GitHub:** Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**.
4. Click **"New repository secret"**.
   - Name: `KUBE_CONFIG`
   - Value: Paste the copied text.
5. **CRITICAL EDIT:** Inside the pasted value on GitHub, change `server: https://127.0.0.1:6443` to use your EC2 instance's **Public IP address**. Example: `server: https://13.235.45.67:6443`.
6. Click **"Add secret"**.

---

## Part 7: First Manual Deployment Smoke Test

Let's verify the cluster can run your backend container before setting up CI/CD.

1. **Push your Docker image** (from your laptop terminal):
   ```bash
   docker login
   docker build -t fawaz482/cinevision-server:latest ./server
   docker push fawaz482/cinevision-server:latest
   ```

2. **Apply manifests** (on the EC2 SSM terminal):
   ```bash
   # Clone your repo just to get the yaml files
   git clone https://github.com/YOUR_USERNAME/CineVision.git
   cd CineVision

   sudo kubectl apply -f k8s/server-deployment.yaml
   sudo kubectl apply -f k8s/ingress.yaml
   ```

3. **Check status:**
   ```bash
   sudo kubectl get pods -w
   ```
   Wait for the `cinevision-server` pod to show **Running**.

4. **Verify:** Open your browser to `http://YOUR_EC2_PUBLIC_IP/api/health`.
   It should return `{"success": true, "status": "ok"}`!

# Step 18.3: AWS EC2 + K3s Infrastructure Setup Guide (2026 Edition)

This guide walks you through provisioning your AWS EC2 Free Tier server and
installing K3s (Lightweight Kubernetes) using modern 2026 standards. We prioritize
security and performance for a low-RAM (1GB) environment.

---

## Part 1: Provisioning the EC2 Instance (Ubuntu 24.04 LTS)

We will use **Ubuntu 24.04 LTS (Noble Numbat)** which features a more modern kernel
(v6.8+) optimized for container workloads.

### 1.1 Launch an EC2 Instance
1. Go to the AWS Console: https://console.aws.amazon.com/ec2
2. Click **"Launch instance"**.
3. **Name:** `cinevision-prod`
4. **AMI:** Select **Ubuntu Server 24.04 LTS (HVM)**
   - *Architecture:* 64-bit (x86)
5. **Instance type:** `t3.micro` or `t2.micro` (Free Tier eligible)
6. **Network settings (Security Group):**
   - Click "Edit" and configure inbound rules:
     - **HTTP (Port 80):** Source `0.0.0.0/0`
     - **HTTPS (Port 443):** Source `0.0.0.0/0`
     - **Custom TCP (Port 6443):** Source `0.0.0.0/0` (Kubernetes API - for GitHub Actions)
     - *Note: We intentionally do NOT open Port 22 (SSH) for security.*
7. **Advanced Details → IAM instance profile:**
   - Create and attach an IAM role that has the `AmazonSSMManagedInstanceCore` policy.
   - *Why?* This allows us to connect securely via the browser using AWS Systems Manager (Session Manager) without managing SSH keys locally.
8. Click **"Launch instance"**.

---

## Part 2: Connect Securely via AWS Systems Manager (SSM)

By using SSM, we avoid the security risks of public SSH ports and `.pem` key files.

1. Go to your **EC2 Instances** list. Wait for `cinevision-prod` to show "Running".
2. Select the instance, click **"Connect"** at the top right.
3. Switch to the **"EC2 Instance Connect"** tab or **"Session Manager"** tab.
4. Click **"Connect"**. A browser-based terminal opens.
5. You are connected as `ssm-user` or `ubuntu`. Run:
   ```bash
   sudo su - ubuntu
   ```
   You are now logged in as the primary user.

---

## Part 3: Install K3s (Optimized for 1GB RAM)

Standard Kubernetes requires 2GB+ of RAM. **K3s** is perfect here, but in 2026,
even its default components (like heavy metrics servers and Local-Path provisioners)
can choke a 1GB `t3.micro`. We will install a highly stripped-down K3s build.

Run this command in your browser terminal:

```bash
curl -sfL https://get.k3s.io | sh -s - server \
  --disable servicelb \
  --disable metrics-server \
  --disable local-storage \
  --kubelet-arg="eviction-hard=memory.available<50Mi,nodefs.available<10%"
```

> **Why these flags?**
> - `--disable servicelb`: We use Traefik's internal networking instead.
> - `--disable metrics-server`: Saves ~100MB of RAM; we aren't using HPA (Horizontal Pod Autoscaler).
> - `--disable local-storage`: We aren't attaching persistent volumes yet.
> - `--kubelet-arg`: Prevents K3s from panic-killing pods when RAM hits 95%; gives us more breathing room.

### Verify the installation:
```bash
# Check the node status
sudo kubectl get nodes

# You should see 'Ready' with VERSION showing v1.31+ or newer
```

---

## Part 4: Configure GitHub Actions Access

GitHub needs to talk to your cluster. We will securely export the Kubeconfig file.

### 4.1 Retrieve the Kubeconfig
Run on the server:
```bash
sudo cat /etc/rancher/k3s/k3s.yaml
```

Copy the entire output.

### 4.2 Add it to GitHub Secrets
1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**.
2. Click **"New repository secret"**.
3. **Name:** `KUBE_CONFIG`
4. **Value:** Paste the content you copied.
5. **CRITICAL EDIT:** Inside the pasted value, change this line:
   ```yaml
   server: https://127.0.0.1:6443
   ```
   To use your EC2 instance's **Public IPv4 address**:
   ```yaml
   server: https://YOUR_EC2_PUBLIC_IP:6443
   ```
6. Click **"Add secret"**.

*(Note: In an enterprise setting, you would use AWS OIDC (OpenID Connect) for passwordless authentication, but for a solo Free-Tier project, a protected `KUBE_CONFIG` secret is perfectly acceptable).*

---

## Part 5: Inject Application Secrets (The 2026 Way)

We need to provide MongoDB, AWS S3, and Gemini API keys to the cluster.
Instead of committing Base64 strings, we apply them directly to the cluster once,
or configure GitHub Actions to inject them dynamically.

For this first manual setup, generate the Secret locally via CLI and pipe it directly to K3s:

### 5.1 Create the Secret manually
In your instance terminal, carefully paste and run this (replace the placeholders with real values!):

```bash
sudo kubectl create secret generic cinevision-secrets \
  --from-literal=MONGODB_URI="mongodb+srv://..." \
  --from-literal=JWT_SECRET="your_long_secure_string_here" \
  --from-literal=AWS_ACCESS_KEY_ID="AKIA..." \
  --from-literal=AWS_SECRET_ACCESS_KEY="wJalr..." \
  --from-literal=AWS_REGION="ap-south-1" \
  --from-literal=AWS_S3_BUCKET="cinevision-bucket-name" \
  --from-literal=GEMINI_API_KEY="AIza..." \
  --from-literal=CLIENT_URL="http://YOUR_EC2_PUBLIC_IP"
```

Verify it exists:
```bash
sudo kubectl describe secret cinevision-secrets
```

---

## Part 6: First Smoke Test Deployment

Before building our CI/CD pipeline, let's verify the cluster can pull and run your Docker images.

1. Ensure you pushed `fawaz482/cinevision-server:latest` to Docker Hub.
2. Clone your repo directly onto the EC2 instance for this quick test:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO
   ```
3. Apply the manifests:
   ```bash
   sudo kubectl apply -f k8s/server-deployment.yaml
   sudo kubectl apply -f k8s/ingress.yaml
   ```
4. Watch the pods spin up:
   ```bash
   sudo kubectl get pods -w
   ```
5. Once it says `Running`, your API is live! You can test it by going to `http://YOUR_EC2_PUBLIC_IP/api/health` in your browser.

---

## Troubleshooting (Modern Checks)

- **CrashLoopBackOff for server:** Check logs with `sudo kubectl logs deployment/cinevision-server`. Usually means the `MONGODB_URI` or `JWT_SECRET` in the Secret is wrong/missing.
- **OOMKilled:** The server ran out of memory. Ensure you used the `--disable metrics-server` flags in Part 3.
- **Traefik 404:** Traefik ingress controller takes ~60 seconds to detect new rules. Wait a minute and refresh the page.

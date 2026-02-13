# SendStores


--------------------------------------------------------------------------------
Kubernetes-Native Multi-Store Control Plane
A simplified control plane for provisioning isolated, on-demand e-commerce stores using Kubernetes and Helm.
📖 Overview
This project implements a Kubernetes-native architecture to provision, manage, and tear down isolated WordPress + WooCommerce instances. Unlike standard multi-site installations, this system leverages namespace-level isolation, ensuring each store runs as a distinct set of workloads with its own database, persistent storage, and networking rules.
The core goal is to demonstrate a production-aligned "SaaS" pattern where a Node.js backend orchestrates Helm charts to create ephemeral or permanent store environments without manual intervention.

--------------------------------------------------------------------------------
✨ Features
• Namespace Isolation: Each store is deployed into its own Kubernetes namespace, ensuring hard isolation for secrets, volumes, and networking.
• Helm as the Contract: Uses a single Helm chart for all deployments. Environment differences (Local vs. Prod) are handled strictly via values.yaml files—no duplicated manifests.
• Automated Lifecycle: A Node.js backend handles the creation (Helm install), state tracking (Redis), and destruction (Helm uninstall) of stores.
• Persistence: Each store is provisioned with dynamic Persistent Volume Claims (PVCs) for both the MySQL database and WordPress content.
• Ingress-Ready: Automatically configures Ingress rules to expose stores on unique subdomains (e.g., store-id.localtest.me).
• Deterministic Bootstrapping: Solves the "empty WordPress" problem by executing wp-cli commands directly within the runtime context.

--------------------------------------------------------------------------------
👤 User Stories
1. The "One-Click" Provisioning Story
    ◦ As a platform operator, I want to click "Create Store" via an API or Dashboard, so that a fully functional WooCommerce store is generated with a unique URL, requiring no manual installation steps.
2. The Isolation Story
    ◦ As a tenant, I need my store's database and files to be completely separate from other stores, so that a security breach or configuration error in one store does not affect mine.
3. The Clean Teardown Story
    ◦ As a developer, I want to be able to delete a store and have all associated resources (PVCs, Secrets, Services) removed immediately to prevent resource leaks in the cluster.

--------------------------------------------------------------------------------
🏗 Architecture
The system allows a Control Plane (running outside the cluster or in a management namespace) to orchestrate a Data Plane (the stores).
1. Control Plane (Node.js + Redis)
• Backend: Accepts POST /stores requests. It generates a unique Store ID and maps it to a Kubernetes Namespace.
• State Store (Redis): Acts as the single source of truth for "Control Plane Intent" (e.g., is the store provisioning, ready, or failed?).
• Orchestration: Wraps the Helm CLI to execute helm install and helm uninstall commands programmatically.
2. Data Plane (Kubernetes)
For every store created, the system spins up the following inside a dedicated namespace:
• MySQL: StatefulSet with dedicated PVC.
• WordPress: Deployment running a custom image.
• Networking: ClusterIP Service and Ingress Controller routing.
• Secrets: Auto-generated database credentials.


![alt text](public/Dashboard.png)



![alt text](public/docker.png)


--------------------------------------------------------------------------------
🔧 Engineering Challenges & Solutions
The "Bootstrapping" Problem
The Issue: Initially, provisioning a store resulted in a WordPress instance displaying the "Language Selection" and "Install" screen. Helm Hooks using wp-cli Jobs failed due to race conditions and filesystem mismatches between the Job container and the main WordPress container.
The Solution: We moved the bootstrapping logic inside the runtime.
1. Custom Image: Built a WordPress image that includes the wp-cli binary.
2. Post-Install Exec: The backend triggers kubectl exec commands after the Pod is running. This ensures wp-cli operates on the exact same filesystem and PHP environment as the live site, guaranteeing a fully installed WooCommerce storefront upon first visit.

--------------------------------------------------------------------------------
🚀 Installation & Setup
Prerequisites
• Kubernetes Cluster (Minikube, Kind, or Docker Desktop)
• Helm 3+ installed locally.
• Node.js (v18+) & Redis running locally or accessible via URL.
• Ingress Controller (e.g., NGINX) enabled on your cluster.
1. Clone & Dependencies
```bash
git clone https://github.com/JVSCHANDRADITHYA/SendStores
cd SendStores
```
# Install Backend Dependencies
```
cd backend
npm install
```
2. Start Redis
Ensure Redis is running locally (default port 6379):
```
docker run -d -p 6379:6379 redis
```
3. Configure Kubernetes Context
Ensure your kubectl is pointing to your desired cluster:
```
kubectl config current-context
```
4. Run the Control Plane

# In the /backend directory
```
npm start
```
The server will start at http://localhost:3000 (or your configured port).
5. Create a Store
You can use curl or the included Dashboard UI (if running):
```
curl -X POST http://localhost:3000/stores \
  -H "Content-Type: application/json" \
  -d '{"name": "My Demo Store"}'
```
The system will:
1. Generate a Store ID (e.g., store-xyz).
2. Create namespace store-xyz.
3. Install the Helm chart.
4. Bootstrap WordPress and WooCommerce.
5. Return a URL: http://store-xyz.localtest.me.

--------------------------------------------------------------------------------
🔮 Future Roadmap
• Production Hardening: Move the manual kubectl exec bootstrapping into a Kubernetes Operator or a refined Init Container pattern.
• GenAI Management Agent: implementing a Generative AI agent capable of summarizing store status, detailing configuration, and performing management actions via natural language prompts.
• Chart Publication: Releasing the finalized, bootstrap-ready Helm chart to a public repository.

--------------------------------------------------------------------------------

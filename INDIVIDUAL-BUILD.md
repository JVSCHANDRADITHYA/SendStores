### Install Backend Dependencies
```
cd backend
npm install
```
### Start Redis
Ensure Redis is running locally (default port 6379):
```
docker run -d -p 6379:6379 redis
```
### Configure Kubernetes Context
Ensure your kubectl is pointing to your desired cluster:
```
kubectl config current-context
```
### Run the Control Plane

### In the /backend directory
```
npm start
```
The server will start at http://localhost:4000 (or your configured port).
### Create a Store
You can use curl or the included Dashboard UI (if running):
```
curl -X POST http://localhost:4000/stores \
  -H "Content-Type: application/json" \
  -d '{"name": "My Demo Store"}'
```
The system will:
1. Generate a Store ID (e.g., store-xyz).
2. Create namespace store-xyz.
3. Install the Helm chart.
4. Bootstrap WordPress and WooCommerce.
5. Return a URL: http://store-xyz.localtest.me.
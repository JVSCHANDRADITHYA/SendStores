System Design & Tradeoffs
Architecture Choice

The system is designed as a Kubernetes-native control plane + data plane architecture.

A backend API acts as the control plane and is responsible only for orchestration.

Helm is used as the single deployment mechanism to ensure consistency between local and production environments.

Each store is deployed into its own Kubernetes namespace, providing strong isolation at the resource, network, and lifecycle level.

Application workloads (WordPress, MySQL) run entirely inside Kubernetes using standard primitives:

MySQL as a StatefulSet with a PVC

WordPress as a Deployment

Services and Ingress for networking

A lightweight Redis control-plane database is used to track store metadata and provisioning status. Redis does not store application data.

This separation ensures:

Clear ownership boundaries (control vs workload)

Reproducibility via Helm

Easy portability from local Kubernetes to production clusters

Idempotency, Failure Handling & Cleanup

Idempotency

Store creation is idempotent at the control-plane level.

Store metadata is written to Redis before provisioning begins, allowing UI state to reflect in-progress operations.

Helm installs are deterministic given the same release name and namespace.

Failure Handling

Provisioning is treated as asynchronous.

If Helm installation fails:

Store status is updated to Failed in Redis

Partial Kubernetes resources can be safely cleaned up

Application bootstrap (e.g., WordPress setup) is intentionally decoupled from infrastructure provisioning to avoid fragile coupling.

Cleanup

Deleting a store triggers:

helm uninstall <release>

Namespace deletion

Redis metadata cleanup

Namespace-per-store ensures no orphaned resources remain.

Cleanup is safe to retry and does not depend on workload health.

This design favors explicit lifecycle control over hidden automation.

Production Considerations & Changes

The same Helm charts are usable in production with environment-specific values.

DNS & Ingress

Local development uses *.localtest.me

Production would use real DNS (Route53 / Cloudflare)

Ingress annotations change based on ingress controller (NGINX / Traefik / cloud LB)

Storage

Local clusters use default storage classes

Production would specify:

SSD-backed storage classes

Backup-enabled PVCs

Optional ReadWriteMany for shared assets if required

Secrets

Local secrets are Kubernetes Secret objects

Production should integrate:

External secret managers (AWS Secrets Manager / Vault)

Sealed Secrets or External Secrets Operator

# Security & Hardening

NetworkPolicies for namespace isolation

Resource limits and quotas per store

PodSecurity standards enforced

RBAC restrictions on control-plane API

# Key Tradeoffs

Simplicity over over-automation: Infrastructure is solid before automating application bootstrap.

Isolation over density: Namespace-per-store is more expensive but far safer.

Helm over custom controllers: Easier to reason about, debug, and deploy under time constraints.

This system prioritizes correctness, isolation, and reproducibility, making it suitable for both local experimentation and production extension.
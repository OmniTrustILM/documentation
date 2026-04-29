---
sidebar_position: 5
---

# Local Environment Setup

This guide walks you through setting up the ILM platform locally using Docker Compose. By the end, you will have a fully running platform with all core services, a registered administrator, a working UI at `localhost:5173`, and a verified API connection — ready for writing automation tests.

## Prerequisites

Make sure the following are installed before you begin:

- **Docker Desktop** — [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/). After installing, start it and wait until the Docker icon in the system tray stops animating.
- **Git** — verify with `git --version` in the terminal.
- **Node.js 18+** — verify with `node --version`. Download from [nodejs.org](https://nodejs.org/).

Verify Docker is running:

```bash
docker ps
```

If you see an error about the Docker daemon, Docker Desktop is not started yet.

## Step 1 — Create a working directory and clone repositories

Create a directory to hold all required repositories:

```bash
mkdir ~/ilm-local && cd ~/ilm-local
```

Clone the environment configuration repository:

```bash
git clone https://github.com/OmniTrustILM/development-environment.git
```

Clone the three services that are built from source. The folder names must match exactly as shown — the repositories were renamed, but `czertainly-compose.yml` build paths still reference the original `CZERTAINLY-*` names:

```bash
git clone https://github.com/OmniTrustILM/auth.git CZERTAINLY-Auth
git clone https://github.com/OmniTrustILM/auth-opa-policies.git CZERTAINLY-Auth-OPA-Policies
git clone https://github.com/OmniTrustILM/scheduler.git CZERTAINLY-Scheduler
```

Clone the Administrator frontend:

```bash
git clone https://github.com/OmniTrustILM/fe-administrator.git
```

Your directory structure should look like this:

```
ilm-local/
├── development-environment/
├── CZERTAINLY-Auth/
├── CZERTAINLY-Auth-OPA-Policies/
├── CZERTAINLY-Scheduler/
└── fe-administrator/
```

All other services (Core, RabbitMQ, OPA, PostgreSQL) use pre-built public images and do not require source repositories.

## Step 2 — Configure environment variables

```bash
cd ~/ilm-local/development-environment
cp .env.example .env
```

Open `.env` in any text editor and update `CZERTAINLY_SOURCES_BASE_DIR` to point to your working directory:

```env
# macOS:  /Users/yourname/ilm-local
# Linux:  /home/yourname/ilm-local
CZERTAINLY_SOURCES_BASE_DIR=<absolute path to ilm-local>
```

All other values can be left at their defaults when using PostgreSQL in Docker.

:::note
On macOS, files starting with `.` are hidden in Finder. Use `Cmd + Shift + .` to toggle their visibility, or edit them from the terminal.
:::

## Step 3 — Set up the trusted certificates file

The Docker Compose setup requires this file to exist before starting, even if it is empty:

```bash
touch secrets/trusted_certificates.pem
```

For authenticating with the dummy administrator certificate (used in development), add the ILM Dummy Root CA to this file:

```bash
curl -s https://raw.githubusercontent.com/OmniTrustILM/helm-charts/main/dummy-certificates/certs/root-ca.cert.pem \
  | grep -A 100 "BEGIN CERTIFICATE" \
  >> secrets/trusted_certificates.pem
```

:::important
Without the Dummy Root CA in this file, the Auth service will reject the dummy administrator certificate with `User client certificate is invalid`.
:::

## Step 4 — Start the platform

```bash
docker compose -f czertainly-compose.yml -f postgres-compose.yml \
  --profile database --profile core up --build
```

The `--build` flag tells Docker to build the three source-based services on first run. This takes **10–20 minutes** the first time. Subsequent starts are much faster.

To run in the background (detached mode):

```bash
docker compose -f czertainly-compose.yml -f postgres-compose.yml \
  --profile database --profile core up --build -d
```

## Step 5 — Verify all services are running

```bash
docker compose -f czertainly-compose.yml -f postgres-compose.yml ps
```

All services should show status `healthy` or `Up`:

| Service | Host port | Description |
|---|---|---|
| `postgres` | 2345 | PostgreSQL database |
| `rabbitmq` | 5672 / 15672 | Message queue (UI at [localhost:15672](http://localhost:15672), login: `guest`/`guest`) |
| `opa` | 8181 | Open Policy Agent |
| `opa-bundles` | 8101 | OPA policy bundle server |
| `auth` | 8100 | Authentication service |
| `scheduler` | 8102 | Task scheduler |
| `core` | 8280 | Core API |

Confirm the Core API is up:

```bash
curl http://localhost:8280/api/v1/health/liveness
# Expected: {"status":"UP"}
```

## Step 6 — Create the first administrator

The platform uses X.509 certificate-based authentication. To register the first administrator, use the Local API.

:::important
The Local API is only accessible from **within the Core container**. Calling it directly from the host machine (e.g. `localhost:8280`) returns HTTP 401. Use `docker exec` as shown below.
:::

Save the administrator payload to a file:

```bash
cat > /tmp/first-admin.json << 'EOF'
{
  "username": "admin",
  "firstname": "Admin",
  "lastname": "Local",
  "email": "admin@local.test",
  "certificateData": "REPLACE_WITH_CERT_BASE64",
  "enabled": "true",
  "description": "First Administrator"
}
EOF
```

Get the dummy administrator certificate (base64-encoded DER):

```bash
curl -s https://raw.githubusercontent.com/OmniTrustILM/helm-charts/main/dummy-certificates/certs/admin.cert.pem \
  | grep -A 999 "BEGIN CERTIFICATE" | grep -v "BEGIN\|END" | tr -d '\n' \
  > /tmp/admin_cert_b64.txt
```

Update the payload with the certificate value:

```bash
CERT_B64=$(cat /tmp/admin_cert_b64.txt)
sed -i.bak "s|REPLACE_WITH_CERT_BASE64|$CERT_B64|" /tmp/first-admin.json
```

Copy the file into the container and register the administrator:

```bash
docker cp /tmp/first-admin.json core:/tmp/first-admin.json

docker exec core curl -s -X POST \
  -H 'content-type: application/json' \
  -d @/tmp/first-admin.json \
  http://localhost:8080/api/v1/local/admins
```

A successful response returns a JSON object with the administrator's `uuid` and role `superadmin`.

## Step 7 — Verify API authentication

The platform authenticates API requests using the `ssl-client-cert` header. The certificate value must be **URL-encoded** — plain Base64 will fail because `+` characters are interpreted as spaces.

Generate the URL-encoded certificate:

```bash
CERT_URL=$(python3 -c "
import urllib.parse
print(urllib.parse.quote(open('/tmp/admin_cert_b64.txt').read().strip()))
")
```

Verify authentication:

```bash
curl -s http://localhost:8280/api/v1/auth/profile \
  -H "ssl-client-cert: $CERT_URL" | python3 -m json.tool
```

A successful response returns your administrator profile with role `superadmin` and a full list of permissions.

## Step 8 — Start the Administrator frontend

The frontend is a separate Vite dev server that proxies API requests to the Core backend.

Install dependencies:

```bash
cd ~/ilm-local/fe-administrator
npm install
```

Create the proxy configuration file at `src/setupProxy.js`. This tells Vite to forward all `/api` requests to the Core backend and authenticate them with the dummy administrator certificate:

```bash
curl -s https://raw.githubusercontent.com/OmniTrustILM/helm-charts/main/dummy-certificates/certs/admin.cert.pem \
  | grep -A 999 "BEGIN CERTIFICATE" | grep -v "BEGIN\|END" | tr -d '\n' \
  > /tmp/admin_cert_b64.txt

CERT_URL=$(python3 -c "
import urllib.parse
print(urllib.parse.quote(open('/tmp/admin_cert_b64.txt').read().strip()))
")

cat > src/setupProxy.js << EOF
const proxyConfig = {
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8280',
                changeOrigin: true,
                secure: false,
                headers: {
                    'ssl-client-cert': '${CERT_URL}',
                },
            },
        },
    },
};

export default proxyConfig;
EOF
```

Start the frontend:

```bash
npm start
```

The browser will open automatically at **http://localhost:5173**. Log in — the dummy administrator certificate is already injected via the proxy, so no login form is required.

:::important
The `src/setupProxy.js` file is gitignored. Each developer creates their own local copy with their certificate. Do not commit this file.
:::

## Step 9 — Stop the platform

Stop the frontend with `Ctrl+C` in its terminal.

Stop all backend services:

```bash
cd ~/ilm-local/development-environment

docker compose -f czertainly-compose.yml -f postgres-compose.yml \
  --profile database --profile core down
```

Data in the database is persisted in the `./data/` directory. To reset the platform to a clean state, remove this directory before the next start.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `docker ps` fails with daemon error | Docker Desktop not started | Start Docker Desktop and wait for the icon to stop animating |
| `docker compose up` fails on secrets mount | `secrets/trusted_certificates.pem` does not exist | Run `touch secrets/trusted_certificates.pem` |
| Auth returns `User client certificate is invalid` | Dummy Root CA not in trusted certs | Add Root CA to `secrets/trusted_certificates.pem` and restart auth: `docker compose ... restart auth` |
| Local API returns HTTP 401 from host | Local API is container-only | Use `docker exec core curl ...` instead of calling `localhost:8280` directly |
| Authentication returns `Wrong format of user authentication certificate` | Certificate not URL-encoded | Use `urllib.parse.quote()` to URL-encode the certificate before sending |
| `CZERTAINLY_SOURCES_BASE_DIR` not found | Wrong path in `.env` | Set the full absolute path to the directory containing `CZERTAINLY-Auth`, `CZERTAINLY-Auth-OPA-Policies`, `CZERTAINLY-Scheduler` |
| Frontend shows blank page or API errors | `setupProxy.js` missing or wrong cert | Recreate `src/setupProxy.js` following Step 8 |
| Frontend port 5173 already in use | Another Vite process running | Kill it with `lsof -ti:5173 \| xargs kill` |

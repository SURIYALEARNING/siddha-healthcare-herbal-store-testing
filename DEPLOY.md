# Deployment - Siddha Healthcare Herbal Store (same VPS as PDF generator)

Both docker apps run side by side on one VPS. HTTPS is handled by a host-level
nginx reverse proxy that owns ports 80/443 and routes each domain to its own
app nginx container by internal port.

```
Internet
  └─ nginx on VPS (80/443, SSL via certbot)   <-- deploy/host-nginx.conf
       ├─ lhccpdf.lakshmihealthcarecentrerockfort.com  -> 127.0.0.1:8081  (PDF nginx, docker)
       └─ store.lakshmihealthcarecentrerockfort.com    -> 127.0.0.1:8080  (Store nginx, docker)
```

## Ports used on the VPS

| Port | Owner |
|------|-------|
| 80, 443 | Host nginx (apt package) + certbot SSL |
| 8081 | PDF app nginx container (was 80/443) |
| 8080 | Store app nginx container |
| 27017, 4000, 5000 | Internal only (docker networks) |

The PDF project's `mongodb_data` and `uploads` docker volumes are NOT touched.
Only the PDF nginx container moves from ports 80/443 to 8081.

## 1. Push both projects to GitHub (separate repos)

Each project is pushed to its own repo. Secrets are never committed
(`.env*` is git-ignored).

## 2. On the VPS - pull and start the PDF app first

```bash
cd /srv/pdf            # or wherever you keep it
git pull
docker compose up -d --build
# nginx now listens on 8081 instead of 80/443 (few seconds downtime)
```

## 3. On the VPS - pull and start the Store app

```bash
cd /srv/store          # or wherever you keep it
git pull
cp .env.example .env   # then fill in real values
docker compose up -d --build
```

Check it works over HTTP before adding SSL:

```bash
curl -I http://127.0.0.1:8080   # store nginx (expect 200)
curl -I http://127.0.0.1:8081   # pdf nginx (expect 200)
```

## 4. Install host-level nginx + SSL

Make sure your A records for both domains point to this VPS IP.

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

sudo cp deploy/host-nginx.conf /etc/nginx/sites-available/lhcc
sudo ln -sf /etc/nginx/sites-available/lhcc /etc/nginx/sites-enabled/lhcc
sudo nginx -t
sudo systemctl reload nginx

# Issue/renew SSL for both domains (adds the 443 blocks automatically)
sudo certbot --nginx -d lhccpdf.lakshmihealthcarecentrerockfort.com -d store.lakshmihealthcarecentrerockfort.com

sudo systemctl restart nginx
```

## 5. Verify

- https://lhccpdf.lakshmihealthcarecentrerockfort.com  (PDF app - unchanged)
- https://store.lakshmihealthcarecentrerockfort.com    (Store app)

## Notes / gotchas

- Store backend reads `MONGODB_ATLES` (MongoDB Atlas). There is no bundled mongodb.
- Store frontend API base URL is `/` in production (same origin). The store
  nginx proxies `/api/` and `/auth/` to the backend container.
- PDF app keeps its own nginx and volume configs; only the host port moved to 8081.
- When you buy the new VPS for the store later, you only need this repo +
  ports 80/443 + a host or app nginx with SSL - the store stack is self-contained.

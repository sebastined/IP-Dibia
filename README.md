
```markdown
# 🕵️‍♂️ IP-Dibia

**IP-Dibia** is a simple full-stack app that analyzes a visitor’s IP address, enriches it with threat intelligence data (proxy, VPN, fraud score, etc.), and displays the report beautifully.

Built with:
- **React** (frontend UI)
- **Express.js** (backend API)
- **Node.js**
- **Jenkins CI/CD** (Kaniko, SonarQube, kubectl)
- **Kubernetes** (deployed via YAML)
- **Cloudflare Tunnel** for public HTTPS exposure

---

## 🚀 Features

- Detects visitor’s public IP automatically  
- Enriches IP data using multiple APIs (IPInfo, IPQS, AbuseIPDB, etc.)  
- Displays detailed info in a clean table  
- Works on both internal (`.int.sebastine.ng`) and public (`.sebastine.ng`) domains  
- Deployed on Kubernetes with automated build & deploy via Jenkins pipeline  

---

## 🧱 Project Structure

```

IP-Dibia/
├── back/                 # Express.js backend
│   ├── server.js
│   ├── enricher.js
│   ├── .env
│   └── Dockerfile
├── front/                # React frontend
│   ├── src/
│   │   └── App.jsx
│   ├── public/
│   └── package.json
├── Jenkinsfile
└── README.md

````

---

## ⚙️ Backend (Express.js)

**server.js**
- Serves `/api/visit-report`
- Detects client IP (supports proxy headers)
- Uses `enricher.js` to gather data from various APIs
- Responds with a structured JSON report

**To run locally:**
```bash
cd back
npm install
npm run dev
````

Then open your browser at [http://localhost:3000](http://localhost:3000).

---

## 💻 Frontend (React)

The UI provides a simple dashboard to view your IP report.

**Development:**

```bash
cd front
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

---

## 🧩 Environment Variables

Create a `.env` file in `/back`:

```env
IPINFO_TOKEN=your_ipinfo_token
ABUSEIPDB_KEY=your_abuseipdb_key
IPQS_KEY=your_ipqs_key
PORT=3000
```

---

## 🐳 Docker

**Build locally:**

```bash
docker build -t ip-dibia:latest .
docker run -p 3000:3000 ip-dibia:latest
```

---

## ☸️ Kubernetes Deployment

Deployed automatically by Jenkins using Kaniko and kubectl.

**Service (example):**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: ip-dibia-svc
spec:
  ports:
    - port: 3000
      targetPort: 3000
  selector:
    app: ip-dibia
  type: ClusterIP
```

**Ingress (Traefik):**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ip-dibia-ing
  annotations:
    kubernetes.io/ingress.class: traefik
spec:
  ingressClassName: traefik
  tls:
    - hosts:
        - ip-dibia.int.sebastine.ng
        - ip-dibia.sebastine.ng
      secretName: int-wildcard
  rules:
    - host: ip-dibia.int.sebastine.ng
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ip-dibia-svc
                port:
                  number: 3000
    - host: ip-dibia.sebastine.ng
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ip-dibia-svc
                port:
                  number: 3000
```

---

## 🌍 Cloudflare Tunnel (Public Access)

To expose your internal Kubernetes service securely:

```bash
cloudflared tunnel route dns ip-dibia ip-dibia.sebastine.ng
```

This maps your internal `ip-dibia-svc` to the public domain.

Ensure CORS in `server.js` allows both origins:

```js
app.use(cors({
  origin: [
    'https://ip-dibia.int.sebastine.ng',
    'https://ip-dibia.sebastine.ng'
  ]
}));
```

---

## 🔁 Jenkins Pipeline Overview

The pipeline:

1. Checks out code from GitHub
2. Runs **SonarQube analysis**
3. Builds & pushes image with **Kaniko** to Harbor
4. Deploys to Kubernetes namespace `dev00`
5. Exposes via **Traefik Ingress**
6. Automatically rolls out updates

See [`Jenkinsfile`](./Jenkinsfile) for full configuration.

---

## 🧠 Troubleshooting

| Issue                            | Cause                 | Fix                                             |
| -------------------------------- | --------------------- | ----------------------------------------------- |
| ❌ `Failed to fetch report`       | CORS or wrong domain  | Add correct origin in backend CORS              |
| 🔒 `Invalid API key`             | Missing API keys      | Check `.env` file                               |
| 🌀 `Service not reachable`       | Ingress misconfigured | Verify DNS + Traefik routes                     |
| 🌍 Cloudflare tunnel not working | Tunnel misrouted      | Run `cloudflared tunnel info` and check mapping |

---

## 🧾 License

MIT License © 2025 [Sebastine N.]

---

## 💬 Author

**Sebastine Nnanemere.**



Railway deployment guide

Quick steps to deploy `server.js` to Railway and connect the frontend.

1) Push repo to GitHub (if not already)

```bash
git init
git add .
git commit -m "Initial"
# create repo on GitHub then:
git remote add origin git@github.com:YOUR_USER/YOUR_REPO.git
git branch -M main
git push -u origin main
```

2) Create Railway project (web UI)
- Go to https://railway.app and sign up / log in.
- Click "New Project" -> "Deploy from GitHub".
- Choose your repository and the folder (root) that contains `package.json`.
- Railway will detect a Node.js service and start a build.

3) Configure environment variables in Railway project settings
- SMTP_HOST
- SMTP_PORT (usually 587)
- SMTP_USER
- SMTP_PASS
- SMTP_FROM (e.g. "Moi <me@example.com>")
- DEFAULT_TO_EMAIL (recipient address)

4) Deploy and get the public URL
- After deployment Railway provides a domain like `https://my-app.up.railway.app`.
- Copy that URL.

5) Update the frontend to call the deployed backend
- Option A (quick): edit `script.js` and replace the placeholder
  `https://REPLACE_WITH_YOUR_RAILWAY_URL` in the `PROD_BACKEND` constant with your Railway URL.
- Option B (better): host frontend on the same domain or use a proxy.

6) Test from an external device
- Open the frontend (GitHub Pages or local served file) and perform a reservation.
- Monitor Railway logs (Project -> Deployments -> Logs) for transport errors.

Notes
- Railway automatically sets `PORT` for the Node process; `server.js` already uses `process.env.PORT`.
- Keep SMTP credentials secret; set them only in Railway environment variables.

Troubleshooting
- If SMTP fails, check credentials and provider restrictions (Gmail needs App Password or OAuth).
- If you use GitHub Pages, update `PROD_BACKEND` in `script.js` or point the frontend to the Railway URL.

If you want, I can:
- Commit the `PROD_BACKEND` replacement for you once you give me the Railway URL, or
- Walk you through the Railway web UI step-by-step.

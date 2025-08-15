# Kryptoken Claim Suite - Proxy Ready

## Backend Proxy Setup (Render.com)
1. Create a new GitHub repo and push the `backend-proxy/` folder there.
2. On Render, create a **New Web Service** from your GitHub repo.
3. Add an Environment Variable:
   - `TENDERLY_TARGET` = https://virtual.binance.eu.rpc.tenderly.co/8aaba2bb-634b-464b-82ac-4527bc9fdf8e
4. Deploy — Render will give you a URL like `https://your-proxy.onrender.com/rpc`.

## Frontend Setup (Netlify)
1. In `frontend/src/config.js`, paste your Render proxy URL into `PROXY_URL`.
2. Build and deploy the frontend folder to Netlify.
3. If `PROXY_URL` is empty, the app will fallback to the direct Tenderly RPC.

---

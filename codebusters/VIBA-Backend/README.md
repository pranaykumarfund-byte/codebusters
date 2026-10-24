# VIBA Backend (Render)

This is the standalone Node.js mock API for the VIBA frontend.

## Deploy to Render

1. Upload this folder's contents to a GitHub repository.
2. In Render, create a Web Service from that repository and use the repository root as the service root.
3. Set the build command to `npm install`, the start command to `npm start`, and the health check path to `/healthz`.
4. After deploying the frontend, set `ALLOWED_ORIGINS` to its exact Vercel site origin, for example `https://your-viba-site.vercel.app` with no trailing slash.

The service requires Node.js 20 or newer. The API uses fictional data stored in memory; state resets when the server restarts. Do not send real patient information.

# VIBA Frontend (Vercel)

This is the standalone VIBA website frontend.

## Deploy to Vercel

1. Upload this folder to its own GitHub repository, or use it as the `frontend` folder in the combined repository.
2. In Vercel, select this folder as the project root.
3. Set the environment variable `VIBA_API_BASE` to your deployed Render backend URL, such as `https://your-viba-api.onrender.com` (no trailing slash).
4. Deploy. Vercel builds the site into `dist/` using the included configuration.

## Local preview

Use a local static web server to preview the site. Set `VIBA_API_BASE` in the generated `api-config.js` to your backend URL if the frontend and backend use different addresses. The API base is intentionally blank by default for same-origin local setups.

The app is a fictional-data prototype. Do not enter real patient information.

# Deployment Guide - BOOTMARK Form Builder on Render

## Quick Deploy to Render

### Prerequisites
- Render account (sign up at https://render.com)
- GitHub repository with your code

### Step 1: Connect Repository to Render

1. Go to Render Dashboard: https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository and branch you want to deploy

### Step 2: Configure Build Settings

Render will automatically detect the `render.yaml` file, or you can configure manually:

**Build Command:**
```bash
npm install && cd public && npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Environment:** Node

### Step 3: Set Environment Variables

In Render Dashboard → Environment → Environment Variables, add:

#### Required Variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-firebase-measurement-id

# JWT Secret (Required)
JWT_SECRET=your-secret-key-change-this-to-something-secure

# Node Environment
NODE_ENV=production
```

#### Optional Variables (for email functionality):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Install dependencies
   - Build the frontend
   - Start the server
3. Your app will be available at: `https://your-app-name.onrender.com`

### Step 5: Update Firebase Settings

1. Go to Firebase Console → Authentication → Settings
2. Add your Render domain to "Authorized domains"
   - Example: `your-app-name.onrender.com`
   - Or your custom domain if configured

3. Update Password Reset Email:
   - Firebase Console → Authentication → Templates
   - Edit "Password reset" template
   - Action URL: `https://your-app-name.onrender.com/reset-password`

## Using render.yaml (Recommended)

If you have a `render.yaml` file in your repository root, Render will automatically use it:

```yaml
services:
  - type: web
    name: phoenix-form-builder
    env: node
    plan: starter
    buildCommand: npm install && cd public && npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      # Add other environment variables in Render dashboard
```

## Project Structure for Render

```
/
├── server.js          # Express server (handles all routes)
├── render.yaml        # Render configuration (optional)
├── routes/            # API routes
├── middleware/        # Auth middleware
├── public/            # Frontend React app
│   ├── src/
│   ├── dist/         # Build output (generated during build)
│   └── package.json
└── data/             # JSON storage (persistent on Render)
```

## How It Works

1. **API Routes** (`/api/*`) → Handled by Express server (server.js)
2. **Share Routes** (`/share/*`) → Handled by Express server
3. **Static Files** → Served from `public/dist` (built during deployment)
4. **SPA Routes** → Served `index.html` (React Router handles routing)

## Build Process

1. Render runs the build command
2. Installs backend dependencies (`npm install`)
3. Installs frontend dependencies (`cd public && npm install`)
4. Builds frontend to `public/dist` (`npm run build`)
5. Starts the server with `npm start`

## Data Storage

Render provides persistent disk storage, so the `data/` directory will persist between deployments. This is different from Vercel which uses `/tmp` for temporary storage.

## Custom Domain

1. In Render Dashboard → Settings → Custom Domains
2. Add your domain
3. Follow DNS configuration instructions
4. Update Firebase authorized domains

## Auto-Deploy

Render automatically deploys when you push to your connected branch (usually `main` or `master`).

## Manual Deploy

1. Go to Render Dashboard
2. Click on your service
3. Click "Manual Deploy" → "Deploy latest commit"

## Environment Variables

- Set in Render Dashboard → Environment → Environment Variables
- Variables starting with `VITE_` are needed for the frontend build
- `JWT_SECRET` is required for authentication
- All variables are encrypted and secure

## Troubleshooting

### Build Fails

- Check build logs in Render Dashboard
- Ensure all dependencies are in `package.json` and `public/package.json`
- Verify Node.js version (Render uses Node 18+ by default)

### API Not Working

- Verify environment variables are set correctly
- Check server logs in Render Dashboard
- Ensure `JWT_SECRET` is set

### Frontend Not Loading

- Check if `public/dist` exists after build
- Verify static file serving in `server.js`
- Check browser console for errors
- Ensure all `VITE_*` environment variables are set

### Port Issues

- Render automatically sets `PORT` environment variable
- Server.js uses `process.env.PORT || 4000`
- No manual port configuration needed

## Production Considerations

1. **Database**: Consider moving from JSON files to:
   - Render PostgreSQL
   - MongoDB Atlas
   - Firebase Firestore

2. **File Storage**: For uploaded images, consider:
   - Firebase Storage
   - AWS S3
   - Cloudinary

3. **Environment Variables**: Never commit `.env` files
   - Use Render's environment variable management

4. **Security**: 
   - Use strong JWT secrets (generate with: `openssl rand -base64 32`)
   - Enable Firebase App Check
   - Set up proper CORS
   - Use HTTPS (automatic on Render)

5. **Performance**:
   - Enable auto-scaling if needed
   - Consider upgrading plan for better performance
   - Monitor logs and metrics in Render Dashboard

## Support

For issues, check:
- Render deployment logs
- Browser console
- Server logs in Render dashboard
- Render status page: https://status.render.com

## Differences from Vercel

1. **Persistent Storage**: Render has persistent disk, so `data/` directory persists
2. **Always-On Service**: Render runs a continuous web service (not serverless)
3. **Build Process**: Build happens once during deployment, not per request
4. **Port**: Render sets `PORT` automatically (usually 10000)
5. **Environment**: Full Node.js environment with file system access

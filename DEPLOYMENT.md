# 🚀 Pixel Arena - Complete Deployment Guide

## Overview

This guide covers deploying both the frontend and backend of Pixel Arena for production use.

**New Structure:**
```
PIXEL_ARENA/
├── frontend/    ← Deploy to Vercel/Netlify
└── backend/     ← Deploy to Railway/Render
```

---

## 📦 Prerequisites

- Node.js v14+ installed
- npm or yarn
- Git
- A hosting account (Vercel, Netlify, Heroku, Railway, etc.)

---

## 🎯 Part 1: Backend Deployment

### Option A: Deploy to Railway (Recommended - Free Tier Available)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   cd backend
   
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial backend commit"
   ```

3. **Connect to Railway**
   - Click "New Project" in Railway dashboard
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - **Important**: Set root directory to `backend`
   - Railway will auto-detect Node.js

4. **Set Environment Variables**
   - In Railway dashboard, go to Variables tab
   - Add:
     ```
     PORT=3000
     JWT_SECRET=your_super_secret_key_here_change_this
     NODE_ENV=production
     ```

5. **Get Your Backend URL**
   - Railway will provide a URL like: `https://your-app.up.railway.app`
   - Copy this URL for frontend configuration

### Option B: Deploy to Heroku

```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create pixel-arena-backend

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open app
heroku open
```

### Option C: Deploy to Render

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables in dashboard
6. Deploy!

---

## 🌐 Part 2: Frontend Deployment

### Step 1: Update Frontend Configuration

Edit `frontend/js/config.js`:

```javascript
const CONFIG = {
  API: {
    BASE_URL: 'https://your-backend-url.railway.app/api',  // ← Your Railway URL
    WS_URL: 'wss://your-backend-url.railway.app',          // ← Your Railway URL (wss not ws)
    USE_MOCK: false,  // ← IMPORTANT: Set to false!
  },
  // ... rest of config
};
```

### Step 2: Deploy Frontend

### Option A: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend folder
cd frontend

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? pixel-arena
# - Directory? ./
# - Override settings? No

# Production deployment
vercel --prod
```

### Option B: Deploy to Netlify

1. **Via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   
   cd frontend
   netlify deploy
   
   # Follow prompts
   # For production:
   netlify deploy --prod
   ```

2. **Via Netlify Dashboard**
   - Go to https://netlify.com
   - Drag and drop your `frontend` folder
   - Done!

### Option C: Deploy to GitHub Pages

1. **Create `deploy.sh` script**:
   ```bash
   #!/bin/bash
   
   # Build (if needed)
   # npm run build
   
   # Deploy to gh-pages branch
   git subtree push --prefix . origin gh-pages
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings
   - Pages section
   - Source: gh-pages branch
   - Save

---

## 🔧 Part 3: Post-Deployment Configuration

### 1. Update CORS Settings

In `backend/server.js`, update CORS:

```javascript
const io = socketIO(server, {
  cors: {
    origin: 'https://your-frontend-url.vercel.app',  // Your frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: 'https://your-frontend-url.vercel.app',
  credentials: true,
}));
```

### 2. Test the Deployment

1. Open your frontend URL
2. Click "Play as Guest"
3. Create a room
4. Open in another browser/incognito
5. Join the room
6. Test gameplay

### 3. Monitor Logs

**Railway:**
- Dashboard → Deployments → View Logs

**Heroku:**
```bash
heroku logs --tail
```

**Vercel:**
- Dashboard → Deployments → Function Logs

---

## 🎮 Part 4: Custom Domain (Optional)

### Frontend (Vercel)

```bash
vercel domains add yourdomain.com
```

Then add DNS records as instructed.

### Backend (Railway)

1. Go to Railway dashboard
2. Settings → Domains
3. Add custom domain
4. Update DNS records

---

## 📊 Part 5: Monitoring & Maintenance

### Add Analytics

**Frontend - Google Analytics:**
Add to `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### Backend Monitoring

**Add PM2 (if using VPS):**
```bash
npm install -g pm2
pm2 start server.js --name pixel-arena
pm2 save
pm2 startup
```

### Health Checks

Set up monitoring with:
- **UptimeRobot** (free)
- **Pingdom**
- **StatusCake**

Monitor: `https://your-backend-url/api/health`

---

## 🐛 Troubleshooting

### Backend Not Responding

1. Check logs for errors
2. Verify environment variables are set
3. Test with: `curl https://your-backend-url/api/health`

### WebSocket Connection Failed

1. Ensure using `wss://` not `ws://` in production
2. Check CORS settings
3. Verify firewall allows WebSocket connections

### Frontend Can't Connect to Backend

1. Check `USE_MOCK` is set to `false`
2. Verify backend URL is correct (with `/api`)
3. Check browser console for errors
4. Verify CORS is configured correctly

---

## 📝 Deployment Checklist

### Before Deployment

- [ ] Update `JWT_SECRET` to a strong random string
- [ ] Set `USE_MOCK: false` in frontend config
- [ ] Update API URLs in frontend config
- [ ] Test locally with production config
- [ ] Remove console.logs (optional)
- [ ] Add error tracking (Sentry, etc.)

### After Deployment

- [ ] Test user registration
- [ ] Test user login
- [ ] Test room creation
- [ ] Test room joining
- [ ] Test character selection
- [ ] Test lobby ready system
- [ ] Test game start
- [ ] Test real-time gameplay
- [ ] Test on mobile devices
- [ ] Set up monitoring
- [ ] Configure custom domain (optional)

---

## 💰 Cost Estimates

### Free Tier Options

**Backend:**
- Railway: 500 hours/month free
- Render: 750 hours/month free
- Heroku: Discontinued free tier (use Railway/Render)

**Frontend:**
- Vercel: Unlimited for personal projects
- Netlify: 100GB bandwidth/month free
- GitHub Pages: Free for public repos

**Total Cost: $0/month** (within free tiers)

### Paid Options (for scaling)

- Railway Pro: $5/month
- Render Standard: $7/month
- Vercel Pro: $20/month
- Custom domain: ~$10-15/year

---

## 🚀 Quick Deploy Commands

```bash
# Backend (Railway)
cd backend
railway login
railway init
railway up

# Frontend (Vercel)
cd ..
vercel --prod

# Done! 🎉
```

---

## 📞 Support

If you encounter issues:
1. Check logs first
2. Review this guide
3. Check Railway/Vercel documentation
4. Test with `USE_MOCK: true` to isolate frontend/backend issues

---

## 🎉 Success!

Your Pixel Arena game is now live and ready for players worldwide!

**Share your game:**
- Frontend URL: `https://your-app.vercel.app`
- Invite friends to play!
- Share on social media

**Next steps:**
- Add more characters
- Implement leaderboards
- Add chat functionality
- Create tournaments
- Monetize (optional)

---

**Happy Gaming! 🎮⚔️**

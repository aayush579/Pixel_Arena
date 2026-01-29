
# 🎮 Pixel Arena - Multiplayer Fighting Game

Complete real-time multiplayer 1v1 fighting game with frontend and backend.

---

## 📁 Project Structure

```
PIXEL_ARENA/
├── frontend/              # Frontend application (deploy to Vercel/Netlify)
│   ├── index.html         # Login page
│   ├── 404.html           # Error page
│   ├── manifest.json      # PWA manifest
│   ├── vercel.json        # Vercel config
│   ├── pages/             # All game pages
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript logic
│   └── assets/            # Images, sounds, sprites
│
├── backend/               # Backend server (deploy to Railway/Render)
│   ├── server.js          # Main server
│   ├── package.json       # Dependencies
│   ├── .env               # Environment variables
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── socket/            # WebSocket handlers
│   └── models/            # Data models
│
└── README.md              # This file
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```

Server runs on: `http://localhost:3000`

### 2. Frontend Setup

```bash
cd frontend
# Open index.html in browser
# OR use a local server:
python -m http.server 8000
```

Frontend runs on: `http://localhost:8000`

---

## 🌐 Deployment

### Deploy Backend (Railway)

```bash
cd backend
railway login
railway init
railway up
```

You'll get: `https://your-app.up.railway.app`

### Deploy Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

You'll get: `https://your-app.vercel.app`

### Update Configuration

After deploying backend, update `frontend/js/config.js`:

```javascript
const CONFIG = {
  API: {
    BASE_URL: 'https://your-backend.up.railway.app/api',
    WS_URL: 'wss://your-backend.up.railway.app',
    USE_MOCK: false,
  },
  // ...
};
```

---

## 📖 Documentation

- **[Frontend README](frontend/README.md)** - Frontend setup and features
- **[Backend README](backend/README.md)** - API documentation
- **[Deployment Guide](DEPLOYMENT.md)** - Full deployment instructions
- **[Pre-Deployment Checklist](PRE_DEPLOYMENT_CHECKLIST.md)** - Before going live

---

## ✨ Features

### Frontend
- 🔐 Authentication (Login/Signup/Guest mode)
- 🏠 Room management dashboard
- 🎭 3 playable characters (Cyborg, Ninja, Warrior)
- 🎪 Lobby with ready system
- 🎮 Real-time multiplayer gameplay
- 🔊 Sound effects with fallback
- 🎨 Cyberpunk design theme
- 📱 Responsive design

### Backend
- 🔌 RESTful API (Express)
- 📡 WebSocket server (Socket.IO)
- 🔒 JWT authentication
- 🏠 Room management
- ⚔️ Real-time game synchronization
- 💚 Health and damage system
- 🏆 Win/lose detection

---

## 🎮 How to Play

1. **Login** or play as guest
2. **Create a room** or join existing one
3. **Select your character** (Cyborg/Ninja/Warrior)
4. **Wait in lobby** for opponent
5. **Click ready** when prepared
6. **Start game** (host only)
7. **Fight!** Use keyboard or on-screen controls

### Controls
- **A/D** - Move left/right
- **K** - Kick attack
- **H** - Hit attack
- **On-screen buttons** - Touch support

---

## 💾 Database

Currently uses **in-memory storage** (data lost on restart).

**To add MongoDB**:
1. Get free MongoDB Atlas account
2. Follow `backend/DATABASE_SETUP.md`
3. Update `backend/models/` files

---

## 🔧 Development

### Frontend Development
```bash
cd frontend
# Edit files in js/, css/, pages/
# Refresh browser to see changes
```

### Backend Development
```bash
cd backend
npm run dev  # Auto-reload with nodemon
```

---

## 📊 Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Canvas API for game rendering
- Web Audio API for sounds
- LocalStorage for session management

**Backend:**
- Node.js + Express
- Socket.IO for WebSockets
- JWT for authentication
- bcrypt for password hashing

---

## 🆓 Hosting (Free Tier)

**Backend:**
- Railway (500 hours/month free)
- Render (750 hours/month free)

**Frontend:**
- Vercel (Unlimited for personal)
- Netlify (100GB bandwidth/month)
- GitHub Pages (Free for public repos)

**Total Cost: $0/month**

---

## 🔒 Security

- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS protection
- ✅ Input validation
- ⚠️ Change JWT_SECRET in production
- ⚠️ Use HTTPS in production

---

## 📝 License

MIT License - Feel free to use for learning and personal projects!

---

## 🎉 Credits

Built with ❤️ for multiplayer gaming

---

## 🐛 Troubleshooting

**Backend won't start:**
- Check Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check port 3000 is free

**Frontend can't connect:**
- Verify `USE_MOCK: false` in config
- Check backend URL is correct
- Verify CORS settings in backend

**Game sprites not loading:**
- Check browser console for errors
- Verify assets folder is in frontend/
- Check file paths in js/game.js

---

## 📞 Support

Check documentation files:
- `DEPLOYMENT.md` - Deployment help
- `PRE_DEPLOYMENT_CHECKLIST.md` - Pre-launch checklist
- `frontend/README.md` - Frontend details
- `backend/README.md` - Backend API docs

---

**Ready to deploy? Follow the deployment guide!** 🚀


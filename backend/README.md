# Pixel Arena Backend

Real-time multiplayer fighting game backend built with Node.js, Express, and Socket.IO.

## 🚀 Features

- **RESTful API** for authentication and room management
- **WebSocket** support for real-time gameplay
- **JWT Authentication** for secure user sessions
- **In-memory storage** (easily replaceable with database)
- **Room management** with host controls
- **Real-time game state** synchronization
- **Health and damage** system
- **Win/lose** detection

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🛠️ Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy .env file and update values
cp .env .env.local
```

4. Start the server:
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── server.js           # Main server file
├── routes/
│   ├── auth.js         # Authentication routes
│   └── rooms.js        # Room management routes
├── middleware/
│   └── auth.js         # JWT authentication middleware
├── socket/
│   └── handlers.js     # Socket.IO event handlers
├── models/
│   └── data.js         # In-memory data storage
├── .env                # Environment variables
└── package.json        # Dependencies
```

## 🔌 API Endpoints

### Authentication

**POST /api/auth/signup**
- Register new user
- Body: `{ username, email, password }`
- Returns: `{ success, data: { user, token } }`

**POST /api/auth/login**
- Login user
- Body: `{ username, password }`
- Returns: `{ success, data: { user, token } }`

**GET /api/auth/me**
- Get current user (protected)
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success, data: user }`

**POST /api/auth/logout**
- Logout user (protected)
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success, message }`

### Rooms

**GET /api/rooms**
- Get all active rooms
- Returns: `{ success, data: [rooms] }`

**POST /api/rooms**
- Create new room (protected)
- Headers: `Authorization: Bearer <token>`
- Body: `{ name }`
- Returns: `{ success, data: room }`

**POST /api/rooms/:id/join**
- Join room (protected)
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success, data: room }`

**DELETE /api/rooms/:id/leave**
- Leave room (protected)
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success, message }`

**GET /api/rooms/:id**
- Get room details
- Returns: `{ success, data: room }`

### Health Check

**GET /api/health**
- Server health check
- Returns: `{ status, timestamp, uptime }`

## 🔌 WebSocket Events

### Client → Server

**authenticate**
- Authenticate socket connection
- Data: `{ userId, username }`

**room:join**
- Join a room
- Data: `{ roomId, userId, username }`

**room:leave**
- Leave current room

**player:ready**
- Set ready status
- Data: `{ roomId, ready }`

**game:start**
- Start game (host only)
- Data: `{ roomId }`

**player:move**
- Send player movement
- Data: `{ roomId, position, facing, state }`

**player:attack**
- Send attack action
- Data: `{ roomId, attackType, position }`

**player:hit**
- Report hit/damage
- Data: `{ roomId, targetId, damage }`

### Server → Client

**authenticated**
- Authentication confirmation
- Data: `{ success }`

**player:joined**
- Player joined room
- Data: `{ userId, username, players }`

**player:left**
- Player left room
- Data: `{ userId, username }`

**room:state**
- Current room state
- Data: `{ room }`

**player:ready**
- Player ready status changed
- Data: `{ userId, username, ready }`

**room:ready**
- All players ready
- Data: `{ room }`

**game:start**
- Game started
- Data: `{ gameSession }`

**player:move**
- Player movement update
- Data: `{ userId, position, facing, state }`

**player:attack**
- Player attack action
- Data: `{ userId, attackType, position, timestamp }`

**player:damaged**
- Player took damage
- Data: `{ targetId, damage, health }`

**game:over**
- Game ended
- Data: `{ winner, loser }`

**host:changed**
- Room host changed
- Data: `{ newHost }`

**error**
- Error message
- Data: `{ message }`

## 🔒 Environment Variables

```env
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

> ⚠️ **Important**: Change `JWT_SECRET` in production!

## 💾 Data Storage

Currently uses **in-memory storage** for:
- Users
- Rooms
- Game sessions
- Socket connections

### Migrating to Database

To use a real database (recommended for production):

1. Install database driver (e.g., MongoDB, PostgreSQL)
2. Replace `models/data.js` with database models
3. Update routes to use database queries
4. Add database connection in `server.js`

Example with MongoDB:
```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
```

## 🧪 Testing

Test the API with curl or Postman:

```bash
# Health check
curl http://localhost:3000/api/health

# Register
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","email":"player1@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"password123"}'

# Get rooms
curl http://localhost:3000/api/rooms
```

## 🚀 Deployment

### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create pixel-arena-backend

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Railway

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

### DigitalOcean / AWS / Azure

1. Set up Node.js server
2. Install dependencies
3. Configure environment variables
4. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name pixel-arena
pm2 save
pm2 startup
```

## 📝 Development Tips

### Auto-reload with Nodemon

```bash
npm run dev
```

### Debugging

Add to `server.js`:
```javascript
if (process.env.NODE_ENV === 'development') {
  app.use(require('morgan')('dev'));
}
```

### CORS Configuration

For production, update CORS settings in `server.js`:
```javascript
const io = socketIO(server, {
  cors: {
    origin: 'https://your-frontend-domain.com',
    methods: ['GET', 'POST'],
  },
});
```

## 🔐 Security Considerations

- ✅ JWT tokens with expiration
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ⚠️ Add rate limiting for production
- ⚠️ Add input validation/sanitization
- ⚠️ Use HTTPS in production
- ⚠️ Implement token refresh mechanism
- ⚠️ Add request logging

## 📊 Monitoring

Add monitoring tools:
- **PM2** for process management
- **Winston** for logging
- **New Relic** or **DataDog** for APM

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

**Socket.IO connection issues:**
- Check CORS settings
- Verify WebSocket support
- Check firewall rules

## 📄 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

**Built with ❤️ for multiplayer gaming**

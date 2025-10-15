# 🎮 Word Chain Game

A real-time multiplayer word game built with Next.js and Socket.io. Players take turns creating words that start with the last letter of the previous word. Test your vocabulary and quick thinking!

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-blue?logo=socket.io)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Table of Contents

- [Features](#-features)
- [Game Rules](#-game-rules)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)

## ✨ Features

### Core Gameplay
- **Real-time Multiplayer**: Play with friends using room codes
- **Word Validation**: Dictionary API integration for word verification
- **Turn-based System**: 30-second timer for each turn
- **Lives System**: 3 lives per player, lose one for invalid words or timeouts
- **Scoring**: Points based on word length
- **Letter Chaining**: Each word must start with the last letter of the previous word

### Technical Features
- **Reconnection Logic**: Players can rejoin if disconnected (60-second window)
- **Real-time Notifications**: Toast messages for all game events
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Built-in theme switching
- **Text-to-Speech**: Pronounces valid words
- **Player Avatars**: Auto-generated avatars using DiceBear

### Lobby Features
- **Easy Room Creation**: Auto-generated 6-character room codes
- **Player Management**: Host controls and automatic host transfer
- **Waiting Lobby**: See all players before starting
- **Copy Room Code**: Easy sharing with friends

## 🎯 Game Rules

1. **Starting the Game**
   - Minimum 2 players required
   - Host starts the game from the waiting lobby
   - First letter is randomly generated (40% vowel, 60% consonant)

2. **Taking Your Turn**
   - You have 30 seconds to submit a word
   - Word must start with the current letter
   - Word must be a valid English word (verified via dictionary)
   - Word cannot have been used already in the game

3. **Scoring & Lives**
   - Valid word: Gain points equal to word length
   - Invalid word/timeout: Lose 1 life
   - 0 lives = Eliminated from the game

4. **Winning**
   - Last player standing wins
   - Or highest score when game ends

5. **Reconnection**
   - If disconnected during game, rejoin within 60 seconds
   - Your progress (score, lives) is preserved

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Notifications**: Sonner
- **Real-time**: Socket.io Client

### Backend
- **Server**: Node.js with Socket.io
- **Language**: TypeScript
- **API**: Dictionary API (Free)

### Development Tools
- **Package Manager**: npm/pnpm/yarn/bun
- **Linting**: ESLint
- **Type Checking**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/umeshsuwal/word-game.git
   cd word-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration (defaults work for local development)

4. **Start the Socket.io server**
   ```bash
   npm run server
   ```
   
   The server will start on `http://localhost:3001`

5. **Start the Next.js development server** (in a new terminal)
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Playing the Game

1. **Create a Room**
   - Click "Create Game"
   - Enter your username
   - Share the room code with friends

2. **Join a Room**
   - Click "Join Game"
   - Enter the room code and your username
   - Wait in the lobby

3. **Start Playing**
   - Host clicks "Start Game"
   - Take turns submitting words
   - Last player standing wins!

## 📁 Project Structure

```
word-game/
├── public/                 # Static assets
├── server/                 # Socket.io server
│   └── index.ts           # Server logic and event handlers
├── src/
│   ├── app/               # Next.js app router pages
│   │   ├── create/        # Create room page
│   │   ├── join/          # Join room page
│   │   ├── waitingLobby/  # Lobby page
│   │   ├── game/          # Game room page
│   │   └── results/       # Results page
│   ├── components/        # React components
│   │   ├── game/          # Game-specific components
│   │   ├── results/       # Results components
│   │   └── ui/            # Reusable UI components
│   ├── lib/               # Utilities and logic
│   │   ├── gameLogic.ts   # Core game logic
│   │   ├── socket.ts      # Socket.io client
│   │   └── utils.ts       # Helper functions
│   └── types/             # TypeScript types
│       └── game.ts        # Game-related types
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
# Socket.io Server
PORT=3001
HOST=0.0.0.0

# Next.js Client
NEXT_PUBLIC_PORT=3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Game Settings (Optional)
TURN_TIME=30
PLAYER_LIVES=3
RECONNECTION_TIMEOUT=60000
```

### Game Configuration

Edit these values in the source code:

**Turn Timer** (`src/lib/gameLogic.ts`):
```typescript
const TURN_TIME = 30 // seconds
```

**Player Lives** (`src/lib/gameLogic.ts`):
```typescript
lives: 3 // in Player interface
```

**Reconnection Timeout** (`server/index.ts`):
```typescript
setTimeout(() => { /* ... */ }, 60000) // 60 seconds
```

## 🌐 Deployment

### Option 1: Split Deployment (Recommended)

Deploy frontend and backend separately for better scalability.

#### Frontend (Vercel/Netlify)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy to Vercel**
   - Import your repository on [Vercel](https://vercel.com)
   - Set environment variable:
     ```
     NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.com
     ```
   - Deploy

#### Backend (Railway/Render/Heroku)

1. **Create a new service**
   - Use Railway, Render, or Heroku
   - Connect your GitHub repository

2. **Configure build settings**
   - Build command: `npm install`
   - Start command: `npm run server`

3. **Set environment variables**
   ```
   PORT=3001
   HOST=0.0.0.0
   ```

4. **Update CORS** (if restricting origins)
   
   Edit `server/index.ts`:
   ```typescript
   cors: {
     origin: "https://your-frontend-domain.com",
     methods: ["GET", "POST"],
     credentials: true,
   }
   ```

### Option 2: Single Server (Railway/DigitalOcean)

Deploy both frontend and backend on the same server.

1. **Create Startup Script**
   
   Create `start.sh`:
   ```bash
   #!/bin/bash
   npm run server &
   npm run build
   npm start
   ```

2. **Update package.json**
   ```json
   {
     "scripts": {
       "start:all": "concurrently \"npm run server\" \"npm start\""
     }
   }
   ```

3. **Deploy**
   - Railway: Auto-detects and deploys
   - DigitalOcean: Use App Platform

### Option 3: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 3000 3001
   CMD ["sh", "-c", "npm run server & npm start"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
         - "3001:3001"
       environment:
         - PORT=3001
         - NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   ```

### Post-Deployment Checklist

- [ ] Test room creation
- [ ] Test joining rooms
- [ ] Test gameplay with multiple players
- [ ] Test reconnection after refresh
- [ ] Test on mobile devices
- [ ] Verify CORS settings
- [ ] Check error logging

## 📡 API Reference

### Socket Events

#### Client → Server

| Event | Parameters | Description |
|-------|-----------|-------------|
| `create-room` | `{ username }` | Create a new game room |
| `join-room` | `{ roomCode, username }` | Join an existing room |
| `get-room` | `{ roomCode }` | Get current room state |
| `start-game` | `{ roomCode }` | Start the game (host only) |
| `submit-word` | `{ roomCode, word }` | Submit a word during your turn |
| `check-reconnection` | `{ oldSocketId }` | Check if reconnection is available |
| `rejoin-room` | `{ roomCode, oldSocketId }` | Rejoin after disconnection |

#### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `room-created` | `{ roomCode, room }` | Room successfully created |
| `room-updated` | `{ room }` | Room state updated |
| `room-error` | `{ message }` | Room-related error |
| `join-error` | `{ message }` | Failed to join room |
| `game-started` | `{ room }` | Game has started |
| `next-turn` | `{ room }` | Move to next player's turn |
| `word-result` | `{ success, word, meaning, phonetic, player }` | Word validation result |
| `word-error` | `{ player, word, reason, livesLeft }` | Invalid word submitted |
| `player-eliminated` | `{ player, reason }` | Player eliminated |
| `game-over` | `{ room }` | Game ended |
| `player-disconnected` | `{ playerId, username }` | Player disconnected |
| `player-reconnected` | `{ playerId, username }` | Player reconnected |
| `reconnection-available` | `{ roomCode, username }` | Reconnection is possible |
| `rejoined-room` | `{ room }` | Successfully rejoined |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Dictionary API](https://dictionaryapi.dev/) - Free dictionary API
- [DiceBear](https://dicebear.com/) - Avatar generation
- [Radix UI](https://radix-ui.com/) - UI components
- [Shadcn/ui](https://ui.shadcn.com/) - Component designs

## 📞 Support

If you have any questions or run into issues:

1. Check the [Issues](https://github.com/umeshsuwal/word-game/issues) page
2. Create a new issue with details
3. Contact: [your-email@example.com]

## 🎮 Live Demo

Play the game: [Your Deployed URL]

---

Made with ❤️ by [Umesh Suwal](https://github.com/umeshsuwal)


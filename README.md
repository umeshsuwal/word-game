# Word Game

A real-time multiplayer word chain game where players create words starting with the last letter of the previous word. Challenge your friends or practice against an intelligent AI opponent!



## Features

- **Real-time Multiplayer** - Play with friends using room codes
- **AI Mode** - Practice against an intelligent AI opponent
- **Word Validation** - Dictionary API integration for accurate checking
- **30-Second Turns** - Fast-paced gameplay
- **Scoring System** - Points based on word length
- **User Authentication** - Sign in with email or Google
- **Custom Avatars** - Choose from 96+ unique avatar styles
- **Game History** - Track your last 10 matches and progress
- **Dark Mode** - Beautiful UI with modern design
- **Responsive Design** - Works seamlessly on all devices



## Quick Start

### Prerequisites

- Node.js 20 or higher
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/umeshsuwal/word-game.git
   cd word-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Client Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin SDK (single line JSON)
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   ```

4. **Run the development servers**
   
   Open two terminal windows:
   ```bash
   # Terminal 1 - Next.js app
   npm run dev

   # Terminal 2 - Socket.io server
   npm run server
   ```

5. **Open your browser**
   - App: http://localhost:3000
   - Server: http://localhost:3001  



## How to Play

### Multiplayer Mode

1. Create or join a room with a 6-character code
2. Wait for other players in the lobby
3. Take turns creating words that start with the last letter of the previous word
4. Avoid invalid words, timeouts, or reusing words
5. Win by being the last player standing!

### AI Mode

1. Click on "Play vs AI" from the main menu
2. Practice your vocabulary skills against an intelligent AI opponent
3. Same rules apply - create words starting with the last letter
4. Race to 500 points - First player (you or AI) to reach 500 points wins!
5. 3 lives system - Lose all lives before reaching 500 and you lose
6. No waiting - instant gameplay without needing other players


## Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui & Radix UI
- Lucide React

### Backend
- Socket.io
- Node.js
- Firebase (Firestore + Auth)

### APIs
- Dictionary API - Word validation
- DiceBear - Avatar generation



## Project Structure

```
word-game/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── contexts/         # Auth context
│   ├── lib/              # Utilities & services
│   └── types/            # TypeScript types
├── server/               # Socket.io server
└── public/               # Static assets
```



## Key Features Explained

### Authentication
- Email/Password sign-up and sign-in
- Google OAuth integration
- Profile management with custom avatars

### Avatar System
- 6 styles: Human, Robots, Cartoon, Modern, Pixel, Letters
- 16 variations per style (96 total avatars)
- Visual gallery picker
- Instant preview

### AI Mode
- Play solo against an intelligent AI opponent
- AI uses advanced word selection strategies
- 3 lives system - make strategic decisions
- Race to 500 points - first to reach 500 wins
- Lose all 3 lives before reaching 500 and you lose immediately
- Perfect for practice and skill improvement
- All words validated against dictionary

### Game History
- Automatic save after each game
- Last 10 matches displayed
- Winner tracking
- Score and rank history

## Available Scripts

```bash
npm run dev          # Start Next.js development server
npm run server       # Start Socket.io server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Author

**Umesh Suwal**
- GitHub: [@umeshsuwal](https://github.com/umeshsuwal)
- Email: mail@umeshsuwal.com.np

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Dictionary API](https://dictionaryapi.dev/) - Free dictionary API
- [DiceBear](https://dicebear.com/) - Avatar generation
- [Radix UI](https://radix-ui.com/) - UI components
- [Shadcn/ui](https://ui.shadcn.com/) - Component designs

## Support

If you have any questions or run into issues:

1. Check the [Issues](https://github.com/umeshsuwal/word-game/issues) page
2. Create a new issue with details
3. Email: mail@umeshsuwal.com.np

## Live Demo

**Play the game**: [https://word-bomb-game.vercel.app](https://word-bomb-game.vercel.app)


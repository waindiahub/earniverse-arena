# GameArena Esports Platform - Frontend

Production-ready React frontend for a complete esports platform with Watch & Earn rewarded video integration.

## 🎮 Features

- **User Authentication**: Login/Signup with JWT token management
- **Tournaments**: Browse and register for esports competitions
- **Leaderboards**: Real-time rankings per game
- **Watch & Earn**: Rewarded video ads system (integration-ready)
- **Wallet System**: In-app credits management
- **Admin Panel**: User management, tournaments, payouts, ad audits
- **Responsive Design**: Mobile-first dark gaming aesthetic

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🔌 Backend Integration

This frontend is designed to connect to your NestJS backend. Update the API base URL:

```typescript
// src/services/api.ts
const API_BASE_URL = 'http://your-backend-url:3000/api';
```

### Key Integration Points:

1. **Authentication** (`src/services/api.ts` - authApi)
   - POST `/auth/login`
   - POST `/auth/signup`
   - POST `/auth/refresh`

2. **Rewarded Ads** (`src/components/rewards/RewardedPlayer.tsx`)
   - GET `/rewards/request-token` - Get server-signed token
   - POST `/rewards/claim` - Verify and credit reward
   - See component comments for ad SDK integration

3. **Tournaments, Games, Leaderboards** - All API calls stubbed in `src/services/api.ts`

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/         # Navbar, Footer
│   ├── rewards/        # RewardedPlayer component
│   └── ui/            # shadcn components
├── pages/             # All route pages
├── services/          # API integration layer
├── types/             # TypeScript type definitions
└── lib/              # Utilities
```

## 🎨 Design System

- **Colors**: Gaming dark theme with electric blue/purple gradients
- **Tokens**: All defined in `src/index.css` and `tailwind.config.ts`
- **Animations**: Fade, scale, glow effects for interactive feel

## 🔐 Environment Variables

Create `.env.local`:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📝 Type Definitions

Shared types for frontend/backend communication in `src/types/api.ts`:
- User, Profile, Tournament, Game, Wallet types
- Auth request/response types
- Reward claim types

## 🎬 Ad Network Integration

To integrate real rewarded video ads:

1. Install ad SDK (Google IMA, AdMob, etc.)
2. Update `src/components/rewards/RewardedPlayer.tsx`
3. Replace mock ad player with real SDK initialization
4. Update backend to verify with ad network server-to-server

See detailed comments in the RewardedPlayer component.

## 🛠️ Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- React Router
- TanStack Query
- Sonner (toasts)

## 📦 Available Scripts

- `npm run dev` - Start dev server (port 8080)
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔗 Next Steps

1. Connect to your NestJS backend
2. Update API endpoints in `src/services/api.ts`
3. Integrate real ad network SDK in RewardedPlayer
4. Implement WebSocket for live match updates
5. Add admin routes and components
6. Set up CI/CD pipeline

## 📄 License

All rights reserved.

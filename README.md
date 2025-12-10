# Parla Frontend

A modern, gamified language learning web application built with React, TypeScript, and Vite. Parla helps users learn new languages through interactive practice modes, spaced repetition flashcards, and progress tracking.

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Design Patterns](#design-patterns)
- [Project Structure](#project-structure)
- [Features](#features)
- [Setup and Installation](#setup-and-installation)
- [Running the Application](#running-the-application)
- [Environment Configuration](#environment-configuration)
- [API Integration](#api-integration)
- [Testing Strategy](#testing-strategy)
- [Build and Deployment](#build-and-deployment)
- [CI/CD Setup](#cicd-setup)
- [Contributors](#Contributors)

---

## Project Overview

Parla is a comprehensive language learning platform that combines vocabulary management, interactive practice games, and gamification elements to create an engaging learning experience. The frontend communicates with a Django REST Framework backend to provide user authentication, phrase management, and progress tracking.

### Key Capabilities

- Google OAuth 2.0 authentication
- Multi-language dictionary with translations
- Three practice game modes (FlashCards, Time Trial, Match Cards)
- Spaced repetition algorithm (SM-2) for optimal learning
- Gamification system with points, streaks, and achievements
- Progress analytics with interactive charts
- Dark/Light theme support
- Responsive design for mobile and desktop

---

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | React | 18.3.1 |
| **Language** | TypeScript | 5.8.3 |
| **Build Tool** | Vite | 5.4.19 |
| **Styling** | TailwindCSS | 3.4.17 |
| **UI Components** | Radix UI | Latest |
| **State Management** | React Context API | - |
| **Data Fetching** | TanStack React Query | 5.83.0 |
| **Routing** | React Router DOM | 6.30.2 |
| **Charts** | Recharts | 2.15.4 |
| **Forms** | React Hook Form + Zod | 7.61.1 / 3.25.76 |
| **Authentication** | @react-oauth/google | 0.12.2 |
| **Linting** | ESLint | 9.32.0 |

---

## Architecture

### High-Level Architecture

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|   React Frontend |<--->|  Django Backend  |<--->|   PostgreSQL     |
|   (Vite + TS)    |     |  (REST API)      |     |   Database       |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |                        |
        v                        v
+------------------+     +------------------+
|  Google OAuth    |     |  External APIs   |
|  Provider        |     |  (Translation)   |
+------------------+     +------------------+
```

### Frontend Architecture Layers

```
+---------------------------------------------------------------+
|                        Presentation Layer                      |
|  (Pages: Login, Dashboard, FlashCards, TimeTrial, Progress)   |
+---------------------------------------------------------------+
                              |
+---------------------------------------------------------------+
|                        Component Layer                         |
|  (UI Components, Game Components, Layout Components)          |
+---------------------------------------------------------------+
                              |
+---------------------------------------------------------------+
|                        Context Layer                           |
|  (AuthContext, ThemeContext, PointsContext, StreakContext)    |
+---------------------------------------------------------------+
                              |
+---------------------------------------------------------------+
|                        Service Layer                           |
|  (API Services, Gamification, Translation, Sound)             |
+---------------------------------------------------------------+
                              |
+---------------------------------------------------------------+
|                        Type Layer                              |
|  (TypeScript Interfaces and Type Definitions)                 |
+---------------------------------------------------------------+
```

---

## Design Patterns

### 1. Provider Pattern (Context API)

Used for global state management across the application.

```typescript
// Example: AuthProvider wraps the entire application
<AuthProvider>
  <StreakProvider>
    <PointsProvider>
      <App />
    </PointsProvider>
  </StreakProvider>
</AuthProvider>
```

**Implemented Contexts:**
- `AuthContext` - User authentication state and methods
- `ThemeContext` - Dark/Light theme management
- `PointsContext` - User points and gamification data
- `StreakContext` - Daily streak tracking
- `DictionaryContext` - Dictionary search state

### 2. Container/Presentational Pattern

Separation of logic (containers/pages) from UI (components).

```
Pages (Containers)          Components (Presentational)
------------------          --------------------------
FlashCards.tsx       --->   FlashCardPractice.tsx
Progress.tsx         --->   StatsPanel.tsx
SavedPhrases.tsx     --->   PhraseCard.tsx
```

### 3. Service Layer Pattern

All API communication is abstracted into service modules.

```typescript
// services/api.ts - Base API utilities
export const apiGet = async <T>(endpoint: string): Promise<T>
export const apiPost = async <T>(endpoint: string, body?: unknown): Promise<T>

// services/phrasesService.ts - Domain-specific operations
export const fetchPhrases = async (): Promise<SavedPhrase[]>
export const addPhrase = async (phrase: PhraseInput): Promise<SavedPhrase>
```

### 4. Custom Hooks Pattern

Encapsulation of reusable logic in custom hooks.

```typescript
// hooks/useAuth.ts
export const useAuth = () => useContext(AuthContext);

// hooks/useSpeechSynthesis.ts
export const useSpeechSynthesis = () => { /* TTS logic */ };

// hooks/useTheme.ts
export const useTheme = () => useContext(ThemeContext);
```

### 5. Protected Route Pattern

Route-level authentication guard.

```typescript
// components/ProtectedRoute.tsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
};
```

### 6. Compound Component Pattern

Used in UI components for flexible composition.

```typescript
// Radix UI components follow this pattern
<Dialog>
  <DialogTrigger />
  <DialogContent>
    <DialogHeader />
    <DialogBody />
    <DialogFooter />
  </DialogContent>
</Dialog>
```

---

## Project Structure

```
src/
├── assets/                 # Static assets (images, icons)
├── components/             # Reusable UI components
│   ├── ui/                 # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── FlashCardPractice.tsx
│   ├── MatchCards.tsx
│   ├── SessionSummary.tsx
│   ├── Sidebar.tsx
│   └── ...
├── contexts/               # React Context providers
│   ├── AuthContext.tsx
│   ├── AuthProvider.tsx
│   ├── PointsContext.tsx
│   ├── StreakContext.tsx
│   └── ThemeContext.tsx
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts
│   ├── useSpeechSynthesis.ts
│   ├── useTheme.ts
│   └── use-toast.ts
├── pages/                  # Page components (routes)
│   ├── Login.tsx
│   ├── Index.tsx           # Dashboard
│   ├── FlashCards.tsx
│   ├── Time_Trial.tsx
│   ├── MatchCards.tsx
│   ├── Progress.tsx
│   ├── SavedPhrases.tsx
│   ├── Dictionary.tsx
│   └── Profile.tsx
├── services/               # API and business logic
│   ├── api.ts              # Base API utilities
│   ├── authApi.ts          # Authentication endpoints
│   ├── phrasesService.ts   # Phrase CRUD operations
│   ├── flashcardsService.ts # Flashcard operations
│   ├── gamificationApi.ts  # Points, streaks, stats
│   ├── dictionaryService.ts # Dictionary lookups
│   ├── translationService.ts # Translation API
│   └── soundService.ts     # Audio playback
├── types/                  # TypeScript type definitions
│   ├── phrases.ts
│   ├── flashcards.ts
│   ├── gamification.ts
│   └── dictionary.ts
├── lib/                    # Utility functions
├── App.tsx                 # Root component with routing
├── main.tsx                # Application entry point
└── index.css               # Global styles
```

---

## Features

### Authentication (HU01, HU02)
- Google OAuth 2.0 integration
- Session-based authentication with Django backend
- Protected routes for authenticated users
- Automatic session validation on app load

### Dictionary (HU03, HU04, HU05)
- Multi-language dictionary search
- Word definitions, examples, and pronunciations
- Text-to-speech pronunciation
- Save words directly to phrase collection

### Phrase Management (HU06, HU07, HU15, HU16)
- Create, read, update, delete phrases
- Categorization by grammar and theme
- Source tracking (manual, YouTube, dictionary)
- Bulk operations and filtering

### Practice Modes

#### FlashCards (HU10)
- SM-2 spaced repetition algorithm
- Flip card interaction
- Session-based practice with progress tracking

#### Time Trial (HU11)
- Timed translation challenges
- Multiple difficulty levels
- Real-time scoring

#### Match Cards (HU12)
- Memory matching game
- Pair original phrases with translations
- Time and move tracking

### Gamification (HU10.1 - HU10.5)
- Points system with bonuses
- Daily streak tracking
- Achievement system
- Progress statistics and charts

### Progress Tracking (HU13, HU14)
- Daily, weekly, monthly statistics
- Interactive charts (Recharts)
- Accuracy and performance metrics
- Activity history

---

## Setup and Installation

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher (or Bun)
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Parla-Frontend.git
   cd Parla-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or with Bun
   bun install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` with your configuration** (see [Environment Configuration](#environment-configuration))

---

## Running the Application

### Development Mode

```bash
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:8080`

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

---

## Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Google OAuth Configuration (Required)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com

# Backend API Configuration (Required)
VITE_API_BASE_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000

# MyMemory Translation API (Optional)
VITE_MYMEMORY_EMAIL=your-email@example.com
```

### Configuration Details

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID from Google Cloud Console | Yes |
| `VITE_API_BASE_URL` | Backend API base URL (include `/api` suffix) | Yes |
| `VITE_BACKEND_URL` | Backend server URL (for authentication) | Yes |
| `VITE_MYMEMORY_EMAIL` | Email for MyMemory API (increases rate limit) | No |

---

## API Integration

### Backend Endpoints

The frontend integrates with the following Django REST API endpoints:

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/google/` | Google OAuth login |
| POST | `/auth/logout/` | User logout |
| GET | `/users/profile/` | Get user profile |

#### Phrases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/phrases/phrases/` | List all phrases |
| POST | `/phrases/phrases/` | Create new phrase |
| GET | `/phrases/phrases/{id}/` | Get phrase details |
| PUT | `/phrases/phrases/{id}/` | Update phrase |
| DELETE | `/phrases/phrases/{id}/` | Delete phrase |

#### Flashcards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/flashcards/due/` | Get due flashcards |
| POST | `/flashcards/{id}/answer/` | Submit flashcard answer |
| POST | `/flashcards/practice-sessions/start/` | Start practice session |
| POST | `/flashcards/practice-sessions/{id}/complete/` | Complete session |

#### Gamification
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/gamification/points/` | Get user points |
| POST | `/gamification/points/add/` | Add points |
| GET | `/gamification/streak/` | Get streak data |
| GET | `/gamification/daily-stats/` | Get daily statistics |
| GET | `/gamification/weekly-stats/` | Get weekly statistics |
| GET | `/gamification/monthly-stats/` | Get monthly statistics |

### API Service Layer

All API calls are centralized in the `services/` directory:

```typescript
// Example: Fetching phrases
import { fetchPhrases } from '@/services/phrasesService';

const phrases = await fetchPhrases();
```

### Error Handling

The API layer includes standardized error handling:

```typescript
export class ApiError extends Error {
  status?: number;
  details?: Record<string, unknown>;
}
```

---

## Testing Strategy

### Testing Approach

The project follows a multi-level testing strategy:

#### 1. Unit Testing
- Individual component testing
- Service function testing
- Custom hook testing
- Utility function testing

#### 2. Integration Testing
- Component interaction testing
- Context provider testing
- API integration testing

#### 3. End-to-End Testing
- User flow testing
- Authentication flow
- Practice session completion

### Recommended Testing Tools

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "vitest": "^1.0.0",
    "msw": "^2.0.0",
    "playwright": "^1.40.0"
  }
}
```

### Running Tests

```bash
# Unit and integration tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test File Structure

```
src/
├── components/
│   ├── FlashCardPractice.tsx
│   └── __tests__/
│       └── FlashCardPractice.test.tsx
├── services/
│   ├── phrasesService.ts
│   └── __tests__/
│       └── phrasesService.test.ts
└── hooks/
    ├── useAuth.ts
    └── __tests__/
        └── useAuth.test.ts
```

---

## Build and Deployment

### Build Configuration

The project uses Vite with optimized build settings:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', ...],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['date-fns', 'clsx', ...],
        },
      },
    },
  },
});
```

### Build Output

```bash
npm run build
```

Output is generated in the `dist/` directory:
- Minified JavaScript bundles
- Optimized CSS
- Static assets with content hashing

### Deployment Options

#### Netlify (Recommended)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## CI/CD Setup

The project includes a complete GitHub Actions CI/CD pipeline located at `.github/workflows/ci.yml`.

### Pipeline Overview

```
+--------+     +--------+     +--------+
|  Lint  | --> | Build  | --> | Deploy |
+--------+     +--------+     +--------+
                                  |
                    +-------------+-------------+
                    |                           |
              (main branch)              (pull request)
                    |                           |
                    v                           v
            +---------------+          +------------------+
            |  Production   |          |  Preview Deploy  |
            |    Deploy     |          |  (unique URL)    |
            +---------------+          +------------------+
```

### Pipeline Stages

| Stage | Trigger | Description |
|-------|---------|-------------|
| **Lint** | All pushes and PRs | Runs ESLint to check code quality |
| **Build** | After lint passes | Compiles the application with Vite |
| **Deploy** | Push to `main` | Deploys to production on Netlify |
| **Deploy Preview** | Pull requests | Creates a preview deployment with unique URL |

### Prerequisites for CI/CD

Before the pipeline can deploy, you need to configure the following:

#### 1. Create a Netlify Account and Site

1. Go to [Netlify](https://app.netlify.com/) and sign up/login
2. Click "Add new site" > "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Note your **Site ID** (found in Site Settings > General > Site details)

#### 2. Generate Netlify Auth Token

1. Go to [Netlify User Settings](https://app.netlify.com/user/applications)
2. Click "New access token"
3. Give it a name (e.g., "GitHub Actions")
4. Copy the generated token (you won't see it again)

#### 3. Configure GitHub Secrets

Go to your GitHub repository > Settings > Secrets and variables > Actions, then add:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `NETLIFY_AUTH_TOKEN` | Your Netlify access token | Authentication for Netlify API |
| `NETLIFY_SITE_ID` | Your Netlify site ID | Identifies which site to deploy to |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | For authentication |
| `VITE_API_BASE_URL` | Backend API URL | e.g., `https://api.yoursite.com/api` |
| `VITE_BACKEND_URL` | Backend base URL | e.g., `https://api.yoursite.com` |

### How to Execute the Pipeline

#### Automatic Execution

The pipeline runs automatically when:

1. **Push to `main` branch**: Runs lint, build, and deploys to production
2. **Push to `develop` branch**: Runs lint and build only
3. **Open a Pull Request to `main`**: Runs lint, build, and creates a preview deployment

#### Manual Execution

You can also trigger the workflow manually:

1. Go to your repository on GitHub
2. Click on "Actions" tab
3. Select "CI/CD Pipeline" workflow
4. Click "Run workflow" button
5. Select the branch and click "Run workflow"

### Viewing Pipeline Results

1. Go to your repository > Actions tab
2. Click on a workflow run to see details
3. Each job (lint, build, deploy) shows its status
4. Click on a job to see detailed logs

### Local Verification Before Push

Before pushing, verify your code passes locally:

```bash
# Run linting
npm run lint

# Run build
npm run build

# Preview the build locally
npm run preview
```

### Workflow File Location

The complete workflow configuration is at:

```
.github/
  workflows/
    ci.yml          # Main CI/CD pipeline
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Lint fails | Run `npm run lint` locally and fix errors |
| Build fails | Check for TypeScript errors with `npx tsc --noEmit` |
| Deploy fails | Verify Netlify secrets are correctly configured |
| Missing secrets | Ensure all required secrets are added in GitHub Settings |

### Environment Variables in CI/CD

The build process uses environment variables from GitHub Secrets:

```yaml
env:
  VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}
  VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
  VITE_BACKEND_URL: ${{ secrets.VITE_BACKEND_URL }}
```

These are injected at build time and embedded in the compiled JavaScript.

## Contributors

- Daniel Felipe Garzon Mora [correo](dagarzonmo@unal.edu.co) [LinkedIn](www.linkedin.com/in/dagarzonm/)
- Karem Nataly Sierra Molina [correo](ksierram@unal.edu.co) [LinkedIn](https://www.linkedin.com/in/karem-nataly-sierra-molina-7a6310223/)
- Daniel Santiago Cocinero Jiménez [correo](dcocinero@unal.edu.co) [LinkedIn](www.linkedin.com/in/santiago-cocinero-269946297 )
- Juan Daniel Ramírez Mojica [correo](juaramirezmo@unal.edu.co) [linkedIn](https://www.linkedin.com/in/juan-daniel-ramirez-ab8311170/)
- Guillermo Moya Romero [correo](gmoya@unal.edu.co) [linkedIn](www.linkedin.com/in/guillermomoyaromero/)
- María Paula Román Arévalo [correo](maromana@unal.edu.co)

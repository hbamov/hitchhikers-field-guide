# Hitchhiker's Field Guide

A field guide to the galaxy, inspired by _The Hitchhiker's Guide to the Galaxy_. Browse guide entries for planets, species, places, technology, and objects — each rated from **Mostly Harmless** to **Legendary**.

Built with React 19, TypeScript, and Vite, backed by Firebase (Authentication + Firestore).

## Features

- **Authentication** — email/password login and registration via Firebase Auth, with protected and guest-only routes
- **Dashboard** — landing area for signed-in users
- **Guide** — browse entries from a Firestore `guideEntries` collection, organized by category (`planet`, `species`, `place`, `technology`, `object`) and classification (`mostly-harmless`, `safe`, `caution`, `dangerous`, `legendary`, `unknown`)
- **Graceful fallback** — the app detects missing Firebase config and degrades gracefully instead of crashing

## Tech Stack

| Area               | Tools                                      |
| ------------------ | ------------------------------------------ |
| Framework          | React 19, TypeScript, Vite                 |
| Routing            | React Router 7                             |
| Data fetching      | TanStack React Query                       |
| Backend            | Firebase Auth, Cloud Firestore             |
| Styling            | MUI (Material UI), Emotion, Tailwind CSS 4 |
| Forms & validation | React Hook Form, Zod                       |
| Icons              | lucide-react                               |
| Testing            | Vitest, Testing Library, jsdom             |
| Package manager    | pnpm                                       |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A Firebase project with Authentication and Firestore enabled

### Setup

1. Install dependencies:

   ```sh
   pnpm install
   ```

2. Create a `.env` file based on `.env.example` and fill in your Firebase web app credentials:

   ```sh
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   ```

3. Start the dev server:

   ```sh
   pnpm dev
   ```

## Scripts

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `pnpm dev`        | Start the Vite dev server           |
| `pnpm build`      | Type-check and build for production |
| `pnpm preview`    | Preview the production build        |
| `pnpm test`       | Run the test suite once             |
| `pnpm test:watch` | Run tests in watch mode             |

## Project Structure

```
src/
├── app/            # Providers, router, theme
├── components/     # Shared layout components
├── features/
│   ├── auth/       # Auth context, pages, and service
│   └── guide/      # Guide entries: hooks, service, types, UI
├── pages/          # Dashboard, NotFound
├── shared/         # Firebase setup, shared types and content
└── test/           # Test setup
```

Route protection is handled by `ProtectedRoute` and `GuestRoute`; guide data is fetched from the `guideEntries` Firestore collection (see `firestore.rules` for access rules).

---

_Don't Panic._

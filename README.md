# Hitchhiker's Field Guide

A field guide to the galaxy, inspired by _The Hitchhiker's Guide to the Galaxy_. Browse entries about planets, species, places, technology, and objects; check their classifications; and keep a personal checklist for your next expedition.

Built with React 19, TypeScript, and Vite, with Firebase Authentication and Cloud Firestore.

## Features

- **Accounts** — register and sign in with email and password, reset passwords, and sign out. New accounts receive the `traveler` role.
- **Dashboard** — see a featured Guide entry, a preview of your open checklist items, and your account role.
- **The Guide** — search entries by name, summary, or tag; filter by category; and open a detailed entry with its classification and tags.
- **Travel checklist** — create, edit, delete, and complete personal tasks. Set a priority and optional due date, filter by status, and see open/completed and high-priority counts.
- **Guide administration** — users with the `administrator` role can create, edit, and delete Guide entries.
- **Responsive app shell** — navigate between the dashboard, Guide, and checklist on desktop or mobile.
- **Firebase configuration handling** — the app can render without Firebase credentials, but authentication and cloud-backed features require a configured Firebase project.

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | React 19, TypeScript, Vite |
| Routing | React Router 7 |
| Data fetching and caching | TanStack React Query |
| Backend | Firebase Authentication, Cloud Firestore |
| Styling and UI | MUI (Material UI), Emotion, Tailwind CSS 4 |
| Forms and validation | React Hook Form, Zod |
| Icons | lucide-react |
| Testing | Vitest, Testing Library, jsdom |
| Package manager | npm |

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- A Firebase project with Email/Password Authentication and Cloud Firestore enabled

### Configure Firebase

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the Firebase web app credentials:

   ```dotenv
   VITE_FIREBASE_API_KEY=your-web-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

3. Apply the Firestore security rules in [`firestore.rules`](./firestore.rules) to your Firebase project before using the app. These rules restrict checklist data to its owner and Guide-entry management to administrators.

4. Start the development server:

   ```sh
   npm run dev
   ```

The app is served by Vite at the local URL printed in the terminal. For a production build, run `npm run build`, then `npm run preview` to serve the build locally.

### Administrator access

Registration creates a Firestore profile in `users/{uid}` with the `traveler` role. To grant Guide-management access, an existing project administrator must securely update that user's `role` to `administrator` in Firestore. Do not expose administrative credentials or allow users to assign themselves this role.

## Application Routes

| Route | Access | Description |
| --- | --- | --- |
| `/login` | Signed out | Sign in or request a password reset |
| `/register` | Signed out | Create a traveler account |
| `/dashboard` | Signed in | Featured Guide entry and checklist overview |
| `/guide` | Signed in | Search and filter Guide entries |
| `/guide/:entryId` | Signed in | View an individual Guide entry |
| `/tasks` | Signed in | Manage your travel checklist |
| `/admin/guide` | Administrator | Create, edit, and delete Guide entries |

Signed-in users are redirected away from the login and registration pages. Other protected pages require authentication; the admin route additionally checks the user's role.

## Firestore Data

The app uses these collections:

- **`users/{uid}`** — account profile with `email`, `displayName`, and `role` (`traveler` or `administrator`). Registration creates this document.
- **`guideEntries/{entryId}`** — `name`, `category`, `summary`, `classification`, and `tags`. Categories are `planet`, `species`, `place`, `technology`, and `object`. Classifications are `mostly-harmless`, `safe`, `caution`, `dangerous`, `legendary`, and `unknown`. Signed-in users can read entries; only administrators can manage them.
- **`travelTasks/{taskId}`** — a user's `userId`, `title`, optional `description` and `dueDate`, `priority` (`low`, `medium`, `high`), `status` (`open`, `completed`), and timestamps. Users can read and manage only their own tasks.

Firestore access is enforced by [`firestore.rules`](./firestore.rules), not just by the app's route checks. Ensure the deployed rules match this file.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | Run the TypeScript check |
| `npm run lint` | Run Oxlint |
| `npm run check` | Run type-checking, lint, and tests |

## Project Structure

```text
src/
├── app/              # Providers, routing, and theme
├── components/       # Shared app layout
├── features/
│   ├── adminGuide/   # Administrator Guide-entry management
│   ├── auth/         # Authentication context, pages, and service
│   ├── guide/        # Guide browsing, entry details, and data hooks
│   └── travelTasks/  # Personal checklist, forms, and data hooks
├── lib/              # Shared React Query client
├── pages/            # Dashboard and not-found page
├── shared/           # Firebase setup, shared types, and content
└── test/             # Test setup
```

_Don't Panic._

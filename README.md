# AI Website Builder

AI Website Builder is a full-stack website generation and editing platform. A user can:

- Sign in with Better Auth.
- Create a new website from a natural-language prompt.
- Chat with the AI to revise the website after it has already been created.
- Preview, save, publish, rollback, and download generated projects.
- Inspect and edit elements directly inside the preview for selected pages.

The app is split into a React frontend and an Express + Prisma backend, with AI generation handled on the server.

---

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Axios
- Sonner for toasts
- Lucide React for icons
- Better Auth UI

### Backend

- Node.js
- Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- Better Auth
- Google GenAI SDK
- Google GenAI SDK

### AI and Editing

- Gemini-based generation for new projects and revisions
- Tailwind-first HTML output generation
- Conversation history stored in the database
- Versioning for rollback and preview

---

## Project Structure

```text
client/
  src/
    assets/         static assets, dummy projects, schema references
    components/     navbar, footer, sidebar, preview, editor panel, loaders
    configs/        axios client
    lib/            auth client
    pages/          home, projects, community, preview, view, auth, settings
    types/          shared TypeScript interfaces
server/
  configs/         AI clients
  controllers/     user and project logic
  lib/             auth, Prisma, Gemini helpers
  middlewares/     authentication guard
  routes/          API route definitions
  prisma/          database schema and migrations
```

---

## How The App Works

### 1. User signs in

The client uses Better Auth through `authClient`. The server verifies sessions via `protect`, which reads cookies/session headers through Better Auth and attaches `req.userId`.

### 2. User creates a project

On the home page, the user submits a prompt. The backend:

- Creates a `WebsiteProject`
- Stores the original prompt in `Conversation`
- Adds an assistant message saying generation has started
- Creates an initial `Version`
- Enhances the prompt
- Generates the full HTML website
- Saves the code into the project and version tables
- Adds assistant messages describing progress

### 3. User revises the website

Inside the builder page, the sidebar acts like a chat interface. The user can type a follow-up request:

- The message is shown in the conversation immediately
- Pressing `Enter` sends the message
- `Shift + Enter` still inserts a new line
- The backend enhances the prompt again
- The AI generates updated HTML from the current code
- The new version is saved
- The preview refreshes to show the changes

### 4. User manages versions

Every AI-generated change creates a new `Version`. The sidebar shows the version history and allows rollback to an older version without losing the project.

### 5. User publishes or shares

Projects can be published and then viewed on the community page or shared through the public view route.

---

## Database Design

The Prisma schema models the app around a few core entities:

### `User`

Tracks:

- Identity
- Email
- Name
- Creation count
- Credits

Relations:

- Projects
- Sessions
- Accounts
- Transactions

### `WebsiteProject`

Stores the actual site data:

- Name
- Initial prompt
- Current HTML code
- Current version index
- Publish status
- Owner

Relations:

- Conversations
- Versions

### `Conversation`

Each chat message is stored as one row:

- Role: `user` or `assistant`
- Content
- Timestamp
- Project reference

### `Version`

Each generated site snapshot is saved as a version:

- Full HTML code
- Optional description
- Timestamp
- Project reference

### `Transaction`

Reserved for payments or plan tracking.

### Auth tables

Better Auth uses:

- `Session`
- `Account`
- `Verification`

These support session persistence, provider accounts, and account verification.

---

## API Workflow

### Auth

The app is wired to Better Auth with:

- `baseURL` on the client and server
- Credentialed requests
- Trusted origins
- Cookie-backed session auth

### User Routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/user/project` | Create a new website project |
| GET | `/api/user/project/:projectId` | Fetch a project and its conversation/history |
| GET | `/api/user/projects` | Fetch all user projects |
| GET | `/api/user/publish-toggle/:projectId` | Toggle publish state |

### Project Routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/project/revision/:projectId` | Send a chat message and generate a revision |
| POST | `/api/project/save/:projectId` | Save edited code from the preview |
| POST | `/api/project/rollback/:projectId/:versionId` | Restore a previous version |
| POST | `/api/project/preview/:projectId` | Fetch project preview data |
| POST | `/api/project/published` | Fetch published projects |
| POST | `/api/project/published/:projectId` | Fetch public code for a published project |
| POST | `/api/project/:projectId` | Delete a project |

---

## AI Generation Logic

### New project creation

The `createUserProject` controller performs two AI steps:

1. Prompt enhancement
2. Full HTML generation

The final output is saved as:

- Project current code
- Initial version code
- Conversation messages

### Revision flow

The `makeRevision` controller follows the same structure:

1. Store the user message
2. Enhance the prompt
3. Generate updated HTML from the current project code
4. Save the resulting code as a new version
5. Update the project’s current code
6. Store assistant chat messages

### Fallback and resilience

The helper in `server/lib/gemini.ts` is designed to be resilient:

- It retries transient errors like quota pressure and temporary unavailable responses
- It falls back across supported Gemini models
- It returns a clearer error message when the service is temporarily busy

This keeps the app usable even during AI spikes.

---

## Builder UI Flow

### Home page

The landing page acts as the entry point for creation:

- Large hero
- Prompt box
- Quick feature indicators
- Brand strip

### Projects page

The builder combines:

- Sidebar chat and version history
- Live project preview
- Device switcher
- Publish, save, download, and preview actions

### Sidebar

The sidebar is the conversational control center:

- Persistent chat messages
- Enter to send
- Shift + Enter for newline
- Optimistic message rendering
- Version list with rollback actions

### Preview area

The preview renders generated HTML inside an iframe and injects editor scripts when element editing is enabled.

### Editor panel

The editor panel allows direct modification of selected elements:

- Text
- Image source
- Alt text
- Class names
- Padding/margin
- Colors
- Font size

---

## System Design

### High-level architecture

```text
Browser
  -> React app
    -> Axios requests
      -> Express API
        -> Auth middleware
        -> Controller logic
          -> Prisma
          -> Gemini
          -> PostgreSQL
```

### Main data flow

```text
Prompt typed by user
  -> stored as conversation entry
  -> prompt enhancement
  -> HTML generation
  -> code saved to Version
  -> project current_code updated
  -> preview refreshes
```

### Why versioning matters

Versioning allows the app to:

- Roll back safely
- Compare past outputs
- Preview older builds
- Preserve the current project state while exploring revisions

### Why conversation persistence matters

The conversation table gives the app a real chat feel:

- Users can see their history
- AI responses remain visible after refresh
- The app feels like a live assistant instead of a one-shot generator

---

## Frontend Design Notes

The UI is intentionally styled to feel like a modern product rather than a default dashboard:

- Dark glass surfaces
- Soft gradient glows
- Rounded cards and buttons
- Animated loading states
- Responsive layout for mobile and desktop
- More expressive hero treatment on the landing page

Global styling lives in `client/src/index.css`, where the app theme, background, and shared effects are defined.

---

## Environment Variables

### Client

- `VITE_API_BASEURL` - optional API base URL for Axios, defaults to `/api`
- `VITE_AUTH_BASEURL` - optional auth base URL for Better Auth, defaults to `http://localhost:3000/api/auth`

### Server

- `TRUSTED_ORIGINS` - comma-separated list of allowed frontend origins
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Better Auth secret
- `BETTER_AUTH_URL` - Better Auth server URL
- `NODE_ENV` - runtime mode
- `GEMINI_API_KEY` or `AI_API_KEY` - AI provider key

> Do not commit real secret values into version control.

---

## Local Development

### Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### Run frontend

```bash
cd client
npm run dev
```

### Run backend

```bash
cd server
npm run server
```

### Build both

```bash
cd client
npm run build

cd ../server
npm run build
```

---

## Production Deployment

### Recommended setup

Deploy this as two services:

1. `client/` on Vercel.
2. `server/` on a Node host such as Render, Railway, or Fly.io.

That fits the current codebase best because the frontend is a Vite SPA and the backend is a long-running Express + Prisma server.

### Frontend on Vercel

Use `client/` as the Vercel project root.

If your API is hosted separately, set:

- `VITE_API_BASEURL=https://your-api-domain.com/api`
- `VITE_AUTH_BASEURL=https://your-api-domain.com/api/auth`

The client includes a Vercel rewrite so React Router refreshes work correctly.

### Backend on a Node host

Set these server environment variables:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `TRUSTED_ORIGINS`
- `GEMINI_API_KEY` or `AI_API_KEY`
- `NODE_ENV=production`

Example values:

- `BETTER_AUTH_URL=https://your-api-domain.com/api/auth`
- `TRUSTED_ORIGINS=https://your-vercel-app.vercel.app`

### Production checklist

1. Run `npm run build` in both `client/` and `server/`.
2. Make sure the database is reachable and migrated.
3. Confirm your frontend domain is listed in `TRUSTED_ORIGINS`.
4. Verify sign-in, project creation, revisions, and publishing over HTTPS.

### One-project deployment

If you want everything on one Vercel project, the backend would need to be refactored into serverless/API routes. That is a bigger change than a normal deploy, so the current codebase should be deployed as two services.

---

## Notes On Existing Dummy Data

The app includes `dummyProjects` for local fallback/demo behavior. These are used when API calls fail or when a sample preview is needed without live backend data.

---

## Implementation Highlights

- Chat-based revision loop after the site is already created
- Enter key submission in the sidebar
- Project state refresh after revision generation
- Version history with rollback support
- Public community preview page
- Save and download flows for generated HTML
- Cleaner animated UI on the landing page and builder screens
- Resilient AI helper with retries and model fallback

---

## Future Improvements

- Streaming AI responses into the sidebar
- Diff view between versions
- Richer element-level editing inside the preview
- Search and filter for projects
- Better code export formats beyond `index.html`
- Analytics for prompts, revisions, and publish activity

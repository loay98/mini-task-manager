# Mini Task Manager Monorepo

Production-structured full-stack monorepo with Laravel API, Next.js manager portal, and Expo worker app.

## Architecture Overview

- Backend: Laravel 11 REST API with JWT auth and role middleware
- Web: Next.js 15+ App Router (generated on latest Next.js), TypeScript, TailwindCSS, Zustand, Axios
- Mobile: Expo + React Native + Expo Router, TypeScript, React Native Paper, Zustand, Axios
- Database: PostgreSQL
- Auth: JWT via tymon/jwt-auth
- Local Dev: Docker Compose for PostgreSQL + API + Web
- Deploy Targets:
  - Backend: Render
  - Web: Vercel
  - Mobile: Expo EAS Build
  - Database: Railway PostgreSQL (or any managed Postgres)

## Monorepo Structure

- backend: Laravel API
- web: Manager-facing portal
- mobile: Worker-facing Expo app
- docker-compose.yml: Local container orchestration
- render.yaml: Render backend deployment blueprint

## Business Rules Implemented

Roles:
- manager
- worker

Task model:
- id
- title
- status (pending, completed)
- assignee_id
- timestamps

Permissions:
- Manager:
  - login
  - view all tasks
  - create task
  - assign task to worker
- Worker:
  - login
  - view own tasks
  - mark own assigned tasks as completed

## Backend API Details

Implemented with:
- Form Requests
- API Resources
- Role middleware
- Enum-based statuses/roles
- Pagination for task lists
- Centralized JSON exception responses
- Seeders + factories

Main backend files:
- app/Enums/TaskStatus.php
- app/Enums/UserRole.php
- app/Http/Middleware/RoleMiddleware.php
- app/Http/Controllers/Api
- app/Http/Requests
- app/Http/Resources
- app/Models/Task.php
- routes/api.php

### API Endpoints

**Authentication (Public)**
- `POST /api/auth/login` — Login with email and password; returns JWT token and user
- `POST /api/auth/logout` — Logout (requires authentication)

**Manager Endpoints**
- `GET /api/dashboard` — Fetch summary: task counts (total, pending, completed) and worker count
- `GET /api/tasks` — List all tasks with optional filters (search, status, assignee, assigned_by, sort_by, sort_order, pagination)
- `POST /api/tasks` — Create a new task (title, assignee_id optional, due_date optional)
- `PATCH /api/tasks/{id}` — Update a task (title, status, assignee_id, due_date)
- `DELETE /api/tasks/{id}` — Delete a task
- `GET /api/workers` — List all workers with optional filters (search, sort_by, sort_order, pagination)
- `POST /api/workers` — Create a new worker (name, email, password)
- `PATCH /api/workers/{id}` — Update a worker (name, email, password optional)
- `DELETE /api/workers/{id}` — Delete a worker

**Worker Endpoints**
- `GET /api/my-tasks` — List tasks assigned to the current worker (includes filters and pagination)
- `GET /api/my-tasks/counts` — Fetch task counts for the current worker (total, pending, completed)
- `PATCH /api/tasks/{id}/complete` — Mark a task as completed (worker can only mark own assigned tasks)

### Standard Response Envelope

Success:
- success: true
- message: string
- data: object | array

Error:
- success: false
- message: string
- errors: object (optional)

### Seeded Credentials

Manager:
- email: manager@test.com
- password: password

Worker:
- email: worker@test.com
- password: password

## Web Portal (Manager)

Features:
- Login page
- Protected dashboard
- JWT token handling via Axios interceptor + Zustand
- Create and assign tasks
- Task list with status badges
- Logout
- Loading and error states

Key web files:
- src/app/login/page.tsx
- src/app/dashboard/page.tsx
- src/proxy.ts
- src/lib/api.ts
- src/store/auth-store.ts

## Mobile App (Worker)

Features:
- Expo Router navigation
- Login screen
- My Tasks screen
- Pull-to-refresh
- Mark task completed
- Secure token persistence with expo-secure-store
- Logout

Key mobile files:
- app/login.tsx
- app/my-tasks.tsx
- app/_layout.tsx
- src/lib/api.ts
- src/store/auth-store.ts

## Environment Variables

### Backend (.env)

Copy from backend/.env.example and ensure:

- APP_NAME="Mini Task Manager API"
- APP_ENV=local
- APP_KEY=
- APP_DEBUG=true
- APP_URL=http://localhost:8000
- DB_CONNECTION=pgsql
- DB_HOST=postgres (docker) or your DB host
- DB_PORT=5432
- DB_DATABASE=mini_task_manager
- DB_USERNAME=mini_user
- DB_PASSWORD=mini_password
- AUTH_GUARD=api
- JWT_SECRET=
- JWT_TTL=60

### Web (.env.local)

Copy from web/.env.example:

- NEXT_PUBLIC_API_URL=http://localhost:8000/api

### Mobile (.env)

Copy from mobile/.env.example:

- EXPO_PUBLIC_API_URL=http://localhost:8000/api

## Local Development

## Option A: Docker (recommended)

From repository root:

1. Start services
   - docker compose up --build
2. Backend API
   - http://localhost:8000
3. Web app
   - http://localhost:3000

Notes:
- Docker starts PostgreSQL, backend, and web.
- Backend container runs composer install, generates keys, migrates, and seeds.
- Mobile runs outside Docker via Expo.

## Option B: Manual

Backend:
1. cd backend
2. composer install
3. cp .env.example .env
4. php artisan key:generate
5. php artisan jwt:secret
6. php artisan migrate --seed
7. php artisan serve

Web:
1. cd web
2. npm install
3. cp .env.example .env.local
4. npm run dev

Mobile:
1. cd mobile
2. npm install
3. copy .env.example to .env
4. npx expo start

## Deployment (Free/Affordable Platforms)

## Database: Supabase PostgreSQL

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. From the project settings, retrieve connection details:
   - **Host**: Found under Database settings (Connection string)
   - **Port**: 5432 (default)
   - **Database**: postgres (default)
   - **Username**: postgres (default)
   - **Password**: Your project password
3. Set these in your Render backend environment:
   - `DB_CONNECTION=pgsql`
   - `DB_HOST=your-supabase-host.supabase.co`
   - `DB_PORT=5432`
   - `DB_DATABASE=postgres`
   - `DB_USERNAME=postgres`
   - `DB_PASSWORD=your-supabase-password`

## Backend: Render

Files included:
- `render.yaml` — Blueprint definition
- `backend/Dockerfile` — Docker image config

Steps:
1. Sign up at [render.com](https://render.com).
2. Connect your GitHub repository.
3. Create a new Blueprint from this repository.
4. In `render.yaml`, configure environment variables (marked `sync: false`):
   - `APP_KEY`: Generate via `php artisan key:generate`
   - `JWT_SECRET`: Generate via `php artisan jwt:secret`
   - `APP_URL`: Your Render backend URL
   - `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`: From Supabase
5. Deploy the blueprint.
6. Verify:
   - Health: `GET https://your-render-backend-url/up`
   - Login: `POST https://your-render-backend-url/api/auth/login`

Deployment URL: `https://your-mini-task-manager-api.onrender.com`

## Web (Manager Portal): Vercel

Files included:
- `web/vercel.json` — Deployment config

Steps:
1. Sign up at [vercel.com](https://vercel.com).
2. Import your GitHub repository.
3. Configure:
   - **Root Directory**: `web`
   - **Environment Variables**:
     - `NEXT_PUBLIC_API_URL=https://your-render-backend-url/api`
4. Deploy.
5. Test login with manager@test.com / password

Deployment URL: `https://your-mini-task-manager-manager.vercel.app`

## Mobile (Worker App): Expo EAS

Files included:
- `mobile/eas.json` — EAS Build config
- `mobile/app.json` — Expo app config

Steps:
1. Sign up at [expo.dev](https://expo.dev).
2. Install EAS CLI: `npm install -g eas-cli`
3. From the mobile folder:
   ```bash
   cd mobile
   eas login
   eas build:configure
   ```
4. Update `eas.json` with Render backend URL:
   - Set `EXPO_PUBLIC_API_URL` to `https://your-render-backend-url/api`
5. Build:
   ```bash
   eas build -p android --profile preview
   eas build -p ios --profile production
   ```
6. Download APK/IPA from Expo dashboard or scan QR code.

Project slug: `mini-task-manager-worker`

## Practical Engineering Decisions

- Used role middleware instead of heavier policy graph for clarity and speed.
- Used enum-backed role/status for readability and safer condition checks.
- Used API Resources and a uniform response envelope for predictable clients.
- Used Axios interceptors and Zustand for straightforward auth flow.
- Kept architecture modular without unnecessary repository pattern overhead.

## Future Improvements

- Add refresh-token flow and token revocation endpoint.
- Add manager analytics (completed vs pending trends).
- Add task due dates, priority, and search filters.
- Add test coverage (Pest/PHPUnit, Playwright, Detox).
- Add CI pipeline for lint/type-check/build/test and Docker image scanning.

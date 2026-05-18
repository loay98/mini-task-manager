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

Public:
- POST /api/auth/login

Manager:
- GET /api/tasks
- GET /api/workers
- POST /api/tasks

Worker:
- GET /api/my-tasks
- PATCH /api/tasks/{id}/complete

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

## Deployment (Free Platforms)

## Database: Railway PostgreSQL

1. Create a Railway PostgreSQL service.
2. Copy host, port, database, username, and password.
3. Set Render backend environment variables:
   - DB_CONNECTION=pgsql
   - DB_HOST, DB_PORT (5432), DB_DATABASE, DB_USERNAME, DB_PASSWORD

## Backend: Render

Files included:
- render.yaml
- backend/Dockerfile

Steps:
1. Create a new Render Blueprint from this repository.
2. Set secrets/values marked sync: false in render.yaml.
3. Ensure APP_KEY and JWT_SECRET are generated secure values.
4. Deploy and verify /up and /api/auth/login.

Deployment placeholder:
- Backend URL: https://your-render-api-url

## Web: Vercel

Files included:
- web/vercel.json

Steps:
1. Import repository into Vercel.
2. Set project root to web.
3. Add env var NEXT_PUBLIC_API_URL=https://your-render-api-url/api
4. Deploy.

Deployment placeholder:
- Web URL: https://your-vercel-web-url

## Mobile: Expo EAS

Files included:
- mobile/eas.json

Steps:
1. cd mobile
2. npm install -g eas-cli
3. eas login
4. eas build:configure
5. Set EXPO_PUBLIC_API_URL to deployed backend API URL
6. Run build:
   - eas build -p android --profile preview
   - eas build -p ios --profile production

Deployment placeholder:
- Mobile project slug: mini-task-manager-worker

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

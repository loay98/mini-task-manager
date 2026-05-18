# Task Manager Mobile (Expo)

Expo managed app built for Expo Go using TypeScript, Axios, Zustand, React Query, and SecureStore.

## Requirements

- Node.js 20+
- Expo Go app installed on your device
- Reachable backend API URL in `.env`

## API Base URL

Create a `.env` file in this folder:

```env
EXPO_PUBLIC_API_URL=https://mini-task-manager-jlgq.onrender.com/api
```

The app reads `EXPO_PUBLIC_API_URL` at startup.

## Install

Dependencies were added with `npx expo install` for SDK compatibility.

```bash
npm install
```

## Run

```bash
npx expo start --clear
```

Then scan the QR code with Expo Go.

## Project Structure

```text
src/
  api/
  components/
  features/
    auth/
    tasks/
  store/
  hooks/
  utils/
  types/
```

## Backend Endpoints Used

- `POST /auth/login`
- `GET /my-tasks`
- `PATCH /tasks/:id/complete`

## Notes

- Auth token and user session are persisted with `expo-secure-store`.
- Axios request interceptor attaches bearer token automatically.
- Tasks use React Query with optimistic UI updates for completion and cache invalidation.

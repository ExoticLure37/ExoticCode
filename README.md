# ExoticCode

A collaborative coding and drawing platform.

## Overview

This project has a React frontend and an Express backend. It is built for shared coding sessions and drawing work in real time.

## Project structure

- `frontend/` — client app built with React and Vite
- `backend/` — server built with Express and Socket.IO
- `dockerfile` — container setup

## Tech stack

- Frontend: React, Vite, Monaco Editor, Tailwind CSS
- Backend: Node.js, Express, Socket.IO, MongoDB
- Real-time collaboration: Yjs / y-socket.io

## Run locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Notes

- The app is meant for collaborative work in the same project space.
- Frontend and backend are separated into their own folders for easier development.

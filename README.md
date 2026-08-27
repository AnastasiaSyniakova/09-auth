# NoteHub Authentication

A multi-page notes application built with Next.js App Router, TypeScript,
TanStack Query, and Axios. The notes list and note details routes combine
server-side prefetching with client-side cache hydration and interactions.

Project 9 adds cookie-based authentication, protected route groups, sign-in and
registration pages, dynamic authentication navigation, and profile viewing and
editing. Notes now use the authenticated NoteHub backend through separate
client and server API modules.

For local development, set `NEXT_PUBLIC_API_URL=http://localhost:3000`. On
Vercel, set `NEXT_PUBLIC_API_URL` to the deployed application URL.

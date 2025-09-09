# Get It Done

A tiny, polished to-do app built with **Next.js (App Router)**, **tRPC**, **Prisma**, **Tailwind**, and **GitHub OAuth**.  
Locally it uses **Postgres in Docker**; in production it uses **Railway** (DB) + **Vercel** (hosting).

## What it does
- **Auth-gated landing**: Home page prompts “Sign in with GitHub”.  
- **Tasks UI**: Add, edit, toggle, and delete tasks with a modern chrome/glass UI.  
- **Per-user data**: Tasks are scoped to the signed-in user (via NextAuth).  
- **Typesafe API**: tRPC procedures: `list`, `create`, `toggle`, `rename`, `remove`.

## Tech stack
- Next.js 15 (App Router) + Tailwind CSS
- tRPC (typed React hooks)
- Prisma + Postgres
- NextAuth (Auth.js v5) with GitHub provider
- Docker (local DB), Railway (prod DB), Vercel (hosting)

---

## Quick start (Local)

### 0) Prereqs
- Node 18+
- Docker Desktop
- GitHub OAuth app (for local): callback `http://localhost:3000/api/auth/callback/github`

### 1) Install
```bash
npm i

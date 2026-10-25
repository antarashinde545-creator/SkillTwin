# SkillTwin Full-Stack Hackathon Prototype

This bundle includes:
- `src/`: React/Vite SkillTwin frontend with login/create-account screens wired to backend endpoints
- `backend/`: Spring Boot 3.5 / Java 17 REST API with JWT auth and MySQL support
- `backend/docker-compose.yml`: MySQL 8.0 local development database

## Quick start
1. Start MySQL: open a terminal in `backend/` and run `docker compose up -d`.
2. Configure backend DB credentials as described in `backend/README.md`.
3. Start backend from `backend/`: `mvn spring-boot:run`.
4. In project root, create `.env.local` from `.env.example` (default API URL is `http://localhost:8080`).
5. Run frontend from project root: `npm install` then `npm run dev`.

## Vercel deployment
Only the frontend goes on Vercel. Deploy the Spring Boot API and MySQL separately. Set `VITE_API_BASE_URL` in Vercel to the public HTTPS backend URL, and set `FRONTEND_ORIGIN` on the backend to the exact Vercel origin. See `backend/README.md`.

## Honest scope note
Authentication is connected to the Spring Boot API. The dashboard's skill analysis and career roadmap are still prototype/sample logic and are not yet stored in MySQL. The initial backend persists users only; profile, skills, projects and roadmap APIs can be added next.

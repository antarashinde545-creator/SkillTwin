# SkillTwin Backend (Spring Boot + MySQL 8.0)

## Requirements
- JDK 17+
- Maven 3.9+ (or use IntelliJ's Maven integration)
- Docker Desktop, or a local MySQL 8.0 server

## 1. Start MySQL 8.0 using Docker
From this `backend` folder:
```bash
docker compose up -d
```
This creates database `skilltwin` and a local development account. For local development only:
- Host: `localhost`
- Port: `3306`
- Database: `skilltwin`
- Username: `skilltwin_app`
- Password: `skilltwin_app_password`

## 2. Configure the Spring Boot connection
The default application properties use `root` / `change_me`. To use the Docker Compose credentials, set environment variables before starting Spring:
- `DB_USERNAME=skilltwin_app`
- `DB_PASSWORD=skilltwin_app_password`
- `JWT_SECRET=replace-with-a-long-random-secret-at-least-32-bytes`

Alternatively, edit `src/main/resources/application.properties` to set `spring.datasource.username=skilltwin_app` and `spring.datasource.password=skilltwin_app_password`.

## 3. Start backend
From the `backend` directory:
```bash
mvn spring-boot:run
```
Check health at http://localhost:8080/api/health . Hibernate creates the `users` table on first run (`ddl-auto=update`).

## 4. API endpoints
### Register
`POST http://localhost:8080/api/auth/register`
```json
{"name":"Demo Student","email":"student@example.com","password":"password123"}
```
### Login
`POST http://localhost:8080/api/auth/login`
```json
{"email":"student@example.com","password":"password123"}
```
Successful response:
```json
{"token":"<JWT>","user":{"id":1,"name":"Demo Student","email":"student@example.com"}}
```
Protected routes require `Authorization: Bearer <JWT>`.

## 5. Connect frontend
In the frontend project root, copy `.env.example` to `.env.local` and set:
```env
VITE_API_BASE_URL=http://localhost:8080
```
Restart Vite after changing environment variables.

## 6. Deploy
- Deploy the React/Vite frontend to Vercel.
- Deploy this Spring Boot backend to a Java-capable host (for example, a container host or VM).
- Use a managed MySQL 8.0-compatible database or a properly secured MySQL server reachable by the backend.
- Configure `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, and `FRONTEND_ORIGIN` as backend environment variables.
- Set Vercel's `VITE_API_BASE_URL` to the public HTTPS URL of your backend and redeploy.
- Set `FRONTEND_ORIGIN` to your exact Vercel frontend origin (e.g. `https://your-project.vercel.app`).
- Never commit real passwords or JWT secrets. The included Docker credentials are development-only.

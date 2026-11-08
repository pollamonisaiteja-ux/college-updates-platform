# CampusConnect

A student-built campus community platform prototype for campus updates, lost-and-found posts, and issue reporting.

> **Status:** Learning prototype. The landing-page feed currently stores demo posts in browser local storage. The Express/MongoDB API is a separate backend foundation and is not yet fully integrated with the frontend. This is not an official VIT-AP service.

## Stack
- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js 18+, Express 4, Mongoose, MongoDB
- Authentication: bcryptjs and JSON Web Tokens

## Structure
```
backend/
  middleware/auth.js
  models/{User,Post,Issue,LostFound}.js
  routes/{auth,posts,issues,lostFound}.js
  server.js
tests/smoke.test.js
.env.example
package.json
web.html
main.css
main.js
```
The repository also contains older standalone frontend pages and legacy root-level JavaScript files that have not all been migrated or connected to the API.

## Run locally
1. Install Node.js 18+ and MongoDB (local or Atlas).
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `MONGODB_URI` and replace `JWT_SECRET` with a random secret of at least 32 characters.
5. Run `npm run dev`.
6. Open `http://localhost:5000`.

Never commit `.env`. In production, configure `CLIENT_URL` with the exact allowed frontend origin(s), separated by commas.

## API
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | Register/login |
| GET/PATCH | `/api/auth/me` | Read/update own profile |
| GET/POST | `/api/posts` | List/create posts |
| PATCH/DELETE | `/api/posts/:id/like`, `/api/posts/:id` | Like/soft-delete post |
| GET/POST | `/api/lost-found` | List/create items |
| PATCH | `/api/lost-found/:id/status` | Update item status |
| GET | `/api/issues`, `/api/issues/stats` | List issues and counts |
| POST | `/api/issues` | Create issue |
| PATCH | `/api/issues/:id/upvote`, `/api/issues/:id/status` | Upvote/change status |
| GET | `/api/health` | Server/database health |

## Security and limitations
- JWT fallback secrets were removed; a configured secret is required.
- CORS is restricted to configured origins.
- Request body size is limited.
- Feed content is inserted with DOM text nodes, not HTML interpolation.
- This is not production-ready. Add rate limiting, email verification, full route/database tests, moderation controls, and deployment hardening before handling real student data.

Run the current smoke tests with `npm test`. They are intentionally limited and do not replace API integration tests.

## Roadmap
- [ ] Connect frontend screens to backend API.
- [ ] Add comprehensive route/model tests and CI.
- [ ] Add rate limiting, email verification, and moderation UI.
- [ ] Deploy with secure environment configuration.

## License
MIT

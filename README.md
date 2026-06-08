# 🎓 CampusConnect — VIT-AP Community Platform

> A full-stack web platform for VIT-AP University students to share daily updates, report lost & found items, and raise campus issues — all in one place.

---

## 🌐 Live Preview

> _Coming soon — deploy link will go here_

---

## ✨ Features

| Feature | Description |
|---|---|
| 📢 **Campus Feed** | Post updates, events, notices — filtered by category |
| 🔍 **Lost & Found** | Report lost items or found ones; mark as resolved |
| ⚠️ **Issue Reporting** | Report WiFi/AC/hostel problems; upvote to escalate priority |
| 🔒 **Auth** | VIT-AP email–only accounts with JWT-secured sessions |
| 📱 **Responsive** | Works on mobile, tablet, and desktop |

---

## 🛠️ Tech Stack

**Frontend**
- HTML5, CSS3, Vanilla JavaScript
- Google Fonts (Syne + DM Sans)
- LocalStorage for offline-first demo mode

**Backend**
- Node.js + Express.js
- RESTful API architecture
- JWT authentication (jsonwebtoken + bcryptjs)

**Database**
- MongoDB with Mongoose ODM

---

## 📂 Project Structure

```
campus-connect/
│
├── frontend/
│   ├── index.html              # Home page + feed
│   ├── assets/
│   │   ├── css/main.css        # All styles
│   │   └── js/main.js          # Feed, posts, interactions
│   └── pages/
│       ├── login.html          # Login page
│       ├── signup.html         # Multi-step signup
│       ├── lost-found.html     # Lost & Found board
│       └── issues.html         # Issue reporting
│
├── backend/
│   ├── server.js               # Express app entry point
│   ├── middleware/
│   │   └── auth.js             # JWT protect + restrictTo
│   ├── models/
│   │   ├── User.js             # User schema (bcrypt, virtuals)
│   │   ├── Post.js             # Feed posts + likes + comments
│   │   ├── LostFound.js        # Lost & found items
│   │   └── Issue.js            # Campus issues + upvotes
│   └── routes/
│       ├── auth.js             # /api/auth/*
│       ├── posts.js            # /api/posts/*
│       ├── lostFound.js        # /api/lost-found/*
│       └── issues.js           # /api/issues/*
│
├── .env.example                # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/pollamonisaiteja-ux/college-updates-platform.git
cd college-updates-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env — add your MongoDB URI and JWT secret

# 4. Start the backend server
npm run dev

# 5. Open the frontend
# Open frontend/index.html in your browser
# OR serve it with Live Server (VS Code extension)
```

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/campus-connect` |
| `JWT_SECRET` | Secret for signing JWTs | `your_secret_here` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new student account |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user (protected) |
| PATCH | `/api/auth/me` | Update profile (protected) |

### Posts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts` | Get all posts (paginated) |
| POST | `/api/posts` | Create post (auth required) |
| PATCH | `/api/posts/:id/like` | Toggle like (auth required) |
| POST | `/api/posts/:id/comments` | Add comment (auth required) |
| DELETE | `/api/posts/:id` | Delete post (owner/admin) |

### Lost & Found
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/lost-found` | Get all items (filterable) |
| POST | `/api/lost-found` | Post item (auth required) |
| PATCH | `/api/lost-found/:id/status` | Update status (owner/admin) |
| DELETE | `/api/lost-found/:id` | Delete item (owner/admin) |

### Issues
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/issues` | Get all issues (filterable) |
| GET | `/api/issues/stats` | Get summary stats |
| POST | `/api/issues` | Report issue (auth required) |
| PATCH | `/api/issues/:id/upvote` | Toggle upvote (auth required) |
| PATCH | `/api/issues/:id/status` | Update status (admin only) |
| DELETE | `/api/issues/:id` | Delete issue (owner/admin) |

---

## 🗺️ Development Roadmap

- [x] **Phase 1** — Frontend: Home, Login, Signup, Lost & Found, Issues pages
- [x] **Phase 2** — Backend: Express server, REST API routes
- [x] **Phase 3** — Database: MongoDB models (User, Post, LostFound, Issue)
- [ ] **Phase 4** — Connect frontend to backend API (fetch/axios)
- [ ] **Phase 5** — Real-time notifications (Socket.io)
- [ ] **Phase 6** — Admin dashboard
- [ ] **Phase 7** — Deploy (Render + MongoDB Atlas)

---

## 🤝 Contributing

Pull requests welcome! For major changes, open an issue first.

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
```

---

## 📄 License

MIT © 2026 CampusConnect — VIT-AP University

---

> Built with 💛 by a VIT-AP student @pollamonisaiteja-ux, for VIT-AP students.

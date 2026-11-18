# Smart Society: Apartment Management System (MERN)

One app for four roles: **admin**, **resident**, **security** and **maintenance**.

## Features
- JWT login/signup (public signup creates residents; admins create other roles)
- Role-based dashboards with live stats
- Resident management (admin CRUD for residents and staff)
- Complaints: residents raise, admin assigns, maintenance updates status
- Visitors: security logs entry/exit, residents pre-register guests
- Maintenance bills: admin generates, residents pay (demo payment, no gateway)
- Announcements: admin CRUD, everyone reads

## Folder structure
```
smart-society/
├── client/   React + Vite + Tailwind
└── server/   Express + MongoDB (Mongoose)
```

## Run it

You need Node 18+ and MongoDB (local, or a free MongoDB Atlas URI).

**1. Backend**
```bash
cd server
npm install
cp .env.example .env      # edit MONGO_URI / JWT_SECRET if needed
npm run seed              # creates demo accounts
npm run dev               # http://localhost:5000
```

**2. Frontend** (new terminal)
```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

## Demo logins (after `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Admin | admin@society.com | admin123 |
| Resident | resident@society.com | resident123 |
| Security | security@society.com | security123 |
| Maintenance | maintenance@society.com | maintenance123 |

## Try the full workflow
1. Log in as **resident** → raise a complaint.
2. Log in as **admin** → assign it to Mohan Maintenance.
3. Log in as **maintenance** → mark it resolved.
4. Log back in as **resident** → see the updated status.

## API overview
| Route | Notes |
|---|---|
| `POST /api/auth/signup`, `/login`, `GET /me` | auth |
| `/api/users` | admin CRUD |
| `/api/complaints` | role-filtered; admin assigns |
| `/api/visitors` | security/admin entry + exit; resident pre-register |
| `/api/bills` | admin generate; resident pay |
| `/api/announcements` | admin CRUD |
| `/api/stats` | role-specific dashboard numbers |

## Ideas for next steps
Amenity booking, Socket.io real-time notifications, payment gateway (Razorpay), charts on the admin dashboard, deployment (Render + Vercel).

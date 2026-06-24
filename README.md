# 🌿 WellNest V2

> A full-stack mental wellness & counselling platform for women — featuring role-based portals for Users, Counsellors, and Admins.

---

## 🛠 Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | HTML5, CSS3, Vanilla JavaScript     |
| Backend     | Node.js, Express.js                 |
| Database    | MongoDB (Local or Atlas)            |
| Video       | Jitsi Meet                          |
| Email       | EmailJS                             |

---

## 📁 Project Structure

```
WellNest/
├── config/
│   └── db.js               # MongoDB connection
├── middleware/
│   └── adminAuth.js        # Admin route protection
├── models/
│   ├── User.js
│   ├── Counsellor.js
│   ├── Slot.js
│   └── Booking.js
├── routes/
│   ├── auth.js             # User & counsellor login/register
│   ├── admin.js            # Admin CRUD
│   ├── counsellor.js       # Slot & booking management
│   └── general.js          # Public endpoints
├── public/
│   ├── index.html          # Landing page
│   ├── admin/              # Admin portal pages
│   ├── counsellor/         # Counsellor portal pages
│   ├── user/               # User portal pages
│   └── assets/             # CSS, JS utilities, images
├── .env                    # Your local secrets (never commit)
├── .env.example            # Template for .env
├── server.js               # App entry point
└── package.json
```

---

## 🚀 Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- **MongoDB** — choose one:
  - **Local**: [Download MongoDB Community Server](https://www.mongodb.com/try/download/community) and start it (`mongod`)
  - **Cloud**: Create a free cluster on [MongoDB Atlas](https://cloud.mongodb.com)

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/<your-username>/WellNest.git
cd WellNest
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Configure environment variables

Copy the example file and edit it:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `.env` and set your values (see [Environment Variables](#environment-variables) below).

### Step 4 — Start the server

```bash
node server.js
```

You should see:

```
🚀 Server running on http://localhost:3000
✅ MongoDB Connected: 127.0.0.1
```

Open **http://localhost:3000** in your browser.

---

### Optional: Auto-restart on file changes

Install `nodemon` globally to auto-restart on every save:

```bash
npm install -g nodemon
nodemon server.js
```

---

## ⚙️ Environment Variables

Edit your `.env` file with the following values:

| Variable                      | Description                                                                 | Example / Default                                   |
|-------------------------------|-----------------------------------------------------------------------------|-----------------------------------------------------|
| `PORT`                        | Port the server listens on                                                  | `3000`                                              |
| `NODE_ENV`                    | Environment (`development` or `production`)                                 | `development`                                       |
| `MONGO_URI`                   | MongoDB connection string                                                   | `mongodb://127.0.0.1:27017/wellnest` (local)        |
| `CORS_ORIGIN`                 | Allowed frontend origin (leave blank for local dev)                         | `https://yourapp.netlify.app`                       |
| `ADMIN_SECRET`                | Secret key for admin login                                                  | Any strong string                                   |
| `EMAILJS_SERVICE_ID`          | EmailJS service ID                                                          | From [emailjs.com](https://www.emailjs.com) dashboard |
| `EMAILJS_TEMPLATE_ID`         | Template ID for general emails                                              | From EmailJS dashboard                              |
| `EMAILJS_BOOKING_TEMPLATE_ID` | Template ID for booking confirmation emails                                 | From EmailJS dashboard                              |
| `EMAILJS_PUBLIC_KEY`          | EmailJS public (user) key                                                   | From EmailJS dashboard                              |
| `JITSI_DOMAIN`                | Jitsi server domain                                                         | `meet.jit.si`                                       |

### Using Local MongoDB

If you have MongoDB installed locally, the default URI just works:

```env
MONGO_URI=mongodb://127.0.0.1:27017/wellnest
```

No username or password needed for a default local install.

### Using MongoDB Atlas (Cloud)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create a free cluster.
2. Under **Database Access**, create a user with read/write rights.
3. Under **Network Access**, add `0.0.0.0/0` (or your IP).
4. Click **Connect → Drivers** and copy the connection string.
5. Replace `<username>`, `<password>`, and `<cluster>` in your `.env`:

```env
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/wellnest?retryWrites=true&w=majority
```

---

## 🔐 Portal Access

All portals are served from `http://localhost:3000`.

| Portal        | URL                                      | How to access                                             |
|---------------|------------------------------------------|-----------------------------------------------------------|
| Landing page  | `/`                                      | Public                                                    |
| User Sign Up  | `/user/signup.html`                      | Register with name, email, Aadhar, phone, password        |
| User Login    | `/user/login.html`                       | Use registered email + password                           |
| Counsellor Login | `/counsellor/clogin.html`            | Added by Admin; login with email + password               |
| Admin Login   | `/admin/adminlogin.html`                 | Use email `admin@wellnest.com` + `ADMIN_SECRET` from `.env` |

> **Admin email is fixed** as `admin@wellnest.com`. The password is whatever you set as `ADMIN_SECRET` in `.env`.

---

## ✨ Features

### 👤 User Portal
- Register & login
- Browse and book counselling slots
- Join video sessions (Jitsi Meet)
- Legal awareness (Know Your Rights)
- National & local helpline directory
- Post-session feedback

### 🩺 Counsellor Portal
- Login with credentials set by Admin
- Create availability slots
- View upcoming bookings
- Launch video consultation rooms

### 🔐 Admin Portal
- Secure admin login (no public link from landing page)
- Add / remove counsellors
- View all registered users

---

## 🌐 Deploying to Production

### Backend (e.g., Render / Railway)

1. Push your code to GitHub.
2. Create a new Web Service on [Render](https://render.com) or [Railway](https://railway.app).
3. Set **Build Command**: _(leave blank)_  
   Set **Start Command**: `node server.js`
4. Add all environment variables from your `.env` in the dashboard.
5. Set `MONGO_URI` to your Atlas connection string.
6. Set `NODE_ENV=production`.

### Frontend

The frontend is served by Express as static files — no separate deployment needed unless you split them. If using Netlify/Vercel for the frontend, set `CORS_ORIGIN` to your deployed frontend URL.

---

## 📝 License

This project is for educational demonstration purposes.

# 🌿 WellNest

> A modern, full-stack digital sanctuary for mental wellness and professional counselling — featuring role-based portals for Users, Counsellors, and Admins.

---

## ✨ Key Features

- **👤 User Portal**
  - Account registration and secure login
  - Browse available counselling slots and book appointments
  - Integrated live 1-on-1 video consultations via Jitsi Meet
  - Legal awareness resources ("Know Your Rights")
  - Emergency & support helpline directory
  - Post-session feedback & review submission

- **🩺 Counsellor Portal**
  - Dedicated login for registered counsellors
  - Create and manage custom availability time slots
  - View upcoming booked appointments
  - One-click launch for video consultation rooms

- **🔐 Admin Portal**
  - Secure administrative dashboard
  - Onboard, manage, and remove counsellor profiles
  - Overview of registered users and platform activity

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Vanilla CSS), JavaScript (ES6+) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB & Mongoose |
| **Integrations** | Jitsi Meet API (Video Consultation), EmailJS (Notifications) |

---

## 📁 Project Structure

```text
WellNest/
├── config/
│   └── db.js              # Database connection setup
├── middleware/
│   └── adminAuth.js       # Admin authorization guard
├── models/
│   ├── User.js            # User data model
│   ├── Counsellor.js      # Counsellor data model
│   ├── Slot.js            # Availability slot model
│   └── Booking.js         # Appointment booking model
├── routes/
│   ├── auth.js            # Authentication endpoints
│   ├── admin.js           # Admin portal API
│   ├── counsellor.js      # Counsellor & slot management API
│   └── general.js         # Public API routes
├── public/
│   ├── index.html         # WellNest landing page
│   ├── admin/             # Admin portal interface
│   ├── counsellor/        # Counsellor portal interface
│   ├── user/              # User portal interface
│   └── assets/            # CSS styles, JS scripts, images & logos
├── .env.example           # Template for environment configuration
├── server.js              # Application entry point
└── package.json           # Dependencies and scripts
```

---

## 🚀 Getting Started

Follow these instructions to set up and run WellNest locally.

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) installed locally OR a [MongoDB Atlas](https://cloud.mongodb.com/) cluster

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/kamalesh2602/WellNest.git
cd WellNest
```

---

### Step 2: Install Dependencies

```bash
npm install
```

---

### Step 3: Configure Environment Variables

Create a `.env` file by copying the template:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**
```bash
cp .env.example .env
```

Open `.env` and set your configuration values (see [Environment Variables](#-environment-variables)).

---

### Step 4: Run the Application

**Development Mode (Auto-restart on save):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

Once running, access the application in your browser:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## ⚙️ Environment Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `3000` |
| `NODE_ENV` | Application environment | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/wellnest` |
| `ADMIN_SECRET` | Secret password for admin login | `your_secure_admin_password` |
| `EMAILJS_SERVICE_ID` | EmailJS service identifier | `service_xxxxxxx` |
| `EMAILJS_TEMPLATE_ID` | General email template ID | `template_xxxxxxx` |
| `EMAILJS_BOOKING_TEMPLATE_ID` | Booking confirmation template ID | `template_xxxxxxx` |
| `EMAILJS_PUBLIC_KEY` | EmailJS public key | `user_xxxxxxx` |
| `JITSI_DOMAIN` | Jitsi Meet server domain | `meet.jit.si` |

---

## 🔑 Portal Access & Routes

| Portal | Route | Access & Notes |
| :--- | :--- | :--- |
| **Landing Page** | `/` | Public welcome page |
| **User Sign Up** | `/user/signup.html` | Register a user account |
| **User Login** | `/user/login.html` | User login screen |
| **Counsellor Login** | `/counsellor/clogin.html` | Counsellor login (accounts added by Admin) |
| **Admin Portal** | `/admin/admin.html` | Email: `admin@wellnest.com`<br>Password: Set via `ADMIN_SECRET` in `.env` |

---

## 📄 License

This project is open-source and intended for educational and demonstration purposes.

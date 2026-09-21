# Syntellos AI — Enterprise Backend API (MVC Pattern)

A clean, production-grade REST API backend built in **Classic MVC Architecture** with **Node.js, Express.js, MySQL / SQLite, Nodemailer, and JWT Authentication** for the Syntellos AI web platform.

---

## 📁 MVC Project Structure

```
backend/
├── app.js                   # Main application entry point (run with `node app.js`)
├── package.json             # NPM configuration and scripts
├── .env                     # Environment variables
├── .env.example             # Example environment template
├── README.md                # Comprehensive documentation
├── config/
│   ├── db.js                # Database connection (MySQL pool & SQLite fallback)
│   ├── env.js               # Environment configuration
│   └── mailer.js            # Nodemailer transport & trigger dispatchers
├── controllers/
│   ├── authController.js    # Admin login, password management
│   ├── blogController.js    # Public & Admin Blog CMS CRUD operations
│   ├── leadController.js    # Consultation brief capture & CSV export
│   ├── newsletterController.js # Subscriber management & email broadcasts
│   └── statsController.js   # Admin metrics & dashboard summaries
├── models/
│   ├── blogModel.js         # Blog schema queries & views
│   ├── leadModel.js         # Leads database queries & metrics
│   ├── subscriberModel.js   # Subscribers database queries
│   └── userModel.js         # Admin user authentication queries
├── views/
│   └── emailTemplates.js    # Branded responsive HTML email templates
├── routes/
│   ├── authRoutes.js        # /api/auth routes
│   ├── blogRoutes.js        # /api/blogs routes
│   ├── leadRoutes.js        # /api/leads routes
│   ├── newsletterRoutes.js  # /api/newsletter routes
│   ├── statsRoutes.js       # /api/stats routes
│   └── index.js             # Root API router (/api)
├── middleware/
│   ├── auth.js              # JWT authentication & route guard
│   ├── error.js             # Centralized 404 & error handlers
│   └── validate.js          # Input validation helpers
├── utils/
│   └── logger.js            # Formatted console logger
├── scripts/
│   ├── initDb.js            # Database table creation
│   └── seed.js              # Initial seed for admin, blogs, leads & subscribers
└── test/
    └── api.test.js          # Automated integration test suite
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start the Server
- **Run directly with Node:**
  ```bash
  node app.js
  ```
- **Run in Development mode (with auto-reload):**
  ```bash
  npm run dev
  ```
- **Run Automated Test Suite:**
  ```bash
  npm test
  ```

---

## 🔑 Default Admin Credentials

- **Email:** `admin@syntellosai.com`
- **Password:** `Admin@Syntellos2026`

---

## 📡 API Endpoints Reference

### 1. Health Check
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Service status and timestamp | Public |

---

### 2. Leads Engine (`/api/leads`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/leads` | Submit consultation brief / lead | Public |
| `GET` | `/api/leads` | List leads (query: `intent`, `status`, `search`, `page`, `limit`) | Admin |
| `GET` | `/api/leads/:id` | Get single lead by ID | Admin |
| `PATCH` | `/api/leads/:id` | Update status (`new`, `contacted`, `in_progress`, `converted`, `closed`) & internal notes | Admin |
| `DELETE` | `/api/leads/:id` | Delete lead | Admin |
| `GET` | `/api/leads/export` | Download leads as `.csv` file | Admin |
| `GET` | `/api/leads/stats` | Lead metrics by intent and status | Admin |

#### `POST /api/leads` Payload:
```json
{
  "name": "Rajesh Sharma",
  "email": "rajesh.sharma@enterprise.in",
  "phone": "+91 98112 34567",
  "organization": "NCR Automotive Components Ltd",
  "city": "Gurugram, Haryana",
  "intent": "Register as Client (Need Lab / Solution Setup)",
  "message": "Looking to deploy Autonomous Mobile Robots (AMRs) for warehouse logistics."
}
```

---

### 3. Newsletter Engine (`/api/newsletter`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/newsletter/subscribe` | Subscribe to journal updates | Public |
| `GET` | `/api/newsletter/unsubscribe` | Unsubscribe via token or email | Public |
| `GET` | `/api/newsletter/subscribers` | List all subscribers (paginated) | Admin |
| `GET` | `/api/newsletter/stats` | Subscriber metrics (total, active, unsubscribed) | Admin |
| `POST` | `/api/newsletter/broadcast` | Send manual email broadcast to active subscribers | Admin |
| `DELETE` | `/api/newsletter/subscribers/:id` | Remove subscriber | Admin |

---

### 4. Blog CMS Engine (`/api/blogs`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/blogs` | Get published blogs (query: `category`, `search`, `page`, `limit`, `sortBy`) | Public |
| `GET` | `/api/blogs/categories` | Get category list with post counts | Public |
| `GET` | `/api/blogs/slug/:slug` | Get full blog by slug (increments views & returns related posts) | Public |
| `GET` | `/api/blogs/admin/all` | Get all blogs (published + drafts) | Admin |
| `GET` | `/api/blogs/admin/stats` | Blog statistics (total, published, drafts, views) | Admin |
| `GET` | `/api/blogs/admin/:id` | Get single blog for editing | Admin |
| `POST` | `/api/blogs/admin` | Create new blog post | Admin |
| `PUT` | `/api/blogs/admin/:id` | Update existing blog post | Admin |
| `PATCH` | `/api/blogs/admin/:id/publish` | Toggle publish status | Admin |
| `POST` | `/api/blogs/admin/:id/broadcast` | Broadcast blog email alert to subscribers | Admin |
| `DELETE` | `/api/blogs/admin/:id` | Delete blog post | Admin |

---

### 5. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Admin login & receive JWT token | Public |
| `GET` | `/api/auth/me` | Verify token & get current admin info | Admin |
| `POST` | `/api/auth/change-password` | Update admin password | Admin |

---

### 6. Admin Dashboard Stats (`/api/stats`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/stats/dashboard` | Overall dashboard metrics, recent leads & blogs | Admin |

---

## ✉️ Automated Email Triggering

1. **New Blog Alerts**: When a post is published (`is_published: true`), an HTML email is triggered to all active subscribers.
2. **Consultation Brief Acknowledgement**: User receives a branded confirmation email upon submitting a lead.
3. **Admin Alert**: Admin notification email receives instant lead alerts.
4. **Newsletter Welcome**: Subscribers receive a welcome email with a 1-click unsubscribe link.


---

## SMTP + Newsletter Admin

The admin panel now includes a **Newsletter** workspace for subscriber management, SMTP verification, and manual broadcasts.

Set these backend environment variables before sending email:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password-or-app-password
SMTP_FROM="Syntellos AI" <verified-sender@example.com>
FRONTEND_URL=https://your-frontend-domain.com
```

For port `587`, keep `SMTP_SECURE=false` so the provider can upgrade the connection with STARTTLS. For implicit TLS on port `465`, use `SMTP_SECURE=true`.

Admin email controls:
- `GET /api/newsletter/mail-status` — shows whether SMTP is configured.
- `POST /api/newsletter/mail-status/verify` — verifies the SMTP connection without sending a campaign.
- `POST /api/newsletter/broadcast` — sends a branded newsletter to active subscribers.
- `POST /api/blogs/admin/:id/broadcast` — sends a published blog alert to active subscribers.

Every blog alert and manual newsletter contains a subscriber-specific unsubscribe link. Blog alert links open the frontend route `/blogs/:slug`.


---

## Rich Blog Editor Media

The blog admin editor supports rich HTML content, Word/Google Docs paste, images, videos, YouTube embeds, file attachments, drag-and-drop and pasted screenshots.

Authenticated uploads use:

```text
POST /api/media/upload
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
field: file
```

Uploaded files are served from `/uploads/...`. The backend accepts files up to 100 MB and blocks common executable/script extensions.

For production, set `PUBLIC_URL` to the public backend origin if the platform's forwarded host/protocol is not sufficient:

```env
PUBLIC_URL=https://api.example.com
```

The default upload storage is local disk under `backend/uploads`. If the backend is deployed on ephemeral infrastructure, use persistent disk storage or replace the upload storage with an object-storage service before relying on uploads long term.

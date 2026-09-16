# 🏥 Healthcare Management System (HMS)

A healthcare management platform built on Django REST Framework and React, with **JWT authentication on every endpoint**, **admin-only registration**, and **environment-based configuration**. No patient data is reachable without a valid token.

## ✨ Key Features

### 🔐 Security & Authentication

- **Auth Required**: Every API endpoint requires authentication — no public PHI browsing
- **JWT Bearer Tokens**: Short-lived access tokens (5 min) + rotating refresh tokens (1 day) via `djangorestframework-simplejwt`, blacklisted on rotation — a stolen refresh token is usable exactly once
- **Login Throttling**: rate-limited (`5/min` per client) against brute force / credential stuffing
- **Role Gate on Writes**: any authenticated user may read; only staff accounts may create, update, or delete
- **Audit Logging**: every create/update/delete records who did it, to what, and when
- **Admin-Only Registration**: Staff registration restricted to administrators, with real password-strength validation enforced
- **Content-Security-Policy**: a strict CSP (no `unsafe-inline`, verified against the real admin/browsable-API/SPA pages) on both the API and the frontend
- **Cookie + Header Hardening**: `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `X_FRAME_OPTIONS=DENY` auto-enabled in non-DEBUG

### 📊 Healthcare Management

- **Patient Management**: 447+ patient records with Canadian Medicare numbers
- **Staff Management**: 303+ healthcare professionals (doctors, nurses, administrators)
- **Facility Management**: 11+ medical facilities (hospitals, clinics, pharmacies)
- **Infection Tracking**: Monitor and manage infection cases
- **Vaccination Records**: Track immunization history
- **Employee Schedules**: Manage staff work schedules
- **Analytics Dashboard**: Real-time charts and healthcare statistics

### 🎨 Modern Development Experience

- **Environment Configuration**: `.env` files for both frontend and backend
- **Auto-Port Detection**: Backend automatically uses PORT from .env
- **Centralized API Config**: Single source of truth for all API endpoints
- **Pre-commit Hooks**: 13 quality checks (flake8, isort, ESLint, TypeScript, prettier, black), also enforced in CI
- **Smooth Search UX**: Debounced search without input focus loss
- **Responsive Design**: Mobile-first design with Tailwind CSS

## 🛠️ Technology Stack

### Backend

- **Django 5.2** - Web framework (uses `models.CompositePrimaryKey` for the join tables)
- **Django REST Framework** - RESTful API
- **MySQL 8.0+** - The database. Required, not optional: the schema uses MySQL `enum` columns and the `Persons.UUID` backfill relies on MySQL's `UUID()`.
- **python-dotenv** - Environment variable management
- **JWT Authentication** - access + refresh tokens via `djangorestframework-simplejwt`

### Frontend

- **React 19.1.1** - UI library
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **Heroicons** - Beautiful icons

### Development Tools

- **Pre-commit** - Git hook management
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Flake8** - Python linting
- **isort** - Python import sorting
- **Black** - Python code formatting

## 🚀 Quick Start

### Prerequisites

- **Python 3.13** (matches CI)
- **Node.js 16+** (recommended: 18+)
- **MySQL 8.0+**
- **Git**

### Installation

```bash
# Clone repository
git clone https://github.com/Jpuntul/HMS.git
cd HMS

# Backend setup
cd back
python -m venv venv && source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file (update PORT, SECRET_KEY, DB credentials as needed)
cat > .env << EOF
PORT=8001
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_NAME=hms_db
DB_USER=root
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=3306
EOF

# Run migrations and start server
python manage.py migrate
python manage.py runserver  # Auto-detects PORT from .env

# Frontend setup (new terminal)
cd ../front
npm install

# Create .env file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:8001
VITE_PORT=5173
EOF

npm run dev
```

### Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001
- **Admin Panel**: http://localhost:8001/admin (requires superuser)

> **🔒 Security Note**: Registration is **admin-only**. Create admin account with `python manage.py createsuperuser`, then use "Register User" button in the app (visible only to staff).

## 🎯 How It Works

### Authentication Flow

#### 🔒 No Public Access

There is no anonymous read tier. Every API endpoint returns **401** without a
valid Bearer token — including the analytics aggregates, which leak facility
and demographic structure. Unauthenticated requests to any frontend route
bounce to `/login`.

#### 👀 Authenticated Reads (Any Logged-In Account)

Log in and every record is readable — this tier does not yet distinguish
a nurse from a receptionist from a doctor (see the RBAC note below):

- ✅ 447+ patient records with demographics and medical history
- ✅ 303+ healthcare staff members with roles
- ✅ 11+ medical facilities with capacity and services
- ✅ Infection tracking, vaccination history, employee schedules
- ✅ Analytics dashboard with charts

#### ✏️ Writes (Staff Accounts Only)

Creating, editing, or deleting anything requires `is_staff` — a logged-in
account that isn't staff can read every page above but gets a real
`403 Forbidden` (not a silent failure) on any write:

- ✅ Full CRUD on all entities, for staff accounts
- Every write is recorded in an audit log (actor, action, record, timestamp)

This is a first, deliberately coarse RBAC pass — staff vs. everyone,
not yet role-specific (a nurse and an administrator currently have the
same write access once both are staff). See
[`notes/RBAC_STAFF_WRITE_GATE_2026-09-09.md`](notes/RBAC_STAFF_WRITE_GATE_2026-09-09.md).
`notes/` is private by default (see `notes/INDEX.md`) — this file and a
handful of others from the same pass are published exceptions.

#### 🔐 Admin-Only Actions (Staff Permission Required)

Restricted to administrators:

- ✅ **Register new staff users** (admin-only feature, with server-side password-strength validation)
- ✅ Access admin panel
- ✅ Manage user permissions

**Smart UI**: Buttons dynamically display:

- "Register User" - visible only to admin staff
- Login page shows "Staff Login" to clarify purpose

### Environment-Based Configuration

All URLs and ports configured via `.env` files:

**Backend** (`back/.env`):

```env
PORT=8001                    # Auto-detected by manage.py
DEBUG=True                   # Development mode
SECRET_KEY=your-secret       # Django secret
DB_NAME=hms_db              # Database name
DB_USER=root                # Database user
DB_PASSWORD=pass            # Database password
```

**Frontend** (`front/.env`):

```env
VITE_API_BASE_URL=http://localhost:8001  # Backend URL
VITE_PORT=5173                            # Dev server port
```

## 🚢 Deployment

The API ships as a container; the React app is a static bundle that deploys
separately. Two hosts, because they are two different kinds of thing.

> ⚠️ **Deploy the synthetic dataset only.** A hobby-tier host has no BAA, no
> compliance review, and no audited access controls. Never put real patient
> data on one.

### 1. The API

```bash
# Build and run locally exactly as production will
docker build -t hms-api .

docker run --rm -p 8000:8000 \
  -e DEBUG=False \
  -e SECRET_KEY="$(python -c 'from django.core.management.utils import get_random_secret_key as k; print(k())')" \
  -e ALLOWED_HOSTS="localhost,127.0.0.1" \
  -e CORS_ALLOWED_ORIGINS="http://localhost:5173" \
  -e SECURE_SSL_REDIRECT=False \
  -e DB_HOST=host.docker.internal \
  -e DB_NAME=hms_db -e DB_USER=root -e DB_PASSWORD=... \
  hms-api

curl localhost:8000/api/health/        # {"status":"ok"}
curl localhost:8000/api/health/ready/  # also checks the database
```

To deploy (Railway is the reference target — it offers managed **MySQL**, which
this schema requires; Render and Fly lead with Postgres):

1. Point the platform at this repo. It will detect the `Dockerfile`.
2. Add a **MySQL** database and load `back/schema.sql` into it (structure
   only, no data — export it fresh from your own dev database first if it's
   ever out of date: see the `mysqldump` command in `CLAUDE.md`).
3. Set the environment variables below.
4. Run `python manage.py migrate` **once** as a release/one-off command — it
   creates Django's own auth and session tables. It does _not_ create the
   domain tables: those are `managed = False` and come from your schema.
5. Point the platform's health check at `/api/health/`.

| Variable                                                      | Value                                                                                                                                                                         |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DEBUG`                                                       | `False`                                                                                                                                                                       |
| `SECRET_KEY`                                                  | generate a fresh one — never reuse the dev key                                                                                                                                |
| `ALLOWED_HOSTS`                                               | your API hostname                                                                                                                                                             |
| `CORS_ALLOWED_ORIGINS`                                        | your frontend URL, e.g. `https://hms.pages.dev`                                                                                                                               |
| `USE_X_FORWARDED_PROTO`                                       | `True` — the platform terminates TLS                                                                                                                                          |
| `DB_HOST` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_PORT` | from the managed database                                                                                                                                                     |
| `SENTRY_DSN`                                                  | optional; leave empty to disable error tracking                                                                                                                               |
| `NUM_PROXIES`                                                 | number of trusted proxies in front of the app (default `1`) — verify against the real platform, or the login-attempt throttle can be bypassed via a spoofed `X-Forwarded-For` |

`USE_X_FORWARDED_PROTO=True` matters: without it `SECURE_SSL_REDIRECT` sees
plain `http` on every proxied request and redirects forever.

### 2. The frontend

```bash
cd front
VITE_API_BASE_URL=https://your-api-host npm run build
# deploy front/dist to Cloudflare Pages, Netlify, or any static host
```

`VITE_*` variables are baked in at **build** time, not read at runtime — so
changing the API URL means rebuilding, not just restarting.

**Before deploying**, edit `front/public/_headers` and replace
`<API_ORIGIN>` with the real deployed API origin — it sets this app's
Content-Security-Policy, and `connect-src` can't be filled in automatically
from `VITE_API_BASE_URL` (a static header file can't read a build-time env
var). Forgetting this fails closed: the SPA simply can't reach the API,
not a silent security gap.

### 3. Confirm it works

- `GET /api/health/` → `200`
- `GET /api/health/ready/` → `200` (`503` means the database is unreachable)
- `GET /api/persons/` → `401` without a token — this is correct
- Point an uptime monitor (UptimeRobot, BetterStack) at `/api/health/ready/`
- Verify the host's automated backups are switched on. An unverified backup is
  not a backup.

## 📊 Sample Data

The system comes with realistic healthcare data:

- **Patients**: Canadian Medicare numbers, demographics, medical history
- **Staff**: Doctors, nurses, administrators with roles and departments
- **Facilities**: Hospitals, clinics, pharmacies with capacity management

## 🔧 Development Features

### Pre-commit Hooks

Automatic code quality enforcement on every commit:

- **Python**: trailing-whitespace, end-of-file-fixer, check-yaml, check-added-large-files
- **Python Linting**: flake8 (style), isort (imports), black (formatting)
- **Frontend**: ESLint (linting), TypeScript compilation, prettier (formatting)
- **Security**: check-merge-conflict, mixed-line-ending

### API Architecture

- **Centralized Config**: All endpoints in `front/src/config/api.ts`
- **No Hardcoded URLs**: Environment-based configuration throughout
- **JWT Authentication**: short-lived (5 min) Bearer access tokens with
  rotating, blacklisted refresh tokens, applied globally via an axios
  interceptor. The legacy DRF opaque tokens were removed and are no longer
  accepted.
- **PII-free URLs**: every path identifies a person by `Person.uuid` — SSN and
  Medicare numbers never appear in a URL, browser history, or access log
- **Referrer-Policy: strict-origin-when-cross-origin**: the browser-level
  guarantee behind the PII-free-URL claim above — without it, a permissive
  referrer policy could leak the current URL to any allowed cross-origin
  request regardless of what the URL itself contains
- **Audit trail**: every create/update/delete is logged with the acting user,
  the model, the record, and a timestamp — queryable via `AuditLogEntry`

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Install** pre-commit hooks: `pre-commit install` (in back/ directory)
4. **Make** your changes
5. **Test** thoroughly (hooks will auto-check on commit)
6. **Commit**: `git commit -m 'Add amazing feature'`
7. **Push**: `git push origin feature/amazing-feature`
8. **Open** a Pull Request

Pre-commit hooks are configured in [.pre-commit-config.yaml](.pre-commit-config.yaml) — run `pre-commit install` in `back/` once after cloning.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Jpuntul**

- GitHub: [@Jpuntul](https://github.com/Jpuntul)

## 🙏 Acknowledgments

- Django REST Framework team for excellent API tools
- React team for the powerful frontend library
- Tailwind CSS for beautiful, responsive styling
- Healthcare professionals who inspired this project

---

**🚀 Ready to manage healthcare data efficiently!**

_For questions or support, please open an issue on GitHub._

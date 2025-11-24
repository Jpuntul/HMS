# ⚙️ Environment Configuration Guide

Complete guide to environment-based configuration in HMS. Learn how to configure both frontend and backend using `.env` files, understand the centralized API configuration, and migrate from hardcoded URLs.

## 📋 Table of Contents

- [Overview](#overview)
- [Backend Configuration](#backend-configuration)
- [Frontend Configuration](#frontend-configuration)
- [Centralized API Configuration](#centralized-api-configuration)
- [Auto-Port Detection](#auto-port-detection)
- [Migration Status](#migration-status)
- [Security Benefits](#security-benefits)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

HMS uses **environment variables** for all configuration, making it:

- ✅ **Secure**: No hardcoded credentials in source code
- ✅ **Flexible**: Easy switching between dev/staging/production
- ✅ **Team-Friendly**: Each developer uses custom local settings
- ✅ **Production-Ready**: Simple deployment with environment-specific configs

### Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend      │
│   .env          │────────▶│    .env         │
│                 │  API    │                 │
│ VITE_API_BASE_  │ Calls   │ PORT=8001       │
│ URL=:8001       │         │ DB_NAME=hms_db  │
└─────────────────┘         └─────────────────┘
        │                            │
        │                            │
        ▼                            ▼
┌─────────────────┐         ┌─────────────────┐
│  config/api.ts  │         │  manage.py      │
│  API_ENDPOINTS  │         │  Auto-detect    │
│  Centralized    │         │  PORT from .env │
└─────────────────┘         └─────────────────┘
```

## Backend Configuration

### Environment Variables (`back/.env`)

Create `.env` file in the `back/` directory:

```env
# Server Configuration
PORT=8001                                    # Server port (auto-detected by manage.py)
DEBUG=True                                   # Debug mode (False in production)
SECRET_KEY=your-secret-key-here             # Django secret (change in production!)

# Database Configuration (MySQL)
DB_NAME=hms_db                              # Database name
DB_USER=root                                # Database user
DB_PASSWORD=your_mysql_password             # Database password
DB_HOST=localhost                           # Database host
DB_PORT=3306                                # Database port

# Or use SQLite for development
# USE_SQLITE=True                           # Uncomment to use SQLite

# CORS Configuration (Frontend URLs)
CORS_ALLOWED_ORIGINS=http://localhost:5173  # Frontend URL(s), comma-separated
```

### Variable Details

| Variable               | Description           | Default     | Production               |
| ---------------------- | --------------------- | ----------- | ------------------------ |
| `PORT`                 | Backend server port   | `8000`      | `8000` or cloud-assigned |
| `DEBUG`                | Debug mode            | `True`      | **`False`** (required)   |
| `SECRET_KEY`           | Django secret key     | -           | **Strong random key**    |
| `DB_NAME`              | Database name         | `hms_db`    | Production DB name       |
| `DB_USER`              | Database user         | `root`      | Restricted user          |
| `DB_PASSWORD`          | Database password     | -           | **Strong password**      |
| `DB_HOST`              | Database host         | `localhost` | Production DB host       |
| `DB_PORT`              | Database port         | `3306`      | Varies by provider       |
| `USE_SQLITE`           | Use SQLite instead    | `False`     | Not recommended          |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend URLs | -           | Production URL(s)        |

### Generating Secret Key

**Method 1: Django utility**

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Method 2: Python secrets**

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

**Method 3: Online generator**

- Visit: https://djecrety.ir/

### Using Environment Variables in Django

**In `settings.py`**:

```python
import os
from dotenv import load_dotenv

load_dotenv()

# Access variables
PORT = int(os.getenv('PORT', 8000))
DEBUG = os.getenv('DEBUG', 'False') == 'True'
SECRET_KEY = os.getenv('SECRET_KEY', 'fallback-key-for-dev')

# Database configuration
if os.getenv('USE_SQLITE') == 'True':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': os.getenv('DB_NAME'),
            'USER': os.getenv('DB_USER'),
            'PASSWORD': os.getenv('DB_PASSWORD'),
            'HOST': os.getenv('DB_HOST'),
            'PORT': os.getenv('DB_PORT'),
        }
    }
```

## Frontend Configuration

### Environment Variables (`front/.env`)

Create `.env` file in the `front/` directory:

```env
# Backend API Base URL (must match backend PORT)
VITE_API_BASE_URL=http://localhost:8001

# Frontend Development Server Port
VITE_PORT=5173
```

### Variable Details

| Variable            | Description          | Default                 | Production                   |
| ------------------- | -------------------- | ----------------------- | ---------------------------- |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000` | `https://api.yourdomain.com` |
| `VITE_PORT`         | Vite dev server port | `5173`                  | Not used (build only)        |

### Using Environment Variables in React

**Accessing variables**:

```typescript
// Direct access
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// With fallback
const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
```

**⚠️ Important**: All Vite environment variables **must** be prefixed with `VITE_`!

### Centralized Configuration

Instead of accessing `import.meta.env` everywhere, use the centralized config:

**`src/config/api.ts`**:

```typescript
// API Base URL from environment variable
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// All API endpoints
export const API_ENDPOINTS = {
  // Authentication
  login: `${API_BASE_URL}/api/login/`,
  logout: `${API_BASE_URL}/api/logout/`,
  register: `${API_BASE_URL}/api/register/`,

  // Main entities
  persons: `${API_BASE_URL}/api/persons/`,
  employees: `${API_BASE_URL}/api/employees/`,
  facilities: `${API_BASE_URL}/api/facilities/`,
  infections: `${API_BASE_URL}/api/infections/`,
  vaccinations: `${API_BASE_URL}/api/vaccinations/`,
  schedules: `${API_BASE_URL}/api/schedules/`,

  // Analytics
  analytics: `${API_BASE_URL}/api/analytics/`,
};
```

**Usage in components**:

```typescript
import { API_ENDPOINTS } from "../config/api";
import axios from "axios";

// Fetch persons
const response = await axios.get(API_ENDPOINTS.persons);

// Login
await axios.post(API_ENDPOINTS.login, { username, password });

// Fetch specific person
await axios.get(`${API_ENDPOINTS.persons}${id}/`);
```

## Centralized API Configuration

### Benefits

1. **Single Source of Truth**: Change URL once, affects entire app
2. **Type Safety**: TypeScript autocomplete for all endpoints
3. **Easy Refactoring**: Rename endpoints without searching entire codebase
4. **Environment Switching**: Change `VITE_API_BASE_URL`, all endpoints update
5. **No Magic Strings**: No hardcoded URLs scattered in components

### Implementation Pattern

**Before** (Hardcoded):

```typescript
// ❌ Bad: Hardcoded URL
const response = await axios.get("http://localhost:8000/api/persons/");

// ❌ Bad: Different URLs in different files
const response1 = await axios.get("http://localhost:8000/api/persons/");
const response2 = await axios.get("http://127.0.0.1:8000/api/persons/");
const response3 = await axios.get("localhost:8000/api/persons/"); // Missing protocol!
```

**After** (Centralized):

```typescript
// ✅ Good: Centralized configuration
import { API_ENDPOINTS } from "../config/api";
const response = await axios.get(API_ENDPOINTS.persons);
```

### Adding New Endpoints

When adding a new endpoint:

1. **Add to `config/api.ts`**:

```typescript
export const API_ENDPOINTS = {
  // ... existing endpoints

  // New endpoint
  reports: `${API_BASE_URL}/api/reports/`,
};
```

2. **Use in components**:

```typescript
import { API_ENDPOINTS } from "../config/api";
const reports = await axios.get(API_ENDPOINTS.reports);
```

## Auto-Port Detection

### Backend (`manage.py`)

The backend **automatically detects PORT** from `.env` when running `python manage.py runserver`:

**Implementation** (`manage.py`):

```python
#!/usr/bin/env python
import os
import sys
from dotenv import load_dotenv

if __name__ == '__main__':
    # Load environment variables
    load_dotenv()

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms.settings')

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed?"
        ) from exc

    # Auto-detect port from .env for runserver command
    if 'runserver' in sys.argv:
        port = os.getenv('PORT', '8000')
        # Only append port if not already specified
        if not any(arg.startswith('0.0.0.0:') or arg.startswith('localhost:') or arg.isdigit() for arg in sys.argv[2:]):
            sys.argv.append(f'0.0.0.0:{port}')

    execute_from_command_line(sys.argv)
```

**How it works**:

1. Loads `.env` file with `load_dotenv()`
2. Checks if command is `runserver`
3. Reads `PORT` from environment (default: 8000)
4. Appends port if not already specified
5. Server starts on specified port

**Usage**:

```bash
# Automatically uses PORT from .env
python manage.py runserver

# Override with custom port
python manage.py runserver 9000

# Specific host and port
python manage.py runserver 0.0.0.0:9000
```

### Frontend (`vite.config.ts`)

Vite automatically uses `VITE_PORT` from `.env`:

```typescript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_PORT) || 5173,
      host: true,
    },
  };
});
```

## Migration Status

### ✅ Completed Migrations

All files have been migrated to use centralized API configuration:

| File                                         | Status              | Endpoints Used          |
| -------------------------------------------- | ------------------- | ----------------------- |
| **Authentication**                           |
| `src/contexts/AuthContext.tsx`               | ✅ Migrated         | login, logout, register |
| `src/pages/Login.tsx`                        | ✅ Uses AuthContext | (via context)           |
| `src/pages/Register.tsx`                     | ✅ Uses AuthContext | (via context)           |
| **Person/Patient**                           |
| `src/pages/PersonList.tsx`                   | ✅ Migrated         | persons                 |
| `src/pages/AddPerson.tsx`                    | ✅ Migrated         | persons                 |
| `src/pages/EditPerson.tsx`                   | ✅ Migrated         | persons                 |
| **Employee**                                 |
| `src/pages/EmployeeList.tsx`                 | ✅ Migrated         | employees               |
| **Facility**                                 |
| `src/pages/FacilityList.tsx`                 | ✅ Migrated         | facilities              |
| **Infection**                                |
| `src/pages/InfectionList.tsx`                | ✅ Migrated         | infections              |
| **Vaccination**                              |
| `src/pages/VaccinationList.tsx`              | ✅ Migrated         | vaccinations            |
| **Schedule**                                 |
| `src/pages/ScheduleList.tsx`                 | ✅ Migrated         | schedules               |
| **Dashboard**                                |
| `src/pages/Dashboard.tsx`                    | ✅ Migrated         | analytics               |
| `src/pages/Home.tsx`                         | ✅ Migrated         | analytics               |
| **Components**                               |
| `src/components/DeleteConfirmationModal.tsx` | ✅ Migrated         | Dynamic endpoint        |

### Migration Pattern

**Example**: PersonList.tsx

**Before**:

```typescript
// ❌ Hardcoded URL
const response = await axios.get("http://localhost:8000/api/persons/");
```

**After**:

```typescript
// ✅ Centralized config
import { API_ENDPOINTS } from "../config/api";
const response = await axios.get(API_ENDPOINTS.persons);
```

## Security Benefits

### 1. No Credentials in Source Code

**Before**:

```python
# ❌ Bad: Hardcoded credentials in settings.py (committed to Git!)
DATABASES = {
    'default': {
        'NAME': 'hms_db',
        'USER': 'root',
        'PASSWORD': 'super_secret_password_123',  # ⚠️ Exposed in Git history!
    }
}
```

**After**:

```python
# ✅ Good: Credentials in .env (gitignored)
DATABASES = {
    'default': {
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),  # ✅ Not in Git
    }
}
```

### 2. `.gitignore` Protection

Ensure `.env` files are **never committed**:

```gitignore
# .gitignore
.env
.env.local
.env.production
*.env
```

### 3. Example Files for Onboarding

Provide `.env.example` files for new developers:

**`back/.env.example`**:

```env
PORT=8001
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_NAME=hms_db
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
```

**Usage**:

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

### 4. Environment-Specific Security

**Development** (`.env`):

```env
DEBUG=True
SECRET_KEY=dev-key-not-secure
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Production** (`.env.production`):

```env
DEBUG=False  # ⚠️ Critical: Never True in production
SECRET_KEY=<strong-random-50-char-key>
CORS_ALLOWED_ORIGINS=https://yourdomain.com
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

## Best Practices

### 1. Never Commit `.env` Files

```bash
# ❌ Never do this!
git add .env

# ✅ Ensure it's gitignored
echo ".env" >> .gitignore
git add .gitignore
```

### 2. Use Strong Secrets in Production

```bash
# ❌ Weak secret
SECRET_KEY=mysecret

# ✅ Strong random secret (50+ characters)
SECRET_KEY=django-insecure-g3h7_j!k2l@m9n#op4qr$st5u^vw&xy8z*a(b)c-d[e]f{g}h
```

### 3. Document Required Variables

Create `.env.example` with **placeholders**, not real values:

```env
# ✅ Good: Template for developers
SECRET_KEY=your-secret-key-here
DB_PASSWORD=your_database_password

# ❌ Bad: Real credentials in example file
SECRET_KEY=actual-production-secret
DB_PASSWORD=realpassword123
```

### 4. Validate Environment Variables

Add validation to catch missing configs early:

**Django** (`settings.py`):

```python
import os
from django.core.exceptions import ImproperlyConfigured

def get_env_variable(var_name, default=None):
    """Get environment variable or raise exception."""
    try:
        value = os.environ.get(var_name, default)
        if value is None:
            raise ImproperlyConfigured(f"Set the {var_name} environment variable")
        return value
    except KeyError:
        error_msg = f"Set the {var_name} environment variable"
        raise ImproperlyConfigured(error_msg)

# Usage
SECRET_KEY = get_env_variable('SECRET_KEY')
```

### 5. Use Different `.env` Files per Environment

```bash
.env                # Development (gitignored)
.env.example        # Template (committed)
.env.production     # Production (on server only)
.env.staging        # Staging (on staging server)
.env.test           # Testing (CI/CD)
```

### 6. Centralize All Configuration

**Don't scatter configs**:

```typescript
// ❌ Bad: Direct access everywhere
const url = import.meta.env.VITE_API_BASE_URL;

// ✅ Good: Centralized config
import { API_BASE_URL } from "./config/api";
const url = API_BASE_URL;
```

## Troubleshooting

### Issue 1: Environment Variables Not Loading

**Symptoms**: App uses default values instead of `.env` values

**Solutions**:

1. **Check file location**: `.env` must be in correct directory

   - Backend: `back/.env`
   - Frontend: `front/.env`

2. **Restart development server**: Changes require restart

   ```bash
   # Stop and restart backend
   python manage.py runserver

   # Stop and restart frontend
   npm run dev
   ```

3. **Check variable names**: Vite requires `VITE_` prefix

   ```env
   # ❌ Won't work
   API_BASE_URL=http://localhost:8001

   # ✅ Correct
   VITE_API_BASE_URL=http://localhost:8001
   ```

4. **Verify file encoding**: Use UTF-8 without BOM

### Issue 2: CORS Errors After Port Change

**Symptoms**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**: Update all port references:

1. **Backend `.env`**:

   ```env
   PORT=8001  # New port
   ```

2. **Backend `settings.py`**:

   ```python
   CORS_ALLOWED_ORIGINS = [
       'http://localhost:5173',  # Frontend URL
   ]

   CSRF_TRUSTED_ORIGINS = [
       'http://localhost:5173',
   ]
   ```

3. **Frontend `.env`**:

   ```env
   VITE_API_BASE_URL=http://localhost:8001  # Match backend PORT
   ```

4. **Restart both servers**

### Issue 3: `manage.py runserver` Ignores PORT

**Symptoms**: Server starts on 8000 despite `PORT=8001` in `.env`

**Solutions**:

1. **Check `manage.py` has auto-detection code**:

   ```python
   from dotenv import load_dotenv
   load_dotenv()

   if 'runserver' in sys.argv:
       port = os.getenv('PORT', '8000')
       sys.argv.append(f'0.0.0.0:{port}')
   ```

2. **Verify `.env` file exists** in `back/` directory

3. **Install python-dotenv**:

   ```bash
   pip install python-dotenv
   ```

4. **Manually specify port** (override):
   ```bash
   python manage.py runserver 0.0.0.0:8001
   ```

### Issue 4: Production Build Uses Wrong API URL

**Symptoms**: Production frontend calls `localhost` instead of production API

**Solution**: Build with production environment:

```bash
# Create .env.production
echo "VITE_API_BASE_URL=https://api.yourdomain.com" > .env.production

# Build with production env
npm run build
```

Or set during build:

```bash
VITE_API_BASE_URL=https://api.yourdomain.com npm run build
```

### Issue 5: SQLite vs MySQL Confusion

**Symptoms**: App tries to connect to MySQL but SQLite is desired (or vice versa)

**Solution**: Set `USE_SQLITE` appropriately:

**For SQLite** (development):

```env
USE_SQLITE=True
# Comment out MySQL settings
# DB_NAME=hms_db
# DB_USER=root
# ...
```

**For MySQL** (production):

```env
# USE_SQLITE=True  # Comment out or remove
DB_NAME=hms_db
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
```

## Summary

### Key Takeaways

✅ **All configuration via `.env` files** - no hardcoded values
✅ **Centralized API endpoints** - `config/api.ts` is single source of truth
✅ **Auto-port detection** - backend reads PORT from `.env`
✅ **Security first** - credentials never in Git
✅ **Environment switching** - easy dev/staging/prod configs
✅ **Team collaboration** - `.env.example` for onboarding

### Quick Reference

**Backend `.env` essentials**:

```env
PORT=8001
DEBUG=True
SECRET_KEY=<random-key>
DB_NAME=hms_db
DB_USER=root
DB_PASSWORD=<password>
```

**Frontend `.env` essentials**:

```env
VITE_API_BASE_URL=http://localhost:8001
VITE_PORT=5173
```

**Usage in code**:

```typescript
// ✅ Always use centralized config
import { API_ENDPOINTS } from "../config/api";
const data = await axios.get(API_ENDPOINTS.persons);
```

---

_For more information, see [Setup Guide](SETUP_GUIDE.md) or [API Documentation](API_DOCUMENTATION.md)._

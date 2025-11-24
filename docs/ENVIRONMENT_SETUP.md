# Environment Configuration Guide

## Overview

The HMS application now uses environment variables for configuration, making it easier to manage different environments (development, staging, production) and improving security.

## Frontend Configuration

### Setup

1. Navigate to the `front` directory
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Update values in `.env` as needed

### Environment Variables

- **VITE_API_BASE_URL**: Backend API base URL (default: `http://localhost:8000`)
- **VITE_PORT**: Development server port (default: `5173`)

### Usage in Code

Instead of hardcoding URLs, import from the config:

```typescript
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

// Use predefined endpoints
fetch(API_ENDPOINTS.login, { ... });

// Or build dynamic URLs
const url = `${API_BASE_URL}/api/custom-endpoint/`;
```

### Migration Checklist

Files that need to be updated to use `API_ENDPOINTS`:

- [x] `src/contexts/AuthContext.tsx` - ✅ Updated
- [ ] `src/pages/PersonList.tsx`
- [ ] `src/pages/EmployeeList.tsx`
- [ ] `src/pages/FacilityList.tsx`
- [ ] `src/pages/InfectionList.tsx`
- [ ] `src/pages/VaccinationList.tsx`
- [ ] `src/pages/ScheduleList.tsx`
- [ ] `src/pages/Dashboard.tsx`
- [ ] `src/pages/Home.tsx`
- [ ] `src/pages/AddPerson.tsx`
- [ ] `src/pages/EditPerson.tsx`
- [ ] `src/components/DeleteConfirmationModal.tsx`

## Backend Configuration

### Setup

1. Navigate to the `back` directory
2. Copy the example environment file (if not already done):
   ```bash
   cp .env.example .env
   ```
3. Update values in `.env` for your environment

### Environment Variables

- **PORT**: Server port (default: `8000`)
- **DEBUG**: Django debug mode (default: `True`)
- **SECRET_KEY**: Django secret key (change in production!)
- **DB_NAME**: Database name
- **DB_USER**: Database user
- **DB_PASSWORD**: Database password
- **DB_HOST**: Database host
- **DB_PORT**: Database port

### Running with Custom Port

```bash
# Development
python manage.py runserver 0.0.0.0:${PORT:-8000}

# Or let Django use default
python manage.py runserver
```

## Benefits

1. **Security**: Sensitive data (API keys, database passwords) not committed to Git
2. **Flexibility**: Easy to switch between environments
3. **Team Collaboration**: Each developer can have different local settings
4. **Production Ready**: Simple deployment with environment-specific configs

## Important Notes

- ✅ `.env` files are git-ignored (won't be committed)
- ✅ `.env.example` files show required variables (committed to Git)
- ⚠️ Never commit `.env` files with real credentials
- ⚠️ Update `.env.example` when adding new environment variables

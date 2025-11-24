# 📖 HMS Setup Guide# HMS Setup Guide

Complete installation guide for the Healthcare Management System. Follow these steps to get HMS running on your local machine or deploy to production.## Quick Start

## 📋 Table of ContentsFollow these steps to get the HMS (Health Management System) running on your local machine.

- [Prerequisites](#prerequisites)## Prerequisites

- [Quick Start](#quick-start)

- [Backend Setup (Django)](#backend-setup-django)Make sure you have the following installed:

- [Frontend Setup (React)](#frontend-setup-react)

- [Admin User Setup](#admin-user-setup)- **Python 3.8+** (recommended: Python 3.11+)

- [Development Tools](#development-tools)- **Node.js 16+** (recommended: Node.js 18+)

- [Production Deployment](#production-deployment)- **MySQL 8.0+** (or use SQLite for development)

- [Docker Setup (Alternative)](#docker-setup-alternative)- **Git**

- [Troubleshooting](#troubleshooting)

## Backend Setup (Django)

## Prerequisites

### 1. Clone the Repository

### Required Software

````bash

- **Python 3.8+** (recommended: **3.11+**)git clone <your-repository-url>

  - Check: `python --version` or `python3 --version`cd HMS/back

  - Download: https://www.python.org/downloads/```



- **Node.js 16+** (recommended: **18+**)### 2. Create Virtual Environment

  - Check: `node --version`

  - Download: https://nodejs.org/```bash

# Create virtual environment

- **MySQL 8.0+** (or use SQLite for development)python3 -m venv venv

  - Check: `mysql --version`

  - Download: https://dev.mysql.com/downloads/# Activate virtual environment

# On macOS/Linux:

- **Git**source venv/bin/activate

  - Check: `git --version`# On Windows:

  - Download: https://git-scm.com/# venv\Scripts\activate

````

### Optional Tools

### 3. Install Dependencies

- **Docker** (for containerized deployment)

- **MySQL Workbench** (database GUI)```bash

- **Postman** (API testing)pip install -r requirements.txt

- **VS Code** (recommended editor)```

## Quick Start### 4. Environment Configuration

**Fastest way to get started**:```bash

# Copy the example environment file

```bashcp .env.example .env

# 1. Clone repository

git clone https://github.com/Jpuntul/HMS.git# Edit .env file with your configuration

cd HMS# Update database credentials, secret key, etc.

```

# 2. Backend setup

cd back### 5. Database Setup

python3 -m venv venv && source venv/bin/activate # Windows: venv\Scripts\activate

pip install -r requirements.txt#### Option A: MySQL (Recommended for Production)

# Create .env file```bash

cat > .env << EOF# Create MySQL database

PORT=8001mysql -u root -p

DEBUG=TrueCREATE DATABASE hms_db;

SECRET_KEY=your-secret-key-change-in-productionexit;

DB_NAME=hms_db

DB_USER=root# Update .env file with MySQL credentials

DB_PASSWORD=your_mysql_passwordDB_NAME=hms_db

DB_HOST=localhostDB_USER=root

DB_PORT=3306DB_PASSWORD=your-mysql-password

EOFDB_HOST=localhost

DB_PORT=3306

# Run migrations and start server```

python manage.py migrate

python manage.py createsuperuser # Create admin account#### Option B: SQLite (Quick Development Setup)

python manage.py runserver # Auto-detects PORT from .env

````bash

# 3. Frontend setup (new terminal)# Add this line to your .env file

cd ../frontUSE_SQLITE=True

npm install```



# Create .env file### 6. Run Migrations

cat > .env << EOF

VITE_API_BASE_URL=http://localhost:8001```bash

VITE_PORT=5173python manage.py migrate

EOF```



npm run dev### 7. Create Superuser (Optional)

````

````bash

**Access**:python manage.py createsuperuser

- Frontend: http://localhost:5173```

- Backend API: http://localhost:8001

- Admin Panel: http://localhost:8001/admin### 8. Start Development Server



## Backend Setup (Django)```bash

python manage.py runserver

### 1. Clone the Repository```



```bashThe backend will be available at: `http://localhost:8000`

git clone https://github.com/Jpuntul/HMS.git

cd HMS/back## Frontend Setup (React + TypeScript)

````

### 1. Navigate to Frontend Directory

### 2. Create Virtual Environment

````bash

```bashcd ../front

# Create virtual environment```

python3 -m venv venv

### 2. Install Dependencies

# Activate virtual environment

# macOS/Linux:```bash

source venv/bin/activatenpm install

# Windows:```

venv\Scripts\activate

```### 3. Start Development Server



You should see `(venv)` in your terminal prompt.```bash

npm run dev

### 3. Install Dependencies```



```bashThe frontend will be available at: `http://localhost:5173`

pip install --upgrade pip

pip install -r requirements.txt## Verification

````

### 1. Check Backend API

**Dependencies include**:

- Django 4.2.25Visit `http://localhost:8000/persons/` in your browser. You should see the API response.

- Django REST Framework

- django-cors-headers### 2. Check Frontend

- mysqlclient (or use SQLite)

- python-dotenvVisit `http://localhost:5173` in your browser. You should see the HMS dashboard.

### 4. Environment Configuration### 3. Test Authentication

Create `.env` file in the `back/` directory:1. Click "Register" to create a new account

2. Try browsing data (should work without login)

````env3. Try adding/editing data (should require login)

# Server Configuration

PORT=8001                                    # Backend server port## Production Deployment

DEBUG=True                                   # Set to False in production

SECRET_KEY=your-secret-key-here             # Generate new for production### Backend (Django)



# Database Configuration (MySQL)1. **Environment Variables**

DB_NAME=hms_db

DB_USER=root```bash

DB_PASSWORD=your_mysql_passwordDEBUG=False

DB_HOST=localhostSECRET_KEY=your-production-secret-key

DB_PORT=3306ALLOWED_HOSTS=your-domain.com,www.your-domain.com

CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com

# Or use SQLite (comment out MySQL settings above)```

# USE_SQLITE=True

2. **Static Files**

# CORS Settings (Frontend URL)

CORS_ALLOWED_ORIGINS=http://localhost:5173```bash

```python manage.py collectstatic

````

**Generate Secret Key** (Python):

```````bash3. **Database Migration**

python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

``````bash

python manage.py migrate

### 5. Database Setup```



#### Option A: MySQL (Recommended for Production)### Frontend (React)



1. **Start MySQL**:1. **Build for Production**

```bash

# macOS (Homebrew)```bash

brew services start mysqlnpm run build

```````

# Linux

sudo systemctl start mysql2. **Deploy** the `dist` folder to your web server

# Windows## Docker Setup (Alternative)

# Start MySQL service from Services app

````### 1. Create Docker Compose File



2. **Create Database**:```yaml

```bashversion: "3.8"

mysql -u root -pservices:

```  db:

```sql    image: mysql:8.0

CREATE DATABASE hms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;    environment:

SHOW DATABASES;      MYSQL_DATABASE: hms_db

EXIT;      MYSQL_ROOT_PASSWORD: rootpassword

```    ports:

      - "3306:3306"

3. **Update `.env`** with MySQL credentials    volumes:

      - mysql_data:/var/lib/mysql

#### Option B: SQLite (Quick Development)

  backend:

Add to `.env`:    build: ./back

```env    ports:

USE_SQLITE=True      - "8000:8000"

```    depends_on:

      - db

SQLite requires no additional setup - database file created automatically.    environment:

      - DB_HOST=db

### 6. Run Migrations      - DB_NAME=hms_db

      - DB_USER=root

```bash      - DB_PASSWORD=rootpassword

# Apply all migrations

python manage.py migrate  frontend:

    build: ./front

# Verify migrations    ports:

python manage.py showmigrations      - "5173:5173"

```    depends_on:

      - backend

This creates all database tables for: Person, Employee, Facility, Infection, Vaccination, Schedule.

volumes:

### 7. Create Superuser (Admin Account)  mysql_data:

````

```bash

python manage.py createsuperuser### 2. Run with Docker

```

````bash

Provide:docker-compose up --build

- Username (e.g., `admin`)```

- Email (optional)

- Password (strong password)## Troubleshooting



**Important**: This is the account you'll use to register new staff users in the app.### Common Issues



### 8. Start Development Server1. **Port Already in Use**



```bash   - Change ports in development servers

python manage.py runserver   - Kill existing processes: `lsof -ti:8000 | xargs kill -9`

````

2. **Database Connection Error**

The server will **auto-detect PORT from `.env`** (default: 8001).

- Verify MySQL is running: `brew services start mysql`

**Test Backend**: - Check database credentials in `.env`

- Visit http://localhost:8001/api/persons/ - Ensure database exists

- Should see JSON response with patient data

3. **CORS Error**

## Frontend Setup (React)

- Verify CORS settings in Django settings

### 1. Navigate to Frontend Directory - Check frontend API base URL

```bash4. **Module Not Found**

cd ../front  # From back/ directory

# Or   - Ensure virtual environment is activated

cd HMS/front  # From project root   - Reinstall requirements: `pip install -r requirements.txt`

```

5. **Node Modules Issues**

### 2. Install Dependencies - Clear npm cache: `npm cache clean --force`

- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

````bash

# Install all npm packages### Development Tips

npm install

1. **API Testing**

# Or use yarn

yarn install   - Use tools like Postman or curl to test API endpoints

```   - Check `API_DOCUMENTATION.md` for detailed endpoint information



**Dependencies include**:2. **Database Management**

- React 19.1.1

- TypeScript   - Access Django admin: `http://localhost:8000/admin/`

- Vite   - Use database GUI tools like MySQL Workbench or phpMyAdmin

- Tailwind CSS

- Axios3. **Code Quality**

- React Router   - Backend: Use `flake8` for Python linting

- Heroicons   - Frontend: Use ESLint (already configured)



### 3. Environment Configuration## Next Steps



Create `.env` file in the `front/` directory:After successful setup, you can:



```env1. Customize the UI design and styling

# Backend API URL (must match backend PORT)2. Add more advanced features (reporting, notifications, etc.)

VITE_API_BASE_URL=http://localhost:80013. Implement additional security measures

4. Set up automated testing

# Frontend development server port5. Configure CI/CD pipeline

VITE_PORT=51736. Deploy to cloud platforms (AWS, Heroku, DigitalOcean, etc.)

````

## Support

**Important**: If you change backend PORT, update `VITE_API_BASE_URL` accordingly.

For issues and questions:

### 4. Start Development Server

1. Check this setup guide first

```bash2. Review the main `README.md` for feature information

npm run dev3. Check `API_DOCUMENTATION.md` for API details

````4. Look at the codebase comments and documentation


Vite dev server starts on port 5173 (or `VITE_PORT` from `.env`).

**Access Frontend**:
- Visit http://localhost:5173
- Should see HMS landing page

### 5. Verify Integration

1. **Browse data** (no login required) - should see patients, staff, facilities
2. **Try to add data** - should prompt for login
3. **Login** with superuser credentials
4. **Register new user** (admin-only button visible after login)

## Admin User Setup

### Creating First Admin

```bash
cd back
source venv/bin/activate
python manage.py createsuperuser
````

### Accessing Admin Panel

1. Visit http://localhost:8001/admin
2. Login with superuser credentials
3. Full database management available

### Registering Additional Staff

**Via Application** (Recommended):

1. Login as admin user in frontend
2. Click "Register User" in navigation (admin-only)
3. Create new staff account
4. New user can login but cannot register others (unless made admin)

**Via Admin Panel**:

1. Go to http://localhost:8001/admin
2. Users → Add user
3. Set `is_staff` checkbox for admin privileges

## Development Tools

### Pre-commit Hooks (Recommended)

Enforce code quality on every commit:

```bash
cd back
pip install pre-commit
pre-commit install
```

**What it does**:

- Runs 13 quality checks before each commit
- Auto-fixes: trailing whitespace, end-of-file, import order
- Lints: flake8 (Python), ESLint (TypeScript)
- Formats: black (Python), prettier (frontend)

See [PRE_COMMIT_HOOKS.md](PRE_COMMIT_HOOKS.md) for details.

### Database Management

**Django Shell**:

```bash
python manage.py shell
```

```python
from hms.models import Person, Employee, Facility
Person.objects.count()  # Check record count
```

**Database Migrations**:

```bash
# Create migration after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# View SQL for migration
python manage.py sqlmigrate hms 0001
```

### API Testing

**Using curl**:

```bash
# Get persons list
curl http://localhost:8001/api/persons/

# Login
curl -X POST http://localhost:8001/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpassword"}'
```

**Using Postman**:

- Import collection from [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Test all endpoints

## Production Deployment

### Backend (Django)

1. **Update `.env` for production**:

```env
DEBUG=False
SECRET_KEY=<strong-random-secret-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
PORT=8000

# Use production database
DB_NAME=hms_production
DB_USER=hms_user
DB_PASSWORD=<strong-password>
DB_HOST=your-db-host
```

2. **Install production dependencies**:

```bash
pip install gunicorn psycopg2-binary  # For PostgreSQL
```

3. **Collect static files**:

```bash
python manage.py collectstatic --noinput
```

4. **Run with Gunicorn**:

```bash
gunicorn hms.wsgi:application --bind 0.0.0.0:8000
```

5. **Setup Nginx** (reverse proxy):

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /path/to/HMS/back/staticfiles/;
    }
}
```

### Frontend (React)

1. **Update `.env` for production**:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

2. **Build for production**:

```bash
npm run build
```

Creates optimized build in `dist/` directory.

3. **Deploy to web server**:

**Option A: Netlify**

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Option B: Vercel**

```bash
npm install -g vercel
vercel --prod
```

**Option C: Nginx**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/HMS/front/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Docker Setup (Alternative)

### Using Docker Compose

1. **Create `docker-compose.yml`** in project root:

```yaml
version: "3.8"

services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: hms_db
      MYSQL_ROOT_PASSWORD: rootpassword
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./back
    command: python manage.py runserver 0.0.0.0:8001
    ports:
      - "8001:8001"
    environment:
      - DB_HOST=db
      - DB_NAME=hms_db
      - DB_USER=root
      - DB_PASSWORD=rootpassword
      - PORT=8001
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./back:/app

  frontend:
    build: ./front
    command: npm run dev -- --host 0.0.0.0
    ports:
      - "5173:5173"
    environment:
      - VITE_API_BASE_URL=http://localhost:8001
    depends_on:
      - backend
    volumes:
      - ./front:/app
      - /app/node_modules

volumes:
  mysql_data:
```

2. **Create `Dockerfile` in `back/`**:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
```

3. **Create `Dockerfile` in `front/`**:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

4. **Run with Docker Compose**:

```bash
docker-compose up --build
```

Access:

- Frontend: http://localhost:5173
- Backend: http://localhost:8001

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Address already in use` or port conflict

**Solution**:

```bash
# Find process on port 8001 (backend)
lsof -ti:8001 | xargs kill -9

# Find process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Or change port in .env files
```

#### 2. Database Connection Error

**Error**: `Can't connect to MySQL server` or `Access denied`

**Solutions**:

- Verify MySQL is running: `brew services list` (macOS) or `sudo systemctl status mysql` (Linux)
- Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`
- Verify credentials in `.env` match MySQL user
- Try using SQLite: Add `USE_SQLITE=True` to `.env`

#### 3. CORS Error

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solutions**:

- Check `CORS_ALLOWED_ORIGINS` in `back/hms/settings.py`
- Ensure `django-cors-headers` installed: `pip install django-cors-headers`
- Verify frontend URL matches (http://localhost:5173)
- Check `VITE_API_BASE_URL` in `front/.env`

#### 4. Module Not Found (Python)

**Error**: `ModuleNotFoundError: No module named 'rest_framework'`

**Solutions**:

```bash
# Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt

# Verify installation
pip list | grep djangorestframework
```

#### 5. npm Install Fails

**Error**: Various npm installation errors

**Solutions**:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Try with legacy peer deps
npm install --legacy-peer-deps
```

#### 6. Migration Errors

**Error**: `No migrations to apply` or migration conflicts

**Solutions**:

```bash
# Reset migrations (development only!)
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc"  -delete

# Recreate migrations
python manage.py makemigrations
python manage.py migrate

# Or migrate specific app
python manage.py migrate hms
```

#### 7. Admin Registration Not Working

**Error**: Cannot see "Register User" button or 403 Forbidden

**Solutions**:

- Ensure logged in as admin user
- Check user has `is_staff=True`: Visit http://localhost:8001/admin
- Verify `@permission_classes([IsAuthenticated])` in `auth_views.py`
- Check console for errors

#### 8. Static Files Not Loading

**Error**: CSS/JS not loading in production

**Solutions**:

```bash
# Collect static files
python manage.py collectstatic --noinput

# Check STATIC_ROOT in settings.py
# Verify Nginx/Apache serving static files
```

### Getting Help

1. **Check Documentation**:

   - [API Documentation](API_DOCUMENTATION.md)
   - [Environment Setup](ENVIRONMENT_SETUP.md)
   - [Contributing Guide](CONTRIBUTING.md)

2. **Search Issues**: https://github.com/Jpuntul/HMS/issues

3. **Create New Issue**: Provide:
   - Error message (full stack trace)
   - Steps to reproduce
   - Operating system
   - Python/Node versions

## Next Steps

After successful setup:

1. ✅ **Explore the Application**

   - Browse patient data
   - View analytics dashboard
   - Test search functionality

2. ✅ **Test Authentication**

   - Login with admin account
   - Register a new staff user
   - Try CRUD operations

3. ✅ **Set Up Development Tools**

   - Install pre-commit hooks
   - Configure your editor (VS Code recommended)
   - Set up API testing tool (Postman)

4. ✅ **Read Documentation**

   - [API Documentation](API_DOCUMENTATION.md) - Understand endpoints
   - [Database Schema](DATABASE_SCHEMA.md) - Data model
   - [Contributing Guide](CONTRIBUTING.md) - Development workflow

5. ✅ **Start Developing**
   - Create feature branch
   - Make changes
   - Test thoroughly
   - Submit pull request

---

**🎉 Congratulations!** You've successfully set up HMS!

_For questions or issues, please open a [GitHub issue](https://github.com/Jpuntul/HMS/issues)._

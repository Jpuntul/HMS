# HMS Setup Guide

## Quick Start

Follow these steps to get the HMS (Health Management System) running on your local machine.

## Prerequisites

Make sure you have the following installed:

- **Python 3.8+** (recommended: Python 3.11+)
- **Node.js 16+** (recommended: Node.js 18+)
- **MySQL 8.0+** (or use SQLite for development)
- **Git**

## Backend Setup (Django)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd HMS/back
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your configuration
# Update database credentials, secret key, etc.
```

### 5. Database Setup

#### Option A: MySQL (Recommended for Production)

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE hms_db;
exit;

# Update .env file with MySQL credentials
DB_NAME=hms_db
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_HOST=localhost
DB_PORT=3306
```

#### Option B: SQLite (Quick Development Setup)

```bash
# Add this line to your .env file
USE_SQLITE=True
```

### 6. Run Migrations

```bash
python manage.py migrate
```

### 7. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 8. Start Development Server

```bash
python manage.py runserver
```

The backend will be available at: `http://localhost:8000`

## Frontend Setup (React + TypeScript)

### 1. Navigate to Frontend Directory

```bash
cd ../front
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## Verification

### 1. Check Backend API

Visit `http://localhost:8000/persons/` in your browser. You should see the API response.

### 2. Check Frontend

Visit `http://localhost:5173` in your browser. You should see the HMS dashboard.

### 3. Test Authentication

1. Click "Register" to create a new account
2. Try browsing data (should work without login)
3. Try adding/editing data (should require login)

## Production Deployment

### Backend (Django)

1. **Environment Variables**

```bash
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

2. **Static Files**

```bash
python manage.py collectstatic
```

3. **Database Migration**

```bash
python manage.py migrate
```

### Frontend (React)

1. **Build for Production**

```bash
npm run build
```

2. **Deploy** the `dist` folder to your web server

## Docker Setup (Alternative)

### 1. Create Docker Compose File

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

  backend:
    build: ./back
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      - DB_HOST=db
      - DB_NAME=hms_db
      - DB_USER=root
      - DB_PASSWORD=rootpassword

  frontend:
    build: ./front
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### 2. Run with Docker

```bash
docker-compose up --build
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**

   - Change ports in development servers
   - Kill existing processes: `lsof -ti:8000 | xargs kill -9`

2. **Database Connection Error**

   - Verify MySQL is running: `brew services start mysql`
   - Check database credentials in `.env`
   - Ensure database exists

3. **CORS Error**

   - Verify CORS settings in Django settings
   - Check frontend API base URL

4. **Module Not Found**

   - Ensure virtual environment is activated
   - Reinstall requirements: `pip install -r requirements.txt`

5. **Node Modules Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Development Tips

1. **API Testing**

   - Use tools like Postman or curl to test API endpoints
   - Check `API_DOCUMENTATION.md` for detailed endpoint information

2. **Database Management**

   - Access Django admin: `http://localhost:8000/admin/`
   - Use database GUI tools like MySQL Workbench or phpMyAdmin

3. **Code Quality**
   - Backend: Use `flake8` for Python linting
   - Frontend: Use ESLint (already configured)

## Next Steps

After successful setup, you can:

1. Customize the UI design and styling
2. Add more advanced features (reporting, notifications, etc.)
3. Implement additional security measures
4. Set up automated testing
5. Configure CI/CD pipeline
6. Deploy to cloud platforms (AWS, Heroku, DigitalOcean, etc.)

## Support

For issues and questions:

1. Check this setup guide first
2. Review the main `README.md` for feature information
3. Check `API_DOCUMENTATION.md` for API details
4. Look at the codebase comments and documentation

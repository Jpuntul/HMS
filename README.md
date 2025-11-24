# 🏥 Healthcare Management System (HMS)

A comprehensive, production-ready healthcare management platform with **hybrid authentication**, **admin-only registration**, and **environment-based configuration**. Browse healthcare data publicly, authenticate for modifications.

## ✨ Key Features

### 🔐 Security & Authentication

- **Hybrid Authentication**: Browse all data without login, authenticate only for CRUD operations
- **Admin-Only Registration**: Staff registration restricted to administrators for security
- **Token-Based Auth**: Secure JWT authentication with Django REST Framework
- **CSRF Protection**: Configured for cross-origin requests with trusted origins

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
- **Pre-commit Hooks**: 13 quality checks (flake8, isort, ESLint, TypeScript, prettier, black)
- **Smooth Search UX**: Debounced search without input focus loss
- **Responsive Design**: Mobile-first design with Tailwind CSS

## 🛠️ Technology Stack

### Backend

- **Django 4.2.25** - Web framework
- **Django REST Framework** - RESTful API
- **MySQL** - Production database
- **SQLite** - Development database option
- **python-dotenv** - Environment variable management
- **Token Authentication** - Secure API access

### Frontend

- **React 19.1.1** - UI library with new compiler
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

- **Python 3.8+** (recommended: 3.11+)
- **Node.js 16+** (recommended: 18+)
- **MySQL 8.0+** (or use SQLite for development)
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

## 📚 Documentation

Comprehensive guides for setup, development, and contribution:

| Document                                              | Description                                                      |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| **[📖 Setup Guide](docs/SETUP_GUIDE.md)**             | Complete installation with MySQL/SQLite, Docker, troubleshooting |
| **[⚙️ Environment Setup](docs/ENVIRONMENT_SETUP.md)** | `.env` configuration, API endpoints, migration checklist         |
| **[🔌 API Documentation](docs/API_DOCUMENTATION.md)** | Full REST API reference with examples                            |
| **[🤝 Contributing Guide](docs/CONTRIBUTING.md)**     | Development workflow, pre-commit hooks, code standards           |
| **[🗃️ Database Schema](docs/DATABASE_SCHEMA.md)**     | Complete database structure and relationships                    |
| **[🪝 Pre-commit Hooks](docs/PRE_COMMIT_HOOKS.md)**   | Quality checks configuration (13 hooks)                          |

## 🎯 How It Works

### Authentication Flow

#### 🔍 Public Access (No Login Required)

Browse and view all data:

- ✅ 447+ patient records with demographics and medical history
- ✅ 303+ healthcare staff members with roles and departments
- ✅ 11+ medical facilities with capacity and services
- ✅ Infection tracking records
- ✅ Vaccination history
- ✅ Employee schedules
- ✅ Analytics dashboard with charts

#### ✏️ Authenticated Actions (Staff Login Required)

Modify data with token authentication:

- ✅ Add new patients, staff, facilities, records
- ✅ Edit existing information
- ✅ Delete outdated or incorrect data
- ✅ Full CRUD operations on all entities

#### 🔐 Admin-Only Actions (Staff Permission Required)

Restricted to administrators:

- ✅ **Register new staff users** (admin-only feature)
- ✅ Access admin panel
- ✅ Manage user permissions

**Smart UI**: Buttons dynamically display:

- "Login to Add/Edit" - when authentication needed
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
- **Token Authentication**: Secure JWT tokens for authenticated requests

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

See **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** for detailed guidelines.

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

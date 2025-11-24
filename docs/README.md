# 📚 HMS Documentation

Welcome to the **Healthcare Management System (HMS)** documentation! This directory contains comprehensive guides for setup, development, API usage, and contribution.

## 🗂️ Documentation Index

### 🚀 Getting Started

| Document                                         | Description                                                 | When to Use                  |
| ------------------------------------------------ | ----------------------------------------------------------- | ---------------------------- |
| **[📖 Setup Guide](SETUP_GUIDE.md)**             | Complete installation instructions for backend and frontend | First-time setup, deployment |
| **[⚙️ Environment Setup](ENVIRONMENT_SETUP.md)** | `.env` configuration and API endpoints migration            | Configuration, port changes  |

### 🔧 Development

| Document                                       | Description                                            | When to Use                        |
| ---------------------------------------------- | ------------------------------------------------------ | ---------------------------------- |
| **[🤝 Contributing Guide](CONTRIBUTING.md)**   | Development workflow, pre-commit hooks, code standards | Before contributing code           |
| **[🪝 Pre-commit Hooks](PRE_COMMIT_HOOKS.md)** | Quality checks configuration (13 hooks)                | Setting up development environment |

### 📖 Reference

| Document                                         | Description                                   | When to Use                    |
| ------------------------------------------------ | --------------------------------------------- | ------------------------------ |
| **[🔌 API Documentation](API_DOCUMENTATION.md)** | Full REST API reference with examples         | Building features, testing API |
| **[🗃️ Database Schema](DATABASE_SCHEMA.md)**     | Complete database structure and relationships | Understanding data model       |

## 🎯 Quick Start Path

**New to the project?** Follow this path:

1. **[Setup Guide](SETUP_GUIDE.md)** - Get the application running
2. **[Environment Setup](ENVIRONMENT_SETUP.md)** - Configure `.env` files
3. **[API Documentation](API_DOCUMENTATION.md)** - Understand the API
4. **[Contributing Guide](CONTRIBUTING.md)** - Start developing

## 📋 Documentation Overview

### 📖 Setup Guide (`SETUP_GUIDE.md`)

Detailed installation and configuration:

- **Prerequisites**: Python, Node.js, MySQL requirements
- **Backend Setup**: Virtual environment, dependencies, database
- **Frontend Setup**: npm installation, configuration
- **Docker Setup**: Alternative containerized deployment
- **Troubleshooting**: Common issues and solutions

**Key Topics**:

- MySQL vs SQLite configuration
- Creating superuser accounts
- Environment variable setup
- Production deployment
- Port configuration

### ⚙️ Environment Setup (`ENVIRONMENT_SETUP.md`)

Environment-based configuration guide:

- **Backend `.env`**: PORT, DEBUG, SECRET_KEY, database credentials
- **Frontend `.env`**: VITE_API_BASE_URL, VITE_PORT
- **API Endpoints**: Centralized configuration in `config/api.ts`
- **Migration Checklist**: Files updated to use environment variables
- **Security Benefits**: No hardcoded credentials

**Key Features**:

- Auto-port detection in `manage.py`
- Centralized API configuration
- Environment switching (dev/staging/prod)

### 🔌 API Documentation (`API_DOCUMENTATION.md`)

Complete REST API reference:

- **Authentication**: Login, logout, register (admin-only)
- **Entities**: Persons, employees, facilities, infections, vaccinations, schedules
- **Analytics**: Dashboard statistics
- **Request/Response Examples**: All endpoints documented
- **Error Handling**: Common HTTP status codes

**Authentication Flow**:

- Token-based authentication
- Public read access (no auth required)
- Authenticated write operations
- Admin-only registration

### 🤝 Contributing Guide (`CONTRIBUTING.md`)

Development workflow and standards:

- **Git Workflow**: Feature branches, commits, pull requests
- **Pre-commit Hooks**: 13 automated quality checks
- **Code Standards**: Python (PEP 8), TypeScript, formatting
- **Testing**: Unit tests, integration tests
- **Review Process**: Code review guidelines

**Quality Checks**:

- Python: flake8, isort, black
- Frontend: ESLint, TypeScript, prettier
- Security: trailing-whitespace, merge conflicts

### 🪝 Pre-commit Hooks (`PRE_COMMIT_HOOKS.md`)

Automated code quality enforcement:

- **13 Hooks**: trailing-whitespace, flake8, isort, black, ESLint, TypeScript, prettier
- **Installation**: `pre-commit install` in `back/` directory
- **Auto-fixes**: Many hooks automatically fix issues
- **Manual Fixes**: Some require developer intervention

**Benefits**:

- Consistent code style
- Catch errors before commit
- Enforce best practices
- Team collaboration

### 🗃️ Database Schema (`DATABASE_SCHEMA.md`)

Complete database structure:

- **Entities**: Person, Employee, Facility, Infection, Vaccination, Schedule
- **Relationships**: Foreign keys, one-to-many, many-to-many
- **Fields**: Data types, constraints, defaults
- **Migrations**: Django migration history

## 🔗 External Links

- **[Main README](../README.md)** - Project overview and features
- **[Frontend README](../front/README.md)** - React app documentation
- **[Backend Code](../back/)** - Django REST API source
- **[Frontend Code](../front/)** - React TypeScript source

## 📁 Project Structure

```
HMS/
├── README.md                  # Project overview
├── back/                      # Django backend
│   ├── manage.py             # Django management
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Backend config (gitignored)
│   └── hms/                  # Main app
│       ├── models.py         # Database models
│       ├── views.py          # API views
│       ├── serializers.py    # DRF serializers
│       └── auth_views.py     # Authentication
│
├── front/                     # React frontend
│   ├── package.json          # npm dependencies
│   ├── .env                  # Frontend config (gitignored)
│   └── src/
│       ├── pages/            # Route components
│       ├── components/       # Reusable components
│       ├── contexts/         # React contexts
│       └── config/           # API configuration
│
└── docs/                      # Documentation (you are here)
    ├── README.md             # This file
    ├── SETUP_GUIDE.md        # Installation guide
    ├── ENVIRONMENT_SETUP.md  # Config guide
    ├── API_DOCUMENTATION.md  # API reference
    ├── CONTRIBUTING.md        # Development guide
    ├── PRE_COMMIT_HOOKS.md   # Hooks documentation
    └── DATABASE_SCHEMA.md    # Database reference
```

## 🎓 Learning Path

### For Users

1. Read [Main README](../README.md) - Understand what HMS does
2. Follow [Setup Guide](SETUP_GUIDE.md) - Install and run
3. Explore the application - Browse, login, test features

### For Developers

1. Complete user path above
2. Read [Environment Setup](ENVIRONMENT_SETUP.md) - Understand configuration
3. Review [API Documentation](API_DOCUMENTATION.md) - Learn API structure
4. Study [Database Schema](DATABASE_SCHEMA.md) - Understand data model
5. Follow [Contributing Guide](CONTRIBUTING.md) - Development workflow
6. Set up [Pre-commit Hooks](PRE_COMMIT_HOOKS.md) - Quality automation

### For Architects

1. Review all documentation
2. Study codebase structure
3. Understand authentication flow
4. Review environment configuration
5. Plan feature additions or modifications

## 🆘 Getting Help

### Common Questions

**Q: How do I change the backend port?**
A: Update `PORT` in `back/.env` and `VITE_API_BASE_URL` in `front/.env`

**Q: Registration is not working, why?**
A: Registration is admin-only. Create superuser: `python manage.py createsuperuser`, then login as admin.

**Q: CORS errors when calling API?**
A: Check `CORS_ALLOWED_ORIGINS` in `back/hms/settings.py` matches your frontend URL.

**Q: How do I add a new API endpoint?**
A: See [API Documentation](API_DOCUMENTATION.md) and [Contributing Guide](CONTRIBUTING.md) for patterns.

**Q: Pre-commit hooks are failing?**
A: See [Pre-commit Hooks](PRE_COMMIT_HOOKS.md) for troubleshooting.

### Troubleshooting Resources

1. **[Setup Guide - Troubleshooting](SETUP_GUIDE.md#troubleshooting)** - Common setup issues
2. **[Contributing Guide](CONTRIBUTING.md)** - Development best practices
3. **[GitHub Issues](https://github.com/Jpuntul/HMS/issues)** - Known issues and bugs

## 📊 Documentation Maintenance

This documentation is actively maintained. If you find:

- **Outdated information**: Create an issue or PR
- **Missing content**: Suggest additions
- **Errors**: Report and help fix
- **Unclear sections**: Ask for clarification

## 🙏 Contributing to Docs

Documentation improvements welcome!

1. Fork the repository
2. Edit markdown files in `docs/`
3. Follow markdown best practices
4. Submit pull request

**Markdown Guidelines**:

- Use headers (`#`, `##`, `###`) for structure
- Add code blocks with language tags
- Include tables for structured data
- Use emojis for visual appeal (but don't overdo it)
- Keep language clear and concise

---

**📚 Happy learning and coding!**

_For project questions or support, please open an issue on [GitHub](https://github.com/Jpuntul/HMS/issues)._

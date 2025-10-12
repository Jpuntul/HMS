# Contributing to HMS (Health Management System)

Thank you for your interest in contributing to HMS! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Project Structure](#project-structure)
- [Submitting Changes](#submitting-changes)
- [Issue Reporting](#issue-reporting)

## Getting Started

### Prerequisites

- Python 3.8+ (recommended: 3.11+)
- Node.js 16+ (recommended: 18+)
- MySQL 8.0+ or SQLite for development
- Git knowledge and GitHub account

### Setup Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/HMS.git
   cd HMS
   ```
3. Follow the [SETUP_GUIDE.md](SETUP_GUIDE.md) to set up the development environment
4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Backend Development (Django)

```bash
cd back
source venv/bin/activate  # Activate virtual environment
python manage.py runserver  # Start development server
```

### Frontend Development (React)

```bash
cd front
npm run dev  # Start development server
```

### Making Changes

1. **Create a feature branch** from `main`
2. **Make your changes** following the code standards
3. **Test your changes** thoroughly
4. **Commit your changes** with clear commit messages
5. **Push to your fork** and create a pull request

## Code Standards

### Backend (Django/Python)

- Follow [PEP 8](https://pep8.org/) style guide
- Use meaningful variable and function names
- Add docstrings for functions and classes
- Use type hints where appropriate
- Keep functions small and focused

**Example:**

```python
def create_person(name: str, age: int, gender: str) -> Person:
    """
    Create a new person record.

    Args:
        name: Full name of the person
        age: Age in years
        gender: Gender ('M', 'F', or 'O')

    Returns:
        Person: The created person instance
    """
    return Person.objects.create(name=name, age=age, gender=gender)
```

### Frontend (React/TypeScript)

- Use TypeScript for all new code
- Follow React functional component patterns
- Use meaningful component and variable names
- Keep components small and focused
- Use proper TypeScript typing

**Example:**

```typescript
interface PersonProps {
  person: Person;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const PersonCard: React.FC<PersonProps> = ({ person, onEdit, onDelete }) => {
  // Component implementation
};
```

### General Guidelines

- Write clear, descriptive commit messages
- Add comments for complex logic
- Update documentation when adding features
- Follow existing code patterns in the project

## Project Structure

### Backend (`/back`)

```
back/
├── hms/                    # Main Django app
│   ├── models.py          # Database models
│   ├── views.py           # API views
│   ├── serializers.py     # DRF serializers
│   ├── auth_views.py      # Authentication views
│   └── urls.py            # URL routing
├── manage.py              # Django management script
└── requirements.txt       # Python dependencies
```

### Frontend (`/front`)

```
front/
├── src/
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── contexts/         # React contexts
│   └── assets/           # Static assets
├── package.json          # Node.js dependencies
└── vite.config.ts       # Vite configuration
```

## Submitting Changes

### Pull Request Process

1. **Update documentation** if you're adding features
2. **Test your changes** on both development and production builds
3. **Create a pull request** with:
   - Clear title and description
   - Reference any related issues
   - Screenshots for UI changes
   - List of changes made

### Pull Request Template

```markdown
## Description

Brief description of the changes made.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Backend tests pass
- [ ] Frontend builds successfully
- [ ] Manual testing completed
- [ ] No console errors

## Screenshots (if applicable)

Add screenshots for UI changes.

## Checklist

- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or breaking changes documented)
```

## Issue Reporting

### Before Submitting an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** (README, SETUP_GUIDE, API_DOCUMENTATION)
3. **Try the latest version** to see if the issue is already fixed

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 22]

**Additional context**
Any other context about the problem.
```

### Feature Request Template

```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Use Case**
Explain why this feature would be useful.

**Proposed Solution**
If you have ideas on how to implement it.

**Alternatives Considered**
Any alternative solutions or features you've considered.
```

## Areas for Contribution

### High Priority

- **Testing**: Add unit tests and integration tests
- **Documentation**: Improve existing docs and add new ones
- **Security**: Enhance authentication and authorization
- **Performance**: Optimize database queries and frontend rendering

### Medium Priority

- **UI/UX**: Improve design and user experience
- **Features**: Add new functionality (reporting, notifications, etc.)
- **Accessibility**: Make the app more accessible
- **Mobile**: Improve mobile responsiveness

### Good First Issues

- Fix typos in documentation
- Add input validation
- Improve error messages
- Add loading states
- Enhance form styling

## Development Tips

### Backend Development

- Use Django's built-in admin for quick data management
- Leverage Django REST Framework features
- Use database migrations for schema changes
- Follow Django's security best practices

### Frontend Development

- Use React DevTools for debugging
- Leverage TypeScript for better development experience
- Use the browser's network tab to debug API calls
- Test on different screen sizes

### Database

- Use meaningful model names and field names
- Add database indexes for frequently queried fields
- Use migrations for all schema changes
- Back up your database before major changes

## Getting Help

- **Documentation**: Check README.md, SETUP_GUIDE.md, and API_DOCUMENTATION.md
- **Code**: Read the existing codebase for patterns and examples
- **Issues**: Create an issue on GitHub for bugs or questions
- **Discussions**: Use GitHub Discussions for general questions

## Recognition

Contributors will be recognized in the following ways:

- Listed in the project README
- Mentioned in release notes for significant contributions
- GitHub contribution graph updates

Thank you for contributing to HMS! 🎉

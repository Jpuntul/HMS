# Pre-Commit Hooks Configuration

## Overview

This project uses [pre-commit](https://pre-commit.com/) to automatically run code quality checks before each commit, ensuring consistent code style and catching issues early.

## Installed Hooks

### 1. **General File Checks**

- ✅ `trailing-whitespace` - Removes trailing whitespace
- ✅ `end-of-file-fixer` - Ensures files end with newline
- ✅ `check-yaml` - Validates YAML syntax
- ✅ `check-json` - Validates JSON syntax (excludes tsconfig files)
- ✅ `check-added-large-files` - Prevents large files from being committed
- ✅ `check-merge-conflict` - Detects merge conflict markers
- ✅ `check-case-conflict` - Detects case conflicts in filenames
- ✅ `detect-private-key` - Detects private keys in code

### 2. **Python Backend (`/back`)**

- ✅ `black` - Automatic Python code formatting
- ✅ `flake8` - Python linting (PEP 8 compliance)
  - Max line length: 100 characters
  - Ignores E203 (whitespace before ':')
- ✅ `isort` - Sorts Python imports automatically
  - Profile: black-compatible

### 3. **Frontend (`/front`)**

- ✅ `prettier` - Automatic code formatting for JS/TS/CSS/JSON/MD
- ✅ `eslint` - JavaScript/TypeScript linting with auto-fix
- ✅ `tsc --noEmit` - TypeScript type checking

## Setup

### First Time Setup

```bash
# Install pre-commit (if not already installed)
pip install pre-commit

# Install the git hooks
pre-commit install
```

### Running Manually

```bash
# Run on all files
pre-commit run --all-files

# Run on staged files only
pre-commit run

# Run specific hook
pre-commit run black
pre-commit run eslint
```

### Updating Hooks

```bash
# Update hook versions
pre-commit autoupdate

# Reinstall hooks
pre-commit install
```

## What Happens on Commit?

When you run `git commit`, the following happens automatically:

1. **File checks** - Validates file format and removes trailing whitespace
2. **Python checks** - Formats with black, sorts imports with isort, lints with flake8
3. **Frontend checks** - Formats with prettier, lints with ESLint, type-checks with TypeScript
4. **If all pass** ✅ - Commit proceeds
5. **If any fail** ❌ - Commit is blocked, you must fix issues

### Auto-fixes

Many hooks will **automatically fix** issues:

- `black` - Reformats Python code
- `prettier` - Reformats frontend code
- `isort` - Reorganizes imports
- `eslint --fix` - Fixes ESLint issues
- `trailing-whitespace` - Removes trailing spaces
- `end-of-file-fixer` - Adds newlines

After auto-fixes, you need to:

```bash
git add .
git commit -m "your message"
```

## Bypassing Hooks (Not Recommended)

In rare cases where you need to bypass hooks:

```bash
git commit --no-verify -m "your message"
```

⚠️ **Warning:** Only use this for emergency commits. CI/CD will still run these checks!

## CI/CD Integration

These same checks run in the CI/CD pipeline, so:

- ✅ Catching issues locally saves time
- ✅ Prevents failed builds on push
- ✅ Ensures code quality across the team

## Troubleshooting

### Hook fails on first run

```bash
# Clean and reinstall
pre-commit clean
pre-commit install
pre-commit run --all-files
```

### ESLint not finding config

Make sure you're in the project root when running pre-commit.

### TypeScript errors

```bash
cd front
npx tsc --noEmit
# Fix errors shown
```

### Python linting errors

```bash
cd back
flake8 .
# Fix errors shown
```

## Benefits

✅ **Consistent Code Style** - Black, Prettier ensure uniform formatting
✅ **Catch Bugs Early** - Type checking and linting before commit
✅ **Faster Reviews** - No style debates in PRs
✅ **Team Alignment** - Everyone follows same standards
✅ **CI/CD Friendly** - Pass checks locally = pass in CI

## Configuration Files

- `.pre-commit-config.yaml` - Hook configuration
- `front/eslint.config.js` - ESLint rules
- `front/tsconfig.json` - TypeScript config
- Backend uses Black and Flake8 defaults

---

**Happy coding with clean, consistent code!** 🎉

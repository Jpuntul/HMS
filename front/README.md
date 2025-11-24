# HMS Frontend

Modern healthcare management system frontend built with React, TypeScript, and Vite.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev
```

**Access:** `http://localhost:5173`

## 🛠️ Technology Stack

- **React 19.1.1** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Routing
- **Heroicons** - Icon library

## 📁 Project Structure

```
src/
├── components/       # Reusable components
│   ├── Pagination.tsx
│   ├── SearchBar.tsx
│   ├── FilterDropdown.tsx
│   └── DeleteConfirmationModal.tsx
├── config/          # Configuration files
│   └── api.ts       # API endpoints & base URL
├── contexts/        # React contexts
│   └── AuthContext.tsx
├── pages/           # Page components
│   ├── Dashboard.tsx
│   ├── PersonList.tsx
│   ├── EmployeeList.tsx
│   └── ...
└── App.tsx          # Main app component
```

## 🔧 Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Base URL (backend server)
VITE_API_BASE_URL=http://localhost:8000

# Development Server Port
VITE_PORT=5173
```

### Usage in Code

```typescript
import { API_BASE_URL, API_ENDPOINTS } from "./config/api";

// Use predefined endpoints
fetch(API_ENDPOINTS.persons);

// Or build custom URLs
const url = `${API_BASE_URL}/api/custom/`;
```

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🎨 Features

- **Hybrid Authentication** - Browse without login, authenticate for CRUD
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Search** - Debounced search with 500ms delay
- **Pagination** - Server-side pagination (20 items per page)
- **Analytics Dashboard** - Charts and statistics
- **Dark Mode Ready** - Tailwind CSS classes prepared

## 🔌 API Integration

All API calls use centralized configuration from `src/config/api.ts`:

- Authentication: Login, Logout, Register
- Persons: CRUD operations
- Employees: Staff management
- Facilities: Facility management
- Infections: Infection tracking
- Vaccinations: Vaccination records
- Schedules: Employee schedules
- Analytics: Dashboard data

## 📱 Pages

| Route           | Component       | Description             |
| --------------- | --------------- | ----------------------- |
| `/`             | Home            | Landing page with stats |
| `/dashboard`    | Dashboard       | Analytics & charts      |
| `/persons`      | PersonList      | Patient management      |
| `/employees`    | EmployeeList    | Staff management        |
| `/facilities`   | FacilityList    | Facility management     |
| `/infections`   | InfectionList   | Infection tracking      |
| `/vaccinations` | VaccinationList | Vaccination records     |
| `/schedules`    | ScheduleList    | Employee schedules      |
| `/login`        | Login           | User authentication     |
| `/register`     | Register        | User registration       |

## 🤝 Contributing

See the main [CONTRIBUTING.md](../docs/CONTRIBUTING.md) for guidelines.

## 📝 Notes

- This project uses **React 19** with the new compiler features
- **TypeScript** strict mode is enabled
- **ESLint** configuration follows React best practices
- **Vite** provides fast HMR (Hot Module Replacement)

---

For more information, see the [main README](../README.md) or [documentation](../docs/).

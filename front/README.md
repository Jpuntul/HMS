# HMS Frontend# HMS Frontend

Modern healthcare management system frontend built with **React 19**, **TypeScript**, and **Vite**. Features hybrid authentication, admin-only registration, and smooth search UX with debounced queries.Modern healthcare management system frontend built with React, TypeScript, and Vite.

## ✨ Features## 🚀 Quick Start

- **🔐 Hybrid Authentication** - Browse without login, authenticate for CRUD operations```bash

- **👤 Admin-Only Registration** - Staff registration restricted to administrators# Install dependencies

- **🔍 Smart Search** - Debounced search (500ms) without input focus lossnpm install

- **📊 Analytics Dashboard** - Real-time charts and healthcare statistics# Copy environment configuration

- **⚡ Fast HMR** - Vite provides instant hot module replacementcp .env.example .env

- **🎨 Modern UI** - Heroicons and Tailwind for beautiful interfaces

- **🔒 Token Auth** - Secure JWT token authentication# Start development server

npm run dev

## 🚀 Quick Start```

```bash**Access:** `http://localhost:5173`

# Install dependencies

npm install## 🛠️ Technology Stack

# Create environment file- **React 19.1.1** - UI framework

cat > .env << EOF- **TypeScript** - Type safety

VITE_API_BASE_URL=http://localhost:8001- **Vite** - Build tool & dev server

VITE_PORT=5173- **Tailwind CSS** - Styling

EOF- **Axios** - HTTP client

- **React Router** - Routing

# Start development server- **Heroicons** - Icon library

npm run dev

`````## 📁 Project Structure



**Access:** `http://localhost:5173````

src/

## 🛠️ Technology Stack├── components/       # Reusable components

│   ├── Pagination.tsx

### Core│   ├── SearchBar.tsx

- **React 19.1.1** - UI library with new compiler features│   ├── FilterDropdown.tsx

- **TypeScript** - Type safety and better DX│   └── DeleteConfirmationModal.tsx

- **Vite** - Build tool & lightning-fast dev server├── config/          # Configuration files

│   └── api.ts       # API endpoints & base URL

### Styling & UI├── contexts/        # React contexts

- **Tailwind CSS** - Utility-first CSS framework│   └── AuthContext.tsx

- **Heroicons** - Beautiful hand-crafted SVG icons├── pages/           # Page components

│   ├── Dashboard.tsx

### Data & Routing│   ├── PersonList.tsx

- **Axios** - HTTP client for API calls│   ├── EmployeeList.tsx

- **React Router** - Declarative routing│   └── ...

- **React Context** - State management for auth└── App.tsx          # Main app component

`````

### Code Quality

- **ESLint** - JavaScript/TypeScript linting## 🔧 Environment Variables

- **Prettier** - Code formatting

- **TypeScript Compiler** - Type checkingCreate a `.env` file in the frontend directory:

## 📁 Project Structure```env

# API Base URL (backend server)

````VITE_API_BASE_URL=http://localhost:8000

front/

├── src/# Development Server Port

│   ├── components/           # Reusable UI componentsVITE_PORT=5173

│   │   ├── DeleteConfirmationModal.tsx```

│   │   ├── FilterDropdown.tsx

│   │   ├── Pagination.tsx### Usage in Code

│   │   ├── ProtectedRoute.tsx

│   │   ├── SearchBar.tsx```typescript

│   │   └── SearchResultsHeader.tsximport { API_BASE_URL, API_ENDPOINTS } from "./config/api";

│   │

│   ├── config/              # Configuration files// Use predefined endpoints

│   │   └── api.ts           # API base URL & endpointsfetch(API_ENDPOINTS.persons);

│   │

│   ├── contexts/            # React contexts// Or build custom URLs

│   │   └── AuthContext.tsx  # Authentication state & logicconst url = `${API_BASE_URL}/api/custom/`;

│   │```

│   ├── pages/               # Page components (routes)

│   │   ├── Dashboard.tsx         # Analytics & charts## 📦 Available Scripts

│   │   ├── Home.tsx              # Landing page

│   │   ├── Login.tsx             # Staff login```bash

│   │   ├── Register.tsx          # Admin-only registration# Development

│   │   ├── PersonList.tsx        # Patient managementnpm run dev          # Start dev server

│   │   ├── AddPerson.tsx         # Add new patient

│   │   ├── EditPerson.tsx        # Edit patient# Production

│   │   ├── EmployeeList.tsx      # Staff managementnpm run build        # Build for production

│   │   ├── FacilityList.tsx      # Facility managementnpm run preview      # Preview production build

│   │   ├── InfectionList.tsx     # Infection tracking

│   │   ├── VaccinationList.tsx   # Vaccination records# Code Quality

│   │   └── ScheduleList.tsx      # Employee schedulesnpm run lint         # Run ESLint

│   │```

│   ├── assets/              # Static assets (images, etc.)

│   ├── App.tsx              # Main app component & routing## 🎨 Features

│   ├── main.tsx             # React entry point

│   └── index.css            # Global styles (Tailwind imports)- **Hybrid Authentication** - Browse without login, authenticate for CRUD

│- **Responsive Design** - Works on desktop, tablet, and mobile

├── public/                  # Static public files- **Real-time Search** - Debounced search with 500ms delay

├── .env                     # Environment variables (gitignored)- **Pagination** - Server-side pagination (20 items per page)

├── .env.example             # Example environment config- **Analytics Dashboard** - Charts and statistics

├── package.json             # Dependencies & scripts- **Dark Mode Ready** - Tailwind CSS classes prepared

├── tsconfig.json            # TypeScript configuration

├── vite.config.ts           # Vite configuration## 🔌 API Integration

└── eslint.config.js         # ESLint configuration

```All API calls use centralized configuration from `src/config/api.ts`:



## 🔧 Environment Variables- Authentication: Login, Logout, Register

- Persons: CRUD operations

Create a `.env` file in the `front/` directory:- Employees: Staff management

- Facilities: Facility management

```env- Infections: Infection tracking

# Backend API Base URL- Vaccinations: Vaccination records

VITE_API_BASE_URL=http://localhost:8001- Schedules: Employee schedules

- Analytics: Dashboard data

# Development Server Port

VITE_PORT=5173## 📱 Pages

````

| Route | Component | Description |

### Usage in Code| --------------- | --------------- | ----------------------- |

| `/` | Home | Landing page with stats |

Import from the centralized config file:| `/dashboard` | Dashboard | Analytics & charts |

| `/persons` | PersonList | Patient management |

```typescript| `/employees` | EmployeeList | Staff management |

import { API_BASE_URL, API_ENDPOINTS } from "./config/api";| `/facilities` | FacilityList | Facility management |

| `/infections` | InfectionList | Infection tracking |

// Use predefined endpoints| `/vaccinations` | VaccinationList | Vaccination records |

const response = await axios.get(API_ENDPOINTS.persons);| `/schedules` | ScheduleList | Employee schedules |

| `/login` | Login | User authentication |

// Or build custom URLs| `/register` | Register | User registration |

const url = `${API_BASE_URL}/api/custom-endpoint/`;

````## 🤝 Contributing



### All Available EndpointsSee the main [CONTRIBUTING.md](../docs/CONTRIBUTING.md) for guidelines.



```typescript## 📝 Notes

API_ENDPOINTS = {

  // Authentication- This project uses **React 19** with the new compiler features

  login: "/api/login/",- **TypeScript** strict mode is enabled

  logout: "/api/logout/",- **ESLint** configuration follows React best practices

  register: "/api/register/",- **Vite** provides fast HMR (Hot Module Replacement)



  // Main entities---

  persons: "/api/persons/",

  employees: "/api/employees/",For more information, see the [main README](../README.md) or [documentation](../docs/).

  facilities: "/api/facilities/",
  infections: "/api/infections/",
  vaccinations: "/api/vaccinations/",
  schedules: "/api/schedules/",

  // Analytics
  analytics: "/api/analytics/"
};
````

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start dev server with HMR
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## 🎨 Key Features Explained

### Hybrid Authentication

Users can **browse all data without logging in**:

- View patient records
- See staff information
- Explore facilities
- Check analytics dashboard

**Login required** for modifications:

- Add new records
- Edit existing data
- Delete information

UI automatically shows "Login to Add/Edit" buttons when authentication is needed.

### Admin-Only Registration

- **Public users**: Cannot register (security for healthcare system)
- **Regular staff**: Can view "Register User" button but redirected if not admin
- **Admin staff** (`is_staff=True`): Full access to registration page
- Registration creates new staff accounts without auto-login

### Search UX Enhancement

**Problem Solved**: Search inputs were losing focus when debounced search triggered.

**Solution**:

- Separate `loading` and `fetching` states
- `loading`: Only on initial page load (shows full loading screen)
- `fetching`: For subsequent searches (no re-render)
- Prevents input blur during typing

Applied to all list pages: Person, Employee, Facility, Infection, Vaccination, Schedule.

## 🔌 API Integration

### Centralized Configuration

All API calls use `src/config/api.ts`:

```typescript
// src/config/api.ts
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/api/login/`,
  persons: `${API_BASE_URL}/api/persons/`,
  // ... all other endpoints
};
```

### Authentication Flow

```typescript
// Login
const response = await axios.post(API_ENDPOINTS.login, credentials);
localStorage.setItem("token", response.data.token);

// Authenticated requests
axios.get(API_ENDPOINTS.persons, {
  headers: { Authorization: `Token ${token}` },
});

// Logout
await axios.post(
  API_ENDPOINTS.logout,
  {},
  {
    headers: { Authorization: `Token ${token}` },
  },
);
localStorage.removeItem("token");
```

## 📱 Pages & Routes

| Route               | Component       | Auth Required    | Description                   |
| ------------------- | --------------- | ---------------- | ----------------------------- |
| `/`                 | Home            | No               | Landing page with quick stats |
| `/dashboard`        | Dashboard       | No               | Analytics & charts            |
| `/persons`          | PersonList      | No (read-only)   | Patient management            |
| `/persons/add`      | AddPerson       | Yes              | Add new patient               |
| `/persons/edit/:id` | EditPerson      | Yes              | Edit patient                  |
| `/employees`        | EmployeeList    | No (read-only)   | Staff management              |
| `/facilities`       | FacilityList    | No (read-only)   | Facility management           |
| `/infections`       | InfectionList   | No (read-only)   | Infection tracking            |
| `/vaccinations`     | VaccinationList | No (read-only)   | Vaccination records           |
| `/schedules`        | ScheduleList    | No (read-only)   | Employee schedules            |
| `/login`            | Login           | No               | Staff login                   |
| `/register`         | Register        | Yes (Admin only) | User registration             |

## 🔐 Authentication Context

The `AuthContext` provides:

```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}
```

Usage:

```typescript
import { useAuth } from "../contexts/AuthContext";

const { isAuthenticated, user, login, logout } = useAuth();

// Check if user is admin
if (user && user.is_staff) {
  // Show admin features
}
```

## 🎨 Styling

### Tailwind CSS

Utility-first approach with custom configuration:

```typescript
// Example component styling
<button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
  Add Patient
</button>
```

### Responsive Design

Mobile-first breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

```typescript
// Example responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

## 🤝 Contributing

See the main [CONTRIBUTING.md](../docs/CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Create feature branch
2. Make changes
3. Test locally with `npm run dev`
4. Run linter: `npm run lint`
5. Commit changes
6. Push and create PR

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
VITE_PORT=5174 npm run dev
```

### CORS Errors

Ensure backend `.env` has:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules .vite
npm install
npm run build
```

### TypeScript Errors

```bash
# Check types
npm run type-check

# Or build (includes type checking)
npm run build
```

## 📝 Notes

- **React 19**: Using new compiler features and automatic batching
- **TypeScript Strict Mode**: Enabled for maximum type safety
- **ESLint**: Configured with React and TypeScript best practices
- **Vite**: Provides instant HMR and optimized builds
- **No `create-react-app`**: Using modern Vite for better performance

---

For more information, see the [main README](../README.md) or [documentation](../docs/).

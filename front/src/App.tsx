import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { useState, lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Every page below is route-only content, so it's lazy-loaded: the initial
// bundle ships the shell (nav, auth, router) and each page's own chunk (plus
// Chart.js for Dashboard) loads only when that route is actually visited.

// Auth pages
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));

// Dashboard pages
const Home = lazy(() => import("./pages/dashboard/Home"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));

// Person pages
const PersonList = lazy(() => import("./pages/person/PersonList"));
const AddPerson = lazy(() => import("./pages/person/AddPerson"));
const EditPerson = lazy(() => import("./pages/person/EditPerson"));
const PersonDetail = lazy(() => import("./pages/person/PersonDetail"));

// Employee pages
const EmployeeList = lazy(() => import("./pages/employee/EmployeeList"));
const AddEmployee = lazy(() => import("./pages/employee/AddEmployee"));
const EditEmployee = lazy(() => import("./pages/employee/EditEmployee"));
const EmployeeDetail = lazy(() => import("./pages/employee/EmployeeDetail"));

// Facility pages
const FacilityList = lazy(() => import("./pages/facility/FacilityList"));
const AddFacility = lazy(() => import("./pages/facility/AddFacility"));
const EditFacility = lazy(() => import("./pages/facility/EditFacility"));
const FacilityDetail = lazy(() => import("./pages/facility/FacilityDetail"));

// Infection pages
const InfectionList = lazy(() => import("./pages/infection/InfectionList"));
const AddInfection = lazy(() => import("./pages/infection/AddInfection"));
const EditInfection = lazy(() => import("./pages/infection/EditInfection"));
const InfectionDetail = lazy(() => import("./pages/infection/InfectionDetail"));

// Vaccination pages
const VaccinationList = lazy(
  () => import("./pages/vaccination/VaccinationList"),
);
const AddVaccination = lazy(() => import("./pages/vaccination/AddVaccination"));
const EditVaccination = lazy(
  () => import("./pages/vaccination/EditVaccination"),
);
const VaccinationDetail = lazy(
  () => import("./pages/vaccination/VaccinationDetail"),
);

// Schedule pages
const ScheduleList = lazy(() => import("./pages/schedule/ScheduleList"));
const AddSchedule = lazy(() => import("./pages/schedule/AddSchedule"));
const EditSchedule = lazy(() => import("./pages/schedule/EditSchedule"));
const ScheduleDetail = lazy(() => import("./pages/schedule/ScheduleDetail"));
import {
  HomeIcon,
  UserIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Suspense fallback shown while a route's lazy chunk loads.
const RouteLoader: React.FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div
      className="h-10 w-10 animate-spin rounded-full border-2 border-paper-line border-t-ink"
      role="status"
      aria-label="Loading"
    ></div>
  </div>
);

const NAV_ITEMS: {
  to: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}[] = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/dashboard", label: "Dashboard", icon: ChartBarIcon },
  { to: "/persons", label: "Patients", icon: UserIcon },
  { to: "/employees", label: "Staff", icon: UserGroupIcon },
  { to: "/facilities", label: "Facilities", icon: BuildingOffice2Icon },
  { to: "/schedules", label: "Schedules", icon: ClockIcon },
  { to: "/infections", label: "Infections", icon: ExclamationTriangleIcon },
  { to: "/vaccinations", label: "Vaccinations", icon: ShieldCheckIcon },
];

const SECTION_TITLES: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/persons": "Patients",
  "/employees": "Staff",
  "/facilities": "Facilities",
  "/schedules": "Schedules",
  "/infections": "Infections",
  "/vaccinations": "Vaccinations",
  "/register": "Register User",
};

function sectionTitleFor(pathname: string): string {
  if (SECTION_TITLES[pathname]) return SECTION_TITLES[pathname];
  const base = "/" + pathname.split("/")[1];
  return SECTION_TITLES[base] ?? "HMS";
}

/**
 * The app shell: one full-width topbar (sidebar toggle, wordmark, section
 * title) above a row of [collapsible sidebar | page content]. Every
 * authenticated route renders inside this - Login is the one page that
 * doesn't (a sign-in screen has no nav to show).
 */
const AppShell: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  // Start collapsed on narrow screens - an open sidebar would otherwise
  // push all page content below the fold on first load.
  const [collapsed, setCollapsed] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches,
  );

  const title = sectionTitleFor(location.pathname);
  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username;
  const roleTag = user?.is_superuser
    ? "ADMIN"
    : user?.is_staff
    ? "STAFF"
    : "USER";
  const roleColor = user?.is_superuser
    ? "var(--color-role-admin)"
    : user?.is_staff
    ? "var(--color-role-security)"
    : "var(--color-role-patient)";
  const today = new Date()
    .toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-paper md:h-screen md:overflow-hidden">
      <header className="flex flex-none items-center justify-between gap-4 border-b-[1.5px] border-ink px-4 py-3.5 sm:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
            aria-expanded={!collapsed}
            className="flex h-8 w-8 flex-none items-center justify-center rounded border-[1.5px] border-ink text-ink transition-colors hover:bg-ink/[0.05]"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              className="h-4 w-4"
              aria-hidden="true"
            >
              <rect x="1" y="2.5" width="14" height="11" rx="1.5" />
              <line x1="6" y1="2.5" x2="6" y2="13.5" />
            </svg>
          </button>
          <Link
            to="/"
            className="flex-none text-base font-bold tracking-tight text-ink"
          >
            HMS
          </Link>
          <span
            className="hidden h-5 w-[1.5px] flex-none bg-paper-line sm:block"
            aria-hidden="true"
          />
          <h1 className="min-w-0 truncate text-lg font-bold tracking-tight text-ink sm:text-xl">
            {title}
          </h1>
        </div>
        <div className="flex flex-none items-center gap-3">
          <span className="hidden font-mono text-[11px] tracking-wide text-ink-soft sm:inline">
            {today}
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row md:overflow-hidden">
        <aside
          className={`app-sidebar flex flex-none flex-col border-r-[1.5px] border-ink bg-panel py-5 ${
            collapsed ? "is-collapsed" : ""
          }`}
        >
          {/* Scrolls internally if the nav list ever grows too tall for the
              viewport - the footer below stays flex-none so it's always
              fully visible at the bottom, never scrolled out of view. */}
          <nav className="flex flex-1 flex-col overflow-y-auto">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active =
                location.pathname === to ||
                (to !== "/" && location.pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-2.5 px-6 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-paper font-bold text-ink"
                      : "font-medium text-ink-soft hover:text-ink"
                  }`}
                >
                  {active && (
                    <span
                      className="absolute inset-y-0 left-0 w-[5px]"
                      style={{
                        background:
                          "repeating-linear-gradient(180deg, var(--color-ink) 0 6px, transparent 6px 9px)",
                      }}
                      aria-hidden="true"
                    />
                  )}
                  <Icon className="h-4 w-4 flex-none" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex-none px-6 pt-4">
            {/* An action (create a new user), not a destination to view - kept
                out of the nav list above and given its own button treatment
                so it doesn't read as one more page among Dashboard/Patients/etc. */}
            {user?.is_staff && (
              <Link
                to="/register"
                className={`mb-3 flex items-center justify-center gap-2 rounded border-[1.5px] border-ink px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === "/register"
                    ? "bg-ink text-paper"
                    : "text-ink hover:bg-ink hover:text-paper"
                }`}
              >
                <UserPlusIcon
                  className="h-4 w-4 flex-none"
                  aria-hidden="true"
                />
                <span>Register User</span>
              </Link>
            )}
            <div className="badge-account flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-ink">
                  {displayName}
                </div>
                <div className="mt-1">
                  <span className="badge-tag" style={{ background: roleColor }}>
                    {roleTag}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                aria-label="Log out"
                className="flex h-8 w-8 flex-none items-center justify-center rounded text-ink-soft transition-colors hover:bg-stamp-red/10 hover:text-stamp-red-ink"
              >
                <ArrowRightOnRectangleIcon
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 md:overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

const AppRoutes = () => (
  <Suspense fallback={<RouteLoader />}>
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Everything else requires authentication. ProtectedRoute as a
          layout route redirects unauthenticated users to /login. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Person (URL identifier is person.uuid) */}
        <Route path="/persons" element={<PersonList />} />
        <Route path="/persons/add" element={<AddPerson />} />
        <Route path="/persons/:uuid" element={<PersonDetail />} />
        <Route path="/persons/:uuid/edit" element={<EditPerson />} />

        {/* Employee (lookup via person.uuid) */}
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/add" element={<AddEmployee />} />
        <Route path="/employees/:uuid" element={<EmployeeDetail />} />
        <Route path="/employees/:uuid/edit" element={<EditEmployee />} />

        {/* Facility (no PII identifier — keeps numeric fid) */}
        <Route path="/facilities" element={<FacilityList />} />
        <Route path="/facilities/add" element={<AddFacility />} />
        <Route path="/facilities/:id" element={<FacilityDetail />} />
        <Route path="/facilities/:id/edit" element={<EditFacility />} />

        {/* Infection (composite PK; URL exposes person.uuid, not SSN) */}
        <Route path="/infections" element={<InfectionList />} />
        <Route path="/infections/add" element={<AddInfection />} />
        <Route
          path="/infections/:person_uuid/:date/:type_id"
          element={<InfectionDetail />}
        />
        <Route
          path="/infections/:person_uuid/:date/:type_id/edit"
          element={<EditInfection />}
        />

        {/* Vaccination (composite PK; URL exposes person.uuid, not SSN) */}
        <Route path="/vaccinations" element={<VaccinationList />} />
        <Route path="/vaccinations/add" element={<AddVaccination />} />
        <Route
          path="/vaccinations/:person_uuid/:type_id/:date"
          element={<VaccinationDetail />}
        />
        <Route
          path="/vaccinations/:person_uuid/:type_id/:date/edit"
          element={<EditVaccination />}
        />

        {/* Schedule (composite PK; URL exposes person.uuid, not ESSN) */}
        <Route path="/schedules" element={<ScheduleList />} />
        <Route path="/schedules/add" element={<AddSchedule />} />
        <Route
          path="/schedules/:person_uuid/:fid/:date/:start_time"
          element={<ScheduleDetail />}
        />
        <Route
          path="/schedules/:person_uuid/:fid/:date/:start_time/edit"
          element={<EditSchedule />}
        />

        <Route path="/register" element={<Register />} />
      </Route>
    </Routes>
  </Suspense>
);

// Login is a chrome-less sign-in screen - no sidebar/topbar makes sense
// pre-auth (every nav item is a protected route). Everything else renders
// inside the shell.
const AppContent = () => {
  const location = useLocation();
  if (location.pathname === "/login") {
    return <AppRoutes />;
  }
  return (
    <AppShell>
      <AppRoutes />
    </AppShell>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

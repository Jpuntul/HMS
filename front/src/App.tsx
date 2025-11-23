import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PersonList from "./pages/PersonList";
import AddPerson from "./pages/AddPerson";
import EditPerson from "./pages/EditPerson";
import EmployeeList from "./pages/EmployeeList";
import FacilityList from "./pages/FacilityList";
import InfectionList from "./pages/InfectionList";
import VaccinationList from "./pages/VaccinationList";
import ScheduleList from "./pages/ScheduleList";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import {
  HomeIcon,
  UserIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Navigation component that uses auth context
const AppNavigation: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <BuildingOffice2Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                HMS
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Healthcare Management
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium px-3 py-2 rounded-lg transition-all"
            >
              <HomeIcon className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 font-medium px-3 py-2 rounded-lg transition-all"
            >
              <ChartBarIcon className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            {/* Dropdown for Records */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium px-3 py-2 rounded-lg transition-all">
                <UserIcon className="h-4 w-4" />
                <span>Records</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link
                  to="/persons"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 first:rounded-t-lg"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Patients</span>
                </Link>
                <Link
                  to="/employees"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
                >
                  <UserGroupIcon className="h-4 w-4" />
                  <span>Staff</span>
                </Link>
                <Link
                  to="/facilities"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                >
                  <BuildingOffice2Icon className="h-4 w-4" />
                  <span>Facilities</span>
                </Link>
                <Link
                  to="/schedules"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 last:rounded-b-lg"
                >
                  <ClockIcon className="h-4 w-4" />
                  <span>Schedules</span>
                </Link>
              </div>
            </div>

            {/* Dropdown for Health */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-green-600 hover:bg-green-50 font-medium px-3 py-2 rounded-lg transition-all">
                <ShieldCheckIcon className="h-4 w-4" />
                <span>Health</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link
                  to="/infections"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 first:rounded-t-lg"
                >
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span>Infections</span>
                </Link>
                <Link
                  to="/vaccinations"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 last:rounded-b-lg"
                >
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>Vaccinations</span>
                </Link>
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <UserCircleIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700 font-medium">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 hover:bg-red-50 font-medium px-3 py-2 rounded-lg transition-all"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="space-y-1">
              <Link
                to="/"
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HomeIcon className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ChartBarIcon className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Records
              </div>
              <Link
                to="/persons"
                className="flex items-center space-x-2 px-3 py-2 pl-6 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserIcon className="h-5 w-5" />
                <span>Patients</span>
              </Link>
              <Link
                to="/employees"
                className="flex items-center space-x-2 px-3 py-2 pl-6 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserGroupIcon className="h-5 w-5" />
                <span>Staff</span>
              </Link>
              <Link
                to="/facilities"
                className="flex items-center space-x-2 px-3 py-2 pl-6 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BuildingOffice2Icon className="h-5 w-5" />
                <span>Facilities</span>
              </Link>
              <Link
                to="/schedules"
                className="flex items-center space-x-2 px-3 py-2 pl-6 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ClockIcon className="h-5 w-5" />
                <span>Schedules</span>
              </Link>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Health
              </div>
              <Link
                to="/infections"
                className="flex items-center space-x-2 px-3 py-2 pl-6 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>Infections</span>
              </Link>
              <Link
                to="/vaccinations"
                className="flex items-center space-x-2 px-3 py-2 pl-6 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Vaccinations</span>
              </Link>
              {user ? (
                <>
                  <div className="border-t border-gray-200 mt-4 pt-4">
                    <div className="px-3 py-2 text-sm text-gray-700">
                      Logged in as{" "}
                      <span className="font-medium">
                        {user?.first_name && user?.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user?.username}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                  <Link
                    to="/login"
                    className="flex items-center justify-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppNavigation />

          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Publicly accessible viewing routes */}
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/persons" element={<PersonList />} />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/facilities" element={<FacilityList />} />
              <Route path="/infections" element={<InfectionList />} />
              <Route path="/vaccinations" element={<VaccinationList />} />
              <Route path="/schedules" element={<ScheduleList />} />

              {/* Protected CRUD routes - require authentication */}
              <Route
                path="/persons/add"
                element={
                  <ProtectedRoute>
                    <AddPerson />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/persons/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditPerson />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

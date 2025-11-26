import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard pages
import Home from "./pages/dashboard/Home";
import Dashboard from "./pages/dashboard/Dashboard";

// Person pages
import PersonList from "./pages/person/PersonList";
import AddPerson from "./pages/person/AddPerson";
import EditPerson from "./pages/person/EditPerson";
import PersonDetail from "./pages/person/PersonDetail";

// Employee pages
import EmployeeList from "./pages/employee/EmployeeList";
import AddEmployee from "./pages/employee/AddEmployee";
import EditEmployee from "./pages/employee/EditEmployee";
import EmployeeDetail from "./pages/employee/EmployeeDetail";

// Facility pages
import FacilityList from "./pages/facility/FacilityList";
import AddFacility from "./pages/facility/AddFacility";
import EditFacility from "./pages/facility/EditFacility";
import FacilityDetail from "./pages/facility/FacilityDetail";

// Infection pages
import InfectionList from "./pages/infection/InfectionList";
import AddInfection from "./pages/infection/AddInfection";
import EditInfection from "./pages/infection/EditInfection";
import InfectionDetail from "./pages/infection/InfectionDetail";

// Vaccination pages
import VaccinationList from "./pages/vaccination/VaccinationList";
import AddVaccination from "./pages/vaccination/AddVaccination";
import EditVaccination from "./pages/vaccination/EditVaccination";
import VaccinationDetail from "./pages/vaccination/VaccinationDetail";

// Schedule pages
import ScheduleList from "./pages/schedule/ScheduleList";
import AddSchedule from "./pages/schedule/AddSchedule";
import EditSchedule from "./pages/schedule/EditSchedule";
import ScheduleDetail from "./pages/schedule/ScheduleDetail";
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
                {user.is_staff && (
                  <Link
                    to="/register"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium px-3 py-2 rounded-lg transition-all"
                  >
                    <UserCircleIcon className="h-4 w-4" />
                    <span>Register User</span>
                  </Link>
                )}
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
              <Link
                to="/login"
                className="bg-blue-600 text-white hover:bg-blue-700 font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
              >
                Staff Login
              </Link>
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
                    {user.is_staff && (
                      <Link
                        to="/register"
                        className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg w-full"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserCircleIcon className="h-5 w-5" />
                        <span>Register User</span>
                      </Link>
                    )}
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
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <Link
                    to="/login"
                    className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Staff Login
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

              {/* Publicly accessible viewing routes */}
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Person routes */}
              <Route path="/persons" element={<PersonList />} />
              <Route path="/persons/:id" element={<PersonDetail />} />
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

              {/* Employee routes */}
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employees/:id" element={<EmployeeDetail />} />
              <Route
                path="/employees/add"
                element={
                  <ProtectedRoute>
                    <AddEmployee />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditEmployee />
                  </ProtectedRoute>
                }
              />

              {/* Facility routes */}
              <Route path="/facilities" element={<FacilityList />} />
              <Route path="/facilities/:id" element={<FacilityDetail />} />
              <Route
                path="/facilities/add"
                element={
                  <ProtectedRoute>
                    <AddFacility />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditFacility />
                  </ProtectedRoute>
                }
              />

              {/* Infection routes */}
              <Route path="/infections" element={<InfectionList />} />
              <Route path="/infections/:id" element={<InfectionDetail />} />
              <Route
                path="/infections/add"
                element={
                  <ProtectedRoute>
                    <AddInfection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/infections/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditInfection />
                  </ProtectedRoute>
                }
              />

              {/* Vaccination routes */}
              <Route path="/vaccinations" element={<VaccinationList />} />
              <Route path="/vaccinations/:id" element={<VaccinationDetail />} />
              <Route
                path="/vaccinations/add"
                element={
                  <ProtectedRoute>
                    <AddVaccination />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vaccinations/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditVaccination />
                  </ProtectedRoute>
                }
              />

              {/* Schedule routes */}
              <Route path="/schedules" element={<ScheduleList />} />
              <Route path="/schedules/:id" element={<ScheduleDetail />} />
              <Route
                path="/schedules/add"
                element={
                  <ProtectedRoute>
                    <AddSchedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/schedules/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditSchedule />
                  </ProtectedRoute>
                }
              />

              {/* Protected admin routes */}
              <Route
                path="/register"
                element={
                  <ProtectedRoute>
                    <Register />
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

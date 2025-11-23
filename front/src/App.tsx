import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <BuildingOffice2Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                HMS
              </h1>
              <p className="text-xs text-gray-500">Healthcare Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-all"
            >
              <HomeIcon className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all"
            >
              <ChartBarIcon className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/persons"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-all"
            >
              <UserIcon className="h-4 w-4" />
              <span>Patients</span>
            </Link>
            <Link
              to="/employees"
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 font-medium px-3 py-2 rounded-lg hover:bg-green-50 transition-all"
            >
              <UserGroupIcon className="h-4 w-4" />
              <span>Staff</span>
            </Link>
            <Link
              to="/facilities"
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 font-medium px-3 py-2 rounded-lg hover:bg-purple-50 transition-all"
            >
              <BuildingOffice2Icon className="h-4 w-4" />
              <span>Facilities</span>
            </Link>
            <Link
              to="/infections"
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-all"
            >
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>Infections</span>
            </Link>
            <Link
              to="/vaccinations"
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 font-medium px-3 py-2 rounded-lg hover:bg-green-50 transition-all"
            >
              <ShieldCheckIcon className="h-4 w-4" />
              <span>Vaccinations</span>
            </Link>
            <Link
              to="/schedules"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-all"
            >
              <ClockIcon className="h-4 w-4" />
              <span>Schedules</span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-4 border-l border-gray-200 pl-6">
              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <UserCircleIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700 font-medium">
                      {user?.first_name && user?.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user?.username}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white hover:bg-blue-700 font-medium px-4 py-2 rounded-lg transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
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

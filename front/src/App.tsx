import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PersonList from "./pages/PersonList";
import AddPerson from "./pages/AddPerson";
import EditPerson from "./pages/EditPerson";
import EmployeeList from "./pages/EmployeeList";
import FacilityList from "./pages/FacilityList";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import {
  HomeIcon,
  UserIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  PlusIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
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
                  to="/persons/add"
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium shadow-md hover:shadow-lg transition-all"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Patient</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/persons" element={<PersonList />} />
            <Route path="/persons/add" element={<AddPerson />} />
            <Route path="/persons/:id/edit" element={<EditPerson />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/facilities" element={<FacilityList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

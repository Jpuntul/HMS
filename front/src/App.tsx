import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PersonList from "./pages/PersonList";
import AddPerson from "./pages/AddPerson";
import EditPerson from "./pages/EditPerson";
import EmployeeList from "./pages/EmployeeList";
import FacilityList from "./pages/FacilityList";
import {
  HomeIcon,
  UserIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  PlusIcon,
} from "@heroicons/react/24/outline";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                HMS - Hospital Management System
              </h1>
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <HomeIcon className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/persons"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Persons</span>
                </Link>
                <Link
                  to="/employees"
                  className="flex items-center space-x-1 text-green-600 hover:text-green-800 font-medium"
                >
                  <UserGroupIcon className="h-4 w-4" />
                  <span>Employees</span>
                </Link>
                <Link
                  to="/facilities"
                  className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 font-medium"
                >
                  <BuildingOffice2Icon className="h-4 w-4" />
                  <span>Facilities</span>
                </Link>
                <Link
                  to="/persons/add"
                  className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Person</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main>
          <Routes>
            <Route
              path="/"
              element={
                <div className="container mx-auto p-6">
                  <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                      <BuildingOffice2Icon className="h-10 w-10 text-blue-600" />
                      <h2 className="text-3xl font-bold text-gray-900">
                        Welcome to HMS - Hospital Management System
                      </h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Comprehensive healthcare management with real patient
                      data, employee records, and facility information.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Link
                        to="/persons"
                        className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:bg-blue-100 transition-colors group"
                      >
                        <UserIcon className="h-12 w-12 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-semibold text-blue-900 mb-2">
                          Person Management
                        </h3>
                        <p className="text-blue-700">
                          Manage patient records and personal information
                        </p>
                      </Link>

                      <Link
                        to="/employees"
                        className="bg-green-50 border border-green-200 rounded-lg p-6 hover:bg-green-100 transition-colors group"
                      >
                        <UserGroupIcon className="h-12 w-12 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-semibold text-green-900 mb-2">
                          Employee Management
                        </h3>
                        <p className="text-green-700">
                          Track healthcare staff and their roles
                        </p>
                      </Link>

                      <Link
                        to="/facilities"
                        className="bg-purple-50 border border-purple-200 rounded-lg p-6 hover:bg-purple-100 transition-colors group"
                      >
                        <BuildingOffice2Icon className="h-12 w-12 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-semibold text-purple-900 mb-2">
                          Facility Management
                        </h3>
                        <p className="text-purple-700">
                          Oversee hospitals, clinics, and healthcare centers
                        </p>
                      </Link>
                    </div>
                  </div>
                </div>
              }
            />
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

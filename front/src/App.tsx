import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PersonList from "./pages/PersonList";

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
              <div className="space-x-4">
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/persons"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Persons
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Welcome to HMS
                  </h2>
                  <p className="text-gray-600">
                    Hospital Management System - Manage patients, staff, and
                    more.
                  </p>
                </div>
              }
            />
            <Route path="/persons" element={<PersonList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

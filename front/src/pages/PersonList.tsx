import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import SearchBar from "../components/SearchBar";
import FilterDropdown from "../components/FilterDropdown";
import {
  UserIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  PlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export interface Person {
  id: number;
  ssn: string;
  medicare: string;
  first_name: string;
  last_name: string;
  dob: string;
  telephone?: string;
  citizenship?: string;
  email?: string;
  occupation?: string;
}

const PersonList: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [citizenshipFilter, setCitizenshipFilter] = useState("");
  const [occupationFilter, setOccupationFilter] = useState("");
  const location = useLocation();

  const fetchPersons = async () => {
    try {
      let url = "http://localhost:8000/api/persons/";
      const params = new URLSearchParams();

      if (searchTerm) {
        params.append("search", searchTerm);
      }
      if (citizenshipFilter) {
        params.append("citizenship", citizenshipFilter);
      }
      if (occupationFilter) {
        params.append("occupation", occupationFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      setPersons(response.data);
      setFilteredPersons(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    }

    fetchPersons();
  }, [location.state, searchTerm, citizenshipFilter, occupationFilter]);

  // Get unique values for filters
  const uniqueCitizenships = [
    ...new Set(persons.filter((p) => p.citizenship).map((p) => p.citizenship)),
  ];
  const uniqueOccupations = [
    ...new Set(persons.filter((p) => p.occupation).map((p) => p.occupation)),
  ];

  const citizenshipOptions = uniqueCitizenships.map((citizenship) => ({
    value: citizenship!,
    label: citizenship!,
    count: persons.filter((p) => p.citizenship === citizenship).length,
  }));

  const occupationOptions = uniqueOccupations.map((occupation) => ({
    value: occupation!,
    label: occupation!,
    count: persons.filter((p) => p.occupation === occupation).length,
  }));

  const handleDeleteClick = (person: Person) => {
    setPersonToDelete(person);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    // Refresh the list after deletion
    fetchPersons();
    setSuccessMessage("Person deleted successfully!");
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleDeleteCancel = () => {
    setPersonToDelete(null);
    setDeleteModalOpen(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Person Management
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Manage patient records and personal information
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  to="/employees"
                  className="flex items-center space-x-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <UserGroupIcon className="h-4 w-4" />
                  <span>View Employees</span>
                </Link>
                <Link
                  to="/facilities"
                  className="flex items-center space-x-2 px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span>View Facilities</span>
                </Link>
                <Link
                  to="/persons/add"
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Person</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {persons.length}
                </div>
                <div className="text-blue-800 font-medium">Total Persons</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {persons.filter((p) => p.email).length}
                </div>
                <div className="text-green-800 font-medium">With Email</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {persons.filter((p) => p.occupation).length}
                </div>
                <div className="text-purple-800 font-medium">
                  With Occupation
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white shadow-sm rounded-lg mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by name, SSN, Medicare, email..."
                label="Search"
                className="w-full"
              />
            </div>
            <FilterDropdown
              label="Citizenship"
              value={citizenshipFilter}
              onChange={setCitizenshipFilter}
              options={citizenshipOptions}
            />
            <FilterDropdown
              label="Occupation"
              value={occupationFilter}
              onChange={setOccupationFilter}
              options={occupationOptions}
            />
          </div>

          {(searchTerm || citizenshipFilter || occupationFilter) && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {persons.length} result{persons.length !== 1 ? "s" : ""} found
                {searchTerm && ` for "${searchTerm}"`}
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCitizenshipFilter("");
                  setOccupationFilter("");
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{successMessage}</p>
          </div>
        )}

        {/* Person Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {persons.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-semibold text-gray-900">
                    {person.first_name} {person.last_name}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <IdentificationIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">SSN:</span>
                    <span>{person.ssn}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <IdentificationIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Medicare:</span>
                    <span>{person.medicare}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">DOB:</span>
                    <span>{person.dob}</span>
                  </div>

                  {person.email && (
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Email:</span>
                      <span className="truncate">{person.email}</span>
                    </div>
                  )}

                  {person.telephone && (
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Phone:</span>
                      <span>{person.telephone}</span>
                    </div>
                  )}

                  {person.occupation && (
                    <div className="flex items-center space-x-2">
                      <BriefcaseIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Occupation:</span>
                      <span>{person.occupation}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <Link
                      to={`/persons/${person.medicare}/edit`}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    >
                      <PencilIcon className="h-3 w-3" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(person)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {persons.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <div className="text-xl font-medium text-gray-900 mb-2">
              No persons found
            </div>
            <div className="text-gray-600">
              There are no persons in the system.
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {personToDelete && (
          <DeleteConfirmationModal
            person={personToDelete}
            isOpen={deleteModalOpen}
            onClose={handleDeleteCancel}
            onDelete={handleDeleteConfirm}
          />
        )}
      </div>
    </div>
  );
};

export default PersonList;

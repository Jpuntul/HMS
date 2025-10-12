import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";

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
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const location = useLocation();

  useEffect(() => {
    // Check for success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    }

    axios
      .get("http://localhost:8000/api/persons/")
      .then((response) => {
        setPersons(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [location.state]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Person List</h1>
        <Link
          to="/persons/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          Add Person
        </Link>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600">{successMessage}</p>
        </div>
      )}

      {persons.length === 0 ? (
        <div className="text-center text-gray-500">No persons found</div>
      ) : (
        <div className="grid gap-4">
          {persons.map((person) => (
            <div
              key={person.id}
              className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {person.first_name} {person.last_name}
                  </h2>
                  <p className="text-gray-600 mt-1">SSN: {person.ssn}</p>
                  <p className="text-gray-600">Medicare: {person.medicare}</p>
                  <p className="text-gray-600">DOB: {person.dob}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {person.email && <p>📧 {person.email}</p>}
                  {person.telephone && <p>📞 {person.telephone}</p>}
                  {person.occupation && <p>💼 {person.occupation}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PersonList;

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../config/api";
import {
  UserIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

interface PersonData {
  ssn: number;
  medicare: string;
  first_name: string;
  last_name: string;
  dob: string;
  telephone: string;
  citizenship: string;
  email: string;
  occupation: string;
}

const PersonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<PersonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerson = async () => {
      if (!id) {
        navigate("/persons");
        return;
      }

      try {
        const response = await axios.get(`${API_ENDPOINTS.persons}${id}/`);
        setPerson(response.data);
      } catch (error) {
        console.error("Error fetching person:", error);
        setError("Failed to load person details");
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (dobString: string) => {
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading person details...</p>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Person not found"}</p>
          <Link to="/persons" className="text-blue-600 hover:text-blue-700">
            Back to Persons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/persons"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Persons
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserIcon className="h-10 w-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {person.first_name} {person.last_name}
                </h1>
                <p className="text-gray-500">
                  {calculateAge(person.dob)} years old
                </p>
              </div>
            </div>
            <Link
              to={`/persons/${id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PencilSquareIcon className="h-5 w-5 mr-2" />
              Edit
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  First Name
                </h3>
                <p className="text-lg text-gray-900">{person.first_name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Last Name
                </h3>
                <p className="text-lg text-gray-900">{person.last_name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Date of Birth
                </h3>
                <p className="text-lg text-gray-900">
                  {formatDate(person.dob)}
                </p>
                <p className="text-sm text-gray-500">
                  Age: {calculateAge(person.dob)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Citizenship
                </h3>
                <p className="text-lg text-gray-900">
                  {person.citizenship || "N/A"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Occupation
                </h3>
                <p className="text-lg text-gray-900">
                  {person.occupation || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Contact & ID Information */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Contact
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="text-gray-900 break-all">
                      {person.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <PhoneIcon className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="text-gray-900">{person.telephone || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Identification Card */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Identification
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <IdentificationIcon className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">SSN</h3>
                    <p className="text-gray-900 font-mono">{person.ssn}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <GlobeAltIcon className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Medicare
                    </h3>
                    <p className="text-gray-900 font-mono">{person.medicare}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;

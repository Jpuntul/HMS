import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/persons/")
      .then((response) => setPersons(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Person List</h2>
      <ul className="space-y-2">
        {persons.map((p) => (
          <li
            key={p.id}
            className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow"
          >
            <span className="font-medium text-gray-900">
              {p.first_name} {p.last_name}
            </span>
            <span className="text-gray-600 ml-2">({p.ssn})</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PersonList;

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
    <div>
      <h2>Person List</h2>
      <ul>
        {persons.map((p) => (
          <li key={p.id}>
            {p.first_name} {p.last_name} ({p.ssn})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PersonList;
